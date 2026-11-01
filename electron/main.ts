import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { ConfigStore } from './services/ConfigStore';
import { AuthManager } from './services/AuthManager';
import { PlayitManager } from './services/PlayitManager';
import { CloudflareManager } from './services/CloudflareManager';
import { ServerManager } from './services/ServerManager';
import { LauncherManager } from './services/LauncherManager';
import { StoreManager } from './services/StoreManager';
import { BoostXManager } from './services/BoostXManager';
import { PropertiesManager } from './services/PropertiesManager';
import { UpdateManager } from './services/UpdateManager';
import { VersionManager } from './services/VersionManager';

let mainWindow: BrowserWindow | null = null;

// Initialize Core Services
const configStore = new ConfigStore();
const authManager = new AuthManager(configStore);
const playitManager = new PlayitManager(configStore);
const cloudflareManager = new CloudflareManager(configStore);
const serverManager = new ServerManager(configStore, playitManager, cloudflareManager);
const launcherManager = new LauncherManager(configStore);
const storeManager = new StoreManager(configStore);
const boostXManager = new BoostXManager(configStore);
const updateManager = new UpdateManager(configStore);
const versionManager = new VersionManager(configStore);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1260,
    height: 840,
    minWidth: 1024,
    minHeight: 680,
    frame: true,
    backgroundColor: '#16191c',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    show: false,
  });

  // Wire Server Callbacks to push IPC events
  serverManager.setCallbacks({
    onLog: (serverId, line) => {
      mainWindow?.webContents.send('server:log', { serverId, line });
    },
    onStatus: (serverId, status, playitTunnel) => {
      mainWindow?.webContents.send('server:status', { serverId, status, playitTunnel });
    },
    onMetrics: (serverId, metrics) => {
      mainWindow?.webContents.send('server:metrics', { serverId, metrics });
    },
    onCloudflareStatus: (serverId, status, domain, log) => {
      mainWindow?.webContents.send('server:cloudflare-status', { serverId, status, domain, log });
    },
  });

  // Wire Launcher Callbacks to push IPC events
  launcherManager.setCallbacks({
    onLog: (profileId, line) => {
      mainWindow?.webContents.send('launcher:log', { profileId, line });
    },
    onStatus: (profileId, status, progress, text) => {
      mainWindow?.webContents.send('launcher:status', { profileId, status, progress, text });
    },
  });

  // Load URL
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // __dirname is dist-electron/electron, so ../../dist/index.html points to root dist/index.html
    const indexPath = path.join(__dirname, '../../dist/index.html');
    mainWindow.loadFile(indexPath);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers: Profiles & Launcher
ipcMain.handle('profiles:get', () => configStore.getProfiles());
ipcMain.handle('profiles:save', (_e, profile) => configStore.saveProfile(profile));
ipcMain.handle('profiles:create-with-preset', async (_e, { profile, preset, installBoostMod }) => {
  profile.modPreset = preset;
  profile.installBoostMod = installBoostMod;
  const saved = configStore.saveProfile(profile);

  const installedMods: string[] = [];

  // 1. Install BoostX Mod if toggled
  if (installBoostMod) {
    await boostXManager.ensureBoostXMod(saved.id);
    installedMods.push('boostx-1.0.0.jar');
  }

  // 2. Install curated preset mods (Performance or Visual)
  if (preset === 'performance' || preset === 'visual') {
    try {
      const downloaded = await storeManager.installCuratedPreset(
        preset,
        {
          id: saved.id,
          gameVersion: saved.gameVersion,
          loader: saved.loaderType,
        },
        (text) => {
          mainWindow?.webContents.send('launcher:status', {
            profileId: saved.id,
            status: 'downloading',
            text,
          });
        }
      );
      installedMods.push(...downloaded);
    } catch (presetErr) {
      console.error('Failed to download preset mods:', presetErr);
    }
  }

  return { profile: saved, installedMods };
});

ipcMain.handle('profiles:delete', (_e, id) => configStore.deleteProfile(id));
ipcMain.handle('launcher:launch', (_e, profileId) => launcherManager.launchGame(profileId));
ipcMain.handle('launcher:kill', (_e, profileId) => launcherManager.killGame(profileId));
ipcMain.handle('launcher:get-mojang-versions', () => launcherManager.getMojangVersions());
ipcMain.handle('launcher:get-loader-versions', (_e, loader, gameVer) =>
  launcherManager.getLoaderVersions(loader, gameVer)
);
ipcMain.handle('launcher:detect-java', () => launcherManager.detectJava());

// IPC Handlers: BoostX Mod & In-Game GUI Configurator
ipcMain.handle('boostx:get-modules', () => boostXManager.getModules());
ipcMain.handle('boostx:get-config', (_e, profileId) => boostXManager.getProfileConfig(profileId));
ipcMain.handle('boostx:save-config', (_e, profileId, config) =>
  boostXManager.saveProfileConfig(profileId, config)
);

