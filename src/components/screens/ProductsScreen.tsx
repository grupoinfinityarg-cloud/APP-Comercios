import React, { useState } from 'react';
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
} from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { Product, Employee, Store } from '../../types';
import { CreateAuditEventParams } from '../../utils/auditLogger';

interface ProductsScreenProps {
  products: Product[];
  currentUser?: Employee;
  activeStore?: Store;
  onAuditLog?: (params: CreateAuditEventParams) => void;
  onUpdateProducts?: (products: Product[]) => void;
}

export const ProductsScreen: React.FC<ProductsScreenProps> = ({
  products: initialProducts,
  currentUser,
  activeStore,
  onAuditLog,
  onUpdateProducts,
}) => {
  // Local state for product list (allows in-session creation and editing without altering global architecture)
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState<'todos' | 'disponible' | 'bajo_stock' | 'agotado'>('todos');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: 'Almacén',
    costPrice: 1000,
    salePrice: 1650,
    stock: 20,
    minStock: 10,
    unit: 'Unidad',
  });

  const categories = ['Todas', ...Array.from(new Set(initialProducts.map((p) => p.category)))];

  // Filtering
  const filteredProducts = productList.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm);
    const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'todos' || p.status === selectedStatus;
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
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
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
    });
    setShowModal(true);
  };

  // Calculate margin in real time
  const calculatedMargin = formData.costPrice > 0
    ? (((formData.salePrice - formData.costPrice) / formData.costPrice) * 100).toFixed(1)
    : '0';

  // Handle Form Submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let computedStatus: Product['status'] = 'disponible';
    if (formData.stock === 0) {
      computedStatus = 'agotado';
    } else if (formData.stock <= formData.minStock) {
      computedStatus = 'bajo_stock';
    }

    if (editingProduct) {
      // Detect which fields actually changed
      const changes: string[] = [];
      const trimmedName = formData.name.trim();
      const numSalePrice = Number(formData.salePrice);
      const numCostPrice = Number(formData.costPrice);
      const numStock = Number(formData.stock);
      const numMinStock = Number(formData.minStock);
      const trimmedSku = formData.sku.trim();
      const trimmedBarcode = formData.barcode.trim();

      if (trimmedName !== editingProduct.name) {
        changes.push(`Nombre: "${editingProduct.name}" -> "${trimmedName}"`);
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
      };

      // Update existing in state
      const updatedList = productList.map((p) =>
        p.id === editingProduct.id ? updatedProduct : p
      );
      setProductList(updatedList);
      if (onUpdateProducts) {
        onUpdateProducts(updatedList);
      }

      // Only record audit event if actual modifications were saved
      if (changes.length > 0 && onAuditLog) {
        let previousVal = '';
        let newVal = '';
        if (numSalePrice !== editingProduct.salePrice || numCostPrice !== editingProduct.costPrice) {
          previousVal = `Venta: $${editingProduct.salePrice.toLocaleString('es-AR')} | Costo: $${editingProduct.costPrice.toLocaleString('es-AR')}`;
          newVal = `Venta: $${numSalePrice.toLocaleString('es-AR')} | Costo: $${numCostPrice.toLocaleString('es-AR')}`;
        } else if (trimmedName !== editingProduct.name) {
          previousVal = `Nombre: ${editingProduct.name}`;
          newVal = `Nombre: ${trimmedName}`;
        } else {
          previousVal = changes[0].split(' -> ')[0];
          newVal = changes[0].split(' -> ')[1] || '';
        }

        onAuditLog({
          module: 'Productos',
          action: `Modificación de producto: ${trimmedName}`,
          category: 'operation',
          status: 'exitoso',
          details: `Modificación en ficha de producto "${trimmedName}" (ID: ${editingProduct.id}): ${changes.join('; ')}.`,
          entityId: editingProduct.id,
          previousValue: previousVal,
          newValue: newVal,
          severity: 'baja',
          currentUser: currentUser ? { name: currentUser.name, role: currentUser.role, id: currentUser.id } : null,
          currentStore: activeStore ? { name: activeStore.name, id: activeStore.id } : null,
        });
      }
    } else {
      // Create new
      const trimmedName = formData.name.trim();
      const numSalePrice = Number(formData.salePrice);
      const numCostPrice = Number(formData.costPrice);
      const numStock = Number(formData.stock);
      const numMinStock = Number(formData.minStock);

      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: trimmedName,
        sku: formData.sku.trim(),
        barcode: formData.barcode.trim(),
        category: formData.category,
        costPrice: numCostPrice,
        salePrice: numSalePrice,
        stock: numStock,
        minStock: numMinStock,
        unit: formData.unit,
        status: computedStatus,
        storeId: activeStore?.id || 'store-1',
      };

      const updatedList = [newProd, ...productList];
      setProductList(updatedList);
      if (onUpdateProducts) {
        onUpdateProducts(updatedList);
      }

      // Record audit event for product creation
      if (onAuditLog) {
        onAuditLog({
          module: 'Productos',
          action: 'Alta de producto',
          category: 'operation',
          status: 'exitoso',
          details: `Alta de nuevo producto en catálogo: "${trimmedName}" (SKU: ${newProd.sku}, Rubro: ${newProd.category}). Precio venta: $${numSalePrice.toLocaleString('es-AR')}, Costo: $${numCostPrice.toLocaleString('es-AR')}, Stock inicial: ${numStock} ${newProd.unit}.`,
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
        description="Gestión integral de artículos, códigos de barra, márgenes de utilidad comercial y categorización. En esta etapa los cambios se procesan en la sesión local en memoria."
      />

      {/* Encabezado Editorial del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E3DA]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C85A32] bg-[#FDF7F4] px-2.5 py-0.5 rounded-full border border-[#F3D3C4]">
              Maestro Comercial • 16 Secciones
            </span>
            <span className="text-xs text-[#8A908D]">
              {totalProducts} artículos registrados
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C201E] tracking-tight">
            Productos & Catálogo
          </h1>
          <p className="text-xs sm:text-sm text-[#595E5B] mt-0.5">
            Administración de precios de venta, costos mayoristas, márgenes de ganancia y códigos EAN-13.
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
            Sincronizado en 3 locales
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
            placeholder="Buscar por nombre, SKU o código de barra..."
            className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl bg-[#FAF8F4] border border-[#E8E3DA] text-[#1C201E] placeholder-[#8A908D] focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition-colors"
          />
        </div>

        {/* Filtros de Categoría y Estado */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-[#6F7572] shrink-0">Rubro:</span>
          {categories.map((cat) => (
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
        </div>
      </div>

      {/* Tabla Editorial de Productos */}
      <div className="bg-white rounded-2xl border border-[#E8E3DA] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="bg-[#FAF8F4] text-[#6F7572] uppercase text-[10px] tracking-wider border-b border-[#E8E3DA]">
              <tr>
                <th className="py-3 px-4 font-bold">Producto & SKU</th>
                <th className="py-3 px-3 font-bold">Código EAN-13</th>
                <th className="py-3 px-3 font-bold">Rubro</th>
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
                return (
                  <tr key={p.id} className="hover:bg-[#FAF8F4] transition-colors">
                    
                    {/* Producto & SKU */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#1C201E] text-xs sm:text-sm">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-[#8A908D] font-mono mt-0.5">
                        SKU: {p.sku}
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
                      <span className="px-2.5 py-1 rounded-md bg-[#FAF8F4] text-[#2B302D] text-[11px] font-semibold border border-[#E8E3DA]">
                        {p.category}
                      </span>
                    </td>

                    {/* Costo */}
                    <td className="py-3.5 px-3 text-right text-[#6F7572] font-medium">
                      {formatCurrency(p.costPrice)}
                    </td>

                    {/* Precio Venta */}
                    <td className="py-3.5 px-3 text-right font-bold text-[#1C201E] text-sm">
                      {formatCurrency(p.salePrice)}
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
                      {p.status === 'disponible' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF5EF] text-[#246A48] border border-[#CFE7DA]">
                          <CheckCircle2 className="w-3 h-3" />
                          Disponible
                        </span>
                      )}
                      {p.status === 'bajo_stock' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF6E9] text-[#9A6216] border border-[#FCE3B8]">
                          <AlertCircle className="w-3 h-3" />
                          Bajo Stock
                        </span>
                      )}
                      {p.status === 'agotado' && (
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
            COMERCIOS 360 • Padrón de Artículos Comercial v1.0
          </span>
        </div>
      </div>

      {/* Modal de Alta / Edición de Producto (Diseño Stitch) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C201E]/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-[#E8E3DA] shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto font-sans">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E8E3DA]">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#C85A32] bg-[#FDF7F4] px-2.5 py-0.5 rounded-md border border-[#F3D3C4] mb-1">
                  {editingProduct ? 'Modo Edición' : 'Nuevo Registro'}
                </span>
                <h3 className="text-xl font-serif font-bold text-[#1C201E]">
                  {editingProduct ? 'Editar Producto' : 'Alta de Nuevo Producto'}
                </h3>
                <p className="text-xs text-[#6F7572] mt-0.5">
                  {editingProduct
                    ? 'Modifica los precios, stock y datos del artículo.'
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
            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              
              {/* Nombre */}
              <div>
                <label className="block font-bold text-[#2B302D] mb-1">
                  Nombre del Producto / Descripción
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Café Tostado en Grano 1kg"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] focus:bg-white text-[#1C201E] focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition-colors"
                />
              </div>

              {/* SKU & Barcode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2B302D] mb-1">
                    Código SKU
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
                    Código de Barra (EAN-13)
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2B302D] mb-1">
                    Rubro / Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] focus:bg-white text-[#1C201E] focus:outline-none focus:border-[#C85A32]"
                  >
                    <option>Almacén</option>
                    <option>Bebidas</option>
                    <option>Lácteos</option>
                    <option>Snacks</option>
                    <option>Alimentos y Bebidas</option>
                    <option>Limpieza</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#2B302D] mb-1">
                    Unidad de Medida
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] focus:bg-white text-[#1C201E] focus:outline-none focus:border-[#C85A32]"
                  >
                    <option>Unidad</option>
                    <option>Botella</option>
                    <option>Paquete</option>
                    <option>Kg</option>
                    <option>Pote</option>
                  </select>
                </div>
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
                      Costo Compra ($)
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-[#E8E3DA] bg-white text-[#1C201E] font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#6F7572] mb-1">
                      Precio de Venta ($)
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-[#E8E3DA] bg-white text-[#C85A32] font-black text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Stock Inicial & Mínimo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2B302D] mb-1">
                    Stock Físico Actual
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] focus:bg-white text-[#1C201E] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2B302D] mb-1">
                    Stock Mínimo (Alerta)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] focus:bg-white text-[#1C201E]"
                  />
                </div>
              </div>

              {/* Demo disclaimer */}
              <div className="p-3 bg-[#FDF7F4] border border-[#F3D3C4] rounded-xl text-[#7C321B] text-[11px] leading-relaxed">
                <strong>Aviso de Demostración:</strong> En esta fase los productos creados o editados se actualizan en tiempo real en la memoria de la sesión local.
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-2.5 pt-2">
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
                  {editingProduct ? 'Actualizar Producto' : 'Guardar Producto'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
