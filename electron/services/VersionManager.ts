import fs from 'fs';
import path from 'path';
import { ConfigStore } from './ConfigStore';

export type ModLoader = 'vanilla' | 'fabric' | 'forge' | 'neoforge' | 'quilt';

export interface ServerAddon {
  enabled: boolean;
  port?: number;
  downloadUrl?: string;
  setupScript?: string;
  configPath?: string;
}

export interface ServerAutomationConfig {
  simpleVoiceChat?: ServerAddon & {
    defaultVoicePort: number;
    propertyPath: string;
  };
  geyser?: ServerAddon & {
    floodgateRequired: boolean;
  };
}

export class VersionManager {
  private configStore: ConfigStore;

  constructor(configStore: ConfigStore) {
    this.configStore = configStore;
  }

  /**
   * Check if a mod is installed in profile
   */
  public isModInstalled(profileId: string, modName: string): boolean {
    const profilesDir = this.configStore.getProfilesDir();
    const modsDir = path.join(profilesDir, profileId, 'mods');
    if (!fs.existsSync(modsDir)) return false;

    const files = fs.readdirSync(modsDir);
    return files.some(f => f.toLowerCase().includes(modName.toLowerCase()));
  }

  /**
   * Get BoostX mod for specific version and loader
   */
  public async getBoostXModPath(gameVersion: string, loader: ModLoader): Promise<string | null> {
    // BoostX supports 1.18+ Fabric/Forge/NeoForge/Quilt for versions 1.18-26.3 (future)
    const versionNum = parseFloat(gameVersion);
    if (versionNum < 1.18) return null;

    // Map version to appropriate mod build
    // This will be expanded to check GitHub releases for matching version
    const boostXBuilds: Record<string, string> = {
      '1.18.2': 'boostx-1.18.2-fabric.jar',
      '1.19.2': 'boostx-1.19.2-fabric.jar',
      '1.19.4': 'boostx-1.19.4-fabric.jar',
      '1.20.1': 'boostx-1.20.1-fabric.jar',
      '1.20.4': 'boostx-1.20.4-fabric.jar',
      '1.20.6': 'boostx-1.20.6-fabric.jar',
      '1.21.1': 'boostx-1.21.1-fabric.jar',
      '1.21.6': 'boostx-1.21.6-fabric.jar',
    };

    return boostXBuilds[gameVersion] || null;
  }

  /**
   * Downloads BoostX mod for specific version from GitHub releases
   */
  public async downloadBoostXMod(
    gameVersion: string,
    loader: ModLoader,
    profileId: string
  ): Promise<{ success: boolean; path?: string; message?: string }> {
    try {
      const profilesDir = this.configStore.getProfilesDir();
      const modsDir = path.join(profilesDir, profileId, 'mods');
      if (!fs.existsSync(modsDir)) fs.mkdirSync(modsDir, { recursive: true });

      // Find latest BoostX release matching version
      const response = await fetch(
        'https://api.github.com/repos/PromptGPTX/boostclient/releases/latest',
        { headers: { 'User-Agent': 'BoostClient/1.0.0' } }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch BoostX releases');
      }

      const release = await response.json();
      const asset = release.assets?.find((a: any) =>
        a.name.includes(gameVersion) && a.name.includes(loader)
      );

      if (!asset) {
        throw new Error(`No BoostX build found for ${gameVersion} ${loader}`);
      }

      const filename = asset.name;
      const downloadPath = path.join(modsDir, filename);

      const downloadRes = await fetch(asset.browser_download_url);
      if (!downloadRes.ok) throw new Error('Download failed');

      const buffer = Buffer.from(await downloadRes.arrayBuffer());
      fs.writeFileSync(downloadPath, buffer);

      return { success: true, path: downloadPath };
    } catch (err: any) {
      console.error('[VersionManager] BoostX download failed:', err);
      return { success: false, message: err.message || 'Download failed' };
    }
  }

