import React, { useState } from 'react';
import { CreditCard, DollarSign, ArrowUpRight, Search, PlusCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { Customer } from '../../types';

interface CurrentAccountsScreenProps {
  customers: Customer[];
}

export const CurrentAccountsScreen: React.FC<CurrentAccountsScreenProps> = ({ customers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const debtors = customers.filter((c) => c.balance < 0);
  const totalReceivable = debtors.reduce((acc, c) => acc + Math.abs(c.balance), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleOpenPayment = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowPaymentModal(true);
  };

  return (
    <div className="space-y-6">
      <DemoNotice
        title="Módulo 8: Cuentas Corrientes y Créditos a Clientes"
        description="Control de financiamiento comercial ('fiado' / cuenta corriente), límites de crédito, registro de entregas a cuenta y estado de morosidad."
      />

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Cuentas Corrientes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Saldos pendientes de cobro y registro de pagos recibidos
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedCustomer(debtors[0] || customers[0]);
            setShowPaymentModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Registrar Cobranza</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Total a Cobrar en la Calle
          </span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {formatCurrency(totalReceivable)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Distribuidos en {debtors.length} clientes</span>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Cuentas en Estado Moroso
          </span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            1 cliente
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Superó el límite de crédito acordado</span>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Cobranzas del Mes
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(15000)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Ingresadas a caja hoy</span>
        </div>
      </div>

      {/* Debtors List Table */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white">
            Listado de Cuentas con Saldo Pendiente
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-3">Documento</th>
                <th className="py-3 px-3 text-right">Límite Otorgado</th>
                <th className="py-3 px-3 text-right">Saldo Deudor</th>
                <th className="py-3 px-3 text-center">Uso de Límite</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {debtors.map((c) => {
                const debt = Math.abs(c.balance);
                const percent = Math.min(100, Math.round((debt / c.creditLimit) * 100));
                const isOverLimit = debt > c.creditLimit;

                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {c.name}
                      <span className="block text-[11px] font-normal text-slate-400">{c.phone}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{c.document}</td>
                    <td className="py-3 px-3 text-right font-medium text-slate-500">
                      {formatCurrency(c.creditLimit)}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-rose-600 dark:text-rose-400 text-sm">
                      -{formatCurrency(debt)}
                    </td>
                    <td className="py-3 px-3 text-center min-w-[120px]">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isOverLimit ? 'bg-rose-500' : 'bg-blue-600'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {percent}% utilizado {isOverLimit && '(Excedido)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenPayment(c)}
                        className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Cobrar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Receipt Modal */}
      {showPaymentModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Registrar Recibo de Cobranza
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Abono a cuenta corriente de: <strong>{selectedCustomer.name}</strong>
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(`Cobro registrado para ${selectedCustomer.name}. Impacto simulado en caja.`);
                setShowPaymentModal(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Monto Cobrado ($)
                </label>
                <input
                  type="number"
                  defaultValue={Math.min(Math.abs(selectedCustomer.balance), 10000)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Medio de Pago
                </label>
                <select className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">
                  <option>Efectivo</option>
                  <option>Transferencia Bancaria</option>
                  <option>Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Observaciones / Nro de Transferencia
                </label>
                <input
                  type="text"
                  placeholder="Ej: Comprobante Banco Galicia #48921"
                  defaultValue="Pago a cuenta parcial en mostrador"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                >
                  Confirmar Cobro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
