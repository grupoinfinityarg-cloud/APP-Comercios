import React, { useState } from 'react';
import { ShoppingBag, Plus, Search, FileText, CheckCircle2, Clock, Truck } from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { Purchase, Supplier } from '../../types';

interface PurchasesScreenProps {
  purchases: Purchase[];
  suppliers: Supplier[];
}

export const PurchasesScreen: React.FC<PurchasesScreenProps> = ({ purchases, suppliers }) => {
  const [showAddModal, setShowAddModal] = useState(false);

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
        title="Módulo 10: Compras y Recepción de Mercadería"
        description="Gestión de órdenes de compra, control de facturas de proveedores e ingreso automático al stock general."
      />

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Órdenes de Compra
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Recepción de pedidos mayoristas y facturación de proveedores
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Orden de Compra</span>
        </button>
      </div>

      {/* Purchases Table */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Orden / Factura</th>
                <th className="py-3 px-3">Proveedor</th>
                <th className="py-3 px-3">Fecha</th>
                <th className="py-3 px-3 text-center">Bultos / Unidades</th>
                <th className="py-3 px-3 text-center">Estado Recepción</th>
                <th className="py-3 px-3 text-center">Estado Pago</th>
                <th className="py-3 px-4 text-right">Total Facturado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {purchases.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {p.orderNumber}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    {p.supplierName}
                  </td>
                  <td className="py-3 px-3 text-slate-500">{p.date}</td>
                  <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-300">
                    {p.itemsCount} u.
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        p.status === 'Recibido'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        p.paymentStatus === 'Pagado'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                      }`}
                    >
                      {p.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white text-sm">
                    {formatCurrency(p.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Purchase Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Registrar Compra a Proveedor
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Carga comprobante fiscal para ingresar ítems al stock.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Aviso de demostración: Orden de compra simulada.');
                setShowAddModal(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Proveedor
                </label>
                <select className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">
                  {suppliers.map((s) => (
                    <option key={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Número de Comprobante
                  </label>
                  <input
                    type="text"
                    defaultValue="FC-A-0004-001928"
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Monto Total ($)
                  </label>
                  <input
                    type="number"
                    defaultValue={120000}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Registrar Compra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
