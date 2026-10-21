import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Barcode,
  Tag,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Edit2,
  Eye,
  ArrowUpRight,
  Sparkles,
  Layers,
  X,
  SlidersHorizontal,
  Upload,
  Image as ImageIcon,
  Trash2,
  Apple,
  Dog,
  Scale,
  Check,
  EyeOff,
  Wheat,
} from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { Product, Employee, Store, DietaryType, PetSpecies, PetLifeStage } from '../../types';
import { CreateAuditEventParams } from '../../utils/auditLogger';

interface ProductsScreenProps {
  products: Product[];
  currentUser?: Employee;
  activeStore?: Store;
  onAuditLog?: (params: CreateAuditEventParams) => void;
  onUpdateProducts?: (products: Product[]) => void;
}

interface ProductFormData {
  name: string;
  sku: string;
  barcode: string;
  category: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  unit: string;

  // Nuevos campos generales
  brand: string;
  subCategory: string;
  imageUrl: string;
  isActive: boolean;
  allowsFractional: boolean;
  fractionalMinStep: number;

  // Perfil Dietética y Productos Naturales
  hasDietaryProfile: boolean;
  dietaryType: DietaryType | '';
  isGlutenFree: boolean;
  isVegan: boolean;
  isOrganic: boolean;

  // Perfil Alimentos para Mascotas / Pet Shop
  hasPetProfile: boolean;
  petSpecies: PetSpecies | '';
  petStage: PetLifeStage | '';
  packageWeightKg: string | number;
  isClosedBag: boolean;
}

const DEFAULT_CATEGORIES = [
  'Almacén',
  'Dietética y Nutrición',
  'Frutos Secos y Semillas',
  'Legumbres y Cereales',
  'Harinas Especiales',
  'Pet Shop & Balanceados',
  'Alimento Perros',
  'Alimento Gatos',
  'Bebidas',
  'Lácteos',
  'Snacks',
  'Limpieza',
];

