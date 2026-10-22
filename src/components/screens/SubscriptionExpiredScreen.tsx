import React from 'react';
import {
  Clock,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Database,
  ArrowRight,
  Sparkles,
  Calendar,
  Store,
  Layers,
  Lock,
} from 'lucide-react';
import {
  CommercialEditionTier,
  ContractOperationType,
  ContractStatus,
} from '../../types';
import {
  getCommercialEdition,
  getEditionBadgeStyle,
} from '../../data/commercialEditions';

export interface SubscriptionExpiredScreenProps {
  /** Nombre comercial de la empresa o local titular */
  merchantName?: string;
  /** Plan comercial que tenía asignado ('demo' | 'basica' | 'avanzada' | 'full') */
  planTier?: CommercialEditionTier;
  /** Tipo de operación: prueba gratuita o contratación comercial */
  operationType?: ContractOperationType;
  /** Fecha de vencimiento registrada en formato ISO o legible */
  expirationDate?: string;
  /** Estado del contrato ('activo' | 'vencido' | 'suspendido') */
  contractStatus?: ContractStatus;
  /** Función opcional de acción comercial (e.g. contactar o solicitar renovación) */
  onAction?: () => void;
  /** Etiqueta personalizada para el botón de acción opcional */
  actionLabel?: string;
}

/**
 * Pantalla informativa de corte comercial cuando una prueba gratuita o
 * contratación comercial finaliza o es suspendida.
 *
 * Diseñada para la administración interna del comercio.
 * Garantiza total transparencia sobre la conservación inalterada de sus datos.
 */
