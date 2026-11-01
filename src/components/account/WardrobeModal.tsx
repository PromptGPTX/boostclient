import React, { useState } from 'react';
import { X, Upload, Check } from 'lucide-react';
import { Account } from '../../types';

interface WardrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAccount: Account | null;
}

export const WardrobeModal: React.FC<WardrobeModalProps> = ({
  isOpen,
  onClose,
  activeAccount,
}) => {
  const [activeSlot, setActiveSlot] = useState(1);
  const [activeTab, setActiveTab] = useState<'skins' | 'capes'>('skins');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-4xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 flex items-center justify-center text-xl">
              👕
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Wardrobe</h2>
              <p className="text-sm text-gray-400">Customize your skin and capes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 border-b border-gray-800 flex gap-4">
          <button
            onClick={() => setActiveTab('skins')}
            className={`pb-3 px-2 font-bold text-sm transition relative ${
              activeTab === 'skins'
                ? 'text-orange-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Skins
            {activeTab === 'skins' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('capes')}
            className={`pb-3 px-2 font-bold text-sm transition relative ${
              activeTab === 'capes'
                ? 'text-orange-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Capes
            {activeTab === 'capes' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex gap-8">
          {/* Left: 3D Preview */}
          <div className="w-80 flex flex-col items-center justify-center bg-gray-950/50 rounded-2xl border border-gray-800/50 p-6">
            <div className="w-full aspect-[3/4] bg-gradient-to-b from-gray-900 to-black rounded-xl border border-gray-800 flex items-center justify-center overflow-hidden mb-4">
              <img
                src={`https://mc-heads.net/body/${activeAccount?.username || 'Steve'}/128`}
                alt="Skin Preview"
                className="w-full h-full object-contain scale-90"
              />
            </div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              LIVE PREVIEW
            </div>
          </div>

          {/* Right: Skin/Cape Library */}
          <div className="flex-1 space-y-6">
            {activeTab === 'skins' ? (
              <>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Skin library</h3>
                  <p className="text-xs text-gray-400">
                    Keep up to three skins and choose which one is active. Uploads must be a 64 × 64 PNG no larger than 25 KB.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((slot) => {
                    const isSelected = activeSlot === slot;
                    return (
                      <div
                        key={slot}
                        onClick={() => setActiveSlot(slot)}
                        className={`bg-gray-800/30 rounded-2xl border p-4 flex flex-col items-center gap-3 cursor-pointer transition ${
                          isSelected
                            ? 'border-orange-500 shadow-lg shadow-orange-500/10'
                            : 'border-gray-700/50 hover:border-gray-600'
                        }`}
                      >
                        <div className="w-full flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-400">SLOT {slot}</span>
                          {isSelected && <Check className="w-4 h-4 text-orange-500" />}
                        </div>

                        <div className="w-full aspect-square bg-gray-900/50 rounded-xl border border-dashed border-gray-700/50 flex items-center justify-center">
                          <Upload className="w-8 h-8 text-gray-600" />
                        </div>

                        <button className="w-full py-2 bg-gray-700/50 hover:bg-orange-600 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-2 transition">
                          <Upload className="w-3.5 h-3.5" />
                          Upload
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Cape library</h3>
                  <p className="text-xs text-gray-400">
                    Select a cape or upload a custom one. Animated GIF capes are supported!
                  </p>
                </div>

                {/* Drop Zone */}
                <div className="border-2 border-dashed border-gray-700/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 bg-gray-800/20 hover:border-orange-500/50 transition cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-500" />
                  <p className="text-sm font-semibold text-gray-300">
                    Drop cape files here or click 'Import Cape'
                  </p>
                  <p className="text-xs text-gray-500">Supports PNG and GIF</p>
                </div>

                {/* Default Capes Grid */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Default Capes
                  </h4>
                  <div className="grid grid-cols-6 gap-3">
                    {['Creeper', 'Angel', 'Dragon', 'Rainbow', 'Fire', 'Heart'].map((cape) => (
                      <div
                        key={cape}
                        className="aspect-[3/4] bg-gray-800/40 rounded-xl border border-gray-700/50 hover:border-orange-500 p-2 flex flex-col items-center justify-between cursor-pointer transition group"
                      >
                        <div className="flex-1 flex items-center justify-center text-3xl">
                          {cape === 'Creeper' ? '🌿' : cape === 'Angel' ? '👼' : cape === 'Dragon' ? '🐉' : cape === 'Rainbow' ? '🌈' : cape === 'Fire' ? '🔥' : '❤️'}
                        </div>
                        <span className="text-[10px] font-semibold text-gray-400 group-hover:text-white truncate">
                          {cape}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-sm transition"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-8 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm transition shadow-lg shadow-orange-600/30"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
