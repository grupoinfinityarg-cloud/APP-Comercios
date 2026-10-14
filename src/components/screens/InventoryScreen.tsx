import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Search,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { Product } from '../../types';

interface InventoryScreenProps {
  products: Product[];
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({ products }) => {
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
  const displayedProducts = filterLowStockOnly ? lowStockProducts : products;

  const totalValuation = products.reduce((acc, p) => acc + p.stock * p.costPrice, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      <DemoNotice
        title="Módulo 4: Inventario y Control de Stock"
        description="Seguimiento de existencias físicas, valorización a precio de costo, alertas automáticas de reorden y ajustes por inventario físico."
      />

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Inventario & Control de Stock
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Valuación de existencias, control de mermas y puntos críticos de reposición
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAdjustModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Realizar Ajuste de Stock</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Valorización de Stock (Costo)
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {formatCurrency(totalValuation)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Calculado sobre 8 referencias activas</p>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Artículos Bajo Mínimo
          </span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {lowStockProducts.length} referencias
          </div>
          <p className="text-xs text-slate-500 mt-1">Requieren orden de compra urgente</p>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Quiebre de Stock (Agotados)
          </span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            1 producto
          </div>
          <p className="text-xs text-slate-500 mt-1">0 unidades en góndola</p>
        </div>
      </div>

      {/* Filter toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterLowStockOnly(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              !filterLowStockOnly
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Todos los artículos ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterLowStockOnly(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterLowStockOnly
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Solo con alerta de stock ({lowStockProducts.length})
          </button>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Artículo</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3 text-center">Stock Actual</th>
                <th className="py-3 px-3 text-center">Stock Mínimo</th>
                <th className="py-3 px-3 text-center">Nivel</th>
                <th className="py-3 px-3 text-right">Valuación Costo</th>
                <th className="py-3 px-4 text-center">Acción Sugerida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {displayedProducts.map((p) => {
                const percentage = Math.min(100, Math.round((p.stock / (p.minStock * 2 || 1)) * 100));
                const isUnder = p.stock <= p.minStock;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">SKU: {p.sku}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{p.category}</td>
                    <td className="py-3 px-3 text-center font-bold text-sm">
                      <span className={isUnder ? 'text-rose-600 font-black' : 'text-slate-900 dark:text-white'}>
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-500 font-medium">
                      {p.minStock} {p.unit}
                    </td>
                    <td className="py-3 px-3 text-center min-w-[120px]">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            p.stock === 0
                              ? 'bg-rose-500'
                              : isUnder
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${p.stock === 0 ? 5 : percentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {p.stock === 0 ? 'Sin existencias' : `${percentage}% del óptimo`}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700 dark:text-slate-300">
                      {formatCurrency(p.stock * p.costPrice)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isUnder ? (
                        <button
                          type="button"
                          onClick={() => alert(`Orden de compra sugerida para: ${p.name} (Modo Demo)`)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 transition-colors"
                        >
                          Generar Reposición
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-medium">Nivel Correcto</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Ajuste Manual de Inventario
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Registra entradas por recuento físico o salidas por merma/rotura.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Aviso de demostración: Los ajustes de inventario se sincronizarán en la base de datos en la fase siguiente.');
                setShowAdjustModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Artículo a ajustar
                </label>
                <select className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock actual: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Movimiento
                  </label>
                  <select className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">
                    <option>Entrada (Sobrante/Recuento)</option>
                    <option>Salida (Merma/Rotura)</option>
                    <option>Devolución de Cliente</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    defaultValue={5}
                    min={1}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Motivo / Observaciones
                </label>
                <textarea
                  rows={2}
                  defaultValue="Auditoría física de góndola mensual"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Confirmar Ajuste (Demo)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
