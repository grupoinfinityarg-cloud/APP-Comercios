import React, { useState, useMemo, useEffect } from 'react';
import {
  History,
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  Store as StoreIcon,
  Laptop,
  ArrowUpDown,
  RefreshCw,
  Eye,
  Plus,
  Trash2,
  FileSpreadsheet,
  Check,
  X,
  FileText,
  Key,
  Lock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  Copy,
  Printer,
  SlidersHorizontal,
  Bug,
} from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import {
  AuditLogEvent,
  AuditLogModule,
  AuditLogStatus,
  AuditLogOrigin,
  Employee,
  Store,
  NavigationSectionId,
} from '../../types';
import { DEMO_AUDIT_LOGS, DEMO_EMPLOYEES, DEMO_STORES } from '../../data/demoData';
import {
  calculateSHA256Sync,
  getCanonicalEventPayload,
  verifyAuditLogIntegrity,
  IntegrityVerificationResult,
} from '../../utils/auditIntegrity';

interface AuditLogScreenProps {
  auditLogs?: AuditLogEvent[];
  onUpdateAuditLogs?: (logs: AuditLogEvent[]) => void;
  currentUser?: Employee;
  employees?: Employee[];
  stores?: Store[];
  onNavigate?: (section: NavigationSectionId) => void;
}

