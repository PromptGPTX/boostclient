import fs from 'fs';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { shell } from 'electron';
import pidusage from 'pidusage';
import { ConfigStore } from './ConfigStore';
import { PlayitManager } from './PlayitManager';
import { CloudflareManager } from './CloudflareManager';
import { PropertiesManager } from './PropertiesManager';
import { VersionFetcher } from './VersionFetcher';
import {
  ServerInstance,
  ServerMetrics,
  InstalledItem,
  ServerPlatform,
  ServerPort,
  CloudflareTunnelConfig,
} from '../../src/types';

interface RunningServer {
  process: ChildProcess;
  instance: ServerInstance;
  metricsTimer: NodeJS.Timeout;
  onlinePlayers: Set<string>;
  maxPlayers: number;
}

export class ServerManager {
  private configStore: ConfigStore;
  private playitManager: PlayitManager;
  private cloudflareManager: CloudflareManager;
  private runningServers: Map<string, RunningServer> = new Map();
  private onLogCallback?: (serverId: string, line: string) => void;
  private onStatusCallback?: (serverId: string, status: ServerInstance['status'], playitTunnel?: any) => void;
  private onMetricsCallback?: (serverId: string, metrics: ServerMetrics) => void;
  private onCloudflareCallback?: (serverId: string, status: CloudflareTunnelConfig['status'], domain?: string, log?: string) => void;

  constructor(
    configStore: ConfigStore,
    playitManager: PlayitManager,
    cloudflareManager: CloudflareManager
  ) {
    this.configStore = configStore;
    this.playitManager = playitManager;
    this.cloudflareManager = cloudflareManager;

    // Listen to tunnel updates from PlayitManager
    this.playitManager.setStatusCallback((serverId, tunnelData) => {
      const server = this.configStore.getServer(serverId);
      if (server) {
        server.playitTunnel = {
          status: tunnelData.status,
          publicAddress: tunnelData.publicAddress,
          claimUrl: tunnelData.claimUrl,
        };
        this.configStore.saveServer(server);
        this.onStatusCallback?.(serverId, server.status, server.playitTunnel);
      }
    });

    // Listen to tunnel updates from CloudflareManager
    this.cloudflareManager.setStatusCallback((serverId, status, domain, log) => {
      const server = this.configStore.getServer(serverId);
      if (server) {
        server.cloudflareTunnel = {
          enabled: status === 'starting' || status === 'connected',
          token: server.cloudflareTunnel?.token,
          domain: domain || server.cloudflareTunnel?.domain,
          status,
          publicAddress: domain,
        };
        this.configStore.saveServer(server);
      }
      this.onCloudflareCallback?.(serverId, status, domain, log);
    });
  }

  public setCallbacks(callbacks: {
    onLog: (serverId: string, line: string) => void;
    onStatus: (serverId: string, status: ServerInstance['status'], playitTunnel?: any) => void;
    onMetrics: (serverId: string, metrics: ServerMetrics) => void;
    onCloudflareStatus?: (serverId: string, status: CloudflareTunnelConfig['status'], domain?: string, log?: string) => void;
  }): void {
    this.onLogCallback = callbacks.onLog;
    this.onStatusCallback = callbacks.onStatus;
    this.onMetricsCallback = callbacks.onMetrics;
    this.onCloudflareCallback = callbacks.onCloudflareStatus;
  }

  /**
   * Creates a new server instance
   */
  public async createServer(data: {
    name: string;
    platform: ServerPlatform;
    version: string;
    port: number;
    ram: number;
  }): Promise<ServerInstance> {
    const id = `server-${Date.now()}`;
    const serverDir = path.join(this.configStore.getServersDir(), id);

    if (!fs.existsSync(serverDir)) {
      fs.mkdirSync(serverDir, { recursive: true });
    }

    // Auto-create eula.txt
    fs.writeFileSync(path.join(serverDir, 'eula.txt'), 'eula=true\n', 'utf-8');

    // Create plugins and mods folder
    fs.mkdirSync(path.join(serverDir, 'plugins'), { recursive: true });
    fs.mkdirSync(path.join(serverDir, 'mods'), { recursive: true });

    // Initial server.properties
    PropertiesManager.writeProperties(serverDir, {
      motd: `§b${data.name} §7[BoostClient]`,
      'server-port': data.port || 25565,
      'online-mode': false, // Cracked & premium friendly
      'max-players': 20,
    });

    const defaultPorts: ServerPort[] = [
      {
        id: `port-${Date.now()}-1`,
        name: 'Minecraft Primary',
        port: data.port || 25565,
        protocol: 'tcp',
        enabled: true,
        description: 'Primary Java Game Port',
      },
    ];

    const instance: ServerInstance = {
      id,
      name: data.name,
      platform: data.platform,
      version: data.version,
      port: data.port || 25565,
      path: serverDir,
      minRam: Math.max(1, Math.floor(data.ram / 2)),
      maxRam: data.ram || 4,
      autoStartPlayit: true,
      status: 'offline',
      playitTunnel: {
        status: 'idle',
      },
      cloudflareTunnel: {
        enabled: false,
        status: 'idle',
        logs: [],
      },
      ports: defaultPorts,
    };

    this.configStore.saveServer(instance);

    // Download jar in background if needed
    VersionFetcher.downloadServerJar(data.platform, data.version, serverDir, (text) => {
      this.onLogCallback?.(id, `[BoostClient] ${text}`);
    }).catch((err) => {
      console.error(`Failed to pre-download server jar for ${id}:`, err);
    });

    return instance;
  }

