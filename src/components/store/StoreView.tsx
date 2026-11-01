import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Filter,
  CheckCircle,
  ExternalLink,
  ShoppingBag,
  Layers,
  Sparkles,
  Server,
  AlertCircle,
} from 'lucide-react';
import { StoreItem, GameProfile, ServerInstance } from '../../types';

interface StoreViewProps {
  profiles: GameProfile[];
  activeProfile: GameProfile | null;
  servers: ServerInstance[];
}

export const StoreView: React.FC<StoreViewProps> = ({ profiles, activeProfile, servers }) => {
  const [projectType, setProjectType] = useState<'mod' | 'modpack' | 'resourcepack' | 'shader'>('mod');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<{
    type: 'profile' | 'server';
    id: string;
  }>({
    type: 'profile',
    id: activeProfile?.id || '',
  });
  const [installStatus, setInstallStatus] = useState<Record<string, 'installing' | 'installed' | 'error'>>({});

  useEffect(() => {
    if (activeProfile && (!selectedTarget.id || selectedTarget.type === 'profile')) {
      setSelectedTarget({ type: 'profile', id: activeProfile.id });
    }
  }, [activeProfile]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const activeProf = profiles.find((p) => p.id === selectedTarget.id);
      const res = await window.electronAPI.searchStore({
        query: searchQuery,
        projectType,
        gameVersion: activeProf?.gameVersion,
        loader: activeProf?.loaderType,
        limit: 24,
      });
      setItems(res.hits || []);
    } catch (err) {
      console.error('Failed to search store:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(timer);
  }, [projectType, searchQuery, selectedTarget]);

  const handleInstall = async (item: StoreItem) => {
    setInstallStatus((prev) => ({ ...prev, [item.id]: 'installing' }));
    try {
      const activeProf = profiles.find((p) => p.id === selectedTarget.id);
      const res = await window.electronAPI.installStoreItem(item, {
        type: selectedTarget.type,
        id: selectedTarget.id,
        gameVersion: activeProf?.gameVersion,
        loader: activeProf?.loaderType,
      });

      if (res.success) {
        setInstallStatus((prev) => ({ ...prev, [item.id]: 'installed' }));
      } else {
        setInstallStatus((prev) => ({ ...prev, [item.id]: 'error' }));
      }
    } catch (err) {
      console.error('Install failed:', err);
      setInstallStatus((prev) => ({ ...prev, [item.id]: 'error' }));
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden p-6 space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Content Store</h1>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            1-Click download mods, modpacks, resource packs, and shaders directly into your game or server.
          </p>
        </div>

        {/* Target Destination Selector */}
        <div className="flex items-center gap-2 bg-surface p-1.5 rounded-xl border border-border">
          <span className="text-xs font-semibold text-gray-400 pl-2">Install Target:</span>
          <select
            value={`${selectedTarget.type}:${selectedTarget.id}`}
            onChange={(e) => {
              const [type, id] = e.target.value.split(':');
              setSelectedTarget({ type: type as any, id });
            }}
            className="px-3 py-1.5 rounded-lg bg-card border border-border text-xs text-white focus:outline-none cursor-pointer"
          >
            <optgroup label="Game Profiles">
              {profiles.map((p) => (
                <option key={p.id} value={`profile:${p.id}`}>
                  Profile: {p.name} ({p.gameVersion})
                </option>
              ))}
            </optgroup>
            {servers.length > 0 && (
              <optgroup label="Minecraft Servers">
                {servers.map((s) => (
                  <option key={s.id} value={`server:${s.id}`}>
                    Server: {s.name} ({s.platform})
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      {/* Categories Tabs & Search Input */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-surface p-3 rounded-2xl border border-border">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'mod', label: 'Mods' },
            { id: 'modpack', label: 'Modpacks' },
            { id: 'resourcepack', label: 'Resource Packs' },
            { id: 'shader', label: 'Shader Packs' },
          ].map((tab) => {
            const isActive = projectType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setProjectType(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-card'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${projectType}s (e.g. Sodium, Iris, Lithium)...`}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-card border border-border text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Store Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-400 font-medium">Searching Modrinth repository...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-2">
            <ShoppingBag className="w-12 h-12 text-gray-600" />
            <h3 className="text-sm font-bold text-white">No items found</h3>
            <p className="text-xs text-gray-400 max-w-sm">
              Try searching for a different keyword or checking your Minecraft version filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const status = installStatus[item.id];
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-surface border border-border hover:border-gray-500 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start gap-3">
                      {item.iconUrl ? (
                        <img
                          src={item.iconUrl}
                          alt={item.title}
                          className="w-12 h-12 rounded-xl bg-card border border-border object-cover shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                          <Sparkles className="w-6 h-6" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition truncate">
                          {item.title}
                        </h4>
                        <span className="text-[11px] text-gray-400 block truncate">
                          by {item.author}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-300 mt-2.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mt-3">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-card text-gray-400 border border-border">
                        {(item.downloads || 0).toLocaleString()} downloads
                      </span>
                      {item.loaders.slice(0, 2).map((l) => (
                        <span
                          key={l}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-card text-blue-300 border border-border capitalize"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 1-Click Install Button */}
                  <div className="pt-3 mt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-gray-500 capitalize">{item.projectType}</span>

                    <button
                      onClick={() => handleInstall(item)}
                      disabled={status === 'installing'}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                        status === 'installed'
                          ? 'bg-emerald-600 text-white'
                          : status === 'error'
                          ? 'bg-red-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
                      }`}
                    >
                      {status === 'installed' ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Installed</span>
                        </>
                      ) : status === 'installing' ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Installing...</span>
                        </>
                      ) : status === 'error' ? (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Retry</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>1-Click Install</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
