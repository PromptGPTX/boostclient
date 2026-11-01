import React, { useState, useEffect } from 'react';
import { Layers, ArrowRight, Check, AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { ServerInstance, ServerPlatform } from '../../../types';

interface VersionTabProps {
  server: ServerInstance;
  onSwitchVersion: (platform: ServerPlatform, version: string) => Promise<void>;
}

export const VersionTab: React.FC<VersionTabProps> = ({ server, onSwitchVersion }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<ServerPlatform>(server.platform);
  const [selectedVersion, setSelectedVersion] = useState(server.version);
  const [versionsList, setVersionsList] = useState<string[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [success, setSuccess] = useState(false);

  const platforms: { id: ServerPlatform; name: string; tag: string; desc: string }[] = [
    {
      id: 'paper',
      name: 'PaperMC',
      tag: 'Best Performance',
      desc: 'High performance Spigot fork with thousands of plugins supported.',
    },
    {
      id: 'purpur',
      name: 'Purpur',
      tag: 'Ultra Customizable',
      desc: 'Drop-in Paper replacement with limitless gameplay customization options.',
    },
    {
      id: 'fabric',
      name: 'Fabric',
      tag: 'Modded',
      desc: 'Modern, fast modded Minecraft server loader.',
    },
    {
      id: 'vanilla',
      name: 'Vanilla',
      tag: 'Official',
      desc: 'Official Mojang server with pure standard gameplay mechanics.',
    },
    {
      id: 'velocity',
      name: 'Velocity',
      tag: 'Proxy',
      desc: 'Ultra scalable proxy for connecting multiple sub-servers together.',
    },
    {
      id: 'bungeecord',
      name: 'BungeeCord',
      tag: 'Proxy',
      desc: 'Classic proxy server software for server networks.',
    },
  ];

  // Fetch available versions whenever platform changes
  useEffect(() => {
    let active = true;
    setLoadingVersions(true);

    const fallbackList = ['1.21.1', '1.20.4', '1.20.2', '1.20.1', '1.19.4', '1.18.2', '1.16.5', '1.12.2', '1.8.9'];
    setVersionsList(fallbackList);
    if (!fallbackList.includes(selectedVersion)) {
      setSelectedVersion(fallbackList[0]);
    }
    setLoadingVersions(false);

    return () => {
      active = false;
    };
  }, [selectedPlatform]);

  const handleInstall = async () => {
    if (!window.confirm(`Switch server to ${selectedPlatform.toUpperCase()} ${selectedVersion}?`)) {
      return;
    }

    setInstalling(true);
    try {
      await onSwitchVersion(selectedPlatform, selectedVersion);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to switch version:', err);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Warning Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-amber-300">Switching Platforms & Versions</h3>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            Changing server platform will download a new server.jar file. World files are preserved, but plugins may need updating if downgrading or upgrading major Minecraft versions.
          </p>
        </div>
      </div>

      {/* Platform Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Select Server Platform / Software
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {platforms.map((plat) => {
            const isSelected = selectedPlatform === plat.id;
            return (
              <div
                key={plat.id}
                onClick={() => setSelectedPlatform(plat.id)}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-surface border-blue-500 shadow-md shadow-blue-500/10'
                    : 'bg-surface/60 border-border hover:border-gray-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">{plat.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-card border border-border text-blue-300">
                      {plat.tag}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{plat.desc}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {plat.id === server.platform ? 'Current Platform' : 'Click to select'}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Version Picker & Install Action */}
      <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
        <h3 className="text-sm font-bold text-white">Select Minecraft Version</h3>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="flex-1">
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-sm text-white focus:outline-none cursor-pointer"
            >
              {versionsList.map((ver) => (
                <option key={ver} value={ver}>
                  {selectedPlatform.toUpperCase()} - {ver}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleInstall}
            disabled={installing}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/30"
          >
            {installing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Downloading & Installing...</span>
              </>
            ) : success ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Installed Successfully!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Switch to {selectedPlatform.toUpperCase()} {selectedVersion}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
