// BoostClient Shared Data Types

export type ModLoader = 'vanilla' | 'fabric' | 'forge' | 'neoforge' | 'quilt';

export type ModPresetType = 'performance' | 'visual' | 'advanced';

export type BoostXModuleCategory = 'pvp' | 'hud' | 'visual' | 'utility' | 'world' | 'performance';

export interface BoostXModule {
  id: string;
  name: string;
  category: BoostXModuleCategory;
  description: string;
  enabled: boolean;
  hotkey?: string;
  settings?: {
    scale?: number;
    color?: string;
    chroma?: boolean;
    background?: boolean;
    bgOpacity?: number;
    posX?: number;
    posY?: number;
    [key: string]: any;
  };
}

export interface BoostXConfig {
  version: string;
  guiKey: string; // default "Right Shift"
  modules: Record<
    string,
    {
      enabled: boolean;
      hotkey?: string;
      settings?: Record<string, any>;
    }
  >;
}

export interface GameProfile {
  id: string;
  name: string;
  icon?: string;
  gameVersion: string; // e.g. "1.20.4", "1.21.1", "1.16.5", "1.8.9"
  loaderType: ModLoader;
  loaderVersion?: string;
  javaPath?: string;
  minMemory: number; // in MB (e.g. 2048)
  maxMemory: number; // in MB (e.g. 4096)
  jvmArgs?: string[];
  resolution?: { width: number; height: number };
  performancePreset: 'standard' | 'high' | 'ultra-10x'; // 10x FPS Performance Engine
  modPreset?: ModPresetType;
  installBoostMod?: boolean;
  created: number;
  lastPlayed?: number;
}

export type ServerPlatform =
  | 'paper'
  | 'purpur'
  | 'fabric'
  | 'forge'
  | 'neoforge'
  | 'vanilla'
  | 'velocity'
  | 'bungeecord';

export interface ServerPort {
  id: string;
  name: string;
  port: number;
  protocol: 'tcp' | 'udp' | 'both';
  enabled: boolean;
  description?: string;
}

export interface CloudflareTunnelConfig {
  enabled: boolean;
  token?: string;
  domain?: string;
  status: 'idle' | 'starting' | 'connected' | 'error';
  publicAddress?: string;
  logs?: string[];
}

export interface ServerInstance {
  id: string;
  name: string;
  platform: ServerPlatform;
  version: string;
  build?: string;
  port: number; // default 25565
  path: string; // absolute directory path
  minRam: number; // in GB (e.g. 2)
  maxRam: number; // in GB (e.g. 4)
  javaPath?: string;
  autoStartPlayit: boolean;
  status: 'offline' | 'starting' | 'online' | 'stopping';
  playitTunnel?: {
    status: 'idle' | 'starting' | 'connected' | 'error';
    publicAddress?: string; // e.g. "boost-play.gl.joinmc.link"
    claimUrl?: string;
    tunnelId?: string;
  };
  cloudflareTunnel?: CloudflareTunnelConfig;
  ports?: ServerPort[];
}

export interface ServerProperties {
  motd: string;
  'server-port': number;
  'online-mode': boolean; // cracked mode when false
  'max-players': number;
  difficulty: 'peaceful' | 'easy' | 'normal' | 'hard';
  gamemode: 'survival' | 'creative' | 'adventure' | 'spectator';
  pvp: boolean;
  'enable-command-block': boolean;
  'spawn-protection': number;
  'white-list': boolean;
  'view-distance': number;
  'simulation-distance'?: number;
  [key: string]: any;
}

export interface AccountSkinSlot {
  slot: number; // 1, 2, 3
  name?: string;
  dataUrl?: string; // base64 or path
  updatedAt: number;
}

export interface AccountCape {
  id: string; // 'none' | 'creeper' | 'angel' | 'dragon' | 'rainbow' | 'fire' | 'heart' | 'star' | 'custom'
  type: 'default' | 'custom' | 'animated-gif';
  name: string;
  dataUrl?: string;
  isAnimated?: boolean;
}

export interface Account {
  id: string;
  username: string;
  uuid: string;
  type: 'offline' | 'microsoft';
  skinUrl?: string;
  activeSkinSlot?: number;
  skins?: AccountSkinSlot[];
  cape?: AccountCape;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  created?: number;
  email?: string;
}

export interface StoreItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  author: string;
  iconUrl?: string;
  downloads: number;
  follows: number;
  projectType: 'mod' | 'modpack' | 'resourcepack' | 'shader';
  categories: string[];
  versions: string[];
  loaders: string[];
  source: 'modrinth' | 'curseforge';
}

export interface StoreSearchResult {
  hits: StoreItem[];
  totalHits: number;
  offset: number;
  limit: number;
}

export interface InstalledItem {
  filename: string;
  filepath: string;
  name: string;
  enabled: boolean;
  size: number;
  modified: number;
}

export interface ServerMetrics {
  cpu: number;
  memoryMb: number;
  maxMemoryMb: number;
  uptimeSeconds: number;
  onlinePlayers: string[];
  maxPlayers: number;
}

export interface AppSettings {
  theme: 'aternos-dark' | 'clean-light' | 'midnight' | 'emerald' | 'cyberpunk';
  defaultRam: number; // GB
  defaultJavaPath?: string;
  playitSecretKey?: string;
  performanceOptimization: boolean;
  enableDiscordRPC: boolean;
  checkUpdates: boolean;
}