export const AuditLogScreen: React.FC<AuditLogScreenProps> = ({
  auditLogs: initialAuditLogs,
  onUpdateAuditLogs,
  currentUser,
  employees = DEMO_EMPLOYEES,
  stores = DEMO_STORES,
  onNavigate,
}) => {
  // Local state for audit logs
  const [logs, setLogs] = useState<AuditLogEvent[]>(() => {
    return initialAuditLogs && initialAuditLogs.length > 0 ? initialAuditLogs : DEMO_AUDIT_LOGS;
  });

  // State to simulate tampering for demonstrating that integrity check is active and detects alterations
  const [tamperedOriginalEvent, setTamperedOriginalEvent] = useState<AuditLogEvent | null>(null);

  // Sync with initialAuditLogs from props whenever new real events are registered in the app
  useEffect(() => {
    if (initialAuditLogs && initialAuditLogs.length > 0) {
      setLogs(initialAuditLogs);
    }
  }, [initialAuditLogs]);

  // Synchronize helper
  const updateLogsState = (newLogs: AuditLogEvent[]) => {
    setLogs(newLogs);
    if (onUpdateAuditLogs) {
      onUpdateAuditLogs(newLogs);
    }
  };

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'warning' | 'info';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3600);
  };

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('Todos');
  const [selectedStore, setSelectedStore] = useState<string>('Todas');
  const [selectedModule, setSelectedModule] = useState<string>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('Todos');
  const [selectedPeriod, setSelectedPeriod] = useState<
    'todos' | 'hoy' | 'ultimos_7' | 'este_mes' | 'personalizado'
  >('todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Modal States
  const [detailEvent, setDetailEvent] = useState<AuditLogEvent | null>(null);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [showIntegrityModal, setShowIntegrityModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmWord, setResetConfirmWord] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Event Form State
  const [newEventForm, setNewEventForm] = useState<{
    userName: string;
    storeName: string;
    module: AuditLogModule;
    action: string;
    status: AuditLogStatus;
    severity: 'baja' | 'media' | 'alta' | 'critica';
    details: string;
    entityId: string;
  }>({
    userName: currentUser?.name || employees[0]?.name || 'Martín Gómez',
    storeName: stores[0]?.name || 'COMERCIOS 360 - Sucursal Central',
    module: 'Ventas y POS',
    action: 'Verificación de operación manual',
    status: 'exitoso',
    severity: 'baja',
    details: 'Registro de control interno generado manualmente para verificación de trazabilidad.',
    entityId: 'OP-' + Math.floor(1000 + Math.random() * 9000),
  });

  // Calculate Date Boundaries
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const sevenDaysAgoStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  }, []);
  const firstDayOfMonthStr = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  }, []);

  // Filtered & Sorted Logs
  const filteredLogs = useMemo(() => {
    return logs
      .filter((event) => {
        // Text Search matches ID, User, Action, Details, Terminal, IP or Entity
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchId = event.id.toLowerCase().includes(q);
          const matchUser = event.userName.toLowerCase().includes(q);
          const matchRole = event.userRole.toLowerCase().includes(q);
          const matchAction = event.action.toLowerCase().includes(q);
          const matchDetails = event.details.toLowerCase().includes(q);
          const matchStore = event.storeName.toLowerCase().includes(q);
          const matchModule = event.module.toLowerCase().includes(q);
          const matchEntity = event.entityId?.toLowerCase().includes(q) || false;
          const matchTerminal = event.terminalCode?.toLowerCase().includes(q) || false;
          const matchIp = event.ipAddress?.toLowerCase().includes(q) || false;

          if (
            !matchId &&
            !matchUser &&
            !matchRole &&
            !matchAction &&
            !matchDetails &&
            !matchStore &&
            !matchModule &&
            !matchEntity &&
            !matchTerminal &&
            !matchIp
          ) {
            return false;
          }
        }

        // Employee filter
        if (selectedUser !== 'Todos') {
          if (event.userName !== selectedUser) return false;
        }

        // Store filter
        if (selectedStore !== 'Todas') {
          if (event.storeName !== selectedStore) return false;
        }

        // Module filter
        if (selectedModule !== 'Todos') {
          if (event.module !== selectedModule) return false;
        }

        // Status filter
        if (selectedStatus !== 'Todos') {
          if (event.status.toLowerCase() !== selectedStatus.toLowerCase()) return false;
        }

        // Origin filter
        if (selectedOrigin !== 'Todos') {
          const eventOrigin = event.origin || 'demo';
          if (eventOrigin !== selectedOrigin) return false;
        }

        // Period filter
        const eventDate = event.timestamp.split('T')[0];
        if (selectedPeriod === 'hoy') {
          if (eventDate !== todayStr && !event.displayTime.toLowerCase().includes('hoy')) {
            return false;
          }
        } else if (selectedPeriod === 'ultimos_7') {
          if (eventDate < sevenDaysAgoStr) return false;
        } else if (selectedPeriod === 'este_mes') {
          if (eventDate < firstDayOfMonthStr) return false;
        } else if (selectedPeriod === 'personalizado') {
          if (startDate && eventDate < startDate) return false;
          if (endDate && eventDate > endDate) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime() || 0;
        const timeB = new Date(b.timestamp).getTime() || 0;
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [
    logs,
    searchTerm,
    selectedUser,
    selectedStore,
    selectedModule,
    selectedStatus,
    selectedOrigin,
    selectedPeriod,
    startDate,
    endDate,
    sortOrder,
    todayStr,
    sevenDaysAgoStr,
    firstDayOfMonthStr,
  ]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  // Reset pagination when filter changes
  const handleFilterChange = (setter: () => void) => {
    setter();
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedUser('Todos');
    setSelectedStore('Todas');
    setSelectedModule('Todos');
    setSelectedStatus('Todos');
    setSelectedOrigin('Todos');
    setSelectedPeriod('todos');
    setStartDate('');
    setEndDate('');
    setSortOrder('desc');
    setCurrentPage(1);
    showToast('Filtros restablecidos al valor predeterminado.', 'info');
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedUser !== 'Todos' ||
    selectedStore !== 'Todas' ||
    selectedModule !== 'Todos' ||
    selectedStatus !== 'Todos' ||
    selectedOrigin !== 'Todos' ||
    selectedPeriod !== 'todos' ||
    startDate !== '' ||
    endDate !== '';

  // KPI Calculations based strictly on available logs
  const kpiTotalEvents = logs.length;
  const kpiUniqueUsers = useMemo(() => {
    const set = new Set(logs.map((l) => l.userName));
    return set.size;
  }, [logs]);

  const kpiRecentEvents = useMemo(() => {
    return logs.filter((l) => {
      const d = l.timestamp.split('T')[0];
      return d === todayStr || l.displayTime.toLowerCase().includes('hoy');
    }).length;
  }, [logs, todayStr]);

  const kpiSecurityAlerts = useMemo(() => {
    return logs.filter(
      (l) => l.status === 'advertencia' || l.status === 'bloqueado' || l.status === 'fallido'
    ).length;
  }, [logs]);

  // Real-time Integrity Verification (executes genuine rule on current logs)
  const integrityReport = useMemo(() => {
    return verifyAuditLogIntegrity(logs);
  }, [logs]);

  // Unique lists for selectors
  const uniqueUsersList = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => set.add(e.name));
    logs.forEach((l) => set.add(l.userName));
    return Array.from(set).sort();
  }, [employees, logs]);

  const uniqueStoresList = useMemo(() => {
    const set = new Set<string>();
    stores.forEach((s) => set.add(s.name));
    logs.forEach((l) => {
      if (l.storeName) set.add(l.storeName);
    });
    return Array.from(set).sort();
  }, [stores, logs]);

  const uniqueModulesList: AuditLogModule[] = [
    'Autenticación',
    'Productos',
    'Ventas y POS',
    'Caja y Fondos',
    'Inventario y Stock',
    'Clientes y Cuentas',
    'Proveedores y Compras',
    'Promociones',
    'Reportes y Estadísticas',
    'Usuarios y Permisos',
    'Configuración',
    'Seguridad y Sistema',
  ];

  // Export Filtered CSV with UTF-8 BOM, origin, and dynamically computed canonical hashes
  const handleExportCSV = () => {
    const headers = [
      'ID_Evento',
      'Fecha_Hora_ISO',
      'Tiempo_Visible',
      'Origen_Registro',
      'Usuario',
      'Rol',
      'Sucursal',
      'Terminal',
      'Modulo',
      'Accion',
      'Resultado',
      'Gravedad',
      'IP_Origen',
      'Entidad_Relacionada',
      'Descripcion_Detalle',
      'Valor_Previo',
      'Valor_Nuevo',
      'Huella_SHA256_Local',
    ];

    const rows = filteredLogs.map((e) => {
      const computedHash =
        e.hash || calculateSHA256Sync(getCanonicalEventPayload(e, e.previousHash || ''));
      const originText =
        e.origin === 'demo'
          ? 'Demostración'
          : e.origin === 'manual_prueba'
          ? 'Prueba manual'
          : 'Sistema local';
      const ipText =
        e.origin === 'demo'
          ? `${e.ipAddress || '192.168.1.15'} (Dato de demostración)`
          : 'No disponible (Cliente web local)';
      const terminalText =
        e.origin === 'demo'
          ? `${e.terminalCode || 'N/A'} (Dato de demostración)`
          : e.terminalCode || 'Terminal Web Local';

      return [
        `"${e.id}"`,
        `"${e.timestamp}"`,
        `"${e.displayTime || ''}"`,
        `"${originText}"`,
        `"${e.userName}"`,
        `"${e.userRole}"`,
        `"${e.storeName}"`,
        `"${terminalText}"`,
        `"${e.module}"`,
        `"${e.action.replace(/"/g, '""')}"`,
        `"${e.status.toUpperCase()}"`,
        `"${(e.severity || 'baja').toUpperCase()}"`,
        `"${ipText}"`,
        `"${e.entityId || 'N/A'}"`,
        `"${e.details.replace(/"/g, '""')}"`,
        `"${(e.previousValue || '').replace(/"/g, '""')}"`,
        `"${(e.newValue || '').replace(/"/g, '""')}"`,
        `"${computedHash}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `auditoria_comercios360_${new Date().toISOString().split('T')[0]}_${filteredLogs.length}_eventos.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Planilla exportada con éxito (${filteredLogs.length} eventos filtrados).`, 'success');
  };

  // Add Manual Test Event (marked explicitly as origin: 'manual_prueba')
  const handleCreateNewEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventForm.action.trim() || !newEventForm.details.trim()) {
      showToast('Complete la acción y descripción del evento.', 'warning');
      return;
    }

    const matchedEmp = employees.find((emp) => emp.name === newEventForm.userName);
    const userRole = matchedEmp ? matchedEmp.role : 'Administrador';

    // Link previous hash from most recent event
    const latestEvent = logs.length > 0 ? logs[0] : null;
    const previousHash =
      latestEvent?.hash ||
      (latestEvent
        ? calculateSHA256Sync(getCanonicalEventPayload(latestEvent, latestEvent.previousHash || ''))
        : 'GENESIS_BLOCK_COMERCIOS360');

    const newId = `aud-${Date.now().toString().slice(-4)}`;
    const nowIso = new Date().toISOString();
    const friendlyTime =
      'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newEvent: AuditLogEvent = {
      id: newId,
      timestamp: nowIso,
      displayTime: friendlyTime,
      userName: newEventForm.userName,
      userRole,
      userId: matchedEmp?.id || 'emp-custom',
      storeName: newEventForm.storeName,
      module: newEventForm.module,
      action: newEventForm.action.trim(),
      category:
        newEventForm.module === 'Autenticación'
          ? 'auth'
          : newEventForm.module === 'Ventas y POS'
          ? 'sales'
          : newEventForm.module === 'Caja y Fondos'
          ? 'cash'
          : newEventForm.module === 'Inventario y Stock'
          ? 'stock'
          : newEventForm.module === 'Configuración'
          ? 'config'
          : 'operation',
      status: newEventForm.status,
      severity: newEventForm.severity,
      details: newEventForm.details.trim(),
      entityId: newEventForm.entityId.trim() || undefined,
      origin: 'manual_prueba', // Explicitly identified as manual test
      ipAddress: undefined, // Do not invent fake IP
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Navegador Web del Operador',
      terminalCode: 'Terminal Web Local',
      previousHash,
    };

    // Calculate real canonical SHA-256 for the new event
    const canonicalPayload = getCanonicalEventPayload(newEvent, previousHash);
    newEvent.hash = calculateSHA256Sync(canonicalPayload);

    const updated = [newEvent, ...logs];
    updateLogsState(updated);
    setShowNewEventModal(false);
    showToast(`Evento de prueba manual #${newEvent.id} registrado con huella local calculada.`, 'success');
  };

  // Copy ID Helper
  const handleCopyId = (id: string) => {
    try {
      navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
      showToast(`ID de evento ${id} copiado al portapapeles.`, 'info');
    } catch {
      showToast(`ID: ${id}`, 'info');
    }
  };

  // Reset to default demo logs helper with explicit confirmation
  const handleResetToDefaultLogs = () => {
    if (resetConfirmWord.trim().toUpperCase() !== 'RESTABLECER') {
      showToast('Debe escribir exactamente la palabra RESTABLECER para confirmar.', 'warning');
      return;
    }
    updateLogsState(DEMO_AUDIT_LOGS);
    setTamperedOriginalEvent(null);
    setShowResetModal(false);
    setResetConfirmWord('');
    showToast('Historial restablecido a los 18 registros de demostración.', 'success');
  };

  // Tampering simulation helpers (proves to user that the integrity check actually works and detects errors)
  const handleSimulateTampering = () => {
    if (logs.length === 0) return;
    const target = logs[0];
    setTamperedOriginalEvent({ ...target });

    // Tamper with action and details without updating the hash
    const tamperedList = logs.map((ev, idx) =>
      idx === 0
        ? {
            ...ev,
            action: ev.action + ' [ALTERADO MANUALMENTE]',
            details: ev.details + ' (Modificación no autorizada de prueba)',
          }
        : ev
    );

    updateLogsState(tamperedList);
    showToast(`Se alteró el evento #${target.id} sin actualizar su hash para probar la detección.`, 'warning');
  };

  const handleRestoreTamperedEvent = () => {
    if (!tamperedOriginalEvent) return;
    const restoredList = logs.map((ev) =>
      ev.id === tamperedOriginalEvent.id ? { ...tamperedOriginalEvent } : ev
    );
    updateLogsState(restoredList);
    setTamperedOriginalEvent(null);
    showToast('Registro alterado restaurado a su valor original.', 'success');
  };

  // Status Styling Helper
  const getStatusBadge = (status: AuditLogStatus) => {
    switch (status) {
      case 'exitoso':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Exitoso</span>
          </span>
        );
      case 'advertencia':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/90 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Advertencia</span>
          </span>
        );
      case 'bloqueado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/90 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Bloqueado</span>
          </span>
        );
      case 'fallido':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/90 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            <span>Fallido</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
            {status}
          </span>
        );
    }
  };

  // Origin Badge Helper (Differentiates Demo from Manual Test from Real System)
  const getOriginBadge = (origin?: AuditLogOrigin) => {
    switch (origin) {
      case 'demo':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <Info className="w-3 h-3 text-slate-500" />
            <span>Demostración</span>
          </span>
        );
      case 'manual_prueba':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Plus className="w-3 h-3 text-amber-600" />
            <span>Prueba manual</span>
          </span>
        );
      case 'sistema_local':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
            <CheckCircle2 className="w-3 h-3 text-teal-600" />
            <span>Sistema local</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <Info className="w-3 h-3 text-slate-500" />
            <span>Demostración</span>
          </span>
        );
    }
  };

  const getRoleBadge = (role: Employee['role'] | 'Sistema') => {
    switch (role) {
      case 'Administrador':
        return 'bg-purple-100 text-purple-900 dark:bg-purple-950/90 dark:text-purple-200 border border-purple-300 dark:border-purple-800';
      case 'Encargado':
        return 'bg-blue-100 text-blue-900 dark:bg-blue-950/90 dark:text-blue-200 border border-blue-300 dark:border-blue-800';
      case 'Cajero':
        return 'bg-amber-100 text-amber-900 dark:bg-amber-950/90 dark:text-amber-200 border border-amber-300 dark:border-amber-800';
      case 'Vendedor':
        return 'bg-teal-100 text-teal-900 dark:bg-teal-950/90 dark:text-teal-200 border border-teal-300 dark:border-teal-800';
      case 'Sistema':
        return 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
    }
  };

  const getModuleColor = (mod: AuditLogModule) => {
    switch (mod) {
      case 'Autenticación':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'Productos':
        return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      case 'Ventas y POS':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Caja y Fondos':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Inventario y Stock':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'Usuarios y Permisos':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Configuración':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs sm:text-sm font-semibold backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900/90 text-white border-emerald-700'
                : toastMessage.type === 'warning'
                ? 'bg-amber-900/90 text-white border-amber-700'
                : 'bg-[#161A18]/95 text-white border-[#2E3531]'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : toastMessage.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-[#C85A32] shrink-0" />
            )}
            <span className="flex-1">{toastMessage.text}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="p-1 hover:bg-white/10 rounded-lg text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Honest Demo Notice Banner */}
      <DemoNotice
        title="Módulo 13 — Historial de Actividad y Auditoría"
        description="Módulo de trazabilidad y registro de actividad de COMERCIOS 360. Historial cronológico local de accesos de colaboradores, arqueos, facturación en línea de cajas, altas de stock y cambios en parámetros del sistema con exportación y filtros cruzados."
      />

      {/* Screen Header */}
      <div className="bg-white dark:bg-[#222825] p-5 sm:p-7 rounded-3xl border border-[#DCD6CC] dark:border-[#2E3531] shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-10 h-10 rounded-2xl bg-[#C85A32]/10 dark:bg-[#C85A32]/20 text-[#C85A32] flex items-center justify-center font-black">
                <History className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#161A18] dark:text-white">
                Historial de actividad y auditoría
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#C85A32] text-white tracking-wide">
                MÓDULO 13
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                <History className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Registro Local de Demostración</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#4B524E] dark:text-[#CBD2CE] max-w-3xl leading-relaxed">
              Registro cronológico de operaciones sensibles, inicios de sesión y movimientos de caja
              almacenados en el entorno local de COMERCIOS 360.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowIntegrityModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#FAF8F4] dark:bg-[#161A18] hover:bg-[#F2ECE1] dark:hover:bg-[#282F2C] text-[#161A18] dark:text-white text-xs sm:text-sm font-bold rounded-xl border border-[#DCD6CC] dark:border-[#2E3531] shadow-2xs transition-all cursor-pointer min-h-[42px]"
              title="Ejecutar comprobación local de integridad y consistencia"
            >
              <Shield className={`w-4 h-4 ${integrityReport.isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} />
              <span>Comprobar integridad local</span>
              {!integrityReport.isValid && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#FAF8F4] dark:bg-[#161A18] hover:bg-[#F2ECE1] dark:hover:bg-[#282F2C] text-[#161A18] dark:text-white text-xs sm:text-sm font-bold rounded-xl border border-[#DCD6CC] dark:border-[#2E3531] shadow-2xs transition-all cursor-pointer min-h-[42px]"
            >
              <Download className="w-4 h-4 text-[#C85A32]" />
              <span>Exportar CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setShowNewEventModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C85A32] hover:bg-[#B84C26] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer min-h-[42px]"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Evento de Prueba</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Events */}
        <div className="bg-white dark:bg-[#222825] p-4 sm:p-5 rounded-2xl border border-[#DCD6CC] dark:border-[#2E3531] shadow-2xs">
          <div className="flex items-center justify-between text-[#4B524E] dark:text-[#A2A9A5] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total de Eventos</span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF8F4] dark:bg-[#161A18] text-[#161A18] dark:text-white flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-[#C85A32]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#161A18] dark:text-white tracking-tight">
            {kpiTotalEvents}
          </div>
          <div className="text-xs text-[#4B524E] dark:text-[#CBD2CE] mt-1.5 flex items-center gap-1.5 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-slate-400" />
            <span>Registros en almacenamiento local</span>
          </div>
        </div>

        {/* KPI 2: Involved Users */}
        <div className="bg-white dark:bg-[#222825] p-4 sm:p-5 rounded-2xl border border-[#DCD6CC] dark:border-[#2E3531] shadow-2xs">
          <div className="flex items-center justify-between text-[#4B524E] dark:text-[#A2A9A5] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Usuarios Involucrados</span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF8F4] dark:bg-[#161A18] text-[#161A18] dark:text-white flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#161A18] dark:text-white tracking-tight">
            {kpiUniqueUsers}
          </div>
          <div className="text-xs text-[#4B524E] dark:text-[#CBD2CE] mt-1.5 flex items-center gap-1.5 font-medium">
            <span>Operadores y colaboradores</span>
          </div>
        </div>

        {/* KPI 3: Recent Events (Today / 24h) */}
        <div className="bg-white dark:bg-[#222825] p-4 sm:p-5 rounded-2xl border border-[#DCD6CC] dark:border-[#2E3531] shadow-2xs">
          <div className="flex items-center justify-between text-[#4B524E] dark:text-[#A2A9A5] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Eventos Recientes (Hoy)</span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF8F4] dark:bg-[#161A18] text-[#161A18] dark:text-white flex items-center justify-center">
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#161A18] dark:text-white tracking-tight">
            {kpiRecentEvents}
          </div>
          <div className="text-xs text-[#4B524E] dark:text-[#CBD2CE] mt-1.5 flex items-center gap-1.5 font-medium">
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">Actividad del día</span>
          </div>
        </div>

        {/* KPI 4: Security Alerts & Blocks */}
        <div className="bg-white dark:bg-[#222825] p-4 sm:p-5 rounded-2xl border border-[#DCD6CC] dark:border-[#2E3531] shadow-2xs">
          <div className="flex items-center justify-between text-[#4B524E] dark:text-[#A2A9A5] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Alertas y Bloqueos</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-400 tracking-tight">
            {kpiSecurityAlerts}
          </div>
          <div className="text-xs text-[#4B524E] dark:text-[#CBD2CE] mt-1.5 flex items-center gap-1.5 font-medium">
            <span>Advertencias o accesos denegados</span>
          </div>
        </div>
      </div>

      {/* Search & Advanced Filters Panel */}
      <div className="bg-white dark:bg-[#222825] p-5 sm:p-6 rounded-3xl border border-[#DCD6CC] dark:border-[#2E3531] shadow-2xs space-y-4">
        {/* Quick Period Buttons and Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2DDD5] dark:border-[#2E3531]">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-[#4B524E] dark:text-[#A2A9A5] uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Período:</span>
            </span>

            <button
              type="button"
              onClick={() => handleFilterChange(() => setSelectedPeriod('todos'))}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedPeriod === 'todos'
                  ? 'bg-[#161A18] dark:bg-white text-white dark:text-[#161A18]'
                  : 'bg-[#FAF8F4] dark:bg-[#161A18] text-[#4B524E] dark:text-[#CBD2CE] hover:bg-[#F2ECE1] dark:hover:bg-[#282F2C]'
              }`}
            >
              Todos los registros
            </button>

            <button
              type="button"
              onClick={() => handleFilterChange(() => setSelectedPeriod('hoy'))}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedPeriod === 'hoy'
                  ? 'bg-[#161A18] dark:bg-white text-white dark:text-[#161A18]'
                  : 'bg-[#FAF8F4] dark:bg-[#161A18] text-[#4B524E] dark:text-[#CBD2CE] hover:bg-[#F2ECE1] dark:hover:bg-[#282F2C]'
              }`}
            >
              Hoy ({kpiRecentEvents})
            </button>

            <button
              type="button"
              onClick={() => handleFilterChange(() => setSelectedPeriod('ultimos_7'))}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedPeriod === 'ultimos_7'
                  ? 'bg-[#161A18] dark:bg-white text-white dark:text-[#161A18]'
                  : 'bg-[#FAF8F4] dark:bg-[#161A18] text-[#4B524E] dark:text-[#CBD2CE] hover:bg-[#F2ECE1] dark:hover:bg-[#282F2C]'
              }`}
            >
              Últimos 7 días
            </button>

            <button
              type="button"
              onClick={() => handleFilterChange(() => setSelectedPeriod('este_mes'))}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedPeriod === 'este_mes'
                  ? 'bg-[#161A18] dark:bg-white text-white dark:text-[#161A18]'
                  : 'bg-[#FAF8F4] dark:bg-[#161A18] text-[#4B524E] dark:text-[#CBD2CE] hover:bg-[#F2ECE1] dark:hover:bg-[#282F2C]'
              }`}
            >
              Mes en curso
            </button>

            <button
              type="button"
              onClick={() => handleFilterChange(() => setSelectedPeriod('personalizado'))}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedPeriod === 'personalizado'
                  ? 'bg-[#161A18] dark:bg-white text-white dark:text-[#161A18]'
                  : 'bg-[#FAF8F4] dark:bg-[#161A18] text-[#4B524E] dark:text-[#CBD2CE] hover:bg-[#F2ECE1] dark:hover:bg-[#282F2C]'
              }`}
            >
              Personalizado
            </button>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs text-[#C85A32] font-bold hover:underline cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Limpiar filtros activos</span>
            </button>
          )}
        </div>

        {/* Custom Date Range Picker */}
        {selectedPeriod === 'personalizado' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#FAF8F4] dark:bg-[#161A18] border border-[#DCD6CC] dark:border-[#2E3531] text-xs">
            <div>
              <label className="block font-bold text-[#161A18] dark:text-white mb-1">
                Fecha Desde:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleFilterChange(() => setStartDate(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-[#222825] border border-[#DCD6CC] dark:border-[#2E3531] rounded-xl text-[#161A18] dark:text-white focus:outline-hidden focus:border-[#C85A32]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#161A18] dark:text-white mb-1">
                Fecha Hasta:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleFilterChange(() => setEndDate(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-[#222825] border border-[#DCD6CC] dark:border-[#2E3531] rounded-xl text-[#161A18] dark:text-white focus:outline-hidden focus:border-[#C85A32]"
              />
            </div>
          </div>
        )}

        {/* Main Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* 1. Text Search Input */}
          <div className="lg:col-span-2 relative">
            <label className="block text-xs font-bold text-[#4B524E] dark:text-[#A2A9A5] uppercase tracking-wider mb-1">
              Búsqueda en eventos
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#4B524E] dark:text-[#A2A9A5]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleFilterChange(() => setSearchTerm(e.target.value))}
                placeholder="Buscar por empleado, ID, acción, IP..."
                className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm bg-[#FAF8F4] dark:bg-[#161A18] border border-[#DCD6CC] dark:border-[#2E3531] rounded-xl text-[#161A18] dark:text-white placeholder-[#78827B] focus:outline-hidden focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] min-h-[42px]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => handleFilterChange(() => setSearchTerm(''))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#4B524E] hover:text-[#161A18] dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 2. Employee Selector */}
          <div>
            <label className="block text-xs font-bold text-[#4B524E] dark:text-[#A2A9A5] uppercase tracking-wider mb-1">
              Colaborador
            </label>
            <select
              value={selectedUser}
              onChange={(e) => handleFilterChange(() => setSelectedUser(e.target.value))}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-[#FAF8F4] dark:bg-[#161A18] border border-[#DCD6CC] dark:border-[#2E3531] rounded-xl text-[#161A18] dark:text-white focus:outline-hidden focus:border-[#C85A32] min-h-[42px] cursor-pointer"
            >
              <option value="Todos">Todos ({uniqueUsersList.length})</option>
              {uniqueUsersList.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Branch / Store Selector */}
          <div>
            <label className="block text-xs font-bold text-[#4B524E] dark:text-[#A2A9A5] uppercase tracking-wider mb-1">
              Sucursal
            </label>
            <select
              value={selectedStore}
              onChange={(e) => handleFilterChange(() => setSelectedStore(e.target.value))}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-[#FAF8F4] dark:bg-[#161A18] border border-[#DCD6CC] dark:border-[#2E3531] rounded-xl text-[#161A18] dark:text-white focus:outline-hidden focus:border-[#C85A32] min-h-[42px] cursor-pointer"
            >
              <option value="Todas">Todas las sucursales</option>
              {uniqueStoresList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Origin Selector */}
          <div>
            <label className="block text-xs font-bold text-[#4B524E] dark:text-[#A2A9A5] uppercase tracking-wider mb-1">
              Origen
            </label>
            <select
              value={selectedOrigin}
              onChange={(e) => handleFilterChange(() => setSelectedOrigin(e.target.value))}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-[#FAF8F4] dark:bg-[#161A18] border border-[#DCD6CC] dark:border-[#2E3531] rounded-xl text-[#161A18] dark:text-white focus:outline-hidden focus:border-[#C85A32] min-h-[42px] cursor-pointer"
            >
              <option value="Todos">Todos los orígenes</option>
              <option value="demo">Solo demostración</option>
              <option value="manual_prueba">Solo pruebas manuales</option>
              <option value="sistema_local">Solo sistema local</option>
            </select>
          </div>

          {/* 5. Module & Result Selectors */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-[#4B524E] dark:text-[#A2A9A5] uppercase tracking-wider mb-1 truncate">
                Módulo
              </label>
              <select
                value={selectedModule}
                onChange={(e) => handleFilterChange(() => setSelectedModule(e.target.value))}
                className="w-full px-2 py-2.5 text-xs bg-[#FAF8F4] dark:bg-[#161A18] border border-[#DCD6CC] dark:border-[#2E3531] rounded-xl text-[#161A18] dark:text-white focus:outline-hidden focus:border-[#C85A32] min-h-[42px] cursor-pointer"
              >
                <option value="Todos">Todos</option>
                {uniqueModulesList.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4B524E] dark:text-[#A2A9A5] uppercase tracking-wider mb-1 truncate">
                Resultado
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => handleFilterChange(() => setSelectedStatus(e.target.value))}
                className="w-full px-2 py-2.5 text-xs bg-[#FAF8F4] dark:bg-[#161A18] border border-[#DCD6CC] dark:border-[#2E3531] rounded-xl text-[#161A18] dark:text-white focus:outline-hidden focus:border-[#C85A32] min-h-[42px] cursor-pointer"
              >
                <option value="Todos">Todos</option>
                <option value="exitoso">Exitosos</option>
                <option value="advertencia">Advertencias</option>
                <option value="bloqueado">Bloqueados</option>
                <option value="fallido">Fallidos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Summary Status */}
        <div className="flex items-center justify-between text-xs text-[#4B524E] dark:text-[#A2A9A5] pt-1">
          <div className="font-semibold flex items-center gap-1.5 flex-wrap">
            <span>Mostrando</span>
            <strong className="text-[#161A18] dark:text-white font-black">{filteredLogs.length}</strong>
            <span>de</span>
            <strong className="text-[#161A18] dark:text-white font-black">{logs.length}</strong>
            <span>eventos registrados</span>
            {!integrityReport.isValid && (
              <span className="text-rose-600 dark:text-rose-400 font-bold ml-2">
                • {integrityReport.discrepancies.length} discrepancia(s) detectada(s)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span>Por página:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-[#FAF8F4] dark:bg-[#161A18] border border-[#DCD6CC] dark:border-[#2E3531] rounded-lg text-xs text-[#161A18] dark:text-white focus:outline-hidden cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Adaptive Desktop Table and Mobile Cards */}
      <div className="bg-white dark:bg-[#222825] rounded-3xl border border-[#DCD6CC] dark:border-[#2E3531] shadow-2xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#FAF8F4] dark:bg-[#161A18] text-[#4B524E] dark:text-[#A2A9A5] flex items-center justify-center mx-auto border border-[#DCD6CC] dark:border-[#2E3531]">
              <Search className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-[#161A18] dark:text-white">
                No se encontraron eventos con los criterios seleccionados
              </h3>
              <p className="text-xs sm:text-sm text-[#4B524E] dark:text-[#CBD2CE] max-w-md mx-auto">
                Prueba relajando los filtros de período, origen o buscando por otro término.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C85A32] text-white text-xs sm:text-sm font-bold shadow-xs hover:bg-[#B84C26] cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Restablecer Filtros</span>
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table (Hidden on small screens) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2DDD5] dark:border-[#2E3531] bg-[#FAF8F4] dark:bg-[#161A18] text-[#4B524E] dark:text-[#A2A9A5] text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-bold">Fecha y Hora</th>
                    <th className="py-3.5 px-4 font-bold">Origen</th>
                    <th className="py-3.5 px-4 font-bold">Acción / Evento</th>
                    <th className="py-3.5 px-4 font-bold">Módulo</th>
                    <th className="py-3.5 px-4 font-bold">Responsable</th>
                    <th className="py-3.5 px-4 font-bold">Sucursal & Terminal</th>
                    <th className="py-3.5 px-4 font-bold text-center">Resultado</th>
                    <th className="py-3.5 px-4 font-bold text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DDD5] dark:divide-[#2E3531] text-xs sm:text-sm">
                  {paginatedLogs.map((event) => (
                    <tr
                      key={event.id}
                      onClick={() => setDetailEvent(event)}
                      className="hover:bg-[#FAF8F4] dark:hover:bg-[#282F2C] transition-colors cursor-pointer group"
                    >
                      {/* 1. Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-[#161A18] dark:text-white flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#4B524E] dark:text-[#A2A9A5]" />
                          <span>{event.displayTime || event.timestamp}</span>
                        </div>
                        <div className="text-[11px] font-mono text-[#78827B] mt-0.5">
                          ID: {event.id}
                        </div>
                      </td>

                      {/* 2. Origin Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getOriginBadge(event.origin)}
                      </td>

                      {/* 3. Action / Event */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-[#161A18] dark:text-white group-hover:text-[#C85A32] transition-colors">
                          {event.action}
                        </div>
                        <p className="text-xs text-[#4B524E] dark:text-[#CBD2CE] line-clamp-1 mt-0.5 leading-snug">
                          {event.details}
                        </p>
                      </td>

                      {/* 4. Module */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getModuleColor(
                            event.module
                          )}`}
                        >
                          {event.module}
                        </span>
                      </td>

                      {/* 5. Responsible User */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#FAF8F4] dark:bg-[#161A18] border border-[#DCD6CC] dark:border-[#2E3531] text-[#161A18] dark:text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {event.userName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-[#161A18] dark:text-white text-xs">
                              {event.userName}
                            </div>
                            <span
                              className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${getRoleBadge(
                                event.userRole
                              )}`}
                            >
                              {event.userRole}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 6. Branch & Terminal */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-xs font-semibold text-[#161A18] dark:text-white flex items-center gap-1">
                          <StoreIcon className="w-3.5 h-3.5 text-[#4B524E] dark:text-[#A2A9A5] shrink-0" />
                          <span className="truncate max-w-[140px]">{event.storeName}</span>
                        </div>
                        <div className="text-[11px] font-mono text-[#78827B] mt-0.5">
                          {event.terminalCode ? (
                            <span>
                              {event.terminalCode}{' '}
                              {event.origin === 'demo' && (
                                <span className="text-[10px] text-slate-400">(demo)</span>
                              )}
                            </span>
                          ) : (
                            <span>Terminal Local</span>
                          )}
                        </div>
                      </td>

                      {/* 7. Result Badge */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(event.status)}
                      </td>

                      {/* 8. Action Button */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailEvent(event);
                          }}
                          className="p-2 rounded-xl text-[#4B524E] dark:text-[#CBD2CE] hover:text-[#C85A32] dark:hover:text-[#FFA07A] hover:bg-[#FAF8F4] dark:hover:bg-[#161A18] transition-colors cursor-pointer"
                          title="Ver detalle del evento"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards (Visible only on small screens) */}
            <div className="md:hidden divide-y divide-[#E2DDD5] dark:divide-[#2E3531]">
              {paginatedLogs.map((event) => (
                <div
                  key={event.id}
                  onClick={() => setDetailEvent(event)}
                  className="p-4 space-y-2.5 hover:bg-[#FAF8F4] dark:hover:bg-[#282F2C] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold border ${getModuleColor(
                          event.module
                        )}`}
                      >
                        {event.module}
                      </span>
                      {getOriginBadge(event.origin)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-[#78827B]">{event.id}</span>
                      {getStatusBadge(event.status)}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-[#161A18] dark:text-white">
                      {event.action}
                    </h4>
                    <p className="text-xs text-[#4B524E] dark:text-[#CBD2CE] mt-0.5 leading-relaxed">
                      {event.details}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#4B524E] dark:text-[#A2A9A5] pt-1">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span className="font-bold text-[#161A18] dark:text-white">
                        {event.userName}
                      </span>
                      <span className="text-[10px] text-[#78827B]">({event.userRole})</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{event.displayTime || event.timestamp}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-[#78827B]">
                    <span className="truncate max-w-[200px]">{event.storeName}</span>
                    <span className="text-[#C85A32] font-bold flex items-center gap-1">
                      Ver detalle <Eye className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="p-4 sm:p-5 border-t border-[#E2DDD5] dark:border-[#2E3531] bg-[#FAF8F4] dark:bg-[#161A18] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="text-[#4B524E] dark:text-[#CBD2CE] font-medium text-center sm:text-left">
                Página <strong className="text-[#161A18] dark:text-white font-black">{currentPage}</strong> de{' '}
                <strong className="text-[#161A18] dark:text-white font-black">{totalPages}</strong> • Total{' '}
                {filteredLogs.length} eventos
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3.5 py-2 bg-white dark:bg-[#222825] hover:bg-[#F2ECE1] dark:hover:bg-[#282F2C] disabled:opacity-40 disabled:cursor-not-allowed text-[#161A18] dark:text-white font-bold rounded-xl border border-[#DCD6CC] dark:border-[#2E3531] transition-all cursor-pointer min-h-[38px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = currentPage - 3 + i;
                      if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-[#C85A32] text-white shadow-xs'
                            : 'bg-white dark:bg-[#222825] text-[#161A18] dark:text-white hover:bg-[#F2ECE1] dark:hover:bg-[#282F2C] border border-[#DCD6CC] dark:border-[#2E3531]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 px-3.5 py-2 bg-white dark:bg-[#222825] hover:bg-[#F2ECE1] dark:hover:bg-[#282F2C] disabled:opacity-40 disabled:cursor-not-allowed text-[#161A18] dark:text-white font-bold rounded-xl border border-[#DCD6CC] dark:border-[#2E3531] transition-all cursor-pointer min-h-[38px]"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Admin Maintenance / Reset Tool */}
      {currentUser?.role === 'Administrador' && (
        <div className="bg-[#FAF8F4] dark:bg-[#161A18] p-4 sm:p-5 rounded-2xl border border-[#DCD6CC] dark:border-[#2E3531] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-[#C85A32] shrink-0" />
            <div className="text-[#4B524E] dark:text-[#CBD2CE]">
              Gestión de demostración: como <strong>Administrador</strong> en la interfaz, puedes restablecer los datos iniciales de demostración.
              <span className="block text-[11px] text-[#78827B] mt-0.5">
                Aclaración técnica: Esta restricción se aplica en el cliente web y no constituye seguridad de servidor.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setResetConfirmWord('');
              setShowResetModal(true);
            }}
            className="px-3.5 py-2 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 font-bold rounded-xl border border-rose-300 dark:border-rose-900 transition-colors cursor-pointer shrink-0"
          >
            Restablecer datos de demostración
          </button>
        </div>
      )}

      {/* =========================================================================
          MODALS
      ========================================================================= */}

      {/* MODAL 1: EVENT DETAIL MODAL */}
      {detailEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#222825] rounded-3xl p-5 sm:p-7 max-w-2xl w-full border border-[#DCD6CC] dark:border-[#2E3531] shadow-2xl text-xs sm:text-sm my-8 space-y-5 animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E2DDD5] dark:border-[#2E3531]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#C85A32]/10 dark:bg-[#C85A32]/20 text-[#C85A32] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-[#161A18] dark:text-white">
                      Detalle del Evento de Auditoría
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleCopyId(detailEvent.id)}
                      className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-lg bg-[#FAF8F4] dark:bg-[#161A18] text-[#4B524E] dark:text-[#A2A9A5] hover:text-[#C85A32] border border-[#DCD6CC] dark:border-[#2E3531] cursor-pointer"
                      title="Copiar ID"
                    >
                      <span>{detailEvent.id}</span>
                      {copiedId === detailEvent.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    {getOriginBadge(detailEvent.origin)}
                  </div>
                  <p className="text-xs text-[#4B524E] dark:text-[#CBD2CE] mt-0.5">
                    Registro de auditoría generado el {detailEvent.timestamp}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailEvent(null)}
                className="p-2 rounded-xl text-[#78827B] hover:text-[#161A18] dark:hover:text-white hover:bg-[#FAF8F4] dark:hover:bg-[#161A18] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Event Summary Banner */}
            <div className="p-4 rounded-2xl bg-[#FAF8F4] dark:bg-[#161A18] border border-[#DCD6CC] dark:border-[#2E3531] flex items-start gap-3">
              <div className="mt-0.5">{getStatusBadge(detailEvent.status)}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-[#161A18] dark:text-white text-sm sm:text-base">
                  {detailEvent.action}
                </h4>
                <p className="text-xs sm:text-sm text-[#4B524E] dark:text-[#CBD2CE] mt-1 leading-relaxed">
                  {detailEvent.details}
                </p>
              </div>
            </div>

            {/* Structured Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* User & Role */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#262D29] border border-[#E2DDD5] dark:border-[#2E3531]">
                <span className="text-[11px] font-bold uppercase text-[#78827B] block mb-1">
                  Usuario Responsable
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF8F4] dark:bg-[#161A18] text-[#161A18] dark:text-white flex items-center justify-center font-bold text-xs border border-[#DCD6CC] dark:border-[#2E3531]">
                    {detailEvent.userName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-[#161A18] dark:text-white">
                      {detailEvent.userName}
                    </div>
                    <span
                      className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${getRoleBadge(
                        detailEvent.userRole
                      )}`}
                    >
                      {detailEvent.userRole}
                    </span>
                  </div>
                </div>
              </div>

              {/* Branch & Terminal */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#262D29] border border-[#E2DDD5] dark:border-[#2E3531]">
                <span className="text-[11px] font-bold uppercase text-[#78827B] block mb-1">
                  Sucursal y Puesto
                </span>
                <div className="font-bold text-[#161A18] dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                  <StoreIcon className="w-4 h-4 text-[#4B524E] dark:text-[#A2A9A5]" />
                  <span>{detailEvent.storeName}</span>
                </div>
                <div className="text-xs text-[#78827B] mt-0.5">
                  Terminal:{' '}
                  {detailEvent.terminalCode ? (
                    <span>
                      {detailEvent.terminalCode}{' '}
                      {detailEvent.origin === 'demo' ? '(Dato de demostración)' : ''}
                    </span>
                  ) : (
                    <span className="italic">No disponible (Terminal local)</span>
                  )}
                </div>
              </div>

              {/* Module & Severity */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#262D29] border border-[#E2DDD5] dark:border-[#2E3531]">
                <span className="text-[11px] font-bold uppercase text-[#78827B] block mb-1">
                  Módulo y Gravedad
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-lg text-xs font-bold border ${getModuleColor(
                      detailEvent.module
                    )}`}
                  >
                    {detailEvent.module}
                  </span>
                  <span className="text-xs font-bold uppercase text-[#4B524E] dark:text-[#CBD2CE]">
                    Gravedad: {detailEvent.severity || 'baja'}
                  </span>
                </div>
              </div>

              {/* Network IP & Agent */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#262D29] border border-[#E2DDD5] dark:border-[#2E3531]">
                <span className="text-[11px] font-bold uppercase text-[#78827B] block mb-1">
                  Dirección IP y Dispositivo
                </span>
                <div className="font-mono text-xs text-[#161A18] dark:text-white font-bold">
                  {detailEvent.origin === 'demo' && detailEvent.ipAddress ? (
                    <span>{detailEvent.ipAddress} <span className="text-[10px] font-normal text-slate-500">(Dato de demostración)</span></span>
                  ) : (
                    <span className="italic text-slate-500 font-normal">No disponible (Cliente web sin servidor)</span>
                  )}
                </div>
                <div className="text-[11px] text-[#78827B] mt-0.5 truncate" title={detailEvent.userAgent}>
                  {detailEvent.origin === 'demo' && detailEvent.userAgent ? (
                    <span>{detailEvent.userAgent} <span className="text-[10px] text-slate-500">(Dato de demostración)</span></span>
                  ) : (
                    <span>{detailEvent.userAgent || 'Navegador Web del Operador'}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Changes comparison if before/after values exist */}
            {(detailEvent.previousValue || detailEvent.newValue) && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Modificación de Parámetros Registrada</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {detailEvent.previousValue && (
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#222825] border border-amber-200 dark:border-amber-800">
                      <span className="text-[11px] text-[#78827B] font-bold block mb-0.5">
                        Estado Anterior:
                      </span>
                      <code className="text-[#161A18] dark:text-white font-bold">
                        {detailEvent.previousValue}
                      </code>
                    </div>
                  )}
                  {detailEvent.newValue && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                      <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold block mb-0.5">
                        Nuevo Valor Asignado:
                      </span>
                      <code className="text-emerald-900 dark:text-emerald-200 font-bold">
                        {detailEvent.newValue}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Local Computed Canonical SHA-256 (honest, dynamic, transparent) */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F4] dark:bg-[#161A18] border border-[#DCD6CC] dark:border-[#2E3531] text-[11px] text-[#78827B] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#161A18] dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#C85A32]" />
                  <span>Huella Digital Canónica (SHA-256 Local)</span>
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  Calculada en tiempo real
                </span>
              </div>
              <p className="font-mono text-[10px] break-all text-[#161A18] dark:text-[#CBD2CE] bg-white dark:bg-[#222825] p-2 rounded-xl border border-[#DCD6CC] dark:border-[#2E3531]">
                {calculateSHA256Sync(getCanonicalEventPayload(detailEvent, detailEvent.previousHash || ''))}
              </p>
              <div className="text-[10px] text-[#78827B] leading-tight space-y-0.5">
                <p>
                  • <strong>Campos canónicos normalizados incluidos:</strong> id, timestamp, usuario, rol, sucursal, módulo, acción, categoría, resultado, descripción, origen, entidad y huella previa.
                </p>
                <p className="text-amber-700 dark:text-amber-400">
                  • <strong>Aviso de transparencia:</strong> Este hash se calcula localmente en el navegador. Almacenado en memoria/localStorage local; no constituye una firma externa infalsificable de servidor.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E2DDD5] dark:border-[#2E3531]">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF8F4] dark:bg-[#161A18] hover:bg-[#F2ECE1] dark:hover:bg-[#282F2C] text-[#161A18] dark:text-white text-xs font-bold border border-[#DCD6CC] dark:border-[#2E3531] cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Imprimir Ficha</span>
              </button>

              <button
                type="button"
                onClick={() => setDetailEvent(null)}
                className="px-5 py-2.5 rounded-xl bg-[#161A18] dark:bg-white text-white dark:text-[#161A18] font-bold text-xs cursor-pointer shadow-xs"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: NEW AUDIT EVENT (MANUAL TEST ENTRY) */}
      {showNewEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#222825] rounded-3xl p-5 sm:p-7 max-w-lg w-full border border-[#DCD6CC] dark:border-[#2E3531] shadow-2xl text-xs sm:text-sm my-8 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD5] dark:border-[#2E3531]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#C85A32]/10 dark:bg-[#C85A32]/20 text-[#C85A32] flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#161A18] dark:text-white">
                    Registrar Evento de Prueba
                  </h3>
                  <p className="text-xs text-[#4B524E] dark:text-[#CBD2CE]">
                    Se registrará con origen «Prueba manual» y hash canónico calculado localmente
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewEventModal(false)}
                className="p-1.5 rounded-lg text-[#78827B] hover:text-[#161A18] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewEvent} className="space-y-3.5">
              <div>
                <label className="block font-bold text-[#161A18] dark:text-white mb-1">
                  Colaborador Responsable:
                </label>
                <select
                  value={newEventForm.userName}
                  onChange={(e) => setNewEventForm({ ...newEventForm, userName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF8F4] dark:bg-[#161A18] border border-[#DCD6CC] dark:border-[#2E3531] rounded-xl text-[#161A18] dark:text-white focus:outline-hidden focus:border-[#C85A32]"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.name}>
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                  <option value="Sistema COMERCIOS 360">Sistema COMERCIOS 360 (Automático)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#161A18] dark:text-white mb-1">
                    Módulo:
                  </label>
                  <select
                    value={newEventForm.module}
                    onChange={(e) =>
                      setNewEventForm({
                        ...newEventForm,
                        module: e.target.value as AuditLogModule,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#FAF8F4] dark:bg-[#161A18] border border-[#DCD6CC] dark:border-[#2E3531] rounded-xl text-[#161A18] dark:text-white focus:outline-hidden focus:border-[#C85A32]"
                  >
                    {uniqueModulesList.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#161A18] dark:text-white mb-1">
                    Resultado:
                  </label>
                  <select
                    value={newEventForm.status}
                    onChange={(e) =>
                      setNewEventForm({
                        ...newEventForm,
                        status: e.target.value as AuditLogStatus,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#FAF8F4] dark:bg-[#161A18] border border-[#DCD6CC] dark:border-[#2E3531] rounded-xl text-[#161A18] dark:text-white focus:outline-hidden focus:border-[#C85A32]"
                  >
                    <option value="exitoso">Exitoso</option>
                    <option value="advertencia">Advertencia</option>
                    <option value="bloqueado">Bloqueado</option>
                    <option value="fallido">Fallido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#161A18] dark:text-white mb-1">
                  Acción / Título del evento:
                </label>
                <input
                  type="text"
                  value={newEventForm.action}
                  onChange={(e) => setNewEventForm({ ...newEventForm, action: e.target.value })}
                  placeholder="Ej: Anulación de comprobante fiscal, Cierre ciego de caja"
                  className="w-full px-3 py-2 bg-[#FAF8F4] dark:bg-[#161A18] border border-[#DCD6CC] dark:border-[#2E3531] rounded-xl text-[#161A18] dark:text-white focus:outline-hidden focus:border-[#C85A32]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#161A18] dark:text-white mb-1">
                  Descripción Detallada:
                </label>
                <textarea
                  rows={3}
                  value={newEventForm.details}
                  onChange={(e) => setNewEventForm({ ...newEventForm, details: e.target.value })}
                  placeholder="Detalles contextuales de la operación para el registro..."
                  className="w-full px-3 py-2 bg-[#FAF8F4] dark:bg-[#161A18] border border-[#DCD6CC] dark:border-[#2E3531] rounded-xl text-[#161A18] dark:text-white focus:outline-hidden focus:border-[#C85A32]"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-[#4B524E] dark:text-[#CBD2CE] space-y-1">
                <div className="font-bold text-[#161A18] dark:text-white flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Transparencia técnica de origen</span>
                </div>
                <p>
                  Este registro se guardará con origen <strong>Prueba manual</strong>, terminal <strong>Terminal Web Local</strong> y dirección IP <strong>No disponible</strong> (al no existir servidor que capture direcciones IP de red).
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2DDD5] dark:border-[#2E3531]">
                <button
                  type="button"
                  onClick={() => setShowNewEventModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF8F4] dark:bg-[#161A18] text-[#4B524E] dark:text-[#CBD2CE] font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B84C26] text-white font-bold"
                >
                  Guardar en Auditoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: INTEGRITY VERIFICATION MODAL (REAL, DYNAMIC, DETECTS TAMPERING) */}
      {showIntegrityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#222825] rounded-3xl p-5 sm:p-7 max-w-xl w-full border border-[#DCD6CC] dark:border-[#2E3531] shadow-2xl text-xs sm:text-sm my-8 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD5] dark:border-[#2E3531]">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    integrityReport.isValid
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {integrityReport.isValid ? (
                    <ShieldCheck className="w-5 h-5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#161A18] dark:text-white">
                    Comprobación de Integridad Local
                  </h3>
                  <p className="text-xs text-[#4B524E] dark:text-[#CBD2CE]">
                    Evaluación en tiempo real mediante regla canónica y Web Crypto / SHA-256 local
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIntegrityModal(false)}
                className="p-1.5 rounded-lg text-[#78827B] hover:text-[#161A18] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Integrity Status Result Banner */}
            {integrityReport.isValid ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Consistencia Local Verificada ({integrityReport.totalEvents} registros)</span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                  Todos los {integrityReport.totalEvents} eventos superaron la validación de campos
                  estructurales, unicidad de identificadores y correspondencia canónica de huellas
                  SHA-256.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <span>
                    Discrepancias detectadas ({integrityReport.discrepancies.length} anomalía/s)
                  </span>
                </div>
                <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed">
                  Se detectaron inconsistencias en la base de auditoría actual. La comprobación informa
                  las alteraciones encontradas a continuación:
                </p>
                <div className="space-y-1.5 mt-2 max-h-40 overflow-y-auto pr-1">
                  {integrityReport.discrepancies.map((d, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-white/90 dark:bg-[#161A18] border border-rose-300 dark:border-rose-900 text-[11px] text-rose-900 dark:text-rose-200"
                    >
                      <strong className="block font-mono">Evento: {d.eventId}</strong>
                      <span>{d.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Metrics Breakdown */}
            <div className="space-y-2 text-xs text-[#4B524E] dark:text-[#CBD2CE]">
              <div className="flex justify-between py-1 border-b border-[#E2DDD5] dark:border-[#2E3531]">
                <span>Total de eventos analizados en memoria:</span>
                <strong className="text-[#161A18] dark:text-white font-mono">{integrityReport.totalEvents}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E2DDD5] dark:border-[#2E3531]">
                <span>Discrepancias o firmas rotas:</span>
                <strong
                  className={
                    integrityReport.discrepancies.length === 0
                      ? 'text-emerald-600 dark:text-emerald-400 font-mono font-bold'
                      : 'text-rose-600 dark:text-rose-400 font-mono font-bold'
                  }
                >
                  {integrityReport.discrepancies.length}
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E2DDD5] dark:border-[#2E3531]">
                <span>Hora de ejecución del chequeo:</span>
                <strong className="text-[#161A18] dark:text-white font-mono">{integrityReport.checkedAt}</strong>
              </div>
            </div>

            {/* Explicit Rule & Canonical Fields Documentation */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F4] dark:bg-[#161A18] border border-[#DCD6CC] dark:border-[#2E3531] text-[11px] space-y-1.5">
              <span className="font-bold text-[#161A18] dark:text-white flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Regla de comprobación canónica documentada:</span>
              </span>
              <p className="text-[#4B524E] dark:text-[#CBD2CE]">
                Para cada evento se concatena una cadena con separador <code className="font-bold">|</code> incluyendo:
              </p>
              <div className="flex flex-wrap gap-1 text-[10px] font-mono text-[#78827B]">
                {integrityReport.canonicalFieldsList.map((f, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 rounded bg-white dark:bg-[#222825] border border-[#DCD6CC] dark:border-[#2E3531]"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Architectural Limitations Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs leading-relaxed space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Limitación arquitectónica y advertencia de transparencia:</span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                {integrityReport.limitationNote}
              </p>
            </div>

            {/* Live Tampering Demonstration Section (Proves the test is real) */}
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-[#161A18] dark:text-white flex items-center gap-1.5">
                  <Bug className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Simulador de detección de alteración:</span>
                </span>
                <p className="text-[11px] text-[#78827B]">
                  Permite comprobar que el algoritmo detecta modificaciones manuales reales.
                </p>
              </div>

              {!tamperedOriginalEvent ? (
                <button
                  type="button"
                  onClick={handleSimulateTampering}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer"
                >
                  Simular alteración en registro
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRestoreTamperedEvent}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 cursor-pointer"
                >
                  Restaurar registro alterado
                </button>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E2DDD5] dark:border-[#2E3531]">
              <button
                type="button"
                onClick={() => setShowIntegrityModal(false)}
                className="px-5 py-2.5 rounded-xl bg-[#161A18] dark:bg-white text-white dark:text-[#161A18] font-bold text-xs cursor-pointer shadow-xs"
              >
                Cerrar Verificación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ADMIN RESET TO DEMO DATA (HONEST, EXPLICIT CONFIRMATION) */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#222825] rounded-3xl p-5 sm:p-7 max-w-md w-full border border-[#DCD6CC] dark:border-[#2E3531] shadow-2xl text-xs sm:text-sm my-8 space-y-4 animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#161A18] dark:text-white">
                Restablecer datos de demostración
              </h3>
              <p className="text-xs text-[#4B524E] dark:text-[#CBD2CE] mt-1 leading-relaxed">
                Esta acción reemplaza los registros actuales de auditoría por los 18 eventos iniciales
                de demostración. Se descartarán todos los registros generados localmente durante la sesión.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs space-y-1">
              <strong>Aclaración sobre el alcance:</strong> No se trata de una purga por antigüedad
              ni de una eliminación criptográfica permanente de servidor. Consiste en reiniciar la lista
              en el almacenamiento local del navegador (localStorage).
            </div>

            {/* Explicit Confirmation Input */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-[#161A18] dark:text-white">
                Para confirmar, escribí la palabra <strong className="text-rose-600 font-mono">RESTABLECER</strong>:
              </label>
              <input
                type="text"
                value={resetConfirmWord}
                onChange={(e) => setResetConfirmWord(e.target.value)}
                placeholder="Escribí RESTABLECER"
                className="w-full px-3 py-2 bg-[#FAF8F4] dark:bg-[#161A18] border border-[#DCD6CC] dark:border-[#2E3531] rounded-xl font-mono text-xs text-[#161A18] dark:text-white focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2DDD5] dark:border-[#2E3531]">
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setResetConfirmWord('');
                }}
                className="px-4 py-2.5 rounded-xl bg-[#FAF8F4] dark:bg-[#161A18] text-[#4B524E] dark:text-[#CBD2CE] font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={resetConfirmWord.trim().toUpperCase() !== 'RESTABLECER'}
                onClick={handleResetToDefaultLogs}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold cursor-pointer shadow-xs transition-opacity"
              >
                Confirmar y Restablecer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