export const SubscriptionExpiredScreen: React.FC<SubscriptionExpiredScreenProps> = ({
  merchantName,
  planTier = 'demo',
  operationType = 'prueba_gratuita',
  expirationDate,
  contractStatus = 'vencido',
  onAction,
  actionLabel,
}) => {
  const currentPlan = getCommercialEdition(planTier);
  const currentPlanStyle = getEditionBadgeStyle(planTier);

  const isSuspended = contractStatus === 'suspendido';
  const isTrial = operationType === 'prueba_gratuita';

  // Formateo seguro de fecha de vencimiento
  const formattedExpirationDate = React.useMemo(() => {
    if (!expirationDate) return null;
    try {
      const parsed = new Date(expirationDate);
      if (Number.isNaN(parsed.getTime())) return expirationDate;
      return parsed.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return expirationDate;
    }
  }, [expirationDate]);

  // Selección de título y subtítulo según la modalidad y el estado
  const headline = React.useMemo(() => {
    if (isSuspended) {
      return {
        badge: 'Acceso Comercial Suspendido',
        badgeBg: 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        title: 'El acceso comercial a COMERCIOS 360 se encuentra suspendido.',
        subtitle:
          'Se ha pausado temporalmente la operatoria comercial de la cuenta. Podés consultar cómo regularizar la situación para restablecer el acceso a las funciones operativas.',
        icon: ShieldAlert,
        iconBg: 'bg-[#FDF2E9] dark:bg-[#2C241B] text-[#C85A32] dark:text-[#FFA07A] border-[#F2D7C5] dark:border-[#4D3A29]',
      };
    }

    if (isTrial) {
      return {
        badge: 'Prueba Gratuita Finalizada',
        badgeBg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
        title: 'Tu período de prueba de COMERCIOS 360 ha finalizado.',
        subtitle:
          'El tiempo de evaluación de todas las funciones ha concluido. Podés consultar las opciones comerciales disponibles para continuar utilizando la aplicación con el plan que mejor se adapte a tu negocio.',
        icon: Clock,
        iconBg: 'bg-[#F4EDE2] dark:bg-[#2A332E] text-[#C85A32] dark:text-[#FFA07A] border-[#E0D5C3] dark:border-[#3D4942]',
      };
    }

    return {
      badge: 'Plan Comercial Vencido',
      badgeBg: 'bg-rose-100 text-rose-900 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      title: 'El período de tu plan comercial ha finalizado.',
      subtitle:
        'La vigencia de tu contratación comercial ha cumplido su ciclo. Podés consultar las alternativas para renovar tu suscripción y reanudar la operatoria comercial diaria.',
      icon: Clock,
      iconBg: 'bg-[#FDF0EC] dark:bg-[#2F211D] text-[#B84C26] dark:text-[#FFA07A] border-[#F5C9BD] dark:border-[#4E2E25]',
    };
  }, [isSuspended, isTrial]);

  const HeaderIcon = headline.icon;
  const visibleMerchantName = merchantName?.trim() || 'Comercio Registrado';

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#121614] text-[#111413] dark:text-[#F5F7F6] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 font-sans transition-colors">
      <div className="w-full max-w-3xl space-y-6 sm:space-y-8 animate-fadeIn">
        {/* Brand Banner Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#DCD6CC] dark:border-[#2E3531]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C85A32] flex items-center justify-center text-white font-black text-base shadow-sm">
              360
            </div>
            <div>
              <span className="font-extrabold text-[#111413] dark:text-white tracking-tight text-base sm:text-lg">
                COMERCIOS
              </span>
              <span className="text-[#C85A32] font-black text-base sm:text-lg ml-1">360</span>
            </div>
          </div>
          <span className="text-xs text-[#5D6561] dark:text-[#CBD2CE] font-semibold">
            Aviso de Licencia y Vigencia
          </span>
        </div>

        {/* Main Alert Card */}
        <div className="bg-[#FAF7F2] dark:bg-[#1E2421] border border-[#DCD6CC] dark:border-[#343D38] rounded-3xl p-5 sm:p-8 shadow-sm relative overflow-hidden">
          {/* Subtle decorative background watermark */}
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-[#C85A32]/5 dark:bg-[#C85A32]/10 rounded-full flex items-center justify-center pointer-events-none">
            <Lock className="w-20 h-20 text-[#C85A32]/15 dark:text-[#FFA07A]/15" />
          </div>

          <div className="relative z-10 space-y-6">
            {/* Header info with badge */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#E8E2D9] dark:border-[#2C3530]">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-inner ${headline.iconBg}`}
                >
                  <HeaderIcon className="w-6 h-6" />
                </div>
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${headline.badgeBg}`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {headline.badge}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-serif font-black text-[#111413] dark:text-white tracking-tight mt-1.5">
                    {headline.title}
                  </h1>
                </div>
              </div>

              {/* Establishment Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#161A18] border border-[#DCD6CC] dark:border-[#343D38] shadow-2xs shrink-0">
                <Store className="w-4 h-4 text-[#C85A32]" />
                <span className="text-xs font-bold text-[#111413] dark:text-white truncate max-w-[160px]">
                  {visibleMerchantName}
                </span>
              </div>
            </div>

            {/* Context Subtitle */}
            <p className="text-xs sm:text-sm text-[#4B524E] dark:text-[#CBD2CE] leading-relaxed">
              {headline.subtitle}
            </p>

            {/* Contract & Plan Details Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-white/80 dark:bg-[#161A18]/80 p-3.5 rounded-2xl border border-[#E8E2D9] dark:border-[#2C3530]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5D6561] dark:text-[#A2A9A5] block mb-1">
                  Plan Registrado
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full border leading-none ${currentPlanStyle.badgeClass}`}
                  >
                    {currentPlan.badgeLabel}
                  </span>
                  <span className="text-xs font-bold text-[#111413] dark:text-white truncate">
                    {currentPlan.name}
                  </span>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-[#161A18]/80 p-3.5 rounded-2xl border border-[#E8E2D9] dark:border-[#2C3530]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5D6561] dark:text-[#A2A9A5] block mb-1">
                  Modalidad
                </span>
                <span className="text-xs font-bold text-[#111413] dark:text-white block">
                  {isTrial ? 'Prueba Gratuita' : 'Contratación Comercial'}
                </span>
              </div>

              <div className="bg-white/80 dark:bg-[#161A18]/80 p-3.5 rounded-2xl border border-[#E8E2D9] dark:border-[#2C3530]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5D6561] dark:text-[#A2A9A5] block mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#C85A32]" />
                  Fecha de Vencimiento
                </span>
                <span className="text-xs font-bold font-mono text-[#7C321B] dark:text-[#FFA07A] block">
                  {formattedExpirationDate || 'No informada'}
                </span>
              </div>
            </div>

            {/* CRITICAL NOTICE: Data Preservation Guarantee */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#EBF5EF] dark:bg-[#1A2E22] border-l-4 border-[#2E7D32] dark:border-[#4CAF50] text-[#1B4D20] dark:text-[#A5D6A7] flex items-start gap-3.5">
              <Database className="w-5 h-5 text-[#2E7D32] dark:text-[#81C784] shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
                <strong className="font-bold block text-[#155724] dark:text-[#C8E6C9]">
                  Tus datos comerciales no se eliminan por el vencimiento.
                </strong>
                <p className="text-[#23582B] dark:text-[#B9E0BD]">
                  Los productos, precios, inventario, ventas y configuraciones permanecen conservados en el
                  almacenamiento existente. Al renovar o regularizar el plan, la totalidad de tu información
                  estará lista para continuar operando sin pérdidas de datos.
                </p>
              </div>
            </div>

            {/* Optional Action Flow */}
            {onAction && (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onAction}
                  className="w-full sm:w-auto px-6 py-3 bg-[#C85A32] hover:bg-[#B84C26] active:bg-[#9B3D1D] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#C85A32]/20 transition-all cursor-pointer min-h-[44px]"
                >
                  <span>{actionLabel || 'Consultar Opciones Comerciales'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Informative Subdued Footer */}
        <div className="text-center text-xs text-[#5D6561] dark:text-[#A2A9A5] space-y-1">
          <p>COMERCIOS 360 &copy; 2026 • Plataforma de Gestión Comercial y Puntos de Venta</p>
          <p className="text-[11px] text-[#78807C] dark:text-[#7A837E]">
            Aviso de control de vigencia exclusivo para la administración del establecimiento comercial.
          </p>
        </div>
      </div>
    </div>
  );
};
