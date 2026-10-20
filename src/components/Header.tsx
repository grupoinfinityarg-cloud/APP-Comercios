import React from 'react';
import {
  Menu,
  Store as StoreIcon,
  Bell,
  Search,
  LogOut,
  ChevronDown,
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
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  stores,
  activeStore,
  onSelectStore,
  currentUser,
  onLogout,
  unreadAlertsCount,
  onNavigate,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  const [storeDropdownOpen, setStoreDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setStoreDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#161A18]/95 backdrop-blur-md border-b border-[#DCD6CC] dark:border-[#2E3531] transition-colors">
      <div className="px-3.5 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Mobile hamburger + Store Selector */}
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

          {/* Store Switcher */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
              className="flex items-center gap-2 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold bg-[#FAF8F4] dark:bg-[#222825] hover:bg-[#F3EFEA] dark:hover:bg-[#2C332F] text-[#111413] dark:text-[#F5F7F6] rounded-xl border border-[#DCD6CC] dark:border-[#3A433E] transition-colors cursor-pointer min-h-[44px]"
            >
              <StoreIcon className="w-4 h-4 text-[#C85A32] shrink-0" />
              <div className="text-left hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="block text-[11px] uppercase font-bold tracking-wider text-[#5D6561] dark:text-[#A2A9A5] leading-none">
                    Comercio activo
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border leading-none ${getEditionBadgeStyle(activeStore.editionTier).badgeClass}`}>
                    {getCommercialEdition(activeStore.editionTier).badgeLabel}
                  </span>
                </div>
                <span className="font-bold truncate max-w-[170px] block text-xs sm:text-sm mt-0.5 text-[#111413] dark:text-white">
                  {activeStore.name}
                </span>
              </div>
              <div className="sm:hidden flex items-center gap-1">
                <span className="font-bold truncate max-w-[110px] block text-xs">
                  {activeStore.name}
                </span>
                <span className={`text-[9px] font-bold px-1 py-0.2 rounded border ${getEditionBadgeStyle(activeStore.editionTier).badgeClass}`}>
                  {getCommercialEdition(activeStore.editionTier).badgeLabel}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#5D6561] dark:text-[#A2A9A5]" />
            </button>

            {storeDropdownOpen && (
              <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-[#1E2320] rounded-2xl shadow-xl border border-[#DCD6CC] dark:border-[#3A433E] py-1.5 z-50 text-xs sm:text-sm">
                <div className="px-3.5 py-2 border-b border-[#F3EFEA] dark:border-[#2C332F]">
                  <p className="text-[11px] font-bold text-[#5D6561] dark:text-[#A2A9A5] uppercase tracking-wider">
                    Cambiar punto de venta
                  </p>
                </div>
                {stores.map((s) => {
                  const sEdition = getCommercialEdition(s.editionTier);
                  const sBadge = getEditionBadgeStyle(s.editionTier);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        onSelectStore(s);
                        setStoreDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 text-left flex items-start gap-2.5 transition-colors cursor-pointer min-h-[44px] ${
                        s.id === activeStore.id
                          ? 'bg-[#FDF7F4] dark:bg-[#2C332F] text-[#C85A32] dark:text-[#FFA07A] font-bold border-l-4 border-[#C85A32]'
                          : 'hover:bg-[#FAF8F4] dark:hover:bg-[#282F2C] text-[#111413] dark:text-[#E5E9E6]'
                      }`}
                    >
                      <StoreIcon className="w-4 h-4 mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <p className="truncate font-semibold text-xs sm:text-sm">{s.name}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${sBadge.badgeClass}`}>
                            {sEdition.badgeLabel}
                          </span>
                        </div>
                        <p className="text-xs text-[#5D6561] dark:text-[#A2A9A5]">{s.city} • {s.code}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Edition status tag */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F4] dark:bg-[#222825] border border-[#DCD6CC] dark:border-[#3A433E] text-[#111413] dark:text-[#E5E9E6] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
            <span className="text-[#5D6561] dark:text-[#A2A9A5]">Edición:</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${getEditionBadgeStyle(activeStore.editionTier).badgeClass}`}>
              {getCommercialEdition(activeStore.editionTier).badgeLabel}
            </span>
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
