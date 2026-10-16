import React, { useState } from 'react';
import {
  LayoutDashboard,
  Store,
  Package,
  Boxes,
  ShoppingCart,
  Receipt,
  Users,
  CreditCard,
  Truck,
  ShoppingBag,
  Tag,
  BarChart3,
  UserCheck,
  Bell,
  Megaphone,
  Settings,
  X,
  Search,
  ShieldCheck,
  History,
} from 'lucide-react';
import { NAVIGATION_ITEMS } from '../data/navigation';
import { NavigationSectionId } from '../types';

interface SidebarProps {
  currentSection: NavigationSectionId;
  onSelectSection: (section: NavigationSectionId) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Store,
  Package,
  Boxes,
  ShoppingCart,
  Receipt,
  Users,
  CreditCard,
  Truck,
  ShoppingBag,
  Tag,
  BarChart3,
  UserCheck,
  Bell,
  Megaphone,
  Settings,
  ShieldCheck,
  History,
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  mobileOpen,
  onCloseMobile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = NAVIGATION_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#161A18] text-[#E5E9E6] border-r border-[#2E3531] select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-[#2E3531] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C85A32] flex items-center justify-center text-white font-black text-xl shadow-md shadow-[#C85A32]/30 shrink-0">
            360
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white tracking-tight text-lg">COMERCIOS</span>
              <span className="bg-[#C85A32] text-white text-xs font-black px-1.5 py-0.5 rounded tracking-wide">
                360
              </span>
            </div>
            <p className="text-xs text-[#CBD2CE] font-medium">Gestión Comercial Integral</p>
          </div>
        </div>
        {mobileOpen && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-2 text-[#CBD2CE] hover:text-white rounded-xl hover:bg-[#282F2C] cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Cerrar navegación"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Menu Filter */}
      <div className="p-3 border-b border-[#2E3531]">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A2A9A5]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar sección en el sistema..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#222825] border border-[#3A433E] rounded-xl text-white placeholder-[#A2A9A5] focus:outline-hidden focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] min-h-[40px]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A2A9A5] hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-[#363E3A]">
        <div className="px-3 pb-1 text-xs font-bold uppercase tracking-wider text-[#A2A9A5] flex items-center justify-between">
          <span>Módulos del Sistema</span>
          <span className="text-[11px] font-mono text-[#CBD2CE]">({filteredItems.length})</span>
        </div>

        {filteredItems.map((item) => {
          const Icon = ICON_MAP[item.iconName] || LayoutDashboard;
          const isActive = currentSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectSection(item.id);
                if (mobileOpen) onCloseMobile();
              }}
              className={`w-full group flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all text-left cursor-pointer min-h-[44px] ${
                isActive
                  ? 'bg-[#C85A32] text-white shadow-md shadow-[#C85A32]/30 border-l-4 border-[#FFD2BE]'
                  : 'text-[#E5E9E6] hover:bg-[#282F2C] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-[#A2A9A5] group-hover:text-[#FFA07A]'
                  }`}
                />
                <span className="truncate tracking-tight font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-[#2D3531] text-[#E5E9E6] border border-[#3E4742] group-hover:bg-[#38423D]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer info badge */}
      <div className="p-3.5 sm:p-4 border-t border-[#2E3531] bg-[#111413] text-xs text-[#CBD2CE]">
        <div className="flex items-center gap-2 mb-1 text-white font-bold">
          <ShieldCheck className="w-4 h-4 text-[#C85A32] shrink-0" />
          <span className="tracking-tight">COMERCIOS 360 Activo</span>
        </div>
        <p className="text-[11px] text-[#A2A9A5] leading-relaxed">
          Diseño comercial optimizado para alta visibilidad y contraste.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#161A18]/85 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-80 max-w-[85vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