export interface ElectronAPI {
  // Profiles & Launcher
  getProfiles: () => Promise<GameProfile[]>;
  saveProfile: (profile: GameProfile) => Promise<GameProfile>;
  createProfileWithPreset: (data: {
    profile: GameProfile;
    preset: ModPresetType;
    installBoostMod: boolean;
  }) => Promise<{ profile: GameProfile; installedMods: string[] }>;
  deleteProfile: (id: string) => Promise<boolean>;
  launchGame: (profileId: string) => Promise<{ success: boolean; pid?: number; message?: string }>;
  killGame: (profileId: string) => Promise<boolean>;
  getMojangVersions: () => Promise<{ id: string; type: 'release' | 'snapshot'; url: string }[]>;
  getLoaderVersions: (loader: ModLoader, gameVersion: string) => Promise<string[]>;
  detectJava: () => Promise<{ path: string; version: string; is64Bit: boolean }[]>;

  // BoostX Client Mod & In-Game GUI
  getBoostXModules: () => Promise<BoostXModule[]>;
  getProfileBoostXConfig: (profileId: string) => Promise<BoostXConfig>;
  saveProfileBoostXConfig: (profileId: string, config: BoostXConfig) => Promise<boolean>;

  // Servers
  getServers: () => Promise<ServerInstance[]>;
  createServer: (data: {
    name: string;
    platform: ServerPlatform;
    version: string;
    port: number;
    ram: number;
  }) => Promise<ServerInstance>;
  deleteServer: (id: string) => Promise<boolean>;
  startServer: (id: string) => Promise<void>;
  stopServer: (id: string) => Promise<void>;
  restartServer: (id: string) => Promise<void>;
  killServer: (id: string) => Promise<void>;
  sendServerCommand: (id: string, command: string) => Promise<void>;
  openServerFolder: (id: string, subfolder?: string) => Promise<void>;
  getServerProperties: (id: string) => Promise<ServerProperties>;
  saveServerProperties: (id: string, props: ServerProperties) => Promise<boolean>;
  switchServerVersion: (id: string, platform: ServerPlatform, version: string, build?: string) => Promise<boolean>;
  getServerPluginsMods: (id: string) => Promise<InstalledItem[]>;
  toggleServerPluginMod: (id: string, filename: string, enable: boolean) => Promise<boolean>;
  deleteServerPluginMod: (id: string, filename: string) => Promise<boolean>;

  // Server Networking & Ports
  updateServerPorts: (serverId: string, ports: ServerPort[]) => Promise<ServerPort[]>;
  toggleCloudflareTunnel: (
    serverId: string,
    enable: boolean,
    token?: string,
    domain?: string
  ) => Promise<void>;

  // Playit Tunnel
  togglePlayitTunnel: (id: string, enable: boolean) => Promise<void>;
  openUrl: (url: string) => Promise<void>;

  // Content Store
  searchStore: (params: {
    query: string;
    projectType: 'mod' | 'modpack' | 'resourcepack' | 'shader';
    gameVersion?: string;
    loader?: string;
    limit?: number;
    offset?: number;
  }) => Promise<StoreSearchResult>;
  installStoreItem: (
    item: StoreItem,
    target: { type: 'profile' | 'server'; id: string; gameVersion?: string; loader?: string }
  ) => Promise<{ success: boolean; filename?: string; message?: string }>;

  // Updates & Version Sync
  checkForUpdates: () => Promise<{
    updateAvailable: boolean;
    currentVersion: string;
    latestVersion: string;
    releaseInfo?: any;
    isCritical: boolean;
  }>;
  performUpdate: () => Promise<{ success: boolean; message: string }>;
  getPendingUpdate: () => Promise<any>;
  clearPendingUpdate: () => Promise<void>;
  downloadBoostXMod: (
    gameVersion: string,
    loader: ModLoader,
    profileId: string
  ) => Promise<{ success: boolean; path?: string; message?: string }>;

  // Wardrobe & Cosmetics
  saveAccountSkin: (accountId: string, slot: number, dataUrl: string) => Promise<boolean>;
  setActiveSkinSlot: (accountId: string, slot: number) => Promise<boolean>;
  saveAccountCape: (accountId: string, cape: AccountCape) => Promise<boolean>;

  // Accounts & Auth
  getAccounts: () => Promise<Account[]>;
  getActiveAccount: () => Promise<Account | null>;
  setActiveAccount: (id: string) => Promise<void>;
  loginOffline: (username: string) => Promise<Account>;
  startMicrosoftLogin: () => Promise<void>;
  removeAccount: (id: string) => Promise<boolean>;

  // Settings
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>;

  // Event Listeners
  onServerLog: (callback: (data: { serverId: string; line: string }) => void) => () => void;
  onServerStatus: (callback: (data: { serverId: string; status: ServerInstance['status']; playitTunnel?: any }) => void) => () => void;
  onServerMetrics: (callback: (data: { serverId: string; metrics: ServerMetrics }) => void) => () => void;
  onCloudflareStatus: (callback: (data: { serverId: string; status: CloudflareTunnelConfig['status']; domain?: string; log?: string }) => void) => () => void;
  onLauncherLog: (callback: (data: { profileId: string; line: string }) => void) => () => void;
  onLauncherStatus: (callback: (data: { profileId: string; status: 'idle' | 'downloading' | 'launching' | 'running' | 'error'; progress?: number; text?: string }) => void) => () => void;
  onMicrosoftDeviceCode: (callback: (data: { userCode: string; verificationUri: string }) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
