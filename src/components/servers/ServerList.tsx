import React, { useState } from 'react';
import { Plus, Server, Play, Square, Trash2, Globe, Cpu, ChevronRight, X, Zap } from 'lucide-react';
import { ServerInstance, ServerPlatform } from '../../types';

interface ServerListProps {
  servers: ServerInstance[];
  onSelectServer: (server: ServerInstance) => void;
  onCreateServer: (data: {
    name: string;
    platform: ServerPlatform;
    version: string;
    port: number;
    ram: number;
  }) => Promise<void>;
  onDeleteServer: (id: string) => Promise<void>;
  onStartServer: (id: string) => Promise<void>;
  onStopServer: (id: string) => Promise<void>;
}

export const ServerList: React.FC<ServerListProps> = ({
  servers,
  onSelectServer,
  onCreateServer,
  onDeleteServer,
  onStartServer,
  onStopServer,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('My Minecraft Server');
  const [platform, setPlatform] = useState<ServerPlatform>('paper');
  const [version, setVersion] = useState('1.20.4');
  const [port, setPort] = useState(25565);
  const [ram, setRam] = useState(4);
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await onCreateServer({
        name: name.trim() || 'Minecraft Server',
        platform,
        version,
        port,
        ram,
      });
      setModalOpen(false);
      setName('My Minecraft Server');
    } catch (err) {
      console.error('Failed to create server:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Minecraft Servers</h1>
          <p className="text-xs text-gray-400 mt-1">
            Host unlimited servers on your PC with auto-configured Playit.gg tunnels. No port-forwarding needed!
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Create Server</span>
        </button>
      </div>

      {/* Server Grid */}
      {servers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-surface border border-border rounded-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Server className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-white">No servers created yet</h3>
            <p className="text-xs text-gray-400 mt-1">
              Host a Paper, Purpur, or Fabric server right from your PC with 1-click. Friends join using a free Playit tunnel address.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Server</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servers.map((server) => {
            const isOnline = server.status === 'online';
            const isStarting = server.status === 'starting';

            return (
              <div
                key={server.id}
                onClick={() => onSelectServer(server)}
                className="p-5 rounded-2xl bg-surface border border-border hover:border-blue-500/80 transition-all cursor-pointer relative group flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-blue-400">
                      <Server className="w-6 h-6" />
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 uppercase ${
                          isOnline
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isStarting
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                            : 'bg-card text-gray-400 border border-border'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOnline ? 'bg-emerald-500' : isStarting ? 'bg-amber-400' : 'bg-gray-500'
                          }`}
                        />
                        <span>{server.status}</span>
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition truncate">
                    {server.name}
                  </h3>

                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-card text-gray-300 border border-border capitalize">
                      {server.platform} {server.version}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-card text-purple-300 border border-border">
                      {server.maxRam} GB RAM
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-card text-cyan-300 border border-border font-mono">
                      :{server.port}
                    </span>
                  </div>

                  {/* Public Tunnel info */}
                  {server.playitTunnel?.publicAddress && (
                    <div className="mt-3 p-2 rounded-lg bg-card border border-border flex items-center gap-1.5 text-xs text-cyan-400 font-mono truncate">
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{server.playitTunnel.publicAddress}</span>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete server "${server.name}"? This cannot be undone.`)) {
                        onDeleteServer(server.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-card hover:bg-red-950/40 text-gray-400 hover:text-red-400 border border-border transition"
                    title="Delete Server"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    {isOnline ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStopServer(server.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1 transition"
                      >
                        <Square className="w-3 h-3 fill-current" />
                        <span>Stop</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartServer(server.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition shadow-md shadow-emerald-600/20"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Start</span>
                      </button>
                    )}

                    <div className="p-1.5 text-gray-400 group-hover:text-white transition">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Server Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">Create Minecraft Server</h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-card transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Server Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Friends SMP"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as ServerPlatform)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-xs text-white focus:outline-none capitalize cursor-pointer"
                  >
                    <option value="paper">PaperMC (Plugins)</option>
                    <option value="purpur">Purpur (Custom Paper)</option>
                    <option value="fabric">Fabric (Mods)</option>
                    <option value="vanilla">Vanilla</option>
                    <option value="velocity">Velocity (Proxy)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Version</label>
                  <select
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="1.21.1">1.21.1</option>
                    <option value="1.20.4">1.20.4</option>
                    <option value="1.20.1">1.20.1</option>
                    <option value="1.19.4">1.19.4</option>
                    <option value="1.18.2">1.18.2</option>
                    <option value="1.16.5">1.16.5</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Server Port</label>
                  <input
                    type="number"
                    min={1024}
                    max={65535}
                    value={port}
                    onChange={(e) => setPort(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">RAM (GB)</label>
                  <input
                    type="number"
                    min={1}
                    max={32}
                    value={ram}
                    onChange={(e) => setRam(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl text-[11px] text-blue-300">
                Playit.gg tunnel will automatically start with the server, giving your friends an instant public link to join for free!
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-card text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>{creating ? 'Creating...' : 'Create Server'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
