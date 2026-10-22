import React from 'react';
import {
  Menu,
  Bell,
  Search,
  LogOut,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { Store, Employee, NavigationSectionId } from '../types';
import { getCommercialEdition, getEditionBadgeStyle } from '../data/commercialEditions';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  stores: Store[];
  activeStore: Store;
  onSelectStore: (store: Store) => void;
  currentUser: Employee;
  onLogout: () => void;
  unreadAlertsCount: number;
  onNavigate: (section: NavigationSectionId) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  tradeName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  stores: _stores,
  activeStore: _activeStore,
  onSelectStore: _onSelectStore,
  currentUser,
  onLogout,
  unreadAlertsCount,
  onNavigate,
  isDarkMode = false,
  onToggleDarkMode,
  tradeName,
}) => {
  // Safe commercial trade name with fallback to 'COMERCIOS 360'
  const visibleTradeName = tradeName?.trim() || 'COMERCIOS 360';

  // Resolve commercial plan strictly from authenticated session user (fallback: 'demo')
  const sessionPlanTier = currentUser?.assignedPlan || 'demo';
  const currentPlan = getCommercialEdition(sessionPlanTier);
  const currentPlanStyle = getEditionBadgeStyle(sessionPlanTier);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#161A18]/95 backdrop-blur-md border-b border-[#DCD6CC] dark:border-[#2E3531] transition-colors">
      <div className="px-3.5 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Mobile hamburger + Commercial Plan Indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-[#4B524E] dark:text-[#CBD2CE] hover:bg-[#FAF8F4] dark:hover:bg-[#282F2C] rounded-xl transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Abrir menú"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Commercial Plan Indicator (Informative, non-switchable) */}
          <div
            className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-1.5 sm:py-2 bg-[#FAF8F4] dark:bg-[#222825] rounded-xl border border-[#DCD6CC] dark:border-[#3A433E] transition-colors select-none min-h-[44px]"
            title={`${visibleTradeName} - ${currentPlan.badgeLabel} • ${currentPlan.shortDescription}`}
          >
            <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#1A1F1C] border border-[#DCD6CC] dark:border-[#3A433E] flex items-center justify-center text-[#C85A32] shadow-2xs shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>

            <div className="text-left flex flex-col justify-center">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-xs sm:text-sm text-[#111413] dark:text-white tracking-tight truncate max-w-[130px] sm:max-w-[200px] md:max-w-[300px]">
                  {visibleTradeName}
                </span>
                <span className="text-[#5D6561] dark:text-[#A2A9A5] font-bold text-xs">
                  -
                </span>
                <span
                  className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full border leading-none shrink-0 ${currentPlanStyle.badgeClass}`}
                >
                  {currentPlan.badgeLabel}
                </span>
              </div>
              <span className="hidden md:block text-[11px] text-[#5D6561] dark:text-[#A2A9A5] truncate max-w-[340px] font-medium leading-tight mt-0.5">
                {currentPlan.name} • {currentPlan.shortDescription}
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right: Theme Toggle, Quick Search & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search */}
          <div className="relative hidden xl:block w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5D6561] dark:text-[#A2A9A5]" />
            <input
              type="text"
              readOnly
              onClick={() => onNavigate('products')}
              placeholder="Buscar en el sistema..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#FAF8F4] dark:bg-[#222825] border border-[#DCD6CC] dark:border-[#3A433E] rounded-xl text-[#111413] dark:text-[#F5F7F6] placeholder-[#5D6561] dark:placeholder-[#A2A9A5] focus:outline-hidden focus:border-[#C85A32] cursor-pointer hover:border-[#B5AEA1] transition-colors min-h-[40px]"
            />
          </div>

          {/* Theme Toggle Button (Light / Dark) */}
          {onToggleDarkMode && (
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-2.5 text-[#4B524E] dark:text-[#CBD2CE] hover:text-[#C85A32] dark:hover:text-[#FFA07A] bg-[#FAF8F4] dark:bg-[#222825] hover:bg-[#F3EFEA] dark:hover:bg-[#282F2C] border border-[#DCD6CC] dark:border-[#3A433E] rounded-xl transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shadow-2xs"
              title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>
          )}

          {/* Notifications Button */}
          <button
            type="button"
            onClick={() => onNavigate('alerts')}
            className="relative p-2.5 text-[#4B524E] dark:text-[#CBD2CE] hover:bg-[#FAF8F4] dark:hover:bg-[#282F2C] border border-transparent hover:border-[#DCD6CC] dark:hover:border-[#3A433E] rounded-xl transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Ver alertas del sistema"
            aria-label="Ver alertas del sistema"
          >
            <Bell className="w-5 h-5" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#C85A32] text-xs font-bold text-white shadow-xs">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* User profile dropdown / logout */}
          <div className="flex items-center pl-2 border-l border-[#DCD6CC] dark:border-[#2E3531] gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#C85A32] text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)}
            </div>
            <div className="hidden lg:block text-left">
              <span className="block text-xs sm:text-sm font-bold text-[#111413] dark:text-white leading-tight">
                {currentUser.name}
              </span>
              <span className="block text-xs text-[#5D6561] dark:text-[#CBD2CE]">
                {currentUser.role}
              </span>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="p-2 text-[#5D6561] dark:text-[#CBD2CE] hover:text-[#C85A32] dark:hover:text-[#FFA07A] hover:bg-[#FDF7F4] dark:hover:bg-[#282F2C] rounded-xl transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
