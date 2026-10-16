import React, { useState, useMemo } from 'react';
import {
  Tag,
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  Sparkles,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Copy,
  Printer,
  ShoppingBag,
  DollarSign,
  Percent,
  Layers,
  Clock,
  AlertTriangle,
  X,
  CreditCard,
  Check,
  ChevronRight,
  Barcode,
  ArrowRight,
  TrendingUp,
  Package,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { Promotion, Product } from '../../types';
import { DEMO_PRODUCTS } from '../../data/demoData';

interface PromotionsScreenProps {
  promotions: Promotion[];
  products?: Product[];
}

export const PromotionsScreen: React.FC<PromotionsScreenProps> = ({
  promotions: initialPromos,
  products = DEMO_PRODUCTS,
}) => {
  // Local state for promotions with full session CRUD
  const [promos, setPromos] = useState<Promotion[]>(initialPromos);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<'Todos' | 'Activas' | 'Pausadas' | 'Vencidas'>('Todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [popPreviewPromo, setPopPreviewPromo] = useState<Promotion | null>(null);
  const [detailPromo, setDetailPromo] = useState<Promotion | null>(null);
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    type: 'Descuento %' as Promotion['type'],
    discountValue: '',
    targetCategory: 'Almacén',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    description: '',
    originalPrice: 0,
    promoPrice: 0,
    percentage: 15,
    minUnits: 1,
    minAmount: 0,
    paymentMethod: 'Todos',
    daysOfWeek: ['Todos los días'],
    active: true,
  });

  const [formError, setFormError] = useState<string | null>(null);

  // POS Simulator State
  const [simProduct, setSimProduct] = useState<string>(products[0]?.id || '');
  const [simQty, setSimQty] = useState<number>(2);
  const [simPayment, setSimPayment] = useState<string>('Todos');

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

  // Helper to check validity status
  const getPromoStatus = (promo: Promotion): 'Activa' | 'Pausada' | 'Vencida' => {
    if (!promo.active) return 'Pausada';
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const until = new Date(promo.validUntil);
    if (until < now) return 'Vencida';
    return 'Activa';
  };

  // Metrics
  const totalPromotions = promos.length;
  const activePromotions = promos.filter((p) => getPromoStatus(p) === 'Activa');
  const pausedPromotions = promos.filter((p) => getPromoStatus(p) === 'Pausada');
  const expiredPromotions = promos.filter((p) => getPromoStatus(p) === 'Vencida');
  const totalSavingsEstimated = promos.reduce((acc, p) => acc + (p.timesUsed || 45) * 1250, 0);

  // Categories list
  const categories = useMemo(() => {
    const list = Array.from(new Set(promos.map((p) => p.targetCategory).filter(Boolean)));
    return ['Todas', 'Todo el comercio', ...list.filter((c) => c !== 'Todo el comercio')];
  }, [promos]);

  // Filtered promotions
  const filteredPromos = useMemo(() => {
    return promos.filter((promo) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        term === '' ||
        promo.title.toLowerCase().includes(term) ||
        (promo.code && promo.code.toLowerCase().includes(term)) ||
        promo.discountValue.toLowerCase().includes(term) ||
        promo.targetCategory.toLowerCase().includes(term) ||
        (promo.description && promo.description.toLowerCase().includes(term));

      const matchesType = selectedType === 'Todos' || promo.type === selectedType;

      const promoStatus = getPromoStatus(promo);
      const matchesStatus =
        selectedStatus === 'Todos' ||
        (selectedStatus === 'Activas' && promoStatus === 'Activa') ||
        (selectedStatus === 'Pausadas' && promoStatus === 'Pausada') ||
        (selectedStatus === 'Vencidas' && promoStatus === 'Vencida');

      const matchesCategory =
        selectedCategory === 'Todas' ||
        promo.targetCategory.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesType && matchesStatus && matchesCategory;
    });
  }, [promos, searchTerm, selectedType, selectedStatus, selectedCategory]);

  // Actions
  const togglePromo = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPromos((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextState = !p.active;
          showToast(
            nextState
              ? `Promoción "${p.title}" activada para caja.`
              : `Promoción "${p.title}" pausada.`
          );
          return { ...p, active: nextState };
        }
        return p;
      })
    );
  };

  const openCreateModal = () => {
    setEditingPromo(null);
    setFormError(null);
    setFormData({
      title: '',
      code: `PROMO-${Math.floor(100 + Math.random() * 900)}`,
      type: 'Descuento %',
      discountValue: '15% OFF en caja',
      targetCategory: 'Almacén',
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      description: '',
      originalPrice: 4500,
      promoPrice: 3825,
      percentage: 15,
      minUnits: 1,
      minAmount: 0,
      paymentMethod: 'Todos',
      daysOfWeek: ['Todos los días'],
      active: true,
    });
    setShowFormModal(true);
  };

  const openEditModal = (promo: Promotion, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPromo(promo);
    setFormError(null);
    setFormData({
      title: promo.title,
      code: promo.code || `PROMO-${promo.id}`,
      type: promo.type,
      discountValue: promo.discountValue,
      targetCategory: promo.targetCategory,
      validFrom: promo.validFrom,
      validUntil: promo.validUntil,
      description: promo.description || '',
      originalPrice: promo.originalPrice || 0,
      promoPrice: promo.promoPrice || 0,
      percentage: promo.percentage || 15,
      minUnits: promo.minUnits || 1,
      minAmount: promo.minAmount || 0,
      paymentMethod: promo.paymentMethod || 'Todos',
      daysOfWeek: promo.daysOfWeek || ['Todos los días'],
      active: promo.active,
    });
    setShowFormModal(true);
  };

  const handleDuplicatePromo = (promo: Promotion, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newPromo: Promotion = {
      ...promo,
      id: `promo-${Date.now()}`,
      code: `${promo.code || 'PROMO'}-COPIA`,
      title: `${promo.title} (Copia)`,
      timesUsed: 0,
      active: false,
    };
    setPromos((prev) => [newPromo, ...prev]);
    showToast(`Promoción duplicada como "${newPromo.title}" (en modo Pausada).`);
  };

  const handleDeletePromo = (id: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPromos((prev) => prev.filter((p) => p.id !== id));
    showToast(`Promoción "${title}" eliminada.`);
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('El título de la promoción es obligatorio.');
      return;
    }
    if (!formData.discountValue.trim()) {
      setFormError('Debes indicar el valor o detalle del beneficio comercial.');
      return;
    }

    if (editingPromo) {
      setPromos((prev) =>
        prev.map((p) =>
          p.id === editingPromo.id
            ? {
                ...p,
                ...formData,
                id: editingPromo.id,
              }
            : p
        )
      );
      showToast(`Promoción "${formData.title}" actualizada exitosamente.`);
    } else {
      const newPromo: Promotion = {
        id: `promo-${Date.now()}`,
        ...formData,
        timesUsed: 0,
      };
      setPromos((prev) => [newPromo, ...prev]);
      showToast(`Nueva promoción "${formData.title}" creada y disponible.`);
    }

    setShowFormModal(false);
  };

  // Type Color Badges
  const getTypeBadge = (type: Promotion['type']) => {
    switch (type) {
      case 'Descuento %':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case '2x1':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Combo':
        return 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Precio Especial':
        return 'bg-sky-100 text-sky-900 dark:bg-sky-950/70 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';
    }
  };

  // Status Badge
  const getStatusBadge = (promo: Promotion) => {
    const status = getPromoStatus(promo);
    if (status === 'Activa') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          Activa en Caja
        </span>
      );
    }
    if (status === 'Pausada') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
          <XCircle className="w-3.5 h-3.5 text-slate-500" />
          Pausada
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
        Vencida
      </span>
    );
  };

  // POS Simulator Calculation
  const selectedSimProduct = products.find((p) => p.id === simProduct) || products[0];
  const simUnitPrice = selectedSimProduct ? selectedSimProduct.salePrice : 0;
  const simSubtotal = simUnitPrice * simQty;

  // Find if an active promo matches the simulator product
  const applicableSimPromo = useMemo(() => {
    if (!selectedSimProduct) return null;
    return (
      promos.find(
        (p) =>
          p.active &&
          (p.targetCategory === 'Todo el comercio' ||
            p.targetCategory.toLowerCase() === selectedSimProduct.category.toLowerCase() ||
            p.title.toLowerCase().includes(selectedSimProduct.name.toLowerCase().split(' ')[0]))
      ) || null
    );
  }, [promos, selectedSimProduct]);

  let simDiscountAmount = 0;
  let simPromoDescription = 'Sin promoción aplicada';

  if (applicableSimPromo) {
    if (applicableSimPromo.type === 'Descuento %') {
      const pct = applicableSimPromo.percentage || 15;
      simDiscountAmount = Math.round((simSubtotal * pct) / 100);
      simPromoDescription = `${applicableSimPromo.title} (${pct}% OFF)`;
    } else if (applicableSimPromo.type === '2x1') {
      const freeUnits = Math.floor(simQty / 2);
      simDiscountAmount = freeUnits * simUnitPrice;
      simPromoDescription = `${applicableSimPromo.title} (${freeUnits} unidad gratis)`;
    } else if (applicableSimPromo.type === 'Precio Especial' && applicableSimPromo.promoPrice) {
      const diff = Math.max(0, simUnitPrice - applicableSimPromo.promoPrice);
      simDiscountAmount = diff * simQty;
      simPromoDescription = `${applicableSimPromo.title} (Ahorro unitario $${diff})`;
    } else if (applicableSimPromo.type === 'Combo') {
      simDiscountAmount = Math.round(simSubtotal * 0.2);
      simPromoDescription = `${applicableSimPromo.title} (Ahorro pack)`;
    }
  }

  const simFinalTotal = Math.max(0, simSubtotal - simDiscountAmount);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs sm:text-sm animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Screen Notice */}
      <DemoNotice
        title="Módulo 11: Promociones, Combos & Ofertas Comerciales"
        description="Gestión integral de descuentos por porcentaje, 2x1, combos de artículos y precios especiales con activación automática en el Punto de Venta (POS) y cartelería para góndola."
      />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Ofertas & Promociones
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                POS En línea
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              Configurá beneficios comerciales automáticos, paquetes de ahorro y carteles de góndola
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowSimulatorModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-600 transition-colors cursor-pointer min-h-[44px]"
          >
            <ShoppingBag className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span>Simulador POS</span>
          </button>

          <button
            type="button"
            onClick={() => setPopPreviewPromo(promos[0] || null)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-600 transition-colors cursor-pointer min-h-[44px]"
          >
            <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span>Cartelería Góndola</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Promoción</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Total Promociones</span>
            <Tag className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {totalPromotions}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            En catálogo comercial
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Activas en Caja</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {activePromotions.length}
          </p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1 font-medium">
            Aplicación automática inmediata
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Pausadas / Borrador</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
            {pausedPromotions.length}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Listas para reactivar
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Ahorro Promocional</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">
            {formatCurrency(totalSavingsEstimated)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Transferido a clientes este mes
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, código (ej. PROMO-2X1), categoría o descripción..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 min-h-[44px]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 self-end md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Tarjetas
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Tabla
            </button>
          </div>
        </div>

        {/* Filters pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Filtros:
          </span>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium min-h-[36px]"
          >
            <option value="Todos">Tipo: Todos</option>
            <option value="Descuento %">Descuento %</option>
            <option value="2x1">2x1 / 3x2</option>
            <option value="Combo">Combo</option>
            <option value="Precio Especial">Precio Especial</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium min-h-[36px]"
          >
            <option value="Todos">Estado: Todos</option>
            <option value="Activas">Solo Activas</option>
            <option value="Pausadas">Solo Pausadas</option>
            <option value="Vencidas">Solo Vencidas</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium min-h-[36px]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                Rubro: {cat}
              </option>
            ))}
          </select>

          {(searchTerm || selectedType !== 'Todos' || selectedStatus !== 'Todos' || selectedCategory !== 'Todas') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedType('Todos');
                setSelectedStatus('Todos');
                setSelectedCategory('Todas');
              }}
              className="px-2.5 py-1.5 text-rose-600 dark:text-rose-400 hover:underline font-semibold ml-auto"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Promos Content */}
      {filteredPromos.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <Tag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No se encontraron promociones
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Prueba ajustando los filtros de búsqueda o crea una nueva oferta para el mostrador.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Promoción</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPromos.map((promo) => {
            const status = getPromoStatus(promo);
            return (
              <div
                key={promo.id}
                className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                  promo.active && status === 'Activa'
                    ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md'
                    : 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-90'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className={`px-2.5 py-1 rounded-lg font-bold text-xs border ${getTypeBadge(
                        promo.type
                      )}`}
                    >
                      {promo.type}
                    </span>
                    {getStatusBadge(promo)}
                  </div>

                  {/* Title & Code */}
                  <div className="mb-2">
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                      {promo.code || `ID-${promo.id}`}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                      {promo.title}
                    </h3>
                  </div>

                  {/* Description if any */}
                  {promo.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
                      {promo.description}
                    </p>
                  )}

                  {/* Discount Banner */}
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                        {promo.discountValue}
                      </span>
                    </div>
                    {promo.promoPrice && promo.promoPrice > 0 && (
                      <span className="text-xs font-extrabold text-blue-700 dark:text-blue-300">
                        {formatCurrency(promo.promoPrice)}
                      </span>
                    )}
                  </div>

                  {/* Conditions & Details */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Alcance:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {promo.targetCategory}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Vigencia:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {promo.validFrom} al {promo.validUntil}
                      </span>
                    </div>

                    {promo.daysOfWeek && promo.daysOfWeek.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Días:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {promo.daysOfWeek.join(', ')}
                        </span>
                      </div>
                    )}

                    {promo.paymentMethod && promo.paymentMethod !== 'Todos' && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Pago:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {promo.paymentMethod}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                      <span>Usos registrados:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {promo.timesUsed || 0} tickets
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Bottom */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-1">
                  {/* Quick Toggle Active Button */}
                  <button
                    type="button"
                    onClick={(e) => togglePromo(promo.id, e)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 min-h-[36px] ${
                      promo.active
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {promo.active ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Activa</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pausada</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPopPreviewPromo(promo)}
                      title="Previsualizar Cartel de Góndola"
                      className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSimProduct(products[0]?.id || '');
                        setShowSimulatorModal(true);
                      }}
                      title="Probar en Simulador de Caja"
                      className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDuplicatePromo(promo, e)}
                      title="Duplicar Promoción"
                      className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => openEditModal(promo, e)}
                      title="Editar Promoción"
                      className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeletePromo(promo.id, promo.title, e)}
                      title="Eliminar Promoción"
                      className="p-2 text-rose-600 hover:text-rose-700 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 uppercase text-[11px] font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3.5">Código / Nombre</th>
                  <th className="px-4 py-3.5">Tipo</th>
                  <th className="px-4 py-3.5">Beneficio Comercial</th>
                  <th className="px-4 py-3.5">Rubro / Alcance</th>
                  <th className="px-4 py-3.5">Vigencia</th>
                  <th className="px-4 py-3.5 text-center">Usos</th>
                  <th className="px-4 py-3.5 text-center">Estado</th>
                  <th className="px-4 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredPromos.map((promo) => {
                  return (
                    <tr
                      key={promo.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-[11px] text-slate-500 font-semibold block">
                          {promo.code || `ID-${promo.id}`}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {promo.title}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getTypeBadge(
                            promo.type
                          )}`}
                        >
                          {promo.type}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-semibold text-blue-700 dark:text-blue-300">
                        {promo.discountValue}
                      </td>

                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">
                        {promo.targetCategory}
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                        <div>
                          {promo.validFrom} al {promo.validUntil}
                        </div>
                        {promo.daysOfWeek && (
                          <div className="text-[10px] text-slate-400">
                            {promo.daysOfWeek.join(', ')}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center font-bold text-slate-800 dark:text-slate-200">
                        {promo.timesUsed || 0}
                      </td>

                      <td className="px-4 py-3 text-center">{getStatusBadge(promo)}</td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => togglePromo(promo.id)}
                            title={promo.active ? 'Pausar' : 'Activar'}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                          >
                            {promo.active ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-slate-400" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setPopPreviewPromo(promo)}
                            title="Cartel Góndola"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(promo)}
                            title="Editar"
                            className="p-1.5 rounded-lg text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePromo(promo.id, promo.title)}
                            title="Eliminar"
                            className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
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
      )}

      {/* MODAL 1: Create / Edit Promotion with Live Shelf Card Preview */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingPromo ? 'Editar Oferta Comercial' : 'Configurar Nueva Oferta Comercial'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Define las reglas de activación automática en caja y mostrador
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form & Live Preview Grid */}
            <form onSubmit={handleSavePromo} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Inputs Columns */}
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Título de la Promoción *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ej. Semana del Café 20% OFF o Combo Desayuno"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Código de Referencia
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="PROMO-001"
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tipo de Promoción
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            type: e.target.value as Promotion['type'],
                            discountValue:
                              e.target.value === '2x1'
                                ? 'Llevás 2 y pagás 1 en caja'
                                : e.target.value === 'Descuento %'
                                ? '15% OFF en caja'
                                : formData.discountValue,
                          })
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm min-h-[44px]"
                      >
                        <option value="Descuento %">Descuento %</option>
                        <option value="2x1">2x1 / Llevás 2 Pagás 1</option>
                        <option value="Combo">Combo de Artículos</option>
                        <option value="Precio Especial">Precio Especial Unitario</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Texto Destacado del Beneficio *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      placeholder="Ej. 20% OFF en granos o 2x1 en la 2da unidad"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm min-h-[44px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Rubro o Categoría
                      </label>
                      <select
                        value={formData.targetCategory}
                        onChange={(e) => setFormData({ ...formData, targetCategory: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm min-h-[44px]"
                      >
                        <option value="Todo el comercio">Todo el comercio</option>
                        <option value="Almacén">Almacén</option>
                        <option value="Alimentos y Bebidas">Alimentos y Bebidas</option>
                        <option value="Bebidas">Bebidas</option>
                        <option value="Lácteos">Lácteos</option>
                        <option value="Limpieza">Limpieza</option>
                        <option value="Golosinas">Golosinas</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Medio de Pago Válido
                      </label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm min-h-[44px]"
                      >
                        <option value="Todos">Todos los medios</option>
                        <option value="Efectivo / Débito">Solo Efectivo o Débito</option>
                        <option value="Transferencia">Solo Transferencia</option>
                        <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Válido Desde
                      </label>
                      <input
                        type="date"
                        value={formData.validFrom}
                        onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Válido Hasta
                      </label>
                      <input
                        type="date"
                        value={formData.validUntil}
                        onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Descripción o Legales para el Ticket
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Información adicional para el cliente o cajero..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="promoActiveCheck"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 rounded-sm text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="promoActiveCheck"
                      className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                      Activar inmediatamente en el Punto de Venta (POS)
                    </label>
                  </div>
                </div>

                {/* Live Preview Card Column */}
                <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Previsualización en Góndola
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                        En Vivo
                      </span>
                    </div>

                    {/* Shelf Tag Graphic */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border-2 border-dashed border-amber-400 dark:border-amber-600 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="bg-amber-500 text-slate-950 font-black text-[11px] px-2.5 py-1 rounded-sm uppercase tracking-wide">
                          COMERCIOS 360 • OFERTA
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">
                          {formData.code || 'PROMO-000'}
                        </span>
                      </div>

                      <h4 className="font-black text-sm text-slate-900 dark:text-white line-clamp-2">
                        {formData.title || 'Nombre de la Oferta'}
                      </h4>

                      <div className="bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/60 text-center">
                        <p className="text-sm font-black text-amber-700 dark:text-amber-300">
                          {formData.discountValue || 'Beneficio configurado'}
                        </p>
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                        <div>Rubro: <strong>{formData.targetCategory}</strong></div>
                        <div>Vigencia: {formData.validFrom} al {formData.validUntil}</div>
                        <div>Medio de pago: {formData.paymentMethod}</div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <Barcode className="w-20 h-6 text-slate-600 dark:text-slate-400" />
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Valido en sucursal
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-xs">
                    <p className="font-semibold">Información del sistema:</p>
                    <p className="text-[11px] mt-0.5">
                      Al guardar, el motor de ventas aplicará automáticamente esta regla durante el cobro cuando los artículos coincidan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer min-h-[44px]"
                >
                  {editingPromo ? 'Guardar Cambios' : 'Crear Promoción'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Shelf Signage POP Preview & Printable Voucher */}
      {popPreviewPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Cartelería para Góndola / Vidriera
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPopPreviewPromo(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Printable Poster Mockup */}
              <div className="bg-amber-500 rounded-2xl p-6 text-slate-950 border-4 border-amber-600 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b-2 border-slate-950/20 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm tracking-wider uppercase bg-slate-950 text-white px-3 py-1 rounded-sm">
                      COMERCIOS 360
                    </span>
                    <span className="font-bold text-xs uppercase text-slate-900">
                      Góndola Central
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold bg-white/40 px-2 py-0.5 rounded">
                    {popPreviewPromo.code || 'OFERTA-ESP'}
                  </span>
                </div>

                <div className="text-center py-2">
                  <span className="inline-block bg-slate-950 text-amber-400 font-black text-xs px-3 py-1 rounded-full uppercase tracking-widest mb-2 shadow-xs">
                    ¡SUPER OFERTA DESTACADA!
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-tight">
                    {popPreviewPromo.title}
                  </h2>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-inner text-center border-2 border-slate-900">
                  <p className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
                    {popPreviewPromo.discountValue}
                  </p>
                  {popPreviewPromo.originalPrice && popPreviewPromo.promoPrice && (
                    <div className="flex items-center justify-center gap-3 mt-1 text-xs">
                      <span className="text-slate-500 line-through">
                        Antes: {formatCurrency(popPreviewPromo.originalPrice)}
                      </span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        AHORA: {formatCurrency(popPreviewPromo.promoPrice)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-900 border-t-2 border-slate-950/20 pt-3">
                  <div>
                    <div>Rubro: {popPreviewPromo.targetCategory}</div>
                    <div>Medio de Pago: {popPreviewPromo.paymentMethod || 'Todos'}</div>
                  </div>
                  <div className="text-right">
                    <div>Validez: {popPreviewPromo.validFrom} al {popPreviewPromo.validUntil}</div>
                    <div className="text-[10px] text-slate-800">Hasta agotar stock de mostrador</div>
                  </div>
                </div>

                <div className="flex justify-center pt-1">
                  <Barcode className="w-32 h-8 text-slate-950" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    showToast('Descarga iniciada: cartel_gondola_demo.pdf generado');
                    setPopPreviewPromo(null);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer min-h-[44px]"
                >
                  Descargar PDF Góndola (Demo)
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPopPreviewPromo(null)}
                    className="px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs sm:text-sm font-semibold transition-colors min-h-[44px]"
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      showToast('Enviado a cola de impresión comercial (Demo).');
                      setPopPreviewPromo(null);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer min-h-[44px]"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Cartel (Demo)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: POS Cashier Simulator */}
      {showSimulatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Simulador de Aplicación en POS / Caja
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Comprueba cómo el algoritmo de cobro aplica las promociones en tiempo real
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSimulatorModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Product and Qty selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Artículo a Facturar
                  </label>
                  <select
                    value={simProduct}
                    onChange={(e) => setSimProduct(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm min-h-[44px]"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatCurrency(p.salePrice)} ({p.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cantidad
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setSimQty((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-l-xl text-sm font-bold min-h-[44px]"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={simQty}
                      onChange={(e) => setSimQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-center p-2 border-y border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => setSimQty((q) => q + 1)}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-r-xl text-sm font-bold min-h-[44px]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulation Result Ticket Box */}
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-dashed border-slate-300 dark:border-slate-600 text-slate-500 font-sans">
                  <span className="font-bold text-xs">CÁLCULO DEL TICKET</span>
                  <span className="text-[10px]">MOTOR COMERCIOS 360</span>
                </div>

                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>
                    {simQty}x {selectedSimProduct?.name} ({formatCurrency(simUnitPrice)})
                  </span>
                  <span>{formatCurrency(simSubtotal)}</span>
                </div>

                {applicableSimPromo && simDiscountAmount > 0 ? (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-1.5 font-sans">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{simPromoDescription}</span>
                    </div>
                    <span>- {formatCurrency(simDiscountAmount)}</span>
                  </div>
                ) : (
                  <div className="text-slate-400 italic text-[11px] font-sans">
                    No hay promociones activas que coincidan con este artículo o cantidad.
                  </div>
                )}

                <div className="pt-2 border-t border-slate-300 dark:border-slate-600 flex justify-between items-center text-sm font-sans font-black text-slate-900 dark:text-white">
                  <span>TOTAL A COBRAR:</span>
                  <span className="text-base text-blue-600 dark:text-blue-400">
                    {formatCurrency(simFinalTotal)}
                  </span>
                </div>

                {simDiscountAmount > 0 && (
                  <div className="text-right text-[11px] font-sans text-emerald-600 dark:text-emerald-400 font-bold">
                    El cliente ahorra {formatCurrency(simDiscountAmount)} en esta compra
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimulatorModal(false)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer min-h-[44px]"
                >
                  Entendido / Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