  /**
   * Deletes a server
   */
  public async deleteServer(id: string): Promise<boolean> {
    if (this.runningServers.has(id)) {
      await this.stopServer(id);
    }
    const server = this.configStore.getServer(id);
    if (server && fs.existsSync(server.path)) {
      try {
        fs.rmSync(server.path, { recursive: true, force: true });
      } catch (err) {
        console.error(`Failed to delete server directory:`, err);
      }
    }
    return this.configStore.deleteServer(id);
  }

  /**
   * Starts a Minecraft server instance with 10x performance Aikar's flags
   */
  public async startServer(id: string): Promise<void> {
    const server = this.configStore.getServer(id);
    if (!server) throw new Error(`Server ${id} not found`);

    if (this.runningServers.has(id)) {
      console.log(`Server ${id} is already running`);
      return;
    }

    const serverJar = path.join(server.path, 'server.jar');
    if (!fs.existsSync(serverJar)) {
      this.onLogCallback?.(id, '[BoostClient] server.jar not found! Downloading...');
      await VersionFetcher.downloadServerJar(server.platform, server.version, server.path, (text) => {
        this.onLogCallback?.(id, `[BoostClient] ${text}`);
      });
    }

    server.status = 'starting';
    this.configStore.saveServer(server);
    this.onStatusCallback?.(id, 'starting', server.playitTunnel);

    // High performance Aikar's G1GC Flags for 10x FPS & tick stability
    const jvmArgs = [
      `-Xms${server.minRam}G`,
      `-Xmx${server.maxRam}G`,
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
      '-Dusing.aikars.flags=https://mcflags.emc.gs',
      '-Daikars.new.flags=true',
      '-jar',
      'server.jar',
      'nogui',
    ];

    const javaCmd = server.javaPath || 'java';
    this.onLogCallback?.(
      id,
      `[BoostClient] Launching ${server.platform} ${server.version} with 10x Performance Engine...`
    );
    this.onLogCallback?.(id, `[BoostClient] Command: ${javaCmd} ${jvmArgs.join(' ')}`);

    const child = spawn(javaCmd, jvmArgs, {
      cwd: server.path,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });

    const onlinePlayers = new Set<string>();
    const props = PropertiesManager.readProperties(server.path);
    const maxPlayers = props['max-players'] || 20;

    // Metrics poller (every 2 seconds)
    const metricsTimer = setInterval(async () => {
      if (!child.pid) return;
      try {
        const stats = await pidusage(child.pid);
        this.onMetricsCallback?.(id, {
          cpu: Math.round(stats.cpu),
          memoryMb: Math.round(stats.memory / (1024 * 1024)),
          maxMemoryMb: server.maxRam * 1024,
          uptimeSeconds: Math.round(stats.elapsed / 1000),
          onlinePlayers: Array.from(onlinePlayers),
          maxPlayers,
        });
      } catch {
        // Child process may have terminated
      }
    }, 2000);

    const runningData: RunningServer = {
      process: child,
      instance: server,
      metricsTimer,
      onlinePlayers,
      maxPlayers,
    };
    this.runningServers.set(id, runningData);

    // Auto-start playit.gg tunnel if enabled
    if (server.autoStartPlayit) {
      this.playitManager.startTunnel(id, server.port, server.path);
    }

    // Auto-start Cloudflare tunnel if configured
    if (server.cloudflareTunnel?.enabled && server.cloudflareTunnel?.token) {
      this.cloudflareManager.startTunnel(id, server.cloudflareTunnel.token, server.cloudflareTunnel.domain);
    }

    // Handle stdout
    child.stdout.on('data', (data: Buffer) => {
      const text = data.toString();
      const lines = text.split(/\r?\n/).filter(Boolean);

      for (const line of lines) {
        this.onLogCallback?.(id, line);

        // Detect "Done (X.XXs)!" to mark server online
        if (/Done \([0-9.]+s\)!/i.test(line) || /server started/i.test(line)) {
          server.status = 'online';
          this.configStore.saveServer(server);
          this.onStatusCallback?.(id, 'online', server.playitTunnel);
          this.onLogCallback?.(
            id,
            `§a[BoostClient] Server is now ONLINE! Join with localhost:${server.port} or the Playit/Cloudflare public IP.`
          );
        }

        // Detect player joins
        const joinMatch = line.match(/(?:\[Server thread\/INFO\]:|\[.*\]:)\s*([a-zA-Z0-9_]+)\[.*\] logged in/i) ||
          line.match(/([a-zA-Z0-9_]+) joined the game/i);
        if (joinMatch) {
          onlinePlayers.add(joinMatch[1]);
        }

        // Detect player leaves
        const leaveMatch = line.match(/([a-zA-Z0-9_]+) lost connection/i) ||
          line.match(/([a-zA-Z0-9_]+) left the game/i);
        if (leaveMatch) {
          onlinePlayers.delete(leaveMatch[1]);
        }
      }
    });

    child.stderr.on('data', (data: Buffer) => {
      const text = data.toString();
      for (const line of text.split(/\r?\n/).filter(Boolean)) {
        this.onLogCallback?.(id, line);
      }
    });

    child.on('close', (code) => {
      clearInterval(metricsTimer);
      this.runningServers.delete(id);
      server.status = 'offline';
      this.configStore.saveServer(server);
      this.onStatusCallback?.(id, 'offline', server.playitTunnel);
      this.onLogCallback?.(id, `[BoostClient] Server process exited with code ${code}`);

      // Stop tunnels when server exits
      this.playitManager.stopTunnel(id);
      this.cloudflareManager.stopTunnel(id);
    });

    child.on('error', (err) => {
      clearInterval(metricsTimer);
      this.runningServers.delete(id);
      server.status = 'offline';
      this.configStore.saveServer(server);
      this.onStatusCallback?.(id, 'offline', server.playitTunnel);
      this.onLogCallback?.(id, `[BoostClient] Server process error: ${err.message}`);
      this.playitManager.stopTunnel(id);
      this.cloudflareManager.stopTunnel(id);
    });
  }

