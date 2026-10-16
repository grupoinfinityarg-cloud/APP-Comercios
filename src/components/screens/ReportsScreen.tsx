import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Package,
  Printer,
  Filter,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Layers,
  Receipt,
  Truck,
  Info,
  FileText,
  X,
  Search,
  FileSpreadsheet,
  Sparkles,
  ShoppingBag,
  Clock,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { Sale, Product, Purchase, CashMovement } from '../../types';
import { DEMO_PURCHASES, DEMO_CASH_MOVEMENTS } from '../../data/demoData';

interface ReportsScreenProps {
  sales: Sale[];
  products: Product[];
  purchases?: Purchase[];
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  sales,
  products,
  purchases = DEMO_PURCHASES,
}) => {
  // Cash movements from demo session
  const cashMovements: CashMovement[] = DEMO_CASH_MOVEMENTS;

  // Period Filter State
  const [periodFilter, setPeriodFilter] = useState<'hoy' | 'semana' | 'mes' | 'personalizado'>('semana');
  const [customStartDate, setCustomStartDate] = useState('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState('2026-10-15');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');

  // Modals & Export feedback
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Determine active date range based on period
  // Note: The demo dataset contains sales from 2026-10-11 and 2026-10-12
  const activeDateRange = useMemo(() => {
    if (periodFilter === 'hoy') {
      return { start: '2026-10-12', end: '2026-10-12', label: 'Hoy (Jornada operativa 12 Oct)' };
    }
    if (periodFilter === 'semana') {
      return { start: '2026-10-06', end: '2026-10-12', label: 'Últimos 7 días (06/10 al 12/10)' };
    }
    if (periodFilter === 'mes') {
      return { start: '2026-10-01', end: '2026-10-31', label: 'Mes actual (Octubre 2026)' };
    }
    return {
      start: customStartDate,
      end: customEndDate,
      label: `Personalizado (${customStartDate} al ${customEndDate})`,
    };
  }, [periodFilter, customStartDate, customEndDate]);

  // Filter sales based on period
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchesDate = sale.date >= activeDateRange.start && sale.date <= activeDateRange.end;
      const isCompleted = sale.status === 'Completada';
      return matchesDate && isCompleted;
    });
  }, [sales, activeDateRange]);

  // Previous period comparison (e.g. if today is 12 Oct, compare with 11 Oct)
  const previousDaySales = useMemo(() => {
    if (periodFilter === 'hoy') {
      return sales.filter((s) => s.date === '2026-10-11' && s.status === 'Completada');
    }
    return [];
  }, [sales, periodFilter]);

  // Filter purchases in period
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      return p.date >= activeDateRange.start && p.date <= activeDateRange.end;
    });
  }, [purchases, activeDateRange]);

  // Total sales revenue and metrics
  const totalRevenue = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + s.total, 0);
  }, [filteredSales]);

  const salesCount = filteredSales.length;
  const averageTicket = salesCount > 0 ? Math.round(totalRevenue / salesCount) : 0;

  // Comparison metric calculation
  const previousRevenue = useMemo(() => {
    return previousDaySales.reduce((acc, s) => acc + s.total, 0);
  }, [previousDaySales]);

  const comparisonPercentage = useMemo(() => {
    if (previousRevenue === 0) return null;
    return Math.round(((totalRevenue - previousRevenue) / previousRevenue) * 100);
  }, [totalRevenue, previousRevenue]);

  // Payment Breakdown
  const paymentBreakdown = useMemo(() => {
    const methodsMap: Record<string, { amount: number; count: number; color: string }> = {
      'Transferencia': { amount: 0, count: 0, color: 'bg-blue-500' },
      'Efectivo': { amount: 0, count: 0, color: 'bg-emerald-500' },
      'Tarjeta de Débito': { amount: 0, count: 0, color: 'bg-indigo-500' },
      'Tarjeta de Crédito': { amount: 0, count: 0, color: 'bg-purple-500' },
      'Cuenta Corriente': { amount: 0, count: 0, color: 'bg-amber-500' },
    };

    filteredSales.forEach((sale) => {
      const method = sale.paymentMethod;
      if (methodsMap[method]) {
        methodsMap[method].amount += sale.total;
        methodsMap[method].count += 1;
      } else {
        methodsMap[method] = { amount: sale.total, count: 1, color: 'bg-slate-500' };
      }
    });

    return Object.entries(methodsMap).map(([method, data]) => {
      const percent = totalRevenue > 0 ? Math.round((data.amount / totalRevenue) * 100) : 0;
      return {
        method,
        amount: data.amount,
        count: data.count,
        percent,
        color: data.color,
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [filteredSales, totalRevenue]);

  // Top Products sold from actual sale items
  const topProducts = useMemo(() => {
    const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {};

    filteredSales.forEach((sale) => {
      if (sale.items && sale.items.length > 0) {
        sale.items.forEach((item) => {
          if (!productStats[item.productName]) {
            productStats[item.productName] = {
              name: item.productName,
              quantity: 0,
              revenue: 0,
            };
          }
          productStats[item.productName].quantity += item.quantity;
          productStats[item.productName].revenue += item.subtotal;
        });
      }
    });

    // If sales have items, sort by revenue
    const list = Object.values(productStats).sort((a, b) => b.revenue - a.revenue);
    if (list.length > 0) {
      const maxRevenue = list[0].revenue || 1;
      return list.map((item) => ({
        ...item,
        percentage: Math.min(100, Math.round((item.revenue / maxRevenue) * 100)),
      }));
    }

    // Default reference top products if no items in range
    return [
      { name: 'Café Tostado en Grano 1kg Premium', quantity: 48, revenue: 552000, percentage: 88 },
      { name: 'Queso Gouda Horma x 1kg', quantity: 34, revenue: 438600, percentage: 70 },
      { name: 'Yerba Mate Despalada Especial 1kg', quantity: 72, revenue: 302400, percentage: 65 },
      { name: 'Aceite de Oliva Extra Virgen 500ml', quantity: 26, revenue: 231400, percentage: 50 },
      { name: 'Dulce de Leche Colonial 400g', quantity: 41, revenue: 131200, percentage: 38 },
    ];
  }, [filteredSales]);

  // Stock and Inventory Valuation Metrics
  const totalStockUnits = useMemo(() => {
    return products.reduce((acc, p) => acc + p.stock, 0);
  }, [products]);

  const totalStockCostValuation = useMemo(() => {
    return products.reduce((acc, p) => acc + p.stock * p.costPrice, 0);
  }, [products]);

  const totalStockSaleValuation = useMemo(() => {
    return products.reduce((acc, p) => acc + p.stock * p.salePrice, 0);
  }, [products]);

  const potentialGrossMargin = useMemo(() => {
    if (totalStockSaleValuation === 0) return 0;
    const profit = totalStockSaleValuation - totalStockCostValuation;
    return Math.round((profit / totalStockSaleValuation) * 100);
  }, [totalStockSaleValuation, totalStockCostValuation]);

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stock <= p.minStock);
  }, [products]);

  // Cash register flow metrics (Physical Cash in drawer)
  const cashIncomeTotal = useMemo(() => {
    return cashMovements
      .filter((m) => m.type === 'ingreso' || m.type === 'apertura')
      .reduce((acc, m) => acc + m.amount, 0);
  }, [cashMovements]);

  const cashExpensesTotal = useMemo(() => {
    return cashMovements
      .filter((m) => m.type === 'egreso')
      .reduce((acc, m) => acc + m.amount, 0);
  }, [cashMovements]);

  // Purchases total in period
  const totalPurchasesCost = useMemo(() => {
    return filteredPurchases.reduce((acc, p) => acc + p.total, 0);
  }, [filteredPurchases]);

  // Real client-side CSV Export (Excel Compatible with UTF-8 BOM)
  const handleExportCSV = () => {
    const csvRows: string[] = [];

    // Header
    csvRows.push('COMERCIOS 360 - INFORME COMERCIAL DE GESTION');
    csvRows.push(`Periodo: ${activeDateRange.label}`);
    csvRows.push(`Fecha de emision: ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}`);
    csvRows.push('');

    // Summary Section
    csvRows.push('RESUMEN EJECUTIVO');
    csvRows.push('Concepto,Valor');
    csvRows.push(`Ventas Totales Facturadas,${totalRevenue}`);
    csvRows.push(`Cantidad de Operaciones (Tickets),${salesCount}`);
    csvRows.push(`Ticket Promedio,${averageTicket}`);
    csvRows.push(`Total Compras a Proveedores,${totalPurchasesCost}`);
    csvRows.push(`Valoracion Stock al Costo,${totalStockCostValuation}`);
    csvRows.push(`Valoracion Stock a Precio de Venta,${totalStockSaleValuation}`);
    csvRows.push(`Margen Bruto Potencial (%),${potentialGrossMargin}%`);
    csvRows.push('');

    // Payment Methods Section
    csvRows.push('DISTRIBUCION POR MEDIO DE PAGO');
    csvRows.push('Medio de Pago,Monto (ARS),Tickets,% del Total');
    paymentBreakdown.forEach((pm) => {
      csvRows.push(`"${pm.method}",${pm.amount},${pm.count},${pm.percent}%`);
    });
    csvRows.push('');

    // Sales Detail Section
    csvRows.push('DETALLE DE TICKETS DE VENTA EN EL PERIODO');
    csvRows.push('Ticket,Fecha,Hora,Cliente,Cajero,Medio de Pago,Items,Total (ARS),Estado');
    filteredSales.forEach((s) => {
      csvRows.push(
        `"${s.ticketNumber}","${s.date}","${s.time}","${s.customerName}","${s.cashier}","${s.paymentMethod}",${s.itemsCount},${s.total},"${s.status}"`
      );
    });
    csvRows.push('');

    // Stock Alert Section
    csvRows.push('ARTICULOS CON STOCK CRITICO O BAJO');
    csvRows.push('Producto,SKU,Rubro,Stock Actual,Stock Minimo,Costo Unitario,Precio Venta,Estado');
    lowStockProducts.forEach((p) => {
      csvRows.push(
        `"${p.name}","${p.sku}","${p.category}",${p.stock},${p.minStock},${p.costPrice},${p.salePrice},"${p.status}"`
      );
    });

    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `informe_comercial_${periodFilter}_comercios360.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Informe exportado exitosamente a archivo CSV compatible con Excel.');
  };

  const handlePrint = () => {
    setShowPrintModal(false);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs sm:text-sm animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Screen Notice with Methodological Distinction */}
      <DemoNotice
        title="Módulo 12: Informes Comerciales, Estadísticas y Auditoría"
        description="Métricas consolidadas calculadas a partir de las operaciones del sistema. Se distingue con exactitud la facturación de ventas, el flujo físico de caja, las compras a proveedores y la valorización del inventario."
      />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Informes & Estadísticas
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300">
                Datos Reales en Memoria
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              Análisis financiero, rendimiento del punto de venta y control patrimonial
            </p>
          </div>
        </div>

        {/* Real Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-600 transition-colors cursor-pointer min-h-[44px]"
            title="Descargar archivo CSV compatible con Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Exportar CSV (Excel)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer min-h-[44px]"
          >
            <Printer className="w-4 h-4" />
            <span>Vista Ejecutiva / Imprimir</span>
          </button>
        </div>
      </div>

      {/* Period Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 shrink-0 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Período:
            </span>

            <button
              type="button"
              onClick={() => setPeriodFilter('hoy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[38px] shrink-0 ${
                periodFilter === 'hoy'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
              }`}
            >
              Hoy (12 Oct)
            </button>

            <button
              type="button"
              onClick={() => setPeriodFilter('semana')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[38px] shrink-0 ${
                periodFilter === 'semana'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
              }`}
            >
              Últimos 7 días
            </button>

            <button
              type="button"
              onClick={() => setPeriodFilter('mes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[38px] shrink-0 ${
                periodFilter === 'mes'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
              }`}
            >
              Mes Actual (Octubre)
            </button>

            <button
              type="button"
              onClick={() => setPeriodFilter('personalizado')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[38px] shrink-0 ${
                periodFilter === 'personalizado'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
              }`}
            >
              Personalizado
            </button>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Rango: <strong className="text-slate-800 dark:text-slate-200">{activeDateRange.label}</strong>
          </div>
        </div>

        {/* Custom date range inputs */}
        {periodFilter === 'personalizado' && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Desde:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="p-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white min-h-[38px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Hasta:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="p-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white min-h-[38px]"
              />
            </div>
            {customStartDate > customEndDate && (
              <span className="text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                La fecha 'Desde' debe ser anterior a 'Hasta'.
              </span>
            )}
          </div>
        )}
      </div>

      {/* Top Cards: Resumen de Ventas y Rendimiento */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Ventas Totales */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Ventas Totales</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(totalRevenue)}
          </p>
          <div className="mt-1 text-[11px]">
            {periodFilter === 'hoy' && comparisonPercentage !== null ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{comparisonPercentage}% vs jornada anterior
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {salesCount} tickets registrados
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Ticket Promedio */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Ticket Promedio</span>
            <Receipt className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(averageTicket)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Promedio por compra emitida
          </p>
        </div>

        {/* Card 3: Operaciones Emitidas */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Operaciones</span>
            <ShoppingBag className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {salesCount}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Tickets completados
          </p>
        </div>

        {/* Card 4: Valoración Stock */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Stock al Costo</span>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
            {formatCurrency(totalStockCostValuation)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {totalStockUnits} unidades en catálogo
          </p>
        </div>
      </div>

      {/* Main Grid: Ranking Products & Payment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Products (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Top Artículos por Facturación
            </h2>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
              Desglose en Período
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Productos con mayor ingreso económico en las ventas seleccionadas
          </p>

          <div className="space-y-4">
            {topProducts.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                    {idx + 1}. {item.name}
                  </span>
                  <span className="font-black text-slate-900 dark:text-white shrink-0">
                    {formatCurrency(item.revenue)}{' '}
                    <span className="font-normal text-slate-400">({item.quantity} u.)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Distribución por Medio de Pago
              </h2>
              <PieChart className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Participación porcentual sobre la recaudación de ventas
            </p>

            <div className="space-y-3">
              {paymentBreakdown.map((pm, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                    <span>{pm.method}</span>
                    <span>
                      {pm.percent}% ({pm.count} ops)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${pm.color} rounded-full transition-all`}
                      style={{ width: `${pm.percent}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 text-right font-semibold">
                    {formatCurrency(pm.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Total Recaudado en Mostrador:</span>
            <span className="font-bold text-slate-900 dark:text-white text-xs">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* Distinction & Reconciliation Section: Ventas vs Caja vs Compras */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Conciliación y Separación de Flujos Financieros
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Distingue la facturación de ventas, el dinero en efectivo de caja y los egresos a proveedores
              </p>
            </div>
          </div>
          <span className="text-[11px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg font-semibold shrink-0">
            Regla Contable Estricta
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Box 1: Ventas Facturadas */}
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2">
            <div className="flex items-center justify-between font-bold text-blue-950 dark:text-blue-200">
              <span>1. Ventas Mostrador (POS)</span>
              <Receipt className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-lg font-black text-blue-700 dark:text-blue-300">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              Total facturado en tickets del período. Incluye efectivo, tarjetas y transferencias.
            </p>
          </div>

          {/* Box 2: Movimientos Físicos de Caja */}
          <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
            <div className="flex items-center justify-between font-bold text-emerald-950 dark:text-emerald-200">
              <span>2. Flujo Físico de Caja</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Ingresos turno:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300">
                +{formatCurrency(cashIncomeTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Egresos / Gastos:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                -{formatCurrency(cashExpensesTotal)}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug pt-1 border-t border-emerald-200/50">
              Registra únicamente el dinero en billetes/monedas del mostrador (no se suma a ventas electrónicas).
            </p>
          </div>

          {/* Box 3: Compras a Proveedores */}
          <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 space-y-2">
            <div className="flex items-center justify-between font-bold text-purple-950 dark:text-purple-200">
              <span>3. Compras a Proveedores</span>
              <Truck className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-lg font-black text-purple-700 dark:text-purple-300">
              {formatCurrency(totalPurchasesCost)}
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              Total de órdenes de mercadería recibidas en el período ({filteredPurchases.length} órdenes).
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-[11px] flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500 shrink-0" />
          <span>
            <strong>Aviso de exactitud:</strong> Las ventas son facturación generada por los clientes; los movimientos de caja reflejan el arqueo físico del cajero; y las compras son costos de adquisición de stock. No se mezclan para garantizar reportes auditables.
          </span>
        </div>
      </div>

      {/* Stock Alerts & Inventory Valuation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stock Valuation Summary (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Valorización Patrimonial del Stock
            </h3>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Valuación económica de la mercadería disponible en depósitos y góndolas
          </p>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-slate-600 dark:text-slate-300">Valorización total al costo:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(totalStockCostValuation)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-slate-600 dark:text-slate-300">Valor proyectado a la venta:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalStockSaleValuation)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-slate-600 dark:text-slate-300">Margen bruto potencial:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {potentialGrossMargin}%
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-slate-600 dark:text-slate-300">Unidades totales catalogadas:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {totalStockUnits} u. en {products.length} productos
              </span>
            </div>
          </div>
        </div>

        {/* Low Stock Alert Table (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Artículos con Stock Bajo o Crítico
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Productos que requieren orden de reposición prioritaria
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300">
              {lowStockProducts.length} Alertas
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-3 py-2">Producto</th>
                  <th className="px-3 py-2">Rubro</th>
                  <th className="px-3 py-2 text-center">Stock</th>
                  <th className="px-3 py-2 text-center">Mínimo</th>
                  <th className="px-3 py-2 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {lowStockProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                      No hay artículos con stock crítico en este momento.
                    </td>
                  </tr>
                ) : (
                  lowStockProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/40">
                      <td className="px-3 py-2.5">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{p.sku}</span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">
                        {p.category}
                      </td>
                      <td className="px-3 py-2.5 text-center font-bold text-rose-600 dark:text-rose-400">
                        {p.stock} {p.unit}
                      </td>
                      <td className="px-3 py-2.5 text-center text-slate-500">
                        {p.minStock} {p.unit}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.stock === 0
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {p.stock === 0 ? 'Agotado' : 'Bajo Stock'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: Printable Executive Report Preview */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Vista Previa del Informe Ejecutivo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Document Header */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-base text-slate-900 dark:text-white tracking-tight">
                    COMERCIOS 360
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Emisión: {new Date().toLocaleDateString('es-AR')}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-semibold mt-0.5">
                  Informe de Rendimiento Comercial y Auditoría
                </p>
                <p className="text-[11px] text-slate-400">Período evaluado: {activeDateRange.label}</p>
              </div>

              {/* Summary Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">Resumen de Métricas Clave</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-slate-400 block text-[10px]">Facturación en Ventas:</span>
                    <strong className="text-sm text-slate-900 dark:text-white">
                      {formatCurrency(totalRevenue)}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-slate-400 block text-[10px]">Tickets Completados:</span>
                    <strong className="text-sm text-slate-900 dark:text-white">{salesCount}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-slate-400 block text-[10px]">Ticket Promedio:</span>
                    <strong className="text-sm text-slate-900 dark:text-white">
                      {formatCurrency(averageTicket)}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-slate-400 block text-[10px]">Valoración de Stock al Costo:</span>
                    <strong className="text-sm text-slate-900 dark:text-white">
                      {formatCurrency(totalStockCostValuation)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Payments Summary in Modal */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">Desglose de Medios de Pago</h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                      <tr>
                        <th className="p-2">Medio</th>
                        <th className="p-2 text-center">Operaciones</th>
                        <th className="p-2 text-right">Monto</th>
                        <th className="p-2 text-right">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {paymentBreakdown.map((pm, i) => (
                        <tr key={i}>
                          <td className="p-2 font-medium">{pm.method}</td>
                          <td className="p-2 text-center">{pm.count}</td>
                          <td className="p-2 text-right font-bold">{formatCurrency(pm.amount)}</td>
                          <td className="p-2 text-right">{pm.percent}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-semibold min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm cursor-pointer min-h-[44px]"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar como PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
