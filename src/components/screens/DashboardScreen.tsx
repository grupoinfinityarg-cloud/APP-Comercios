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
  Store,
  Calendar,
  BarChart2,
  Sparkles,
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

  // Hourly visual sales data for the day
  const hourlyData = [
    { hour: '08:00', amount: 35000, percentage: 70, label: '$35k' },
    { hour: '10:00', amount: 48200, percentage: 95, label: '$48k' },
    { hour: '12:00', amount: 38400, percentage: 76, label: '$38k' },
    { hour: '14:00', amount: 16200, percentage: 32, label: '$16k' },
    { hour: '16:00', amount: 24500, percentage: 48, label: '$24k' },
    { hour: '18:00', amount: 42100, percentage: 84, label: '$42k' },
    { hour: '20:00', amount: 19600, percentage: 39, label: '$19k' },
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Notice Banner */}
      <DemoNotice
        title="Panel Principal en Modo Demostración"
        description="Métricas y datos comerciales simulados en tiempo de ejecución. Permite validar los flujos de navegación, visualización de ventas y resumen operativo antes de la conexión con base de datos."
      />

      {/* Screen Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#DCD6CC] dark:border-[#2E3531]">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B84C26] dark:text-[#FFA07A] bg-[#FDF7F4] dark:bg-[#282F2C] px-3 py-1 rounded-full border border-[#F3D3C4] dark:border-[#3A433E]">
              Vista General • Sucursal Central
            </span>
            <span className="text-xs sm:text-sm font-medium text-[#4B524E] dark:text-[#CBD2CE] flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#C85A32]" />
              Jueves, 15 de Octubre de 2026
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#111413] dark:text-white tracking-tight">
            Panel Principal
          </h1>
          <p className="text-xs sm:text-sm text-[#4B524E] dark:text-[#CBD2CE] mt-0.5">
            Resumen comercial del día, rendimiento de ventas y control operativo de tu negocio.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('sales')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C85A32] hover:bg-[#B84C26] active:bg-[#9B3D1D] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm shadow-[#C85A32]/25 transition-all cursor-pointer min-h-[44px]"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Terminal POS</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('products')}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white dark:bg-[#222825] hover:bg-[#FAF8F4] dark:hover:bg-[#282F2C] text-[#111413] dark:text-white text-xs sm:text-sm font-semibold rounded-xl border border-[#DCD6CC] dark:border-[#3A433E] transition-all cursor-pointer min-h-[44px]"
          >
            <PlusCircle className="w-4 h-4 text-[#C85A32]" />
            <span>Ver Productos</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('cash-register')}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white dark:bg-[#222825] hover:bg-[#FAF8F4] dark:hover:bg-[#282F2C] text-[#111413] dark:text-white text-xs sm:text-sm font-semibold rounded-xl border border-[#DCD6CC] dark:border-[#3A433E] transition-all cursor-pointer min-h-[44px]"
          >
            <Receipt className="w-4 h-4 text-[#C85A32]" />
            <span>Caja Diaria</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards (KPIs) in Warm Editorial Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Ventas del día */}
        <div className="bg-white dark:bg-[#1E2421] rounded-2xl p-5 border border-[#DCD6CC] dark:border-[#343D38] shadow-xs hover:border-[#B5AEA1] dark:hover:border-[#4B5750] transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4B524E] dark:text-[#CBD2CE]">
                Ventas del Día
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#FDF7F4] dark:bg-[#282F2C] text-[#C85A32] border border-[#F3D3C4] dark:border-[#3A433E] flex items-center justify-center">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-sans text-[#111413] dark:text-white tracking-tight">
              {formatCurrency(todaySalesTotal)}
            </div>
            <div className="inline-flex items-center gap-1.5 mt-2.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EBF5EF] dark:bg-[#1C3326] text-[#1C583A] dark:text-[#68D391] border border-[#CFE7DA] dark:border-[#2D5A42]">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+14.8% vs. ayer</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F3EFEA] dark:border-[#2E3531] flex justify-between items-center text-xs sm:text-sm">
            <span className="text-[#5D6561] dark:text-[#A2A9A5]">5 tickets emitidos</span>
            <button
              type="button"
              onClick={() => onNavigate('sales')}
              className="font-bold text-[#C85A32] dark:text-[#FFA07A] hover:underline cursor-pointer min-h-[36px] flex items-center"
            >
              Ver tickets &rarr;
            </button>
          </div>
        </div>

        {/* Card 2: Cantidad de productos */}
        <div className="bg-white dark:bg-[#1E2421] rounded-2xl p-5 border border-[#DCD6CC] dark:border-[#343D38] shadow-xs hover:border-[#B5AEA1] dark:hover:border-[#4B5750] transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4B524E] dark:text-[#CBD2CE]">
                Productos en Catálogo
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#F4F6F8] dark:bg-[#222E3C] text-[#1E3A8A] dark:text-[#93C5FD] border border-[#D5DEE7] dark:border-[#2D4564] flex items-center justify-center">
                <Package className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-sans text-[#111413] dark:text-white tracking-tight">
              {totalProductsCount} <span className="text-sm font-normal text-[#5D6561] dark:text-[#A2A9A5]">artículos</span>
            </div>
            <p className="text-xs sm:text-sm text-[#4B524E] dark:text-[#CBD2CE] mt-2.5">
              Categorías: Almacén, Bebidas, Lácteos
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F3EFEA] dark:border-[#2E3531] flex justify-between items-center text-xs sm:text-sm">
            <span className="text-[#5D6561] dark:text-[#A2A9A5]">3 sucursales</span>
            <button
              type="button"
              onClick={() => onNavigate('products')}
              className="font-bold text-[#C85A32] dark:text-[#FFA07A] hover:underline cursor-pointer min-h-[36px] flex items-center"
            >
              Ver catálogo &rarr;
            </button>
          </div>
        </div>

        {/* Card 3: Productos con stock bajo */}
        <div className="bg-white dark:bg-[#1E2421] rounded-2xl p-5 border border-[#DCD6CC] dark:border-[#343D38] shadow-xs hover:border-[#B5AEA1] dark:hover:border-[#4B5750] transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4B524E] dark:text-[#CBD2CE]">
                Stock Bajo o Crítico
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#FEF6E9] dark:bg-[#382B17] text-[#9A6216] dark:text-[#FBBF24] border border-[#FCE3B8] dark:border-[#5C4524] flex items-center justify-center">
                <AlertTriangle className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-sans text-[#B84C26] dark:text-[#FFA07A] tracking-tight">
              {lowStockCount} <span className="text-sm font-normal text-[#5D6561] dark:text-[#A2A9A5]">alertas</span>
            </div>
            <p className="text-xs sm:text-sm text-[#9B3D1D] dark:text-[#F87171] mt-2.5 font-semibold">
              1 artículo con quiebre total (0 unid.)
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F3EFEA] dark:border-[#2E3531] flex justify-between items-center text-xs sm:text-sm">
            <span className="text-[#5D6561] dark:text-[#A2A9A5]">Reposición sugerida</span>
            <button
              type="button"
              onClick={() => onNavigate('inventory')}
              className="font-bold text-[#C85A32] dark:text-[#FFA07A] hover:underline cursor-pointer min-h-[36px] flex items-center"
            >
              Control de stock &rarr;
            </button>
          </div>
        </div>

        {/* Card 4: Total de clientes */}
        <div className="bg-white dark:bg-[#1E2421] rounded-2xl p-5 border border-[#DCD6CC] dark:border-[#343D38] shadow-xs hover:border-[#B5AEA1] dark:hover:border-[#4B5750] transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4B524E] dark:text-[#CBD2CE]">
                Total de Clientes
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#EBF5EF] dark:bg-[#1C3326] text-[#1C583A] dark:text-[#68D391] border border-[#CFE7DA] dark:border-[#2D5A42] flex items-center justify-center">
                <Users className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-sans text-[#111413] dark:text-white tracking-tight">
              {totalCustomersCount} <span className="text-sm font-normal text-[#5D6561] dark:text-[#A2A9A5]">en padrón</span>
            </div>
            <p className="text-xs sm:text-sm text-[#1C583A] dark:text-[#68D391] mt-2.5 font-semibold">
              3 con saldo en cuenta corriente
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F3EFEA] dark:border-[#2E3531] flex justify-between items-center text-xs sm:text-sm">
            <span className="text-[#5D6561] dark:text-[#A2A9A5]">Minoristas y empresas</span>
            <button
              type="button"
              onClick={() => onNavigate('customers')}
              className="font-bold text-[#C85A32] dark:text-[#FFA07A] hover:underline cursor-pointer min-h-[36px] flex items-center"
            >
              Ver clientes &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Gráfica de Ventas Horarias + Tabla de Últimas Ventas */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Visual Sales Chart (Hourly Evolution) */}
          <div className="bg-white dark:bg-[#1E2421] rounded-2xl border border-[#DCD6CC] dark:border-[#343D38] p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[#111413] dark:text-white flex items-center gap-2">
                  <span>Ritmo de Ventas por Franja Horaria</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#4B524E] dark:text-[#CBD2CE]">
                  Evolución del volumen facturado a lo largo del día (08:00 a 20:00 hs)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#B84C26] dark:text-[#FFA07A] bg-[#FDF7F4] dark:bg-[#282F2C] px-3 py-1.5 rounded-lg border border-[#F3D3C4] dark:border-[#3A433E]">
                  Pico: 10:00 hs ($48.200)
                </span>
              </div>
            </div>

            {/* Custom Warm Bar Histogram */}
            <div className="pt-2 pb-4">
              <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-5 px-3 bg-[#FAF8F4] dark:bg-[#161A18] rounded-xl border border-[#E8E2D8] dark:border-[#2C332F]">
                {hourlyData.map((bar, idx) => (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group">
                    <span className="text-xs font-bold text-[#111413] dark:text-white mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {bar.label}
                    </span>
                    <div className="w-full max-w-[40px] bg-[#DCD6CC] dark:bg-[#2E3531] rounded-t-lg overflow-hidden h-30 flex items-end">
                      <div
                        className="w-full bg-[#C85A32] hover:bg-[#B84C26] transition-all rounded-t-lg shadow-sm"
                        style={{ height: `${bar.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#4B524E] dark:text-[#CBD2CE] mt-2">
                      {bar.hour}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#F3EFEA] dark:border-[#2E3531] flex flex-wrap items-center justify-between text-xs sm:text-sm text-[#4B524E] dark:text-[#CBD2CE] gap-2">
              <span className="flex items-center gap-2 font-medium">
                <span className="w-3 h-3 rounded-xs bg-[#C85A32]"></span>
                Ventas de mostrador emitidas
              </span>
              <span className="font-bold text-[#111413] dark:text-white">
                Total acumulado en franjas: {formatCurrency(todaySalesTotal)}
              </span>
            </div>
          </div>

          {/* Tabla de Últimas Ventas */}
          <div className="bg-white dark:bg-[#1E2421] rounded-2xl border border-[#DCD6CC] dark:border-[#343D38] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[#111413] dark:text-white flex items-center gap-2">
                  <span>Últimas Ventas Registradas</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FAF8F4] dark:bg-[#282F2C] text-[#4B524E] dark:text-[#CBD2CE] border border-[#DCD6CC] dark:border-[#3A433E]">
                    Demo
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-[#4B524E] dark:text-[#CBD2CE]">
                  Comprobantes y tickets recientes del punto de venta
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('sales')}
                className="text-xs sm:text-sm font-bold text-[#C85A32] dark:text-[#FFA07A] hover:underline inline-flex items-center gap-1.5 cursor-pointer min-h-[44px]"
              >
                <span>Ver historial completo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full text-left text-xs sm:text-sm min-w-[550px]">
                <thead className="bg-[#FAF8F4] dark:bg-[#161A18] text-[#4B524E] dark:text-[#CBD2CE] uppercase text-xs tracking-wider border-y border-[#DCD6CC] dark:border-[#2E3531]">
                  <tr>
                    <th className="py-3 px-3 font-bold">Comprobante</th>
                    <th className="py-3 px-3 font-bold">Cliente</th>
                    <th className="py-3 px-3 font-bold">Hora</th>
                    <th className="py-3 px-3 font-bold">Medio de Pago</th>
                    <th className="py-3 px-3 text-right font-bold">Total</th>
                    <th className="py-3 px-3 text-center font-bold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3EFEA] dark:divide-[#2E3531]">
                  {sales.slice(0, 5).map((sale) => (
                    <tr key={sale.id} className="hover:bg-[#FAF8F4] dark:hover:bg-[#282F2C] transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-[#111413] dark:text-white whitespace-nowrap">
                        {sale.ticketNumber}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-[#111413] dark:text-[#E5E9E6]">
                        {sale.customerName}
                      </td>
                      <td className="py-3.5 px-3 text-[#4B524E] dark:text-[#CBD2CE] whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#C85A32]" />
                          {sale.time}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-[#111413] dark:text-[#E5E9E6] whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 bg-[#FAF8F4] dark:bg-[#282F2C] px-2.5 py-1 rounded-md border border-[#DCD6CC] dark:border-[#3A433E] text-xs font-medium">
                          <CreditCard className="w-3.5 h-3.5 text-[#5D6561] dark:text-[#CBD2CE]" />
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-black text-[#111413] dark:text-white whitespace-nowrap text-sm sm:text-base">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            sale.paymentMethod === 'Cuenta Corriente'
                              ? 'bg-[#FEF6E9] dark:bg-[#382B17] text-[#9A6216] dark:text-[#FBBF24] border border-[#FCE3B8] dark:border-[#5C4524]'
                              : 'bg-[#EBF5EF] dark:bg-[#1C3326] text-[#1C583A] dark:text-[#68D391] border border-[#CFE7DA] dark:border-[#2D5A42]'
                          }`}
                        >
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Actividad Reciente + Resumen Caja + Próximos Pasos */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Actividad Reciente */}
          <div className="bg-white dark:bg-[#1E2421] rounded-2xl border border-[#DCD6CC] dark:border-[#343D38] p-5 shadow-xs">
            <h2 className="text-base sm:text-lg font-serif font-bold text-[#111413] dark:text-white mb-1">
              Actividad Reciente
            </h2>
            <p className="text-xs sm:text-sm text-[#4B524E] dark:text-[#CBD2CE] mb-4">
              Eventos operativos registrados hoy en Sucursal Central
            </p>

            <div className="space-y-4">
              {[
                {
                  icon: DollarSign,
                  iconBg: 'bg-[#EBF5EF] dark:bg-[#1C3326] text-[#1C583A] dark:text-[#68D391]',
                  title: 'Cobro de venta #0004292',
                  time: '10:32 hs',
                  desc: 'Santiago Pérez cobró $6.600 en efectivo',
                },
                {
                  icon: AlertTriangle,
                  iconBg: 'bg-[#FEF6E9] dark:bg-[#382B17] text-[#9A6216] dark:text-[#FBBF24]',
                  title: 'Alerta de stock bajo',
                  time: '10:15 hs',
                  desc: 'Gaseosa Cola Clásica llegó a 3 unidades',
                },
                {
                  icon: Receipt,
                  iconBg: 'bg-[#FDF7F4] dark:bg-[#282F2C] text-[#C85A32] dark:text-[#FFA07A]',
                  title: 'Pago a mensajería registrado',
                  time: '09:40 hs',
                  desc: 'Egreso de caja por $3.200 (cadetería)',
                },
                {
                  icon: CheckCircle,
                  iconBg: 'bg-[#F4F6F8] dark:bg-[#222E3C] text-[#1E3A8A] dark:text-[#93C5FD]',
                  title: 'Apertura de turno',
                  time: '08:00 hs',
                  desc: 'Fondo de caja inicial: $35.000',
                },
              ].map((act, index) => {
                const Icon = act.icon;
                return (
                  <div key={index} className="flex items-start gap-3.5 text-xs sm:text-sm">
                    <div className={`p-2.5 rounded-xl ${act.iconBg} shrink-0 mt-0.5`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#111413] dark:text-white text-xs sm:text-sm">
                          {act.title}
                        </span>
                        <span className="text-xs font-mono text-[#5D6561] dark:text-[#CBD2CE]">{act.time}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#4B524E] dark:text-[#CBD2CE] mt-0.5 leading-snug">
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
              className="w-full mt-4 py-3 text-center text-xs sm:text-sm font-bold text-[#B84C26] dark:text-[#FFA07A] hover:text-[#C85A32] bg-[#FAF8F4] dark:bg-[#222825] hover:bg-[#F3EFEA] dark:hover:bg-[#282F2C] border border-[#DCD6CC] dark:border-[#3A433E] rounded-xl transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
            >
              Ver registro completo de alertas &rarr;
            </button>
          </div>

          {/* Resumen Express de Caja Diaria */}
          <div className="bg-white dark:bg-[#1E2421] rounded-2xl border border-[#DCD6CC] dark:border-[#343D38] p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-serif font-bold text-[#111413] dark:text-white flex items-center gap-2">
                <Receipt className="w-4.5 h-4.5 text-[#C85A32]" />
                <span>Caja Diaria (Turno Mañana)</span>
              </h3>
              <span className="text-xs font-bold bg-[#EBF5EF] dark:bg-[#1C3326] text-[#1C583A] dark:text-[#68D391] px-2.5 py-1 rounded-full border border-[#CFE7DA] dark:border-[#2D5A42]">
                Abierta
              </span>
            </div>

            <div className="space-y-2.5 pt-1 text-xs sm:text-sm">
              <div className="flex justify-between text-[#4B524E] dark:text-[#CBD2CE]">
                <span>Fondo inicial de turno:</span>
                <span className="font-bold text-[#111413] dark:text-white">{formatCurrency(35000)}</span>
              </div>
              <div className="flex justify-between text-[#4B524E] dark:text-[#CBD2CE]">
                <span>Ingresos en efectivo:</span>
                <span className="font-bold text-[#1C583A] dark:text-[#68D391]">+{formatCurrency(21600)}</span>
              </div>
              <div className="flex justify-between text-[#4B524E] dark:text-[#CBD2CE]">
                <span>Retiros / Gastos menores:</span>
                <span className="font-bold text-[#B84C26] dark:text-[#F87171]">-{formatCurrency(3200)}</span>
              </div>
              <div className="pt-2.5 border-t border-[#F3EFEA] dark:border-[#2E3531] flex justify-between items-center text-sm sm:text-base">
                <span className="font-bold text-[#111413] dark:text-white">Efectivo en gaveta:</span>
                <span className="font-black text-[#C85A32] dark:text-[#FFA07A] text-lg sm:text-xl">{formatCurrency(53400)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('cash-register')}
              className="w-full py-2.5 text-center text-xs sm:text-sm font-bold text-[#111413] dark:text-white hover:text-[#C85A32] bg-[#FAF8F4] dark:bg-[#222825] hover:bg-[#F3EFEA] dark:hover:bg-[#282F2C] border border-[#DCD6CC] dark:border-[#3A433E] rounded-xl transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
            >
              Gestionar caja y arqueo
            </button>
          </div>

          {/* Tarjeta Informativa de Próxima Conexión Backend */}
          <div className="bg-[#161A18] text-white rounded-2xl p-5 border border-[#2E3531] shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFA07A]" />
              <h3 className="font-serif font-bold text-sm sm:text-base text-white">Próxima Conexión Backend</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#CBD2CE] leading-relaxed">
              Todos los 16 módulos comerciales cuentan con la estructura React + TypeScript lista para vincularse con base de datos en la siguiente etapa.
            </p>
            <div className="pt-2 border-t border-[#2E3531] flex items-center justify-between text-xs sm:text-sm">
              <span className="text-[#A2A9A5]">Estado actual:</span>
              <span className="font-bold text-[#FFA07A]">✓ Front-end editorial listo</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
