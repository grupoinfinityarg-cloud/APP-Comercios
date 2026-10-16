import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Phone,
  Lock,
  Key,
  Store,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit2,
  Trash2,
  UserX,
  Eye,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
  Download,
  Check,
  X,
  ArrowRight,
  Info,
  Building2,
  RefreshCw,
  History,
  FileSpreadsheet,
} from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { Employee, Store as StoreType } from '../../types';
import { DEMO_EMPLOYEES, DEMO_STORES } from '../../data/demoData';

interface EmployeesScreenProps {
  employees: Employee[];
  stores?: StoreType[];
  currentUser?: Employee;
  onUpdateEmployees?: (employees: Employee[]) => void;
  onSwitchUser?: (user: Employee) => void;
}

// System Roles definition with descriptions and security levels
export interface SystemRoleDefinition {
  id: Employee['role'];
  name: string;
  badgeColor: string;
  dotColor: string;
  level: number;
  description: string;
  suitableFor: string;
}

export const SYSTEM_ROLES: SystemRoleDefinition[] = [
  {
    id: 'Administrador',
    name: 'Administrador General',
    badgeColor: 'bg-purple-100 text-purple-900 dark:bg-purple-950/90 dark:text-purple-200 border border-purple-300 dark:border-purple-800',
    dotColor: 'bg-purple-500',
    level: 1,
    description: 'Acceso total y sin restricciones a todos los 16 módulos, configuraciones fiscales, gestión de usuarios, auditoría y balances de rentabilidad.',
    suitableFor: 'Dueños, socios, directores de operaciones y gerentes generales.',
  },
  {
    id: 'Encargado',
    name: 'Encargado de Sucursal',
    badgeColor: 'bg-blue-100 text-blue-900 dark:bg-blue-950/90 dark:text-blue-200 border border-blue-300 dark:border-blue-800',
    dotColor: 'bg-blue-500',
    level: 2,
    description: 'Supervisión de operaciones de la sucursal, control de cajas, ajustes de stock, compras a proveedores, promociones y reportes operativos.',
    suitableFor: 'Supervisores de local, jefes de piso y encargados de turno.',
  },
  {
    id: 'Cajero',
    name: 'Cajero / Operador POS',
    badgeColor: 'bg-amber-100 text-amber-900 dark:bg-amber-950/90 dark:text-amber-200 border border-amber-300 dark:border-amber-800',
    dotColor: 'bg-amber-500',
    level: 3,
    description: 'Facturación en mostrador, emisión de tickets, cobros por múltiples medios de pago, apertura/cierre de su propia caja y altas básicas de clientes.',
    suitableFor: 'Personal de línea de cajas y operadores de cobranza diaria.',
  },
  {
    id: 'Vendedor',
    name: 'Vendedor de Salón',
    badgeColor: 'bg-teal-100 text-teal-900 dark:bg-teal-950/90 dark:text-teal-200 border border-teal-300 dark:border-teal-800',
    dotColor: 'bg-teal-500',
    level: 4,
    description: 'Consulta de precios y stock en góndola, generación de preventas/pedidos para caja y consulta de promociones vigentes.',
    suitableFor: 'Asesores comerciales de salón, preventistas y promotores.',
  },
];

// RBAC Permissions Structure
interface PermissionItem {
  id: string;
  name: string;
  description: string;
  allowedRoles: Employee['role'][];
}

interface PermissionCategory {
  category: string;
  iconName: string;
  permissions: PermissionItem[];
}