// IPC Handlers: Servers
ipcMain.handle('server:list', () => configStore.getServers());
ipcMain.handle('server:create', (_e, data) => serverManager.createServer(data));
ipcMain.handle('server:delete', (_e, id) => serverManager.deleteServer(id));
ipcMain.handle('server:start', (_e, id) => serverManager.startServer(id));
ipcMain.handle('server:stop', (_e, id) => serverManager.stopServer(id));
ipcMain.handle('server:restart', (_e, id) => serverManager.restartServer(id));
ipcMain.handle('server:kill', (_e, id) => serverManager.killServer(id));
ipcMain.handle('server:send-command', (_e, id, cmd) => serverManager.sendCommand(id, cmd));
ipcMain.handle('server:open-folder', (_e, id, subfolder) => serverManager.openFolder(id, subfolder));
ipcMain.handle('server:get-properties', (_e, id) => {
  const server = configStore.getServer(id);
  if (!server) throw new Error('Server not found');
  return PropertiesManager.readProperties(server.path);
});
ipcMain.handle('server:save-properties', (_e, id, props) => {
  const server = configStore.getServer(id);
  if (!server) throw new Error('Server not found');
  return PropertiesManager.writeProperties(server.path, props);
});
ipcMain.handle('server:switch-version', (_e, id, platform, version, build) =>
  serverManager.switchVersion(id, platform, version, build)
);
ipcMain.handle('server:get-plugins-mods', (_e, id) => serverManager.getInstalledPluginsMods(id));
ipcMain.handle('server:toggle-plugin-mod', (_e, id, filename, enable) =>
  serverManager.togglePluginMod(id, filename, enable)
);
ipcMain.handle('server:delete-plugin-mod', (_e, id, filename) =>
  serverManager.deletePluginMod(id, filename)
);

// IPC Handlers: Server Network & Cloudflare
ipcMain.handle('server:update-ports', (_e, id, ports) => serverManager.updatePorts(id, ports));
ipcMain.handle('server:toggle-cloudflare', (_e, id, enable, token, domain) =>
  serverManager.toggleCloudflareTunnel(id, enable, token, domain)
);

// IPC Handlers: Playit Tunnel
ipcMain.handle('playit:toggle', (_e, id, enable) => {
  const server = configStore.getServer(id);
  if (!server) return;
  if (enable) {
    playitManager.startTunnel(id, server.port, server.path);
  } else {
    playitManager.stopTunnel(id);
  }
});
ipcMain.handle('system:open-url', (_e, url) => shell.openExternal(url));

// IPC Handlers: Content Store
ipcMain.handle('store:search', (_e, params) => storeManager.searchModrinth(params));
ipcMain.handle('store:install', (_e, item, target) => storeManager.installItem(item, target));

// IPC Handlers: Auth & Accounts
ipcMain.handle('auth:get-accounts', () => configStore.getAccounts());
ipcMain.handle('auth:get-active', () => configStore.getActiveAccount());
ipcMain.handle('auth:set-active', (_e, id) => configStore.setActiveAccount(id));
ipcMain.handle('auth:login-offline', (_e, username) => authManager.loginOffline(username));
ipcMain.handle('auth:start-microsoft-login', async () => {
  return authManager.startMicrosoftLogin((codeData) => {
    mainWindow?.webContents.send('auth:device-code', codeData);
  });
});
ipcMain.handle('auth:remove-account', (_e, id) => configStore.removeAccount(id));

// IPC Handlers: Updates & GitHub Version Sync
ipcMain.handle('updates:check', () => updateManager.checkForUpdates());
ipcMain.handle('updates:perform', () => updateManager.performUpdate());
ipcMain.handle('updates:get-pending', () => updateManager.getPendingUpdate());
ipcMain.handle('updates:clear-pending', () => updateManager.clearPendingUpdate());
ipcMain.handle('updates:get-version', () => updateManager.getVersion());
ipcMain.handle('version:download-boostx', (_e, gameVersion, loader, profileId) =>
  versionManager.downloadBoostXMod(gameVersion, loader, profileId)
);

// IPC Handlers: Wardrobe, Skins & GIF Capes
ipcMain.handle('account:save-skin', (_e, accountId, slot, dataUrl) => {
  const accounts = configStore.getAccounts();
  const acc = accounts.find((a) => a.id === accountId);
  if (!acc) return false;

  acc.skins = acc.skins || [];
  const existingIdx = acc.skins.findIndex((s) => s.slot === slot);
  const skinSlot = {
    slot,
    dataUrl,
    updatedAt: Date.now(),
  };

  if (existingIdx >= 0) {
    acc.skins[existingIdx] = skinSlot;
  } else {
    acc.skins.push(skinSlot);
  }

  acc.activeSkinSlot = slot;
  configStore.saveAccount(acc);
  return true;
});

ipcMain.handle('account:set-active-skin-slot', (_e, accountId, slot) => {
  const accounts = configStore.getAccounts();
  const acc = accounts.find((a) => a.id === accountId);
  if (!acc) return false;

  acc.activeSkinSlot = slot;
  configStore.saveAccount(acc);
  return true;
});

ipcMain.handle('account:save-cape', (_e, accountId, cape) => {
  const accounts = configStore.getAccounts();
  const acc = accounts.find((a) => a.id === accountId);
  if (!acc) return false;

  acc.cape = cape;
  configStore.saveAccount(acc);
  return true;
});

// IPC Handlers: Settings
ipcMain.handle('settings:get', () => configStore.getSettings());
ipcMain.handle('settings:save', (_e, settings) => configStore.saveSettings(settings));

// App Lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  // Gracefully stop all tunnels
  playitManager.stopAll();
  cloudflareManager.stopAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
