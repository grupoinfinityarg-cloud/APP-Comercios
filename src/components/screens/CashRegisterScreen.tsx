import React, { useState } from 'react';
import {
  Receipt,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Lock,
  Unlock,
  Clock,
  User,
  AlertCircle,
} from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { CashMovement } from '../../types';
import { DEMO_CASH_MOVEMENTS } from '../../data/demoData';

export const CashRegisterScreen: React.FC = () => {
  const [movements, setMovements] = useState<CashMovement[]>(DEMO_CASH_MOVEMENTS);
  const [showModal, setShowModal] = useState(false);
  const [movementType, setMovementType] = useState<'ingreso' | 'egreso'>('egreso');

  const initialCash = 35000;
  const totalIn = movements
    .filter((m) => m.type === 'ingreso')
    .reduce((acc, m) => acc + m.amount, 0);
  const totalOut = movements
    .filter((m) => m.type === 'egreso')
    .reduce((acc, m) => acc + m.amount, 0);
  const currentCashInDrawer = initialCash + totalIn - totalOut;

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
        title="Módulo 6: Control de Caja y Arqueos Diarios"
        description="Gestión de turnos de cobro, fondo inicial de cambio, arqueo de efectivo en gaveta y rendición de gastos operativos menores."
      />

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Control de Caja Diaria
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Turno actual: Mañana • Abierto por Santiago Pérez a las 08:00 hs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMovementType('egreso');
              setShowModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5 text-rose-500" />
            <span>Registrar Retiro / Gasto</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMovementType('ingreso');
              setShowModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ingreso Extra</span>
          </button>
        </div>
      </div>

      {/* Cash Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>FONDO DE APERTURA</span>
            <Unlock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {formatCurrency(initialCash)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Iniciado a las 08:00 hs</span>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>INGRESOS EN EFECTIVO</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            +{formatCurrency(totalIn)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Ventas y cobranzas</span>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>RETIROS / GASTOS</span>
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
            -{formatCurrency(totalOut)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">1 gasto asentado</span>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border-2 border-blue-500 shadow-md">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 text-xs font-bold">
            <span>EFECTIVO ESPERADO</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-2">
            {formatCurrency(currentCashInDrawer)}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Saldo físico en gaveta</span>
        </div>
      </div>

      {/* Movement Table */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white">
            Planilla de Movimientos del Turno
          </h2>
          <span className="text-xs text-slate-400">{movements.length} movimientos registrados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Hora</th>
                <th className="py-3 px-3">Tipo</th>
                <th className="py-3 px-3">Concepto / Detalle</th>
                <th className="py-3 px-3">Responsable</th>
                <th className="py-3 px-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {movements.map((mov) => {
                const isPositive = mov.type === 'ingreso' || mov.type === 'apertura';
                return (
                  <tr key={mov.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono">{mov.time} hs</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          mov.type === 'apertura'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                            : mov.type === 'ingreso'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                        }`}
                      >
                        {mov.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">
                      {mov.concept}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{mov.responsible}</td>
                    <td
                      className={`py-3 px-4 text-right font-bold text-sm ${
                        isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isPositive ? '+' : '-'} {formatCurrency(mov.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Registrar {movementType === 'egreso' ? 'Retiro / Gasto de Caja' : 'Ingreso de Efectivo'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Afectará el saldo de efectivo esperado en el arqueo del turno.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Aviso de demostración: Movimiento registrado en memoria para esta sesión previa.');
                setShowModal(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Concepto del movimiento
                </label>
                <input
                  type="text"
                  placeholder="Ej: Pago de flete, compra de insumos de limpieza"
                  defaultValue={movementType === 'egreso' ? 'Compra de insumos de librería' : 'Cambio de billetes chicos'}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Monto ($)
                </label>
                <input
                  type="number"
                  defaultValue={4500}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
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
                  Confirmar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