export const PERMISSION_MATRIX: PermissionCategory[] = [
  {
    category: 'Ventas y Facturación (POS)',
    iconName: 'ShoppingCart',
    permissions: [
      {
        id: 'pos_create',
        name: 'Facturar y registrar ventas en mostrador',
        description: 'Emitir tickets, seleccionar productos y cobrar con cualquier método de pago.',
        allowedRoles: ['Administrador', 'Encargado', 'Cajero', 'Vendedor'],
      },
      {
        id: 'pos_discount',
        name: 'Aplicar descuentos discrecionales en ticket',
        description: 'Otorgar rebajas manuales por porcentaje o monto fijo en la venta.',
        allowedRoles: ['Administrador', 'Encargado'],
      },
      {
        id: 'pos_void',
        name: 'Anular ventas emitidas y tickets cerrados',
        description: 'Cancelar operaciones registradas y reintegrar el stock al inventario.',
        allowedRoles: ['Administrador', 'Encargado'],
      },
      {
        id: 'pos_reprint',
        name: 'Reimprimir comprobantes y comprobantes de prueba',
        description: 'Generar duplicados de tickets de venta ya impresos previamente.',
        allowedRoles: ['Administrador', 'Encargado', 'Cajero'],
      },
      {
        id: 'pos_change_price',
        name: 'Modificar precio de venta al cobrar',
        description: 'Alterar manualmente el precio unitario del artículo en línea de caja.',
        allowedRoles: ['Administrador'],
      },
    ],
  },
  {
    category: 'Caja y Control de Fondos',
    iconName: 'Receipt',
    permissions: [
      {
        id: 'cash_open_close',
        name: 'Apertura y Cierre de turno de caja',
        description: 'Declarar fondo inicial en efectivo y realizar el arqueo final de turno.',
        allowedRoles: ['Administrador', 'Encargado', 'Cajero'],
      },
      {
        id: 'cash_movements',
        name: 'Registrar ingresos y retiros de efectivo',
        description: 'Asentar pagos a proveedores menores, retiros de recaudación o aportes de cambio.',
        allowedRoles: ['Administrador', 'Encargado'],
      },
      {
        id: 'cash_blind_count',
        name: 'Arqueo ciego de valores',
        description: 'Realizar el conteo físico sin visualizar previamente el saldo esperado del sistema.',
        allowedRoles: ['Administrador', 'Encargado', 'Cajero'],
      },
      {
        id: 'cash_all_stores',
        name: 'Ver saldos consolidados de todas las sucursales',
        description: 'Visualizar el dinero total disponible entre todas las cajas activas de la red.',
        allowedRoles: ['Administrador'],
      },
    ],
  },
  {
    category: 'Inventario y Catálogo de Productos',
    iconName: 'Package',
    permissions: [
      {
        id: 'stock_view',
        name: 'Consultar catálogo de artículos y stock en góndola',
        description: 'Ver listado de productos, códigos de barras, unidades y precios de venta.',
        allowedRoles: ['Administrador', 'Encargado', 'Cajero', 'Vendedor'],
      },
      {
        id: 'stock_edit_costs',
        name: 'Visualizar precios de costo y márgenes de ganancia',
        description: 'Acceder a los costos reales de compra pactados con los proveedores.',
        allowedRoles: ['Administrador', 'Encargado'],
      },
      {
        id: 'stock_adjust',
        name: 'Efectuar ajustes manuales de stock y roturas',
        description: 'Dar de baja mercadería dañada, vencida o conciliar sobrantes de inventario.',
        allowedRoles: ['Administrador', 'Encargado'],
      },
      {
        id: 'stock_create_product',
        name: 'Crear, modificar y eliminar fichas de productos',
        description: 'Cargar nuevos artículos, actualizar precios y categorizaciones.',
        allowedRoles: ['Administrador', 'Encargado'],
      },
    ],
  },
  {
    category: 'Clientes y Cuentas Corrientes',
    iconName: 'Users',
    permissions: [
      {
        id: 'cust_view',
        name: 'Consultar directorio de clientes y saldos',
        description: 'Buscar clientes por DNI/CUIT o nombre y chequear datos de contacto.',
        allowedRoles: ['Administrador', 'Encargado', 'Cajero', 'Vendedor'],
      },
      {
        id: 'cust_create',
        name: 'Dar de alta y editar datos de clientes',
        description: 'Registrar nuevos clientes en el sistema durante la atención comercial.',
        allowedRoles: ['Administrador', 'Encargado', 'Cajero'],
      },
      {
        id: 'cust_credit_sale',
        name: 'Autorizar ventas en cuenta corriente / fiado',
        description: 'Cargar ventas a pagar a plazo dentro del límite asignado al cliente.',
        allowedRoles: ['Administrador', 'Encargado'],
      },
      {
        id: 'cust_change_limit',
        name: 'Modificar límite de crédito de cuenta corriente',
        description: 'Ampliar o restringir el cupo de deuda autorizado para cada cliente.',
        allowedRoles: ['Administrador'],
      },
    ],
  },
  {
    category: 'Proveedores y Compras',
    iconName: 'ShoppingBag',
    permissions: [
      {
        id: 'supp_view',
        name: 'Consultar directorio de proveedores',
        description: 'Ver datos de contacto de distribuidores y condiciones pactadas.',
        allowedRoles: ['Administrador', 'Encargado'],
      },
      {
        id: 'supp_create_order',
        name: 'Emitir y autorizar órdenes de compra',
        description: 'Generar pedidos de mercadería y autorizar recepciones de stock.',
        allowedRoles: ['Administrador', 'Encargado'],
      },
      {
        id: 'supp_payments',
        name: 'Registrar pagos y liquidaciones a proveedores',
        description: 'Imputar pagos bancarios o en efectivo contra facturas de compra.',
        allowedRoles: ['Administrador'],
      },
    ],
  },
  {
    category: 'Informes, Estadísticas y Auditoría',
    iconName: 'BarChart3',
    permissions: [
      {
        id: 'rep_daily_sales',
        name: 'Ver resumen de ventas del turno propio',
        description: 'Comprobar el total facturado durante la jornada de trabajo actual.',
        allowedRoles: ['Administrador', 'Encargado', 'Cajero'],
      },
      {
        id: 'rep_full_analytics',
        name: 'Ver rentabilidad global, márgenes y estadísticas',
        description: 'Acceder a reportes mensuales de ganancias, comparativas y ticket promedio.',
        allowedRoles: ['Administrador'],
      },
      {
        id: 'rep_export',
        name: 'Exportar planillas y datos del negocio a CSV/Excel',
        description: 'Descargar listados de productos, ventas y balances financieros.',
        allowedRoles: ['Administrador', 'Encargado'],
      },
    ],
  },
  {
    category: 'Administración, Usuarios y Parámetros',
    iconName: 'Shield',
    permissions: [
      {
        id: 'admin_users_view',
        name: 'Ver nómina de colaboradores y roles',
        description: 'Acceder al módulo de empleados y comprobar asignaciones de sucursal.',
        allowedRoles: ['Administrador', 'Encargado'],
      },
      {
        id: 'admin_users_manage',
        name: 'Crear, editar, activar y desactivar usuarios',
        description: 'Crear credenciales, asignar roles y gestionar estados de colaboradores.',
        allowedRoles: ['Administrador'],
      },
      {
        id: 'admin_security_pin',
        name: 'Restablecer contraseñas y PINs de seguridad',
        description: 'Cambiar claves de acceso y PINs de caja del personal.',
        allowedRoles: ['Administrador'],
      },
      {
        id: 'admin_company_settings',
        name: 'Configurar datos fiscales, CUIT e impresoras',
        description: 'Modificar parámetros tributarios y de facturación fiscal de la empresa.',
        allowedRoles: ['Administrador'],
      },
    ],
  },
];

