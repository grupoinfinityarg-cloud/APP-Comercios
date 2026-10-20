import {
  CommercialEdition,
  CommercialEditionTier,
  NavigationSectionId,
} from '../types';

/**
 * Catálogo central de ediciones comerciales de COMERCIOS 360.
 *
 * Define formalmente las capacidades, módulos autorizados y límites de cada nivel (tier)
 * para permitir la adaptación progresiva de la interfaz sin duplicar pantallas ni alterar
 * la persistencia ni la inmutabilidad de la cadena de auditoría SHA-256.
 *
 * Caso de uso testigo: Comercio de Dietética y Alimento Balanceado para Mascotas.
 */

export const COMMERCIAL_EDITIONS: CommercialEdition[] = [
  {
    id: 'demo',
    name: 'Edición Demostración',
    badgeLabel: 'DEMO',
    shortDescription: 'Evaluación libre de todos los módulos con datos de ejemplo y operaciones simuladas.',
    fullDescription:
      'Diseñada para que el comerciante explore libremente la totalidad de las herramientas de COMERCIOS 360. Permite navegar los 17 módulos con datos demostrativos precargados, sin vencimiento forzado de sesión ni cobros ocultos.',
    iconName: 'Sparkles',
    allowedSections: [
      'dashboard',
      'stores',
      'products',
      'inventory',
      'sales',
      'cash-register',
      'customers',
      'current-accounts',
      'suppliers',
      'purchases',
      'promotions',
      'reports',
      'employees',
      'alerts',
      'marketing',
      'settings',
      'audit-log',
    ],
    limits: {
      maxStores: 3,
      maxTerminalsPerStore: 3,
      allowsMultiStore: true,
      allowsCurrentAccounts: true,
      allowsPromotions: true,
      allowsConfigurableRoles: true,
      allowsMarketingGenerator: true,
      allowsAdvancedReports: true,
      allowsAuditLogViewer: true,
    },
    features: [
      'Navegación demostrativa por los 17 módulos del sistema',
      'Catálogo de prueba con alimentos balanceados, semillas y productos dietéticos',
      'Comprobación de ventas POS con simulación de tickets y vuelto',
      'Apertura y cierre de caja con arqueo ciego simulado',
      'Visualizador de integridad criptográfica SHA-256 con eventos demo',
      'Sin vencimiento de tiempo ni bloqueo de navegación',
    ],
    dieteticaCaseNotes: [
      'Permite probar la venta rápida de bolsas cerradas (15kg/20kg) y productos fraccionados por kg.',
      'Muestra cómo interactúan las alertas de stock bajo en alimentos para perros/gatos con las fechas de envasado.',
      'Presenta clientes frecuentes de barrio con fichas de prueba y saldos simulados en cuenta corriente.',
    ],
    isDemoOrEvaluation: true,
  },
  {
    id: 'basica',
    name: 'Edición Básica (Comercio Esencial)',
    badgeLabel: 'BÁSICA',
    shortDescription: 'Monocomercio con ventas en mostrador, catálogo, stock, compras y caja diaria.',
    fullDescription:
      'Solución integral para un punto de venta único (1 sucursal, 1 caja). Cubre todo el circuito operativo esencial de mostrador: registro de artículos, reposición de mercadería, cobro ágil en efectivo y medios electrónicos, compras a proveedores y balance de caja del día.',
    iconName: 'Store',
    allowedSections: [
      'dashboard',
      'products',
      'inventory',
      'sales',
      'cash-register',
      'customers',
      'suppliers',
      'purchases',
      'reports',
      'settings',
    ],
    limits: {
      maxStores: 1,
      maxTerminalsPerStore: 1,
      allowsMultiStore: false,
      allowsCurrentAccounts: false,
      allowsPromotions: false,
      allowsConfigurableRoles: false,
      allowsMarketingGenerator: false,
      allowsAdvancedReports: false,
      allowsAuditLogViewer: false,
    },
    features: [
      'Punto de venta POS monocomercio (1 sucursal, 1 terminal activa)',
      'Catálogo completo de productos con precios de costo y venta',
      'Control de existencias e inventario con punto de reposición',
      'Apertura, ingresos, egresos y cierre de caja diaria',
      'Directorio de clientes para tickets y contacto básico',
      'Gestión de proveedores y órdenes de compras de mercadería',
      'Informes esenciales de ventas diarias y recaudación por turno',
      'Configuración fiscal básica (formato de ticket, datos del local)',
    ],
    dieteticaCaseNotes: [
      'Ideal para un local a la calle de dietética y venta de alimento para mascotas con cobro de mostrador.',
      'Control exacto de bolsas de alimento balanceado y fraccionados a granel (avena, frutos secos, arroz integral).',
      'Cierre de caja al final de cada turno con desglose de efectivo y comprobantes de tarjetas o transferencias.',
      'No incluye cuentas corrientes ni promociones complejas (ventas de cobro inmediato únicamente).',
    ],
    isDemoOrEvaluation: false,
  },
  {
    id: 'avanzada',
    name: 'Edición Avanzada (Gestión y Fidelización)',
    badgeLabel: 'AVANZADA',
    shortDescription: 'Todo lo de Básica más cuentas corrientes, promociones, empleados, alertas y marketing.',
    fullDescription:
      'Evolución para comercios en crecimiento que requieren fidelizar clientes mediante cuentas corrientes (fiados), lanzar promociones y combos por fecha, coordinar cajeros con permisos específicos, recibir alertas operativas y difundir ofertas en redes sociales.',
    iconName: 'TrendingUp',
    allowedSections: [
      'dashboard',
      'products',
      'inventory',
      'sales',
      'cash-register',
      'customers',
      'current-accounts',
      'suppliers',
      'purchases',
      'promotions',
      'reports',
      'employees',
      'alerts',
      'marketing',
      'settings',
      'audit-log',
    ],
    limits: {
      maxStores: 1,
      maxTerminalsPerStore: 2,
      allowsMultiStore: false,
      allowsCurrentAccounts: true,
      allowsPromotions: true,
      allowsConfigurableRoles: true,
      allowsMarketingGenerator: true,
      allowsAdvancedReports: true,
      allowsAuditLogViewer: true,
    },
    features: [
      'Todo lo incluido en la Edición Básica',
      'Cuentas Corrientes y control de límites de crédito para clientes habituales',
      'Ofertas, promociones 2x1 y combos de productos por fecha o día',
      'Usuarios y empleados con roles definidos (Administrador, Encargado, Cajero)',
      'Centro de alertas operativas (quiebre de stock, límites de deuda excedidos)',
      'Generador de piezas publicitarias para WhatsApp e Instagram (flyers y textos)',
      'Informes avanzados con rentabilidad por artículo y franja horaria',
      'Visualizador de auditoría local y verificación de integridad SHA-256',
    ],
    dieteticaCaseNotes: [
      'Permite llevar la cuenta corriente de los vecinos del barrio que retiran alimento balanceado mensualmente.',
      'Configuración de combos promocionales (ej: bolsa 15kg perro adulto + snack dental de regalo / mix de frutos secos + granola con 15% off).',
      'Alertas tempranas de reposición antes de que se agoten las marcas líderes de balanceado.',
      'Generación rápida de mensajes de WhatsApp y estados para anunciar nuevos ingresos de productos orgánicos o celíacos.',
      'Control de empleados cajeros con supervisión del encargado mediante historial de auditoría.',
    ],
    isDemoOrEvaluation: false,
  },
  {
    id: 'full',
    name: 'Edición Full (Multi-Sucursal y Depósitos)',
    badgeLabel: 'FULL',
    shortDescription: 'Todo lo de Avanzada más administración multi-sucursal, depósitos y consolidación.',
    fullDescription:
      'Plataforma completa para empresas comerciales con varias bocas de venta, locales satélites o depósitos logísticos. Habilita la administración simultánea de múltiples sucursales, terminales paralelas, supervisión unificada y trazabilidad completa de operaciones.',
    iconName: 'Building2',
    allowedSections: [
      'dashboard',
      'stores',
      'products',
      'inventory',
      'sales',
      'cash-register',
      'customers',
      'current-accounts',
      'suppliers',
      'purchases',
      'promotions',
      'reports',
      'employees',
      'alerts',
      'marketing',
      'settings',
      'audit-log',
    ],
    limits: {
      maxStores: 999,
      maxTerminalsPerStore: 999,
      allowsMultiStore: true,
      allowsCurrentAccounts: true,
      allowsPromotions: true,
      allowsConfigurableRoles: true,
      allowsMarketingGenerator: true,
      allowsAdvancedReports: true,
      allowsAuditLogViewer: true,
    },
    features: [
      'Todo lo incluido en la Edición Avanzada',
      'Administración de múltiples sucursales, locales comerciales y depósitos logísticos',
      'Múltiples terminales POS y cajas paralelas por cada punto de venta',
      'Visualización de stock por sucursal y preparación de transferencias de mercadería',
      'Consolidación global de ventas y rendimiento en el Panel Principal',
      'Supervisión administrativa de todas las cajas y turnos de la empresa',
      'Exportación integral de auditoría SHA-256 en formato CSV canónico',
      'Parámetros empresariales centralizados con herencia a sucursales',
    ],
    dieteticaCaseNotes: [
      'Ideal para una empresa que opera un local principal de dietética en centro comercial y un depósito/forrajería de alimento balanceado pesado en zona periférica.',
      'Permite consultar desde el mostrador de atención si hay stock disponible de una bolsa de 20kg en el depósito logístico.',
      'Control de transferencias de pallets de alimentos y bolsas entre el depósito y la tienda.',
      'Supervisión de múltiples turnos y cajas simultáneas atendiendo a clientes minoristas y criadores/veterinarias con precios diferenciados.',
    ],
    isDemoOrEvaluation: false,
  },
];

