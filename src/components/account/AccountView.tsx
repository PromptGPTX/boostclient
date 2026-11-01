import React from 'react';
import { User, Mail, Calendar, Shield, Edit, Upload, X } from 'lucide-react';
import { Account } from '../../types';

interface AccountViewProps {
  activeAccount: Account | null;
  onOpenAccountModal: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  activeAccount,
  onOpenAccountModal,
}) => {
  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-800/50">
        <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account, skins, and capes</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Account Info Card */}
          <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-orange-400" />
                Account Information
              </h2>
              <button
                onClick={onOpenAccountModal}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm flex items-center gap-2 transition"
              >
                <Edit className="w-4 h-4" />
                Change Account
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {activeAccount?.username?.charAt(0).toUpperCase() || 'G'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">
                      {activeAccount?.username || 'Guest'}
                    </span>
                    {activeAccount?.type === 'microsoft' && (
                      <Shield className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    {activeAccount?.type === 'microsoft' ? 'Microsoft Account' : 'Offline / Cracked'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">
                    {activeAccount?.type === 'microsoft' ? activeAccount.email || 'Not available' : 'No email (Offline)'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">
                    Added: {activeAccount?.created ? new Date(activeAccount.created).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Wardrobe - Skins */}
          <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 flex items-center justify-center bg-purple-500/20 rounded-lg">👕</span>
              Wardrobe - Skins
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Keep up to three skins and choose which one is active. Uploads must be 64 × 64 PNG no larger than 25 KB.
            </p>

            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((slot) => (
                <div key={slot} className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-4 flex flex-col items-center gap-3">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Slot {slot}</div>
                  <div className="w-full aspect-square bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-700/50 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-600" />
                  </div>
                  <button className="w-full px-3 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-white text-sm font-medium transition flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-sm text-blue-300 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>
                  <strong>Note:</strong> Only players using BoostClient with BoostX mod can see custom skins from other BoostClient users.
                </span>
              </p>
            </div>
          </div>

          {/* Wardrobe - Capes */}
          <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 flex items-center justify-center bg-red-500/20 rounded-lg">🎽</span>
              Wardrobe - Capes
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Upload custom capes or choose from default designs. Animated capes (GIF) are supported!
            </p>

            <div className="grid grid-cols-4 gap-3">
              {/* Default Capes */}
              {['None', 'Creeper', 'Angel', 'Dragon', 'Rainbow', 'Fire', 'Heart', 'Star'].map((cape) => (
                <button
                  key={cape}
                  className="aspect-square bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-orange-500/50 transition flex flex-col items-center justify-center gap-2 p-3"
                >
                  <div className="w-12 h-12 bg-gray-900/50 rounded flex items-center justify-center text-2xl">
                    {cape === 'None' ? '∅' : cape === 'Creeper' ? '🌿' : cape === 'Angel' ? '👼' : cape === 'Dragon' ? '🐉' : cape === 'Rainbow' ? '🌈' : cape === 'Fire' ? '🔥' : cape === 'Heart' ? '❤️' : '⭐'}
                  </div>
                  <span className="text-xs font-medium text-gray-300">{cape}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button className="flex-1 px-4 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold flex items-center justify-center gap-2 transition">
                <Upload className="w-5 h-5" />
                Import Custom Cape
              </button>
              <button className="px-4 py-3 rounded-xl bg-gray-700/50 hover:bg-gray-700 text-white font-semibold flex items-center justify-center gap-2 transition">
                <X className="w-5 h-5" />
                Remove Cape
              </button>
            </div>

            <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <p className="text-sm text-purple-300 flex items-center gap-2">
                <span>✨</span>
                <span>
                  <strong>GIF Support:</strong> Animated capes are supported! Upload a GIF file for an animated cape effect.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
