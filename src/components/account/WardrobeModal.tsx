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
                  {[1, 2, 3].map((slot) => (
                    <div
                      key={slot}
                      onClick={() => setActiveSlot(slot)}
                      className={`relative aspect-[3/4] rounded-2xl border-2 p-3 flex flex-col justify-between cursor-pointer transition ${
                        activeSlot === slot
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-gray-800 bg-gray-950/40 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400">Slot {slot}</span>
                        {activeSlot === slot && (
                          <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex items-center justify-center my-2">
                        <div className="w-16 h-28 bg-gray-900 rounded-lg flex items-center justify-center border border-gray-800">
                          <span className="text-2xl text-gray-700">👤</span>
                        </div>
                      </div>

                      <button className="w-full py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition">
                        <Upload className="w-3.5 h-3.5" />
                        Upload
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <span className="text-orange-500 text-lg">💡</span>
                    <p className="text-xs text-orange-200/80 leading-relaxed">
                      Skins uploaded here are synced across multiplayer for all users playing with BoostClient and BoostX mod.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Capes & Animated Capes</h3>
                  <p className="text-xs text-gray-400">
                    Choose an official BoostClient cape or import an animated GIF cape.
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {['None', 'Creeper', 'Angel', 'Dragon', 'Rainbow', 'Fire', 'Heart', 'Star'].map((cape) => (
                    <div
                      key={cape}
                      className="aspect-square bg-gray-950/40 border border-gray-800 rounded-xl p-3 flex flex-col items-center justify-between hover:border-orange-500/50 cursor-pointer transition"
                    >
                      <span className="text-xs font-bold text-gray-400">{cape}</span>
                      <span className="text-2xl">
                        {cape === 'None' ? '🚫' : cape === 'Creeper' ? '🌿' : cape === 'Angel' ? '👼' : cape === 'Dragon' ? '🐉' : cape === 'Rainbow' ? '🌈' : cape === 'Fire' ? '🔥' : cape === 'Heart' ? '❤️' : '⭐'}
                      </span>
                      <button className="w-full py-1 rounded-lg bg-gray-800 text-[10px] font-bold text-gray-300 hover:bg-orange-600 hover:text-white transition">
                        Equip
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition">
                    <Upload className="w-4 h-4" />
                    Upload Custom Cape (GIF / PNG)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