  /**
   * Gracefully stops a server by writing 'stop' to stdin
   */
  public async stopServer(id: string): Promise<void> {
    const running = this.runningServers.get(id);
    if (!running) return;

    const server = this.configStore.getServer(id);
    if (server) {
      server.status = 'stopping';
      this.configStore.saveServer(server);
      this.onStatusCallback?.(id, 'stopping', server.playitTunnel);
    }

    this.onLogCallback?.(id, '[BoostClient] Sending stop command to server...');
    try {
      running.process.stdin?.write('stop\n');
    } catch {
      running.process.kill();
    }

    // Force kill if not closed in 25 seconds
    setTimeout(() => {
      if (this.runningServers.has(id)) {
        this.onLogCallback?.(id, '[BoostClient] Server took too long to stop; force terminating...');
        running.process.kill('SIGKILL');
      }
    }, 25000);
  }

  /**
   * Force kills a server
   */
  public async killServer(id: string): Promise<void> {
    const running = this.runningServers.get(id);
    if (running) {
      running.process.kill('SIGKILL');
      this.runningServers.delete(id);
    }
    this.playitManager.stopTunnel(id);
    this.cloudflareManager.stopTunnel(id);
    const server = this.configStore.getServer(id);
    if (server) {
      server.status = 'offline';
      this.configStore.saveServer(server);
      this.onStatusCallback?.(id, 'offline', server.playitTunnel);
    }
  }

  /**
   * Restarts a server
   */
  public async restartServer(id: string): Promise<void> {
    await this.stopServer(id);
    setTimeout(() => {
      this.startServer(id);
    }, 2000);
  }

  /**
   * Sends a command to the server console via stdin
   */
  public async sendCommand(id: string, command: string): Promise<void> {
    const running = this.runningServers.get(id);
    if (!running) throw new Error('Server is not running');

    const cleanCmd = command.startsWith('/') ? command.slice(1) : command;
    this.onLogCallback?.(id, `> /${cleanCmd}`);
    running.process.stdin?.write(cleanCmd + '\n');
  }

