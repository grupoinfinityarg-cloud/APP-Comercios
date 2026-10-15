import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  X,
  Eye,
  Trash2,
  Package,
  Layers,
  Building2,
  DollarSign,
  Calendar,
  CreditCard,
  Printer,
  ChevronRight,
  Barcode,
  Check,
  FileSpreadsheet,
} from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { Purchase, Supplier, Product } from '../../types';
import { DEMO_PRODUCTS, DEMO_SUPPLIERS, DEMO_PURCHASES } from '../../data/demoData';

export interface PurchaseItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface DetailedPurchase extends Purchase {
  supplierId?: string;
  supplierCuit?: string;
  items?: PurchaseItem[];
  subtotalNet?: number;
  taxRate?: number;
  taxAmount?: number;
  discountRate?: number;
  discountAmount?: number;
  invoiceNumber?: string;
  notes?: string;
  receiptDate?: string;
}

const INITIAL_PURCHASES_WITH_ITEMS: DetailedPurchase[] = [
  {
    id: 'pur-1',
    orderNumber: 'OC-2026-0089',
    invoiceNumber: 'FC-A-0004-001928',
    supplierName: 'Molinos Del Plata S.A.',
    supplierCuit: '30-50001234-7',
    date: '2026-10-10',
    itemsCount: 40,
    subtotalNet: 177685,
    taxRate: 21,
    taxAmount: 37315,
    discountRate: 0,
    discountAmount: 0,
    total: 215000,
    status: 'Recibido',
    paymentStatus: 'Pendiente',
    receiptDate: '2026-10-12',
    notes: 'Recepción completa en depósito central. Remito firmado.',
    items: [
      {
        productId: 'prod-5',
        productName: 'Harina de Trigo 0000 1kg',
        sku: 'HAR-005',
        quantity: 100,
        unitCost: 750,
        subtotal: 75000,
      },
      {
        productId: 'prod-3',
        productName: 'Yerba Mate Despalada Especial 1kg',
        sku: 'YER-003',
        quantity: 50,
        unitCost: 2050,
        subtotal: 102500,
      },
    ],
  },
  {
    id: 'pur-2',
    orderNumber: 'OC-2026-0088',
    invoiceNumber: 'FC-A-0001-008412',
    supplierName: 'Café & Grano Tostadores',
    supplierCuit: '30-71239845-2',
    date: '2026-10-08',
    itemsCount: 25,
    subtotalNet: 128099,
    taxRate: 21,
    taxAmount: 26901,
    discountRate: 0,
    discountAmount: 0,
    total: 155000,
    status: 'Recibido',
    paymentStatus: 'Pagado',
    receiptDate: '2026-10-09',
    notes: 'Descuento por pronto pago aplicado al contado.',
    items: [
      {
        productId: 'prod-1',
        productName: 'Café Tostado en Grano 1kg Premium',
        sku: 'CAF-001',
        quantity: 25,
        unitCost: 6200,
        subtotal: 155000,
      },
    ],
  },
  {
    id: 'pur-3',
    orderNumber: 'OC-2026-0090',
    invoiceNumber: 'FC-A-0012-004510',
    supplierName: 'Distribuidora Bebidas Austral',
    supplierCuit: '30-70894567-9',
    date: '2026-10-11',
    itemsCount: 60,
    subtotalNet: 80991,
    taxRate: 21,
    taxAmount: 17009,
    discountRate: 0,
    discountAmount: 0,
    total: 98000,
    status: 'En tránsito',
    paymentStatus: 'Parcial',
    notes: 'Transporte coordinado para entrega el próximo jueves.',
    items: [
      {
        productId: 'prod-4',
        productName: 'Gaseosa Cola Clásica 1.5L',
        sku: 'GAS-004',
        quantity: 60,
        unitCost: 1300,
        subtotal: 78000,
      },
    ],
  },
];

interface PurchasesScreenProps {
  purchases: Purchase[];
  suppliers: Supplier[];
}

