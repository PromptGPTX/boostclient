import fs from 'fs';
import path from 'path';
import { ConfigStore } from './ConfigStore';
import { VersionManager } from './VersionManager';

export class ServerAutomation {
  private configStore: ConfigStore;
  private versionManager: VersionManager;

  constructor(configStore: ConfigStore) {
    this.configStore = configStore;
    this.versionManager = new VersionManager(configStore);
  }

  /**
   * Runs Aternos-style automation when server is created or starts
   */
  public async automateServerFeatures(serverId: string): Promise<{
    success: boolean;
    featuresApplied: string[];
  }> {
    const server = this.configStore.getServer(serverId);
    if (!server) {
      return { success: false, featuresApplied: [] };
    }

    const featuresApplied: string[] = [];

    try {
      // 1. Auto-setup Simple Voice Chat if installed
      const voiceSetupSuccess = await this.versionManager.setupVoiceChat(serverId);
      if (voiceSetupSuccess) {
        featuresApplied.push('Simple Voice Chat (auto-port configured)');
      }

      // 2. Auto-setup GeyserMC + Floodgate for Bedrock support
      const geyserSuccess = await this.versionManager.setupGeyserAndFloodgate(serverId);
      if (geyserSuccess) {
        featuresApplied.push('GeyserMC/Floodgate (Bedrock support enabled)');
      }

      // 3. Auto-configure Paper plugins if installed
      await this.configurePaperPlugins(server);

      // 4. Optimize server.properties if not set
      await this.optimizeServerProperties(server);

      return { success: true, featuresApplied };
    } catch (err) {
      console.error('[ServerAutomation] Automation failed:', err);
      return { success: false, featuresApplied };
    }
  }

  /**
   * Configure Paper plugins on startup
   */
  private async configurePaperPlugins(server: any): Promise<void> {
    const isPaperPlatform = ['paper', 'purpur'].includes(server.platform);

    if (!isPaperPlatform) return;

    try {
      const paperYamlPath = path.join(server.path, 'paper.yml');
      if (!fs.existsSync(paperYamlPath)) {
        // Create optimized Paper config
        const defaultConfig = `# BoostClient Optimized Paper Configuration
# Auto-generated - DO NOT EDIT MANUALLY
# Advanced settings optimized for 10x Performance

# Performance optimizations
chunk-loading:
  throttle-cooldown: 50
  throttle-cooldown-chunks:
    - 512
  throttle-max-per-tick: 10
  throttle-ticks: 20

# Async chunks
async-chunks:
  enabled: true

# Performance settings
autosave:
  player-data-save-interval-ticks: 6000
  executor-type: sync
  world-save-interval-ticks: 6000

# Entity settings
entities:
  activating-range:
    monsters: 32
    animals: 32
    water-animals: 32
    misc: 32

# Network compression
network-compression-threshold: 256

# Lag protection
tick:
  max-threads: 4
  max-queued-ticks: 2
`;
        fs.writeFileSync(paperYamlPath, defaultConfig);
      }
    } catch (err) {
      console.error('[ServerAutomation] Failed to configure Paper:', err);
    }
  }

  /**
   * Optimize server.properties
   */
  private async optimizeServerProperties(server: any): Promise<void> {
    try {
      const propsPath = path.join(server.path, 'server.properties');
      if (!fs.existsSync(propsPath)) return;

      let props = fs.readFileSync(propsPath, 'utf-8');

      // Ensure settings are optimized
      const optimizations: Record<string, string> = {
        'view-distance': '8',
        'simulation-distance': '8',
        'max-tick-time': '60000',
        'use-native-transport': 'true',
        'enable-jmx-monitoring': 'false',
        'query.port': server.port + 1,
      };

      Object.entries(optimizations).forEach(([key, value]) => {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(props)) {
          props = props.replace(regex, `${key}=${value}`);
        } else {
          props += `\n${key}=${value}`;
        }
      });

      fs.writeFileSync(propsPath, props);
    } catch (err) {
      console.error('[ServerAutomation] Failed to optimize properties:', err);
    }
  }
}
