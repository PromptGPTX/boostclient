import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  RotateCw,
  Skull,
  Copy,
  Check,
  Globe,
  Wifi,
  ExternalLink,
  Cpu,
  HardDrive,
  Users,
  Clock,
  Terminal,
  Send,
  Zap,
} from 'lucide-react';
import { ServerInstance, ServerMetrics } from '../../../types';

interface OverviewTabProps {
  server: ServerInstance;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
  onRestart: () => Promise<void>;
  onKill: () => Promise<void>;
  onSendCommand: (cmd: string) => Promise<void>;
  onTogglePlayit: (enable: boolean) => Promise<void>;
  logs: string[];
  metrics: ServerMetrics | null;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  server,
  onStart,
  onStop,
  onRestart,
  onKill,
  onSendCommand,
  onTogglePlayit,
  logs,
  metrics,
}) => {
  const [commandInput, setCommandInput] = useState('');
  const [copiedLocal, setCopiedLocal] = useState(false);
  const [copiedPublic, setCopiedPublic] = useState(false);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    consoleBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    onSendCommand(commandInput.trim());
    setCommandInput('');
  };

  const copyLocalIp = () => {
    navigator.clipboard.writeText(`localhost:${server.port}`);
    setCopiedLocal(true);
    setTimeout(() => setCopiedLocal(false), 2000);
  };

  const copyPublicIp = () => {
    if (server.playitTunnel?.publicAddress) {
      navigator.clipboard.writeText(server.playitTunnel.publicAddress);
      setCopiedPublic(true);
      setTimeout(() => setCopiedPublic(false), 2000);
    }
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return '0m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const isOnline = server.status === 'online';
  const isStarting = server.status === 'starting';
  const isStopping = server.status === 'stopping';

  return (
    <div className="space-y-6">
      {/* Top Action & Status Bar (Aternos Style) */}
      <div className="p-5 rounded-2xl bg-surface border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <div
            className={`w-4 h-4 rounded-full ${
              isOnline
                ? 'bg-emerald-500 animate-pulse'
                : isStarting
                ? 'bg-amber-500 animate-spin'
                : isStopping
                ? 'bg-red-400 animate-pulse'
                : 'bg-gray-500'
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-white uppercase tracking-wider">
                {server.status}
              </span>
              <span className="text-xs text-gray-400 capitalize">
                • {server.platform} {server.version}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium">
              {isOnline
                ? 'Server is running and listening for connections'
                : isStarting
                ? 'Loading world and preparing spawn area...'
                : isStopping
                ? 'Saving chunks and shutting down...'
                : 'Server is currently offline'}
            </p>
          </div>
        </div>

        {/* Big Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {server.status === 'offline' ? (
            <button
              onClick={onStart}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/30"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START SERVER</span>
            </button>
          ) : (
            <>
              <button
                onClick={onStop}
                disabled={isStopping}
                className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-red-600/30"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>STOP</span>
              </button>
              <button
                onClick={onRestart}
                disabled={isStopping || isStarting}
                className="px-4 py-2.5 rounded-xl bg-card hover:bg-card/80 border border-border text-gray-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                title="Restart Server"
              >
                <RotateCw className="w-4 h-4" />
                <span>Restart</span>
              </button>
              <button
                onClick={onKill}
                className="px-3 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-400 hover:text-red-300 font-bold text-xs flex items-center justify-center transition"
                title="Force Kill (Emergency)"
              >
                <Skull className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Connection IP Cards (Localhost & Playit.gg) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Localhost IP Card (for the host) */}
        <div className="p-4 rounded-2xl bg-surface border border-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Host Local Address (For You)
              </span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
              LAN / Localhost
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
            <span className="font-mono text-sm font-bold text-white select-all">
              localhost:{server.port}
            </span>
            <button
              onClick={copyLocalIp}
              className="p-1.5 rounded-lg bg-surface hover:bg-surface/80 text-gray-300 hover:text-white border border-border transition flex items-center gap-1.5 text-xs font-semibold"
            >
              {copiedLocal ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy IP</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-gray-400">
            Use this address inside your Minecraft Multiplayer screen on this PC.
          </p>
        </div>

        {/* Playit.gg Public IP Card (for friends worldwide) */}
        <div className="p-4 rounded-2xl bg-surface border border-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Shareable Public IP (For Friends)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  server.playitTunnel?.status === 'connected'
                    ? 'bg-emerald-500'
                    : server.playitTunnel?.status === 'starting'
                    ? 'bg-amber-500 animate-ping'
                    : 'bg-gray-500'
                }`}
              />
              <span className="text-[10px] font-bold text-gray-300 uppercase">
                Playit {server.playitTunnel?.status || 'Idle'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
            {server.playitTunnel?.publicAddress ? (
              <span className="font-mono text-sm font-bold text-cyan-300 select-all truncate">
                {server.playitTunnel.publicAddress}
              </span>
            ) : server.playitTunnel?.claimUrl ? (
              <button
                onClick={() => window.electronAPI.openUrl(server.playitTunnel!.claimUrl!)}
                className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1.5"
              >
                <span>Click to link Playit Account</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-xs text-gray-400 italic">
                {isOnline ? 'Resolving public address...' : 'Start server to generate public IP'}
              </span>
            )}

            {server.playitTunnel?.publicAddress && (
              <button
                onClick={copyPublicIp}
                className="p-1.5 rounded-lg bg-surface hover:bg-surface/80 text-gray-300 hover:text-white border border-border transition flex items-center gap-1.5 text-xs font-semibold shrink-0 ml-2"
              >
                {copiedPublic ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy IP</span>
                  </>
                )}
              </button>
            )}
          </div>
          <p className="text-[11px] text-gray-400">
            Zero port-forwarding required. Send this link to friends anywhere in the world!
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      {isOnline && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-surface border border-border flex items-center gap-3">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase block">CPU Usage</span>
              <span className="text-sm font-extrabold text-white">{metrics?.cpu || 0}%</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-border flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-purple-400" />
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase block">RAM Usage</span>
              <span className="text-sm font-extrabold text-white">
                {metrics?.memoryMb || 0} MB / {server.maxRam * 1024} MB
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-border flex items-center gap-3">
            <Users className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Players</span>
              <span className="text-sm font-extrabold text-white">
                {metrics?.onlinePlayers?.length || 0} / {metrics?.maxPlayers || 20}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-border flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Uptime</span>
              <span className="text-sm font-extrabold text-white">
                {formatUptime(metrics?.uptimeSeconds)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Server Console (Aternos Style) */}
      <div className="rounded-2xl bg-surface border border-border overflow-hidden shadow-xl flex flex-col">
        <div className="p-3.5 bg-card border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Server Terminal & Logs
            </span>
          </div>
          <span className="text-[11px] text-gray-400 font-mono">
            {logs.length} lines captured
          </span>
        </div>

        {/* Log Viewer */}
        <div className="p-4 bg-black/90 min-h-[280px] max-h-[360px] overflow-y-auto font-mono text-xs text-gray-300 space-y-1 select-text">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500 italic">
              <span>Server console is quiet. Start the server to view live outputs.</span>
            </div>
          ) : (
            logs.map((log, index) => {
              // Basic color highlights
              const isError = log.includes('ERROR') || log.includes('Exception');
              const isWarn = log.includes('WARN');
              const isBoost = log.includes('[BoostClient]');
              return (
                <div
                  key={index}
                  className={`leading-relaxed break-words ${
                    isError
                      ? 'text-red-400 font-semibold'
                      : isWarn
                      ? 'text-amber-300'
                      : isBoost
                      ? 'text-cyan-400 font-semibold'
                      : 'text-gray-300'
                  }`}
                >
                  {log}
                </div>
              );
            })
          )}
          <div ref={consoleBottomRef} />
        </div>

        {/* Command Input Bar */}
        <form onSubmit={handleSendCommand} className="p-3 bg-card border-t border-border flex gap-2">
          <input
            type="text"
            disabled={!isOnline}
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder={
              isOnline
                ? "Enter command (e.g. /op player, /gamemode creative, /say hello)..."
                : "Console input is disabled while server is offline"
            }
            className="flex-1 px-3.5 py-2 rounded-xl bg-surface border border-border text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!isOnline || !commandInput.trim()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
