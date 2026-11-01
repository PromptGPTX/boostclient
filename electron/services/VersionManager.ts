import fs from 'fs';
import path from 'path';
import { ConfigStore } from './ConfigStore';

export type ModLoader = 'vanilla' | 'fabric' | 'forge' | 'neoforge' | 'quilt';

export class VersionManager {
  private configStore: ConfigStore;

  constructor(configStore: ConfigStore) {
    this.configStore = configStore;
  }

  public isModInstalled(profileId: string, modName: string): boolean {
    const profilesDir = this.configStore.getProfilesDir();
    const modsDir = path.join(profilesDir, profileId, 'mods');
    if (!fs.existsSync(modsDir)) return false;

    const files = fs.readdirSync(modsDir);
    return files.some(f => f.toLowerCase().includes(modName.toLowerCase()));
  }

  public async getBoostXModPath(gameVersion: string, loader: ModLoader): Promise<string | null> {
    const versionNum = parseFloat(gameVersion);
    if (versionNum < 1.18) return null;

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

  public async downloadBoostXMod(
    gameVersion: string,
    loader: ModLoader,
    profileId: string
  ): Promise<{ success: boolean; path?: string; message?: string }> {
    try {
      const profilesDir = this.configStore.getProfilesDir();
      const modsDir = path.join(profilesDir, profileId, 'mods');
      if (!fs.existsSync(modsDir)) fs.mkdirSync(modsDir, { recursive: true });

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
}
