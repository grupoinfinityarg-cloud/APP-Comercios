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
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
            360
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white tracking-tight text-base">COMERCIOS</span>
              <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded tracking-wide">
                360
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Gestión Comercial Integral</p>
          </div>
        </div>
        {mobileOpen && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="Cerrar navegación"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Menu Filter */}
      <div className="p-3 border-b border-slate-800/60">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar menú (16 secciones)..."
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-800/80 border border-slate-700/60 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Módulos del Sistema ({filteredItems.length})
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
              className={`w-full group flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                    item.badgeColor ||
                    (isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700')
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
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400">
        <div className="flex items-center gap-2 mb-1 text-slate-300 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Fase 1: Estructura & Navegación</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          16 módulos operativos en modo demostración para validación visual.
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
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs transition-opacity"
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
