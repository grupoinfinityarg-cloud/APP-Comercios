import React from 'react';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Users,
  ShoppingCart,
  ArrowUpRight,
  Receipt,
  PlusCircle,
  Clock,
  CheckCircle,
  CreditCard,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { Sale, Product, Customer, NavigationSectionId } from '../../types';

interface DashboardScreenProps {
  sales: Sale[];
  products: Product[];
  customers: Customer[];
  onNavigate: (section: NavigationSectionId) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  sales,
  products,
  customers,
  onNavigate,
}) => {
  // Calculations
  const todaySalesTotal = sales
    .filter((s) => s.date === '2026-10-12')
    .reduce((acc, curr) => acc + curr.total, 0);

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const totalProductsCount = products.length;
  const totalCustomersCount = customers.length;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <DemoNotice
        title="Panel Principal en Modo Demostración"
        description="Métricas calculadas en tiempo de ejecución con datos de ejemplo locales. En las siguientes fases del proyecto, estos valores se sincronizarán directamente con la base de datos de transacciones."
      />

      {/* Screen Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Panel Principal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Resumen comercial del día y estado operativo del negocio
          </p>
        </div>

        {/* Quick Action Buttons (clearly marked or navigating to sections) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('sales')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Punto de Venta</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('products')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>Ver Productos</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('cash-register')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-amber-600" />
            <span>Caja Diaria</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards Requested */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Ventas del día */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs relative overflow-hidden group hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Ventas del Día
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(todaySalesTotal)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
              <span>+14.8% vs. ayer (ejemplo)</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center text-[11px] text-slate-400">
            <span>5 tickets emitidos hoy</span>
            <button
              onClick={() => onNavigate('sales')}
              className="text-blue-600 hover:underline font-semibold"
            >
              Ver tickets
            </button>
          </div>
        </div>

        {/* Card 2: Cantidad de productos */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs relative overflow-hidden group hover:border-indigo-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Cantidad de Productos
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {totalProductsCount} <span className="text-sm font-semibold text-slate-400">ítems</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>Categorías: Almacén, Bebidas, Lácteos</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center text-[11px] text-slate-400">
            <span>En 3 sucursales</span>
            <button
              onClick={() => onNavigate('products')}
              className="text-indigo-600 hover:underline font-semibold"
            >
              Ver catálogo
            </button>
          </div>
        </div>

        {/* Card 3: Productos con stock bajo */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs relative overflow-hidden group hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Stock Bajo / Crítico
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
              {lowStockCount} <span className="text-sm font-semibold text-slate-400">alertas</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-amber-700 dark:text-amber-300">
              <span>1 artículo agotado sin stock</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center text-[11px] text-slate-400">
            <span>Requiere reposición</span>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-amber-600 hover:underline font-semibold"
            >
              Gestionar stock
            </button>
          </div>
        </div>

        {/* Card 4: Total de clientes */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs relative overflow-hidden group hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total de Clientes
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {totalCustomersCount} <span className="text-sm font-semibold text-slate-400">registrados</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <span>3 con saldo en cuenta corriente</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center text-[11px] text-slate-400">
            <span>Minoristas y empresas</span>
            <button
              onClick={() => onNavigate('customers')}
              className="text-emerald-600 hover:underline font-semibold"
            >
              Ver clientes
            </button>
          </div>
        </div>

      </div>

      {/* Main Grid: Últimas ventas + Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Tabla de últimas ventas (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Últimas Ventas Registradas</span>
                <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  Demo
                </span>
              </h2>
              <p className="text-xs text-slate-400">Comprobantes recientes del punto de venta</p>
            </div>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase text-[10px] tracking-wider border-y border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Comprobante</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Hora</th>
                  <th className="py-2.5 px-3">Medio de Pago</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {sales.slice(0, 5).map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {sale.ticketNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {sale.customerName}
                    </td>
                    <td className="py-3 px-3 text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{sale.time}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Actividad reciente & Estado de Caja (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Actividad Reciente */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Actividad Reciente
            </h2>
            <p className="text-xs text-slate-400 mb-4">Eventos operativos registrados hoy</p>

            <div className="space-y-4">
              {[
                {
                  icon: DollarSign,
                  iconBg: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300',
                  title: 'Cobro de venta #0004292',
                  time: '10:32 hs',
                  desc: 'Santiago Pérez cobró $6.600 en efectivo',
                },
                {
                  icon: AlertTriangle,
                  iconBg: 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300',
                  title: 'Alerta de stock bajo',
                  time: '10:15 hs',
                  desc: 'Gaseosa Cola Clásica llegó a 3 unidades',
                },
                {
                  icon: Receipt,
                  iconBg: 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300',
                  title: 'Pago a mensajería registrado',
                  time: '09:40 hs',
                  desc: 'Egreso de caja por $3.200 (cadetería)',
                },
                {
                  icon: CheckCircle,
                  iconBg: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300',
                  title: 'Apertura de turno',
                  time: '08:00 hs',
                  desc: 'Fondo de caja inicial: $35.000',
                },
              ].map((act, index) => {
                const Icon = act.icon;
                return (
                  <div key={index} className="flex items-start gap-3 text-xs">
                    <div className={`p-2 rounded-lg ${act.iconBg} shrink-0 mt-0.5`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {act.title}
                        </span>
                        <span className="text-[10px] text-slate-400">{act.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {act.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => onNavigate('alerts')}
              className="w-full mt-4 py-2 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 bg-slate-50 dark:bg-slate-750 rounded-xl transition-colors"
            >
              Ver registro completo de alertas
            </button>
          </div>

          {/* Quick Access Card */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm border border-blue-800/50">
            <h3 className="font-bold text-sm">Próxima Conexión Backend</h3>
            <p className="text-xs text-blue-200/80 mt-1 leading-relaxed">
              Todos los módulos están listos estructuralmente para conectarse a endpoints REST, GraphQL o base de datos PostgreSQL/Firestore.
            </p>
            <div className="mt-3 pt-3 border-t border-blue-800/60 flex items-center justify-between text-xs">
              <span className="text-blue-300">Estado de arquitectura</span>
              <span className="font-semibold text-emerald-400">✓ Front-end Listo</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
