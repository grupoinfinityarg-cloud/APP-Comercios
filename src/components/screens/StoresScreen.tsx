import React, { useState } from 'react';
import {
  Store,
  Plus,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  Building2,
  Edit2,
  X,
} from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import {
  Store as StoreType,
  CommercialRubroId,
  CommercialEditionTier,
  BusinessConfig,
} from '../../types';
import { COMMERCIAL_RUBROS, getCommercialRubro } from '../../data/commercialRubros';
import {
  COMMERCIAL_EDITIONS,
  getCommercialEdition,
  getEditionBadgeStyle,
} from '../../data/commercialEditions';

interface StoresScreenProps {
  stores: StoreType[];
  activeStore: StoreType;
  onSelectStore: (store: StoreType) => void;
  onUpdateStores?: (stores: StoreType[]) => void;
  businessConfig?: BusinessConfig;
}

export const StoresScreen: React.FC<StoresScreenProps> = ({
  stores,
  activeStore,
  onSelectStore,
  onUpdateStores,
  businessConfig,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreType | null>(null);

  // New Store Form State
  const [newStoreForm, setNewStoreForm] = useState({
    name: '',
    code: `SUC-0${stores.length + 1}`,
    address: '',
    city: 'Buenos Aires, CABA',
    phone: '',
    manager: 'Martín Gómez',
    active: true,
    businessTypeId: (businessConfig?.businessTypeId as CommercialRubroId) || 'comercio_general',
    editionTier: (businessConfig?.editionTier as CommercialEditionTier) || 'demo',
  });

  // Edit Store Form State
  const [editStoreForm, setEditStoreForm] = useState<{
    id: string;
    name: string;
    code: string;
    address: string;
    city: string;
    phone: string;
    manager: string;
    active: boolean;
    businessTypeId: CommercialRubroId;
    editionTier: CommercialEditionTier;
  } | null>(null);

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreForm.name.trim()) return;

    const newId = `store-${Date.now()}`;
    const newStore: StoreType = {
      id: newId,
      name: newStoreForm.name.trim(),
      code: newStoreForm.code.trim().toUpperCase() || `SUC-0${stores.length + 1}`,
      address: newStoreForm.address.trim() || 'Av. Corrientes 1000',
      city: newStoreForm.city.trim() || 'Buenos Aires',
      phone: newStoreForm.phone.trim() || '+54 11 0000-0000',
      manager: newStoreForm.manager,
      active: newStoreForm.active,
      businessTypeId: newStoreForm.businessTypeId,
      editionTier: newStoreForm.editionTier,
      totalProducts: 0,
      todaySales: 0,
      terminals: [
        {
          id: `term-${newId}-1`,
          name: 'Caja 1 - Mostrador Principal',
          code: 'POS-01',
          type: 'caja_mostrador',
          active: true,
        },
      ],
    };

    if (onUpdateStores) {
      onUpdateStores([...stores, newStore]);
    }
    setShowModal(false);
    setNewStoreForm({
      name: '',
      code: `SUC-0${stores.length + 2}`,
      address: '',
      city: 'Buenos Aires, CABA',
      phone: '',
      manager: 'Martín Gómez',
      active: true,
      businessTypeId: (businessConfig?.businessTypeId as CommercialRubroId) || 'comercio_general',
      editionTier: (businessConfig?.editionTier as CommercialEditionTier) || 'demo',
    });
  };

  const handleSaveEditStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStoreForm || !editStoreForm.name.trim()) return;

    const updated = stores.map((s) => {
      if (s.id === editStoreForm.id) {
        return {
          ...s,
          name: editStoreForm.name.trim(),
          code: editStoreForm.code.trim().toUpperCase(),
          address: editStoreForm.address.trim(),
          city: editStoreForm.city.trim(),
          phone: editStoreForm.phone.trim(),
          manager: editStoreForm.manager,
          active: editStoreForm.active,
          businessTypeId: editStoreForm.businessTypeId,
          editionTier: editStoreForm.editionTier,
        };
      }
      return s;
    });

    if (onUpdateStores) {
      onUpdateStores(updated);
    }
    setEditStoreForm(null);
  };

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
          const rubroInfo = getCommercialRubro(store.businessTypeId);
          const editionInfo = getCommercialEdition(store.editionTier);
          const editionStyle = getEditionBadgeStyle(store.editionTier);
          return (
            <div
              key={store.id}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/60 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase font-mono">
                      {store.code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      {rubroInfo.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${editionStyle.badgeClass}`}>
                      Plan {editionInfo.badgeLabel}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                        Activo
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                    {store.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setEditStoreForm({
                        id: store.id,
                        name: store.name,
                        code: store.code,
                        address: store.address,
                        city: store.city,
                        phone: store.phone,
                        manager: store.manager,
                        active: store.active,
                        businessTypeId: store.businessTypeId || 'comercio_general',
                        editionTier: store.editionTier || 'demo',
                      })
                    }
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Editar datos y edición de la sucursal"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

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
              </div>

              <div className="mt-4 pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectStore(store)}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
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

      {/* Add Store Modal with Commercial Edition Selector */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Registrar Nuevo Comercio o Sucursal
                </h3>
                <p className="text-xs text-slate-500">
                  Configura los datos del punto de venta y su edición comercial.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nombre comercial *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sucursal Oeste - Ramos Mejía"
                  value={newStoreForm.name}
                  onChange={(e) => setNewStoreForm({ ...newStoreForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Código de Sucursal *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStoreForm.code}
                    onChange={(e) => setNewStoreForm({ ...newStoreForm, code: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Teléfono de contacto
                  </label>
                  <input
                    type="text"
                    placeholder="+54 11 0000-0000"
                    value={newStoreForm.phone}
                    onChange={(e) => setNewStoreForm({ ...newStoreForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    placeholder="Av. de Mayo 880"
                    value={newStoreForm.address}
                    onChange={(e) => setNewStoreForm({ ...newStoreForm, address: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Ciudad / Localidad
                  </label>
                  <input
                    type="text"
                    value={newStoreForm.city}
                    onChange={(e) => setNewStoreForm({ ...newStoreForm, city: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Rubro selector */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rubro Comercial *
                </label>
                <select
                  value={newStoreForm.businessTypeId}
                  onChange={(e) =>
                    setNewStoreForm({
                      ...newStoreForm,
                      businessTypeId: e.target.value as CommercialRubroId,
                    })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  {COMMERCIAL_RUBROS.map((rubro) => (
                    <option key={rubro.id} value={rubro.id}>
                      {rubro.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Edición Comercial selector (DEMO, BÁSICA, AVANZADA, FULL) */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Edición Comercial de la Sucursal *
                </label>
                <select
                  value={newStoreForm.editionTier}
                  onChange={(e) =>
                    setNewStoreForm({
                      ...newStoreForm,
                      editionTier: e.target.value as CommercialEditionTier,
                    })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  {COMMERCIAL_EDITIONS.map((ed) => (
                    <option key={ed.id} value={ed.id}>
                      {ed.badgeLabel} — {ed.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {getCommercialEdition(newStoreForm.editionTier).shortDescription}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                >
                  Guardar Sucursal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Store Modal with Commercial Edition Selector */}
      {editStoreForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Editar Sucursal Comercial
                </h3>
                <p className="text-xs text-slate-500">
                  Modifica los parámetros y la edición asignada a este comercio.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditStoreForm(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStore} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nombre comercial *
                </label>
                <input
                  type="text"
                  required
                  value={editStoreForm.name}
                  onChange={(e) => setEditStoreForm({ ...editStoreForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Código de Sucursal *
                  </label>
                  <input
                    type="text"
                    required
                    value={editStoreForm.code}
                    onChange={(e) => setEditStoreForm({ ...editStoreForm, code: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Teléfono de contacto
                  </label>
                  <input
                    type="text"
                    value={editStoreForm.phone}
                    onChange={(e) => setEditStoreForm({ ...editStoreForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={editStoreForm.address}
                    onChange={(e) => setEditStoreForm({ ...editStoreForm, address: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Ciudad / Localidad
                  </label>
                  <input
                    type="text"
                    value={editStoreForm.city}
                    onChange={(e) => setEditStoreForm({ ...editStoreForm, city: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Rubro selector */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rubro Comercial *
                </label>
                <select
                  value={editStoreForm.businessTypeId}
                  onChange={(e) =>
                    setEditStoreForm({
                      ...editStoreForm,
                      businessTypeId: e.target.value as CommercialRubroId,
                    })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  {COMMERCIAL_RUBROS.map((rubro) => (
                    <option key={rubro.id} value={rubro.id}>
                      {rubro.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Edición Comercial selector (DEMO, BÁSICA, AVANZADA, FULL) */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Edición Comercial de la Sucursal *
                </label>
                <select
                  value={editStoreForm.editionTier}
                  onChange={(e) =>
                    setEditStoreForm({
                      ...editStoreForm,
                      editionTier: e.target.value as CommercialEditionTier,
                    })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  {COMMERCIAL_EDITIONS.map((ed) => (
                    <option key={ed.id} value={ed.id}>
                      {ed.badgeLabel} — {ed.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {getCommercialEdition(editStoreForm.editionTier).shortDescription}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditStoreForm(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
