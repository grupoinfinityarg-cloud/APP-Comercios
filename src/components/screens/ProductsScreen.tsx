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
} from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { Product } from '../../types';

interface ProductsScreenProps {
  products: Product[];
}

export const ProductsScreen: React.FC<ProductsScreenProps> = ({ products: initialProducts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [showAddModal, setShowAddModal] = useState(false);

  const categories = ['Todas', ...Array.from(new Set(initialProducts.map((p) => p.category)))];

  const filteredProducts = initialProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm);
    const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      <DemoNotice
        title="Módulo 3: Catálogo de Productos y Precios"
        description="Gestión integral de artículos, márgenes de ganancia, precios de costo y venta, códigos de barra y asignación por categorías."
      />

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Productos & Catálogo
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Administración de precios, códigos de barra y margen comercial
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, SKU o código de barra..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 shrink-0 font-medium">Categoría:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Producto & SKU</th>
                <th className="py-3 px-3">Código Barra</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3 text-right">Costo</th>
                <th className="py-3 px-3 text-right">Precio Venta</th>
                <th className="py-3 px-3 text-center">Margen</th>
                <th className="py-3 px-3 text-center">Stock</th>
                <th className="py-3 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredProducts.map((p) => {
                const margin = ((p.salePrice - p.costPrice) / p.costPrice) * 100;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">SKU: {p.sku}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {p.barcode}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px]">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500 font-medium">
                      {formatCurrency(p.costPrice)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(p.salePrice)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        +{margin.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold">
                      <span
                        className={
                          p.stock === 0
                            ? 'text-rose-600'
                            : p.stock <= p.minStock
                            ? 'text-amber-600'
                            : 'text-slate-900 dark:text-white'
                        }
                      >
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {p.status === 'disponible' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          Disponible
                        </span>
                      )}
                      {p.status === 'bajo_stock' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                          <AlertCircle className="w-3 h-3" />
                          Bajo Stock
                        </span>
                      )}
                      {p.status === 'agotado' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300">
                          <XCircle className="w-3 h-3" />
                          Agotado
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulated Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Alta de Nuevo Producto
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Carga los datos iniciales del artículo para el catálogo comercial.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Aviso de demostración: Los productos se guardarán en la base de datos una vez conectada la API en la próxima fase.');
                setShowAddModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  placeholder="Ej: Fideos Tallarines 500g"
                  defaultValue="Fideos Tallarines 500g"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Código de Barra (EAN-13)
                  </label>
                  <input
                    type="text"
                    defaultValue="7791230045612"
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Categoría
                  </label>
                  <select className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">
                    <option>Almacén</option>
                    <option>Bebidas</option>
                    <option>Lácteos</option>
                    <option>Snacks</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Precio Costo ($)
                  </label>
                  <input
                    type="number"
                    defaultValue={950}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Precio Venta ($)
                  </label>
                  <input
                    type="number"
                    defaultValue={1600}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Guardar Producto (Demo)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
