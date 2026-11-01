import fs from 'fs';
import path from 'path';
import { ServerProperties } from '../../src/types';

export const DEFAULT_SERVER_PROPERTIES: ServerProperties = {
  motd: '§bBoostClient §7Self-Hosted Server §a[10x FPS]',
  'server-port': 25565,
  'online-mode': false, // Allows cracked & premium players to join without issues
  'max-players': 20,
  difficulty: 'normal',
  gamemode: 'survival',
  pvp: true,
  'enable-command-block': true,
  'spawn-protection': 16,
  'white-list': false,
  'view-distance': 10,
  'simulation-distance': 8,
  'allow-flight': true,
  'allow-nether': true,
  'broadcast-console-to-ops': true,
  'broadcast-rcon-to-ops': true,
  'enable-query': false,
  'enable-rcon': false,
  'enable-status': true,
  'entity-broadcast-range-percentage': 100,
  'force-gamemode': false,
  'function-permission-level': 2,
  'hardcore': false,
  'hide-online-players': false,
  'initial-disabled-packs': '',
  'initial-enabled-packs': 'vanilla',
  'max-chained-neighbor-updates': 1000000,
  'max-tick-time': 60000,
  'max-world-size': 29999984,
  'network-compression-threshold': 256,
  'op-permission-level': 4,
  'player-idle-timeout': 0,
  'prevent-proxy-connections': false,
  'rate-limit': 0,
  'require-resource-pack': false,
  'resource-pack': '',
  'resource-pack-prompt': '',
  'resource-pack-sha1': '',
  'server-ip': '',
  'spawn-animals': true,
  'spawn-monsters': true,
  'spawn-npcs': true,
  'sync-chunk-writes': true,
  'use-native-transport': true,
};

export class PropertiesManager {
  /**
   * Reads and parses a server.properties file
   */
  public static readProperties(serverDir: string): ServerProperties {
    const filePath = path.join(serverDir, 'server.properties');
    if (!fs.existsSync(filePath)) {
      this.writeProperties(serverDir, DEFAULT_SERVER_PROPERTIES);
      return { ...DEFAULT_SERVER_PROPERTIES };
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split(/\r?\n/);
      const props: Record<string, any> = { ...DEFAULT_SERVER_PROPERTIES };

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const equalsIndex = trimmed.indexOf('=');
        if (equalsIndex === -1) continue;

        const key = trimmed.slice(0, equalsIndex).trim();
        const rawValue = trimmed.slice(equalsIndex + 1).trim();

        // Parse boolean / number / string
        if (rawValue.toLowerCase() === 'true') {
          props[key] = true;
        } else if (rawValue.toLowerCase() === 'false') {
          props[key] = false;
        } else if (/^\d+$/.test(rawValue)) {
          props[key] = parseInt(rawValue, 10);
        } else {
          props[key] = rawValue;
        }
      }

      return props as ServerProperties;
    } catch (err) {
      console.error('[PropertiesManager] Failed to read server.properties:', err);
      return { ...DEFAULT_SERVER_PROPERTIES };
    }
  }

  /**
   * Serializes and writes properties to server.properties
   */
  public static writeProperties(serverDir: string, properties: Partial<ServerProperties>): boolean {
    const filePath = path.join(serverDir, 'server.properties');
    try {
      const merged = { ...DEFAULT_SERVER_PROPERTIES, ...properties };
      const lines: string[] = [
        '# Minecraft server properties',
        '# Auto-generated and managed by BoostClient',
        `# ${new Date().toISOString()}`,
      ];

      for (const [key, val] of Object.entries(merged)) {
        lines.push(`${key}=${val !== undefined ? val : ''}`);
      }

      fs.writeFileSync(filePath, lines.join('\n') + '\n', 'utf-8');
      return true;
    } catch (err) {
      console.error('[PropertiesManager] Failed to write server.properties:', err);
      return false;
    }
  }
}
