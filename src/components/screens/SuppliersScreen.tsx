import React, { useState } from 'react';
import { Truck, Plus, Search, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { Supplier } from '../../types';

interface SuppliersScreenProps {
  suppliers: Supplier[];
}

export const SuppliersScreen: React.FC<SuppliersScreenProps> = ({ suppliers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.cuit.includes(searchTerm) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        title="Módulo 9: Gestión de Proveedores"
        description="Administración de cuentas corrientes con fabricantes y distribuidores mayoristas, condiciones de pago, CUIT y contacto directo."
      />

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Proveedores Comerciales
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Padrón de distribuidores y términos de compra
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por razón social, CUIT o rubro..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="text-xs text-slate-400">
          {filtered.length} proveedores registrados
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Proveedor / Razón Social</th>
                <th className="py-3 px-3">CUIT</th>
                <th className="py-3 px-3">Rubro</th>
                <th className="py-3 px-3">Contacto Comercial</th>
                <th className="py-3 px-3">Plazo de Pago</th>
                <th className="py-3 px-4 text-right">Saldo Adeudado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {s.name}
                    <span className="block text-[11px] font-normal text-slate-400">{s.email}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{s.cuit}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px]">
                      {s.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    <div className="font-medium">{s.contactPerson}</div>
                    <div className="text-[11px] text-slate-400">{s.phone}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-500">{s.paymentTerms}</td>
                  <td className="py-3 px-4 text-right font-bold text-sm">
                    {s.debtBalance > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400">{formatCurrency(s.debtBalance)}</span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400">$0 (Al día)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Registrar Nuevo Proveedor
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Alta de distribuidor para recepción de facturas y mercadería.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Aviso demo: Proveedor guardado para pruebas visuales.');
                setShowAddModal(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Razón Social
                </label>
                <input
                  type="text"
                  defaultValue="Distribuidora Alimentos Central S.A."
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    CUIT
                  </label>
                  <input
                    type="text"
                    defaultValue="30-71990011-2"
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Rubro
                  </label>
                  <input
                    type="text"
                    defaultValue="Abarrotes y Enlatados"
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
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
