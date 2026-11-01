import React, { useState } from 'react';
import { ChevronDown, Plus, User as UserIcon } from 'lucide-react';
import { GameProfile, ServerInstance, Account } from '../../types';

interface PlayViewProps {
  profiles: GameProfile[];
  activeProfile: GameProfile | null;
  onSelectProfile: (id: string) => void;
  onLaunchGame: (profileId?: string) => void;
  onKillGame: () => void;
  gameStatus: 'idle' | 'downloading' | 'launching' | 'running' | 'error';
  statusProgress: number;
  statusText: string;
  gameLogs: string[];
  runningServers: ServerInstance[];
  activeAccount: Account | null;
  onOpenAccountModal: () => void;
  onOpenWardrobeModal: () => void;
}

export const PlayView: React.FC<PlayViewProps> = ({
  profiles,
  activeProfile,
  onSelectProfile,
  onLaunchGame,
  onKillGame,
  gameStatus,
  statusProgress,
  statusText,
  gameLogs,
  runningServers,
  activeAccount,
  onOpenAccountModal,
  onOpenWardrobeModal,
}) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleLaunch = () => {
    if (gameStatus === 'running') {
      onKillGame();
    } else if (activeProfile) {
      onLaunchGame(activeProfile.id);
    }
  };

  const getSkinUrl = (username: string) => {
    return `https://mc-heads.net/body/${username}/128`;
  };

  return (
    <div className="h-full flex bg-background">
      {/* Main Content - Left Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {/* Minecraft Background Video/Image Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-40 z-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
        </div>

        {/* Player Skin Preview */}
        <div className="relative z-10 flex flex-col items-center gap-6 mb-8">
          {/* Username Label */}
          <div className="px-6 py-2 bg-black/60 rounded-full border border-gray-700/50 backdrop-blur-sm">
            <span className="text-white font-bold text-xl tracking-wide">
              {activeAccount?.username || 'Guest'}
            </span>
          </div>

          {/* 3D Skin Preview */}
          <div className="relative">
            <div className="w-64 h-96 bg-gradient-to-b from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm flex items-center justify-center overflow-hidden">
              <img
                src={getSkinUrl(activeAccount?.username || 'Steve')}
                alt="Player Skin"
                className="w-full h-full object-contain scale-90 hover:scale-95 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = 'https://mc-heads.net/body/Steve/128';
                }}
              />
            </div>

            {/* Edit Skin Button Overlay */}
            <button
              onClick={onOpenWardrobeModal}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-purple-600/90 hover:bg-purple-500 backdrop-blur-sm text-white rounded-xl font-semibold text-sm transition shadow-lg flex items-center gap-2"
            >
              <UserIcon className="w-4 h-4" />
              Change Skin
            </button>
          </div>
        </div>

        {/* Launch Button */}
        <div className="relative z-10 w-full max-w-md space-y-4">
          <button
            onClick={handleLaunch}
            disabled={!activeProfile || (gameStatus !== 'idle' && gameStatus !== 'running')}
            className={`w-full py-6 rounded-2xl font-bold text-2xl transition-all shadow-2xl flex items-center justify-center gap-3 ${
              gameStatus === 'running'
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : gameStatus === 'idle'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-orange-500/50'
                : 'bg-gray-600 text-gray-300 cursor-not-allowed'
            }`}
          >
            {gameStatus === 'running' ? (
              'STOP GAME'
            ) : gameStatus === 'downloading' ? (
              `DOWNLOADING... ${Math.round(statusProgress)}%`
            ) : gameStatus === 'launching' ? (
              'LAUNCHING...'
            ) : (
              'LAUNCH GAME'
            )}
          </button>

          {/* Version Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="w-full px-6 py-3 bg-gray-800/50 hover:bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white font-semibold flex items-center justify-between transition"
            >
              <span className="text-sm">
                {activeProfile
                  ? `${activeProfile.gameVersion}-${activeProfile.loaderType === 'vanilla' ? 'Vanilla' : activeProfile.loaderType.charAt(0).toUpperCase() + activeProfile.loaderType.slice(1)}`
                  : 'Select Profile'}
              </span>
              <ChevronDown className={`w-5 h-5 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showProfileDropdown && (
              <div className="absolute top-full mt-2 w-full bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl max-h-64 overflow-y-auto z-50">
                {profiles.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    No profiles available. Create one in the Profiles tab.
                  </div>
                ) : (
                  profiles.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => {
                        onSelectProfile(profile.id);
                        setShowProfileDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-800/50 transition flex items-center justify-between ${
                        activeProfile?.id === profile.id ? 'bg-orange-600/20 border-l-4 border-orange-500' : ''
                      }`}
                    >
                      <div>
                        <div className="text-white font-semibold text-sm">{profile.name}</div>
                        <div className="text-gray-400 text-xs">
                          {profile.gameVersion} · {profile.loaderType === 'vanilla' ? 'Vanilla' : profile.loaderType.charAt(0).toUpperCase() + profile.loaderType.slice(1)}
                        </div>
                      </div>
                      {activeProfile?.id === profile.id && (
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add Profile Shortcuts */}
        <div className="relative z-10 mt-8 flex gap-4">
          {[...Array(3)].map((_, i) => (
            <button
              key={i}
              className="w-32 h-24 bg-gray-800/30 hover:bg-gray-800/50 backdrop-blur-sm border-2 border-dashed border-gray-700/50 hover:border-orange-500/50 rounded-xl transition flex flex-col items-center justify-center gap-2 group"
            >
              <Plus className="w-6 h-6 text-gray-500 group-hover:text-orange-400 transition" />
              <span className="text-xs text-gray-500 group-hover:text-gray-300 transition font-medium">
                Add Profile
              </span>
            </button>
          ))}
        </div>

        {/* Status/Progress Bar */}
        {(gameStatus === 'downloading' || gameStatus === 'launching') && (
          <div className="relative z-10 mt-6 w-full max-w-md">
            <div className="w-full h-2 bg-gray-800/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300"
                style={{ width: `${statusProgress}%` }}
              />
            </div>
            <p className="text-center text-sm text-gray-400 mt-2">{statusText}</p>
          </div>
        )}

        {/* Bottom News Section */}
        <div className="absolute bottom-8 left-8 z-10 space-y-3">
          <div className="text-white font-bold text-sm uppercase tracking-wide">NEWS</div>
          <div className="flex gap-3">
            <div className="w-48 h-28 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-4 flex items-end cursor-pointer hover:scale-105 transition-transform shadow-xl">
              <span className="text-white font-bold text-lg">COSMETICS</span>
            </div>
            <div className="w-48 h-28 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-4 flex items-end cursor-pointer hover:scale-105 transition-transform shadow-xl">
              <span className="text-white font-bold text-lg">GIVEAWAYS</span>
            </div>
          </div>
        </div>

        {/* Version Number */}
        <div className="absolute bottom-4 left-4 text-xs text-gray-500 font-medium z-10">
          v1.2.0
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-96 bg-gray-900/50 backdrop-blur-sm border-l border-gray-800/50 flex flex-col p-6 space-y-6">
        {/* Account Dropdown */}
        <div className="flex items-center justify-between">
          <button
            onClick={onOpenAccountModal}
            className="flex items-center gap-3 px-4 py-2 bg-gray-800/50 hover:bg-gray-800/70 rounded-xl transition border border-gray-700/50"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold">
              {activeAccount?.username?.charAt(0).toUpperCase() || 'G'}
            </div>
            <span className="text-white font-semibold text-sm">{activeAccount?.username || 'Guest'}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Discord Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-sm">Discord</div>
              <div className="text-indigo-200 text-xs">discord.gg/TUTvzCmtyD</div>
            </div>
          </div>
          <button className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white font-bold text-sm transition">
            JOIN
          </button>
        </div>

        {/* Webstore Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-sm">Webstore</div>
              <div className="text-emerald-200 text-xs">boostclient.net/store</div>
            </div>
          </div>
          <button className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white font-bold text-sm transition">
            VISIT
          </button>
        </div>

        {/* Partnered Servers */}
        <div className="flex-1 flex flex-col">
          <div className="text-white font-bold text-xs uppercase tracking-wide mb-4 text-gray-400">
            PARTNERED SERVERS
          </div>
          <div className="space-y-2 overflow-y-auto">
            {[
              { name: 'Hypixel', ip: 'mc.hypixel.net', players: 35000, icon: '🏆' },
              { name: 'Mineplex', ip: 'mineplex.com', players: 400, icon: '🎮' },
              { name: 'MCC Island', ip: 'mccisland.net', players: 550, icon: '🏝️' },
              { name: 'DonutSMP', ip: 'donutsmp.net', players: 32000, icon: '🍩' },
              { name: 'Hoplite', ip: 'mc.hoplite.gg', players: 2100, icon: '⚔️' },
            ].map((server) => (
              <div
                key={server.name}
                className="flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-xl transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center text-xl">
                    {server.icon}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm group-hover:text-orange-400 transition">
                      {server.name}
                    </div>
                    <div className="text-gray-400 text-xs">{server.ip}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-emerald-400 text-xs font-bold">
                    {server.players.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Friends Section */}
        <div className="border-t border-gray-800/50 pt-4">
          <div className="text-white font-bold text-xs uppercase tracking-wide mb-3 text-gray-400">
            FRIENDS
          </div>
          <div className="text-gray-500 text-sm text-center py-6">
            No friends yet. Find a player by Minecraft name or friend code.
          </div>
        </div>
      </div>
    </div>
  );
};
