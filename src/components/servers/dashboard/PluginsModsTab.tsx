import React, { useState, useEffect } from 'react';
import { Sparkles, Trash2, ToggleLeft, ToggleRight, Plus, RefreshCw, ShoppingBag } from 'lucide-react';
import { ServerInstance, InstalledItem } from '../../../types';

interface PluginsModsTabProps {
  server: ServerInstance;
  onNavigateToStore: () => void;
}

export const PluginsModsTab: React.FC<PluginsModsTabProps> = ({ server, onNavigateToStore }) => {
  const [items, setItems] = useState<InstalledItem[]>([]);
  const [loading, setLoading] = useState(true);

  const isPluginPlatform = ['paper', 'purpur', 'velocity', 'bungeecord'].includes(server.platform);
  const typeLabel = isPluginPlatform ? 'Plugin' : 'Mod';

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await window.electronAPI.getServerPluginsMods(server.id);
      setItems(res || []);
    } catch (err) {
      console.error('Failed to load plugins/mods:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [server.id]);

  const handleToggle = async (item: InstalledItem) => {
    try {
      await window.electronAPI.toggleServerPluginMod(server.id, item.filename, !item.enabled);
      await loadItems();
    } catch (err) {
      console.error('Failed to toggle:', err);
    }
  };

  const handleDelete = async (item: InstalledItem) => {
    if (!window.confirm(`Are you sure you want to delete ${item.filename}?`)) return;
    try {
      await window.electronAPI.deleteServerPluginMod(server.id, item.filename);
      await loadItems();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">
            {typeLabel}s Manager ({items.length})
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Enable or disable {typeLabel.toLowerCase()}s without deleting them. Restart server to apply changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadItems}
            className="p-2 rounded-xl bg-surface hover:bg-card border border-border text-gray-400 hover:text-white transition"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onNavigateToStore}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-blue-600/30"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Install More from Store</span>
          </button>
        </div>
      </div>

      {/* Item List */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
            <Sparkles className="w-10 h-10 text-gray-600" />
            <div>
              <h3 className="text-sm font-bold text-white">No {typeLabel}s installed yet</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Enhance your server with plugins or mods from the Content Store, or drop .jar files directly into the server folder!
              </p>
            </div>
            <button
              onClick={onNavigateToStore}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Browse {typeLabel}s</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div
                key={item.filename}
                className={`p-4 flex items-center justify-between transition ${
                  item.enabled ? 'bg-surface hover:bg-card/40' : 'bg-surface/40 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      item.enabled
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'bg-card text-gray-500 border border-border'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">{item.name}</span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {formatFileSize(item.size)} • {item.filename}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(item)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white"
                  >
                    {item.enabled ? (
                      <>
                        <ToggleRight className="w-6 h-6 text-emerald-400" />
                        <span className="text-emerald-400">Enabled</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-6 h-6 text-gray-500" />
                        <span className="text-gray-500">Disabled</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(item)}
                    className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-950/30 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
