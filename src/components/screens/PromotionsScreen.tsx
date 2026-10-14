import React, { useState } from 'react';
import { Tag, Plus, Calendar, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { Promotion } from '../../types';

interface PromotionsScreenProps {
  promotions: Promotion[];
}

export const PromotionsScreen: React.FC<PromotionsScreenProps> = ({ promotions: initialPromos }) => {
  const [promos, setPromos] = useState<Promotion[]>(initialPromos);
  const [showModal, setShowModal] = useState(false);

  const togglePromo = (id: string) => {
    setPromos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  return (
    <div className="space-y-6">
      <DemoNotice
        title="Módulo 11: Ofertas y Promociones Comerciales"
        description="Creación de combos, descuentos por volumen, 2x1 y promociones de temporada con activación temporal automática en el punto de venta."
      />

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Ofertas & Promociones
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Reglas de descuento automáticas para ventas de mostrador
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Promoción</span>
        </button>
      </div>

      {/* Promos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {promos.map((promo) => (
          <div
            key={promo.id}
            className={`rounded-2xl p-5 border transition-all ${
              promo.active
                ? 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-bold text-xs">
                {promo.type}
              </span>
              <button
                type="button"
                onClick={() => togglePromo(promo.id)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                  promo.active
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {promo.active ? 'Activa' : 'Pausada'}
              </button>
            </div>

            <h3 className="font-bold text-base text-slate-900 dark:text-white">{promo.title}</h3>

            <p className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/30 p-2 rounded-lg border border-blue-100 dark:border-blue-900/40">
              {promo.discountValue}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
              <div>Aplica a: <strong>{promo.targetCategory}</strong></div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Vigencia: {promo.validFrom} al {promo.validUntil}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Promo Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Configurar Nueva Oferta
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Define el tipo de beneficio comercial que se aplicará en caja.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Aviso de prueba: La promoción se guardará en la base de datos en la fase siguiente.');
                setShowModal(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Título de la promoción
                </label>
                <input
                  type="text"
                  defaultValue="2x1 en Galletitas Seleccionadas"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Promoción
                  </label>
                  <select className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">
                    <option>Descuento %</option>
                    <option>2x1</option>
                    <option>Combo de Artículos</option>
                    <option>Precio Especial</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Rubro alcanzado
                  </label>
                  <select className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">
                    <option>Almacén</option>
                    <option>Bebidas</option>
                    <option>Lácteos</option>
                    <option>Snacks</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Guardar Promoción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