export const ProductsScreen: React.FC<ProductsScreenProps> = ({
  products: initialProducts,
  currentUser,
  activeStore,
  onAuditLog,
  onUpdateProducts,
}) => {
  // Local state for product list
  const [productList, setProductList] = useState<Product[]>(initialProducts);

  // Sync with prop when external updates occur
  useEffect(() => {
    setProductList(initialProducts);
  }, [initialProducts]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState<'todos' | 'disponible' | 'bajo_stock' | 'agotado' | 'inactivos'>('todos');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // File input ref for image upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    sku: '',
    barcode: '',
    category: 'Almacén',
    costPrice: 1000,
    salePrice: 1650,
    stock: 20,
    minStock: 10,
    unit: 'Unidad',
    brand: '',
    subCategory: '',
    imageUrl: '',
    isActive: true,
    allowsFractional: false,
    fractionalMinStep: 0.1,
    hasDietaryProfile: false,
    dietaryType: '',
    isGlutenFree: false,
    isVegan: false,
    isOrganic: false,
    hasPetProfile: false,
    petSpecies: '',
    petStage: '',
    packageWeightKg: '',
    isClosedBag: false,
  });

  // Extract all categories dynamically and merge with default relevant categories
  const categories = [
    'Todas',
    ...Array.from(new Set([...initialProducts.map((p) => p.category), ...DEFAULT_CATEGORIES])),
  ];

  // Filtering (supports name, SKU, barcode, brand, subcategory and active status)
  const filteredProducts = productList.filter((p) => {
    const s = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !s ||
      p.name.toLowerCase().includes(s) ||
      p.sku.toLowerCase().includes(s) ||
      p.barcode.includes(s) ||
      (p.brand && p.brand.toLowerCase().includes(s)) ||
      (p.subCategory && p.subCategory.toLowerCase().includes(s));

    const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;

    let matchesStatus = true;
    if (selectedStatus === 'inactivos') {
      matchesStatus = p.isActive === false;
    } else if (selectedStatus !== 'todos') {
      matchesStatus = p.status === selectedStatus && p.isActive !== false;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Currency Formatter
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `ART-${Math.floor(100 + Math.random() * 900)}`,
      barcode: `779${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      category: 'Almacén',
      costPrice: 2500,
      salePrice: 4200,
      stock: 24,
      minStock: 10,
      unit: 'Unidad',
      brand: '',
      subCategory: '',
      imageUrl: '',
      isActive: true,
      allowsFractional: false,
      fractionalMinStep: 0.1,
      hasDietaryProfile: false,
      dietaryType: '',
      isGlutenFree: false,
      isVegan: false,
      isOrganic: false,
      hasPetProfile: false,
      petSpecies: '',
      petStage: '',
      packageWeightKg: '',
      isClosedBag: false,
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);

    // Auto-detect if product has dietary or pet profile
    const hasDiet = !!(
      product.dietaryType ||
      product.isGlutenFree ||
      product.isVegan ||
      product.isOrganic
    );
    const hasPet = !!(
      product.petSpecies ||
      product.petStage ||
      product.packageWeightKg !== undefined ||
      product.isClosedBag
    );

    setFormData({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      category: product.category,
      costPrice: product.costPrice,
      salePrice: product.salePrice,
      stock: product.stock,
      minStock: product.minStock,
      unit: product.unit,
      brand: product.brand || '',
      subCategory: product.subCategory || '',
      imageUrl: product.imageUrl || '',
      // Interpret missing isActive as true without altering saved state
      isActive: product.isActive !== false,
      allowsFractional: !!product.allowsFractional,
      fractionalMinStep: product.fractionalMinStep ?? 0.1,
      hasDietaryProfile: hasDiet,
      dietaryType: product.dietaryType || '',
      isGlutenFree: !!product.isGlutenFree,
      isVegan: !!product.isVegan,
      isOrganic: !!product.isOrganic,
      hasPetProfile: hasPet,
      petSpecies: product.petSpecies || '',
      petStage: product.petStage || '',
      packageWeightKg: product.packageWeightKg !== undefined ? product.packageWeightKg : '',
      isClosedBag: !!product.isClosedBag,
    });
    setShowModal(true);
  };

  // Handle Image File Upload with native Canvas downsampling to avoid localStorage overflow
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor seleccione un archivo de imagen válido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        // Redimensionar a un tamaño seguro máx 240px para almacenar en localStorage (< 15 KB)
        const maxDim = 240;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
          setFormData((prev) => ({ ...prev, imageUrl: compressedDataUrl }));
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Calculate margin in real time
  const calculatedMargin =
    formData.costPrice > 0
      ? (((formData.salePrice - formData.costPrice) / formData.costPrice) * 100).toFixed(1)
      : '0';

  // Price per 100g indicator if unit is kg or allows fractional
  const pricePer100g =
    formData.unit.toLowerCase() === 'kg' || formData.unit.toLowerCase().includes('kilo')
      ? Math.round(formData.salePrice / 10)
      : null;

  // Handle Form Submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let computedStatus: Product['status'] = 'disponible';
    if (Number(formData.stock) === 0) {
      computedStatus = 'agotado';
    } else if (Number(formData.stock) <= Number(formData.minStock)) {
      computedStatus = 'bajo_stock';
    }

    const trimmedName = formData.name.trim();
    const trimmedBrand = formData.brand.trim();
    const trimmedSubCategory = formData.subCategory.trim();
    const trimmedSku = formData.sku.trim();
    const trimmedBarcode = formData.barcode.trim();
    const numSalePrice = Number(formData.salePrice);
    const numCostPrice = Number(formData.costPrice);
    const numStock = Number(formData.stock);
    const numMinStock = Number(formData.minStock);

    if (editingProduct) {
      // Detect changes for audit log
      const changes: string[] = [];
      if (trimmedName !== editingProduct.name) {
        changes.push(`Nombre: "${editingProduct.name}" -> "${trimmedName}"`);
      }
      if (trimmedBrand !== (editingProduct.brand || '')) {
        changes.push(`Marca: "${editingProduct.brand || 's/d'}" -> "${trimmedBrand || 's/d'}"`);
      }
      if (numSalePrice !== editingProduct.salePrice) {
        changes.push(
          `Precio venta: $${editingProduct.salePrice.toLocaleString('es-AR')} -> $${numSalePrice.toLocaleString('es-AR')}`
        );
      }
      if (numCostPrice !== editingProduct.costPrice) {
        changes.push(
          `Costo: $${editingProduct.costPrice.toLocaleString('es-AR')} -> $${numCostPrice.toLocaleString('es-AR')}`
        );
      }
      if (formData.category !== editingProduct.category) {
        changes.push(`Rubro: "${editingProduct.category}" -> "${formData.category}"`);
      }
      if (trimmedBarcode !== editingProduct.barcode) {
        changes.push(`Código de barras: "${editingProduct.barcode}" -> "${trimmedBarcode}"`);
      }
      if (trimmedSku !== editingProduct.sku) {
        changes.push(`SKU: "${editingProduct.sku}" -> "${trimmedSku}"`);
      }
      if (numStock !== editingProduct.stock) {
        changes.push(`Stock físico: ${editingProduct.stock} -> ${numStock} ${formData.unit}`);
      }
      if (numMinStock !== editingProduct.minStock) {
        changes.push(`Stock mínimo: ${editingProduct.minStock} -> ${numMinStock}`);
      }
      if (formData.unit !== editingProduct.unit) {
        changes.push(`Unidad: "${editingProduct.unit}" -> "${formData.unit}"`);
      }
      if (formData.isActive !== (editingProduct.isActive !== false)) {
        changes.push(`Estado: ${formData.isActive ? 'Activo' : 'Inactivo'}`);
      }
      if (formData.allowsFractional !== !!editingProduct.allowsFractional) {
        changes.push(`Venta fraccionada: ${formData.allowsFractional ? 'Habilitada' : 'Deshabilitada'}`);
      }

      // Build updated product preserving untouched existing fields
      const updatedProduct: Product = {
        ...editingProduct,
        name: trimmedName,
        sku: trimmedSku,
        barcode: trimmedBarcode,
        category: formData.category,
        costPrice: numCostPrice,
        salePrice: numSalePrice,
        stock: numStock,
        minStock: numMinStock,
        unit: formData.unit,
        status: computedStatus,

        // Campos generales nuevos
        brand: trimmedBrand || undefined,
        subCategory: trimmedSubCategory || undefined,
        imageUrl: formData.imageUrl || undefined,
        isActive: formData.isActive,
        allowsFractional: formData.allowsFractional,
        fractionalMinStep: formData.allowsFractional ? Number(formData.fractionalMinStep) || 0.1 : undefined,

        // Campos Dietética
        dietaryType: formData.hasDietaryProfile && formData.dietaryType ? (formData.dietaryType as DietaryType) : (formData.hasDietaryProfile ? undefined : editingProduct.dietaryType),
        isGlutenFree: formData.hasDietaryProfile ? formData.isGlutenFree : editingProduct.isGlutenFree,
        isVegan: formData.hasDietaryProfile ? formData.isVegan : editingProduct.isVegan,
        isOrganic: formData.hasDietaryProfile ? formData.isOrganic : editingProduct.isOrganic,

        // Campos Pet Shop / Alimento para mascotas
        petSpecies: formData.hasPetProfile && formData.petSpecies ? (formData.petSpecies as PetSpecies) : (formData.hasPetProfile ? undefined : editingProduct.petSpecies),
        petStage: formData.hasPetProfile && formData.petStage ? (formData.petStage as PetLifeStage) : (formData.hasPetProfile ? undefined : editingProduct.petStage),
        packageWeightKg: formData.hasPetProfile && formData.packageWeightKg !== '' ? Number(formData.packageWeightKg) : (formData.hasPetProfile ? undefined : editingProduct.packageWeightKg),
        isClosedBag: formData.hasPetProfile ? formData.isClosedBag : editingProduct.isClosedBag,
      };

      const updatedList = productList.map((p) => (p.id === editingProduct.id ? updatedProduct : p));
      setProductList(updatedList);
      if (onUpdateProducts) {
        onUpdateProducts(updatedList);
      }

      // Record audit event
      if (changes.length > 0 && onAuditLog) {
        onAuditLog({
          module: 'Productos',
          action: `Modificación de producto: ${trimmedName}`,
          category: 'operation',
          status: 'exitoso',
          details: `Modificación en ficha de "${trimmedName}" (ID: ${editingProduct.id}): ${changes.join('; ')}.`,
          entityId: editingProduct.id,
          previousValue: `Venta: $${editingProduct.salePrice.toLocaleString('es-AR')}`,
          newValue: `Venta: $${numSalePrice.toLocaleString('es-AR')}`,
          severity: 'baja',
          currentUser: currentUser ? { name: currentUser.name, role: currentUser.role, id: currentUser.id } : null,
          currentStore: activeStore ? { name: activeStore.name, id: activeStore.id } : null,
        });
      }
    } else {
      // Create new product
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: trimmedName,
        sku: trimmedSku,
        barcode: trimmedBarcode,
        category: formData.category,
        costPrice: numCostPrice,
        salePrice: numSalePrice,
        stock: numStock,
        minStock: numMinStock,
        unit: formData.unit,
        status: computedStatus,
        storeId: activeStore?.id || 'store-1',

        // Campos generales nuevos
        brand: trimmedBrand || undefined,
        subCategory: trimmedSubCategory || undefined,
        imageUrl: formData.imageUrl || undefined,
        isActive: formData.isActive,
        allowsFractional: formData.allowsFractional,
        fractionalMinStep: formData.allowsFractional ? Number(formData.fractionalMinStep) || 0.1 : undefined,

        // Campos Dietética
        dietaryType: formData.hasDietaryProfile && formData.dietaryType ? (formData.dietaryType as DietaryType) : undefined,
        isGlutenFree: formData.hasDietaryProfile ? formData.isGlutenFree : undefined,
        isVegan: formData.hasDietaryProfile ? formData.isVegan : undefined,
        isOrganic: formData.hasDietaryProfile ? formData.isOrganic : undefined,

        // Campos Pet Shop
        petSpecies: formData.hasPetProfile && formData.petSpecies ? (formData.petSpecies as PetSpecies) : undefined,
        petStage: formData.hasPetProfile && formData.petStage ? (formData.petStage as PetLifeStage) : undefined,
        packageWeightKg: formData.hasPetProfile && formData.packageWeightKg !== '' ? Number(formData.packageWeightKg) : undefined,
        isClosedBag: formData.hasPetProfile ? formData.isClosedBag : undefined,
      };

      const updatedList = [newProd, ...productList];
      setProductList(updatedList);
      if (onUpdateProducts) {
        onUpdateProducts(updatedList);
      }

      if (onAuditLog) {
        onAuditLog({
          module: 'Productos',
          action: 'Alta de producto',
          category: 'operation',
          status: 'exitoso',
          details: `Alta de nuevo producto: "${trimmedName}" (Marca: ${trimmedBrand || 's/d'}, SKU: ${newProd.sku}, Rubro: ${newProd.category}). Venta: $${numSalePrice.toLocaleString('es-AR')}, Stock: ${numStock} ${newProd.unit}.`,
          entityId: newProd.id,
          newValue: `Venta: $${numSalePrice.toLocaleString('es-AR')} | Costo: $${numCostPrice.toLocaleString('es-AR')}`,
          severity: 'baja',
          currentUser: currentUser ? { name: currentUser.name, role: currentUser.role, id: currentUser.id } : null,
          currentStore: activeStore ? { name: activeStore.name, id: activeStore.id } : null,
        });
      }
    }

    setShowModal(false);
  };

  // Summary Metrics
  const totalProducts = productList.length;
  const lowStockCount = productList.filter((p) => p.stock <= p.minStock && p.stock > 0).length;
  const outOfStockCount = productList.filter((p) => p.stock === 0).length;
  const avgMargin = (
    productList.reduce((acc, p) => acc + ((p.salePrice - p.costPrice) / p.costPrice) * 100, 0) /
    (productList.length || 1)
  ).toFixed(0);

  return (
    <div className="space-y-6 font-sans">
      {/* Banner de Aviso de Demostración */}
      <DemoNotice
        title="Módulo de Productos & Maestro de Catálogo"
        description="Gestión integral de artículos, marcas, fotos, atributos especializados de dietética y alimentos balanceados con soporte de pesaje fraccionado."
      />

      {/* Encabezado Editorial del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E3DA]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C85A32] bg-[#FDF7F4] px-2.5 py-0.5 rounded-full border border-[#F3D3C4]">
              Maestro Comercial • Dietética & Balanceados
            </span>
            <span className="text-xs text-[#8A908D]">
              {totalProducts} artículos registrados
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C201E] tracking-tight">
            Productos & Catálogo
          </h1>
          <p className="text-xs sm:text-sm text-[#595E5B] mt-0.5">
            Administración de precios, marcas, atributos dietéticos (Sin TACC, vegano), mascotas y venta fraccionada.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C85A32] hover:bg-[#B84C26] active:bg-[#9B3D1D] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm shadow-[#C85A32]/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Métricas Resumen del Catálogo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E8E3DA] shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#6F7572] block">
            Total en Catálogo
          </span>
          <div className="text-xl sm:text-2xl font-bold text-[#1C201E] mt-1">
            {totalProducts} <span className="text-xs font-normal text-[#8A908D]">artículos</span>
          </div>
          <span className="text-[11px] text-[#246A48] mt-1 block font-medium">
            Sincronizado en sucursales
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E8E3DA] shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#6F7572] block">
            Margen Bruto Promedio
          </span>
          <div className="text-xl sm:text-2xl font-bold text-[#246A48] mt-1">
            +{avgMargin}%
          </div>
          <span className="text-[11px] text-[#595E5B] mt-1 block">
            Sobre costo de reposición
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E8E3DA] shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#6F7572] block">
            Bajo Punto de Reposición
          </span>
          <div className="text-xl sm:text-2xl font-bold text-[#9A6216] mt-1">
            {lowStockCount} <span className="text-xs font-normal text-[#8A908D]">alertas</span>
          </div>
          <span className="text-[11px] text-[#9A6216] mt-1 block font-medium">
            Próximos a agotarse
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E8E3DA] shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#6F7572] block">
            Quiebre de Stock (0 u.)
          </span>
          <div className="text-xl sm:text-2xl font-bold text-[#B84C26] mt-1">
            {outOfStockCount} <span className="text-xs font-normal text-[#8A908D]">agotados</span>
          </div>
          <span className="text-[11px] text-[#B84C26] mt-1 block font-medium">
            Requiere compra urgente
          </span>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8E3DA] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Buscador */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#8A908D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, marca, SKU o EAN-13..."
            className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl bg-[#FAF8F4] border border-[#E8E3DA] text-[#1C201E] placeholder-[#8A908D] focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition-colors"
          />
        </div>

        {/* Filtros de Categoría y Estado */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-[#6F7572] shrink-0">Categoría:</span>
          {categories.slice(0, 7).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#C85A32] text-white shadow-xs'
                  : 'bg-[#FAF8F4] text-[#595E5B] hover:bg-[#F3EFEA] border border-[#E8E3DA]'
              }`}
            >
              {cat}
            </button>
          ))}
          {categories.length > 7 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF8F4] text-[#595E5B] border border-[#E8E3DA] cursor-pointer"
            >
              <option value="Todas">Más categorías...</option>
              {categories.slice(7).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Tabla Editorial de Productos */}
      <div className="bg-white rounded-2xl border border-[#E8E3DA] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-[#FAF8F4] text-[#6F7572] uppercase text-[10px] tracking-wider border-b border-[#E8E3DA]">
              <tr>
                <th className="py-3 px-4 font-bold">Producto, Marca & SKU</th>
                <th className="py-3 px-3 font-bold">Código EAN-13</th>
                <th className="py-3 px-3 font-bold">Rubro / Perfil</th>
                <th className="py-3 px-3 text-right font-bold">Costo</th>
                <th className="py-3 px-3 text-right font-bold">PVP (Venta)</th>
                <th className="py-3 px-3 text-center font-bold">Margen</th>
                <th className="py-3 px-3 text-center font-bold">Stock</th>
                <th className="py-3 px-3 text-center font-bold">Estado</th>
                <th className="py-3 px-4 text-center font-bold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3EFEA]">
              {filteredProducts.map((p) => {
                const margin = ((p.salePrice - p.costPrice) / p.costPrice) * 100;
                const isItemActive = p.isActive !== false;

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-[#FAF8F4] transition-colors ${
                      !isItemActive ? 'opacity-65 bg-[#FAF8F4]/40' : ''
                    }`}
                  >
                    {/* Producto, Marca & SKU */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {/* Miniatura de Foto o Ícono */}
                        <div className="w-10 h-10 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] shrink-0 overflow-hidden flex items-center justify-center">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : p.petSpecies ? (
                            <Dog className="w-5 h-5 text-[#C85A32]/70" />
                          ) : p.dietaryType || p.isGlutenFree ? (
                            <Apple className="w-5 h-5 text-[#246A48]/70" />
                          ) : (
                            <Package className="w-5 h-5 text-[#8A908D]" />
                          )}
                        </div>

                        <div>
                          <div className="font-bold text-[#1C201E] text-xs sm:text-sm flex items-center gap-1.5 flex-wrap">
                            <span>{p.name}</span>
                            {!isItemActive && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-700">
                                Inactivo
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-[#8A908D] font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                            {p.brand && (
                              <span className="font-semibold text-[#C85A32]">
                                {p.brand} •
                              </span>
                            )}
                            <span>SKU: {p.sku}</span>
                            {p.subCategory && <span>• {p.subCategory}</span>}
                          </div>

                          {/* Badges de Atributos Especializados */}
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            {p.isGlutenFree && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Sin TACC
                              </span>
                            )}
                            {p.isVegan && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-green-50 text-green-800 border border-green-200">
                                Vegano
                              </span>
                            )}
                            {p.isOrganic && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-lime-50 text-lime-800 border border-lime-200">
                                Orgánico
                              </span>
                            )}
                            {p.petSpecies && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 capitalize">
                                🐾 {p.petSpecies}
                              </span>
                            )}
                            {p.isClosedBag && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 border border-blue-200">
                                Bolsa {p.packageWeightKg ? `${p.packageWeightKg}kg` : 'Cerrada'}
                              </span>
                            )}
                            {p.allowsFractional && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-800 border border-purple-200">
                                Fraccionable
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Código de barra */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#595E5B] bg-[#FAF8F4] px-2 py-0.5 rounded-md border border-[#E8E3DA]">
                        <Barcode className="w-3 h-3 text-[#8A908D]" />
                        {p.barcode}
                      </span>
                    </td>

                    {/* Rubro */}
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-md bg-[#FAF8F4] text-[#2B302D] text-[11px] font-semibold border border-[#E8E3DA] inline-block">
                        {p.category}
                      </span>
                      {p.dietaryType && (
                        <div className="text-[10px] text-[#246A48] mt-0.5 font-medium">
                          Tipo: {p.dietaryType.replace('_', ' ')}
                        </div>
                      )}
                    </td>

                    {/* Costo */}
                    <td className="py-3.5 px-3 text-right text-[#6F7572] font-medium">
                      {formatCurrency(p.costPrice)}
                    </td>

                    {/* Precio Venta */}
                    <td className="py-3.5 px-3 text-right font-bold text-[#1C201E] text-sm">
                      {formatCurrency(p.salePrice)}
                      {(p.unit.toLowerCase() === 'kg' || p.unit.toLowerCase().includes('kilo')) && (
                        <div className="text-[10px] text-[#8A908D] font-normal">
                          {formatCurrency(Math.round(p.salePrice / 10))} / 100g
                        </div>
                      )}
                    </td>

                    {/* Margen */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#EBF5EF] text-[#246A48] border border-[#CFE7DA]">
                        +{margin.toFixed(0)}%
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-3 text-center font-bold">
                      <span
                        className={
                          p.stock === 0
                            ? 'text-[#B84C26] font-black'
                            : p.stock <= p.minStock
                            ? 'text-[#9A6216]'
                            : 'text-[#1C201E]'
                        }
                      >
                        {p.stock} <span className="text-[11px] font-normal text-[#8A908D]">{p.unit}</span>
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {!isItemActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-300">
                          <EyeOff className="w-3 h-3" />
                          Inactivo
                        </span>
                      ) : p.status === 'disponible' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF5EF] text-[#246A48] border border-[#CFE7DA]">
                          <CheckCircle2 className="w-3 h-3" />
                          Disponible
                        </span>
                      ) : p.status === 'bajo_stock' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF6E9] text-[#9A6216] border border-[#FCE3B8]">
                          <AlertCircle className="w-3 h-3" />
                          Bajo Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FDF2ED] text-[#B84C26] border border-[#F7D3C4]">
                          <XCircle className="w-3 h-3" />
                          Agotado
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#FAF8F4] hover:bg-[#F3EFEA] text-[#1C201E] border border-[#E8E3DA] transition-colors cursor-pointer"
                        title="Editar producto"
                      >
                        <Edit2 className="w-3 h-3 text-[#C85A32]" />
                        <span>Editar</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer de la tabla */}
        <div className="p-4 border-t border-[#E8E3DA] bg-[#FAF8F4]/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6F7572]">
          <span>
            Mostrando <strong>{filteredProducts.length}</strong> de {productList.length} productos
          </span>
          <span className="text-[11px] text-[#8A908D]">
            COMERCIOS 360 • Padrón de Artículos Comercial v1.1
          </span>
        </div>
      </div>

      {/* Modal de Alta / Edición de Producto (Diseño Stitch) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1C201E]/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-2xl w-full border border-[#E8E3DA] shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto font-sans">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E8E3DA]">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#C85A32] bg-[#FDF7F4] px-2.5 py-0.5 rounded-md border border-[#F3D3C4] mb-1">
                  {editingProduct ? 'Modo Edición' : 'Nuevo Registro'}
                </span>
                <h3 className="text-xl font-serif font-bold text-[#1C201E]">
                  {editingProduct ? 'Editar Ficha de Producto' : 'Alta de Nuevo Producto'}
                </h3>
                <p className="text-xs text-[#6F7572] mt-0.5">
                  {editingProduct
                    ? 'Modifica los precios, marcas, stock y atributos especializados.'
                    : 'Carga los datos iniciales para el catálogo comercial.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#8A908D] hover:text-[#1C201E] hover:bg-[#FAF8F4] rounded-xl cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Sección Foto & Estado Activo */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F4] border border-[#E8E3DA] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 w-full sm:w-auto">
                  {/* Vista Previa de Foto */}
                  <div className="w-16 h-16 rounded-2xl border border-[#E8E3DA] bg-white shrink-0 overflow-hidden flex items-center justify-center shadow-xs">
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Previsualización"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#8A908D]" />
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-[#2B302D] text-xs">
                      Foto del Producto
                    </label>
                    <span className="text-[11px] text-[#6F7572] block mb-1.5">
                      Subir archivo desde el dispositivo o cámara
                    </span>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-lg bg-white hover:bg-[#F3EFEA] text-[#1C201E] border border-[#E8E3DA] shadow-xs cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#C85A32]" />
                        <span>{formData.imageUrl ? 'Cambiar foto' : 'Seleccionar foto'}</span>
                      </button>

                      {formData.imageUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg text-[#B84C26] hover:bg-[#FDF2ED] border border-[#F7D3C4] cursor-pointer"
                          title="Quitar foto"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Quitar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Switch Estado Activo / Inactivo */}
                <div className="flex items-center gap-3 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="block font-bold text-[#2B302D] text-xs">
                      Estado en Catálogo
                    </span>
                    <span className="text-[11px] text-[#6F7572]">
                      {formData.isActive ? 'Visible para venta' : 'Oculto / Inactivo'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formData.isActive ? 'bg-[#246A48]' : 'bg-[#D1D5DB]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formData.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Nombre del Producto */}
              <div>
                <label className="block font-bold text-[#2B302D] mb-1">
                  Nombre del Producto / Denominación Comercial *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Nueces Mariposa Blancas / Alimento Perro Adulto 15kg"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] focus:bg-white text-[#1C201E] focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition-colors"
                />
              </div>

              {/* Marca & Subcategoría */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2B302D] mb-1">
                    Marca Comercial
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Royal Canin, Granix, Heredia, Tratenfu"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] focus:bg-white text-[#1C201E] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2B302D] mb-1">
                    Subcategoría
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Frutos Secos, Alimento Seco, Harinas"
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] focus:bg-white text-[#1C201E] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              {/* SKU & Barcode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2B302D] mb-1">
                    Código SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] focus:bg-white text-[#1C201E] font-mono focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2B302D] mb-1">
                    Código de Barra (EAN-13) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] focus:bg-white text-[#1C201E] font-mono focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              {/* Categoría & Unidad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2B302D] mb-1">
                    Rubro / Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      const isDiet = newCat.includes('Dietética') || newCat.includes('Frutos') || newCat.includes('Semillas') || newCat.includes('Legumbres') || newCat.includes('Harinas');
                      const isPet = newCat.includes('Pet') || newCat.includes('Perro') || newCat.includes('Gato') || newCat.includes('Balanceados');

                      setFormData((prev) => ({
                        ...prev,
                        category: newCat,
                        hasDietaryProfile: isDiet ? true : prev.hasDietaryProfile,
                        hasPetProfile: isPet ? true : prev.hasPetProfile,
                      }));
                    }}
                    className="w-full p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] focus:bg-white text-[#1C201E] focus:outline-none focus:border-[#C85A32]"
                  >
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#2B302D] mb-1">
                    Unidad de Medida Base *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => {
                      const newUnit = e.target.value;
                      const isWeight = newUnit === 'Kg' || newUnit === 'Gramo';
                      setFormData({
                        ...formData,
                        unit: newUnit,
                        allowsFractional: isWeight ? true : formData.allowsFractional,
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] focus:bg-white text-[#1C201E] focus:outline-none focus:border-[#C85A32]"
                  >
                    <option value="Unidad">Unidad (u.)</option>
                    <option value="Kg">Kilogramo (Kg)</option>
                    <option value="Gramo">Gramo (g)</option>
                    <option value="Bolsa">Bolsa</option>
                    <option value="Paquete">Paquete</option>
                    <option value="Pote">Pote</option>
                    <option value="Botella">Botella</option>
                    <option value="Litro">Litro (L)</option>
                  </select>
                </div>
              </div>

              {/* Venta Fraccionada & Pesaje */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F4] border border-[#E8E3DA] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#C85A32]" />
                    <div>
                      <span className="font-bold text-[#1C201E] text-xs block">
                        Venta Fraccionada / Pesable Suelto
                      </span>
                      <span className="text-[11px] text-[#6F7572]">
                        Habilita la venta en cantidades decimales (ej: 0.250 kg / 100g)
                      </span>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    id="allowsFractional"
                    checked={formData.allowsFractional}
                    onChange={(e) =>
                      setFormData({ ...formData, allowsFractional: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#C85A32] rounded cursor-pointer"
                  />
                </div>

                {formData.allowsFractional && (
                  <div className="pt-2 border-t border-[#E8E3DA] grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#6F7572] mb-1">
                        Paso Mínimo de Fraccionamiento
                      </label>
                      <select
                        value={formData.fractionalMinStep}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fractionalMinStep: Number(e.target.value),
                          })
                        }
                        className="w-full p-2 rounded-lg border border-[#E8E3DA] bg-white text-[#1C201E] text-xs"
                      >
                        <option value={0.05}>0.05 (50 gramos)</option>
                        <option value={0.1}>0.10 (100 gramos - Recomendado)</option>
                        <option value={0.25}>0.25 (250 gramos)</option>
                        <option value={0.5}>0.50 (Medio kilo / 500g)</option>
                        <option value={1}>1.00 (Kilogramo entero)</option>
                      </select>
                    </div>
                    <div className="flex items-end pb-1 text-[11px] text-[#595E5B]">
                      <span>Permite cobrar fracciones exactas pesadas en balanza.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Precios y Margen Dinámico */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F4] border border-[#E8E3DA] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#1C201E]">
                  <span>Estructura de Precios</span>
                  <span className="text-[#246A48] bg-[#EBF5EF] px-2 py-0.5 rounded-md border border-[#CFE7DA]">
                    Margen: +{calculatedMargin}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#6F7572] mb-1">
                      Costo Compra ($) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={formData.costPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, costPrice: Number(e.target.value) })
                      }
                      className="w-full p-2 rounded-lg border border-[#E8E3DA] bg-white text-[#1C201E] font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#6F7572] mb-1">
                      Precio de Venta ($) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={formData.salePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, salePrice: Number(e.target.value) })
                      }
                      className="w-full p-2 rounded-lg border border-[#E8E3DA] bg-white text-[#C85A32] font-black text-sm"
                    />
                  </div>
                </div>

                {pricePer100g !== null && (
                  <div className="text-[11px] text-[#246A48] bg-[#EBF5EF]/60 p-2 rounded-lg border border-[#CFE7DA]">
                    💡 <strong>Referencia por peso:</strong> Equivale a {formatCurrency(pricePer100g)} por cada 100 gramos.
                  </div>
                )}
              </div>

              {/* Stock Inicial & Mínimo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2B302D] mb-1">
                    Stock Físico Actual *
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    required
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] focus:bg-white text-[#1C201E] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2B302D] mb-1">
                    Stock Mínimo (Alerta) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    required
                    value={formData.minStock}
                    onChange={(e) =>
                      setFormData({ ...formData, minStock: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] focus:bg-white text-[#1C201E]"
                  />
                </div>
              </div>

              {/* ======================================================== */}
              {/* SECCIÓN CONDICIONAL: DIETÉTICA & PRODUCTOS NATURALES */}
              {/* ======================================================== */}
              <div className="rounded-2xl border border-[#CFE7DA] bg-[#EBF5EF]/30 overflow-hidden">
                <div
                  className="p-3 bg-[#EBF5EF]/70 flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      hasDietaryProfile: !formData.hasDietaryProfile,
                    })
                  }
                >
                  <div className="flex items-center gap-2">
                    <Apple className="w-4 h-4 text-[#246A48]" />
                    <span className="font-bold text-[#18452F] text-xs">
                      Atributos de Dietética & Productos Naturales
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#246A48] bg-white px-2 py-0.5 rounded-md border border-[#CFE7DA]">
                    {formData.hasDietaryProfile ? 'Habilitado' : 'Configurar'}
                  </span>
                </div>

                {formData.hasDietaryProfile && (
                  <div className="p-3.5 space-y-3 bg-white">
                    {/* Tipo de producto dietético */}
                    <div>
                      <label className="block font-bold text-[#2B302D] mb-1">
                        Tipo de Producto Dietético
                      </label>
                      <select
                        value={formData.dietaryType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dietaryType: e.target.value as DietaryType,
                          })
                        }
                        className="w-full p-2 rounded-lg border border-[#E8E3DA] bg-[#FAF8F4] text-[#1C201E] text-xs"
                      >
                        <option value="">Seleccione tipo de producto...</option>
                        <option value="frutos_secos">Frutos Secos</option>
                        <option value="semillas">Semillas</option>
                        <option value="legumbres_cereales">Legumbres y Cereales</option>
                        <option value="harinas_especiales">Harinas Especiales / Integrales</option>
                        <option value="especias_hierbas">Especias, Condimentos y Hierbas</option>
                        <option value="suplementos">Suplementos Nutricionales & Vitaminas</option>
                        <option value="reposteria">Repostería Saludable & Repostería</option>
                        <option value="general">Dietética General / Otro</option>
                      </select>
                    </div>

                    {/* Banderas dietéticas: Sin TACC, Vegano, Orgánico */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      <label className="flex items-center gap-2 p-2 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] hover:bg-[#F3EFEA] cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.isGlutenFree}
                          onChange={(e) =>
                            setFormData({ ...formData, isGlutenFree: e.target.checked })
                          }
                          className="w-4 h-4 accent-[#246A48] rounded"
                        />
                        <span className="font-bold text-[#1C201E] text-[11px]">
                          Sin TACC (Apto Celíacos)
                        </span>
                      </label>

                      <label className="flex items-center gap-2 p-2 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] hover:bg-[#F3EFEA] cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.isVegan}
                          onChange={(e) =>
                            setFormData({ ...formData, isVegan: e.target.checked })
                          }
                          className="w-4 h-4 accent-[#246A48] rounded"
                        />
                        <span className="font-bold text-[#1C201E] text-[11px]">
                          Vegano (Plant-Based)
                        </span>
                      </label>

                      <label className="flex items-center gap-2 p-2 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] hover:bg-[#F3EFEA] cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.isOrganic}
                          onChange={(e) =>
                            setFormData({ ...formData, isOrganic: e.target.checked })
                          }
                          className="w-4 h-4 accent-[#246A48] rounded"
                        />
                        <span className="font-bold text-[#1C201E] text-[11px]">
                          Orgánico / Agroecológico
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* ======================================================== */}
              {/* SECCIÓN CONDICIONAL: ALIMENTOS PARA MASCOTAS / PET SHOP */}
              {/* ======================================================== */}
              <div className="rounded-2xl border border-[#FCE3B8] bg-[#FEF6E9]/30 overflow-hidden">
                <div
                  className="p-3 bg-[#FEF6E9]/80 flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      hasPetProfile: !formData.hasPetProfile,
                    })
                  }
                >
                  <div className="flex items-center gap-2">
                    <Dog className="w-4 h-4 text-[#9A6216]" />
                    <span className="font-bold text-[#7A4B0B] text-xs">
                      Atributos de Pet Shop & Alimentos Balanceados
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#9A6216] bg-white px-2 py-0.5 rounded-md border border-[#FCE3B8]">
                    {formData.hasPetProfile ? 'Habilitado' : 'Configurar'}
                  </span>
                </div>

                {formData.hasPetProfile && (
                  <div className="p-3.5 space-y-3 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Especie */}
                      <div>
                        <label className="block font-bold text-[#2B302D] mb-1">
                          Especie Destino
                        </label>
                        <select
                          value={formData.petSpecies}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              petSpecies: e.target.value as PetSpecies,
                            })
                          }
                          className="w-full p-2 rounded-lg border border-[#E8E3DA] bg-[#FAF8F4] text-[#1C201E] text-xs"
                        >
                          <option value="">Seleccione especie...</option>
                          <option value="perro">Perro</option>
                          <option value="gato">Gato</option>
                          <option value="aves">Aves</option>
                          <option value="peces">Peces</option>
                          <option value="otra">Otra especie</option>
                        </select>
                      </div>

                      {/* Etapa de vida */}
                      <div>
                        <label className="block font-bold text-[#2B302D] mb-1">
                          Etapa de Vida
                        </label>
                        <select
                          value={formData.petStage}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              petStage: e.target.value as PetLifeStage,
                            })
                          }
                          className="w-full p-2 rounded-lg border border-[#E8E3DA] bg-[#FAF8F4] text-[#1C201E] text-xs"
                        >
                          <option value="">Seleccione etapa...</option>
                          <option value="cachorro">Cachorro / Puppy</option>
                          <option value="adulto">Adulto</option>
                          <option value="senior">Senior / Edad avanzada</option>
                          <option value="todas">Todas las etapas</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Peso nominal bolsa cerrada */}
                      <div>
                        <label className="block font-bold text-[#2B302D] mb-1">
                          Peso de la Bolsa Cerrada (Kg)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min={0}
                          placeholder="Ej: 1.5, 3, 7.5, 15, 20"
                          value={formData.packageWeightKg}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              packageWeightKg: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded-lg border border-[#E8E3DA] bg-[#FAF8F4] text-[#1C201E] text-xs"
                        />
                      </div>

                      {/* Indicador bolsa cerrada */}
                      <div className="flex items-center gap-2 pt-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.isClosedBag}
                            onChange={(e) =>
                              setFormData({ ...formData, isClosedBag: e.target.checked })
                            }
                            className="w-4 h-4 accent-[#9A6216] rounded"
                          />
                          <span className="font-bold text-[#1C201E] text-xs">
                            Presentación en bolsa cerrada de fábrica
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E8E3DA]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#FAF8F4] hover:bg-[#F3EFEA] text-[#1C201E] font-bold border border-[#E8E3DA] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B84C26] active:bg-[#9B3D1D] text-white font-bold shadow-sm shadow-[#C85A32]/25 cursor-pointer"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Registrar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
