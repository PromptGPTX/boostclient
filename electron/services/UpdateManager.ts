import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { ConfigStore } from './ConfigStore';

interface ReleaseInfo {
  tag_name: string;
  name: string;
  body: string;
  prerelease: boolean;
  published_at: string;
  assets?: {
    name: string;
    browser_download_url: string;
  }[];
}

interface CurrentVersion {
  version: string;
  commit: string;
  buildDate: string;
  isDev: boolean;
}

export class UpdateManager {
  private configStore: ConfigStore;
  private readonly repoOwner = 'PromptGPTX';
  private readonly repoName = 'boostclient';
  private currentVersionInfo: CurrentVersion;

  constructor(configStore: ConfigStore) {
    this.configStore = configStore;
    this.currentVersionInfo = this.loadCurrentVersion();
  }

  private loadCurrentVersion(): CurrentVersion {
    try {
      const pkgPath = path.join(__dirname, '../../package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        return {
          version: pkg.version || '1.2.0',
          commit: process.env.GIT_COMMIT || 'dev',
          buildDate: process.env.BUILD_DATE || new Date().toISOString(),
          isDev: process.env.NODE_ENV === 'development',
        };
      }
    } catch (err) {
      console.error('[UpdateManager] Could not read package.json version:', err);
    }
    return {
      version: '1.2.0',
      commit: 'dev',
      buildDate: new Date().toISOString(),
      isDev: process.env.NODE_ENV === 'development',
    };
  }

  /**
   * Check GitHub for latest release
   */
  public async checkForUpdates(): Promise<{
    updateAvailable: boolean;
    currentVersion: string;
    latestVersion: string;
    releaseInfo?: ReleaseInfo;
    isCritical: boolean;
  }> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/releases/latest`,
        {
          headers: {
            'User-Agent': 'BoostClient/1.0.0',
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (!response.ok) {
        console.warn('[UpdateManager] Could not fetch releases from GitHub');
        return {
          updateAvailable: false,
          currentVersion: this.currentVersionInfo.version,
          latestVersion: this.currentVersionInfo.version,
          isCritical: false,
        };
      }

      const release: ReleaseInfo = await response.json();

      const current = this.parseVersion(this.currentVersionInfo.version);
      const latest = this.parseVersion(release.tag_name.replace(/^v/, ''));

      const isNewer = this.compareVersions(latest, current) > 0;

      const isCritical = release.body?.toLowerCase().includes('critical') ||
                         release.tag_name.toLowerCase().includes('critical') ||
                         release.prerelease === false;

      return {
        updateAvailable: isNewer,
        currentVersion: this.currentVersionInfo.version,
        latestVersion: release.tag_name,
        releaseInfo: release,
        isCritical,
      };
    } catch (err) {
      console.error('[UpdateManager] Update check failed:', err);
      return {
        updateAvailable: false,
        currentVersion: this.currentVersionInfo.version,
        latestVersion: this.currentVersionInfo.version,
        isCritical: false,
      };
    }
  }

  public async performUpdate(): Promise<{ success: boolean; message: string }> {
    try {
      const check = await this.checkForUpdates();
      if (!check.releaseInfo) {
        return { success: false, message: 'No release information available' };
      }

      const updateInfo = {
        currentVersion: this.currentVersionInfo.version,
        latestVersion: check.latestVersion,
        releaseNotes: check.releaseInfo.body,
        downloadUrl: check.releaseInfo.assets?.[0]?.browser_download_url,
        isCritical: check.isCritical,
      };

      const updatesFile = path.join(this.configStore.getDataDir(), 'pending_update.json');
      fs.writeFileSync(updatesFile, JSON.stringify(updateInfo, null, 2), 'utf-8');

      return {
        success: true,
        message: 'Update information saved. Restart required to apply.',
      };
    } catch (err: any) {
      console.error('[UpdateManager] Update failed:', err);
      return { success: false, message: err.message || 'Update failed' };
    }
  }

  public hasPendingUpdate(): boolean {
    const updatesFile = path.join(this.configStore.getDataDir(), 'pending_update.json');
    return fs.existsSync(updatesFile);
  }

  public getPendingUpdate(): any {
    const updatesFile = path.join(this.configStore.getDataDir(), 'pending_update.json');
    if (fs.existsSync(updatesFile)) {
      try {
        return JSON.parse(fs.readFileSync(updatesFile, 'utf-8'));
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  public clearPendingUpdate(): void {
    const updatesFile = path.join(this.configStore.getDataDir(), 'pending_update.json');
    if (fs.existsSync(updatesFile)) {
      fs.unlinkSync(updatesFile);
    }
  }

  private parseVersion(version: string): number[] {
    return version.split('.').map(v => parseInt(v, 10) || 0);
  }

  private compareVersions(a: number[], b: number[]): number {
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const av = a[i] || 0;
      const bv = b[i] || 0;
      if (av > bv) return 1;
      if (av < bv) return -1;
    }
    return 0;
  }

  public getVersion(): CurrentVersion {
    return this.currentVersionInfo;
  }
}
