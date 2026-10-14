export type NavigationSectionId =
  | 'dashboard'
  | 'stores'
  | 'products'
  | 'inventory'
  | 'sales'
  | 'cash-register'
  | 'customers'
  | 'current-accounts'
  | 'suppliers'
  | 'purchases'
  | 'promotions'
  | 'reports'
  | 'employees'
  | 'alerts'
  | 'marketing'
  | 'settings';

export interface NavigationItem {
  id: NavigationSectionId;
  label: string;
  iconName: string;
  badge?: string | number;
  badgeColor?: string;
  description: string;
  category: 'principal' | 'operaciones' | 'contactos' | 'gestion' | 'sistema';
}

export interface Store {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  manager: string;
  active: boolean;
  totalProducts: number;
  todaySales: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  unit: string;
  status: 'disponible' | 'bajo_stock' | 'agotado';
  storeId: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  ticketNumber: string;
  date: string;
  time: string;
  customerName: string;
  itemsCount: number;
  total: number;
  paymentMethod: 'Efectivo' | 'Tarjeta de Débito' | 'Tarjeta de Crédito' | 'Transferencia' | 'Cuenta Corriente';
  status: 'Completada' | 'Anulada' | 'Pendiente';
  cashier: string;
  storeName: string;
  items?: SaleItem[];
}

export interface CashMovement {
  id: string;
  type: 'ingreso' | 'egreso' | 'apertura' | 'cierre';
  concept: string;
  amount: number;
  time: string;
  responsible: string;
}

export interface Customer {
  id: string;
  name: string;
  document: string; // DNI o CUIT
  email: string;
  phone: string;
  address: string;
  balance: number; // deuda si es negativo / a favor si positivo
  creditLimit: number;
  category: 'Minorista' | 'Mayorista' | 'Empresa';
  status: 'Activo' | 'Moroso' | 'Suspendido';
}

export interface Supplier {
  id: string;
  name: string;
  cuit: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: string;
  debtBalance: number;
  paymentTerms: string;
}

export interface Purchase {
  id: string;
  orderNumber: string;
  supplierName: string;
  date: string;
  itemsCount: number;
  total: number;
  status: 'Recibido' | 'Pendiente' | 'En tránsito';
  paymentStatus: 'Pagado' | 'Parcial' | 'Pendiente';
}

export interface Promotion {
  id: string;
  title: string;
  type: 'Descuento %' | '2x1' | 'Precio Especial' | 'Combo';
  discountValue: string;
  targetCategory: string;
  validFrom: string;
  validUntil: string;
  active: boolean;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Encargado' | 'Cajero' | 'Vendedor';
  store: string;
  phone: string;
  status: 'Activo' | 'Inactivo';
  lastAccess: string;
}

export interface SystemAlert {
  id: string;
  title: string;
  description: string;
  type: 'stock' | 'caja' | 'cuenta_corriente' | 'sistema';
  severity: 'alta' | 'media' | 'baja';
  timestamp: string;
  isRead: boolean;
}

export interface SocialPromoPost {
  id: string;
  title: string;
  tagline: string;
  platform: 'Instagram' | 'Facebook' | 'WhatsApp' | 'TikTok';
  suggestedText: string;
  hashtags: string[];
  bannerColor: string;
}
