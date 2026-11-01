import React, { useState } from 'react';
import { Search, ArrowUpDown, Play, Folder, Sparkles, MoreVertical, Plus } from 'lucide-react';
import { GameProfile } from '../../types';

interface ProfileListProps {
  profiles: GameProfile[];
  activeProfileId: string | null;
  onSelectProfile: (id: string) => void;
  onEditProfile: (profile: GameProfile) => void;
  onDeleteProfile: (id: string) => void;
  onCreateProfile: () => void;
  onLaunchProfile: (id: string) => void;
}

export const ProfileList: React.FC<ProfileListProps> = ({
  profiles,
  activeProfileId,
  onSelectProfile,
  onEditProfile,
  onDeleteProfile,
  onCreateProfile,
  onLaunchProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'version' | 'recent'>('recent');

  const filteredProfiles = profiles
    .filter((profile) =>
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.gameVersion.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'version') return b.gameVersion.localeCompare(a.gameVersion);
      return (b.lastPlayed || 0) - (a.lastPlayed || 0);
    });

  return (
    <div className="h-full flex flex-col bg-background p-8 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Your Profiles</h1>
          <p className="text-gray-400 mt-1">Manage and launch your Minecraft installations</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search profiles..."
            className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-800/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
          />
        </div>

        <button
          onClick={() => {
            if (sortBy === 'recent') setSortBy('version');
            else if (sortBy === 'version') setSortBy('name');
            else setSortBy('recent');
          }}
          className="px-6 py-3 bg-gray-900/50 hover:bg-gray-900 border border-gray-800/50 rounded-xl text-white font-semibold text-sm flex items-center gap-2 transition"
        >
          <ArrowUpDown className="w-4 h-4 text-gray-400" />
          <span>Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</span>
        </button>
      </div>

      {/* Profiles Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-6">
          {/* Create Profile Card */}
          <button
            onClick={onCreateProfile}
            className="h-48 bg-gray-900/30 hover:bg-gray-900/50 border-2 border-dashed border-gray-800/50 hover:border-orange-500/50 rounded-2xl transition flex flex-col items-center justify-center gap-3 group"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-800/50 group-hover:bg-orange-600/20 flex items-center justify-center transition">
              <Plus className="w-6 h-6 text-gray-400 group-hover:text-orange-400 transition" />
            </div>
            <span className="text-white font-bold text-sm tracking-wide group-hover:text-orange-400 transition">
              CREATE PROFILE
            </span>
          </button>

          {/* Profile Cards */}
          {filteredProfiles.map((profile) => {
            const isActive = activeProfileId === profile.id;
            return (
              <div
                key={profile.id}
                onClick={() => onSelectProfile(profile.id)}
                className={`h-48 bg-gray-900/50 hover:bg-gray-900/80 rounded-2xl border transition p-6 flex flex-col justify-between cursor-pointer relative group ${
                  isActive
                    ? 'border-orange-500 shadow-xl shadow-orange-500/10'
                    : 'border-gray-800/50 hover:border-gray-700/50'
                }`}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Top: Icon + Name */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-2xl shadow-lg shrink-0">
                    {profile.loaderType === 'fabric' ? '🧶' : profile.loaderType === 'forge' ? '🔨' : '🧱'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-white truncate">{profile.name}</h3>
                    <p className="text-sm text-gray-400 mt-0.5">
                      BoostClient + {profile.loaderType.charAt(0).toUpperCase() + profile.loaderType.slice(1)} {profile.gameVersion}
                    </p>
                  </div>
                </div>

                {/* Bottom: Action Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-800/50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLaunchProfile(profile.id);
                    }}
                    className="flex-1 py-2 px-3 bg-gray-800/50 hover:bg-orange-600 rounded-lg text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Play
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditProfile(profile);
                    }}
                    className="py-2 px-3 bg-gray-800/50 hover:bg-gray-700 rounded-lg text-white font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <Folder className="w-3.5 h-3.5" />
                    Mods
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditProfile(profile);
                    }}
                    className="py-2 px-3 bg-gray-800/50 hover:bg-gray-700 rounded-lg text-white font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Packs
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditProfile(profile);
                    }}
                    className="p-2 bg-gray-800/50 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