/**
 * Mapa indexado por ID de edición para acceso O(1).
 */
export const COMMERCIAL_EDITIONS_MAP: Record<CommercialEditionTier, CommercialEdition> =
  COMMERCIAL_EDITIONS.reduce(
    (acc, edition) => {
      acc[edition.id] = edition;
      return acc;
    },
    {} as Record<CommercialEditionTier, CommercialEdition>
  );

/**
 * Edición predeterminada de fallback cuando no se especifica un tier comercial.
 */
export const DEFAULT_COMMERCIAL_EDITION_ID: CommercialEditionTier = 'demo';

/**
 * Consulta la configuración de una edición comercial por su identificador.
 * Posee respaldo seguro hacia la edición 'demo'.
 */
export function getCommercialEdition(
  tier?: CommercialEditionTier | string | null
): CommercialEdition {
  if (tier && tier in COMMERCIAL_EDITIONS_MAP) {
    return COMMERCIAL_EDITIONS_MAP[tier as CommercialEditionTier];
  }
  return COMMERCIAL_EDITIONS_MAP[DEFAULT_COMMERCIAL_EDITION_ID];
}

/**
 * Determina si una sección de navegación específica está autorizada en una edición determinada.
 */
export function isSectionAllowedInEdition(
  tier: CommercialEditionTier | undefined,
  sectionId: NavigationSectionId
): boolean {
  const edition = getCommercialEdition(tier);
  return edition.allowedSections.includes(sectionId);
}

