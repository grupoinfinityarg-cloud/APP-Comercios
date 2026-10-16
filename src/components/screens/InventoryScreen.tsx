import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  Plus,
  Minus,
  FileText,
  Printer,
  Download,
  Barcode,
  History,
  Truck,
  Package,
  Layers,
  X,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  User,
  Info,
  DollarSign,
  ChevronRight,
  ListFilter,
  Check,
} from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { Product, Employee, Store } from '../../types';
import { CreateAuditEventParams } from '../../utils/auditLogger';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: 'entrada' | 'salida' | 'ajuste' | 'venta' | 'devolucion';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  operator: string;
  date: string;
  time: string;
  location?: string;
}

// Initial realistic audit movements for demo
const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-101',
    productId: 'prod-3',
    productName: 'Yerba Mate Despalada Especial 1kg',
    sku: 'YER-003',
    type: 'entrada',
    quantity: 30,
    previousStock: 28,
    newStock: 58,
    reason: 'Recepción remito proveedor Distribuidora Central #8841',
    operator: 'Carlos Benítez (Depósito)',
    date: '2026-10-14',
    time: '09:30',
    location: 'Depósito Principal - Góndola B',
  },
  {
    id: 'mov-102',
    productId: 'prod-1',
    productName: 'Café Tostado en Grano 1kg Premium',
    sku: 'CAF-001',
    type: 'venta',
    quantity: -2,
    previousStock: 26,
    newStock: 24,
    reason: 'Venta mostrador POS Ticket FC-B-0001-0004291',
    operator: 'Santiago Pérez (Cajero)',
    date: '2026-10-14',
    time: '11:15',
    location: 'Salón Comercial - Góndola Café',
  },
  {
    id: 'mov-103',
    productId: 'prod-5',
    productName: 'Harina de Trigo 0000 1kg',
    sku: 'HAR-005',
    type: 'venta',
    quantity: -8,
    previousStock: 8,
    newStock: 0,
    reason: 'Venta mostrador POS Ticket FC-B-0001-0004289 (Quiebre de stock)',
    operator: 'Santiago Pérez (Cajero)',
    date: '2026-10-14',
    time: '14:20',
    location: 'Salón Comercial - Góndola Harinas',
  },
  {
    id: 'mov-104',
    productId: 'prod-4',
    productName: 'Gaseosa Cola Clásica 1.5L',
    sku: 'GAS-004',
    type: 'salida',
    quantity: -1,
    previousStock: 4,
    newStock: 3,
    reason: 'Merma por rotura de envase en reposición',
    operator: 'Martín Gómez (Gerente)',
    date: '2026-10-13',
    time: '16:45',
    location: 'Depósito Frío - Sector Bebidas',
  },
  {
    id: 'mov-105',
    productId: 'prod-2',
    productName: 'Aceite de Oliva Extra Virgen 500ml',
    sku: 'ACE-002',
    type: 'venta',
    quantity: -3,
    previousStock: 7,
    newStock: 4,
    reason: 'Venta mostrador POS Ticket FC-B-0001-0004290',
    operator: 'Santiago Pérez (Cajero)',
    date: '2026-10-13',
    time: '17:10',
    location: 'Salón Comercial - Góndola Aceites',
  },
  {
    id: 'mov-106',
    productId: 'prod-7',
    productName: 'Dulce de Leche Colonial 400g',
    sku: 'DUL-007',
    type: 'ajuste',
    quantity: 5,
    previousStock: 30,
    newStock: 35,
    reason: 'Auditoría física de góndola mensual (Sobrante reconciliado)',
    operator: 'Valeria Rossi (Encargada)',
    date: '2026-10-12',
    time: '18:00',
    location: 'Salón Comercial - Góndola Dulces',
  },
  {
    id: 'mov-107',
    productId: 'prod-8',
    productName: 'Galletitas de Avena y Miel 250g',
    sku: 'GAL-008',
    type: 'venta',
    quantity: -4,
    previousStock: 9,
    newStock: 5,
    reason: 'Venta mostrador POS Ticket FC-B-0001-0004287',
    operator: 'Santiago Pérez (Cajero)',
    date: '2026-10-12',
    time: '19:15',
    location: 'Salón Comercial - Góndola Snacks',
  },
  {
    id: 'mov-108',
    productId: 'prod-6',
    productName: 'Queso Gouda Horma x 1kg',
    sku: 'QUE-006',
    type: 'entrada',
    quantity: 12,
    previousStock: 0,
    newStock: 12,
    reason: 'Recepción directa proveedor Lácteos del Valle',
    operator: 'Carlos Benítez (Depósito)',
    date: '2026-10-11',
    time: '08:45',
    location: 'Cámara Fría - Estante Lácteos',
  },
];

