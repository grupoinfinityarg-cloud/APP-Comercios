import React, { useState, useMemo, useRef } from 'react';
import {
  Building2,
  Store,
  Sliders,
  Receipt,
  Save,
  RotateCcw,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Globe,
  Upload,
  Image as ImageIcon,
  Printer,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  CreditCard,
  ChevronRight,
  Info,
  Clock,
  Coins,
  FileText,
  SlidersHorizontal,
  ExternalLink,
  Laptop,
  Smartphone,
  Layers,
  Sparkles,
} from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { Store as StoreType, Employee, BusinessConfig, PosTerminal } from '../../types';
import { DEFAULT_BUSINESS_CONFIG, DEMO_STORES } from '../../data/demoData';

interface SettingsScreenProps {
  stores: StoreType[];
  activeStore: StoreType;
  onSelectStore: (store: StoreType) => void;
  onUpdateStores: (stores: StoreType[]) => void;
  currentUser: Employee;
  employees: Employee[];
  businessConfig: BusinessConfig;
  onUpdateBusinessConfig: (config: BusinessConfig) => void;
}

type SettingsTab = 'business' | 'stores' | 'preferences' | 'receipts';

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  stores,
  activeStore,
  onSelectStore,
  onUpdateStores,
  currentUser,
  employees,
  businessConfig,
  onUpdateBusinessConfig,
}) => {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<SettingsTab>('business');

  // Role permissions: Only 'Administrador' and 'Encargado' can edit critical settings
  const canEditSettings = currentUser.role === 'Administrador' || currentUser.role === 'Encargado';

  // Form state for Business Config
  const [formData, setFormData] = useState<BusinessConfig>(businessConfig);

  // Unsaved changes tracking
  const hasUnsavedConfigChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(businessConfig);
  }, [formData, businessConfig]);

  // Validation state
  const [cuitTouched, setCuitTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Modals state
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeactivateActiveStoreModal, setShowDeactivateActiveStoreModal] = useState<StoreType | null>(null);
  const [showNewStoreModal, setShowNewStoreModal] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreType | null>(null);
  const [selectedStoreForTerminals, setSelectedStoreForTerminals] = useState<string>(activeStore.id);
  const [showNewTerminalModal, setShowNewTerminalModal] = useState(false);

  // New Store Form State
  const [newStoreForm, setNewStoreForm] = useState({
    name: '',
    code: '',
    address: '',
    city: 'Buenos Aires, CABA',
    phone: '',
    manager: employees[0]?.name || 'Martín Gómez',
    active: true,
  });
  const [newStoreError, setNewStoreError] = useState<string | null>(null);

  // Edit Store Form State
  const [editStoreForm, setEditStoreForm] = useState<{
    id: string;
    name: string;
    code: string;
    address: string;
    city: string;
    phone: string;
    manager: string;
    active: boolean;
  } | null>(null);

  // New Terminal Form State
  const [newTerminalForm, setNewTerminalForm] = useState<{
    name: string;
    code: string;
    type: PosTerminal['type'];
    notes: string;
  }>({
    name: '',
    code: '',
    type: 'caja_mostrador',
    notes: '',
  });
  const [newTerminalError, setNewTerminalError] = useState<string | null>(null);

  // File input ref for logo upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CUIT Validation helper
  const cuitClean = (formData.taxId || '').replace(/\D/g, '');
  const isCuitValid = cuitClean.length === 11;
  const isCuitFormatStandard = /^\d{2}-\d{8}-\d$/.test(formData.taxId || '');

  // Email Validation helper
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email || '');

  // Handle Form Input changes
  const handleConfigChange = <K extends keyof BusinessConfig>(key: K, value: BusinessConfig[K]) => {
    if (!canEditSettings) return;
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Format CUIT input as user types
  const handleCuitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEditSettings) return;
    let val = e.target.value.replace(/[^\d-]/g, '');
    const rawNumbers = val.replace(/\D/g, '');
    if (rawNumbers.length > 11) return;

    if (!val.includes('-') && rawNumbers.length >= 2) {
      if (rawNumbers.length <= 10) {
        val = `${rawNumbers.slice(0, 2)}-${rawNumbers.slice(2)}`;
      } else {
        val = `${rawNumbers.slice(0, 2)}-${rawNumbers.slice(2, 10)}-${rawNumbers.slice(10, 11)}`;
      }
    }
    handleConfigChange('taxId', val);
  };

  // Logo file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEditSettings) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('El archivo supera el tamaño máximo recomendado (2MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        handleConfigChange('logoUrl', result);
        showToast('Logotipo cargado correctamente en la vista previa.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Config handler
  const handleSaveConfig = () => {
    if (!canEditSettings) return;
    if (!formData.tradeName.trim()) {
      showToast('El nombre comercial es obligatorio.');
      return;
    }
    if (!isEmailValid) {
      showToast('Por favor ingrese un correo electrónico válido.');
      return;
    }
    onUpdateBusinessConfig(formData);
    showToast('¡Configuración del comercio guardada con éxito!');
  };

  // Reset to factory defaults
  const handleConfirmReset = () => {
    if (!canEditSettings) return;
    setFormData(DEFAULT_BUSINESS_CONFIG);
    onUpdateBusinessConfig(DEFAULT_BUSINESS_CONFIG);
    onUpdateStores(DEMO_STORES);
    setShowResetModal(false);
    showToast('Se restablecieron los valores predeterminados de fábrica.');
  };

  // Store Management handlers
  const handleToggleStoreStatus = (targetStore: StoreType) => {
    if (!canEditSettings) return;
    // If attempting to deactivate the active store, open safety modal
    if (targetStore.id === activeStore.id && targetStore.active) {
      setShowDeactivateActiveStoreModal(targetStore);
      return;
    }

    const updated = stores.map((s) => (s.id === targetStore.id ? { ...s, active: !s.active } : s));
    onUpdateStores(updated);
    showToast(`Sucursal "${targetStore.name}" ${targetStore.active ? 'desactivada' : 'activada'}.`);
  };

  const handleConfirmDeactivateActiveStore = () => {
    if (!showDeactivateActiveStoreModal) return;
    const remainingActive = stores.find((s) => s.id !== showDeactivateActiveStoreModal.id && s.active);
    if (!remainingActive) {
      showToast('Debe existir al menos una sucursal activa en el sistema.');
      setShowDeactivateActiveStoreModal(null);
      return;
    }
    // Switch to another active store first
    onSelectStore(remainingActive);
    const updated = stores.map((s) =>
      s.id === showDeactivateActiveStoreModal.id ? { ...s, active: false } : s
    );
    onUpdateStores(updated);
    setShowDeactivateActiveStoreModal(null);
    showToast(
      `Sucursal desactivada. La terminal activa se cambió a "${remainingActive.name}".`
    );
  };

  // Create New Store
  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditSettings) return;
    setNewStoreError(null);

    const trimmedCode = newStoreForm.code.trim().toUpperCase();
    if (!trimmedCode) {
      setNewStoreError('El código de la sucursal es obligatorio (ej. SUC-04).');
      return;
    }
    if (!newStoreForm.name.trim()) {
      setNewStoreError('El nombre de la sucursal es obligatorio.');
      return;
    }
    if (stores.some((s) => s.code.toUpperCase() === trimmedCode)) {
      setNewStoreError(`Ya existe una sucursal con el código "${trimmedCode}". Ingrese uno diferente.`);
      return;
    }

    const newId = `store-${Date.now()}`;
    const newStore: StoreType = {
      id: newId,
      name: newStoreForm.name.trim(),
      code: trimmedCode,
      address: newStoreForm.address.trim() || 'Dirección comercial a definir',
      city: newStoreForm.city.trim() || 'Buenos Aires',
      phone: newStoreForm.phone.trim() || '+54 11 0000-0000',
      manager: newStoreForm.manager,
      active: newStoreForm.active,
      totalProducts: 0,
      todaySales: 0,
      terminals: [
        {
          id: `term-${newId}-1`,
          name: 'Caja 1 - Mostrador Principal',
          code: 'POS-01',
          type: 'caja_mostrador',
          active: true,
          notes: 'Terminal inicial predeterminada',
        },
      ],
    };

    const updated = [...stores, newStore];
    onUpdateStores(updated);
    setShowNewStoreModal(false);
    setNewStoreForm({
      name: '',
      code: '',
      address: '',
      city: 'Buenos Aires, CABA',
      phone: '',
      manager: employees[0]?.name || 'Martín Gómez',
      active: true,
    });
    showToast(`Sucursal "${newStore.name}" creada exitosamente.`);
  };

  // Edit Store Save
  const handleSaveEditedStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditSettings || !editStoreForm) return;

    const trimmedCode = editStoreForm.code.trim().toUpperCase();
    if (!trimmedCode || !editStoreForm.name.trim()) {
      showToast('Nombre y código de sucursal son obligatorios.');
      return;
    }
    if (stores.some((s) => s.id !== editStoreForm.id && s.code.toUpperCase() === trimmedCode)) {
      showToast(`El código "${trimmedCode}" ya pertenece a otra sucursal.`);
      return;
    }

    const updated = stores.map((s) => {
      if (s.id === editStoreForm.id) {
        return {
          ...s,
          name: editStoreForm.name.trim(),
          code: trimmedCode,
          address: editStoreForm.address.trim(),
          city: editStoreForm.city.trim(),
          phone: editStoreForm.phone.trim(),
          manager: editStoreForm.manager,
          active: editStoreForm.active,
        };
      }
      return s;
    });

    onUpdateStores(updated);
    setEditStoreForm(null);
    showToast('Datos de la sucursal actualizados.');
  };

  // Add POS Terminal to Store
  const handleAddTerminal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditSettings) return;
    setNewTerminalError(null);

    const storeTarget = stores.find((s) => s.id === selectedStoreForTerminals);
    if (!storeTarget) return;

    const trimmedCode = newTerminalForm.code.trim().toUpperCase();
    if (!trimmedCode || !newTerminalForm.name.trim()) {
      setNewTerminalError('Nombre y código de terminal son obligatorios.');
      return;
    }

    const currentTerminals = storeTarget.terminals || [];
    if (currentTerminals.some((t) => t.code.toUpperCase() === trimmedCode)) {
      setNewTerminalError(`Ya existe una caja con el código "${trimmedCode}" en esta sucursal.`);
      return;
    }

    const newTerm: PosTerminal = {
      id: `term-${Date.now()}`,
      name: newTerminalForm.name.trim(),
      code: trimmedCode,
      type: newTerminalForm.type,
      active: true,
      notes: newTerminalForm.notes.trim() || undefined,
    };

    const updated = stores.map((s) => {
      if (s.id === storeTarget.id) {
        return {
          ...s,
          terminals: [...currentTerminals, newTerm],
        };
      }
      return s;
    });

    onUpdateStores(updated);
    setShowNewTerminalModal(false);
    setNewTerminalForm({
      name: '',
      code: '',
      type: 'caja_mostrador',
      notes: '',
    });
    showToast(`Punto de venta "${newTerm.name}" agregado a ${storeTarget.name}.`);
  };

  // Toggle terminal status
  const handleToggleTerminal = (storeId: string, terminalId: string) => {
    if (!canEditSettings) return;
    const updated = stores.map((s) => {
      if (s.id === storeId && s.terminals) {
        return {
          ...s,
          terminals: s.terminals.map((t) => (t.id === terminalId ? { ...t, active: !t.active } : t)),
        };
      }
      return s;
    });
    onUpdateStores(updated);
  };

  // Print Test Ticket Function
  const handlePrintTestTicket = () => {
    window.print();
  };

  // Preset Logos
  const PRESET_LOGOS = [
    {
      id: 'botanica',
      name: 'Verde Botánica',
      svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="%23196344" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12A10 10 0 0 1 12 2z"/><path d="M7 12a5 5 0 0 1 10 0v5H7v-5z"/><path d="M12 7v5"/></svg>`,
    },
    {
      id: 'comercial',
      name: 'Azul Comercio',
      svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="%231E40AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>`,
    },
    {
      id: 'gourmet',
      name: 'Ámbar Gourmet',
      svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="%23C85A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m10 15 5-3-5-3v6z"/><path d="M12 6v2"/><path d="M12 16v2"/></svg>`,
    },
  ];

  const targetStoreForTerminals = stores.find((s) => s.id === selectedStoreForTerminals) || stores[0];

  return (
    <div className="space-y-6 pb-20">
      <DemoNotice
        title="Módulo 12: Configuración del Comercio & Puntos de Venta"
        description="Gestión integral de la identidad fiscal, múltiples sucursales con terminales POS, políticas de venta y personalización e impresión real de comprobantes de venta."
      />

      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Configuración del Comercio
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#196344]/10 text-[#196344] dark:bg-[#196344]/30 dark:text-emerald-300 border border-[#196344]/20">
              <Store className="w-3.5 h-3.5" />
              <span>{formData.tradeName || 'COMERCIOS 360'}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Parámetros fiscales, sucursales físicas y cajas, políticas de venta y comprobantes térmicos
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {canEditSettings && (
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Restablecer valores de fábrica"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
          )}

          {canEditSettings && (
            <button
              type="button"
              onClick={handleSaveConfig}
              disabled={!hasUnsavedConfigChanges}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer ${
                hasUnsavedConfigChanges
                  ? 'bg-[#196344] hover:bg-[#145237] text-white shadow-emerald-900/20 ring-2 ring-emerald-500/30'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          )}
        </div>
      </div>

      {/* Role Notice Banner (RBAC Read-only warning for Cajero/Vendedor) */}
      {!canEditSettings && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              Modo de Solo Lectura — Acceso restringido para el rol de {currentUser.role}
            </p>
            <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
              Tu perfil actual te permite consultar los parámetros comerciales, sucursales y formato de comprobantes, pero no modificar datos fiscales ni políticas del sistema. Si necesitas actualizar estos datos, contacta a un <strong>Administrador</strong> o <strong>Encargado</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Unsaved Changes Banner */}
      {hasUnsavedConfigChanges && canEditSettings && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">
              Hay modificaciones pendientes de guardar en esta sección.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFormData(businessConfig)}
              className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:underline font-medium text-xs cursor-pointer"
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={handleSaveConfig}
              className="px-3 py-1 bg-[#196344] hover:bg-[#145237] text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs"
            >
              Guardar ahora
            </button>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('business')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'business'
              ? 'bg-white dark:bg-slate-900 text-[#196344] dark:text-emerald-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Datos del Comercio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stores')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'stores'
              ? 'bg-white dark:bg-slate-900 text-[#196344] dark:text-emerald-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Sucursales & Cajas ({stores.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'preferences'
              ? 'bg-white dark:bg-slate-900 text-[#196344] dark:text-emerald-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Preferencias Comerciales</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('receipts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'receipts'
              ? 'bg-white dark:bg-slate-900 text-[#196344] dark:text-emerald-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Personalización de Comprobantes</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: DATOS DEL COMERCIO                                       */}
      {/* ============================================================== */}
      {activeTab === 'business' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Form (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-5 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <Building2 className="w-4 h-4 text-[#196344]" />
                  <span>Identificación Legal y Fiscal del Negocio</span>
                </div>
                <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                  * Campos obligatorios
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre Comercial */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre Comercial *
                  </label>
                  <input
                    type="text"
                    disabled={!canEditSettings}
                    value={formData.tradeName}
                    onChange={(e) => handleConfigChange('tradeName', e.target.value)}
                    placeholder="Ej. COMERCIOS 360"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#196344]/30"
                  />
                  {!formData.tradeName.trim() && (
                    <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" />
                      El nombre comercial es obligatorio.
                    </p>
                  )}
                </div>

                {/* Razón Social */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Razón Social *
                  </label>
                  <input
                    type="text"
                    disabled={!canEditSettings}
                    value={formData.legalName}
                    onChange={(e) => handleConfigChange('legalName', e.target.value)}
                    placeholder="Ej. COMERCIOS 360 S.R.L."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#196344]/30"
                  />
                  {!formData.legalName.trim() && (
                    <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" />
                      La razón social es requerida para comprobantes.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CUIT */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    CUIT / Identificación Tributaria *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    disabled={!canEditSettings}
                    value={formData.taxId}
                    onChange={handleCuitChange}
                    onBlur={() => setCuitTouched(true)}
                    placeholder="30-71889922-3"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-medium focus:ring-2 focus:ring-[#196344]/30"
                  />
                  {cuitTouched && !isCuitValid && (
                    <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      Formato sugerido: XX-XXXXXXXX-X (11 dígitos numéricos).
                    </p>
                  )}
                  {cuitTouched && isCuitValid && (
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      Estructura numérica de 11 dígitos válida para el comercio.
                    </p>
                  )}
                </div>

                {/* Correo Electrónico */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Correo Electrónico de Contacto *
                  </label>
                  <input
                    type="email"
                    inputMode="email"
                    disabled={!canEditSettings}
                    value={formData.email}
                    onChange={(e) => handleConfigChange('email', e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="contacto@comercios360.demo"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#196344]/30"
                  />
                  {emailTouched && !isEmailValid && (
                    <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" />
                      Ingrese un formato de correo electrónico válido.
                    </p>
                  )}
                </div>
              </div>

              {/* Domicilio Comercial */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#196344]" />
                  <span>Domicilio Legal de Casa Central</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Calle y Número
                    </label>
                    <input
                      type="text"
                      disabled={!canEditSettings}
                      value={formData.address}
                      onChange={(e) => handleConfigChange('address', e.target.value)}
                      placeholder="Av. Corrientes 1420"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      disabled={!canEditSettings}
                      value={formData.postalCode}
                      onChange={(e) => handleConfigChange('postalCode', e.target.value)}
                      placeholder="C1042AAZ"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Localidad / Ciudad
                    </label>
                    <input
                      type="text"
                      disabled={!canEditSettings}
                      value={formData.city}
                      onChange={(e) => handleConfigChange('city', e.target.value)}
                      placeholder="Buenos Aires"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Provincia / Estado
                    </label>
                    <input
                      type="text"
                      disabled={!canEditSettings}
                      value={formData.province}
                      onChange={(e) => handleConfigChange('province', e.target.value)}
                      placeholder="CABA"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Teléfono Central
                    </label>
                    <input
                      type="text"
                      inputMode="tel"
                      disabled={!canEditSettings}
                      value={formData.phone}
                      onChange={(e) => handleConfigChange('phone', e.target.value)}
                      placeholder="+54 11 4821-9988"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Sitio Web o Redes */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sitio Web o Red Social Oficial (Opcional)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    disabled={!canEditSettings}
                    value={formData.website || ''}
                    onChange={(e) => handleConfigChange('website', e.target.value)}
                    placeholder="https://comercios360.demo o @comercios360.ar"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Logo & Preview Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <ImageIcon className="w-4 h-4 text-[#196344]" />
                  <span>Logotipo del Comercio</span>
                </div>
                {formData.logoUrl && canEditSettings && (
                  <button
                    type="button"
                    onClick={() => handleConfigChange('logoUrl', '')}
                    className="text-[11px] text-red-600 dark:text-red-400 hover:underline font-semibold cursor-pointer"
                  >
                    Quitar logo
                  </button>
                )}
              </div>

              {/* Logo Preview Area */}
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/60 transition-all text-center">
                {formData.logoUrl ? (
                  <div className="space-y-3 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 p-2 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                      <img
                        src={formData.logoUrl}
                        alt="Logotipo del comercio"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">
                        {formData.tradeName}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Vista previa activa en tickets y comprobantes
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <Store className="w-7 h-7 text-[#196344]" />
                    </div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      Sin logotipo personalizado
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      PNG o JPG recomendado (máx. 2MB)
                    </p>
                  </div>
                )}

                {canEditSettings && (
                  <div className="mt-4 w-full">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-3 bg-[#196344]/10 hover:bg-[#196344]/20 text-[#196344] dark:bg-[#196344]/25 dark:text-emerald-300 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{formData.logoUrl ? 'Cambiar Imagen' : 'Subir Imagen desde Dispositivo'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Presets if no image available */}
              {canEditSettings && (
                <div className="pt-2">
                  <span className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    O elegir un logotipo predeterminado:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_LOGOS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleConfigChange('logoUrl', preset.svg)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#196344] bg-white dark:bg-slate-900 text-center flex flex-col items-center gap-1 cursor-pointer transition-all"
                      >
                        <img src={preset.svg} alt={preset.name} className="w-6 h-6" />
                        <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Business Summary Card */}
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Resumen Fiscal Rápido
              </span>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <p><strong>Comercio:</strong> {formData.tradeName || 'Sin definir'}</p>
                <p><strong>Razón Social:</strong> {formData.legalName || 'Sin definir'}</p>
                <p><strong>CUIT:</strong> {formData.taxId || 'Sin definir'}</p>
                <p><strong>Domicilio:</strong> {formData.address}, {formData.city}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: SUCURSALES Y PUNTOS DE VENTA                             */}
      {/* ============================================================== */}
      {activeTab === 'stores' && (
        <div className="space-y-6">
          {/* Header of stores tab */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Sucursales Comerciales & Cajas Registradoras
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Puntos de atención al público, depósitos logísticos y terminales de cobro
              </p>
            </div>

            {canEditSettings && (
              <button
                type="button"
                onClick={() => setShowNewStoreModal(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#196344] hover:bg-[#145237] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Sucursal</span>
              </button>
            )}
          </div>

          {/* Active Store Indicator Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#196344] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                {activeStore.code}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Sucursal Activa en Esta Terminal:
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#196344] text-white">
                    EN USO
                  </span>
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  {activeStore.name}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {activeStore.address} • Encargado: {activeStore.manager}
                </p>
              </div>
            </div>

            <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              Ventas y arqueos de hoy se computan en esta sucursal
            </span>
          </div>

          {/* Stores Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store) => {
              const isCurrent = store.id === activeStore.id;
              const terminals = store.terminals || [];
              const activeTerminalsCount = terminals.filter((t) => t.active).length;

              return (
                <div
                  key={store.id}
                  className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-white dark:bg-slate-800 border-[#196344] shadow-md ring-2 ring-[#196344]/20'
                      : store.active
                      ? 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/60'
                      : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Card Top: Code, Name, Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono">
                          {store.code}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 text-[10px] font-black rounded-lg bg-[#196344] text-white">
                            ACTIVA
                          </span>
                        )}
                      </div>

                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          store.active
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {store.active ? 'Habilitada' : 'Inactiva'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-base">
                        {store.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-[#196344]" />
                        <span>{store.address}, {store.city}</span>
                      </p>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{store.phone}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-slate-400" />
                        <span>Encargado: <strong className="text-slate-800 dark:text-slate-200">{store.manager}</strong></span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-slate-400" />
                        <span>Cajas registradoras: <strong>{activeTerminalsCount} de {terminals.length} operativas</strong></span>
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {!isCurrent && store.active && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectStore(store);
                            showToast(`Sucursal activa cambiada a "${store.name}".`);
                          }}
                          className="px-2.5 py-1.5 bg-[#196344]/10 hover:bg-[#196344]/20 text-[#196344] dark:bg-[#196344]/30 dark:text-emerald-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Usar en esta sesión
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedStoreForTerminals(store.id)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Laptop className="w-3 h-3" />
                        <span>Ver Cajas</span>
                      </button>
                    </div>

                    {canEditSettings && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setEditStoreForm({
                              id: store.id,
                              name: store.name,
                              code: store.code,
                              address: store.address,
                              city: store.city,
                              phone: store.phone,
                              manager: store.manager,
                              active: store.active,
                            })
                          }
                          className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                          title="Editar sucursal"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStoreStatus(store)}
                          className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                            store.active
                              ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
                              : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          title={store.active ? 'Desactivar sucursal' : 'Activar sucursal'}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* POS Terminals Section for the selected store */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#196344]" />
                <h3 className="font-black text-slate-900 dark:text-white text-sm">
                  Puntos de Venta (POS) en {targetStoreForTerminals.name} ({targetStoreForTerminals.code})
                </h3>
              </div>

              {canEditSettings && (
                <button
                  type="button"
                  onClick={() => setShowNewTerminalModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Caja / Terminal</span>
                </button>
              )}
            </div>

            {(!targetStoreForTerminals.terminals || targetStoreForTerminals.terminals.length === 0) ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                Esta sucursal aún no tiene cajas ni terminales registradas.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {targetStoreForTerminals.terminals.map((term) => (
                  <div
                    key={term.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {term.code}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {term.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                        {term.type.replace('_', ' ')} {term.notes ? `• ${term.notes}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          term.active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                        title={term.active ? 'Caja activa' : 'Caja inactiva'}
                      />
                      {canEditSettings && (
                        <button
                          type="button"
                          onClick={() => handleToggleTerminal(targetStoreForTerminals.id, term.id)}
                          className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-white px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                        >
                          {term.active ? 'Pausar' : 'Activar'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: PREFERENCIAS COMERCIALES                                 */}
      {/* ============================================================== */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Moneda & Régimen Fiscal */}
              <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4 text-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white">
                  <Coins className="w-4 h-4 text-[#196344]" />
                  <span>Moneda Principal & Régimen Fiscal</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Moneda Principal del Sistema
                    </label>
                    <select
                      disabled={!canEditSettings}
                      value={formData.currencySymbol}
                      onChange={(e) => {
                        const val = e.target.value;
                        const code = val.includes('ARS') ? 'ARS' : val.includes('USD') ? 'USD' : val.includes('EUR') ? 'EUR' : val.includes('CLP') ? 'CLP' : 'UYU';
                        handleConfigChange('currencySymbol', val);
                        handleConfigChange('currencyCode', code);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                    >
                      <option value="ARS ($)">Peso Argentino ($ ARS)</option>
                      <option value="USD ($)">Dólar Estadounidense ($ USD)</option>
                      <option value="EUR (€)">Euro (€ EUR)</option>
                      <option value="CLP ($)">Peso Chileno ($ CLP)</option>
                      <option value="UYU ($)">Peso Uruguayo ($ UYU)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Régimen Tributario del Negocio
                    </label>
                    <select
                      disabled={!canEditSettings}
                      value={formData.taxRegime}
                      onChange={(e) => handleConfigChange('taxRegime', e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                    >
                      <option value="responsable_inscripto">IVA Responsable Inscripto</option>
                      <option value="monotributo">Régimen Simplificado (Monotributo)</option>
                      <option value="consumidor_final">Consumidor Final / Sin discriminación</option>
                      <option value="exento">IVA Exento</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Alícuota de IVA Predeterminada
                    </label>
                    <select
                      disabled={!canEditSettings}
                      value={formData.defaultVatRate}
                      onChange={(e) => handleConfigChange('defaultVatRate', Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                    >
                      <option value={21}>21% - Tasa General Estándar</option>
                      <option value={10.5}>10.5% - Tasa Reducida (Bienes de Capital)</option>
                      <option value={27}>27% - Tasa Diferencial Servicios</option>
                      <option value={0}>0% - Exento / No alcanzado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Decimales en Precios
                    </label>
                    <select
                      disabled={!canEditSettings}
                      value={formData.decimalPlaces}
                      onChange={(e) => handleConfigChange('decimalPlaces', Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                    >
                      <option value={0}>Sin decimales ($ 1.500)</option>
                      <option value={2}>Con 2 decimales ($ 1.500,00)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Política de Stock Negativo */}
              <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4 text-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white">
                  <SlidersHorizontal className="w-4 h-4 text-[#196344]" />
                  <span>Control de Stock Negativo en Punto de Venta</span>
                </div>

                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Define el comportamiento de la caja registradora cuando un producto no cuenta con unidades disponibles en el inventario de la sucursal:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'bloquear',
                      title: 'Bloquear venta',
                      desc: 'Impide añadir el producto si no hay stock físico disponible.',
                      badge: 'Control estricto',
                    },
                    {
                      id: 'advertir',
                      title: 'Advertir operador',
                      desc: 'Avisa al cajero pero permite confirmar la venta.',
                      badge: 'Recomendado',
                    },
                    {
                      id: 'permitir',
                      title: 'Permitir libremente',
                      desc: 'Sin interrupciones; el stock pasará a saldo negativo.',
                      badge: 'Operación rápida',
                    },
                  ].map((policy) => {
                    const isSelected = formData.negativeStockPolicy === policy.id;
                    return (
                      <button
                        key={policy.id}
                        type="button"
                        disabled={!canEditSettings}
                        onClick={() => handleConfigChange('negativeStockPolicy', policy.id as any)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#196344]/5 border-[#196344] ring-2 ring-[#196344]/20 dark:bg-[#196344]/15'
                            : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/70 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {policy.title}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                isSelected
                                  ? 'bg-[#196344] text-white'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {policy.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                            {policy.desc}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-[#196344] dark:text-emerald-400 mt-2">
                            <Check className="w-3.5 h-3.5" />
                            <span>Seleccionado</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Horarios & Mensajes */}
            <div className="lg:col-span-5 space-y-6">
              {/* Horarios y Días de Apertura */}
              <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4 text-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white">
                  <Clock className="w-4 h-4 text-[#196344]" />
                  <span>Días y Horarios de Atención</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Días de Operación Habituales
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => {
                      const isSelected = formData.openingDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          disabled={!canEditSettings}
                          onClick={() => {
                            if (!canEditSettings) return;
                            const current = [...formData.openingDays];
                            const updated = isSelected ? current.filter((d) => d !== day) : [...current, day];
                            handleConfigChange('openingDays', updated);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#196344] text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Horario de Atención Comercial
                  </label>
                  <input
                    type="text"
                    disabled={!canEditSettings}
                    value={formData.businessHours}
                    onChange={(e) => handleConfigChange('businessHours', e.target.value)}
                    placeholder="Ej. Lunes a Sábados de 08:30 a 20:30 hs"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mensaje de Agradecimiento Predeterminado
                  </label>
                  <textarea
                    rows={3}
                    disabled={!canEditSettings}
                    value={formData.greetingMessage}
                    onChange={(e) => handleConfigChange('greetingMessage', e.target.value)}
                    placeholder="¡Muchas gracias por su compra! Vuelva pronto."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: PERSONALIZACIÓN DE COMPROBANTES                          */}
      {/* ============================================================== */}
      {activeTab === 'receipts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Form (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <Printer className="w-4 h-4 text-[#196344]" />
                  <span>Formato y Parámetros del Ticket</span>
                </div>
                <button
                  type="button"
                  onClick={handlePrintTestTicket}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#196344] hover:bg-[#145237] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Comprobante de Prueba</span>
                </button>
              </div>

              {/* Formato de papel */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Ancho de Papel / Dispositivo de Impresión
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '80mm', label: 'Térmico 80 mm', desc: 'Estándar mostrador' },
                    { id: '58mm', label: 'Térmico 58 mm', desc: 'Portátil / Mini' },
                    { id: 'a4', label: 'Hoja A4 / Carta', desc: 'Factura completa' },
                  ].map((fmt) => {
                    const isSelected = formData.receiptFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        disabled={!canEditSettings}
                        onClick={() => handleConfigChange('receiptFormat', fmt.id as any)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#196344]/10 border-[#196344] ring-2 ring-[#196344]/20 text-[#196344] dark:text-emerald-300 font-bold'
                            : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <p className="text-xs">{fmt.label}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {fmt.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles de Contenido del Ticket */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                <span className="block font-bold text-slate-800 dark:text-slate-200">
                  Elementos a Incluir en el Comprobante
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!canEditSettings}
                      checked={formData.showLogoOnReceipt}
                      onChange={(e) => handleConfigChange('showLogoOnReceipt', e.target.checked)}
                      className="w-4 h-4 text-[#196344] rounded border-slate-300 focus:ring-[#196344]"
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Incluir logotipo
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!canEditSettings}
                      checked={formData.showCashierName}
                      onChange={(e) => handleConfigChange('showCashierName', e.target.checked)}
                      className="w-4 h-4 text-[#196344] rounded border-slate-300 focus:ring-[#196344]"
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Mostrar nombre del cajero
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!canEditSettings}
                      checked={formData.showCustomerData}
                      onChange={(e) => handleConfigChange('showCustomerData', e.target.checked)}
                      className="w-4 h-4 text-[#196344] rounded border-slate-300 focus:ring-[#196344]"
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Mostrar datos del cliente
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!canEditSettings}
                      checked={formData.showQrCode}
                      onChange={(e) => handleConfigChange('showQrCode', e.target.checked)}
                      className="w-4 h-4 text-[#196344] rounded border-slate-300 focus:ring-[#196344]"
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Código QR al pie
                    </span>
                  </label>
                </div>
              </div>

              {/* Textos Personalizados de Encabezado y Pie */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Leyenda Superior del Encabezado
                  </label>
                  <input
                    type="text"
                    disabled={!canEditSettings}
                    value={formData.headerCustomText}
                    onChange={(e) => handleConfigChange('headerCustomText', e.target.value)}
                    placeholder="Comprobante no fiscal para control interno"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Leyenda de Política de Cambios & Garantía
                  </label>
                  <input
                    type="text"
                    disabled={!canEditSettings}
                    value={formData.returnPolicyText}
                    onChange={(e) => handleConfigChange('returnPolicyText', e.target.value)}
                    placeholder="Cambios válidos dentro de los 30 días con este ticket"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mensaje de Despedida al Pie
                  </label>
                  <textarea
                    rows={2}
                    disabled={!canEditSettings}
                    value={formData.footerCustomText}
                    onChange={(e) => handleConfigChange('footerCustomText', e.target.value)}
                    placeholder="¡Muchas gracias por su compra! Vuelva pronto."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Ticket Preview (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-[#196344]" />
                <span>Vista Previa en Tiempo Real del Comprobante</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Formato: {formData.receiptFormat}
              </span>
            </div>

            {/* Simulated Paper Ticket Container */}
            <div className="flex justify-center p-4 bg-slate-200/80 dark:bg-slate-900/80 rounded-2xl border border-slate-300 dark:border-slate-800 overflow-x-auto">
              <div
                id="printable-receipt-area"
                className={`bg-white text-slate-900 shadow-xl p-5 font-mono text-xs transition-all relative border border-slate-300 ${
                  formData.receiptFormat === '58mm'
                    ? 'w-[280px] text-[10px]'
                    : formData.receiptFormat === 'a4'
                    ? 'w-[420px] text-xs'
                    : 'w-[340px] text-[11px]'
                }`}
                style={{
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                }}
              >
                {/* Header with Logo */}
                <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-400">
                  {formData.showLogoOnReceipt && formData.logoUrl && (
                    <div className="flex justify-center mb-1">
                      <img
                        src={formData.logoUrl}
                        alt="Logo"
                        className="max-h-12 max-w-[120px] object-contain"
                      />
                    </div>
                  )}

                  <h2 className="font-black text-sm tracking-tight uppercase">
                    {formData.tradeName || 'COMERCIOS 360'}
                  </h2>
                  <p className="text-[10px] font-semibold text-slate-700">
                    {formData.legalName}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    CUIT: {formData.taxId}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    {activeStore.name} ({activeStore.code})
                  </p>
                  <p className="text-[10px] text-slate-600">
                    {activeStore.address}, {activeStore.city}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    Tel: {activeStore.phone}
                  </p>
                  <p className="text-[10px] text-slate-500 pt-0.5 italic">
                    {formData.headerCustomText}
                  </p>
                </div>

                {/* Ticket Meta */}
                <div className="py-2.5 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
                  <div className="flex justify-between">
                    <span>TICKET N°:</span>
                    <span className="font-bold">0001-00042891</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FECHA:</span>
                    <span>15/10/2026 18:42 hs</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PUNTO VENTA:</span>
                    <span>Caja 1 (POS-01)</span>
                  </div>

                  {formData.showCashierName && (
                    <div className="flex justify-between">
                      <span>CAJERO:</span>
                      <span>{currentUser.name}</span>
                    </div>
                  )}

                  {formData.showCustomerData && (
                    <div className="flex justify-between pt-1 border-t border-dotted border-slate-300">
                      <span>CLIENTE:</span>
                      <span>Consumidor Final (DNI: 34.981.200)</span>
                    </div>
                  )}
                </div>

                {/* Products Detail Table */}
                <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1.5 text-[10px]">
                  <div className="flex justify-between font-bold border-b border-dotted border-slate-300 pb-1">
                    <span>CANT / ARTÍCULO</span>
                    <span>TOTAL</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>2 x Café Especialidad 1kg</span>
                      <span>$ 29.000,00</span>
                    </div>
                    <div className="text-[9px] text-slate-500 pl-3">
                      P. Unit: $ 14.500,00
                    </div>

                    <div className="flex justify-between">
                      <span>1 x Té Verde en Hebras 100g</span>
                      <span>$ 4.200,00</span>
                    </div>

                    <div className="flex justify-between">
                      <span>3 x Alfajor Artesanal</span>
                      <span>$ 5.400,00</span>
                    </div>
                    <div className="text-[9px] text-slate-500 pl-3">
                      P. Unit: $ 1.800,00
                    </div>
                  </div>
                </div>

                {/* Totals Section */}
                <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[10px]">
                  <div className="flex justify-between text-slate-600">
                    <span>SUBTOTAL NETO:</span>
                    <span>$ 31.899,17</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>IVA ({formData.defaultVatRate}%):</span>
                    <span>$ 6.700,83</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>DESCUENTO PROMO:</span>
                    <span>-$ 0,00</span>
                  </div>
                  <div className="flex justify-between text-xs font-black pt-1 border-t border-slate-900 text-slate-900">
                    <span>TOTAL A PAGAR:</span>
                    <span>$ 38.600,00</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-700 pt-1">
                    <span>FORMA DE PAGO:</span>
                    <span>Efectivo ($ 40.000,00)</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-700">
                    <span>SU VUELTO:</span>
                    <span>$ 1.400,00</span>
                  </div>
                </div>

                {/* Footer and QR */}
                <div className="pt-3 text-center space-y-2 text-[10px]">
                  {formData.showQrCode && (
                    <div className="flex flex-col items-center justify-center pt-1">
                      <div className="p-1.5 bg-slate-100 rounded-lg border border-slate-300">
                        <QrCode className="w-14 h-14 text-slate-900" />
                      </div>
                      <span className="text-[8px] text-slate-500 mt-0.5">
                        Código de Control Fiscal Simulado
                      </span>
                    </div>
                  )}

                  <p className="font-semibold text-slate-800">
                    {formData.greetingMessage}
                  </p>
                  <p className="text-[9px] text-slate-600 leading-tight">
                    {formData.returnPolicyText}
                  </p>
                  <p className="text-[9px] text-slate-500 italic">
                    {formData.footerCustomText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: RESET TO FACTORY DEFAULTS                               */}
      {/* ============================================================== */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/80">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                ¿Restablecer Valores de Fábrica?
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Esta acción volverá todos los parámetros fiscales, logotipo, sucursales y personalización de comprobantes a los valores iniciales de demostración de COMERCIOS 360.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs cursor-pointer"
              >
                Confirmar y Restablecer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: SAFETY WARNING WHEN DEACTIVATING ACTIVE STORE           */}
      {/* ============================================================== */}
      {showDeactivateActiveStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/80">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Sucursal Activa en Sesión
                </h3>
                <p className="text-xs text-slate-500">
                  {showDeactivateActiveStoreModal.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Esta sucursal está actualmente seleccionada como la terminal activa de tu sesión de trabajo. Desactivarla interrumpirá el registro de nuevas ventas y movimientos de caja en esta ubicación.
            </p>

            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Al confirmar, el sistema seleccionará automáticamente otra sucursal habilitada para continuar operando.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeactivateActiveStoreModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivateActiveStore}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs cursor-pointer"
              >
                Desactivar y Cambiar Sucursal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CREATE NEW STORE                                        */}
      {/* ============================================================== */}
      {showNewStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-[#196344]" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Registrar Nueva Sucursal
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewStoreModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {newStoreError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{newStoreError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStore} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Código de Sucursal * (Único)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. SUC-04"
                    value={newStoreForm.code}
                    onChange={(e) => setNewStoreForm({ ...newStoreForm, code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre del Local *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sucursal Palermo Soho"
                    value={newStoreForm.name}
                    onChange={(e) => setNewStoreForm({ ...newStoreForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Dirección Física
                  </label>
                  <input
                    type="text"
                    placeholder="Honduras 4820"
                    value={newStoreForm.address}
                    onChange={(e) => setNewStoreForm({ ...newStoreForm, address: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ciudad / Localidad
                  </label>
                  <input
                    type="text"
                    placeholder="Buenos Aires, CABA"
                    value={newStoreForm.city}
                    onChange={(e) => setNewStoreForm({ ...newStoreForm, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    placeholder="+54 11 4771-0022"
                    value={newStoreForm.phone}
                    onChange={(e) => setNewStoreForm({ ...newStoreForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Encargado de Sucursal
                  </label>
                  <select
                    value={newStoreForm.manager}
                    onChange={(e) => setNewStoreForm({ ...newStoreForm, manager: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="newStoreActive"
                  checked={newStoreForm.active}
                  onChange={(e) => setNewStoreForm({ ...newStoreForm, active: e.target.checked })}
                  className="w-4 h-4 text-[#196344] rounded border-slate-300 focus:ring-[#196344]"
                />
                <label htmlFor="newStoreActive" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                  Habilitar inmediatamente para la venta
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewStoreModal(false)}
                  className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-[#196344] hover:bg-[#145237] rounded-xl shadow-xs cursor-pointer"
                >
                  Crear Sucursal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDIT EXISTING STORE                                     */}
      {/* ============================================================== */}
      {editStoreForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#196344]" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Modificar Datos de Sucursal
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditStoreForm(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedStore} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Código de Sucursal
                  </label>
                  <input
                    type="text"
                    required
                    value={editStoreForm.code}
                    onChange={(e) => setEditStoreForm({ ...editStoreForm, code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre del Local
                  </label>
                  <input
                    type="text"
                    required
                    value={editStoreForm.name}
                    onChange={(e) => setEditStoreForm({ ...editStoreForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={editStoreForm.address}
                    onChange={(e) => setEditStoreForm({ ...editStoreForm, address: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ciudad / Localidad
                  </label>
                  <input
                    type="text"
                    value={editStoreForm.city}
                    onChange={(e) => setEditStoreForm({ ...editStoreForm, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={editStoreForm.phone}
                    onChange={(e) => setEditStoreForm({ ...editStoreForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Encargado
                  </label>
                  <select
                    value={editStoreForm.manager}
                    onChange={(e) => setEditStoreForm({ ...editStoreForm, manager: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editStoreActive"
                  checked={editStoreForm.active}
                  onChange={(e) => setEditStoreForm({ ...editStoreForm, active: e.target.checked })}
                  className="w-4 h-4 text-[#196344] rounded border-slate-300 focus:ring-[#196344]"
                />
                <label htmlFor="editStoreActive" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                  Sucursal habilitada para operaciones
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditStoreForm(null)}
                  className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-[#196344] hover:bg-[#145237] rounded-xl shadow-xs cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD POS TERMINAL                                        */}
      {/* ============================================================== */}
      {showNewTerminalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Laptop className="w-5 h-5 text-[#196344]" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Agregar Caja / Terminal
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewTerminalModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {newTerminalError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{newTerminalError}</span>
              </div>
            )}

            <form onSubmit={handleAddTerminal} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre descriptivo de la Caja *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Caja 3 - Patio o Sector Rápido"
                  value={newTerminalForm.name}
                  onChange={(e) => setNewTerminalForm({ ...newTerminalForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Código de Terminal *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="POS-04"
                    value={newTerminalForm.code}
                    onChange={(e) => setNewTerminalForm({ ...newTerminalForm, code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Caja
                  </label>
                  <select
                    value={newTerminalForm.type}
                    onChange={(e) => setNewTerminalForm({ ...newTerminalForm, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="caja_mostrador">Caja Mostrador</option>
                    <option value="caja_rapida">Caja Rápida</option>
                    <option value="terminal_movil">Terminal Móvil / Tablet</option>
                    <option value="autoservicio">Autoservicio / Despacho</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notas / Periféricos asociados
                </label>
                <input
                  type="text"
                  placeholder="Ticketera 80mm, lector láser Honeywell"
                  value={newTerminalForm.notes}
                  onChange={(e) => setNewTerminalForm({ ...newTerminalForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewTerminalModal(false)}
                  className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-[#196344] hover:bg-[#145237] rounded-xl shadow-xs cursor-pointer"
                >
                  Guardar Caja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TOAST NOTIFICATION                                             */}
      {/* ============================================================== */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