export const PurchasesScreen: React.FC<PurchasesScreenProps> = ({
  suppliers: propSuppliers,
}) => {
  // Local state for purchases and suppliers
  const [purchaseList, setPurchaseList] = useState<DetailedPurchase[]>(INITIAL_PURCHASES_WITH_ITEMS);
  const [suppliers] = useState<Supplier[]>(propSuppliers?.length ? propSuppliers : DEMO_SUPPLIERS);
  const [catalogProducts] = useState<Product[]>(DEMO_PRODUCTS);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'recibido' | 'transito' | 'preparacion' | 'cancelada'>('todos');
  const [paymentFilter, setPaymentFilter] = useState<'todos' | 'pagado' | 'pendiente' | 'parcial'>('todos');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<DetailedPurchase | null>(null);

  // Create Purchase Form State
  const [formSupplierId, setFormSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [formInvoiceNumber, setFormInvoiceNumber] = useState(`FC-A-0001-${Math.floor(100000 + Math.random() * 900000)}`);
  const [formTaxRate, setFormTaxRate] = useState<number>(21);
  const [formDiscountRate, setFormDiscountRate] = useState<number>(0);
  const [formNotes, setFormNotes] = useState('');
  const [formItems, setFormItems] = useState<PurchaseItem[]>([
    {
      productId: catalogProducts[0]?.id || 'prod-1',
      productName: catalogProducts[0]?.name || 'Café Tostado en Grano 1kg Premium',
      sku: catalogProducts[0]?.sku || 'CAF-001',
      quantity: 10,
      unitCost: catalogProducts[0]?.costPrice || 6200,
      subtotal: (catalogProducts[0]?.costPrice || 6200) * 10,
    },
  ]);

  // Product search inside purchase modal
  const [modalProductSearch, setModalProductSearch] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Calculations for Create Purchase Form
  const formSubtotalGross = formItems.reduce((acc, item) => acc + item.quantity * item.unitCost, 0);
  const formDiscountAmount = (formSubtotalGross * formDiscountRate) / 100;
  const formSubtotalNet = formSubtotalGross - formDiscountAmount;
  const formTaxAmount = (formSubtotalNet * formTaxRate) / 100;
  const formTotal = Math.round(formSubtotalNet + formTaxAmount);

  // Metrics
  const totalPurchasesAmount = purchaseList.reduce((acc, p) => acc + p.total, 0);
  const totalReceived = purchaseList.filter((p) => p.status === 'Recibido').length;
  const totalInTransit = purchaseList.filter((p) => p.status === 'En tránsito').length;
  const totalPendingPayment = purchaseList
    .filter((p) => p.paymentStatus === 'Pendiente' || p.paymentStatus === 'Parcial')
    .reduce((acc, p) => acc + p.total, 0);

  // Filtered Purchases
  const filteredPurchases = purchaseList.filter((p) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      term === '' ||
      p.orderNumber.toLowerCase().includes(term) ||
      (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(term)) ||
      p.supplierName.toLowerCase().includes(term);

    let matchesStatus = true;
    if (statusFilter === 'recibido') matchesStatus = p.status === 'Recibido';
    else if (statusFilter === 'transito') matchesStatus = p.status === 'En tránsito';
    else if (statusFilter === 'preparacion') matchesStatus = (p.status as any) === 'En preparación';
    else if (statusFilter === 'cancelada') matchesStatus = (p.status as any) === 'Cancelada';

    let matchesPayment = true;
    if (paymentFilter === 'pagado') matchesPayment = p.paymentStatus === 'Pagado';
    else if (paymentFilter === 'pendiente') matchesPayment = p.paymentStatus === 'Pendiente';
    else if (paymentFilter === 'parcial') matchesPayment = p.paymentStatus === 'Parcial';

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Open Create Purchase Modal
  const handleOpenCreateModal = () => {
    setFormError(null);
    setFormSupplierId(suppliers[0]?.id || '');
    setFormInvoiceNumber(`FC-A-0001-${Math.floor(100000 + Math.random() * 900000)}`);
    setFormTaxRate(21);
    setFormDiscountRate(0);
    setFormNotes('Recepción prevista en depósito central');
    setFormItems([
      {
        productId: catalogProducts[0]?.id || 'prod-1',
        productName: catalogProducts[0]?.name || 'Café Tostado en Grano 1kg Premium',
        sku: catalogProducts[0]?.sku || 'CAF-001',
        quantity: 15,
        unitCost: catalogProducts[0]?.costPrice || 6200,
        subtotal: (catalogProducts[0]?.costPrice || 6200) * 15,
      },
    ]);
    setShowCreateModal(true);
  };

  // Add Item in Create Form
  const handleAddProductToForm = (prod: Product) => {
    const existingIndex = formItems.findIndex((it) => it.productId === prod.id);
    if (existingIndex >= 0) {
      // Increase quantity
      const updated = [...formItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].subtotal = updated[existingIndex].quantity * updated[existingIndex].unitCost;
      setFormItems(updated);
    } else {
      // Add new item line
      setFormItems([
        ...formItems,
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          quantity: 5,
          unitCost: prod.costPrice,
          subtotal: prod.costPrice * 5,
        },
      ]);
    }
    setModalProductSearch('');
  };

  // Update item quantity
  const handleUpdateItemQty = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const updated = [...formItems];
    updated[index].quantity = newQty;
    updated[index].subtotal = newQty * updated[index].unitCost;
    setFormItems(updated);
  };

  // Update item unit cost
  const handleUpdateItemCost = (index: number, newCost: number) => {
    if (newCost < 0) return;
    const updated = [...formItems];
    updated[index].unitCost = newCost;
    updated[index].subtotal = updated[index].quantity * newCost;
    setFormItems(updated);
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  // Handle Submit New Purchase
  const handleSubmitPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const sup = suppliers.find((s) => s.id === formSupplierId);
    if (!sup) {
      setFormError('Por favor selecciona un proveedor válido.');
      return;
    }

    if (!formInvoiceNumber.trim()) {
      setFormError('El número o referencia de comprobante/factura es obligatorio.');
      return;
    }

    if (formItems.length === 0) {
      setFormError('Debes agregar al menos un producto a la compra.');
      return;
    }

    for (const item of formItems) {
      if (item.quantity <= 0) {
        setFormError(`La cantidad para "${item.productName}" debe ser mayor a 0.`);
        return;
      }
    }

    const totalUnits = formItems.reduce((acc, it) => acc + it.quantity, 0);

    const newPurchase: DetailedPurchase = {
      id: `pur-${Date.now()}`,
      orderNumber: `OC-2026-00${Math.floor(90 + Math.random() * 900)}`,
      invoiceNumber: formInvoiceNumber.trim(),
      supplierName: sup.name,
      supplierCuit: sup.cuit,
      date: new Date().toISOString().split('T')[0],
      itemsCount: totalUnits,
      subtotalNet: formSubtotalNet,
      taxRate: formTaxRate,
      taxAmount: formTaxAmount,
      discountRate: formDiscountRate,
      discountAmount: formDiscountAmount,
      total: formTotal,
      status: 'En tránsito',
      paymentStatus: 'Pendiente',
      notes: formNotes.trim(),
      items: formItems,
    };

    setPurchaseList([newPurchase, ...purchaseList]);
    setShowCreateModal(false);
    showToast(`Orden de Compra ${newPurchase.orderNumber} registrada exitosamente`);
  };

  // Mark purchase as received (demonstrative operation)
  const handleMarkAsReceived = (pur: DetailedPurchase) => {
    const updated = purchaseList.map((p) => {
      if (p.id === pur.id) {
        return {
          ...p,
          status: 'Recibido' as const,
          receiptDate: new Date().toISOString().split('T')[0],
        };
      }
      return p;
    });
    setPurchaseList(updated);
    setSelectedPurchase({
      ...pur,
      status: 'Recibido',
      receiptDate: new Date().toISOString().split('T')[0],
    });
    showToast(`Mercadería de la orden ${pur.orderNumber} registrada como recibida (Simulación)`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-stone-900 text-stone-100 px-4 py-3 rounded-xl shadow-2xl border border-stone-700 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-stone-400 hover:text-white ml-2 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Demo Notice */}
      <DemoNotice
        title="Módulo 10: Compras y Recepción de Mercadería"
        description="Gestión de órdenes de compra, carga de comprobantes de proveedores, detalle de ítems, cálculo de alícuotas y registro de recepción."
      />

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Órdenes de Compra
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <ShoppingBag className="w-3 h-3" />
              Gestión Mayorista
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Registro de compras a proveedores, control de comprobantes e ingreso de mercadería
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Compra</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Compras</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(totalPurchasesAmount)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Monto acumulado en el período
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Mercadería Recibida</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {totalReceived}{' '}
            <span className="text-xs font-semibold text-slate-400">órdenes</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Ingresadas a depósito
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">En Tránsito</span>
            <Truck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
            {totalInTransit}{' '}
            <span className="text-xs font-semibold text-slate-400">pedidos</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Pendientes de recepción
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Deuda Pendiente</span>
            <CreditCard className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatCurrency(totalPendingPayment)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            A liquidar a proveedores
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por orden, comprobante o proveedor..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all min-h-[44px]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Payment Status Dropdown & View Mode */}
          <div className="flex items-center gap-2">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all min-h-[44px] cursor-pointer"
            >
              <option value="todos">Pago: Todos</option>
              <option value="pagado">Pago: Pagados</option>
              <option value="pendiente">Pago: Pendientes</option>
              <option value="parcial">Pago: Parciales</option>
            </select>

            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Vista de Tabla"
                className={`p-2 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                title="Vista de Tarjetas / Móvil"
                className={`p-2 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Estado de Recepción:
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 min-h-[36px] ${
              statusFilter === 'todos'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Todas ({purchaseList.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('recibido')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 min-h-[36px] ${
              statusFilter === 'recibido'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Recibidas ({purchaseList.filter((p) => p.status === 'Recibido').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('transito')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 min-h-[36px] ${
              statusFilter === 'transito'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            En Tránsito ({purchaseList.filter((p) => p.status === 'En tránsito').length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredPurchases.length === 0 ? (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No se encontraron compras con los filtros seleccionados
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Intenta modificando los términos de búsqueda o el estado de recepción y pago.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('todos');
              setPaymentFilter('todos');
            }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Orden / Factura</th>
                  <th className="py-3 px-3">Proveedor</th>
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-3 text-center">Unidades / Ítems</th>
                  <th className="py-3 px-3 text-center">Estado Recepción</th>
                  <th className="py-3 px-3 text-center">Estado Pago</th>
                  <th className="py-3 px-3 text-right">Total Facturado</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {p.orderNumber}
                      </div>
                      {p.invoiceNumber && (
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {p.invoiceNumber}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {p.supplierName}
                      </div>
                      {p.supplierCuit && (
                        <div className="text-[11px] text-slate-400 font-mono">
                          CUIT: {p.supplierCuit}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {p.date}
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                      {p.itemsCount} u.
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          p.status === 'Recibido'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          p.paymentStatus === 'Pagado'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                            : p.paymentStatus === 'Parcial'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                        }`}
                      >
                        {p.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                      {formatCurrency(p.total)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedPurchase(p)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer min-h-[36px] flex items-center justify-center gap-1 mx-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Detalle</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredPurchases.map((p) => (
            <div
              key={p.id}
              className={`bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs flex flex-col justify-between ${
                p.status === 'Recibido' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-amber-500'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">
                      {p.orderNumber}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">
                      {p.supplierName}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Comprobante: {p.invoiceNumber || 'S/N'}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-black text-base text-slate-900 dark:text-white block">
                      {formatCurrency(p.total)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {p.itemsCount} unidades
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Fecha Emisión</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{p.date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Estado Pago</span>
                    <span
                      className={`font-bold ${
                        p.paymentStatus === 'Pagado' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {p.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    p.status === 'Recibido'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                  }`}
                >
                  {p.status}
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedPurchase(p)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Detalle</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: REGISTRAR NUEVA ORDEN DE COMPRA                  */}
      {/* ========================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-scale-in">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Registrar Nueva Compra a Proveedor
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Carga comprobante fiscal, agrega productos y calcula totales
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitPurchase} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Supplier & Invoice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Proveedor *
                  </label>
                  <select
                    value={formSupplierId}
                    onChange={(e) => setFormSupplierId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold min-h-[44px] cursor-pointer"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (CUIT: {s.cuit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    N° Comprobante / Factura *
                  </label>
                  <input
                    type="text"
                    required
                    value={formInvoiceNumber}
                    onChange={(e) => setFormInvoiceNumber(e.target.value)}
                    placeholder="FC-A-0004-001928"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-mono min-h-[44px]"
                  />
                </div>
              </div>

              {/* Product Search & Quick Add */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Agregar Productos del Catálogo
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={modalProductSearch}
                    onChange={(e) => setModalProductSearch(e.target.value)}
                    placeholder="Buscar producto por nombre o SKU para agregar..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white min-h-[40px]"
                  />
                </div>

                {/* Search Results Dropdown */}
                {modalProductSearch.trim() && (
                  <div className="mt-1 max-h-36 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg divide-y divide-slate-100 dark:divide-slate-700">
                    {catalogProducts
                      .filter(
                        (p) =>
                          p.name.toLowerCase().includes(modalProductSearch.toLowerCase()) ||
                          p.sku.toLowerCase().includes(modalProductSearch.toLowerCase())
                      )
                      .slice(0, 5)
                      .map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleAddProductToForm(p)}
                          className="p-2.5 hover:bg-amber-50 dark:hover:bg-slate-700 flex justify-between items-center cursor-pointer text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">{p.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">SKU: {p.sku}</span>
                          </div>
                          <span className="font-bold text-emerald-600">{formatCurrency(p.costPrice)}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Product Lines Detail Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Producto</th>
                      <th className="py-2.5 px-2 text-center w-20">Cantidad</th>
                      <th className="py-2.5 px-2 text-right w-28">Costo Unit.</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                      <th className="py-2.5 px-2 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {formItems.map((item, idx) => (
                      <tr key={item.productId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-3">
                          <div className="font-bold text-slate-900 dark:text-white">{item.productName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</div>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItemQty(idx, parseInt(e.target.value, 10) || 1)}
                            className="w-16 px-1.5 py-1 text-center font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                          />
                        </td>
                        <td className="py-2 px-2 text-right">
                          <input
                            type="number"
                            min="0"
                            value={item.unitCost}
                            onChange={(e) => handleUpdateItemCost(idx, parseFloat(e.target.value) || 0)}
                            className="w-24 px-1.5 py-1 text-right font-mono font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-black text-slate-900 dark:text-white">
                          {formatCurrency(item.subtotal)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tax & Discount Controls */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Alícuota IVA
                  </label>
                  <select
                    value={formTaxRate}
                    onChange={(e) => setFormTaxRate(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white min-h-[38px]"
                  >
                    <option value={21}>IVA 21% (General)</option>
                    <option value={10.5}>IVA 10.5% (Diferencial)</option>
                    <option value={0}>IVA 0% (Exento)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bonificación / Descuento %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formDiscountRate}
                    onChange={(e) => setFormDiscountRate(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold min-h-[38px]"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 bg-amber-50/70 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800 flex flex-col justify-center text-right">
                  <span className="text-[10px] text-amber-800 dark:text-amber-300 uppercase font-bold">
                    Total Operación
                  </span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {formatCurrency(formTotal)}
                  </span>
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Observaciones / Instrucciones de Entrega
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Detalles sobre recepción, transportista, pagos acordados..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md cursor-pointer min-h-[44px] flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar y Guardar Compra</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: DETALLE / COMPROBANTE DE COMPRA                  */}
      {/* ========================================================= */}
      {selectedPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-scale-in">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Detalle de Orden de Compra
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {selectedPurchase.orderNumber} • Factura: {selectedPurchase.invoiceNumber || 'S/N'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPurchase(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Header Box */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Proveedor Emisor
                    </span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                      {selectedPurchase.supplierName}
                    </h4>
                    {selectedPurchase.supplierCuit && (
                      <span className="text-[11px] text-slate-500 font-mono block">
                        CUIT: {selectedPurchase.supplierCuit}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        selectedPurchase.status === 'Recibido'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                      }`}
                    >
                      {selectedPurchase.status}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Pago: <span className="font-bold text-slate-700 dark:text-slate-200">{selectedPurchase.paymentStatus}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-slate-500">
                  <div>Fecha de Emisión: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPurchase.date}</span></div>
                  <div>Recepción: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPurchase.receiptDate || 'Pendiente'}</span></div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  Artículos Comprados
                </span>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {(selectedPurchase.items || []).map((it) => (
                    <div key={it.productId} className="p-3 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{it.productName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {it.quantity} unidades × {formatCurrency(it.unitCost)}
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(it.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal Neto:</span>
                  <span>{formatCurrency(selectedPurchase.subtotalNet || selectedPurchase.total * 0.826)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>IVA ({selectedPurchase.taxRate || 21}%):</span>
                  <span>{formatCurrency(selectedPurchase.taxAmount || selectedPurchase.total * 0.174)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Facturado:</span>
                  <span>{formatCurrency(selectedPurchase.total)}</span>
                </div>
              </div>

              {/* Reception Button (Demo Simulation) */}
              {selectedPurchase.status !== 'Recibido' && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-amber-900 dark:text-amber-200 block text-xs">
                      ¿La mercadería ya llegó al local?
                    </span>
                    <span className="text-[11px] text-amber-800 dark:text-amber-300">
                      Podés registrar la recepción formal del pedido.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleMarkAsReceived(selectedPurchase)}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs cursor-pointer min-h-[44px]"
                  >
                    Marcar como Recibida (Demo)
                  </button>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast('Comprobante enviado a cola de impresión (Modo Demo)');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <Printer className="w-4 h-4 text-slate-400" />
                  <span>Imprimir Comprobante</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPurchase(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold cursor-pointer min-h-[44px]"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
