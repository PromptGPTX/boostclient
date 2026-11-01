import React, { useState } from 'react';
import {
  Settings,
  Palette,
  Cpu,
  Zap,
  Globe,
  HardDrive,
  Save,
  Check,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { AppSettings } from '../../types';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: Partial<AppSettings>) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSaveSettings }) => {
  const [theme, setTheme] = useState(settings.theme || 'aternos-dark');
  const [defaultRam, setDefaultRam] = useState(settings.defaultRam || 4);
  const [defaultJavaPath, setDefaultJavaPath] = useState(settings.defaultJavaPath || '');
  const [playitSecretKey, setPlayitSecretKey] = useState(settings.playitSecretKey || '');
  const [performanceOptimization, setPerformanceOptimization] = useState(
    settings.performanceOptimization ?? true
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  const themes: { id: AppSettings['theme']; label: string; desc: string; previewColor: string }[] = [
    {
      id: 'aternos-dark',
      label: 'Aternos Dark',
      desc: 'Authentic dark server dashboard with royal blue accents',
      previewColor: 'bg-[#1e2328] border-blue-500',
    },
    {
      id: 'clean-light',
      label: 'Clean Light',
      desc: 'Bright, modern clean daylight theme',
      previewColor: 'bg-white border-blue-600',
    },
    {
      id: 'midnight',
      label: 'Midnight OLED',
      desc: 'Pure deep black with indigo accents',
      previewColor: 'bg-black border-indigo-500',
    },
    {
      id: 'emerald',
      label: 'Minecraft Emerald',
      desc: 'Deep forest green inspired by Minecraft emeralds',
      previewColor: 'bg-[#0a291e] border-emerald-500',
    },
    {
      id: 'cyberpunk',
      label: 'Cyberpunk Neon',
      desc: 'Neon purple & cyan electric theme',
      previewColor: 'bg-[#1a1030] border-purple-500',
    },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings({
      theme,
      defaultRam,
      defaultJavaPath: defaultJavaPath.trim() || undefined,
      playitSecretKey: playitSecretKey.trim() || undefined,
      performanceOptimization,
    });

    // Apply theme attribute to html tag
    document.documentElement.setAttribute('data-theme', theme);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="flex-1 flex flex-col h-full bg-background overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Client Settings</h1>
          <p className="text-xs text-gray-400 mt-1">
            Customize the app appearance, default memory allocations, Java installations, and Playit credentials.
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
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>

      {/* Theme Customization */}
      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-white">Application Theme</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {themes.map((t) => {
            const isSelected = theme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  document.documentElement.setAttribute('data-theme', t.id);
                }}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-card border-blue-500 shadow-md shadow-blue-500/10'
                    : 'bg-card/40 border-border hover:border-gray-500'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-4 h-4 rounded-full border-2 ${t.previewColor}`} />
                    <span className="text-sm font-bold text-white">{t.label}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{t.desc}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-border flex justify-end">
                  {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 10x Performance Engine Settings */}
      <div className="p-6 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-white">10x Performance Engine</h2>
              <p className="text-xs text-gray-300">
                Automatically inject high-throughput JVM Garbage Collection flags for client and server.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPerformanceOptimization(!performanceOptimization)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              performanceOptimization ? 'bg-blue-600' : 'bg-card border border-border'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                performanceOptimization ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Default RAM */}
      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="text-base font-bold text-white">Default RAM Allocation</h2>
              <p className="text-xs text-gray-400">
                Default memory allocated to newly created game profiles and servers.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-white px-3 py-1 bg-card rounded-lg border border-border">
            {defaultRam} GB
          </span>
        </div>

        <input
          type="range"
          min={1}
          max={16}
          step={1}
          value={defaultRam}
          onChange={(e) => setDefaultRam(parseInt(e.target.value, 10))}
          className="w-full accent-blue-600 h-2 bg-card rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-gray-400 font-mono">
          <span>1 GB</span>
          <span>4 GB (Recommended)</span>
          <span>8 GB</span>
          <span>16 GB</span>
        </div>
      </div>

      {/* Playit.gg Custom Account Key */}
      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-base font-bold text-white">Playit.gg Account Secret (Optional)</h2>
            <p className="text-xs text-gray-400">
              If you have an existing Playit.gg account, enter your agent secret key here. Otherwise, BoostClient creates free auto-tunnels.
            </p>
          </div>
        </div>

        <input
          type="password"
          value={playitSecretKey}
          onChange={(e) => setPlayitSecretKey(e.target.value)}
          placeholder="Paste your playit.gg agent secret key here (optional)..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-xs text-white font-mono placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* About & BoostClient Info */}
      <div className="p-5 rounded-2xl bg-card/60 border border-border flex items-center justify-between text-xs text-gray-400">
        <div>
          <span className="font-bold text-white">BoostClient Suite v1.0.0</span>
          <span className="block mt-0.5">
            100% Free & Open Minecraft Launcher and Self-Hosted Server Manager.
          </span>
        </div>
        <span className="text-blue-400 font-mono">Built for Everyone</span>
      </div>
    </form>
  );
};
