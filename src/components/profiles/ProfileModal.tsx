import React, { useState, useEffect } from 'react';
import { X, Layers, Save, Cpu, Zap, Folder, Check, Rocket } from 'lucide-react';
import { GameProfile, ModLoader } from '../../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: GameProfile) => Promise<void>;
  initialProfile?: GameProfile | null;
  mojangVersions: { id: string; type: 'release' | 'snapshot' }[];
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProfile,
  mojangVersions,
}) => {
  const [name, setName] = useState('');
  const [gameVersion, setGameVersion] = useState('1.20.4');
  const [loaderType, setLoaderType] = useState<ModLoader>('fabric');
  const [minMemory, setMinMemory] = useState(2048);
  const [maxMemory, setMaxMemory] = useState(4096);
  const [performancePreset, setPerformancePreset] = useState<'standard' | 'high' | 'ultra-10x'>(
    'ultra-10x'
  );
  const [modPreset, setModPreset] = useState<'performance' | 'visual' | ''>('');
  const [installBoostMod, setInstallBoostMod] = useState(true);
  const [javaPath, setJavaPath] = useState('');
  const [customJvmArgs, setCustomJvmArgs] = useState('');
  const [detectedJavas, setDetectedJavas] = useState<{ path: string; version: string }[]>([]);

  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name);
      setGameVersion(initialProfile.gameVersion);
      setLoaderType(initialProfile.loaderType);
      setMinMemory(initialProfile.minMemory);
      setMaxMemory(initialProfile.maxMemory);
      setPerformancePreset(initialProfile.performancePreset || 'ultra-10x');
      setModPreset(initialProfile.modPreset || '');
      setInstallBoostMod(initialProfile.installBoostMod ?? true);
      setJavaPath(initialProfile.javaPath || '');
      setCustomJvmArgs(initialProfile.jvmArgs?.join(' ') || '');
    } else {
      setName('Custom Fabric 1.20.4');
      setGameVersion('1.20.4');
      setLoaderType('fabric');
      setMinMemory(2048);
      setMaxMemory(4096);
      setPerformancePreset('ultra-10x');
      setModPreset('');
      setInstallBoostMod(true);
      setJavaPath('');
      setCustomJvmArgs('');
    }

    window.electronAPI?.detectJava().then((javas) => {
      setDetectedJavas(javas);
    });
  }, [initialProfile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const profile: GameProfile = {
      id: initialProfile?.id || `profile-${Date.now()}`,
      name: name.trim() || `Minecraft ${gameVersion}`,
      gameVersion,
      loaderType,
      minMemory,
      maxMemory,
      performancePreset,
      modPreset: modPreset || undefined,
      installBoostMod,
      javaPath: javaPath.trim() || undefined,
      jvmArgs: customJvmArgs.trim() ? customJvmArgs.split(' ') : undefined,
      created: initialProfile?.created || Date.now(),
      lastPlayed: initialProfile?.lastPlayed,
    };

    if (initialProfile) {
      await onSave(profile);
      onClose();
    } else {
      const result = await window.electronAPI?.createProfileWithPreset({
        profile,
        preset: modPreset as any,
        installBoostMod,
      });
      if (result) {
        await onSave(result.profile);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">
              {initialProfile ? 'Edit Profile' : 'Create New Profile'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-card transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Profile Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Profile Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Modded World"
              className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Version & ModLoader Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Minecraft Version */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Minecraft Version</label>
              <select
                value={gameVersion}
                onChange={(e) => setGameVersion(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {mojangVersions.length > 0 ? (
                  mojangVersions
                    .filter((v) => v.type === 'release')
                    .map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.id}
                      </option>
                    ))
                ) : (
                  <>
                    <option value="1.21.1">1.21.1</option>
                    <option value="1.20.4">1.20.4</option>
                    <option value="1.20.1">1.20.1</option>
                    <option value="1.19.4">1.19.4</option>
                    <option value="1.18.2">1.18.2</option>
                    <option value="1.16.5">1.16.5</option>
                    <option value="1.12.2">1.12.2</option>
                    <option value="1.8.9">1.8.9</option>
                  </>
                )}
              </select>
            </div>

            {/* Mod Loader */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Mod Loader</label>
              <select
                value={loaderType}
                onChange={(e) => setLoaderType(e.target.value as ModLoader)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer capitalize"
              >
                <option value="fabric">Fabric (Recommended - High FPS)</option>
                <option value="forge">Minecraft Forge</option>
                <option value="neoforge">NeoForge</option>
                <option value="quilt">Quilt</option>
                <option value="vanilla">Vanilla (Unmodded)</option>
              </select>
            </div>
          </div>

          {/* BoostX Mod & Mod Preset Selection */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-bold text-white">BoostX Mod Suite</span>
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={installBoostMod}
                  onChange={(e) => setInstallBoostMod(e.target.checked)}
                  className="accent-purple-600"
                />
                Install BoostX
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '', label: 'None', desc: 'Manual mod installation' },
                { id: 'performance', label: 'Performance', desc: 'Sodium + Lithium + FerriteCore' },
                { id: 'visual', label: 'Visual', desc: 'Iris + Shaders + Extra Mods' },
              ].map((preset) => {
                const isSelected = modPreset === preset.id;
                return (
                  <button
                    type="button"
                    key={preset.id || 'none'}
                    onClick={() => setModPreset(preset.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30 font-semibold'
                        : 'bg-card border-border text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <span className="text-xs font-bold block">{preset.label}</span>
                    <span className="text-[10px] opacity-75 block">{preset.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 10x Performance Engine Preset */}
          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-white">10x FPS Performance Engine</span>
              </div>
              <span className="text-[10px] bg-blue-600/30 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full font-bold">
                FREE FEATURE
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'standard', label: 'Standard', desc: 'Default Java GC' },
                { id: 'high', label: 'High FPS', desc: 'G1GC Optimized' },
                { id: 'ultra-10x', label: 'Ultra 10x', desc: 'Aikar + Low Latency' },
              ].map((preset) => {
                const isSelected = performancePreset === preset.id;
                return (
                  <button
                    type="button"
                    key={preset.id}
                    onClick={() => setPerformancePreset(preset.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30 font-semibold'
                        : 'bg-card border-border text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <span className="text-xs font-bold block">{preset.label}</span>
                    <span className="text-[10px] opacity-75 block">{preset.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RAM Allocation Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <label className="text-xs font-semibold text-gray-300">Memory Allocation (RAM)</label>
              </div>
              <span className="text-xs font-mono font-bold text-white">
                {Math.round(maxMemory / 1024)} GB ({maxMemory} MB)
              </span>
            </div>
            <input
              type="range"
              min={1024}
              max={16384}
              step={512}
              value={maxMemory}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setMaxMemory(val);
                setMinMemory(Math.min(minMemory, val));
              }}
              className="w-full accent-blue-600 h-2 bg-card rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-mono">
              <span>1 GB</span>
              <span>4 GB</span>
              <span>8 GB</span>
              <span>16 GB</span>
            </div>
          </div>

          {/* Java Runtime Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Java Runtime</label>
            <select
              value={javaPath}
              onChange={(e) => setJavaPath(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">System Default (Auto-detect Java)</option>
              {detectedJavas.map((j, i) => (
                <option key={i} value={j.path}>
                  {j.version} ({j.path})
                </option>
              ))}
            </select>
          </div>

          {/* Custom JVM Arguments */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Custom JVM Arguments (Optional)</label>
            <input
              type="text"
              value={customJvmArgs}
              onChange={(e) => setCustomJvmArgs(e.target.value)}
              placeholder="-Dsome.property=true"
              className="w-full px-3.5 py-2 rounded-xl bg-card border border-border text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-border flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-card hover:bg-card/80 text-gray-300 font-semibold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 transition shadow-lg shadow-blue-600/30"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
