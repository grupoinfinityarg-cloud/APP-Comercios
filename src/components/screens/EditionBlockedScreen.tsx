import React from 'react';
import {
  Lock,
  ArrowLeft,
  Settings,
  Store as StoreIcon,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { Store, NavigationSectionId } from '../../types';
import { NAVIGATION_ITEMS } from '../../data/navigation';
import {
  getCommercialEdition,
  getEditionBadgeStyle,
  getMinimumEditionForSection,
  getSectionCommercialBenefit,
  isSectionAllowedInEdition,
} from '../../data/commercialEditions';

interface EditionBlockedScreenProps {
  sectionId: NavigationSectionId;
  activeStore: Store;
  onNavigate: (section: NavigationSectionId) => void;
  stores?: Store[];
  onSelectStore?: (store: Store) => void;
}

export const EditionBlockedScreen: React.FC<EditionBlockedScreenProps> = ({
  sectionId,
  activeStore,
  onNavigate,
  stores = [],
  onSelectStore,
}) => {
  const navItem = NAVIGATION_ITEMS.find((item) => item.id === sectionId);
  const currentEdition = getCommercialEdition(activeStore?.editionTier);
  const currentEditionStyle = getEditionBadgeStyle(activeStore?.editionTier);
  const requiredEdition = getMinimumEditionForSection(sectionId);
  const requiredEditionStyle = getEditionBadgeStyle(requiredEdition.id);
  const benefit = getSectionCommercialBenefit(sectionId);

  // Sucursales alternativas de la empresa que sí tienen acceso a este módulo
  const accessibleAlternativeStores = stores.filter(
    (s) => s.id !== activeStore.id && isSectionAllowedInEdition(s.editionTier, sectionId)
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-4xl mx-auto py-2 sm:py-6">
      {/* Top Banner & Context */}
      <div className="bg-[#FAF7F2] dark:bg-[#1E2421] border border-[#DCD6CC] dark:border-[#343D38] rounded-3xl p-5 sm:p-8 shadow-sm transition-all relative overflow-hidden">
        {/* Decorative corner icon */}
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-[#C85A32]/5 dark:bg-[#C85A32]/10 rounded-full flex items-center justify-center pointer-events-none">
          <Lock className="w-20 h-20 text-[#C85A32]/20 dark:text-[#FFA07A]/20" />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D9] dark:border-[#2C3530]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F4EDE2] dark:bg-[#2A332E] border border-[#E0D5C3] dark:border-[#3D4942] flex items-center justify-center text-[#C85A32] dark:text-[#FFA07A] shrink-0 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7C321B] dark:text-[#FFB599]">
                  Módulo no disponible en tu plan activo
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  <Shield className="w-3 h-3" />
                  Control de Edición
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-black text-[#111413] dark:text-white tracking-tight mt-1">
                {navItem?.label || benefit.title}
              </h1>
            </div>
          </div>

          {/* Active Store badge */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#161A18] border border-[#DCD6CC] dark:border-[#343D38] shadow-xs shrink-0">
            <StoreIcon className="w-4 h-4 text-[#C85A32]" />
            <div className="text-left">
              <span className="block text-[10px] uppercase font-bold text-[#5D6561] dark:text-[#A2A9A5]">
                Comercio Seleccionado
              </span>
              <span className="text-xs font-bold text-[#111413] dark:text-white block truncate max-w-[150px]">
                {activeStore.name}
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentEditionStyle.badgeClass}`}
            >
              {currentEdition.badgeLabel}
            </span>
          </div>
        </div>

        {/* Comparison: Current vs Required Edition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Current plan card */}
          <div className="bg-white/80 dark:bg-[#161A18]/80 p-4 rounded-2xl border border-[#E8E2D9] dark:border-[#2C3530]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5D6561] dark:text-[#A2A9A5] block mb-1">
              Edición Actual del Comercio
            </span>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${currentEditionStyle.badgeClass}`}
              >
                Plan {currentEdition.badgeLabel}
              </span>
              <span className="text-sm font-bold text-[#111413] dark:text-white">
                {currentEdition.name}
              </span>
            </div>
            <p className="text-xs text-[#5D6561] dark:text-[#CBD2CE] leading-relaxed">
              {currentEdition.shortDescription}
            </p>
          </div>

          {/* Required plan card */}
          <div className="bg-[#FAF3EB] dark:bg-[#252C28] p-4 rounded-2xl border border-[#F0D5C7] dark:border-[#423C36] relative">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C85A32] dark:text-[#FFA07A] block mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Edición Requerida para Desbloquear
            </span>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${requiredEditionStyle.badgeClass}`}
              >
                Plan {requiredEdition.badgeLabel}
              </span>
              <span className="text-sm font-bold text-[#111413] dark:text-white">
                {requiredEdition.name}
              </span>
            </div>
            <p className="text-xs text-[#5D6561] dark:text-[#CBD2CE] leading-relaxed">
              {requiredEdition.shortDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Module Value & Commercial Case Study */}
      <div className="bg-white dark:bg-[#1A201D] border border-[#DCD6CC] dark:border-[#2E3531] rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
        <div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#111413] dark:text-white mb-2">
            ¿Qué aporta el módulo {benefit.title} a tu negocio?
          </h2>
          <p className="text-xs sm:text-sm text-[#4B524E] dark:text-[#CBD2CE] leading-relaxed">
            {benefit.shortBenefit}
          </p>
        </div>

        {/* Key Features of this Module */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {benefit.keyFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#222825] border border-[#EBE5DC] dark:border-[#313B35]"
            >
              <CheckCircle2 className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
              <span className="text-xs font-medium text-[#111413] dark:text-[#E5E9E6]">
                {feat}
              </span>
            </div>
          ))}
        </div>

        {/* Case Study Callout: Dietética y Alimento Balanceado para Mascotas */}
        <div className="bg-[#F7F4EE] dark:bg-[#222A26] border-l-4 border-[#C85A32] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1.5">
            <Layers className="w-4 h-4 text-[#C85A32]" />
            <h3 className="text-xs sm:text-sm font-bold text-[#111413] dark:text-white uppercase tracking-wider">
              Caso Testigo: Dietética y Alimento Balanceado para Mascotas
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#4B524E] dark:text-[#CBD2CE] leading-relaxed">
            {benefit.dieteticaCaseStudy}
          </p>
        </div>

        {/* Alternative stores with access */}
        {accessibleAlternativeStores.length > 0 && onSelectStore && (
          <div className="pt-4 border-t border-[#EAE4DC] dark:border-[#2E3531]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5D6561] dark:text-[#A2A9A5] mb-3">
              Sucursales de tu empresa con acceso a este módulo:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {accessibleAlternativeStores.map((s) => {
                const sBadge = getEditionBadgeStyle(s.editionTier);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSelectStore(s)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#222825] hover:bg-[#F3EFEA] dark:hover:bg-[#2C332F] border border-[#DCD6CC] dark:border-[#3A433E] text-left transition-colors cursor-pointer group"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="block text-xs font-bold text-[#111413] dark:text-white truncate">
                        {s.name}
                      </span>
                      <span className="text-[11px] text-[#5D6561] dark:text-[#A2A9A5]">
                        {s.city}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${sBadge.badgeClass}`}>
                        {getCommercialEdition(s.editionTier).badgeLabel}
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#C85A32] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[#EAE4DC] dark:border-[#2E3531] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#DCD6CC] dark:border-[#3A433E] bg-white dark:bg-[#222825] text-xs sm:text-sm font-bold text-[#111413] dark:text-white hover:bg-[#FAF8F5] dark:hover:bg-[#2B332F] transition-colors cursor-pointer min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Panel Principal
          </button>

          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B34B25] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#C85A32]/20 transition-all cursor-pointer min-h-[44px]"
          >
            <Settings className="w-4 h-4" />
            Ver Ediciones y Parámetros en Configuración
          </button>
        </div>
      </div>
    </div>
  );
};
