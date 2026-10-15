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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E8E3DA] transition-colors">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Store Selector */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-[#595E5B] hover:bg-[#FAF8F4] rounded-xl transition-colors cursor-pointer"
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
              className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-semibold bg-[#FAF8F4] hover:bg-[#F3EFEA] text-[#1C201E] rounded-xl border border-[#E8E3DA] transition-colors cursor-pointer"
            >
              <StoreIcon className="w-4 h-4 text-[#C85A32] shrink-0" />
              <div className="text-left hidden sm:block">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-[#8A908D] leading-none">
                  Comercio activo
                </span>
                <span className="font-bold truncate max-w-[170px] block text-xs mt-0.5">
                  {activeStore.name}
                </span>
              </div>
              <span className="font-bold truncate max-w-[120px] sm:hidden block text-xs">
                {activeStore.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8A908D]" />
            </button>

            {storeDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#E8E3DA] py-1.5 z-50 text-xs">
                <div className="px-3.5 py-2 border-b border-[#F3EFEA]">
                  <p className="text-[10px] font-bold text-[#8A908D] uppercase tracking-wider">
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
                    className={`w-full px-3.5 py-2.5 text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                      s.id === activeStore.id
                        ? 'bg-[#FDF7F4] text-[#C85A32] font-bold'
                        : 'hover:bg-[#FAF8F4] text-[#1C201E]'
                    }`}
                  >
                    <StoreIcon className="w-4 h-4 mt-0.5 shrink-0 opacity-80" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{s.name}</p>
                      <p className="text-[11px] text-[#8A908D]">{s.city} • {s.code}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Demo status tag */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FDF7F4] border border-[#F3D3C4] text-[#C85A32] text-xs font-semibold">
            <Sparkles className="w-3 h-3 text-[#C85A32]" />
            <span>Versión Previa v1.0</span>
          </div>
        </div>

        {/* Center/Right: Quick Search & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search */}
          <div className="relative hidden xl:block w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A908D]" />
            <input
              type="text"
              readOnly
              onClick={() => onNavigate('products')}
              placeholder="Buscar producto, cliente o ticket..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F4] border border-[#E8E3DA] rounded-xl text-[#1C201E] placeholder-[#8A908D] focus:outline-none focus:border-[#C85A32] cursor-pointer hover:border-[#D1C9BC] transition-colors"
            />
          </div>

          {/* Notifications Button */}
          <button
            type="button"
            onClick={() => onNavigate('alerts')}
            className="relative p-2 text-[#595E5B] hover:bg-[#FAF8F4] rounded-xl transition-colors cursor-pointer"
            title="Ver alertas del sistema"
            aria-label="Ver alertas del sistema"
          >
            <Bell className="w-5 h-5" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C85A32] text-[10px] font-bold text-white shadow-xs">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* User profile dropdown / logout */}
          <div className="flex items-center pl-2 border-l border-[#E8E3DA] gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#C85A32] text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)}
            </div>
            <div className="hidden lg:block text-left">
              <span className="block text-xs font-bold text-[#1C201E] leading-tight">
                {currentUser.name}
              </span>
              <span className="block text-[11px] text-[#6F7572]">
                {currentUser.role}
              </span>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 text-[#8A908D] hover:text-[#C85A32] hover:bg-[#FDF7F4] rounded-xl transition-colors cursor-pointer"
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
