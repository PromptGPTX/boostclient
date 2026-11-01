import fs from 'fs';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { ConfigStore } from './ConfigStore';
import { GameProfile, Account, ModLoader } from '../../src/types';

export class LauncherManager {
  private configStore: ConfigStore;
  private runningGames: Map<string, ChildProcess> = new Map();
  private onLogCallback?: (profileId: string, line: string) => void;
  private onStatusCallback?: (
    profileId: string,
    status: 'idle' | 'downloading' | 'launching' | 'running' | 'error',
    progress?: number,
    text?: string
  ) => void;

  constructor(configStore: ConfigStore) {
    this.configStore = configStore;
  }

  public setCallbacks(callbacks: {
    onLog: (profileId: string, line: string) => void;
    onStatus: (
      profileId: string,
      status: 'idle' | 'downloading' | 'launching' | 'running' | 'error',
      progress?: number,
      text?: string
    ) => void;
  }): void {
    this.onLogCallback = callbacks.onLog;
    this.onStatusCallback = callbacks.onStatus;
  }

  /**
   * Fetches the official Mojang version manifest
   */
  public async getMojangVersions(): Promise<{ id: string; type: 'release' | 'snapshot'; url: string }[]> {
    try {
      const res = await fetch('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json');
      if (res.ok) {
        const data = (await res.json()) as any;
        return data.versions.map((v: any) => ({
          id: v.id,
          type: v.type,
          url: v.url,
        }));
      }
    } catch (err) {
      console.error('[LauncherManager] Failed to fetch Mojang manifest:', err);
    }

    return [
      { id: '1.21.1', type: 'release', url: '' },
      { id: '1.20.4', type: 'release', url: '' },
      { id: '1.20.2', type: 'release', url: '' },
      { id: '1.20.1', type: 'release', url: '' },
      { id: '1.19.4', type: 'release', url: '' },
      { id: '1.18.2', type: 'release', url: '' },
      { id: '1.16.5', type: 'release', url: '' },
      { id: '1.12.2', type: 'release', url: '' },
      { id: '1.8.9', type: 'release', url: '' },
    ];
  }

  /**
   * Fetches available loader versions for a given game version
   */
  public async getLoaderVersions(loader: ModLoader, gameVersion: string): Promise<string[]> {
    try {
      if (loader === 'fabric') {
        const res = await fetch(`https://meta.fabricmc.net/v2/versions/loader/${gameVersion}`);
        if (res.ok) {
          const data = (await res.json()) as any[];
          return data.map((item) => item.loader.version);
        }
      }
    } catch (err) {
      console.error(`[LauncherManager] Failed to fetch ${loader} versions:`, err);
    }
    return ['latest', 'recommended'];
  }

  /**
   * Detects installed Java runtimes on Windows
   */
  public async detectJava(): Promise<{ path: string; version: string; is64Bit: boolean }[]> {
    const javaInstalls: { path: string; version: string; is64Bit: boolean }[] = [];
    const searchDirs = [
      'C:\\Program Files\\Java',
      'C:\\Program Files\\Eclipse Adoptium',
      'C:\\Program Files\\BellSoft',
      'C:\\Program Files\\Zulu',
      'C:\\Program Files (x86)\\Java',
    ];

    for (const baseDir of searchDirs) {
      if (fs.existsSync(baseDir)) {
        try {
          const entries = fs.readdirSync(baseDir);
          for (const entry of entries) {
            const javaExe = path.join(baseDir, entry, 'bin', 'java.exe');
            if (fs.existsSync(javaExe)) {
              javaInstalls.push({
                path: javaExe,
                version: entry,
                is64Bit: !baseDir.includes('(x86)'),
              });
            }
          }
        } catch {
          // ignore permission errors
        }
      }
    }

    if (javaInstalls.length === 0) {
      javaInstalls.push({
        path: 'java',
        version: 'System Default (PATH)',
        is64Bit: true,
      });
    }

    return javaInstalls;
  }

