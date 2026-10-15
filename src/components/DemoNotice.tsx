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
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FDF7F4] dark:bg-[#282F2C] text-[#B84C26] dark:text-[#FFA07A] border border-[#F3D3C4] dark:border-[#3A433E]">
        <span className="w-2 h-2 rounded-full bg-[#C85A32] animate-pulse"></span>
        <span>Modo Demostración</span>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F2] dark:bg-[#1E2421] border border-[#DCD6CC] dark:border-[#343D38] rounded-2xl p-4 sm:p-5 text-[#111413] dark:text-[#F5F7F6] text-xs sm:text-sm shadow-xs flex items-start gap-3.5 transition-all">
      <div className="p-2.5 bg-[#F3ECE0] dark:bg-[#2A332E] rounded-xl text-[#C85A32] dark:text-[#FFA07A] shrink-0 mt-0.5">
        <Info className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
          <span className="font-bold text-sm sm:text-base text-[#111413] dark:text-white tracking-tight">
            {title}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#F4EDE2] dark:bg-[#2A312D] text-[#8C3C1E] dark:text-[#FFB599] px-2.5 py-1 rounded-full border border-[#D5C7B0] dark:border-[#445049]">
            <Database className="w-3.5 h-3.5" />
            Sin base de datos conectada
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#4B524E] dark:text-[#CBD2CE] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