/**
 * Retorna las clases de estilo visual (Stitch badges) correspondientes a cada edición comercial.
 */
export function getEditionBadgeStyle(tier?: CommercialEditionTier | string | null): {
  label: string;
  badgeClass: string;
} {
  const edition = getCommercialEdition(tier);
  switch (edition.id) {
    case 'demo':
      return {
        label: edition.badgeLabel,
        badgeClass:
          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
      };
    case 'basica':
      return {
        label: edition.badgeLabel,
        badgeClass:
          'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      };
    case 'avanzada':
      return {
        label: edition.badgeLabel,
        badgeClass:
          'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      };
    case 'full':
      return {
        label: edition.badgeLabel,
        badgeClass:
          'bg-[#FDF7F4] text-[#B84C26] dark:bg-[#282F2C] dark:text-[#FFA07A] border-[#F3D3C4] dark:border-[#3A433E]',
      };
  }
}

/**
 * Determina cuál es la edición comercial mínima requerida para habilitar una sección dada.
 */
export function getMinimumEditionForSection(
  sectionId: NavigationSectionId
): CommercialEdition {
  if (COMMERCIAL_EDITIONS_MAP.basica.allowedSections.includes(sectionId)) {
    return COMMERCIAL_EDITIONS_MAP.basica;
  }
  if (COMMERCIAL_EDITIONS_MAP.avanzada.allowedSections.includes(sectionId)) {
    return COMMERCIAL_EDITIONS_MAP.avanzada;
  }
  return COMMERCIAL_EDITIONS_MAP.full;
}

export interface SectionCommercialBenefit {
  sectionId: NavigationSectionId;
  title: string;
  shortBenefit: string;
  dieteticaCaseStudy: string;
  keyFeatures: string[];
}

export const SECTION_COMMERCIAL_BENEFITS: Record<NavigationSectionId, SectionCommercialBenefit> = {
  stores: {
    sectionId: 'stores',
    title: 'Gestión Multi-Sucursal y Depósitos',
    shortBenefit: 'Administración unificada de múltiples locales comerciales, depósitos logísticos y bocas de venta simultáneas.',
    dieteticaCaseStudy: 'Ideal para administrar un local de dietética a la calle y un depósito o forrajería para bolsas pesadas de alimento balanceado (15kg/20kg). Permite consultar existencias cruzadas y despachar mercadería entre locales sin errores de inventario.',
    keyFeatures: [
      'Gestión de sucursales centrales, filiales y depósitos',
      'Consulta de stock disponible en otras bocas de venta',
      'Configuración individual de terminales POS por sucursal',
      'Consolidación de ventas empresariales en un solo panel',
    ],
  },
  'current-accounts': {
    sectionId: 'current-accounts',
    title: 'Cuentas Corrientes y Créditos',
    shortBenefit: 'Registro de saldos pendientes, límites de crédito para clientes de confianza y cobranzas parciales.',
    dieteticaCaseStudy: 'Permite registrar el alimento balanceado que los vecinos habituales retiran y abonan a mes vencido o por quincena. Evita anotaciones en cuadernos y alerta cuando un cliente supera su límite de crédito asignado.',
    keyFeatures: [
      'Fichas de cuentas corrientes con historial de compras y cobros',
      'Fijación de límites de crédito personalizados',
      'Alertas de morosidad y clientes con saldo deudor',
      'Emisión de recibos de pago y cancelación de deuda',
    ],
  },
  promotions: {
    sectionId: 'promotions',
    title: 'Ofertas, Combos y Promociones',
    shortBenefit: 'Configuración de descuentos automáticos, combos cruzados y beneficios por día o volumen.',
    dieteticaCaseStudy: 'Habilita el armado de combos especiales en mostrador: por ejemplo, bolsa de 15kg de alimento para perro + snack dental de regalo, o 15% de descuento en frutos secos y granolas los días miércoles.',
    keyFeatures: [
      'Creación de combos de productos con precio promocional',
      'Descuentos porcentuales o monto fijo por categoría',
      'Programación de promociones por días de la semana y fechas',
      'Aplicación automática del beneficio en el punto de venta (POS)',
    ],
  },
  employees: {
    sectionId: 'employees',
    title: 'Usuarios, Empleados y Permisos',
    shortBenefit: 'Control de accesos diferenciados para cajeros, encargados y administradores con clave personal.',
    dieteticaCaseStudy: 'Garantiza que los cajeros únicamente puedan registrar ventas y cobros en el mostrador, mientras que la modificación de precios de costo, arqueos y reportes fiscales quedan reservados al encargado o dueño.',
    keyFeatures: [
      'Roles predefinidos: Administrador, Encargado, Cajero',
      'Asignación de sucursal de trabajo por colaborador',
      'PIN o clave individual de seguridad',
      'Registro del empleado responsable en cada ticket y arqueo',
    ],
  },
  alerts: {
    sectionId: 'alerts',
    title: 'Centro de Alertas y Notificaciones',
    shortBenefit: 'Monitoreo proactivo de quiebres de stock, arqueos pendientes, vencimientos y desvíos operativos.',
    dieteticaCaseStudy: 'Te avisa con anticipación antes de que se agoten las marcas líderes de alimento balanceado para mascotas o los productos dietéticos de alta rotación, asegurando que no pierdas ventas por falta de mercadería.',
    keyFeatures: [
      'Alertas automáticas de punto de reposición de stock',
      'Avisos de saldos deudores en cuentas corrientes',
      'Notificaciones de cierres de caja y desvíos de efectivo',
      'Priorización por nivel de severidad (alta, media, baja)',
    ],
  },
  marketing: {
    sectionId: 'marketing',
    title: 'Publicidad para Redes Sociales',
    shortBenefit: 'Generador asistido de piezas visuales y textos persuasivos listos para WhatsApp, Instagram y Facebook.',
    dieteticaCaseStudy: 'Generá rápidamente anuncios atractivos para difundir promociones de la semana: nuevos ingresos de alimentos balanceados premium, harinas orgánicas o golosinas naturales para mascotas directamente por WhatsApp.',
    keyFeatures: [
      'Generación de flyers visuales y copies publicitarios',
      'Plantillas para estados de WhatsApp y publicaciones de Instagram',
      'Difusión de promociones vigentes con un solo clic',
      'Diseño profesional adaptado a la identidad de tu local',
    ],
  },
  'audit-log': {
    sectionId: 'audit-log',
    title: 'Auditoría y Trazabilidad SHA-256',
    shortBenefit: 'Historial inmutable y criptográficamente verificado de todas las operaciones realizadas en el sistema.',
    dieteticaCaseStudy: 'Registra qué usuario modificó el precio de un artículo, cuándo se realizó un arqueo de caja o quién anuló un ticket, protegiendo al comercio frente a irregularidades y errores humanos.',
    keyFeatures: [
      'Cadena de bloques de auditoría local verificable con SHA-256',
      'Filtros por usuario, fecha, sucursal y módulo operativo',
      'Trazabilidad de cambios de valores anteriores y nuevos',
      'Exportación en formato canónico para supervisión externa',
    ],
  },
  dashboard: {
    sectionId: 'dashboard',
    title: 'Panel Principal',
    shortBenefit: 'Resumen integral de ventas, inventario y métricas.',
    dieteticaCaseStudy: 'Métricas diarias de tu local de dietética.',
    keyFeatures: ['KPIs diarios', 'Accesos rápidos', 'Alertas operativas'],
  },
  products: {
    sectionId: 'products',
    title: 'Catálogo de Productos',
    shortBenefit: 'Gestión de artículos, precios y códigos de barras.',
    dieteticaCaseStudy: 'Catálogo completo de alimentos balanceados y productos dietéticos.',
    keyFeatures: ['Precios de costo y venta', 'Códigos de barras', 'Categorías'],
  },
  inventory: {
    sectionId: 'inventory',
    title: 'Inventario y Stock',
    shortBenefit: 'Control de existencias y reposición.',
    dieteticaCaseStudy: 'Control de bolsas de alimento balanceado y fraccionados.',
    keyFeatures: ['Stock actual y mínimo', 'Ajustes', 'Alertas de quiebre'],
  },
  sales: {
    sectionId: 'sales',
    title: 'Punto de Venta (POS)',
    shortBenefit: 'Terminal de cobro ágil en mostrador.',
    dieteticaCaseStudy: 'Cobro rápido en mostrador de dietética.',
    keyFeatures: ['Tickets', 'Múltiples medios de pago', 'Cálculo de vuelto'],
  },
  'cash-register': {
    sectionId: 'cash-register',
    title: 'Caja Diaria',
    shortBenefit: 'Aperturas, movimientos y cierres de turno.',
    dieteticaCaseStudy: 'Control de efectivo y comprobantes de la jornada.',
    keyFeatures: ['Arqueo ciego', 'Ingresos y retiros', 'Balance por turno'],
  },
  customers: {
    sectionId: 'customers',
    title: 'Clientes',
    shortBenefit: 'Directorio y datos de contacto de compradores.',
    dieteticaCaseStudy: 'Ficha de clientes del barrio para contacto y facturación.',
    keyFeatures: ['Datos de contacto', 'DNI/CUIT', 'Categorización'],
  },
  suppliers: {
    sectionId: 'suppliers',
    title: 'Proveedores',
    shortBenefit: 'Gestión de proveedores y distribuidores.',
    dieteticaCaseStudy: 'Distribuidores de alimento balanceado y mayoristas dietéticos.',
    keyFeatures: ['Condiciones de pago', 'Plazos de entrega', 'Contacto'],
  },
  purchases: {
    sectionId: 'purchases',
    title: 'Compras de Mercadería',
    shortBenefit: 'Órdenes de compra y recepción de stock.',
    dieteticaCaseStudy: 'Ingreso de pallets de alimento y bolsas de frutos secos.',
    keyFeatures: ['Órdenes de compra', 'Actualización automática de stock', 'Facturas'],
  },
  reports: {
    sectionId: 'reports',
    title: 'Informes y Estadísticas',
    shortBenefit: 'Reportes de ventas, rentabilidad y recaudación.',
    dieteticaCaseStudy: 'Métricas de recaudación por turno y artículos más vendidos.',
    keyFeatures: ['Ventas diarias', 'Medios de pago', 'Productos líderes'],
  },
  settings: {
    sectionId: 'settings',
    title: 'Configuración General',
    shortBenefit: 'Parámetros del comercio, fiscales y de comprobantes.',
    dieteticaCaseStudy: 'Configuración fiscal y formato de tickets del local.',
    keyFeatures: ['Datos del negocio', 'Formato de ticket', 'Edición comercial'],
  },
};

export function getSectionCommercialBenefit(
  sectionId: NavigationSectionId
): SectionCommercialBenefit {
  return (
    SECTION_COMMERCIAL_BENEFITS[sectionId] || {
      sectionId,
      title: 'Módulo del Sistema',
      shortBenefit: 'Herramienta de gestión comercial especializada.',
      dieteticaCaseStudy: 'Optimiza la operatoria diaria de tu comercio.',
      keyFeatures: ['Automatización operativa', 'Mayor control del negocio'],
    }
  );
}