// Locations dictionary for mock presentation
const PRODUCT_LOCATIONS: Record<string, string> = {
  'prod-1': 'Salón - Góndola Café (Est. 3)',
  'prod-2': 'Salón - Góndola Aceites (Est. 1)',
  'prod-3': 'Depósito - Pasillo B (Tarima 4)',
  'prod-4': 'Salón - Heladera Bebidas 01',
  'prod-5': 'Depósito - Sector Harinas (Piso)',
  'prod-6': 'Cámara de Frío - Lácteos 02',
  'prod-7': 'Salón - Góndola Dulces (Est. 2)',
  'prod-8': 'Salón - Exhibidor Snacks Frente',
};

interface InventoryScreenProps {
  products: Product[];
  currentUser?: Employee;
  activeStore?: Store;
  onAuditLog?: (params: CreateAuditEventParams) => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
  products: initialProducts,
  currentUser,
  activeStore,
  onAuditLog,
}) => {
  // Local state for products allowing live adjustments
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [movements, setMovements] = useState<StockMovement[]>(INITIAL_MOVEMENTS);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'critico' | 'bajo' | 'optimo'>('todos');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals state
  const [activeModal, setActiveModal] = useState<'adjust' | 'history' | 'reorder' | 'report' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Quick adjust form state
  const [adjustProductId, setAdjustProductId] = useState<string>('');
  const [adjustType, setAdjustType] = useState<'entrada' | 'salida' | 'recuento' | 'devolucion'>('entrada');
  const [adjustQuantity, setAdjustQuantity] = useState<string>('5');
  const [adjustReason, setAdjustReason] = useState<string>('Auditoría física periódica');
  const [adjustOperator, setAdjustOperator] = useState<string>('Martín Gómez (Gerente)');
  const [adjustError, setAdjustError] = useState<string | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Categories list
  const categories = ['Todas', ...Array.from(new Set(productList.map((p) => p.category)))];

  // Helper currency format
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Metric computations
  const totalArticles = productList.length;
  const totalStockUnits = productList.reduce((acc, p) => acc + p.stock, 0);
  const totalValuationCost = productList.reduce((acc, p) => acc + p.stock * p.costPrice, 0);
  const totalValuationRetail = productList.reduce((acc, p) => acc + p.stock * p.salePrice, 0);
  const lowStockProducts = productList.filter((p) => p.stock > 0 && p.stock <= p.minStock);
  const outOfStockProducts = productList.filter((p) => p.stock === 0);
  const optimalProducts = productList.filter((p) => p.stock > p.minStock);

  // Filter products
  const filteredProducts = productList.filter((p) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      term === '' ||
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.barcode.includes(term);

    const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;

    let matchesStatus = true;
    if (statusFilter === 'critico') {
      matchesStatus = p.stock === 0;
    } else if (statusFilter === 'bajo') {
      matchesStatus = p.stock > 0 && p.stock <= p.minStock;
    } else if (statusFilter === 'optimo') {
      matchesStatus = p.stock > p.minStock;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Open Adjust Modal with specific product
  const handleOpenAdjust = (prod?: Product) => {
    const target = prod || productList[0];
    if (target) {
      setSelectedProduct(target);
      setAdjustProductId(target.id);
    }
    setAdjustType('entrada');
    setAdjustQuantity('5');
    setAdjustReason('Auditoría física periódica');
    setAdjustError(null);
    setActiveModal('adjust');
  };

  // Open Reorder Modal
  const handleOpenReorder = (prod: Product) => {
    setSelectedProduct(prod);
    setActiveModal('reorder');
  };

  // Open History / Kardex Modal
  const handleOpenHistory = (prod?: Product) => {
    setSelectedProduct(prod || null);
    setActiveModal('history');
  };

  // Handle Quick Adjust Submission
  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdjustError(null);

    const qty = parseInt(adjustQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setAdjustError('Por favor ingresa una cantidad válida mayor a 0');
      return;
    }

    if (!adjustReason.trim()) {
      setAdjustError('Debes ingresar un motivo o justificación para el ajuste de inventario');
      return;
    }

    const currentProd = productList.find((p) => p.id === adjustProductId);
    if (!currentProd) {
      setAdjustError('No se encontró el producto a ajustar');
      return;
    }

    let resultingStock = currentProd.stock;
    let movementTypeLabel: StockMovement['type'] = 'ajuste';
    let qtyEffect = qty;

    if (adjustType === 'entrada') {
      resultingStock = currentProd.stock + qty;
      movementTypeLabel = 'entrada';
      qtyEffect = qty;
    } else if (adjustType === 'salida') {
      if (qty > currentProd.stock) {
        setAdjustError(`No se puede dar de baja más stock del disponible (${currentProd.stock} ${currentProd.unit})`);
        return;
      }
      resultingStock = currentProd.stock - qty;
      movementTypeLabel = 'salida';
      qtyEffect = -qty;
    } else if (adjustType === 'recuento') {
      // Direct adjustment to audited count
      resultingStock = qty;
      movementTypeLabel = 'ajuste';
      qtyEffect = qty - currentProd.stock;
    } else if (adjustType === 'devolucion') {
      resultingStock = currentProd.stock + qty;
      movementTypeLabel = 'devolucion';
      qtyEffect = qty;
    }

    // Determine new status
    let newStatus: Product['status'] = 'disponible';
    if (resultingStock === 0) {
      newStatus = 'agotado';
    } else if (resultingStock <= currentProd.minStock) {
      newStatus = 'bajo_stock';
    }

    // Update product in local state
    const updatedList = productList.map((p) => {
      if (p.id === currentProd.id) {
        return {
          ...p,
          stock: resultingStock,
          status: newStatus,
        };
      }
      return p;
    });
    setProductList(updatedList);

    // Create Kardex movement record
    const now = new Date();
    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      productId: currentProd.id,
      productName: currentProd.name,
      sku: currentProd.sku,
      type: movementTypeLabel,
      quantity: qtyEffect,
      previousStock: currentProd.stock,
      newStock: resultingStock,
      reason: adjustReason.trim(),
      operator: adjustOperator,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      location: PRODUCT_LOCATIONS[currentProd.id] || 'Depósito General',
    };

    setMovements([newMovement, ...movements]);
    setActiveModal(null);
    showToast(`Stock de "${currentProd.name}" ajustado correctamente a ${resultingStock} ${currentProd.unit}`);

    // Auditoría automática de ajuste de inventario
    if (onAuditLog) {
      onAuditLog({
        module: 'Inventario y Stock',
        action: `Ajuste de stock: ${currentProd.name}`,
        category: 'stock',
        status: 'exitoso',
        details: `Ajuste (${movementTypeLabel}) de ${currentProd.name} (SKU: ${currentProd.sku}): stock anterior ${currentProd.stock} ${currentProd.unit}, stock nuevo ${resultingStock} ${currentProd.unit} (${qtyEffect >= 0 ? '+' : ''}${qtyEffect} ${currentProd.unit}). Motivo: "${adjustReason.trim()}".`,
        entityId: currentProd.id,
        previousValue: `Stock previo: ${currentProd.stock} ${currentProd.unit}`,
        newValue: `Stock actual: ${resultingStock} ${currentProd.unit}`,
        severity: resultingStock === 0 ? 'alta' : 'baja',
        currentUser: currentUser ? { name: currentUser.name, role: currentUser.role, id: currentUser.id } : { name: adjustOperator, role: 'Encargado' },
        currentStore: activeStore ? { name: activeStore.name, id: activeStore.id } : null,
      });
    }
  };

  // Stepper quick adjustment for mobile cards
  const handleQuickStepper = (prod: Product, delta: number) => {
    if (prod.stock + delta < 0) return;

    const newStock = prod.stock + delta;
    let newStatus: Product['status'] = 'disponible';
    if (newStock === 0) newStatus = 'agotado';
    else if (newStock <= prod.minStock) newStatus = 'bajo_stock';

    setProductList(
      productList.map((p) => (p.id === prod.id ? { ...p, stock: newStock, status: newStatus } : p))
    );

    const now = new Date();
    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      type: delta > 0 ? 'entrada' : 'salida',
      quantity: delta,
      previousStock: prod.stock,
      newStock: newStock,
      reason: delta > 0 ? 'Conteo rápido móvil (+1)' : 'Ajuste rápido móvil (-1)',
      operator: 'Martín Gómez (Gerente)',
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      location: PRODUCT_LOCATIONS[prod.id] || 'Salón Comercial',
    };
    setMovements([newMovement, ...movements]);
    showToast(`${prod.name}: Stock actualizado a ${newStock} ${prod.unit}`);

    // Auditoría automática de ajuste rápido
    if (onAuditLog) {
      onAuditLog({
        module: 'Inventario y Stock',
        action: `Ajuste rápido de stock: ${prod.name}`,
        category: 'stock',
        status: 'exitoso',
        details: `Ajuste rápido en mostrador de ${prod.name} (SKU: ${prod.sku}): stock anterior ${prod.stock} ${prod.unit}, stock nuevo ${newStock} ${prod.unit} (${delta > 0 ? '+' : ''}${delta} ${prod.unit}).`,
        entityId: prod.id,
        previousValue: `Stock previo: ${prod.stock} ${prod.unit}`,
        newValue: `Stock actual: ${newStock} ${prod.unit}`,
        severity: newStock === 0 ? 'alta' : 'baja',
        currentUser: currentUser ? { name: currentUser.name, role: currentUser.role, id: currentUser.id } : null,
        currentStore: activeStore ? { name: activeStore.name, id: activeStore.id } : null,
      });
    }
  };

  // Generate Suggested Reorder Confirmation
  const handleConfirmReorder = (prod: Product, orderQty: number) => {
    const now = new Date();
    const newStock = prod.stock + orderQty;
    let newStatus: Product['status'] = 'disponible';
    if (newStock <= prod.minStock) newStatus = 'bajo_stock';

    // Simulate immediate goods reception in demo mode
    setProductList(
      productList.map((p) => (p.id === prod.id ? { ...p, stock: newStock, status: newStatus } : p))
    );

    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      type: 'entrada',
      quantity: orderQty,
      previousStock: prod.stock,
      newStock: newStock,
      reason: `Recepción orden de reposición sugerida #${Math.floor(1000 + Math.random() * 9000)}`,
      operator: 'Martín Gómez (Gerente)',
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      location: PRODUCT_LOCATIONS[prod.id] || 'Depósito Principal',
    };
    setMovements([newMovement, ...movements]);
    setActiveModal(null);
    showToast(`Orden de reposición procesada: +${orderQty} ${prod.unit} ingresadas a ${prod.name}`);
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
        title="Módulo 4: Inventario y Control de Stock"
        description="Auditoría de existencias físicas, valorización a precio de costo, kardex histórico de movimientos, alertas automáticas de reorden y ajustes por inventario físico en tiempo real."
      />

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Inventario & Control de Stock
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Boxes className="w-3 h-3" />
              Depósito Central
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Valuación de existencias, control de mermas, auditoría de recuento y puntos críticos de reposición
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenHistory()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition-all cursor-pointer min-h-[44px]"
          >
            <History className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Kardex / Movimientos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('report')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition-all cursor-pointer min-h-[44px]"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Reporte Valorizado</span>
            <span className="sm:hidden">Reporte</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAdjust()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer min-h-[44px]"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Ajuste de Stock</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Valorización de Stock al Costo */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Valorización Costo</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(totalValuationCost)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Venta est.: {formatCurrency(totalValuationRetail)}
          </p>
        </div>

        {/* Card 2: Total Unidades y Artículos */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Unidades Totales</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {totalStockUnits}{' '}
            <span className="text-xs font-semibold text-slate-400">unidades</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Distribuidas en {totalArticles} referencias activas
          </p>
        </div>

        {/* Card 3: Stock Bajo */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Bajo Mínimo</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
            {lowStockProducts.length}{' '}
            <span className="text-xs font-semibold text-slate-400">artículos</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Próximos a punto de reorden
          </p>
        </div>

        {/* Card 4: Quiebre de Stock */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Quiebre de Stock</span>
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
            {outOfStockProducts.length}{' '}
            <span className="text-xs font-semibold text-slate-400">agotados</span>
          </div>
          <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 font-semibold">
            Requiere compra urgente
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
              placeholder="Buscar por artículo, SKU o código de barra..."
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

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all min-h-[44px] cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  Categoría: {c}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
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
                <Boxes className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Estado:
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
            Todos ({productList.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('critico')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 min-h-[36px] ${
              statusFilter === 'critico'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            Agotados ({outOfStockProducts.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('bajo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 min-h-[36px] ${
              statusFilter === 'bajo'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Bajo Mínimo ({lowStockProducts.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('optimo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 min-h-[36px] ${
              statusFilter === 'optimo'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Stock Óptimo ({optimalProducts.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <Boxes className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No se encontraron artículos con ese criterio
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Prueba ajustando la búsqueda por texto o cambiando el filtro de categoría y estado.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('Todas');
              setStatusFilter('todos');
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
                  <th className="py-3 px-4">Artículo / Identificación</th>
                  <th className="py-3 px-3">Categoría & Ubicación</th>
                  <th className="py-3 px-3 text-center">Stock Actual</th>
                  <th className="py-3 px-3 text-center">Mínimo</th>
                  <th className="py-3 px-3 text-center min-w-[130px]">Nivel de Existencias</th>
                  <th className="py-3 px-3 text-right">Costo Unit.</th>
                  <th className="py-3 px-3 text-right">Valuación Total</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredProducts.map((p) => {
                  const isUnder = p.stock <= p.minStock && p.stock > 0;
                  const isOut = p.stock === 0;
                  const targetOptimal = p.minStock * 2 || 1;
                  const percentage = Math.min(100, Math.round((p.stock / targetOptimal) * 100));
                  const location = PRODUCT_LOCATIONS[p.id] || 'Depósito Central';

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors ${
                        isOut ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Name & Identifiers */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                          {p.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                          <span className="font-semibold text-slate-600 dark:text-slate-300">
                            {p.sku}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Barcode className="w-3 h-3 text-slate-400" />
                            {p.barcode}
                          </span>
                        </div>
                      </td>

                      {/* Category & Location */}
                      <td className="py-3 px-3">
                        <div className="text-slate-700 dark:text-slate-200 font-medium">
                          {p.category}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{location}</span>
                        </div>
                      </td>

                      {/* Current Stock */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg font-black text-xs ${
                            isOut
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : isUnder
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {p.stock} {p.unit}
                        </span>
                      </td>

                      {/* Min Stock */}
                      <td className="py-3 px-3 text-center text-slate-500 font-medium">
                        {p.minStock} {p.unit}
                      </td>

                      {/* Level Progress Bar */}
                      <td className="py-3 px-3 text-center">
                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-600/50">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isOut
                                ? 'bg-rose-500'
                                : isUnder
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${isOut ? 5 : percentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                          {isOut
                            ? 'Agotado (0%)'
                            : isUnder
                            ? `Bajo (${percentage}% de óptimo)`
                            : `Óptimo (${percentage}%)`}
                        </span>
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-3 text-right font-medium text-slate-600 dark:text-slate-300">
                        {formatCurrency(p.costPrice)}
                      </td>

                      {/* Valuation Total */}
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(p.stock * p.costPrice)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Reorder Button */}
                          {(isOut || isUnder) ? (
                            <button
                              type="button"
                              onClick={() => handleOpenReorder(p)}
                              title="Generar orden de reposición sugerida"
                              className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors cursor-pointer min-h-[36px] flex items-center gap-1"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Reponer</span>
                            </button>
                          ) : (
                            <span className="px-2 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-md">
                              Óptimo
                            </span>
                          )}

                          {/* Quick Adjust Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenAdjust(p)}
                            title="Ajustar stock físico"
                            className="p-1.5 text-slate-600 hover:text-amber-600 dark:text-slate-300 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                          </button>

                          {/* Kardex Movements Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenHistory(p)}
                            title="Ver historial de movimientos / Kardex"
                            className="p-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS / MOBILE VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredProducts.map((p) => {
            const isUnder = p.stock <= p.minStock && p.stock > 0;
            const isOut = p.stock === 0;
            const targetOptimal = p.minStock * 2 || 1;
            const percentage = Math.min(100, Math.round((p.stock / targetOptimal) * 100));
            const location = PRODUCT_LOCATIONS[p.id] || 'Depósito Central';

            return (
              <div
                key={p.id}
                className={`bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs flex flex-col justify-between ${
                  isOut ? 'border-l-4 border-l-rose-500' : isUnder ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-emerald-500'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {p.category}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mt-0.5">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {p.sku}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Barcode className="w-3 h-3 text-slate-400" />
                          {p.barcode}
                        </span>
                      </div>
                    </div>

                    {/* Stock badge */}
                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-3 py-1 rounded-xl font-black text-xs ${
                          isOut
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200'
                            : isUnder
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                        }`}
                      >
                        {p.stock} {p.unit}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Mínimo: {p.minStock} {p.unit}
                      </span>
                    </div>
                  </div>

                  {/* Location & Valuation */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ubicación</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {location}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Valuación Stock</span>
                      <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                        {formatCurrency(p.stock * p.costPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Level progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Nivel de existencia: {percentage}%</span>
                      <span>{isOut ? 'Agotado' : isUnder ? 'Bajo' : 'Correcto'}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isOut ? 'bg-rose-500' : isUnder ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${isOut ? 5 : percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Controls with Steppers */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                  {/* Stepper buttons for quick physical tally */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleQuickStepper(p, -1)}
                      disabled={p.stock <= 0}
                      title="Restar 1 unidad"
                      className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-400 flex items-center justify-center font-bold shadow-xs cursor-pointer min-h-[36px] min-w-[36px]"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 text-xs font-bold text-slate-700 dark:text-slate-200 font-mono">
                      {p.stock}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuickStepper(p, 1)}
                      title="Sumar 1 unidad"
                      className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-emerald-600 flex items-center justify-center font-bold shadow-xs cursor-pointer min-h-[36px] min-w-[36px]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {(isOut || isUnder) && (
                      <button
                        type="button"
                        onClick={() => handleOpenReorder(p)}
                        className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer min-h-[44px]"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Reponer</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenAdjust(p)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer min-h-[44px]"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Ajustar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenHistory(p)}
                      title="Ver Kardex"
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <History className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: AJUSTE MANUAL Y RÁPIDO DE STOCK                  */}
      {/* ========================================================= */}
      {activeModal === 'adjust' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Ajuste de Existencias Físicas
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Modificación controlada de stock con registro en Kardex
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4">
              {adjustError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{adjustError}</span>
                </div>
              )}

              {/* Product Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Artículo a Modificar
                </label>
                <select
                  value={adjustProductId}
                  onChange={(e) => {
                    setAdjustProductId(e.target.value);
                    const prod = productList.find((p) => p.id === e.target.value);
                    if (prod) setSelectedProduct(prod);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 min-h-[44px] cursor-pointer"
                >
                  {productList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — [Stock actual: {p.stock} {p.unit}] (SKU: {p.sku})
                    </option>
                  ))}
                </select>
              </div>

              {/* Adjustment Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Tipo de Operación
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setAdjustType('entrada')}
                    className={`p-3 rounded-xl border text-left font-semibold transition-all cursor-pointer min-h-[48px] flex items-center gap-2 ${
                      adjustType === 'entrada'
                        ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold">+ Entrada de Stock</div>
                      <div className="text-[10px] font-normal text-slate-500">Recepción / Sobrante</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustType('salida')}
                    className={`p-3 rounded-xl border text-left font-semibold transition-all cursor-pointer min-h-[48px] flex items-center gap-2 ${
                      adjustType === 'salida'
                        ? 'border-rose-500 bg-rose-50/80 text-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4 text-rose-600 shrink-0" />
                    <div>
                      <div className="font-bold">- Salida / Merma</div>
                      <div className="text-[10px] font-normal text-slate-500">Rotura / Vencimiento</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustType('recuento')}
                    className={`p-3 rounded-xl border text-left font-semibold transition-all cursor-pointer min-h-[48px] flex items-center gap-2 ${
                      adjustType === 'recuento'
                        ? 'border-amber-500 bg-amber-50/80 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <RefreshCw className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div className="font-bold">= Recuento Físico</div>
                      <div className="text-[10px] font-normal text-slate-500">Conteo exacto auditado</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustType('devolucion')}
                    className={`p-3 rounded-xl border text-left font-semibold transition-all cursor-pointer min-h-[48px] flex items-center gap-2 ${
                      adjustType === 'devolucion'
                        ? 'border-blue-500 bg-blue-50/80 text-blue-900 dark:bg-blue-950/40 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Boxes className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <div className="font-bold">+ Devolución</div>
                      <div className="text-[10px] font-normal text-slate-500">Retorno de cliente</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Quantity Input with Live Simulation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    {adjustType === 'recuento' ? 'Nuevo Conteo Real' : 'Cantidad a Ajustar'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={adjustQuantity}
                    onChange={(e) => setAdjustQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-base font-bold focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 min-h-[44px]"
                  />
                </div>

                {/* Live Result Preview */}
                <div className="bg-slate-100 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Impacto en Stock:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {selectedProduct ? `${selectedProduct.stock}` : '0'}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                      {(() => {
                        if (!selectedProduct) return '0';
                        const qty = parseInt(adjustQuantity, 10) || 0;
                        if (adjustType === 'entrada' || adjustType === 'devolucion') {
                          return `${selectedProduct.stock + qty} ${selectedProduct.unit}`;
                        } else if (adjustType === 'salida') {
                          return `${Math.max(0, selectedProduct.stock - qty)} ${selectedProduct.unit}`;
                        } else {
                          return `${qty} ${selectedProduct.unit}`;
                        }
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reason / Justification */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Motivo / Justificación *
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Ej: Auditoría física periódica, rotura de tarima..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 min-h-[44px]"
                />
                {/* Reason Quick Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    'Auditoría física de góndola',
                    'Rotura accidental en depósito',
                    'Vencimiento de lote',
                    'Mercadería sin remito',
                    'Devolución de cliente',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setAdjustReason(chip)}
                      className="px-2 py-1 rounded-md text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Operator */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Responsable del Ajuste
                </label>
                <select
                  value={adjustOperator}
                  onChange={(e) => setAdjustOperator(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium min-h-[44px] cursor-pointer"
                >
                  <option value="Martín Gómez (Gerente)">Martín Gómez — Gerente General</option>
                  <option value="Valeria Rossi (Encargada)">Valeria Rossi — Encargada de Sucursal</option>
                  <option value="Carlos Benítez (Depósito)">Carlos Benítez — Encargado de Depósito</option>
                  <option value="Santiago Pérez (Cajero)">Santiago Pérez — Operador de Caja</option>
                </select>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md cursor-pointer min-h-[44px] flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar y Actualizar Stock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: HISTORIAL DE MOVIMIENTOS / KARDEX DE AUDITORÍA   */}
      {/* ========================================================= */}
      {activeModal === 'history' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Auditoría de Kardex / Movimientos
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedProduct
                      ? `Historial detallado para: ${selectedProduct.name} (SKU: ${selectedProduct.sku})`
                      : 'Registro cronológico global de entradas, salidas y ventas'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Product quick filter reset */}
              {selectedProduct && (
                <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3.5 py-2 rounded-xl text-xs">
                  <span className="font-semibold text-amber-800 dark:text-amber-300">
                    Filtrado por: <span className="font-bold">{selectedProduct.name}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer"
                  >
                    Ver todos los artículos
                  </button>
                </div>
              )}

              {/* Movement History Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-[380px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="py-2.5 px-3">Fecha & Hora</th>
                        <th className="py-2.5 px-3">Artículo</th>
                        <th className="py-2.5 px-2.5 text-center">Tipo</th>
                        <th className="py-2.5 px-2.5 text-right">Variación</th>
                        <th className="py-2.5 px-2.5 text-center">Saldo</th>
                        <th className="py-2.5 px-3">Motivo & Operador</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {movements
                        .filter((m) => (selectedProduct ? m.productId === selectedProduct.id : true))
                        .map((mov) => {
                          const isPositive = mov.quantity > 0;
                          return (
                            <tr key={mov.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                                <div>{mov.date}</div>
                                <div className="text-[10px] text-slate-400">{mov.time} hs</div>
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-bold text-slate-900 dark:text-white">
                                  {mov.productName}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  SKU: {mov.sku}
                                </div>
                              </td>
                              <td className="py-2.5 px-2.5 text-center">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    mov.type === 'entrada'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : mov.type === 'salida'
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                      : mov.type === 'venta'
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  }`}
                                >
                                  {mov.type.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-2.5 px-2.5 text-right font-black font-mono">
                                <span className={isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                                  {isPositive ? `+${mov.quantity}` : mov.quantity}
                                </span>
                              </td>
                              <td className="py-2.5 px-2.5 text-center font-bold text-slate-800 dark:text-slate-200">
                                {mov.previousStock} → {mov.newStock}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                                  {mov.reason}
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <User className="w-3 h-3" />
                                  <span>{mov.operator}</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer min-h-[44px]"
                >
                  Cerrar Auditoría
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ORDEN DE REPOSICIÓN SUGERIDA A PROVEEDOR (DEMO)  */}
      {/* ========================================================= */}
      {activeModal === 'reorder' && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-scale-in">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-amber-50 dark:bg-amber-950/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Sugerencia de Reposición
                  </h3>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                    Punto de reorden automático
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Artículo Seleccionado
                </span>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                  {selectedProduct.name}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Stock Actual:</span>
                  <span className="font-bold text-rose-600">
                    {selectedProduct.stock} {selectedProduct.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-slate-500">Stock Mínimo Configurado:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedProduct.minStock} {selectedProduct.unit}
                  </span>
                </div>
              </div>

              {/* Order Calculations */}
              {(() => {
                const suggestedQty = Math.max(selectedProduct.minStock * 2 - selectedProduct.stock, 10);
                const estimatedCost = suggestedQty * selectedProduct.costPrice;

                return (
                  <div className="space-y-3">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-emerald-900 dark:text-emerald-200">
                          Cantidad sugerida a pedir:
                        </span>
                        <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                          +{suggestedQty} {selectedProduct.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-emerald-800 dark:text-emerald-300 pt-1 border-t border-emerald-200 dark:border-emerald-800">
                        <span>Costo estimado de reposición:</span>
                        <span className="font-bold">{formatCurrency(estimatedCost)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Proveedor Asignado
                      </label>
                      <select className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 min-h-[44px]">
                        <option>Distribuidora Mayorista del Plata S.A.</option>
                        <option>Lácteos y Alimentos del Valle</option>
                        <option>Bebidas y Embotelladora Nacional</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setActiveModal(null)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer min-h-[44px]"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirmReorder(selectedProduct, suggestedQty)}
                        className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md cursor-pointer min-h-[44px] flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Generar Orden y Recibir (Demo)</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: REPORTE VALORIZADO DE STOCK / EXPORTACIÓN        */}
      {/* ========================================================= */}
      {activeModal === 'report' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-scale-in">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Reporte de Valuación de Stock
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Resumen consolidado para balance y auditoría fiscal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Report Sheet Preview */}
            <div className="p-6 space-y-4">
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-3">
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <div>
                    <span className="font-black text-slate-900 dark:text-white text-sm">
                      COMERCIOS 360 — Inventario Valorizado
                    </span>
                    <div className="text-[10px] text-slate-400">Sucursal Central (CABA) • Depósito 01</div>
                  </div>
                  <div className="text-right text-[11px] text-slate-500">
                    <div>Fecha: {new Date().toLocaleDateString('es-AR')}</div>
                    <div>Hora: {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Artículos</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{totalArticles}</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Unidades</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{totalStockUnits}</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Costo</span>
                    <span className="text-xs font-black text-emerald-600">{formatCurrency(totalValuationCost)}</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Venta</span>
                    <span className="text-xs font-black text-blue-600">{formatCurrency(totalValuationRetail)}</span>
                  </div>
                </div>

                {/* Categories breakdown preview */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Desglose por Categoría:
                  </span>
                  <div className="space-y-1">
                    {categories.filter((c) => c !== 'Todas').map((cat) => {
                      const prods = productList.filter((p) => p.category === cat);
                      const catCost = prods.reduce((sum, p) => sum + p.stock * p.costPrice, 0);
                      const catUnits = prods.reduce((sum, p) => sum + p.stock, 0);
                      return (
                        <div key={cat} className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800 text-[11px]">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{cat} ({prods.length} arts)</span>
                          <span className="text-slate-500">{catUnits} unidades</span>
                          <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(catCost)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast('Reporte enviado a cola de impresión (Modo Demostración)');
                    setActiveModal(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Imprimir Reporte</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast('Planilla de inventario CSV generada exitosamente (Modo Demostración)');
                    setActiveModal(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Planilla CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
