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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E3DA]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C85A32] bg-[#FDF7F4] px-2.5 py-0.5 rounded-full border border-[#F3D3C4]">
              Vista General • Sucursal Central
            </span>
            <span className="text-xs text-[#8A908D] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Jueves, 15 de Octubre de 2026
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C201E] tracking-tight">
            Panel Principal
          </h1>
          <p className="text-xs sm:text-sm text-[#595E5B] mt-0.5">
            Resumen comercial del día, rendimiento de ventas y control operativo de tu negocio.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('sales')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C85A32] hover:bg-[#B84C26] active:bg-[#9B3D1D] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm shadow-[#C85A32]/20 transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Terminal POS</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('products')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-[#FAF8F4] text-[#1C201E] text-xs sm:text-sm font-semibold rounded-xl border border-[#E8E3DA] transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#C85A32]" />
            <span>Ver Productos</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('cash-register')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-[#FAF8F4] text-[#1C201E] text-xs sm:text-sm font-semibold rounded-xl border border-[#E8E3DA] transition-all cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-[#8C3C1E]" />
            <span>Caja Diaria</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards (KPIs) in Warm Editorial Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Ventas del día */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8E3DA] shadow-xs hover:border-[#D1C9BC] transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F7572]">
                Ventas del Día
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#FDF7F4] text-[#C85A32] border border-[#F3D3C4] flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-sans text-[#1C201E] tracking-tight">
              {formatCurrency(todaySalesTotal)}
            </div>
            <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#EBF5EF] text-[#246A48] border border-[#CFE7DA]">
              <ArrowUpRight className="w-3 h-3" />
              <span>+14.8% vs. ayer</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F3EFEA] flex justify-between items-center text-[11px]">
            <span className="text-[#8A908D]">5 tickets emitidos</span>
            <button
              type="button"
              onClick={() => onNavigate('sales')}
              className="font-bold text-[#C85A32] hover:underline cursor-pointer"
            >
              Ver tickets &rarr;
            </button>
          </div>
        </div>

        {/* Card 2: Cantidad de productos */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8E3DA] shadow-xs hover:border-[#D1C9BC] transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F7572]">
                Productos en Catálogo
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#F4F6F8] text-[#2C4A6F] border border-[#D5DEE7] flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-sans text-[#1C201E] tracking-tight">
              {totalProductsCount} <span className="text-sm font-normal text-[#8A908D]">artículos</span>
            </div>
            <p className="text-[11px] text-[#595E5B] mt-2">
              Categorías: Almacén, Bebidas, Lácteos
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F3EFEA] flex justify-between items-center text-[11px]">
            <span className="text-[#8A908D]">3 sucursales</span>
            <button
              type="button"
              onClick={() => onNavigate('products')}
              className="font-bold text-[#C85A32] hover:underline cursor-pointer"
            >
              Ver catálogo &rarr;
            </button>
          </div>
        </div>

        {/* Card 3: Productos con stock bajo */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8E3DA] shadow-xs hover:border-[#D1C9BC] transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F7572]">
                Stock Bajo o Crítico
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#FEF6E9] text-[#9A6216] border border-[#FCE3B8] flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-sans text-[#B84C26] tracking-tight">
              {lowStockCount} <span className="text-sm font-normal text-[#8A908D]">alertas</span>
            </div>
            <p className="text-[11px] text-[#9B3D1D] mt-2 font-medium">
              1 artículo con quiebre total (0 unid.)
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F3EFEA] flex justify-between items-center text-[11px]">
            <span className="text-[#8A908D]">Reposición sugerida</span>
            <button
              type="button"
              onClick={() => onNavigate('inventory')}
              className="font-bold text-[#C85A32] hover:underline cursor-pointer"
            >
              Control de stock &rarr;
            </button>
          </div>
        </div>

        {/* Card 4: Total de clientes */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8E3DA] shadow-xs hover:border-[#D1C9BC] transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F7572]">
                Total de Clientes
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#EBF5EF] text-[#246A48] border border-[#CFE7DA] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-sans text-[#1C201E] tracking-tight">
              {totalCustomersCount} <span className="text-sm font-normal text-[#8A908D]">en padrón</span>
            </div>
            <p className="text-[11px] text-[#246A48] mt-2 font-medium">
              3 con saldo en cuenta corriente
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F3EFEA] flex justify-between items-center text-[11px]">
            <span className="text-[#8A908D]">Minoristas y empresas</span>
            <button
              type="button"
              onClick={() => onNavigate('customers')}
              className="font-bold text-[#C85A32] hover:underline cursor-pointer"
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
          <div className="bg-white rounded-2xl border border-[#E8E3DA] p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#1C201E] flex items-center gap-2">
                  <span>Ritmo de Ventas por Franja Horaria</span>
                </h2>
                <p className="text-xs text-[#6F7572]">Evolución del volumen facturado a lo largo del día (08:00 a 20:00 hs)</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#C85A32] bg-[#FDF7F4] px-2.5 py-1 rounded-md border border-[#F3D3C4]">
                  Pico: 10:00 hs ($48.200)
                </span>
              </div>
            </div>

            {/* Custom Warm Bar Histogram */}
            <div className="pt-2 pb-4">
              <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-40 pt-4 px-2 bg-[#FAF8F4] rounded-xl border border-[#EFEAE0]">
                {hourlyData.map((bar, idx) => (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-bold text-[#6F7572] mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {bar.label}
                    </span>
                    <div className="w-full max-w-[36px] bg-[#E8E3DA] rounded-t-lg overflow-hidden h-28 flex items-end">
                      <div
                        className="w-full bg-[#C85A32] group-hover:bg-[#B84C26] transition-all rounded-t-lg"
                        style={{ height: `${bar.percentage}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-[#8A908D] mt-1.5">
                      {bar.hour}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#F3EFEA] flex flex-wrap items-center justify-between text-xs text-[#6F7572]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#C85A32]"></span>
                Ventas de mostrador emitidas
              </span>
              <span className="font-semibold text-[#1C201E]">
                Total acumulado en franjas: {formatCurrency(todaySalesTotal)}
              </span>
            </div>
          </div>

          {/* Tabla de Últimas Ventas */}
          <div className="bg-white rounded-2xl border border-[#E8E3DA] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#1C201E] flex items-center gap-2">
                  <span>Últimas Ventas Registradas</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FAF8F4] text-[#6F7572] border border-[#E8E3DA]">
                    Demo
                  </span>
                </h2>
                <p className="text-xs text-[#6F7572]">Comprobantes y tickets recientes del punto de venta</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('sales')}
                className="text-xs font-bold text-[#C85A32] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Ver historial completo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full text-left text-xs min-w-[550px]">
                <thead className="bg-[#FAF8F4] text-[#6F7572] uppercase text-[10px] tracking-wider border-y border-[#E8E3DA]">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">Comprobante</th>
                    <th className="py-2.5 px-3 font-bold">Cliente</th>
                    <th className="py-2.5 px-3 font-bold">Hora</th>
                    <th className="py-2.5 px-3 font-bold">Medio de Pago</th>
                    <th className="py-2.5 px-3 text-right font-bold">Total</th>
                    <th className="py-2.5 px-3 text-center font-bold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3EFEA]">
                  {sales.slice(0, 5).map((sale) => (
                    <tr key={sale.id} className="hover:bg-[#FAF8F4] transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#1C201E] whitespace-nowrap">
                        {sale.ticketNumber}
                      </td>
                      <td className="py-3 px-3 font-medium text-[#2B302D]">
                        {sale.customerName}
                      </td>
                      <td className="py-3 px-3 text-[#6F7572] whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#8A908D]" />
                          {sale.time}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#595E5B] whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 bg-[#FAF8F4] px-2 py-0.5 rounded-md border border-[#E8E3DA] text-[11px]">
                          <CreditCard className="w-3 h-3 text-[#8A908D]" />
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#1C201E] whitespace-nowrap">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sale.paymentMethod === 'Cuenta Corriente'
                              ? 'bg-[#FEF6E9] text-[#9A6216] border border-[#FCE3B8]'
                              : 'bg-[#EBF5EF] text-[#246A48] border border-[#CFE7DA]'
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
          <div className="bg-white rounded-2xl border border-[#E8E3DA] p-5 shadow-xs">
            <h2 className="text-base font-serif font-bold text-[#1C201E] mb-1">
              Actividad Reciente
            </h2>
            <p className="text-xs text-[#6F7572] mb-4">Eventos operativos registrados hoy en Sucursal Central</p>

            <div className="space-y-3.5">
              {[
                {
                  icon: DollarSign,
                  iconBg: 'bg-[#EBF5EF] text-[#246A48]',
                  title: 'Cobro de venta #0004292',
                  time: '10:32 hs',
                  desc: 'Santiago Pérez cobró $6.600 en efectivo',
                },
                {
                  icon: AlertTriangle,
                  iconBg: 'bg-[#FEF6E9] text-[#9A6216]',
                  title: 'Alerta de stock bajo',
                  time: '10:15 hs',
                  desc: 'Gaseosa Cola Clásica llegó a 3 unidades',
                },
                {
                  icon: Receipt,
                  iconBg: 'bg-[#FDF7F4] text-[#C85A32]',
                  title: 'Pago a mensajería registrado',
                  time: '09:40 hs',
                  desc: 'Egreso de caja por $3.200 (cadetería)',
                },
                {
                  icon: CheckCircle,
                  iconBg: 'bg-[#F4F6F8] text-[#2C4A6F]',
                  title: 'Apertura de turno',
                  time: '08:00 hs',
                  desc: 'Fondo de caja inicial: $35.000',
                },
              ].map((act, index) => {
                const Icon = act.icon;
                return (
                  <div key={index} className="flex items-start gap-3 text-xs">
                    <div className={`p-2 rounded-xl ${act.iconBg} shrink-0 mt-0.5`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1C201E]">
                          {act.title}
                        </span>
                        <span className="text-[10px] text-[#8A908D]">{act.time}</span>
                      </div>
                      <p className="text-[11px] text-[#595E5B] mt-0.5 leading-snug">
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
              className="w-full mt-4 py-2.5 text-center text-xs font-bold text-[#7C321B] hover:text-[#C85A32] bg-[#FAF8F4] hover:bg-[#F3EFEA] border border-[#E8E3DA] rounded-xl transition-colors cursor-pointer"
            >
              Ver registro completo de alertas &rarr;
            </button>
          </div>

          {/* Resumen Express de Caja Diaria */}
          <div className="bg-white rounded-2xl border border-[#E8E3DA] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-serif font-bold text-[#1C201E] flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-[#C85A32]" />
                <span>Caja Diaria (Turno Mañana)</span>
              </h3>
              <span className="text-[10px] font-bold bg-[#EBF5EF] text-[#246A48] px-2 py-0.5 rounded-full border border-[#CFE7DA]">
                Abierta
              </span>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex justify-between text-[#595E5B]">
                <span>Fondo inicial de turno:</span>
                <span className="font-bold text-[#1C201E]">{formatCurrency(35000)}</span>
              </div>
              <div className="flex justify-between text-[#595E5B]">
                <span>Ingresos en efectivo:</span>
                <span className="font-bold text-[#246A48]">+{formatCurrency(21600)}</span>
              </div>
              <div className="flex justify-between text-[#595E5B]">
                <span>Retiros / Gastos menores:</span>
                <span className="font-bold text-[#B84C26]">-{formatCurrency(3200)}</span>
              </div>
              <div className="pt-2 border-t border-[#F3EFEA] flex justify-between items-center text-sm">
                <span className="font-bold text-[#1C201E]">Efectivo en gaveta:</span>
                <span className="font-black text-[#C85A32] text-base">{formatCurrency(53400)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('cash-register')}
              className="w-full py-2 text-center text-xs font-semibold text-[#1C201E] hover:text-[#C85A32] bg-[#FAF8F4] hover:bg-[#F3EFEA] border border-[#E8E3DA] rounded-xl transition-colors cursor-pointer"
            >
              Gestionar caja y arqueo
            </button>
          </div>

          {/* Tarjeta Informativa de Próxima Conexión Backend */}
          <div className="bg-[#1C201E] text-white rounded-2xl p-5 border border-[#2B302D] shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C85A32]" />
              <h3 className="font-serif font-bold text-sm text-white">Próxima Conexión Backend</h3>
            </div>
            <p className="text-xs text-[#B8BEBA] leading-relaxed">
              Todos los 16 módulos comerciales cuentan con la estructura React + TypeScript lista para vincularse con base de datos PostgreSQL o Firestore en la siguiente etapa.
            </p>
            <div className="pt-2 border-t border-[#2B302D] flex items-center justify-between text-xs">
              <span className="text-[#868C88]">Estado actual:</span>
              <span className="font-bold text-[#E9B29B]">✓ Front-end editorial listo</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
