import React, { useState, useEffect } from 'react';
import { Save, Wrench, Shield, Swords, Users, Cpu, Check, AlertCircle } from 'lucide-react';
import { ServerInstance, ServerProperties } from '../../../types';

interface SettingsTabProps {
  server: ServerInstance;
  onSaveServer: (server: ServerInstance) => Promise<void>;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ server, onSaveServer }) => {
  const [properties, setProperties] = useState<ServerProperties | null>(null);
  const [loading, setLoading] = useState(true);
  const [ram, setRam] = useState(server.maxRam || 4);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    window.electronAPI?.getServerProperties(server.id).then((props) => {
      setProperties(props);
      setLoading(false);
    });
  }, [server.id]);

  if (loading || !properties) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!properties) return;

    // 1. Save properties file
    await window.electronAPI.saveServerProperties(server.id, properties);

    // 2. Save server RAM
    const updatedServer: ServerInstance = {
      ...server,
      maxRam: ram,
      minRam: Math.max(1, Math.floor(ram / 2)),
    };
    await onSaveServer(updatedServer);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const updateProp = (key: keyof ServerProperties, value: any) => {
    setProperties((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Server Settings & Properties</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure server rules, cracked mode, gamemode, and RAM allocation. Restart server to apply.
          </p>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-blue-600/30"
        >
          {saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Saved Successfully!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* RAM Allocation */}
      <div className="p-5 rounded-2xl bg-surface border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Server RAM Allocation</h3>
          </div>
          <span className="text-xs font-mono font-bold text-white px-2.5 py-1 bg-card rounded-lg border border-border">
            {ram} GB Allocated
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={16}
          step={1}
          value={ram}
          onChange={(e) => setRam(parseInt(e.target.value, 10))}
          className="w-full accent-blue-600 h-2 bg-card rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-gray-400 font-mono">
          <span>1 GB</span>
          <span>4 GB (Default)</span>
          <span>8 GB</span>
          <span>16 GB</span>
        </div>
      </div>

      {/* Visual server.properties Form (Aternos Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MOTD */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-surface border border-border space-y-2">
          <label className="text-xs font-bold text-white uppercase tracking-wider block">
            Server MOTD (Description)
          </label>
          <input
            type="text"
            value={properties.motd || ''}
            onChange={(e) => updateProp('motd', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-sm text-white font-mono focus:outline-none focus:border-blue-500"
          />
          <p className="text-[11px] text-gray-400">
            Supports Minecraft color formatting codes (e.g. §a, §b, §c, §l).
          </p>
        </div>

        {/* Online Mode / Cracked */}
        <div className="p-5 rounded-2xl bg-surface border border-border flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-white block">Cracked / Offline Mode</span>
            <span className="text-xs text-gray-400 block mt-0.5">
              Allows players without official accounts to join
            </span>
          </div>
          <button
            type="button"
            onClick={() => updateProp('online-mode', !properties['online-mode'])}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              !properties['online-mode'] ? 'bg-emerald-600' : 'bg-card border border-border'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                !properties['online-mode'] ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* PvP */}
        <div className="p-5 rounded-2xl bg-surface border border-border flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-white block">PvP (Player vs Player)</span>
            <span className="text-xs text-gray-400 block mt-0.5">
              Allow players to attack each other
            </span>
          </div>
          <button
            type="button"
            onClick={() => updateProp('pvp', !properties.pvp)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              properties.pvp ? 'bg-blue-600' : 'bg-card border border-border'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                properties.pvp ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Gamemode */}
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-2">
          <label className="text-xs font-bold text-white uppercase tracking-wider block">
            Default Gamemode
          </label>
          <select
            value={properties.gamemode || 'survival'}
            onChange={(e) => updateProp('gamemode', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-sm text-white focus:outline-none capitalize cursor-pointer"
          >
            <option value="survival">Survival</option>
            <option value="creative">Creative</option>
            <option value="adventure">Adventure</option>
            <option value="spectator">Spectator</option>
          </select>
        </div>

        {/* Difficulty */}
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-2">
          <label className="text-xs font-bold text-white uppercase tracking-wider block">
            Difficulty
          </label>
          <select
            value={properties.difficulty || 'normal'}
            onChange={(e) => updateProp('difficulty', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-sm text-white focus:outline-none capitalize cursor-pointer"
          >
            <option value="peaceful">Peaceful</option>
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Max Players */}
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-2">
          <label className="text-xs font-bold text-white uppercase tracking-wider block">
            Max Players
          </label>
          <input
            type="number"
            min={1}
            max={500}
            value={properties['max-players'] || 20}
            onChange={(e) => updateProp('max-players', parseInt(e.target.value, 10))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-sm text-white focus:outline-none"
          />
        </div>

        {/* Server Port */}
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-2">
          <label className="text-xs font-bold text-white uppercase tracking-wider block">
            Server Port
          </label>
          <input
            type="number"
            min={1024}
            max={65535}
            value={properties['server-port'] || 25565}
            onChange={(e) => updateProp('server-port', parseInt(e.target.value, 10))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-sm text-white focus:outline-none"
          />
        </div>

        {/* Command Blocks */}
        <div className="p-5 rounded-2xl bg-surface border border-border flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-white block">Command Blocks</span>
            <span className="text-xs text-gray-400 block mt-0.5">
              Enable execution of command blocks
            </span>
          </div>
          <button
            type="button"
            onClick={() => updateProp('enable-command-block', !properties['enable-command-block'])}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              properties['enable-command-block'] ? 'bg-blue-600' : 'bg-card border border-border'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                properties['enable-command-block'] ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Whitelist */}
        <div className="p-5 rounded-2xl bg-surface border border-border flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-white block">Whitelist</span>
            <span className="text-xs text-gray-400 block mt-0.5">
              Only allow approved players on the whitelist
            </span>
          </div>
          <button
            type="button"
            onClick={() => updateProp('white-list', !properties['white-list'])}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              properties['white-list'] ? 'bg-blue-600' : 'bg-card border border-border'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                properties['white-list'] ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </form>
  );
};
