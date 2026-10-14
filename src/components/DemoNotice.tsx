import React from 'react';
import { Info, Database } from 'lucide-react';

interface DemoNoticeProps {
  title?: string;
  description?: string;
  compact?: boolean;
}

export const DemoNotice: React.FC<DemoNoticeProps> = ({
  title = 'Entorno de Demostración Activo',
  description = 'Los datos visualizados en esta pantalla son de ejemplo. Esta versión previa permite validar la estructura visual y los flujos de navegación antes de la conexión a una base de datos persistente.',
  compact = false,
}) => {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        <span className="font-semibold">Modo Demostración</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3.5 sm:p-4 text-amber-900 dark:text-amber-200 text-sm shadow-xs flex items-start gap-3">
      <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
        <Info className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-semibold text-sm text-amber-950 dark:text-amber-100">{title}</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-md">
            <Database className="w-3 h-3" />
            Sin base de datos conectada
          </span>
        </div>
        <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
