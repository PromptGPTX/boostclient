import React from 'react';
import { FolderOpen, HardDrive, FileText, Globe, Wrench, ExternalLink, Sparkles } from 'lucide-react';
import { ServerInstance } from '../../../types';

interface FilesTabProps {
  server: ServerInstance;
  onOpenFolder: (subfolder?: string) => Promise<void>;
}

export const FilesTab: React.FC<FilesTabProps> = ({ server, onOpenFolder }) => {
  const isPluginPlatform = ['paper', 'purpur', 'velocity', 'bungeecord'].includes(server.platform);
  const modOrPluginFolder = isPluginPlatform ? 'plugins' : 'mods';

  return (
    <div className="space-y-6">
      {/* Big Explorer Opener Hero */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-900/40 via-surface to-surface border border-blue-500/30 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/20">
          <FolderOpen className="w-8 h-8" />
        </div>

        <div className="max-w-md space-y-1">
          <h2 className="text-xl font-extrabold text-white">Direct File Manager Access</h2>
          <p className="text-xs text-gray-300">
            All server files (plugins, mods, server.jar, world saves, and configs) are stored directly on your computer.
            Click below to open the server folder in Windows File Explorer.
          </p>
        </div>

        <button
          onClick={() => onOpenFolder()}
          className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm flex items-center gap-2.5 transition shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <FolderOpen className="w-5 h-5" />
          <span>Open Server Folder in File Explorer</span>
          <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
        </button>

        <p className="text-[11px] text-gray-400 font-mono">
          Path: {server.path}
        </p>
      </div>

      {/* Quick Folder Shortcuts */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Quick Directory Shortcuts
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onOpenFolder(modOrPluginFolder)}
            className="p-4 rounded-xl bg-surface hover:bg-card border border-border hover:border-gray-500 transition text-left space-y-2 group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block group-hover:text-blue-400 transition capitalize">
                {modOrPluginFolder}
              </span>
              <span className="text-[11px] text-gray-400 block">
                Manage your .jar add-ons
              </span>
            </div>
          </button>

          <button
            onClick={() => onOpenFolder('world')}
            className="p-4 rounded-xl bg-surface hover:bg-card border border-border hover:border-gray-500 transition text-left space-y-2 group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block group-hover:text-emerald-400 transition">
                World Saves
              </span>
              <span className="text-[11px] text-gray-400 block">
                Backup or import custom maps
              </span>
            </div>
          </button>

          <button
            onClick={() => onOpenFolder('logs')}
            className="p-4 rounded-xl bg-surface hover:bg-card border border-border hover:border-gray-500 transition text-left space-y-2 group"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block group-hover:text-purple-400 transition">
                Server Logs
              </span>
              <span className="text-[11px] text-gray-400 block">
                View latest.log and crash reports
              </span>
            </div>
          </button>

          <button
            onClick={() => onOpenFolder()}
            className="p-4 rounded-xl bg-surface hover:bg-card border border-border hover:border-gray-500 transition text-left space-y-2 group"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block group-hover:text-amber-400 transition">
                Configs
              </span>
              <span className="text-[11px] text-gray-400 block">
                server.properties and options
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
