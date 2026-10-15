import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  Edit2,
  Eye,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Layers,
  Filter,
  Check,
  CreditCard,
  MapPin,
  FileSpreadsheet,
} from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { Supplier } from '../../types';
import { DEMO_PURCHASES } from '../../data/demoData';

interface SuppliersScreenProps {
  suppliers: Supplier[];
}

export const SuppliersScreen: React.FC<SuppliersScreenProps> = ({ suppliers: initialSuppliers }) => {
  // Local state for suppliers allowing full CRUD during session
  const [supplierList, setSupplierList] = useState<Supplier[]>(initialSuppliers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'con_deuda' | 'al_dia'>('todos');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [detailSupplier, setDetailSupplier] = useState<Supplier | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    cuit: '',
    contactPerson: '',
    phone: '',
    email: '',
    category: 'Almacén General',
    paymentTerms: '30 días fecha factura',
    debtBalance: 0,
    address: '',
    notes: '',
  });

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

  // Categories list
  const categories = ['Todas', ...Array.from(new Set(supplierList.map((s) => s.category)))];

  // Metrics
  const totalSuppliers = supplierList.length;
  const suppliersWithDebt = supplierList.filter((s) => s.debtBalance > 0);
  const totalDebtBalance = supplierList.reduce((acc, s) => acc + s.debtBalance, 0);
  const suppliersUpToDate = supplierList.filter((s) => s.debtBalance === 0);

  // Filtered suppliers
  const filteredSuppliers = supplierList.filter((s) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      term === '' ||
      s.name.toLowerCase().includes(term) ||
      s.cuit.includes(term) ||
      s.contactPerson.toLowerCase().includes(term) ||
      s.category.toLowerCase().includes(term) ||
      s.phone.includes(term);

    const matchesCategory = selectedCategory === 'Todas' || s.category === selectedCategory;

    let matchesStatus = true;
    if (statusFilter === 'con_deuda') matchesStatus = s.debtBalance > 0;
    else if (statusFilter === 'al_dia') matchesStatus = s.debtBalance === 0;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setFormError(null);
    setFormData({
      name: '',
      cuit: '',
      contactPerson: '',
      phone: '',
      email: '',
      category: 'Almacén General',
      paymentTerms: '30 días fecha factura',
      debtBalance: 0,
      address: '',
      notes: '',
    });
    setShowFormModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setFormError(null);
    setFormData({
      name: sup.name,
      cuit: sup.cuit,
      contactPerson: sup.contactPerson,
      phone: sup.phone,
      email: sup.email,
      category: sup.category,
      paymentTerms: sup.paymentTerms,
      debtBalance: sup.debtBalance,
      address: (sup as any).address || 'Av. Corrientes 3420, CABA',
      notes: (sup as any).notes || 'Proveedor verificado con entrega semanal programada',
    });
    setShowFormModal(true);
  };

  // Handle Form Submit (Alta / Edición)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validations
    if (!formData.name.trim()) {
      setFormError('La Razón Social o Nombre del Proveedor es obligatorio.');
      return;
    }

    const cleanCuit = formData.cuit.trim();
    if (!cleanCuit) {
      setFormError('El CUIT del proveedor es obligatorio.');
      return;
    }

    // Check duplicate CUIT (excluding current when editing)
    const duplicate = supplierList.find(
      (s) => s.cuit.replace(/[^0-9]/g, '') === cleanCuit.replace(/[^0-9]/g, '') &&
      (!editingSupplier || s.id !== editingSupplier.id)
    );

    if (duplicate) {
      setFormError(`Ya existe un proveedor registrado con el CUIT ${cleanCuit} (${duplicate.name}).`);
      return;
    }

    if (!formData.contactPerson.trim()) {
      setFormError('El nombre del contacto comercial es obligatorio.');
      return;
    }

    if (!formData.phone.trim()) {
      setFormError('El número de teléfono comercial es obligatorio.');
      return;
    }

    if (editingSupplier) {
      // Edit existing
      const updated = supplierList.map((s) => {
        if (s.id === editingSupplier.id) {
          return {
            ...s,
            name: formData.name.trim(),
            cuit: cleanCuit,
            contactPerson: formData.contactPerson.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            category: formData.category,
            paymentTerms: formData.paymentTerms,
            debtBalance: Number(formData.debtBalance) || 0,
            address: formData.address.trim(),
            notes: formData.notes.trim(),
          };
        }
        return s;
      });
      setSupplierList(updated);
      setShowFormModal(false);
      showToast(`Proveedor "${formData.name.trim()}" actualizado correctamente`);
    } else {
      // Create new
      const newSup: Supplier = {
        id: `sup-${Date.now()}`,
        name: formData.name.trim(),
        cuit: cleanCuit,
        contactPerson: formData.contactPerson.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        category: formData.category,
        paymentTerms: formData.paymentTerms,
        debtBalance: Number(formData.debtBalance) || 0,
      };
      (newSup as any).address = formData.address.trim();
      (newSup as any).notes = formData.notes.trim();

      setSupplierList([...supplierList, newSup]);
      setShowFormModal(false);
      showToast(`Proveedor "${newSup.name}" registrado exitosamente`);
    }
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

      <DemoNotice
        title="Módulo 9: Gestión de Proveedores Comerciales"
        description="Padrón integral de distribuidores mayoristas, condiciones de pago, contacto directo y control de cuentas corrientes acreedoras."
      />

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Proveedores Comerciales
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Truck className="w-3 h-3" />
              Padrón Activo
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Administración de cuentas con fabricantes y condiciones comerciales pactadas
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Proveedores</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {totalSuppliers}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Distribuidores y fabricantes registrados
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Saldo Adeudado</span>
            <DollarSign className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatCurrency(totalDebtBalance)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Total en cuentas corrientes comerciales
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Con Saldo Pendiente</span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
            {suppliersWithDebt.length}{' '}
            <span className="text-xs font-semibold text-slate-400">proveedores</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Con facturas por liquidar a plazo
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cuentas Al Día</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {suppliersUpToDate.length}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">
            Sin saldos adeudados pendientes
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
              placeholder="Buscar por razón social, CUIT, contacto o rubro..."
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
                  Rubro: {c}
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
                <Truck className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Estado de Saldo:
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
            Todos ({supplierList.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('con_deuda')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 min-h-[36px] ${
              statusFilter === 'con_deuda'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Con Saldo Adeudado ({suppliersWithDebt.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('al_dia')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 min-h-[36px] ${
              statusFilter === 'al_dia'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Al Día ({suppliersUpToDate.length})
          </button>
        </div>
      </div>

      {/* Main List */}
      {filteredSuppliers.length === 0 ? (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <Truck className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No se encontraron proveedores con ese criterio
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Verifica el texto ingresado o cambia los filtros de rubro y saldo.
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
                  <th className="py-3 px-4">Proveedor / Razón Social</th>
                  <th className="py-3 px-3">CUIT</th>
                  <th className="py-3 px-3">Rubro</th>
                  <th className="py-3 px-3">Contacto Comercial</th>
                  <th className="py-3 px-3">Condiciones de Pago</th>
                  <th className="py-3 px-3 text-right">Saldo en Cuenta</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {s.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{s.email}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      {s.cuit}
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                        {s.category}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {s.contactPerson}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{s.phone}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">
                      {s.paymentTerms}
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-xs sm:text-sm">
                      {s.debtBalance > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400 font-black">
                          {formatCurrency(s.debtBalance)}
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          $0 (Al Día)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailSupplier(s)}
                          title="Ver Ficha y Compras del Proveedor"
                          className="p-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(s)}
                          title="Editar Datos del Proveedor"
                          className="p-1.5 text-slate-600 hover:text-amber-600 dark:text-slate-300 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
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
          {filteredSuppliers.map((s) => (
            <div
              key={s.id}
              className={`bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs flex flex-col justify-between ${
                s.debtBalance > 0 ? 'border-l-4 border-l-rose-500' : 'border-l-4 border-l-emerald-500'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {s.category}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">
                      {s.name}
                    </h3>
                    <div className="font-mono text-xs text-slate-500 mt-0.5">
                      CUIT: {s.cuit}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-xl font-black text-xs ${
                        s.debtBalance > 0
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                          : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {s.debtBalance > 0 ? formatCurrency(s.debtBalance) : 'Al Día'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {s.debtBalance > 0 ? 'Saldo a pagar' : 'Sin deuda'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Contacto</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{s.contactPerson}</span>
                    <span className="text-[11px] text-slate-400 block">{s.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Condición Pago</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{s.paymentTerms}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDetailSupplier(s)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Ficha</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(s)}
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ALTA Y EDICIÓN DE PROVEEDOR                        */}
      {/* ========================================================= */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-scale-in">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingSupplier ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Ficha comercial para facturas y compras de mercadería
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Razón Social */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Razón Social / Nombre Comercial *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Distribuidora Alimentos Central S.A."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 min-h-[44px]"
                />
              </div>

              {/* CUIT & Rubro */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    CUIT *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cuit}
                    onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
                    placeholder="30-71234567-8"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Rubro / Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm min-h-[44px] cursor-pointer"
                  >
                    <option value="Almacén General">Almacén General</option>
                    <option value="Harinas y Cereales">Harinas y Cereales</option>
                    <option value="Infusiones y Café">Infusiones y Café</option>
                    <option value="Quesos y Lácteos">Quesos y Lácteos</option>
                    <option value="Bebidas y Gaseosas">Bebidas y Gaseosas</option>
                    <option value="Snacks y Golosinas">Snacks y Golosinas</option>
                    <option value="Limpieza y Bazar">Limpieza y Bazar</option>
                  </select>
                </div>
              </div>

              {/* Contact Person & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Contacto Comercial *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Ej: Alejandro Morales"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Teléfono Comercial *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+54 11 4344-9000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm min-h-[44px]"
                  />
                </div>
              </div>

              {/* Email & Payment Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="pedidos@proveedor.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Condiciones de Pago
                  </label>
                  <select
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm min-h-[44px] cursor-pointer"
                  >
                    <option value="Contado contra entrega">Contado contra entrega</option>
                    <option value="15 días fecha factura">15 días fecha factura</option>
                    <option value="21 días">21 días</option>
                    <option value="30 días fecha factura">30 días fecha factura</option>
                    <option value="60 días (Cheque)">60 días (Cheque)</option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Dirección / Depósito
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ej: Av. Belgrano 1240, CABA"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm min-h-[44px]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Observaciones Comerciales
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Días de entrega, requisitos de descarga, bonificaciones especiales..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md cursor-pointer min-h-[44px] flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingSupplier ? 'Guardar Cambios' : 'Registrar Proveedor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: FICHA TÉCNICA Y DETALLES DEL PROVEEDOR             */}
      {/* ========================================================= */}
      {detailSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-scale-in">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Ficha Comercial del Proveedor
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Historial de compras y términos comerciales
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailSupplier(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {detailSupplier.category}
                    </span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                      {detailSupplier.name}
                    </h4>
                    <div className="font-mono text-xs text-slate-500 mt-0.5">
                      CUIT: {detailSupplier.cuit}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg font-black text-xs ${
                        detailSupplier.debtBalance > 0
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                          : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {detailSupplier.debtBalance > 0 ? formatCurrency(detailSupplier.debtBalance) : 'Al Día'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Saldo en cuenta
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Contacto</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{detailSupplier.contactPerson}</span>
                    <span className="text-slate-500 block mt-0.5">{detailSupplier.phone}</span>
                    <span className="text-slate-500 block">{detailSupplier.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Condición Comercial</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{detailSupplier.paymentTerms}</span>
                    <span className="text-slate-500 block mt-0.5">
                      {(detailSupplier as any).address || 'Av. Corrientes 3420, CABA'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Associated Purchases in Demo */}
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  Órdenes de Compra Asociadas
                </span>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {DEMO_PURCHASES.filter((p) => p.supplierName === detailSupplier.name).length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs">
                      No hay compras registradas recientemente con este proveedor.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {DEMO_PURCHASES.filter((p) => p.supplierName === detailSupplier.name).map((p) => (
                        <div key={p.id} className="p-3 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {p.orderNumber}
                            </span>
                            <span className="text-slate-400 block text-[11px]">{p.date} • {p.itemsCount} bultos</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-slate-900 dark:text-white">
                              {formatCurrency(p.total)}
                            </span>
                            <span
                              className={`block text-[10px] font-bold ${
                                p.status === 'Recibido' ? 'text-emerald-600' : 'text-amber-600'
                              }`}
                            >
                              {p.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setDetailSupplier(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold cursor-pointer min-h-[44px]"
                >
                  Cerrar Ficha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