// Demo Audit Log Events
interface AuditEvent {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  category: 'auth' | 'security' | 'operation';
  status: 'exitoso' | 'advertencia' | 'bloqueado';
  details: string;
}

const INITIAL_AUDIT_LOG: AuditEvent[] = [
  {
    id: 'aud-1',
    timestamp: 'Hoy, 10:55',
    userName: 'Martín Gómez',
    userRole: 'Administrador',
    action: 'Inicio de sesión exitoso',
    category: 'auth',
    status: 'exitoso',
    details: 'Acceso autenticado desde Sucursal Central (IP 192.168.1.15).',
  },
  {
    id: 'aud-2',
    timestamp: 'Hoy, 10:48',
    userName: 'Santiago Pérez',
    userRole: 'Cajero',
    action: 'Apertura de turno de caja',
    category: 'operation',
    status: 'exitoso',
    details: 'Caja 01 abierta con fondo inicial de $15.000 (Sucursal Central).',
  },
  {
    id: 'aud-3',
    timestamp: 'Hoy, 09:30',
    userName: 'Valeria Rossi',
    userRole: 'Encargado',
    action: 'Recepción de mercadería registrada',
    category: 'operation',
    status: 'exitoso',
    details: 'Orden de compra #OC-1042 ingresada a stock en Sucursal Norte.',
  },
  {
    id: 'aud-4',
    timestamp: 'Hoy, 08:45',
    userName: 'Santiago Pérez',
    userRole: 'Cajero',
    action: 'Intento de anulación de ticket bloqueado',
    category: 'security',
    status: 'bloqueado',
    details: 'Permiso restringido para rol Cajero. Requiere clave de Encargado o Admin.',
  },
  {
    id: 'aud-5',
    timestamp: 'Ayer, 18:20',
    userName: 'Camila Benítez',
    userRole: 'Cajero',
    action: 'Cierre de turno y arqueo de caja',
    category: 'operation',
    status: 'exitoso',
    details: 'Arqueo conciliado sin diferencias en Sucursal Norte ($142.300 recaudados).',
  },
  {
    id: 'aud-6',
    timestamp: '12/10/2026, 14:10',
    userName: 'Martín Gómez',
    userRole: 'Administrador',
    action: 'Alta de usuario nuevo en el sistema',
    category: 'security',
    status: 'exitoso',
    details: 'Creación de credencial para Luciano Ferreyra (Depósito & Logística).',
  },
];

