import React, { useState } from 'react';
import { Users, Plus, Search, Mail, Phone, MapPin, CreditCard, CheckCircle2 } from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { Customer } from '../../types';

interface CustomersScreenProps {
  customers: Customer[];
}

export const CustomersScreen: React.FC<CustomersScreenProps> = ({ customers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.document.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
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
        title="Módulo 7: Gestión de Clientes"
        description="Padrón unificado de clientes minoristas y corporativos, condiciones fiscales, límites de crédito comercial e historial de compras."
      />

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Padrón de Clientes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Directorio comercial y perfiles de cuenta
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Cliente</span>
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
            placeholder="Buscar por nombre, DNI, CUIT o email..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="text-xs text-slate-400">
          {filteredCustomers.length} clientes en padrón
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Cliente / Razón Social</th>
                <th className="py-3 px-3">Documento</th>
                <th className="py-3 px-3">Contacto</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3 text-right">Límite Crédito</th>
                <th className="py-3 px-3 text-right">Saldo Cuenta</th>
                <th className="py-3 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredCustomers.map((c) => {
                const hasDebt = c.balance < 0;
                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {c.name}
                      <span className="block text-[11px] font-normal text-slate-400">{c.address}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {c.document}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      <div>{c.phone}</div>
                      <div className="text-[10px] text-slate-400">{c.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px]">
                        {c.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500 font-medium">
                      {formatCurrency(c.creditLimit)}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-bold text-sm ${
                        hasDebt ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {formatCurrency(c.balance)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          c.status === 'Activo'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Registrar Nuevo Cliente
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Carga los datos de facturación y contacto para el sistema de ventas.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Aviso de demostración: Cliente guardado en memoria para esta prueba.');
                setShowAddModal(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nombre Completo / Razón Social
                </label>
                <input
                  type="text"
                  placeholder="Ej: Laura Martínez"
                  defaultValue="Laura Martínez"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    DNI o CUIT
                  </label>
                  <input
                    type="text"
                    defaultValue="27-35889912-4"
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Cliente
                  </label>
                  <select className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">
                    <option>Minorista</option>
                    <option>Mayorista</option>
                    <option>Empresa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    defaultValue="+54 11 5544-3322"
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Límite de Crédito ($)
                  </label>
                  <input
                    type="number"
                    defaultValue={50000}
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
                  Guardar Cliente (Demo)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
