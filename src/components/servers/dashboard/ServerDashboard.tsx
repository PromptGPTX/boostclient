import React, { useState } from 'react';
import {
  ArrowLeft,
  Server,
  Terminal,
  FolderOpen,
  Sparkles,
  Wrench,
  Layers,
  Globe,
} from 'lucide-react';
import { ServerInstance, ServerMetrics, ServerPlatform } from '../../../types';
import { OverviewTab } from './OverviewTab';
import { FilesTab } from './FilesTab';
import { PluginsModsTab } from './PluginsModsTab';
import { SettingsTab } from './SettingsTab';
import { VersionTab } from './VersionTab';

export type ServerTab = 'overview' | 'files' | 'plugins-mods' | 'settings' | 'version';

interface ServerDashboardProps {
  server: ServerInstance;
  onBack: () => void;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
  onRestart: () => Promise<void>;
  onKill: () => Promise<void>;
  onSendCommand: (cmd: string) => Promise<void>;
  onOpenFolder: (subfolder?: string) => Promise<void>;
  onTogglePlayit: (enable: boolean) => Promise<void>;
  onSaveServer: (server: ServerInstance) => Promise<void>;
  onSwitchVersion: (platform: ServerPlatform, version: string) => Promise<void>;
  onNavigateToStore: () => void;
  logs: string[];
  metrics: ServerMetrics | null;
}

export const ServerDashboard: React.FC<ServerDashboardProps> = ({
  server,
  onBack,
  onStart,
  onStop,
  onRestart,
  onKill,
  onSendCommand,
  onOpenFolder,
  onTogglePlayit,
  onSaveServer,
  onSwitchVersion,
  onNavigateToStore,
  logs,
  metrics,
}) => {
  const [currentTab, setCurrentTab] = useState<ServerTab>('overview');

  const isPluginPlatform = ['paper', 'purpur', 'velocity', 'bungeecord'].includes(server.platform);
  const pluginOrModLabel = isPluginPlatform ? 'Plugins' : 'Mods';

  const tabs: { id: ServerTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: Terminal },
    { id: 'files', label: 'Files', icon: FolderOpen },
    { id: 'plugins-mods', label: pluginOrModLabel, icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Wrench },
    { id: 'version', label: 'Version', icon: Layers },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      {/* Top Navigation Bar (Aternos Style) */}
      <div className="p-4 bg-surface border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-card hover:bg-card/80 border border-border text-gray-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Servers</span>
          </button>

          <div className="h-5 w-px bg-border" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold text-white">{server.name}</h1>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-card border border-border text-cyan-300 capitalize">
                  {server.platform}
                </span>
              </div>
              <span className="text-[11px] text-gray-400 font-mono">
                Port {server.port} • {server.maxRam}GB RAM
              </span>
            </div>
          </div>
        </div>

        {/* Tab Buttons (Aternos Navigation) */}
        <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-surface'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {currentTab === 'overview' && (
          <OverviewTab
            server={server}
            onStart={onStart}
            onStop={onStop}
            onRestart={onRestart}
            onKill={onKill}
            onSendCommand={onSendCommand}
            onTogglePlayit={onTogglePlayit}
            logs={logs}
            metrics={metrics}
          />
        )}

        {currentTab === 'files' && (
          <FilesTab server={server} onOpenFolder={onOpenFolder} />
        )}

        {currentTab === 'plugins-mods' && (
          <PluginsModsTab server={server} onNavigateToStore={onNavigateToStore} />
        )}

        {currentTab === 'settings' && (
          <SettingsTab server={server} onSaveServer={onSaveServer} />
        )}

        {currentTab === 'version' && (
          <VersionTab server={server} onSwitchVersion={onSwitchVersion} />
        )}
      </div>
    </div>
  );
};
