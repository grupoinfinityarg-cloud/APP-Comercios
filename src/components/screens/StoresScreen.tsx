import React, { useState } from 'react';
import { Store, Plus, MapPin, Phone, User, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { Store as StoreType } from '../../types';

interface StoresScreenProps {
  stores: StoreType[];
  activeStore: StoreType;
  onSelectStore: (store: StoreType) => void;
}

export const StoresScreen: React.FC<StoresScreenProps> = ({
  stores,
  activeStore,
  onSelectStore,
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <DemoNotice
        title="Módulo 2: Mis Comercios y Sucursales"
        description="Permite administrar múltiples sucursales, locales comerciales y depósitos logísticos centralizando precios, stock y usuarios."
      />

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Mis Comercios & Sucursales
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Administra tus puntos de venta físicos, depósitos y franquicias
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Nuevo Comercio</span>
        </button>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stores.map((store) => {
          const isCurrent = store.id === activeStore.id;
          return (
            <div
              key={store.id}
              className={`rounded-2xl p-5 border transition-all ${
                isCurrent
                  ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/60 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase">
                    {store.code}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                      Activo
                    </span>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                {store.name}
              </h3>

              <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{store.address}, {store.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{store.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Encargado: {store.manager}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Artículos asignados</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {store.totalProducts} ítems
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Ventas de hoy</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    ${store.todaySales.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => onSelectStore(store)}
                  className={`w-full py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
                    isCurrent
                      ? 'bg-blue-600 text-white cursor-default'
                      : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {isCurrent ? 'Punto de venta seleccionado' : 'Seleccionar este comercio'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulated Add Store Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Registrar Nuevo Comercio o Sucursal
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Formulario de ejemplo para la integración de sucursales comerciales.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Función de demostración: En la versión con base de datos real este formulario creará el registro persistente.');
                setShowModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nombre comercial
                </label>
                <input
                  type="text"
                  placeholder="Ej: Sucursal Oeste - Ramos Mejía"
                  defaultValue="COMERCIOS 360 - Sucursal Oeste"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Código de Sucursal
                  </label>
                  <input
                    type="text"
                    defaultValue="SUC-03"
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Teléfono de contacto
                  </label>
                  <input
                    type="text"
                    defaultValue="+54 11 4455-8899"
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Dirección y Localidad
                </label>
                <input
                  type="text"
                  defaultValue="Av. de Mayo 880, Ramos Mejía"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-lg text-[11px]">
                <span className="font-semibold block">Aviso de Fase 1:</span>
                Esta ventana ilustra el formulario que conectará con la API backend en la siguiente fase.
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
                  Guardar Sucursal (Demo)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
