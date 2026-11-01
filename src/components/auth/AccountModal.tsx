import React, { useState, useEffect } from 'react';
import { X, UserPlus, Shield, ExternalLink, Check, Trash2, Key } from 'lucide-react';
import { Account } from '../../types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  activeAccountId: string | null;
  onSelectAccount: (id: string) => void;
  onLoginOffline: (username: string) => Promise<void>;
  onStartMicrosoftLogin: () => Promise<void>;
  onRemoveAccount: (id: string) => Promise<void>;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  accounts,
  activeAccountId,
  onSelectAccount,
  onLoginOffline,
  onStartMicrosoftLogin,
  onRemoveAccount,
}) => {
  const [offlineName, setOfflineName] = useState('');
  const [deviceCodeData, setDeviceCodeData] = useState<{
    userCode: string;
    verificationUri: string;
  } | null>(null);
  const [isWaitingForMs, setIsWaitingForMs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for device code from main process
    const unsubscribe = window.electronAPI?.onMicrosoftDeviceCode((data) => {
      setDeviceCodeData(data);
      setIsWaitingForMs(true);
    });
    return () => unsubscribe?.();
  }, []);

  if (!isOpen) return null;

  const handleAddOffline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offlineName.trim()) return;
    try {
      setError(null);
      await onLoginOffline(offlineName.trim());
      setOfflineName('');
    } catch (err: any) {
      setError(err.message || 'Failed to add offline account');
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      setError(null);
      setIsWaitingForMs(true);
      await onStartMicrosoftLogin();
    } catch (err: any) {
      setError(err.message || 'Microsoft login failed');
      setIsWaitingForMs(false);
      setDeviceCodeData(null);
    }
  };

  const openVerificationUrl = () => {
    if (deviceCodeData?.verificationUri) {
      window.electronAPI.openUrl(deviceCodeData.verificationUri);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Player Accounts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-card transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Microsoft Device Code Banner */}
          {deviceCodeData && isWaitingForMs && (
            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/40 space-y-3">
              <div className="flex items-center gap-2 text-blue-300 text-sm font-semibold">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Microsoft Authentication Required</span>
              </div>
              <p className="text-xs text-gray-300">
                To link your official Minecraft account, go to Microsoft login and enter the code below:
              </p>
              <div className="p-3 bg-black/60 border border-blue-500/30 rounded-lg text-center">
                <span className="text-xl font-mono font-bold tracking-widest text-cyan-400 select-all">
                  {deviceCodeData.userCode}
                </span>
              </div>
              <button
                onClick={openVerificationUrl}
                className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <span>Open Microsoft Login Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <p className="text-[11px] text-gray-400 text-center animate-pulse">
                Waiting for completion in browser...
              </p>
            </div>
          )}

          {/* Account List */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Saved Accounts
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {accounts.map((acc) => {
                const isActive = acc.id === activeAccountId;
                return (
                  <div
                    key={acc.id}
                    onClick={() => onSelectAccount(acc.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${
                      isActive
                        ? 'bg-blue-600/15 border-blue-500/50'
                        : 'bg-card border-border hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={acc.skinUrl || `https://mc-heads.net/avatar/${acc.username}/64`}
                        alt="Skin"
                        className="w-8 h-8 rounded-lg bg-black/30 border border-border object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-white">{acc.username}</span>
                          {isActive && (
                            <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.2 rounded">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {acc.type === 'microsoft' ? 'Microsoft Account' : 'Offline / Cracked Mode'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {isActive && <Check className="w-4 h-4 text-blue-400" />}
                      {accounts.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveAccount(acc.id);
                          }}
                          className="p-1 text-gray-500 hover:text-red-400 rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Offline Account */}
          <form onSubmit={handleAddOffline} className="space-y-2 pt-2 border-t border-border">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Add Offline (Cracked) Account
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter player nickname"
                value={offlineName}
                onChange={(e) => setOfflineName(e.target.value)}
                maxLength={16}
                className="flex-1 px-3 py-2 rounded-xl bg-card border border-border text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!offlineName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
            <p className="text-[11px] text-gray-400">
              Offline accounts work on all offline/cracked servers with custom skin previews!
            </p>
          </form>

          {/* Sign In With Microsoft */}
          <div className="space-y-2 pt-2 border-t border-border">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Official Minecraft Account
            </span>
            <button
              onClick={handleMicrosoftLogin}
              disabled={isWaitingForMs}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-700/20"
            >
              <Shield className="w-4 h-4" />
              <span>{isWaitingForMs ? 'Waiting for Microsoft...' : 'Sign In with Microsoft'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
