import React from 'react';
import { Info, Database } from 'lucide-react';

interface DemoNoticeProps {
  title?: string;
  description?: string;
  compact?: boolean;
}

export const DemoNotice: React.FC<DemoNoticeProps> = ({
  title = 'Entorno de Demostración Activo',
  description = 'Los datos visualizados en esta pantalla son de ejemplo local. Esta versión previa permite validar la estructura visual y los flujos de navegación antes de la conexión a una base de datos persistente.',
  compact = false,
}) => {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FDF7F4] text-[#B84C26] border border-[#F3D3C4]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32] animate-pulse"></span>
        <span>Modo Demostración</span>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F2] border border-[#E8E2D8] rounded-2xl p-4 sm:p-4.5 text-[#1C201E] text-xs shadow-xs flex items-start gap-3.5 transition-all">
      <div className="p-2 bg-[#F3ECE0] rounded-xl text-[#C85A32] shrink-0 mt-0.5">
        <Info className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-bold text-xs sm:text-sm text-[#1C201E] tracking-tight">{title}</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#F4EDE2] text-[#8C3C1E] px-2.5 py-0.5 rounded-full border border-[#E5DAC8]">
            <Database className="w-3 h-3" />
            Sin base de datos conectada
          </span>
        </div>
        <p className="text-xs text-[#595E5B] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
