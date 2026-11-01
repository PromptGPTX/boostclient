import { contextBridge, ipcRenderer } from 'electron';
import {
  GameProfile,
  ServerInstance,
  ServerPlatform,
  ServerProperties,
  StoreItem,
  StoreSearchResult,
  Account,
  AppSettings,
  InstalledItem,
  ServerMetrics,
  ModLoader,
  ModPresetType,
  BoostXModule,
  BoostXConfig,
  ServerPort,
  CloudflareTunnelConfig,
} from '../src/types';

contextBridge.exposeInMainWorld('electronAPI', {
  // Profiles & Launcher
  getProfiles: (): Promise<GameProfile[]> => ipcRenderer.invoke('profiles:get'),
  saveProfile: (profile: GameProfile): Promise<GameProfile> => ipcRenderer.invoke('profiles:save', profile),
  createProfileWithPreset: (data: {
    profile: GameProfile;
    preset: ModPresetType;
    installBoostMod: boolean;
  }): Promise<{ profile: GameProfile; installedMods: string[] }> =>
    ipcRenderer.invoke('profiles:create-with-preset', data),
  deleteProfile: (id: string): Promise<boolean> => ipcRenderer.invoke('profiles:delete', id),
  launchGame: (profileId: string): Promise<{ success: boolean; pid?: number; message?: string }> =>
    ipcRenderer.invoke('launcher:launch', profileId),
  killGame: (profileId: string): Promise<boolean> => ipcRenderer.invoke('launcher:kill', profileId),
  getMojangVersions: (): Promise<{ id: string; type: 'release' | 'snapshot'; url: string }[]> =>
    ipcRenderer.invoke('launcher:get-mojang-versions'),
  getLoaderVersions: (loader: ModLoader, gameVersion: string): Promise<string[]> =>
    ipcRenderer.invoke('launcher:get-loader-versions', loader, gameVersion),
  detectJava: (): Promise<{ path: string; version: string; is64Bit: boolean }[]> =>
    ipcRenderer.invoke('launcher:detect-java'),

  // BoostX Mod & In-Game GUI Configurator
  getBoostXModules: (): Promise<BoostXModule[]> => ipcRenderer.invoke('boostx:get-modules'),
  getProfileBoostXConfig: (profileId: string): Promise<BoostXConfig> =>
    ipcRenderer.invoke('boostx:get-config', profileId),
  saveProfileBoostXConfig: (profileId: string, config: BoostXConfig): Promise<boolean> =>
    ipcRenderer.invoke('boostx:save-config', profileId, config),

  // Servers
  getServers: (): Promise<ServerInstance[]> => ipcRenderer.invoke('server:list'),
  createServer: (data: {
    name: string;
    platform: ServerPlatform;
    version: string;
    port: number;
    ram: number;
  }): Promise<ServerInstance> => ipcRenderer.invoke('server:create', data),
  deleteServer: (id: string): Promise<boolean> => ipcRenderer.invoke('server:delete', id),
  startServer: (id: string): Promise<void> => ipcRenderer.invoke('server:start', id),
  stopServer: (id: string): Promise<void> => ipcRenderer.invoke('server:stop', id),
  restartServer: (id: string): Promise<void> => ipcRenderer.invoke('server:restart', id),
  killServer: (id: string): Promise<void> => ipcRenderer.invoke('server:kill', id),
  sendServerCommand: (id: string, command: string): Promise<void> =>
    ipcRenderer.invoke('server:send-command', id, command),
  openServerFolder: (id: string, subfolder?: string): Promise<void> =>
    ipcRenderer.invoke('server:open-folder', id, subfolder),
  getServerProperties: (id: string): Promise<ServerProperties> =>
    ipcRenderer.invoke('server:get-properties', id),
  saveServerProperties: (id: string, props: ServerProperties): Promise<boolean> =>
    ipcRenderer.invoke('server:save-properties', id, props),
  switchServerVersion: (
    id: string,
    platform: ServerPlatform,
    version: string,
    build?: string
  ): Promise<boolean> => ipcRenderer.invoke('server:switch-version', id, platform, version, build),
  getServerPluginsMods: (id: string): Promise<InstalledItem[]> =>
    ipcRenderer.invoke('server:get-plugins-mods', id),
  toggleServerPluginMod: (id: string, filename: string, enable: boolean): Promise<boolean> =>
    ipcRenderer.invoke('server:toggle-plugin-mod', id, filename, enable),
  deleteServerPluginMod: (id: string, filename: string): Promise<boolean> =>
    ipcRenderer.invoke('server:delete-plugin-mod', id, filename),

  // Server Network & Cloudflare Tunnel
  updateServerPorts: (serverId: string, ports: ServerPort[]): Promise<ServerPort[]> =>
    ipcRenderer.invoke('server:update-ports', serverId, ports),
  toggleCloudflareTunnel: (
    serverId: string,
    enable: boolean,
    token?: string,
    domain?: string
  ): Promise<void> => ipcRenderer.invoke('server:toggle-cloudflare', serverId, enable, token, domain),

  // Playit Tunnel
  togglePlayitTunnel: (id: string, enable: boolean): Promise<void> =>
    ipcRenderer.invoke('playit:toggle', id, enable),
  openUrl: (url: string): Promise<void> => ipcRenderer.invoke('system:open-url', url),

  // Content Store
  searchStore: (params: {
    query: string;
    projectType: 'mod' | 'modpack' | 'resourcepack' | 'shader';
    gameVersion?: string;
    loader?: string;
    limit?: number;
    offset?: number;
  }): Promise<StoreSearchResult> => ipcRenderer.invoke('store:search', params),
  installStoreItem: (
    item: StoreItem,
    target: { type: 'profile' | 'server'; id: string; gameVersion?: string; loader?: string }
  ): Promise<{ success: boolean; filename?: string; message?: string }> =>
    ipcRenderer.invoke('store:install', item, target),

  // Updates & GitHub Version Sync
  checkForUpdates: () => ipcRenderer.invoke('updates:check'),
  performUpdate: () => ipcRenderer.invoke('updates:perform'),
  getPendingUpdate: () => ipcRenderer.invoke('updates:get-pending'),
  clearPendingUpdate: () => ipcRenderer.invoke('updates:clear-pending'),
  downloadBoostXMod: (gameVersion: string, loader: ModLoader, profileId: string) =>
    ipcRenderer.invoke('version:download-boostx', gameVersion, loader, profileId),

  // Wardrobe & Cosmetics
  saveAccountSkin: (accountId: string, slot: number, dataUrl: string) =>
    ipcRenderer.invoke('account:save-skin', accountId, slot, dataUrl),
  setActiveSkinSlot: (accountId: string, slot: number) =>
    ipcRenderer.invoke('account:set-active-skin-slot', accountId, slot),
  saveAccountCape: (accountId: string, cape: any) =>
    ipcRenderer.invoke('account:save-cape', accountId, cape),

  // Accounts & Auth
  getAccounts: (): Promise<Account[]> => ipcRenderer.invoke('auth:get-accounts'),
  getActiveAccount: (): Promise<Account | null> => ipcRenderer.invoke('auth:get-active'),
  setActiveAccount: (id: string): Promise<void> => ipcRenderer.invoke('auth:set-active', id),
  loginOffline: (username: string): Promise<Account> => ipcRenderer.invoke('auth:login-offline', username),
  startMicrosoftLogin: (): Promise<void> => ipcRenderer.invoke('auth:start-microsoft-login'),
  removeAccount: (id: string): Promise<boolean> => ipcRenderer.invoke('auth:remove-account', id),

  // Settings
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings: Partial<AppSettings>): Promise<AppSettings> =>
    ipcRenderer.invoke('settings:save', settings),

  // Event Listeners
  onServerLog: (callback: (data: { serverId: string; line: string }) => void) => {
    const handler = (_event: any, data: any) => callback(data);
    ipcRenderer.on('server:log', handler);
    return () => ipcRenderer.removeListener('server:log', handler);
  },
  onServerStatus: (
    callback: (data: { serverId: string; status: ServerInstance['status']; playitTunnel?: any }) => void
  ) => {
    const handler = (_event: any, data: any) => callback(data);
    ipcRenderer.on('server:status', handler);
    return () => ipcRenderer.removeListener('server:status', handler);
  },
  onServerMetrics: (callback: (data: { serverId: string; metrics: ServerMetrics }) => void) => {
    const handler = (_event: any, data: any) => callback(data);
    ipcRenderer.on('server:metrics', handler);
    return () => ipcRenderer.removeListener('server:metrics', handler);
  },
  onCloudflareStatus: (
    callback: (data: { serverId: string; status: CloudflareTunnelConfig['status']; domain?: string; log?: string }) => void
  ) => {
    const handler = (_event: any, data: any) => callback(data);
    ipcRenderer.on('server:cloudflare-status', handler);
    return () => ipcRenderer.removeListener('server:cloudflare-status', handler);
  },
  onLauncherLog: (callback: (data: { profileId: string; line: string }) => void) => {
    const handler = (_event: any, data: any) => callback(data);
    ipcRenderer.on('launcher:log', handler);
    return () => ipcRenderer.removeListener('launcher:log', handler);
  },
  onLauncherStatus: (
    callback: (data: {
      profileId: string;
      status: 'idle' | 'downloading' | 'launching' | 'running' | 'error';
      progress?: number;
      text?: string;
    }) => void
  ) => {
    const handler = (_event: any, data: any) => callback(data);
    ipcRenderer.on('launcher:status', handler);
    return () => ipcRenderer.removeListener('launcher:status', handler);
  },
  onMicrosoftDeviceCode: (callback: (data: { userCode: string; verificationUri: string }) => void) => {
    const handler = (_event: any, data: any) => callback(data);
    ipcRenderer.on('auth:device-code', handler);
    return () => ipcRenderer.removeListener('auth:device-code', handler);
  },
});
