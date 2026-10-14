import React from 'react';
import {
  Menu,
  Store as StoreIcon,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Store, Employee, NavigationSectionId } from '../types';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  stores: Store[];
  activeStore: Store;
  onSelectStore: (store: Store) => void;
  currentUser: Employee;
  onLogout: () => void;
  unreadAlertsCount: number;
  onNavigate: (section: NavigationSectionId) => void;
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
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Store Selector */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
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
              className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <StoreIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="text-left hidden sm:block">
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 leading-none">Comercio activo</span>
                <span className="font-semibold truncate max-w-[170px] block">{activeStore.name}</span>
              </div>
              <span className="font-semibold truncate max-w-[120px] sm:hidden block">{activeStore.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {storeDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-sm">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Cambiar punto de venta
                  </p>
                </div>
                {stores.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      onSelectStore(s);
                      setStoreDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-start gap-2.5 transition-colors ${
                      s.id === activeStore.id
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-medium'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <StoreIcon className="w-4 h-4 mt-0.5 shrink-0 opacity-70" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{s.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{s.city} • {s.code}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Demo status tag */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Versión Previa v1.0</span>
          </div>
        </div>

        {/* Center/Right: Quick Search & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search */}
          <div className="relative hidden xl:block w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              readOnly
              onClick={() => onNavigate('products')}
              placeholder="Buscar producto, cliente o ticket..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:border-slate-300 transition-colors"
            />
          </div>

          {/* Notifications Button */}
          <button
            type="button"
            onClick={() => onNavigate('alerts')}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Ver alertas del sistema"
            aria-label="Ver alertas del sistema"
          >
            <Bell className="w-5 h-5" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* User profile dropdown / logout */}
          <div className="flex items-center pl-2 border-l border-slate-200 dark:border-slate-800 gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-xs shadow-xs">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)}
            </div>
            <div className="hidden lg:block text-left">
              <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                {currentUser.name}
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                {currentUser.role}
              </span>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
              title="Cerrar sesión (Demostración)"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