  /**
   * Launches the Minecraft game client
   */
  public async launchGame(
    profileId: string
  ): Promise<{ success: boolean; pid?: number; message?: string }> {
    const profile = this.configStore.getProfiles().find((p) => p.id === profileId);
    if (!profile) throw new Error(`Profile ${profileId} not found`);

    const account = this.configStore.getActiveAccount();
    if (!account) {
      throw new Error('No player account selected. Please create an offline or Microsoft account first.');
    }

    if (this.runningGames.has(profileId)) {
      return { success: false, message: 'This game profile is already running!' };
    }

    this.onStatusCallback?.(profileId, 'downloading', 10, 'Preparing game environment...');
    this.onLogCallback?.(profileId, `[BoostClient] Initializing profile: ${profile.name} (Minecraft ${profile.gameVersion})`);

    const profilesDir = this.configStore.getProfilesDir();
    const profileDir = path.join(profilesDir, profileId);
    const commonDataDir = this.configStore.getDataDir();
    const assetsDir = path.join(commonDataDir, 'assets');
    const librariesDir = path.join(commonDataDir, 'libraries');
    const versionsDir = path.join(commonDataDir, 'versions', profile.gameVersion);

    fs.mkdirSync(profileDir, { recursive: true });
    fs.mkdirSync(path.join(profileDir, 'mods'), { recursive: true });
    fs.mkdirSync(path.join(profileDir, 'resourcepacks'), { recursive: true });
    fs.mkdirSync(path.join(profileDir, 'shaderpacks'), { recursive: true });
    fs.mkdirSync(assetsDir, { recursive: true });
    fs.mkdirSync(librariesDir, { recursive: true });
    fs.mkdirSync(versionsDir, { recursive: true });

    // 1. Fetch Version Manifest
    this.onStatusCallback?.(profileId, 'downloading', 30, 'Resolving client version manifest...');
    const clientJar = path.join(versionsDir, `${profile.gameVersion}.jar`);
    const versionJsonPath = path.join(versionsDir, `${profile.gameVersion}.json`);

    let mainClass = 'net.minecraft.client.main.Main';
    let assetIndexId = profile.gameVersion;

    try {
      if (!fs.existsSync(clientJar) || !fs.existsSync(versionJsonPath)) {
        const manifestRes = await fetch('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json');
        const manifest = (await manifestRes.json()) as any;
        const verMeta = manifest.versions.find((v: any) => v.id === profile.gameVersion);

        if (verMeta && verMeta.url) {
          const verRes = await fetch(verMeta.url);
          const verData = (await verRes.json()) as any;
          fs.writeFileSync(versionJsonPath, JSON.stringify(verData, null, 2), 'utf-8');

          if (verData.mainClass) mainClass = verData.mainClass;
          if (verData.assetIndex?.id) assetIndexId = verData.assetIndex.id;

          // Download client.jar
          if (verData.downloads?.client?.url && !fs.existsSync(clientJar)) {
            this.onLogCallback?.(profileId, `[BoostClient] Downloading client.jar for ${profile.gameVersion}...`);
            const jarRes = await fetch(verData.downloads.client.url);
            const jarBuffer = Buffer.from(await jarRes.arrayBuffer());
            fs.writeFileSync(clientJar, jarBuffer);
          }
        }
      } else {
        const cachedVer = JSON.parse(fs.readFileSync(versionJsonPath, 'utf-8'));
        if (cachedVer.mainClass) mainClass = cachedVer.mainClass;
        if (cachedVer.assetIndex?.id) assetIndexId = cachedVer.assetIndex.id;
      }
    } catch (dlErr) {
      console.error('Error fetching version data:', dlErr);
    }

    // Loader adjustments
    if (profile.loaderType === 'fabric') {
      mainClass = 'net.fabricmc.loader.impl.launch.knot.KnotClient';
    }

    this.onStatusCallback?.(profileId, 'launching', 80, 'Configuring 10x Performance Engine...');

    // 10x Performance Engine Flags
    const memoryArgs = [
      `-Xms${profile.minMemory || 2048}M`,
      `-Xmx${profile.maxMemory || 4096}M`,
    ];

    let performanceJvmFlags: string[] = [];
    if (profile.performancePreset === 'ultra-10x') {
      // Modern high-throughput low-latency GC flags
      performanceJvmFlags = [
        '-XX:+UseG1GC',
        '-XX:+ParallelRefProcEnabled',
        '-XX:MaxGCPauseMillis=200',
        '-XX:+UnlockExperimentalVMOptions',
        '-XX:+DisableExplicitGC',
        '-XX:+AlwaysPreTouch',
        '-XX:G1NewSizePercent=30',
        '-XX:G1MaxNewSizePercent=40',
        '-XX:G1HeapRegionSize=8M',
        '-XX:G1ReservePercent=20',
        '-XX:G1HeapWastePercent=5',
        '-XX:G1MixedGCCountTarget=4',
        '-XX:InitiatingHeapOccupancyPercent=15',
        '-XX:G1MixedGCLiveThresholdPercent=90',
        '-XX:G1RSetUpdatingPauseTimePercent=5',
        '-XX:SurvivorRatio=32',
        '-XX:+PerfDisableSharedMem',
        '-XX:MaxTenuringThreshold=1',
      ];
    } else if (profile.performancePreset === 'high') {
      performanceJvmFlags = ['-XX:+UseG1GC', '-XX:+UnlockExperimentalVMOptions'];
    }

    const jvmCustomArgs = profile.jvmArgs || [];

    // Construct Game Arguments
    const gameArgs = [
      '--username',
      account.username,
      '--version',
      profile.gameVersion,
      '--gameDir',
      profileDir,
      '--assetsDir',
      assetsDir,
      '--assetIndex',
      assetIndexId,
      '--uuid',
      account.uuid.replace(/-/g, ''),
      '--accessToken',
      account.accessToken || '00000000000000000000000000000000',
      '--userType',
      account.type === 'microsoft' ? 'msa' : 'mojang',
      '--versionType',
      'BoostClient',
    ];

    if (profile.resolution) {
      gameArgs.push('--width', String(profile.resolution.width), '--height', String(profile.resolution.height));
    }

    const javaCmd = profile.javaPath || 'java';

    // Assemble classpath
    const classpathEntries = [clientJar];
    const classpath = classpathEntries.join(';');

    const fullArgs = [
      ...memoryArgs,
      ...performanceJvmFlags,
      ...jvmCustomArgs,
      `-Djava.library.path=${path.join(versionsDir, 'natives')}`,
      '-cp',
      classpath,
      mainClass,
      ...gameArgs,
    ];

    this.onLogCallback?.(profileId, `[BoostClient] Spawning process with 10x Performance Engine...`);
    this.onLogCallback?.(profileId, `[BoostClient] Player: ${account.username} (${account.type.toUpperCase()})`);

    const child = spawn(javaCmd, fullArgs, {
      cwd: profileDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: false,
    });

    this.runningGames.set(profileId, child);
    this.onStatusCallback?.(profileId, 'running', 100, 'Game running');

    child.stdout.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      for (const line of text.split(/\r?\n/).filter(Boolean)) {
        this.onLogCallback?.(profileId, line);
      }
    });

    child.stderr.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      for (const line of text.split(/\r?\n/).filter(Boolean)) {
        this.onLogCallback?.(profileId, line);
      }
    });

    child.on('close', (code) => {
      this.runningGames.delete(profileId);
      this.onStatusCallback?.(profileId, 'idle', 0, 'Game closed');
      this.onLogCallback?.(profileId, `[BoostClient] Game process terminated with code ${code}`);
    });

    child.on('error', (err) => {
      this.runningGames.delete(profileId);
      this.onStatusCallback?.(profileId, 'error', 0, err.message);
      this.onLogCallback?.(profileId, `[BoostClient] Failed to start game: ${err.message}`);
    });

    return { success: true, pid: child.pid };
  }

  /**
   * Kills a running game
   */
  public killGame(profileId: string): boolean {
    const child = this.runningGames.get(profileId);
    if (child) {
      child.kill('SIGKILL');
      this.runningGames.delete(profileId);
      this.onStatusCallback?.(profileId, 'idle', 0, 'Game stopped');
      return true;
    }
    return false;
  }
}
