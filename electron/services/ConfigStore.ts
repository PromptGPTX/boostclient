import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { GameProfile, ServerInstance, Account, AppSettings } from '../../src/types';

interface StoreData {
  profiles: GameProfile[];
  activeProfileId: string | null;
  servers: ServerInstance[];
  accounts: Account[];
  activeAccountId: string | null;
  settings: AppSettings;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'aternos-dark',
  defaultRam: 4,
  performanceOptimization: true,
  enableDiscordRPC: false,
  checkUpdates: true,
};

export class ConfigStore {
  private dataDir: string;
  private filePath: string;
  private data: StoreData;

  constructor() {
    this.dataDir = path.join(app.getPath('userData'), 'BoostClient');
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    this.filePath = path.join(this.dataDir, 'config.json');
    this.data = this.loadData();
  }

  public getDataDir(): string {
    return this.dataDir;
  }

  public getServersDir(): string {
    const serversDir = path.join(this.dataDir, 'servers');
    if (!fs.existsSync(serversDir)) {
      fs.mkdirSync(serversDir, { recursive: true });
    }
    return serversDir;
  }

  public getProfilesDir(): string {
    const profilesDir = path.join(this.dataDir, 'profiles');
    if (!fs.existsSync(profilesDir)) {
      fs.mkdirSync(profilesDir, { recursive: true });
    }
    return profilesDir;
  }

  public getBinDir(): string {
    const binDir = path.join(this.dataDir, 'bin');
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }
    return binDir;
  }

  private loadData(): StoreData {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          profiles: parsed.profiles || [],
          activeProfileId: parsed.activeProfileId || null,
          servers: parsed.servers || [],
          accounts: parsed.accounts || [],
          activeAccountId: parsed.activeAccountId || null,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        };
      }
    } catch (err) {
      console.error('[ConfigStore] Failed to load config file, creating default', err);
    }

    // Default initial profile
    const defaultProfile: GameProfile = {
      id: 'default-profile',
      name: 'Latest Release (1.20.4)',
      gameVersion: '1.20.4',
      loaderType: 'fabric',
      minMemory: 2048,
      maxMemory: 4096,
      performancePreset: 'ultra-10x',
      created: Date.now(),
    };

    const initial: StoreData = {
      profiles: [defaultProfile],
      activeProfileId: defaultProfile.id,
      servers: [],
      accounts: [
        {
          id: 'guest-account',
          username: 'BoostPlayer',
          uuid: '00000000-0000-0000-0000-000000000001',
          type: 'offline',
          skinUrl: 'https://mc-heads.net/avatar/BoostPlayer/128',
        },
      ],
      activeAccountId: 'guest-account',
      settings: DEFAULT_SETTINGS,
    };

    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave?: StoreData): void {
    try {
      const data = dataToSave || this.data;
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[ConfigStore] Failed to save config file', err);
    }
  }

  // Profiles
  public getProfiles(): GameProfile[] {
    return this.data.profiles;
  }

  public getActiveProfile(): GameProfile | null {
    if (!this.data.activeProfileId) return this.data.profiles[0] || null;
    return this.data.profiles.find((p) => p.id === this.data.activeProfileId) || this.data.profiles[0] || null;
  }

  public saveProfile(profile: GameProfile): GameProfile {
    const index = this.data.profiles.findIndex((p) => p.id === profile.id);
    if (index >= 0) {
      this.data.profiles[index] = profile;
    } else {
      this.data.profiles.push(profile);
    }
    this.saveData();
    return profile;
  }

  public deleteProfile(id: string): boolean {
    this.data.profiles = this.data.profiles.filter((p) => p.id !== id);
    if (this.data.activeProfileId === id) {
      this.data.activeProfileId = this.data.profiles[0]?.id || null;
    }
    this.saveData();
    return true;
  }

  // Servers
  public getServers(): ServerInstance[] {
    return this.data.servers;
  }

  public getServer(id: string): ServerInstance | undefined {
    return this.data.servers.find((s) => s.id === id);
  }

  public saveServer(server: ServerInstance): ServerInstance {
    const index = this.data.servers.findIndex((s) => s.id === server.id);
    if (index >= 0) {
      this.data.servers[index] = server;
    } else {
      this.data.servers.push(server);
    }
    this.saveData();
    return server;
  }

  public deleteServer(id: string): boolean {
    this.data.servers = this.data.servers.filter((s) => s.id !== id);
    this.saveData();
    return true;
  }

  // Accounts
  public getAccounts(): Account[] {
    return this.data.accounts;
  }

  public getActiveAccount(): Account | null {
    if (!this.data.activeAccountId) return this.data.accounts[0] || null;
    return this.data.accounts.find((a) => a.id === this.data.activeAccountId) || this.data.accounts[0] || null;
  }

  public saveAccount(account: Account): Account {
    const index = this.data.accounts.findIndex((a) => a.id === account.id);
    if (index >= 0) {
      this.data.accounts[index] = account;
    } else {
      this.data.accounts.push(account);
    }
    this.data.activeAccountId = account.id;
    this.saveData();
    return account;
  }

  public setActiveAccount(id: string): void {
    this.data.activeAccountId = id;
    this.saveData();
  }

  public removeAccount(id: string): boolean {
    this.data.accounts = this.data.accounts.filter((a) => a.id !== id);
    if (this.data.activeAccountId === id) {
      this.data.activeAccountId = this.data.accounts[0]?.id || null;
    }
    this.saveData();
    return true;
  }

  // Settings
  public getSettings(): AppSettings {
    return this.data.settings;
  }

  public saveSettings(settings: Partial<AppSettings>): AppSettings {
    this.data.settings = { ...this.data.settings, ...settings };
    this.saveData();
    return this.data.settings;
  }
}