  /**
   * Opens the server folder in Windows File Explorer
   */
  public async openFolder(id: string, subfolder?: string): Promise<void> {
    const server = this.configStore.getServer(id);
    if (!server) throw new Error('Server not found');

    const target = subfolder ? path.join(server.path, subfolder) : server.path;
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
    }
    await shell.openPath(target);
  }

  /**
   * Retrieves installed plugins or mods in the server
   */
  public async getInstalledPluginsMods(id: string): Promise<InstalledItem[]> {
    const server = this.configStore.getServer(id);
    if (!server) return [];

    const isPluginPlatform = ['paper', 'purpur', 'velocity', 'bungeecord'].includes(server.platform);
    const folderName = isPluginPlatform ? 'plugins' : 'mods';
    const targetDir = path.join(server.path, folderName);

    if (!fs.existsSync(targetDir)) return [];

    const files = fs.readdirSync(targetDir);
    const items: InstalledItem[] = [];

    for (const file of files) {
      if (file.endsWith('.jar') || file.endsWith('.jar.disabled')) {
        const fullPath = path.join(targetDir, file);
        const stats = fs.statSync(fullPath);
        const isEnabled = !file.endsWith('.disabled');
        const cleanName = file.replace('.disabled', '').replace('.jar', '');

        items.push({
          filename: file,
          filepath: fullPath,
          name: cleanName,
          enabled: isEnabled,
          size: stats.size,
          modified: stats.mtimeMs,
        });
      }
    }

    return items;
  }

  /**
   * Toggles a plugin/mod between enabled and disabled by renaming .jar <-> .jar.disabled
   */
  public async togglePluginMod(id: string, filename: string, enable: boolean): Promise<boolean> {
    const server = this.configStore.getServer(id);
    if (!server) return false;

    const folderName = ['paper', 'purpur', 'velocity', 'bungeecord'].includes(server.platform)
      ? 'plugins'
      : 'mods';
    const targetDir = path.join(server.path, folderName);
    const currentPath = path.join(targetDir, filename);

    if (!fs.existsSync(currentPath)) return false;

    let newPath: string;
    if (enable && filename.endsWith('.disabled')) {
      newPath = path.join(targetDir, filename.replace('.disabled', ''));
    } else if (!enable && !filename.endsWith('.disabled')) {
      newPath = path.join(targetDir, filename + '.disabled');
    } else {
      return true;
    }

    fs.renameSync(currentPath, newPath);
    return true;
  }

  /**
   * Deletes a plugin or mod
   */
  public async deletePluginMod(id: string, filename: string): Promise<boolean> {
    const server = this.configStore.getServer(id);
    if (!server) return false;

    const folderName = ['paper', 'purpur', 'velocity', 'bungeecord'].includes(server.platform)
      ? 'plugins'
      : 'mods';
    const fullPath = path.join(server.path, folderName, filename);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  }

  /**
   * Switches server software / version
   */
  public async switchVersion(
    id: string,
    platform: ServerPlatform,
    version: string,
    build?: string
  ): Promise<boolean> {
    const server = this.configStore.getServer(id);
    if (!server) return false;

    if (this.runningServers.has(id)) {
      await this.stopServer(id);
    }

    server.platform = platform;
    server.version = version;
    server.build = build;
    this.configStore.saveServer(server);

    await VersionFetcher.downloadServerJar(platform, version, server.path, (text) => {
      this.onLogCallback?.(id, `[BoostClient] ${text}`);
    });

    return true;
  }

  /**
   * Updates server network ports
   */
  public async updatePorts(id: string, ports: ServerPort[]): Promise<ServerPort[]> {
    const server = this.configStore.getServer(id);
    if (!server) throw new Error('Server not found');

    server.ports = ports;
    this.configStore.saveServer(server);
    return ports;
  }

  /**
   * Toggles Cloudflare Tunnel for a server
   */
  public async toggleCloudflareTunnel(
    id: string,
    enable: boolean,
    token?: string,
    domain?: string
  ): Promise<void> {
    const server = this.configStore.getServer(id);
    if (!server) throw new Error('Server not found');

    if (!server.cloudflareTunnel) {
      server.cloudflareTunnel = { enabled: false, status: 'idle', logs: [] };
    }

    if (token) server.cloudflareTunnel.token = token;
    if (domain) server.cloudflareTunnel.domain = domain;

    if (enable) {
      const activeToken = token || server.cloudflareTunnel.token;
      if (!activeToken) {
        throw new Error('Cloudflare Tunnel token is required to start tunnel.');
      }
      server.cloudflareTunnel.enabled = true;
      this.configStore.saveServer(server);
      await this.cloudflareManager.startTunnel(id, activeToken, domain || server.cloudflareTunnel.domain);
    } else {
      server.cloudflareTunnel.enabled = false;
      this.configStore.saveServer(server);
      this.cloudflareManager.stopTunnel(id);
    }
  }
}
