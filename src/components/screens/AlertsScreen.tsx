import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, ShieldAlert, Clock, Filter, Check } from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { SystemAlert } from '../../types';

interface AlertsScreenProps {
  alerts: SystemAlert[];
  onMarkAllAsRead: () => void;
  onToggleRead: (id: string) => void;
}

export const AlertsScreen: React.FC<AlertsScreenProps> = ({
  alerts,
  onMarkAllAsRead,
  onToggleRead,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('todas');

  const filtered = alerts.filter((a) => {
    if (filterSeverity === 'todas') return true;
    return a.severity === filterSeverity;
  });

  return (
    <div className="space-y-6">
      <DemoNotice
        title="Módulo 14: Alertas y Notificaciones Operativas"
        description="Centro de advertencias inteligentes en tiempo real sobre puntos de quiebre de stock, límites comerciales excedidos y eventos de auditoría."
      />

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Alertas & Notificaciones
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Avisos preventivos del sistema para evitar pérdidas y desabastecimiento
          </p>
        </div>

        <button
          type="button"
          onClick={onMarkAllAsRead}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Marcar todas como leídas</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['todas', 'alta', 'media', 'baja'].map((sev) => (
          <button
            key={sev}
            type="button"
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              filterSeverity === sev
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {sev === 'todas' ? 'Todas las alertas' : `Prioridad ${sev}`}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filtered.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-2xl p-4 sm:p-5 border transition-all flex items-start gap-4 ${
              !alert.isRead
                ? 'bg-white dark:bg-slate-800/90 border-slate-300 dark:border-slate-700 shadow-xs'
                : 'bg-slate-50/60 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-70'
            }`}
          >
            <div
              className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                alert.severity === 'alta'
                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400'
                  : alert.severity === 'media'
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400'
                  : 'bg-blue-100 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {alert.title}
                  </h3>
                  {!alert.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{alert.timestamp}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {alert.description}
              </p>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Módulo: {alert.type}
                </span>

                <button
                  type="button"
                  onClick={() => onToggleRead(alert.id)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {alert.isRead ? 'Marcar como no leída' : 'Marcar como revisada'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
