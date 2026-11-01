import React from 'react';
import {
  Play,
  FolderOpen,
  Server,
  Settings,
  Zap,
  User,
  ShieldCheck,
} from 'lucide-react';
import { Account } from '../../types';

export type NavTab = 'play' | 'profiles' | 'servers' | 'account' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  activeAccount: Account | null;
  onOpenAccountModal: () => void;
  runningServerCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  activeAccount,
  onOpenAccountModal,
  runningServerCount,
}) => {
  const navItems = [
    { id: 'play' as NavTab, label: 'PLAY', icon: Play },
    { id: 'profiles' as NavTab, label: 'PROFILES', icon: FolderOpen },
    {
      id: 'servers' as NavTab,
      label: 'SERVERS',
      icon: Server,
      badge: runningServerCount > 0 ? `${runningServerCount}` : undefined,
      badgeColor: 'bg-emerald-500 text-white',
    },
    { id: 'account' as NavTab, label: 'ACCOUNT', icon: User },
    { id: 'settings' as NavTab, label: 'SETTINGS', icon: Settings },
  ];

  return (
    <aside className="w-20 bg-[#0a0b0d] border-r border-gray-800/50 flex flex-col justify-between select-none z-10 shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-3 flex items-center justify-center border-b border-gray-800/50">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-orange-500 via-orange-600 to-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={item.label}
                className={`relative w-full flex flex-col items-center justify-center px-2 py-3 rounded-xl font-medium text-[10px] transition-all duration-150 ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/40'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="uppercase tracking-tight">{item.label}</span>
                {item.badge && (
                  <span
                    className={`absolute -top-1 -right-1 text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                      item.badgeColor || 'bg-blue-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Version Footer */}
      <div className="p-3 border-t border-gray-800/50">
        <div className="text-center text-[10px] text-gray-500 font-medium">
          v1.2.0
        </div>
      </div>
    </aside>
  );
};
