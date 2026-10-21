import React, { useState } from 'react';
import {
  ShoppingCart,
  Receipt,
  Search,
  Plus,
  Minus,
  CreditCard,
  DollarSign,
  Printer,
  FileText,
  User,
  Clock,
  CheckCircle2,
  Trash2,
  Barcode,
  ArrowRight,
  Sparkles,
  Layers,
  X,
  AlertCircle,
  TrendingUp,
  Percent,
  QrCode,
  Smartphone,
  Check,
  ChevronRight,
  Calculator,
  Package,
  Dog,
  Apple,
} from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { Sale, Product, Customer, SaleItem } from '../../types';

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
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'tickets' | 'pos'>('tickets');
  
  // Mobile sub-tab for POS on small screens: 'catalog' | 'cart'
  const [mobilePosView, setMobilePosView] = useState<'catalog' | 'cart'>('catalog');

  // Tab 1: Sales History State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<string>('Todos');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('Todos');
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<Sale | null>(null);

  // Tab 2: POS State
  const [posSearch, setPosSearch] = useState('');
  const [selectedPosCategory, setSelectedPosCategory] = useState('Todas');
  const [posCart, setPosCart] = useState<{ product: Product; quantity: number }[]>([
    { product: products[0] || { id: 'p1', name: 'Café Tostado', salePrice: 11500, stock: 20 } as Product, quantity: 2 },
    { product: products[2] || { id: 'p3', name: 'Yerba Mate Despalada', salePrice: 4200, stock: 58 } as Product, quantity: 1 },
  ]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<Sale['paymentMethod']>('Efectivo');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  
  // Cash Calculator state (when paymentMethod === 'Efectivo')
  const [cashReceived, setCashReceived] = useState<string>('');
  
  // Notification Feedback
  const [saleSuccessNotice, setSaleSuccessNotice] = useState<string | null>(null);
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  // Image error fallback tracking
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const handleImageError = (productId: string) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  // Currency Formatter (es-AR)
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filtered Sales for History
  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.cashier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPayment =
      selectedPaymentFilter === 'Todos' || s.paymentMethod === selectedPaymentFilter;
    const matchesStatus =
      selectedStatusFilter === 'Todos' || s.status === selectedStatusFilter;
    return matchesSearch && matchesPayment && matchesStatus;
  });

  // Filtered Products for POS Catalog
  const posCategories = ['Todas', ...Array.from(new Set(products.map((p) => p.category)))];
  const filteredPosProducts = products.filter((p) => {
    // Exclude inactive products if explicitly marked inactive
    if (p.isActive === false) return false;

    const s = posSearch.toLowerCase().trim();
    const matchesSearch =
      !s ||
      p.name.toLowerCase().includes(s) ||
      p.sku.toLowerCase().includes(s) ||
      p.barcode.includes(s) ||
      (p.brand && p.brand.toLowerCase().includes(s));
    const matchesCategory =
      selectedPosCategory === 'Todas' || p.category === selectedPosCategory;
    return matchesSearch && matchesCategory;
  });

  // Cart Calculations
  const cartGrossSubtotal = posCart.reduce(
    (acc, item) => acc + item.product.salePrice * item.quantity,
    0
  );
  const discountAmount = Math.round((cartGrossSubtotal * discountPercent) / 100);
  const cartFinalTotal = Math.max(0, cartGrossSubtotal - discountAmount);
  const cartTotalItems = posCart.reduce((sum, item) => sum + item.quantity, 0);

  // Cash change calculations
  const parsedCashReceived = parseFloat(cashReceived) || 0;
  const cashChange = parsedCashReceived >= cartFinalTotal ? parsedCashReceived - cartFinalTotal : 0;
  const cashShortage = parsedCashReceived > 0 && parsedCashReceived < cartFinalTotal ? cartFinalTotal - parsedCashReceived : 0;

  // POS Cart Handlers
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

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setPosCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setPosCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setPosCart([]);
    setCashReceived('');
  };

  // Barcode Scanner Simulator
  const handleSimulateScan = () => {
    // Pick an active product from catalog
    const sampleProduct = products[1] || products[0];
    if (sampleProduct) {
      handleAddToCart(sampleProduct);
      setScanFeedback(`Código escaneado: [${sampleProduct.barcode}] - ${sampleProduct.name}`);
      setTimeout(() => setScanFeedback(null), 3500);
    }
  };

  // Finalize Sale (In-memory simulation with full ticket generation)
  const handleFinalizeSale = () => {
    if (posCart.length === 0) return;

    const customer = customers.find((c) => c.id === selectedCustomerId) || customers[0] || {
      name: 'Consumidor Final',
      document: 'DNI s/d',
    };

    // Determine invoice type: Factura A if customer has CUIT, Factura B for final consumers
    const isCUIT = customer.document?.includes('CUIT');
    const invoicePrefix = isCUIT ? 'FC-A-0001' : 'FC-B-0001';
    const newTicketNumber = `${invoicePrefix}-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const lineItems: SaleItem[] = posCart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: item.product.salePrice,
      subtotal: item.product.salePrice * item.quantity,
    }));

    const newSale: Sale = {
      id: `sal-${Date.now()}`,
      ticketNumber: newTicketNumber,
      date: '2026-10-15',
      time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      customerName: customer.name,
      itemsCount: cartTotalItems,
      total: cartFinalTotal,
      paymentMethod,
      status: 'Completada',
      cashier: 'Santiago Pérez',
      storeName: 'Sucursal Central',
      items: lineItems,
    };

    onAddSale(newSale);
    setPosCart([]);
    setCashReceived('');
    setSelectedSaleDetail(newSale);
    setSaleSuccessNotice(`¡Venta registrada con éxito! Comprobante emitido: ${newTicketNumber}`);
    setTimeout(() => setSaleSuccessNotice(null), 5000);
  };

  // KPI Calculations
  const todaySales = sales.filter((s) => s.date === '2026-10-15' || s.date === '2026-10-12');
  const totalFacturadoHoy = todaySales.reduce((acc, s) => acc + s.total, 0);
  const avgTicket = todaySales.length > 0 ? Math.round(totalFacturadoHoy / todaySales.length) : 0;
  const currentAccountSalesCount = sales.filter((s) => s.paymentMethod === 'Cuenta Corriente').length;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Banner de Aviso de Demostración */}
      <DemoNotice
        title="Módulo de Ventas & Terminal de Cobro Rápido"
        description="Emisión de comprobantes de demostración, registro de ventas de mostrador y simulación de tickets. No se efectúan cobros bancarios reales ni transacciones fiscales vinculantes."
      />

      {/* Alerta de Éxito al Emitir Comprobante */}
      {saleSuccessNotice && (
        <div className="p-3.5 bg-[#EBF5EF] border border-[#CFE7DA] text-[#246A48] rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#246A48] shrink-0" />
            <span>{saleSuccessNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaleSuccessNotice(null)}
            className="text-[#246A48] hover:text-[#18452F] p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Alerta de Lector de Código de Barras */}
      {scanFeedback && (
        <div className="p-3 bg-[#FDF7F4] border border-[#F3D3C4] text-[#C85A32] rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Barcode className="w-4 h-4 text-[#C85A32] shrink-0" />
            <span>{scanFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setScanFeedback(null)}
            className="text-[#C85A32] hover:text-[#7C321B] p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Encabezado Editorial del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E3DA]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C85A32] bg-[#FDF7F4] px-2.5 py-0.5 rounded-full border border-[#F3D3C4]">
              Operaciones Comerciales • Sección 5
            </span>
            <span className="text-xs text-[#8A908D]">
              {sales.length} comprobantes registrados
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C201E] tracking-tight">
            Ventas & Terminal de Venta Rápida
          </h1>
          <p className="text-xs sm:text-sm text-[#595E5B] mt-0.5">
            Historial de tickets emitidos, terminal táctil de punto de venta (POS) y selección de medios de pago.
          </p>
        </div>

        {/* Tab Switcher Editorial */}
        <div className="flex bg-[#FAF8F4] p-1 rounded-2xl border border-[#E8E3DA] self-start sm:self-auto w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('tickets')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'tickets'
                ? 'bg-white text-[#1C201E] shadow-sm'
                : 'text-[#6F7572] hover:text-[#1C201E]'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Historial de Comprobantes</span>
            <span className="text-[10px] bg-[#E8E3DA] px-1.5 py-0.5 rounded-md text-[#595E5B]">
              {sales.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pos')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'pos'
                ? 'bg-[#C85A32] text-white shadow-sm shadow-[#C85A32]/25'
                : 'text-[#6F7572] hover:text-[#1C201E]'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Terminal POS (Venta Rápida)</span>
            {cartTotalItems > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === 'pos' ? 'bg-white text-[#C85A32]' : 'bg-[#C85A32] text-white'
              }`}>
                {cartTotalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'tickets' ? (
        /* ========================================================================= */
        /* TAB 1: HISTORIAL DE TICKETS Y FACTURAS                                    */
        /* ========================================================================= */
        <div className="space-y-6">
          
          {/* Métricas Resumen de Ventas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl p-4 border border-[#E8E3DA] shadow-xs">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#6F7572] block">
                Facturación de Hoy
              </span>
              <div className="text-xl sm:text-2xl font-bold text-[#1C201E] mt-1">
                {formatCurrency(totalFacturadoHoy)}
              </div>
              <span className="text-[11px] text-[#246A48] mt-1 block font-medium">
                {todaySales.length} tickets emitidos hoy
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#E8E3DA] shadow-xs">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#6F7572] block">
                Ticket Promedio
              </span>
              <div className="text-xl sm:text-2xl font-bold text-[#2C4A6F] mt-1">
                {formatCurrency(avgTicket)}
              </div>
              <span className="text-[11px] text-[#595E5B] mt-1 block">
                Promedio de mostrador
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#E8E3DA] shadow-xs">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#6F7572] block">
                Ventas a Cuenta Corriente
              </span>
              <div className="text-xl sm:text-2xl font-bold text-[#9A6216] mt-1">
                {currentAccountSalesCount} <span className="text-xs font-normal text-[#8A908D]">tickets</span>
              </div>
              <span className="text-[11px] text-[#9A6216] mt-1 block font-medium">
                Saldos a cobrar
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#E8E3DA] shadow-xs">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#6F7572] block">
                Punto de Venta
              </span>
              <div className="text-xl sm:text-2xl font-bold text-[#C85A32] mt-1">
                POS En Línea
              </div>
              <span className="text-[11px] text-[#246A48] mt-1 block font-medium">
                Sucursal Central • Caja 01
              </span>
            </div>
          </div>

          {/* Barra de Búsqueda y Filtros de Medios de Pago */}
          <div className="bg-white rounded-2xl p-4 border border-[#E8E3DA] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#8A908D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar ticket, cliente o cajero..."
                className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl bg-[#FAF8F4] border border-[#E8E3DA] text-[#1C201E] placeholder-[#8A908D] focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-bold text-[#6F7572] shrink-0 mr-1">Pago:</span>
              {['Todos', 'Efectivo', 'Tarjeta de Débito', 'Tarjeta de Crédito', 'Transferencia', 'Cuenta Corriente'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setSelectedPaymentFilter(method)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedPaymentFilter === method
                      ? 'bg-[#C85A32] text-white shadow-xs'
                      : 'bg-[#FAF8F4] text-[#595E5B] hover:bg-[#F3EFEA] border border-[#E8E3DA]'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla Editorial de Comprobantes (Desktop / Tablet) */}
          <div className="hidden md:block bg-white rounded-2xl border border-[#E8E3DA] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[780px]">
                <thead className="bg-[#FAF8F4] text-[#6F7572] uppercase text-[10px] tracking-wider border-b border-[#E8E3DA]">
                  <tr>
                    <th className="py-3 px-4 font-bold">Comprobante</th>
                    <th className="py-3 px-3 font-bold">Fecha & Hora</th>
                    <th className="py-3 px-3 font-bold">Cliente</th>
                    <th className="py-3 px-3 text-center font-bold">Ítems</th>
                    <th className="py-3 px-3 font-bold">Forma de Pago</th>
                    <th className="py-3 px-3 font-bold">Cajero</th>
                    <th className="py-3 px-3 text-right font-bold">Total</th>
                    <th className="py-3 px-4 text-center font-bold">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3EFEA]">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-[#FAF8F4] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1C201E]">
                        {sale.ticketNumber}
                      </td>
                      <td className="py-3.5 px-3 text-[#6F7572] whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#8A908D]" />
                          {sale.date} • {sale.time}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-[#1C201E]">
                        {sale.customerName}
                      </td>
                      <td className="py-3.5 px-3 text-center text-[#595E5B]">
                        {sale.itemsCount} u.
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 bg-[#FAF8F4] px-2.5 py-0.5 rounded-md border border-[#E8E3DA] text-[11px] font-semibold text-[#2B302D]">
                          <CreditCard className="w-3 h-3 text-[#8A908D]" />
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-[#6F7572]">
                        {sale.cashier}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-[#1C201E] text-sm whitespace-nowrap">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedSaleDetail(sale)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#FAF8F4] hover:bg-[#F3EFEA] text-[#C85A32] border border-[#E8E3DA] transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Ver Ticket</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredSales.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#8A908D]">
                        No se encontraron comprobantes con los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer de la tabla */}
            <div className="p-4 border-t border-[#E8E3DA] bg-[#FAF8F4]/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6F7572]">
              <span>
                Mostrando <strong>{filteredSales.length}</strong> comprobantes emitidos
              </span>
              <span className="text-[11px] text-[#8A908D]">
                COMERCIOS 360 • Puntos de Venta y Facturación
              </span>
            </div>
          </div>

          {/* Vista Adaptada a Celulares Android (Mobile Cards) */}
          <div className="md:hidden space-y-3">
            {filteredSales.map((sale) => (
              <div
                key={sale.id}
                className="bg-white rounded-2xl p-4 border border-[#E8E3DA] shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#1C201E]">
                    {sale.ticketNumber}
                  </span>
                  <span className="text-[11px] font-semibold text-[#246A48] bg-[#EBF5EF] px-2 py-0.5 rounded-full border border-[#CFE7DA]">
                    {sale.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[#1C201E] font-bold">
                    <span>Cliente:</span>
                    <span>{sale.customerName}</span>
                  </div>
                  <div className="flex justify-between text-[#6F7572]">
                    <span>Fecha y hora:</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#8A908D]" />
                      {sale.date} {sale.time}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#6F7572]">
                    <span>Forma de pago:</span>
                    <span className="font-medium text-[#1C201E]">{sale.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-[#6F7572]">
                    <span>Ítems:</span>
                    <span>{sale.itemsCount} unidades</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E8E3DA] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#8A908D] block uppercase font-bold">Total:</span>
                    <span className="text-base font-black text-[#C85A32]">
                      {formatCurrency(sale.total)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedSaleDetail(sale)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-[#FAF8F4] hover:bg-[#F3EFEA] text-[#C85A32] border border-[#E8E3DA] cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Ver Ticket</span>
                  </button>
                </div>
              </div>
            ))}
            {filteredSales.length === 0 && (
              <div className="p-8 text-center text-xs text-[#8A908D] bg-white rounded-2xl border border-[#E8E3DA]">
                No se encontraron comprobantes registrados.
              </div>
            )}
          </div>

        </div>
      ) : (
        /* ========================================================================= */
        /* TAB 2: TERMINAL DE VENTA RÁPIDA / MOSTRADOR POS                           */
        /* ========================================================================= */
        <div className="space-y-4">
          
          {/* Alternador Móvil para Celulares Android (Catálogo vs Carrito) */}
          <div className="lg:hidden flex bg-[#FAF8F4] p-1 rounded-2xl border border-[#E8E3DA]">
            <button
              type="button"
              onClick={() => setMobilePosView('catalog')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mobilePosView === 'catalog'
                  ? 'bg-white text-[#1C201E] shadow-sm'
                  : 'text-[#6F7572]'
              }`}
            >
              1. Catálogo de Artículos
            </button>
            <button
              type="button"
              onClick={() => setMobilePosView('cart')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                mobilePosView === 'cart'
                  ? 'bg-[#C85A32] text-white shadow-sm'
                  : 'text-[#6F7572]'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>2. Ticket y Cobro ({cartTotalItems})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Columna Izquierda: Selector de Productos (7 cols) */}
            <div className={`lg:col-span-7 bg-white rounded-3xl p-4 sm:p-6 border border-[#E8E3DA] shadow-xs space-y-4 ${
              mobilePosView === 'cart' ? 'hidden lg:block' : 'block'
            }`}>
              
              {/* Header POS y Escáner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E3DA]">
                <div>
                  <h2 className="text-lg font-serif font-bold text-[#1C201E]">
                    Catálogo Rápido de Mostrador
                  </h2>
                  <p className="text-xs text-[#6F7572]">
                    Toca un producto para sumarlo al ticket actual
                  </p>
                </div>
                
                {/* Botón Simular Escaneo de Código de Barra */}
                <button
                  type="button"
                  onClick={handleSimulateScan}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-[#FAF8F4] hover:bg-[#F3EFEA] border border-[#E8E3DA] text-[#1C201E] text-xs font-bold rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
                  title="Simular lectura óptica de código de barra"
                >
                  <Barcode className="w-4 h-4 text-[#C85A32]" />
                  <span>Simular Lector Óptico</span>
                </button>
              </div>

              {/* Búsqueda y Filtro de Categorías */}
              <div className="space-y-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#8A908D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                    placeholder="Buscar producto por nombre, SKU o código de barra..."
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-[#FAF8F4] border border-[#E8E3DA] text-[#1C201E] placeholder-[#8A908D] focus:outline-none focus:border-[#C85A32] transition-colors"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {posCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedPosCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        selectedPosCategory === cat
                          ? 'bg-[#C85A32] text-white shadow-xs'
                          : 'bg-[#FAF8F4] text-[#595E5B] hover:bg-[#F3EFEA] border border-[#E8E3DA]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grilla de Artículos para Seleccionar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[520px] overflow-y-auto pr-1">
                {filteredPosProducts.map((p) => {
                  const isOutOfStock = p.stock === 0;
                  const isLowStock = p.stock > 0 && p.stock <= 5;
                  const hasPhoto = !!p.imageUrl && !imageErrors[p.id];

                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => handleAddToCart(p)}
                      className={`group p-3 text-left rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
                        isOutOfStock
                          ? 'opacity-50 bg-[#F5F2EB] border-[#E2DDD5] cursor-not-allowed'
                          : 'bg-[#FAF8F4] border-[#E8E3DA] hover:border-[#C85A32] hover:bg-white hover:shadow-xs active:scale-[0.98]'
                      }`}
                    >
                      <div className="w-full">
                        {/* Miniatura de Imagen Uniforme con fallback elegante */}
                        <div className="w-full h-24 rounded-xl border border-[#E8E3DA] bg-white overflow-hidden relative mb-2 flex items-center justify-center shrink-0">
                          {hasPhoto ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              onError={() => handleImageError(p.id)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-[#8A908D] p-2">
                              {p.petSpecies ? (
                                <Dog className="w-7 h-7 text-[#C85A32]/60" />
                              ) : p.dietaryType || p.isGlutenFree ? (
                                <Apple className="w-7 h-7 text-[#246A48]/60" />
                              ) : (
                                <Package className="w-7 h-7 text-[#8A908D]/70" />
                              )}
                            </div>
                          )}

                          {/* Badges sobre la foto */}
                          {isLowStock && (
                            <span className="absolute top-1.5 right-1.5 text-[9px] font-bold text-[#9A6216] bg-[#FEF6EC]/95 backdrop-blur-xs px-1.5 py-0.5 rounded-md border border-[#FCE3B8]">
                              Poco stock
                            </span>
                          )}
                          {isOutOfStock && (
                            <span className="absolute top-1.5 right-1.5 text-[9px] font-bold text-[#B84C26] bg-[#FDF2ED]/95 backdrop-blur-xs px-1.5 py-0.5 rounded-md border border-[#F7D3C4]">
                              Agotado
                            </span>
                          )}
                        </div>

                        {/* Encabezado: Categoría y Marca */}
                        <div className="flex items-center justify-between gap-1 text-[10px]">
                          <span className="font-bold text-[#8A908D] uppercase font-mono truncate">
                            {p.category}
                          </span>
                          {p.brand && (
                            <span className="font-semibold text-[#C85A32] truncate max-w-[50%] text-right">
                              {p.brand}
                            </span>
                          )}
                        </div>

                        {/* Nombre del Producto */}
                        <h4 className="font-bold text-xs text-[#1C201E] mt-0.5 line-clamp-2 leading-snug">
                          {p.name}
                        </h4>
                      </div>

                      {/* Pie de tarjeta: Stock y Precio */}
                      <div className="mt-2.5 pt-2 border-t border-[#E8E3DA]/80 flex items-center justify-between">
                        <span className="text-[10px] text-[#6F7572]">
                          Stock: <strong>{p.stock}</strong> <span className="text-[9px] text-[#8A908D]">{p.unit}</span>
                        </span>
                        <span className="text-xs font-black text-[#C85A32]">
                          {formatCurrency(p.salePrice)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Botón flotante móvil para pasar al carrito */}
              <div className="lg:hidden pt-2">
                <button
                  type="button"
                  onClick={() => setMobilePosView('cart')}
                  className="w-full py-3 bg-[#C85A32] text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Ver Ticket Actual ({cartTotalItems} ítems) • {formatCurrency(cartFinalTotal)}</span>
                </button>
              </div>

            </div>

            {/* Columna Derecha: Carrito y Cobro (5 cols) */}
            <div className={`lg:col-span-5 bg-white rounded-3xl p-4 sm:p-6 border border-[#E8E3DA] shadow-xs flex flex-col justify-between space-y-4 ${
              mobilePosView === 'catalog' ? 'hidden lg:block' : 'block'
            }`}>
              
              {/* Header del Ticket */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E3DA]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FDF7F4] text-[#C85A32] flex items-center justify-center">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#1C201E]">
                        Ticket de Venta
                      </h3>
                      <p className="text-[11px] text-[#8A908D]">{cartTotalItems} unidades cargadas</p>
                    </div>
                  </div>

                  {posCart.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearCart}
                      className="text-[11px] font-semibold text-[#B84C26] hover:underline cursor-pointer"
                    >
                      Vaciar ticket
                    </button>
                  )}
                </div>

                {/* Selector de Cliente */}
                <div className="mt-3.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6F7572] mb-1">
                    Cliente del ticket:
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] text-[#1C201E] focus:outline-none focus:border-[#C85A32] cursor-pointer"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.category}) - {c.document}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lista de Artículos en Carrito */}
                <div className="mt-3.5 space-y-2 max-h-52 overflow-y-auto pr-1">
                  {posCart.length === 0 ? (
                    <div className="text-center py-8 px-4 bg-[#FAF8F4] rounded-2xl border border-dashed border-[#E8E3DA]">
                      <ShoppingCart className="w-8 h-8 text-[#8A908D] mx-auto mb-2 opacity-50" />
                      <p className="font-semibold text-xs text-[#1C201E]">El ticket está vacío</p>
                      <p className="text-[11px] text-[#8A908D] mt-0.5">
                        Selecciona productos del catálogo para comenzar la venta.
                      </p>
                    </div>
                  ) : (
                    posCart.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F4] border border-[#E8E3DA] text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                          {/* Miniatura en carrito */}
                          <div className="w-8 h-8 rounded-lg border border-[#E8E3DA] bg-white shrink-0 overflow-hidden flex items-center justify-center">
                            {item.product.imageUrl && !imageErrors[item.product.id] ? (
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                onError={() => handleImageError(item.product.id)}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-[#8A908D]" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-[#1C201E] truncate">
                              {item.product.name}
                            </p>
                            <p className="text-[11px] text-[#6F7572]">
                              {item.product.brand ? `${item.product.brand} • ` : ''}
                              {formatCurrency(item.product.salePrice)} c/u
                            </p>
                          </div>
                        </div>

                        {/* Stepper Cantidad */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-[#E8E3DA] bg-white rounded-lg">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.product.id, -1)}
                              className="p-1.5 text-[#6F7572] hover:text-[#1C201E] hover:bg-[#FAF8F4] rounded-l-lg cursor-pointer"
                              title="Disminuir cantidad"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 font-bold text-xs text-[#1C201E]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.product.id, 1)}
                              className="p-1.5 text-[#6F7572] hover:text-[#1C201E] hover:bg-[#FAF8F4] rounded-r-lg cursor-pointer"
                              title="Aumentar cantidad"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-bold text-[#1C201E] w-16 text-right">
                            {formatCurrency(item.product.salePrice * item.quantity)}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(item.product.id)}
                            className="p-1 text-[#8A908D] hover:text-[#B84C26] cursor-pointer"
                            title="Eliminar del ticket"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Descuentos Rápidos de Mostrador */}
                {posCart.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-[#E8E3DA] flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-[#6F7572]">Bonificación / Descuento:</span>
                    <div className="flex items-center gap-1">
                      {[0, 5, 10].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setDiscountPercent(pct)}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                            discountPercent === pct
                              ? 'bg-[#C85A32] text-white'
                              : 'bg-[#FAF8F4] text-[#595E5B] border border-[#E8E3DA]'
                          }`}
                        >
                          {pct === 0 ? '0%' : `-${pct}%`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Medios de Pago y Cobro */}
              <div className="pt-3 border-t border-[#E8E3DA] space-y-3">
                
                {/* Selector de Medios de Pago */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6F7572] mb-1.5">
                    Medio de Pago:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                    {(['Efectivo', 'Tarjeta de Débito', 'Tarjeta de Crédito', 'Transferencia', 'Cuenta Corriente'] as const).map(
                      (m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={`py-2 px-1.5 rounded-xl font-bold text-[11px] text-center border transition-all cursor-pointer ${
                            paymentMethod === m
                              ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-xs'
                              : 'bg-[#FAF8F4] text-[#1C201E] border-[#E8E3DA] hover:bg-[#F3EFEA]'
                          }`}
                        >
                          {m}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Calculadora de Vuelto para Efectivo */}
                {paymentMethod === 'Efectivo' && posCart.length > 0 && (
                  <div className="p-3 bg-[#FAF8F4] rounded-2xl border border-[#E8E3DA] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1C201E] flex items-center gap-1">
                        <Calculator className="w-3.5 h-3.5 text-[#C85A32]" />
                        <span>Calculadora de Cambio (Efectivo)</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8A908D] font-bold">
                          $
                        </span>
                        <input
                          type="number"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(e.target.value)}
                          placeholder="Monto recibido del cliente..."
                          className="w-full pl-6 pr-3 py-1.5 text-xs rounded-xl bg-white border border-[#E8E3DA] text-[#1C201E] focus:outline-none focus:border-[#C85A32]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setCashReceived(cartFinalTotal.toString())}
                        className="px-2.5 py-1.5 text-[11px] font-bold bg-white border border-[#E8E3DA] rounded-xl text-[#595E5B] hover:text-[#1C201E] cursor-pointer"
                      >
                        Exacto
                      </button>
                    </div>

                    {/* Billetes Frecuentes Rápidos */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[5000, 10000, 20000, 50000].map((bill) => (
                        <button
                          key={bill}
                          type="button"
                          onClick={() => setCashReceived(bill.toString())}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white border border-[#E8E3DA] text-[#595E5B] hover:border-[#C85A32] cursor-pointer"
                        >
                          ${bill.toLocaleString('es-AR')}
                        </button>
                      ))}
                    </div>

                    {/* Resultado de Vuelto */}
                    {parsedCashReceived > 0 && (
                      <div className="pt-1.5 border-t border-[#E8E3DA] flex items-center justify-between text-xs font-bold">
                        {parsedCashReceived >= cartFinalTotal ? (
                          <>
                            <span className="text-[#246A48]">Vuelto a Entregar:</span>
                            <span className="text-sm font-black text-[#246A48]">
                              {formatCurrency(cashChange)}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-[#B84C26]">Monto Faltante:</span>
                            <span className="text-sm font-black text-[#B84C26]">
                              {formatCurrency(cashShortage)}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Total Final y Resumen */}
                <div className="p-3.5 bg-[#FAF8F4] rounded-2xl border border-[#E8E3DA] space-y-1">
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-xs text-[#595E5B]">
                      <span>Subtotal bruto:</span>
                      <span>{formatCurrency(cartGrossSubtotal)}</span>
                    </div>
                  )}
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-xs text-[#246A48] font-semibold">
                      <span>Descuento aplicado ({discountPercent}%):</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t border-[#E8E3DA]">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F7572] block">
                        TOTAL A COBRAR
                      </span>
                      <span className="text-[11px] text-[#8A908D]">
                        {cartTotalItems} {cartTotalItems === 1 ? 'artículo' : 'artículos'}
                      </span>
                    </div>
                    <span className="text-2xl font-black text-[#C85A32]">
                      {formatCurrency(cartFinalTotal)}
                    </span>
                  </div>
                </div>

                {/* Botón de Confirmación */}
                <button
                  type="button"
                  disabled={posCart.length === 0}
                  onClick={handleFinalizeSale}
                  className="w-full py-3.5 px-4 bg-[#C85A32] hover:bg-[#B84C26] active:bg-[#9B3D1D] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-[#C85A32]/25 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cobrar & Emitir Comprobante (Demo)</span>
                </button>

                <p className="text-[11px] text-center text-[#8A908D]">
                  La venta impactará en el historial durante la sesión en memoria.
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DETALLADO DE COMPROBANTE / TICKET DE VENTA (ESTÉTICA COMERCIAL REAL) */}
      {/* ========================================================================= */}
      {selectedSaleDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1C201E]/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-md w-full border border-[#E8E3DA] shadow-2xl space-y-4 font-sans text-xs my-8 animate-in zoom-in-95">
            
            {/* Cabecera del Ticket */}
            <div className="text-center pb-3 border-b border-[#E8E3DA] space-y-1">
              <div className="w-10 h-10 rounded-xl bg-[#C85A32] text-white font-black text-lg flex items-center justify-center mx-auto shadow-sm">
                360
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1C201E]">COMERCIOS 360</h3>
              <p className="text-[11px] text-[#595E5B] font-medium">
                {selectedSaleDetail.storeName}
              </p>
              <p className="text-[10px] text-[#8A908D]">
                CUIT: 30-71889922-3 • Ing. Brutos: 901-238491-0
              </p>
              <p className="text-[10px] text-[#8A908D]">
                Av. Corrientes 1450, Ciudad Autónoma de Buenos Aires
              </p>
              
              {/* Badge Comprobante Fiscal Simulado */}
              <div className="inline-block mt-2 px-3 py-1 bg-[#FAF8F4] border border-[#E8E3DA] rounded-lg">
                <span className="font-mono font-bold text-xs text-[#C85A32]">
                  {selectedSaleDetail.ticketNumber}
                </span>
              </div>
            </div>

            {/* Metadatos de la Transacción */}
            <div className="py-2 space-y-1.5 border-b border-[#E8E3DA] text-[#595E5B] text-xs">
              <div className="flex justify-between">
                <span>Fecha y Hora:</span>
                <span className="font-bold text-[#1C201E]">
                  {selectedSaleDetail.date} - {selectedSaleDetail.time} hs
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cliente:</span>
                <span className="font-bold text-[#1C201E]">
                  {selectedSaleDetail.customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Forma de Pago:</span>
                <span className="font-bold text-[#1C201E]">
                  {selectedSaleDetail.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cajero / Operador:</span>
                <span className="font-bold text-[#1C201E]">
                  {selectedSaleDetail.cashier}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estado:</span>
                <span className="font-bold text-[#246A48] bg-[#EBF5EF] px-2 py-0.2 rounded">
                  {selectedSaleDetail.status}
                </span>
              </div>
            </div>

            {/* Tabla Detallada de Ítems del Comprobante */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F7572] block mb-2">
                Detalle de Productos Facturados:
              </span>
              <div className="bg-[#FAF8F4] rounded-xl border border-[#E8E3DA] overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[#F3EFEA] text-[#6F7572] uppercase text-[9px] tracking-wider border-b border-[#E8E3DA]">
                    <tr>
                      <th className="py-2 px-2.5 font-bold">Cant</th>
                      <th className="py-2 px-2 font-bold">Descripción</th>
                      <th className="py-2 px-2 text-right font-bold">P. Unit</th>
                      <th className="py-2 px-2.5 text-right font-bold">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E3DA]/60">
                    {selectedSaleDetail.items && selectedSaleDetail.items.length > 0 ? (
                      selectedSaleDetail.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-2.5 font-bold text-[#1C201E]">{item.quantity}</td>
                          <td className="py-2 px-2 text-[#1C201E]">{item.productName}</td>
                          <td className="py-2 px-2 text-right text-[#6F7572]">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-2 px-2.5 text-right font-bold text-[#1C201E]">{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-2 px-2.5 font-bold text-[#1C201E]">{selectedSaleDetail.itemsCount}</td>
                        <td className="py-2 px-2 text-[#1C201E]">Artículos de almacén y mostrador (Detalle agrupado)</td>
                        <td className="py-2 px-2 text-right text-[#6F7572]">-</td>
                        <td className="py-2 px-2.5 text-right font-bold text-[#1C201E]">{formatCurrency(selectedSaleDetail.total)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Desglose Financiero y Total Abonado */}
            <div className="py-2 space-y-1 border-t border-b border-[#E8E3DA] text-xs">
              <div className="flex justify-between text-[#6F7572]">
                <span>Subtotal Neto:</span>
                <span>{formatCurrency(Math.round(selectedSaleDetail.total * 0.8264))}</span>
              </div>
              <div className="flex justify-between text-[#6F7572]">
                <span>IVA Inscripto (21%):</span>
                <span>{formatCurrency(Math.round(selectedSaleDetail.total * 0.1736))}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-[#1C201E] pt-1 border-t border-[#E8E3DA]">
                <span>TOTAL ABONADO:</span>
                <span className="text-xl font-black text-[#C85A32]">
                  {formatCurrency(selectedSaleDetail.total)}
                </span>
              </div>
            </div>

            {/* Simulación de Código QR y Barra */}
            <div className="flex items-center justify-between p-2.5 bg-[#FAF8F4] rounded-xl border border-[#E8E3DA]">
              <div className="flex items-center gap-2">
                <QrCode className="w-6 h-6 text-[#1C201E]" />
                <div className="text-[10px] text-[#6F7572]">
                  <p className="font-bold text-[#1C201E]">CAE Demo: 74992104928190</p>
                  <p>Vto. CAE: 25/10/2026</p>
                </div>
              </div>
              <span className="text-[10px] text-[#8A908D] font-mono">P.V. 0001</span>
            </div>

            {/* Disclaimer Fiscal Demo Obligatorio */}
            <div className="p-2.5 rounded-xl bg-[#FAF8F4] border border-[#E8E3DA] text-[10px] text-[#6F7572] text-center leading-relaxed">
              <strong>Comprobante de Demostración:</strong> Documento simulado sin validez fiscal legal ni transacciones bancarias reales.
            </div>

            {/* Botones de Acción */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-[#FAF8F4] hover:bg-[#F3EFEA] text-[#1C201E] font-bold rounded-xl border border-[#E8E3DA] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Ticket</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedSaleDetail(null)}
                className="flex-1 py-2.5 bg-[#C85A32] hover:bg-[#B84C26] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