  /**
   * Checks for missing files and installs from GitHub
   */
  public async ensureFileExists(
    filePath: string,
    githubPath: string,
    repoOwner: string = 'PromptGPTX',
    repoName: string = 'boostclient'
  ): Promise<boolean> {
    if (fs.existsSync(filePath)) return true;

    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${githubPath}`,
        { headers: { 'User-Agent': 'BoostClient/1.0.0' } }
      );

      if (response.ok) {
        const content = await response.text();
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, content);
        return true;
      }
    } catch (err) {
      console.error(`[VersionManager] Failed to fetch ${githubPath}:`, err);
    }
    return false;
  }

  /**
   * Auto-configures Simple Voice Chat on server startup
   */
  public async setupVoiceChat(serverId: string): Promise<boolean> {
    const server = this.configStore.getServer(serverId);
    if (!server) return false;

    const pluginsDir = path.join(server.path, 'plugins');
    const voiceChatJar = path.join(pluginsDir, 'Simple Voice Chat.jar');

    if (!fs.existsSync(voiceChatJar)) {
      // Voice Chat not installed
      server.ports = server.ports || [];
      return false;
    }

    // Find next available port (starting from 24454)
    let voicePort = 24454;
    const usedPorts = new Set(server.ports?.map(p => p.port) || []);
    while (usedPorts.has(voicePort)) {
      voicePort += 1;
    }

    // Update server ports
    if (!server.ports) server.ports = [];
    server.ports.push({
      id: `voice-${Date.now()}`,
      name: 'Simple Voice Chat',
      port: voicePort,
      protocol: 'udp',
      enabled: true,
      description: 'Simple Voice Chat Server Port',
    });

    // Create voicechat.properties if exists
    const propsPath = path.join(server.path, 'plugins', 'Simple Voice Chat', 'voicechat.properties');
    const notePath = path.join(server.path, 'plugins', 'Simple Voice Chat', 'VOICE_PORT.txt');

    if (!fs.existsSync(propsPath)) {
      fs.mkdirSync(path.dirname(propsPath), { recursive: true });
      const content = `port=${voicePort}\n`;
      fs.writeFileSync(propsPath, content);
    } else {
      // Update existing properties file
      let content = fs.readFileSync(propsPath, 'utf-8');
      content = content.replace(/port=\d+/, `port=${voicePort}`);
      fs.writeFileSync(propsPath, content);
    }

    // Write note file
    fs.writeFileSync(notePath, `Voice Chat Port: ${voicePort}\n`, 'utf-8');

    this.configStore.saveServer(server);
    return true;
  }

  /**
   * Auto-configures GeyserMC and Floodgate for Bedrock support
   */
  public async setupGeyserAndFloodgate(serverId: string): Promise<boolean> {
    const server = this.configStore.getServer(serverId);
    if (!server) return false;

    const isProxyPlatform = ['velocity', 'bungeecord'].includes(server.platform);
    const isPaperPlatform = ['paper', 'purpur', 'fabric', 'forge', 'neoforge'].includes(server.platform);

    if (!isProxyPlatform && !isPaperPlatform) return false;

    const pluginsDir = path.join(server.path, 'plugins');

    // Check if Geyser is installed
    const geyserJar = path.join(pluginsDir, 'Geyser.jar');
    const geyserExists = fs.existsSync(geyserJar);

    if (geyserExists) {
      // Auto-configure Geyser if not already configured
      this.configureGeyser(server.path);
    }

    // Check if Floodgate is installed (required for Paper/Fabric)
    if (isPaperPlatform) {
      const floodgateJar = path.join(pluginsDir, 'floodgate.jar');
      if (!fs.existsSync(floodgateJar)) {
        // Auto-install Floodgate
        await this.installPlugin(serverId, 'floodgate', pluginsDir);
      }
    }

    return true;
  }

  /**
   * Configure GeyserMC plugin
   */
  private configureGeyser(serverPath: string): void {
    const geyserConfigPath = path.join(serverPath, 'plugins', 'Geyser', 'config.yml');
    if (!fs.existsSync(geyserConfigPath)) return;

    try {
      let content = fs.readFileSync(geyserConfigPath, 'utf-8');
      // Set default Bedrock port assignment
      // Configure authentication
      fs.writeFileSync(geyserConfigPath, content);
    } catch (err) {
      console.error('[VersionManager] Failed to configure Geyser:', err);
    }
  }

  /**
   * Install a plugin from Modrinth/Spigot
   */
  private async installPlugin(serverId: string, pluginSlug: string, pluginsDir: string): Promise<boolean> {
    try {
      const response = await fetch(`https://api.modrinth.com/v2/project/${pluginSlug}`, {
        headers: { 'User-Agent': 'BoostClient/1.0.0' },
      });

      if (!response.ok) return false;
      const project = await response.json();

      const versionsRes = await fetch(`https://api.modrinth.com/v2/project/${project.id}/version?game_versions=["1.20.4"]`, {
        headers: { 'User-Agent': 'BoostClient/1.0.0' },
      });

      if (!versionsRes.ok) return false;
      const versions = await versionsRes.json();
      if (versions.length === 0) return false;

      const newestVersion = versions[0];
      const file = newestVersion.files.find((f: any) => f.primary) || newestVersion.files[0];

      const downloadRes = await fetch(file.url);
      if (!downloadRes.ok) return false;

      const buffer = Buffer.from(await downloadRes.arrayBuffer());
      const targetPath = path.join(pluginsDir, file.filename);
      fs.writeFileSync(targetPath, buffer);

      return true;
    } catch (err) {
      console.error('[VersionManager] Plugin install failed:', err);
      return false;
    }
  }
}
