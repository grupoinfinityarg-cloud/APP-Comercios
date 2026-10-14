import React, { useState } from 'react';
import {
  ShoppingCart,
  Receipt,
  Search,
  Plus,
  CreditCard,
  DollarSign,
  Printer,
  FileText,
  User,
  Clock,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { Sale, Product, Customer } from '../../types';

interface SalesScreenProps {
  sales: Sale[];
  products: Product[];
  customers: Customer[];
  onAddSale: (sale: Sale) => void;
}

export const SalesScreen: React.FC<SalesScreenProps> = ({
  sales,
  products,
  customers,
  onAddSale,
}) => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'pos'>('tickets');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<Sale | null>(null);

  // POS State
  const [posCart, setPosCart] = useState<{ product: Product; quantity: number }[]>([
    { product: products[0], quantity: 2 },
    { product: products[2], quantity: 1 },
  ]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<Sale['paymentMethod']>('Efectivo');

  const filteredSales = sales.filter(
    (s) =>
      s.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cartTotal = posCart.reduce((acc, item) => acc + item.product.salePrice * item.quantity, 0);

  const handleAddToCart = (product: Product) => {
    setPosCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setPosCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleFinalizeSale = () => {
    if (posCart.length === 0) return;
    const customer = customers.find((c) => c.id === selectedCustomerId) || customers[0];
    const newTicketNumber = `FC-B-0001-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const newSale: Sale = {
      id: `sal-${Date.now()}`,
      ticketNumber: newTicketNumber,
      date: '2026-10-12',
      time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      customerName: customer.name,
      itemsCount: posCart.reduce((sum, item) => sum + item.quantity, 0),
      total: cartTotal,
      paymentMethod,
      status: 'Completada',
      cashier: 'Santiago Pérez',
      storeName: 'Sucursal Central',
    };

    onAddSale(newSale);
    setPosCart([]);
    setSelectedSaleDetail(newSale);
    setActiveTab('tickets');
  };

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
        title="Módulo 5: Ventas y Punto de Venta (POS)"
        description="Emisión de comprobantes fiscales de prueba, selección rápida de artículos en mostrador, cálculo automático de totales y registro de medios de pago."
      />

      {/* Screen Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Ventas & Punto de Venta
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Control de tickets emitidos y terminal de caja rápida
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('tickets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'tickets'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Historial de Tickets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'pos'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Terminal POS (Caja)</span>
          </button>
        </div>
      </div>

      {activeTab === 'tickets' ? (
        /* TAB 1: TICKETS HISTORY */
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs flex items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar ticket o cliente..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="text-xs text-slate-500">
              Mostrando {filteredSales.length} ventas de prueba
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-3">Fecha y Hora</th>
                    <th className="py-3 px-3">Cliente</th>
                    <th className="py-3 px-3">Ítems</th>
                    <th className="py-3 px-3">Forma de Pago</th>
                    <th className="py-3 px-3">Cajero</th>
                    <th className="py-3 px-3 text-right">Total</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {sale.ticketNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {sale.date} • {sale.time}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                        {sale.customerName}
                      </td>
                      <td className="py-3 px-3 text-slate-500">{sale.itemsCount} u.</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-[11px] font-medium">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">{sale.cashier}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white text-sm">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedSaleDetail(sale)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 transition-colors"
                        >
                          Ver Comprobante
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: TERMINAL POS INTERACTIVA */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Product Selector (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">
                Catálogo Rápido de Mostrador
              </h2>
              <span className="text-[11px] text-slate-400">Haz clic en un artículo para sumar al carrito</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleAddToCart(p)}
                  className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50 dark:bg-slate-900/50 hover:bg-blue-50/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">{p.category}</span>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1 line-clamp-2">
                      {p.name}
                    </h4>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Stock: {p.stock}</span>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                      {formatCurrency(p.salePrice)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Cart & Checkout (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-blue-600" />
                  <span>Ticket Actual</span>
                </h3>
                <span className="text-xs text-slate-400">{posCart.length} productos</span>
              </div>

              {/* Customer Selector */}
              <div className="mt-3">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Cliente Asignado:
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Items List */}
              <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                {posCart.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    El ticket está vacío. Selecciona productos del panel izquierdo.
                  </div>
                ) : (
                  posCart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 text-xs border border-slate-100 dark:border-slate-800"
                    >
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {item.quantity} x {formatCurrency(item.product.salePrice)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(item.product.salePrice * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(item.product.id)}
                          className="text-slate-400 hover:text-rose-500"
                          title="Eliminar ítem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payment & Totals */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Medio de Pago:
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {(['Efectivo', 'Tarjeta de Débito', 'Tarjeta de Crédito', 'Transferencia', 'Cuenta Corriente'] as const).map(
                    (m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className={`py-1.5 px-2 rounded-lg font-medium text-[11px] text-center border transition-all ${
                          paymentMethod === m
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {m}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>TOTAL A COBRAR:</span>
                <span className="text-xl text-blue-600 dark:text-blue-400">
                  {formatCurrency(cartTotal)}
                </span>
              </div>

              <button
                type="button"
                disabled={posCart.length === 0}
                onClick={handleFinalizeSale}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Cobrar & Emitir Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sale Detail Modal */}
      {selectedSaleDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-xs">
            <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-base text-slate-900 dark:text-white">COMERCIOS 360</h3>
              <p className="text-[11px] text-slate-400">{selectedSaleDetail.storeName} • CUIT: 30-71889922-3</p>
              <p className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400 mt-2">
                {selectedSaleDetail.ticketNumber}
              </p>
            </div>

            <div className="py-3 space-y-1.5 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
              <div className="flex justify-between">
                <span>Fecha y Hora:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedSaleDetail.date} - {selectedSaleDetail.time} hs
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cliente:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedSaleDetail.customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Forma de Pago:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedSaleDetail.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cajero Responsable:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedSaleDetail.cashier}
                </span>
              </div>
            </div>

            <div className="py-4 flex justify-between items-center text-base font-black text-slate-900 dark:text-white">
              <span>TOTAL ABONADO:</span>
              <span className="text-lg text-emerald-600 dark:text-emerald-400">
                {formatCurrency(selectedSaleDetail.total)}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 text-center">
              Comprobante de demostración sin validez fiscal legal.
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setSelectedSaleDetail(null)}
                className="w-full py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl"
              >
                Cerrar Comprobante
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
