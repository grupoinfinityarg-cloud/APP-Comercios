import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  PieChart,
  ArrowUpRight,
  CreditCard,
  Package,
} from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { Sale, Product } from '../../types';

interface ReportsScreenProps {
  sales: Sale[];
  products: Product[];
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ sales, products }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const topProducts = [
    { name: 'Café Tostado en Grano 1kg Premium', sales: 48, revenue: 552000, percentage: 88 },
    { name: 'Queso Gouda Horma x 1kg', sales: 34, revenue: 438600, percentage: 70 },
    { name: 'Yerba Mate Despalada Especial 1kg', sales: 72, revenue: 302400, percentage: 65 },
    { name: 'Aceite de Oliva Extra Virgen 500ml', sales: 26, revenue: 231400, percentage: 50 },
    { name: 'Dulce de Leche Colonial 400g', sales: 41, revenue: 131200, percentage: 38 },
  ];

  const paymentBreakdown = [
    { method: 'Transferencia Bancaria', amount: 118400, percent: 55, color: 'bg-blue-500' },
    { method: 'Efectivo', amount: 41100, percent: 20, color: 'bg-emerald-500' },
    { method: 'Tarjeta de Débito', amount: 24600, percent: 12, color: 'bg-indigo-500' },
    { method: 'Cuenta Corriente', amount: 18900, percent: 9, color: 'bg-amber-500' },
    { method: 'Tarjeta de Crédito', amount: 11500, percent: 4, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <DemoNotice
        title="Módulo 12: Informes Comerciales y Estadísticas"
        description="Métricas consolidadas de rendimiento: ranking de productos más rentables, distribución de ingresos por medio de pago y evolución temporal de facturación."
      />

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Informes & Estadísticas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Análisis de rendimiento comercial y toma de decisiones
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => alert('Función demo: En la fase con backend se generará la exportación a Excel / CSV.')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>
          <button
            type="button"
            onClick={() => alert('Función demo: En la fase con backend se generará el PDF descargable.')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Ticket Promedio
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            $35.750
          </div>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+8% respecto a la semana anterior</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Margen Bruto Estimado
          </span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-2">
            44.2%
          </div>
          <p className="text-xs text-slate-500 mt-1">Rentabilidad promedio sobre catálogo</p>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Rotación de Stock
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            Alta (18 días)
          </div>
          <p className="text-xs text-slate-500 mt-1">Velocidad de renovación de inventario</p>
        </div>
      </div>

      {/* Main Grid: Ranking Products & Payment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 5 Products (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <h2 className="font-bold text-slate-900 dark:text-white text-base mb-1">
            Top 5 Productos con Mayor Facturación
          </h2>
          <p className="text-xs text-slate-400 mb-4">Artículos que más ingresos generaron en el período</p>

          <div className="space-y-4">
            {topProducts.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                    {idx + 1}. {item.name}
                  </span>
                  <span className="font-black text-slate-900 dark:text-white shrink-0">
                    {formatCurrency(item.revenue)} ({item.sales} u.)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <h2 className="font-bold text-slate-900 dark:text-white text-base mb-1">
            Distribución por Medio de Pago
          </h2>
          <p className="text-xs text-slate-400 mb-4">Porcentaje de recaudación por canal</p>

          <div className="space-y-3">
            {paymentBreakdown.map((pm, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  <span>{pm.method}</span>
                  <span>{pm.percent}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${pm.color} rounded-full`} style={{ width: `${pm.percent}%` }} />
                </div>
                <div className="text-[11px] text-slate-400 mt-1 text-right">
                  {formatCurrency(pm.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
