import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { PlayView } from './components/play/PlayView';
import { ProfileList } from './components/profiles/ProfileList';
import { ProfileModal } from './components/profiles/ProfileModal';
import { ServerList } from './components/servers/ServerList';
import { ServerDashboard } from './components/servers/dashboard/ServerDashboard';
import { SettingsView } from './components/settings/SettingsView';
import { AccountModal } from './components/auth/AccountModal';
import { AccountView } from './components/account/AccountView';
import { WardrobeModal } from './components/account/WardrobeModal';
import {
  GameProfile,
  ServerInstance,
  Account,
  AppSettings,
  ServerMetrics,
  ServerPlatform,
} from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('play');
  const [profiles, setProfiles] = useState<GameProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<GameProfile | null>(null);
  const [servers, setServers] = useState<ServerInstance[]>([]);
  const [activeServerId, setActiveServerId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'aternos-dark',
    defaultRam: 4,
    performanceOptimization: true,
    enableDiscordRPC: false,
    checkUpdates: true,
  });

  // Modals
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [wardrobeModalOpen, setWardrobeModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<GameProfile | null>(null);

  // Versions from Mojang
  const [mojangVersions, setMojangVersions] = useState<{ id: string; type: 'release' | 'snapshot' }[]>([]);

  // Launcher state
  const [gameStatus, setGameStatus] = useState<'idle' | 'downloading' | 'launching' | 'running' | 'error'>('idle');
  const [statusProgress, setStatusProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [gameLogs, setGameLogs] = useState<string[]>([]);

  // Server state
  const [serverLogs, setServerLogs] = useState<Record<string, string[]>>({});
  const [serverMetrics, setServerMetrics] = useState<Record<string, ServerMetrics>>({});

  // 1. Initial Data Fetching
  const loadInitialData = async () => {
    try {
      if (!window.electronAPI) return;

      const [profs, servs, accs, activeAcc, sett, vers] = await Promise.all([
        window.electronAPI.getProfiles(),
        window.electronAPI.getServers(),
        window.electronAPI.getAccounts(),
        window.electronAPI.getActiveAccount(),
        window.electronAPI.getSettings(),
        window.electronAPI.getMojangVersions(),
      ]);

      setProfiles(profs || []);
      setActiveProfile(profs?.[0] || null);
      setServers(servs || []);
      setAccounts(accs || []);
      setActiveAccount(activeAcc || accs?.[0] || null);
      if (sett) {
        setSettings(sett);
        document.documentElement.setAttribute('data-theme', sett.theme || 'aternos-dark');
      }
      setMojangVersions(vers || []);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // 2. Set up IPC Event Listeners
  useEffect(() => {
    if (!window.electronAPI) return;

    // Server log listener
    const unsubServerLog = window.electronAPI.onServerLog(({ serverId, line }) => {
      setServerLogs((prev) => {
        const existing = prev[serverId] || [];
        const updated = [...existing, line];
        return { ...prev, [serverId]: updated.slice(-500) };
      });
    });

    // Server status listener
    const unsubServerStatus = window.electronAPI.onServerStatus(({ serverId, status, playitTunnel }) => {
      setServers((prev) =>
        prev.map((s) => {
          if (s.id === serverId) {
            return {
              ...s,
              status,
              playitTunnel: playitTunnel || s.playitTunnel,
            };
          }
          return s;
        })
      );
    });

    // Server metrics listener
    const unsubServerMetrics = window.electronAPI.onServerMetrics(({ serverId, metrics }) => {
      setServerMetrics((prev) => ({ ...prev, [serverId]: metrics }));
    });

    // Launcher log listener
    const unsubLauncherLog = window.electronAPI.onLauncherLog(({ line }) => {
      setGameLogs((prev) => [...prev.slice(-300), line]);
    });

    // Launcher status listener
    const unsubLauncherStatus = window.electronAPI.onLauncherStatus(({ status, progress, text }) => {
      setGameStatus(status);
      if (progress !== undefined) setStatusProgress(progress);
      if (text) setStatusText(text);
    });

    return () => {
      unsubServerLog();
      unsubServerStatus();
      unsubServerMetrics();
      unsubLauncherLog();
      unsubLauncherStatus();
    };
  }, []);

  // Handlers: Profiles
  const handleSelectProfile = (profile: GameProfile) => {
    setActiveProfile(profile);
  };

  const handleSaveProfile = async (profile: GameProfile) => {
    const saved = await window.electronAPI.saveProfile(profile);
    const updated = await window.electronAPI.getProfiles();
    setProfiles(updated);
    if (activeProfile?.id === saved.id || !activeProfile) {
      setActiveProfile(saved);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    await window.electronAPI.deleteProfile(id);
    const updated = await window.electronAPI.getProfiles();
    setProfiles(updated);
    if (activeProfile?.id === id) {
      setActiveProfile(updated[0] || null);
    }
  };

  // Handlers: Launcher
  const handleLaunchGame = async (profileId: string) => {
    setGameLogs([]);
    await window.electronAPI.launchGame(profileId);
  };

  const handleKillGame = async (profileId: string) => {
    await window.electronAPI.killGame(profileId);
  };

  // Handlers: Servers
  const handleCreateServer = async (data: {
    name: string;
    platform: ServerPlatform;
    version: string;
    port: number;
    ram: number;
  }) => {
    const created = await window.electronAPI.createServer(data);
    const updated = await window.electronAPI.getServers();
    setServers(updated);
    setActiveServerId(created.id);
  };

  const handleDeleteServer = async (id: string) => {
    await window.electronAPI.deleteServer(id);
    const updated = await window.electronAPI.getServers();
    setServers(updated);
    if (activeServerId === id) {
      setActiveServerId(null);
    }
  };

  const handleStartServer = async (id: string) => {
    await window.electronAPI.startServer(id);
  };

  const handleStopServer = async (id: string) => {
    await window.electronAPI.stopServer(id);
  };

  const handleRestartServer = async (id: string) => {
    await window.electronAPI.restartServer(id);
  };

  const handleKillServer = async (id: string) => {
    await window.electronAPI.killServer(id);
  };

  const handleSendServerCommand = async (id: string, cmd: string) => {
    await window.electronAPI.sendServerCommand(id, cmd);
  };

  const handleOpenServerFolder = async (id: string, subfolder?: string) => {
    await window.electronAPI.openServerFolder(id, subfolder);
  };

  const handleTogglePlayit = async (id: string, enable: boolean) => {
    await window.electronAPI.togglePlayitTunnel(id, enable);
  };

  const handleSaveServerInstance = async (updated: ServerInstance) => {
    setServers((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleSwitchServerVersion = async (
    id: string,
    platform: ServerPlatform,
    version: string
  ) => {
    await window.electronAPI.switchServerVersion(id, platform, version);
    const updated = await window.electronAPI.getServers();
    setServers(updated);
  };

  // Handlers: Auth
  const handleSelectAccount = async (id: string) => {
    await window.electronAPI.setActiveAccount(id);
    const accs = await window.electronAPI.getAccounts();
    const active = await window.electronAPI.getActiveAccount();
    setAccounts(accs);
    setActiveAccount(active);
  };

  const handleLoginOffline = async (username: string) => {
    const acc = await window.electronAPI.loginOffline(username);
    const accs = await window.electronAPI.getAccounts();
    setAccounts(accs);
    setActiveAccount(acc);
  };

  const handleStartMicrosoftLogin = async () => {
    await window.electronAPI.startMicrosoftLogin();
    const accs = await window.electronAPI.getAccounts();
    const active = await window.electronAPI.getActiveAccount();
    setAccounts(accs);
    setActiveAccount(active);
    setAccountModalOpen(false);
  };

  const handleRemoveAccount = async (id: string) => {
    await window.electronAPI.removeAccount(id);
    const accs = await window.electronAPI.getAccounts();
    const active = await window.electronAPI.getActiveAccount();
    setAccounts(accs);
    setActiveAccount(active);
  };

  // Handlers: Settings
  const handleSaveSettings = async (newSettings: Partial<AppSettings>) => {
    const saved = await window.electronAPI.saveSettings(newSettings);
    setSettings(saved);
  };

  const runningServerCount = servers.filter((s) => s.status === 'online').length;
  const currentActiveServer = servers.find((s) => s.id === activeServerId) || null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-gray-100 font-sans">
      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'servers') {
            setActiveServerId(null);
          }
        }}
        activeAccount={activeAccount}
        onOpenAccountModal={() => setAccountModalOpen(true)}
        runningServerCount={runningServerCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {currentTab === 'play' && (
          <PlayView
            profiles={profiles}
            activeProfile={activeProfile}
            onSelectProfile={(id) => {
              const p = profiles.find((item) => item.id === id);
              if (p) handleSelectProfile(p);
            }}
            onLaunchGame={handleLaunchGame}
            onKillGame={handleKillGame}
            gameStatus={gameStatus}
            statusProgress={statusProgress}
            statusText={statusText}
            gameLogs={gameLogs}
            runningServers={servers.filter((s) => s.status === 'online')}
            activeAccount={activeAccount}
            onOpenAccountModal={() => setAccountModalOpen(true)}
            onOpenWardrobeModal={() => setWardrobeModalOpen(true)}
          />
        )}

        {currentTab === 'profiles' && (
          <ProfileList
            profiles={profiles}
            activeProfileId={activeProfile?.id || null}
            onSelectProfile={(id) => {
              const p = profiles.find((item) => item.id === id);
              if (p) handleSelectProfile(p);
            }}
            onEditProfile={(p) => {
              setProfileToEdit(p);
              setProfileModalOpen(true);
            }}
            onDeleteProfile={handleDeleteProfile}
            onCreateProfile={() => {
              setProfileToEdit(null);
              setProfileModalOpen(true);
            }}
            onLaunchProfile={(id) => {
              setCurrentTab('play');
              handleLaunchGame(id);
            }}
          />
        )}

        {currentTab === 'account' && (
          <AccountView
            activeAccount={activeAccount}
            onOpenAccountModal={() => setAccountModalOpen(true)}
          />
        )}

        {currentTab === 'servers' && (
          currentActiveServer ? (
            <ServerDashboard
              server={currentActiveServer}
              onBack={() => setActiveServerId(null)}
              onStart={() => handleStartServer(currentActiveServer.id)}
              onStop={() => handleStopServer(currentActiveServer.id)}
              onRestart={() => handleRestartServer(currentActiveServer.id)}
              onKill={() => handleKillServer(currentActiveServer.id)}
              onSendCommand={(cmd) => handleSendServerCommand(currentActiveServer.id, cmd)}
              onOpenFolder={(subfolder) => handleOpenServerFolder(currentActiveServer.id, subfolder)}
              onTogglePlayit={(enable) => handleTogglePlayit(currentActiveServer.id, enable)}
              onSaveServer={handleSaveServerInstance}
              onSwitchVersion={(plat, ver) => handleSwitchServerVersion(currentActiveServer.id, plat, ver)}
              onNavigateToStore={() => setCurrentTab('profiles')}
              logs={serverLogs[currentActiveServer.id] || []}
              metrics={serverMetrics[currentActiveServer.id] || null}
            />
          ) : (
            <ServerList
              servers={servers}
              onSelectServer={(s) => setActiveServerId(s.id)}
              onCreateServer={handleCreateServer}
              onDeleteServer={handleDeleteServer}
              onStartServer={handleStartServer}
              onStopServer={handleStopServer}
            />
          )
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
          />
        )}
      </main>

      {/* Account Modal */}
      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        accounts={accounts}
        activeAccountId={activeAccount?.id || null}
        onSelectAccount={handleSelectAccount}
        onLoginOffline={handleLoginOffline}
        onStartMicrosoftLogin={handleStartMicrosoftLogin}
        onRemoveAccount={handleRemoveAccount}
      />

      {/* Wardrobe Modal */}
      <WardrobeModal
        isOpen={wardrobeModalOpen}
        onClose={() => setWardrobeModalOpen(false)}
        activeAccount={activeAccount}
      />

      {/* Profile Create / Edit Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          setProfileToEdit(null);
        }}
        onSave={handleSaveProfile}
        initialProfile={profileToEdit}
        mojangVersions={mojangVersions}
      />
    </div>
  );
};