export const EmployeesScreen: React.FC<EmployeesScreenProps> = ({
  employees: initialEmployees,
  stores = DEMO_STORES,
  currentUser,
  onUpdateEmployees,
  onSwitchUser,
}) => {
  // Local staff state with session updates
  const [employees, setEmployees] = useState<Employee[]>(() => {
    return initialEmployees && initialEmployees.length > 0 ? initialEmployees : DEMO_EMPLOYEES;
  });

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<'Todos' | 'Activos' | 'Inactivos'>('Todos');
  const [selectedStore, setSelectedStore] = useState<string>('Todas');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [matrixSelectedRole, setMatrixSelectedRole] = useState<Employee['role']>('Administrador');
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [confirmToggleEmployee, setConfirmToggleEmployee] = useState<Employee | null>(null);
  const [confirmDeleteEmployee, setConfirmDeleteEmployee] = useState<Employee | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Synchronize state changes to parent if provided
  const updateStaffList = (updated: Employee[]) => {
    setEmployees(updated);
    if (onUpdateEmployees) {
      onUpdateEmployees(updated);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    role: 'Cajero' as Employee['role'],
    store: stores[0]?.name || 'Sucursal Central',
    pin: '1234',
    status: 'Activo' as 'Activo' | 'Inactivo',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Reset or prepare form
  const handleOpenCreateModal = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      phone: '+54 11 ',
      role: 'Cajero',
      store: stores[0]?.name || 'Sucursal Central',
      pin: String(Math.floor(1000 + Math.random() * 9000)),
      status: 'Activo',
      notes: '',
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      username: emp.username || emp.email.split('@')[0],
      email: emp.email,
      phone: emp.phone,
      role: emp.role,
      store: emp.store,
      pin: emp.pin || '1234',
      status: emp.status,
      notes: emp.notes || '',
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  // Form Validation & Submit
  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    const cleanName = formData.name.trim();
    const cleanUsername = formData.username.trim().toLowerCase().replace(/\s+/g, '');
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPin = formData.pin.trim();

    if (!cleanName || cleanName.length < 3) {
      errors.name = 'El nombre completo debe tener al menos 3 caracteres.';
    }

    if (!cleanUsername || cleanUsername.length < 3) {
      errors.username = 'El nombre de usuario es obligatorio (mínimo 3 caracteres alfanuméricos).';
    } else {
      // Check duplicate username among OTHER employees
      const duplicateUser = employees.find(
        (emp) =>
          emp.id !== editingEmployee?.id &&
          (emp.username?.toLowerCase() === cleanUsername || emp.email.split('@')[0].toLowerCase() === cleanUsername)
      );
      if (duplicateUser) {
        errors.username = `El usuario "${cleanUsername}" ya existe (${duplicateUser.name}). Elija otro.`;
      }
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      errors.email = 'Ingrese un correo electrónico válido.';
    } else {
      const duplicateEmail = employees.find(
        (emp) => emp.id !== editingEmployee?.id && emp.email.toLowerCase() === cleanEmail
      );
      if (duplicateEmail) {
        errors.email = `El correo "${cleanEmail}" ya está registrado por ${duplicateEmail.name}.`;
      }
    }

    if (!cleanPin || cleanPin.length !== 4 || isNaN(Number(cleanPin))) {
      errors.pin = 'El PIN de seguridad de caja debe ser numérico de exactamente 4 dígitos (ej: 4892).';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingEmployee) {
      // Update existing
      const updatedList = employees.map((emp) =>
        emp.id === editingEmployee.id
          ? {
              ...emp,
              name: cleanName,
              username: cleanUsername,
              email: cleanEmail,
              phone: formData.phone.trim() || emp.phone,
              role: formData.role,
              store: formData.store,
              pin: cleanPin,
              status: formData.status,
              notes: formData.notes.trim(),
            }
          : emp
      );
      updateStaffList(updatedList);
      showToast(`Colaborador ${cleanName} actualizado correctamente.`, 'success');
    } else {
      // Create new
      const newEmployee: Employee = {
        id: `emp-${Date.now()}`,
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        phone: formData.phone.trim() || '+54 11 0000-0000',
        role: formData.role,
        store: formData.store,
        status: formData.status,
        lastAccess: 'Pendiente primer ingreso',
        createdAt: new Date().toISOString().split('T')[0],
        pin: cleanPin,
        notes: formData.notes.trim() || 'Nuevo colaborador registrado en el sistema.',
      };
      updateStaffList([newEmployee, ...employees]);
      showToast(`¡Usuario ${cleanName} registrado con éxito!`, 'success');
    }

    setShowFormModal(false);
  };

  // Toggle Active / Inactive Status with Safety checks
  const handleToggleStatus = (emp: Employee) => {
    // Check if user is current active session
    if (currentUser && currentUser.id === emp.id && emp.status === 'Activo') {
      showToast('No puedes desactivar tu propia cuenta activa de sesión.', 'warning');
      setConfirmToggleEmployee(null);
      return;
    }

    // Check if it is the only administrator
    if (emp.role === 'Administrador' && emp.status === 'Activo') {
      const activeAdmins = employees.filter((e) => e.role === 'Administrador' && e.status === 'Activo');
      if (activeAdmins.length <= 1) {
        showToast('Debe haber al menos un Administrador activo en el comercio.', 'warning');
        setConfirmToggleEmployee(null);
        return;
      }
    }

    const newStatus: 'Activo' | 'Inactivo' = emp.status === 'Activo' ? 'Inactivo' : 'Activo';
    const updatedList = employees.map((e) => (e.id === emp.id ? { ...e, status: newStatus } : e));
    updateStaffList(updatedList);
    showToast(
      `Usuario ${emp.name} ha sido ${newStatus === 'Activo' ? 'reactivado' : 'desactivado'}.`,
      newStatus === 'Activo' ? 'success' : 'info'
    );
    setConfirmToggleEmployee(null);
  };

  // Delete User with safety validations
  const handleDeleteEmployee = (emp: Employee) => {
    if (currentUser && currentUser.id === emp.id) {
      showToast('No puedes eliminar la cuenta con la que has iniciado sesión.', 'warning');
      setConfirmDeleteEmployee(null);
      return;
    }

    if (emp.role === 'Administrador') {
      const totalAdmins = employees.filter((e) => e.role === 'Administrador');
      if (totalAdmins.length <= 1) {
        showToast('No puedes eliminar al único Administrador del comercio.', 'warning');
        setConfirmDeleteEmployee(null);
        return;
      }
    }

    const updatedList = employees.filter((e) => e.id !== emp.id);
    updateStaffList(updatedList);
    showToast(`Usuario ${emp.name} eliminado de la nómina.`, 'info');
    setConfirmDeleteEmployee(null);
    if (detailEmployee?.id === emp.id) {
      setDetailEmployee(null);
    }
  };

  // Switch Active User (Impersonation / Test Flow)
  const handleImpersonateUser = (emp: Employee) => {
    if (emp.status === 'Inactivo') {
      showToast(`No es posible iniciar sesión con un usuario inactivo (${emp.name}).`, 'warning');
      return;
    }
    if (onSwitchUser) {
      onSwitchUser(emp);
      showToast(`Sesión cambiada a: ${emp.name} (${emp.role})`, 'success');
    }
  };

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Search matches name, username, email, phone, or store
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        emp.name.toLowerCase().includes(query) ||
        (emp.username && emp.username.toLowerCase().includes(query)) ||
        emp.email.toLowerCase().includes(query) ||
        emp.phone.toLowerCase().includes(query) ||
        emp.store.toLowerCase().includes(query);

      // Role filter
      const matchesRole = selectedRole === 'Todos' || emp.role === selectedRole;

      // Status filter
      const matchesStatus =
        selectedStatus === 'Todos' ||
        (selectedStatus === 'Activos' && emp.status === 'Activo') ||
        (selectedStatus === 'Inactivos' && emp.status === 'Inactivo');

      // Store filter
      const matchesStore = selectedStore === 'Todas' || emp.store === selectedStore;

      return matchesSearch && matchesRole && matchesStatus && matchesStore;
    });
  }, [employees, searchTerm, selectedRole, selectedStatus, selectedStore]);

  // Statistics & KPI calculations
  const totalEmployeesCount = employees.length;
  const activeEmployeesCount = employees.filter((e) => e.status === 'Activo').length;
  const inactiveEmployeesCount = employees.filter((e) => e.status === 'Inactivo').length;
  const adminsCount = employees.filter((e) => e.role === 'Administrador' && e.status === 'Activo').length;
  const supervisorsCount = employees.filter((e) => e.role === 'Encargado' && e.status === 'Activo').length;
  const cashiersCount = employees.filter((e) => e.role === 'Cajero' && e.status === 'Activo').length;
  const sellersCount = employees.filter((e) => e.role === 'Vendedor' && e.status === 'Activo').length;

  // Export CSV of employees
  const handleExportCSV = () => {
    const headers = ['ID', 'Nombre Completo', 'Usuario', 'Email', 'Rol', 'Sucursal', 'Teléfono', 'Estado', 'Último Acceso'];
    const rows = employees.map((emp) => [
      emp.id,
      `"${emp.name}"`,
      `"${emp.username || emp.email.split('@')[0]}"`,
      `"${emp.email}"`,
      `"${emp.role}"`,
      `"${emp.store}"`,
      `"${emp.phone}"`,
      `"${emp.status}"`,
      `"${emp.lastAccess}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `colaboradores_comercios360_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Planilla de colaboradores descargada en formato CSV.', 'success');
  };

  // Helper for role styling
  const getRoleBadge = (role: Employee['role']) => {
    switch (role) {
      case 'Administrador':
        return 'bg-purple-100 text-purple-900 dark:bg-purple-950/90 dark:text-purple-200 border border-purple-300 dark:border-purple-800';
      case 'Encargado':
        return 'bg-blue-100 text-blue-900 dark:bg-blue-950/90 dark:text-blue-200 border border-blue-300 dark:border-blue-800';
      case 'Cajero':
        return 'bg-amber-100 text-amber-900 dark:bg-amber-950/90 dark:text-amber-200 border border-amber-300 dark:border-amber-800';
      case 'Vendedor':
        return 'bg-teal-100 text-teal-900 dark:bg-teal-950/90 dark:text-teal-200 border border-teal-300 dark:border-teal-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
    }
  };

  const getRoleAvatarColor = (role: Employee['role']) => {
    switch (role) {
      case 'Administrador':
        return 'bg-purple-600 text-white';
      case 'Encargado':
        return 'bg-blue-600 text-white';
      case 'Cajero':
        return 'bg-amber-600 text-white';
      case 'Vendedor':
        return 'bg-teal-600 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-xs sm:text-sm font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-100 border-emerald-300 dark:border-emerald-700'
                : toastMessage.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/90 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-700'
                : 'bg-blue-50 dark:bg-blue-950/90 text-blue-900 dark:text-blue-100 border-blue-300 dark:border-blue-700'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {toastMessage.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
            {toastMessage.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
            <span className="flex-1">{toastMessage.text}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="p-1 hover:bg-black/10 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Demo Notice Banner */}
      <DemoNotice
        title="Módulo 11: Usuarios, Roles y Permisos (RBAC)"
        description="Gestión integral de colaboradores comerciales, asignación de roles jerárquicos (Administrador, Encargado, Cajero, Vendedor), credenciales de caja y control granular de permisos por sucursal."
      />

      {/* Screen Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Usuarios y Permisos
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C85A32]/10 dark:bg-[#C85A32]/25 text-[#B84C26] dark:text-[#FFA07A] border border-[#C85A32]/20 dark:border-[#C85A32]/40">
              {activeEmployeesCount} Colaboradores Activos
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Control de accesos al sistema, seguridad de caja por PIN y matriz de permisos por perfil
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowAuditModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs transition-all cursor-pointer min-h-[42px]"
          >
            <History className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Auditoría</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPermissionsModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs transition-all cursor-pointer min-h-[42px]"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Matriz de Permisos</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs transition-all cursor-pointer min-h-[42px]"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Exportar</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C85A32] hover:bg-[#B84C26] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer min-h-[42px]"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Colaborador</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Users */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Nómina</span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalEmployeesCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>{activeEmployeesCount} activos</span>
            <span>·</span>
            <span className="text-slate-400">{inactiveEmployeesCount} pausados</span>
          </div>
        </div>

        {/* Roles Distribution */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Perfiles de Seguridad</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            4 Roles
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 truncate">
            {adminsCount} Admin · {supervisorsCount} Enc · {cashiersCount} Caj · {sellersCount} Vend
          </div>
        </div>

        {/* Stores Coverage */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sucursales Asignadas</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stores.length} Locales
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Personal distribuido en puntos de venta
          </div>
        </div>

        {/* Current Active Session User */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tu Sesión Actual</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
            {currentUser?.name || 'Martín Gómez'}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 truncate">
            <span className="font-semibold text-purple-700 dark:text-purple-300">
              {currentUser?.role || 'Administrador'}
            </span>
            <span>·</span>
            <span className="truncate">{currentUser?.store || 'Sucursal Central'}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, usuario (@mgomez), email, teléfono o sucursal..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C85A32] dark:focus:ring-[#FFA07A]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Store Selector */}
          <div className="min-w-[170px]">
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              aria-label="Filtrar por sucursal"
              className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
            >
              <option value="Todas">Todas las sucursales</option>
              {stores.map((st) => (
                <option key={st.id} value={st.name}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div className="min-w-[130px]">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              aria-label="Filtrar por estado del usuario"
              className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Activos">Solo Activos</option>
              <option value="Inactivos">Solo Inactivos</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              title="Vista en tarjetas"
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Vista en tabla"
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Roles Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1 shrink-0">
            Rol:
          </span>
          {['Todos', 'Administrador', 'Encargado', 'Cajero', 'Vendedor'].map((role) => {
            const count =
              role === 'Todos' ? employees.length : employees.filter((e) => e.role === role).length;
            const isSelected = selectedRole === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{role}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white dark:bg-black/10 dark:text-slate-900'
                      : 'bg-slate-200 dark:bg-slate-750 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Staff Content: Cards or Table */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-12 text-center shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700/60 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3">
            <UserX className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No se encontraron colaboradores
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
            No hay ningún colaborador registrado que coincida con los filtros seleccionados o el término de búsqueda.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedRole('Todos');
                setSelectedStatus('Todos');
                setSelectedStore('Todas');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              Limpiar Filtros
            </button>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-[#C85A32] hover:bg-[#B84C26] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              Crear Nuevo Usuario
            </button>
          </div>
        </div>
      ) : viewMode === 'cards' ? (
        /* Grid of User Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => {
            const isCurrentUser = currentUser?.id === emp.id;
            const initials = emp.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <div
                key={emp.id}
                className={`bg-white dark:bg-slate-800/90 rounded-2xl border p-5 shadow-2xs flex flex-col justify-between transition-all relative ${
                  isCurrentUser
                    ? 'border-[#C85A32] ring-2 ring-[#C85A32]/20 dark:ring-[#C85A32]/30'
                    : emp.status === 'Inactivo'
                    ? 'border-slate-200 dark:border-slate-700/60 opacity-80 bg-slate-50/50 dark:bg-slate-850/50'
                    : 'border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {/* Current User Pill Ribbon */}
                {isCurrentUser && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-[#C85A32] text-white px-2 py-0.5 rounded-full shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Tu Sesión
                    </span>
                  </div>
                )}

                <div>
                  {/* Card Header: Avatar & Name */}
                  <div className="flex items-start gap-3.5 mb-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shrink-0 shadow-sm ${getRoleAvatarColor(
                        emp.role
                      )}`}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1 pr-6">
                      <div className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight truncate">
                        {emp.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                        <span>@{emp.username || emp.email.split('@')[0]}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${getRoleBadge(emp.role)}`}>
                          {emp.role}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            emp.status === 'Activo'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {emp.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Metadata list */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700/60 pt-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {emp.store}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-600 dark:text-slate-300">{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{emp.phone}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Key className="w-3 h-3 text-slate-400" />
                        PIN: {emp.pin ? '••••' : 'No config.'}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {emp.lastAccess}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="border-t border-slate-100 dark:border-slate-700/60 pt-3 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDetailEmployee(emp)}
                      title="Ver permisos y ficha"
                      className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(emp)}
                      title="Editar datos"
                      className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmToggleEmployee(emp)}
                      title={emp.status === 'Activo' ? 'Desactivar usuario' : 'Reactivar usuario'}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        emp.status === 'Activo'
                          ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                          : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                      }`}
                    >
                      {emp.status === 'Activo' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Switch Session Button (Quick Tester) */}
                  {!isCurrentUser && emp.status === 'Activo' && onSwitchUser && (
                    <button
                      type="button"
                      onClick={() => handleImpersonateUser(emp)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      <Key className="w-3 h-3 text-[#C85A32]" />
                      <span>Probar Rol</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Table View */
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700 font-bold">
                <tr>
                  <th className="py-3.5 px-4">Colaborador / Usuario</th>
                  <th className="py-3.5 px-3">Rol / Nivel</th>
                  <th className="py-3.5 px-3">Sucursal Asignada</th>
                  <th className="py-3.5 px-3">Contacto</th>
                  <th className="py-3.5 px-3">PIN Caja</th>
                  <th className="py-3.5 px-3">Último Acceso</th>
                  <th className="py-3.5 px-3 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredEmployees.map((emp) => {
                  const isCurrentUser = currentUser?.id === emp.id;
                  const initials = emp.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr
                      key={emp.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors ${
                        isCurrentUser ? 'bg-orange-50/40 dark:bg-orange-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${getRoleAvatarColor(
                              emp.role
                            )}`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{emp.name}</span>
                              {isCurrentUser && (
                                <span className="text-[10px] font-black uppercase text-[#C85A32] bg-[#C85A32]/10 dark:bg-[#C85A32]/25 px-1.5 py-0.2 rounded">
                                  Tú
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              @{emp.username || emp.email.split('@')[0]} · {emp.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${getRoleBadge(emp.role)}`}>
                          {emp.role}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-700 dark:text-slate-200 font-medium">
                        {emp.store}
                      </td>

                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {emp.phone}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px] bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded">
                          {emp.pin ? '••••' : '—'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {emp.lastAccess}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            emp.status === 'Activo'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setDetailEmployee(emp)}
                            title="Ver ficha y permisos"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(emp)}
                            title="Editar datos"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmToggleEmployee(emp)}
                            title={emp.status === 'Activo' ? 'Desactivar' : 'Activar'}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                          >
                            {emp.status === 'Activo' ? (
                              <UserX className="w-4 h-4 text-amber-600" />
                            ) : (
                              <UserCheck className="w-4 h-4 text-emerald-600" />
                            )}
                          </button>
                          {!isCurrentUser && emp.status === 'Activo' && onSwitchUser && (
                            <button
                              type="button"
                              onClick={() => handleImpersonateUser(emp)}
                              title="Iniciar sesión como este usuario"
                              className="p-1.5 rounded-lg text-[#C85A32] hover:bg-orange-50 dark:hover:bg-orange-950/40 cursor-pointer font-bold"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                          )}
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

      {/* MODAL: CREATE / EDIT EMPLOYEE */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-xs sm:text-sm my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {editingEmployee ? 'Editar Colaborador' : 'Registrar Nuevo Colaborador'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {editingEmployee
                    ? `Modificando credenciales y perfil de ${editingEmployee.name}`
                    : 'Crea credenciales de acceso seguras para el personal del comercio'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="mt-5 space-y-4">
              {/* Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Nombre y Apellido <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        name: newName,
                        // Auto suggest username if creating new
                        username:
                          !editingEmployee && !prev.username
                            ? newName.toLowerCase().replace(/\s+/g, '').slice(0, 12)
                            : prev.username,
                      }));
                      if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: '' }));
                    }}
                    placeholder="Ej: Florencia Morales"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                  />
                  {formErrors.name && (
                    <p className="text-rose-600 text-[11px] font-semibold mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Nombre de Usuario <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">@</span>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => {
                        setFormData({ ...formData, username: e.target.value });
                        if (formErrors.username) setFormErrors((prev) => ({ ...prev, username: '' }));
                      }}
                      placeholder="fmorales"
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                    />
                  </div>
                  {formErrors.username && (
                    <p className="text-rose-600 text-[11px] font-semibold mt-1">{formErrors.username}</p>
                  )}
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Correo Electrónico <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    placeholder="florencia@comercios360.demo"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                  />
                  {formErrors.email && (
                    <p className="text-rose-600 text-[11px] font-semibold mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Teléfono Celular / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+54 11 4821-9988"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                  />
                </div>
              </div>

              {/* Role & Store */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Rol y Nivel de Acceso <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                  >
                    <option value="Administrador">Administrador (Acceso total)</option>
                    <option value="Encargado">Encargado (Supervisión y compras)</option>
                    <option value="Cajero">Cajero (Cobros y ventas POS)</option>
                    <option value="Vendedor">Vendedor (Salón y preventas)</option>
                  </select>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {SYSTEM_ROLES.find((r) => r.id === formData.role)?.description}
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Sucursal Asignada <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.store}
                    onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                  >
                    {stores.map((st) => (
                      <option key={st.id} value={st.name}>
                        {st.name} ({st.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Security PIN & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    PIN de Seguridad para Caja (4 dígitos) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      maxLength={4}
                      value={formData.pin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setFormData({ ...formData, pin: val });
                        if (formErrors.pin) setFormErrors((prev) => ({ ...prev, pin: '' }));
                      }}
                      placeholder="1234"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono tracking-widest text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                    />
                  </div>
                  {formErrors.pin ? (
                    <p className="text-rose-600 text-[11px] font-semibold mt-1">{formErrors.pin}</p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Utilizado para autorizar cobros y apertura rápida en la terminal POS.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Estado de la Cuenta
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                  >
                    <option value="Activo">Activo (Habilitado para operar)</option>
                    <option value="Inactivo">Inactivo (Acceso suspendido)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Notas u Observaciones Internas
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ej: Turno mañana. Autorizado para recibir proveedores de lácteos y panadería."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                />
              </div>

              {/* Live Preview Card */}
              <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Vista Previa de la Credencial
                </span>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${getRoleAvatarColor(
                      formData.role
                    )}`}
                  >
                    {(formData.name.trim() || 'Nuevo Colaborador')
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase() || 'NC'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {formData.name.trim() || 'Nombre del Colaborador'}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      @{formData.username.trim() || 'usuario'} · {formData.store}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRoleBadge(formData.role)}`}>
                      {formData.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B84C26] text-white font-bold shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingEmployee ? 'Guardar Cambios' : 'Registrar Colaborador'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PERMISSIONS MATRIX (RBAC) */}
      {showPermissionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-xs sm:text-sm my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Matriz de Roles y Permisos (RBAC)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Definición de capacidades operativas y niveles de seguridad de COMERCIOS 360
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPermissionsModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Role Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-5">
              {SYSTEM_ROLES.map((r) => {
                const isSelected = matrixSelectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setMatrixSelectedRole(r.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${r.dotColor}`} />
                      <span className="text-[10px] font-bold text-slate-400">Nivel {r.level}</span>
                    </div>
                    <div className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {r.name}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Role Summary Banner */}
            {(() => {
              const currentRoleDef = SYSTEM_ROLES.find((r) => r.id === matrixSelectedRole)!;
              return (
                <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 mb-5 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2.5 py-0.5 rounded-md font-bold ${currentRoleDef.badgeColor}`}>
                      {currentRoleDef.name}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      — {currentRoleDef.suitableFor}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {currentRoleDef.description}
                  </p>
                </div>
              );
            })()}

            {/* Permissions Matrix by Category */}
            <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-1">
              {PERMISSION_MATRIX.map((cat, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"
                >
                  <div className="bg-slate-100/80 dark:bg-slate-800/80 px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center justify-between">
                    <span>{cat.category}</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      {cat.permissions.filter((p) => p.allowedRoles.includes(matrixSelectedRole)).length} de{' '}
                      {cat.permissions.length} permitidos
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {cat.permissions.map((perm) => {
                      const isAllowed = perm.allowedRoles.includes(matrixSelectedRole);
                      return (
                        <div
                          key={perm.id}
                          className={`p-3.5 flex items-start gap-3 transition-colors ${
                            isAllowed
                              ? 'bg-white dark:bg-slate-900'
                              : 'bg-slate-50/50 dark:bg-slate-950/40 opacity-70'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isAllowed
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {isAllowed ? <Check className="w-3.5 h-3.5 font-bold" /> : <Lock className="w-3.5 h-3.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`font-bold text-xs sm:text-sm ${
                                  isAllowed
                                    ? 'text-slate-900 dark:text-white'
                                    : 'text-slate-500 dark:text-slate-400 line-through'
                                }`}
                              >
                                {perm.name}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                                  isAllowed
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                                }`}
                              >
                                {isAllowed ? 'Habilitado' : 'Restringido'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {perm.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">
                Los permisos se aplican automáticamente según el rol asignado a cada colaborador.
              </span>
              <button
                type="button"
                onClick={() => setShowPermissionsModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs cursor-pointer"
              >
                Cerrar Matriz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: USER DETAIL & PROFILE */}
      {detailEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-xs sm:text-sm my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Ficha del Colaborador
              </h3>
              <button
                type="button"
                onClick={() => setDetailEmployee(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-5">
              {/* Profile Card Header */}
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${getRoleAvatarColor(
                    detailEmployee.role
                  )}`}
                >
                  {detailEmployee.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {detailEmployee.name}
                  </h4>
                  <div className="text-xs text-slate-500 font-mono">
                    @{detailEmployee.username || detailEmployee.email.split('@')[0]}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${getRoleBadge(detailEmployee.role)}`}>
                      {detailEmployee.role}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        detailEmployee.status === 'Activo'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {detailEmployee.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">Sucursal Asignada</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{detailEmployee.store}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">PIN de Caja POS</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {detailEmployee.pin ? `Configurado (${detailEmployee.pin})` : 'Sin asignar'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">Correo Electrónico</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                    {detailEmployee.email}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">Teléfono</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{detailEmployee.phone}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">Fecha de Alta</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {detailEmployee.createdAt || 'Enero 2026'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">Último Ingreso</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{detailEmployee.lastAccess}</span>
                </div>
              </div>

              {/* Internal Notes */}
              {detailEmployee.notes && (
                <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/40 text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-200 block mb-0.5">
                    Observaciones:
                  </span>
                  <p className="text-amber-800 dark:text-amber-300">{detailEmployee.notes}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const emp = detailEmployee;
                    setDetailEmployee(null);
                    setConfirmDeleteEmployee(emp);
                  }}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold cursor-pointer"
                >
                  Eliminar
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const emp = detailEmployee;
                      setDetailEmployee(null);
                      handleOpenEditModal(emp);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
                  >
                    Editar
                  </button>
                  {detailEmployee.status === 'Activo' && onSwitchUser && currentUser?.id !== detailEmployee.id && (
                    <button
                      type="button"
                      onClick={() => {
                        handleImpersonateUser(detailEmployee);
                        setDetailEmployee(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#C85A32] hover:bg-[#B84C26] text-white font-bold cursor-pointer"
                    >
                      Probar Sesión
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM DEACTIVATION */}
      {confirmToggleEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-xs sm:text-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-2">
              {confirmToggleEmployee.status === 'Activo'
                ? `¿Desactivar acceso de ${confirmToggleEmployee.name}?`
                : `¿Reactivar acceso de ${confirmToggleEmployee.name}?`}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
              {confirmToggleEmployee.status === 'Activo'
                ? `El colaborador no podrá iniciar sesión en COMERCIOS 360 ni operar la terminal POS hasta que vuelva a ser activado.`
                : `El colaborador recuperará inmediatamente el acceso al sistema con su rol de ${confirmToggleEmployee.role}.`}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmToggleEmployee(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleToggleStatus(confirmToggleEmployee)}
                className={`px-5 py-2.5 rounded-xl font-bold text-white cursor-pointer ${
                  confirmToggleEmployee.status === 'Activo'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {confirmToggleEmployee.status === 'Activo' ? 'Sí, Desactivar' : 'Sí, Reactivar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM DELETION */}
      {confirmDeleteEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-xs sm:text-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-2">
              ¿Eliminar usuario de la nómina?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente a{' '}
              <strong className="text-slate-900 dark:text-white">{confirmDeleteEmployee.name}</strong>? Se
              revocarán todas sus credenciales y accesos.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteEmployee(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteEmployee(confirmDeleteEmployee)}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer"
              >
                Eliminar Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AUDIT LOG */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-xs sm:text-sm my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Historial de Seguridad y Accesos
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Registro de auditoría de inicios de sesión y operaciones sensibles
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              {INITIAL_AUDIT_LOG.map((event) => (
                <div
                  key={event.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-start gap-3"
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      event.status === 'exitoso'
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                        : event.status === 'bloqueado'
                        ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                        : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {event.status === 'exitoso' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : event.status === 'bloqueado' ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-0.5">
                      <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {event.action}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{event.timestamp}</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {event.userName}
                      </span>{' '}
                      ({event.userRole})
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {event.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs cursor-pointer"
              >
                Cerrar Auditoría
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
