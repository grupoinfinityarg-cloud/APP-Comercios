import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Edit2,
  X,
  UserCheck,
  Building2,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { Customer } from '../../types';

interface CustomersScreenProps {
  customers: Customer[];
}

export const CustomersScreen: React.FC<CustomersScreenProps> = ({ customers: initialCustomers }) => {
  // Local state for client list (in-memory demo session without modifying shared architecture)
  const [customerList, setCustomerList] = useState<Customer[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Todas' | 'Minorista' | 'Mayorista' | 'Empresa'>('Todas');
  const [selectedStatus, setSelectedStatus] = useState<'Todos' | 'Activo' | 'Moroso' | 'Suspendido'>('Todos');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    email: '',
    phone: '',
    address: '',
    creditLimit: 50000,
    category: 'Minorista' as Customer['category'],
    status: 'Activo' as Customer['status'],
  });

  // Filtered list
  const filteredCustomers = customerList.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Todas' || c.category === selectedCategory;
    const matchesStatus = selectedStatus === 'Todos' || c.status === selectedStatus;

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
    setEditingCustomer(null);
    setFormData({
      name: '',
      document: 'DNI ' + Math.floor(25000000 + Math.random() * 20000000),
      email: '',
      phone: '+54 11 ' + Math.floor(4000 + Math.random() * 5000) + '-' + Math.floor(1000 + Math.random() * 9000),
      address: 'Av. Corrientes 2450, CABA',
      creditLimit: 60000,
      category: 'Minorista',
      status: 'Activo',
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      document: customer.document,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      creditLimit: customer.creditLimit,
      category: customer.category,
      status: customer.status,
    });
    setShowModal(true);
  };

  // Handle Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCustomer) {
      // Edit existing
      setCustomerList((prev) =>
        prev.map((c) =>
          c.id === editingCustomer.id
            ? {
                ...c,
                name: formData.name,
                document: formData.document,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                creditLimit: Number(formData.creditLimit),
                category: formData.category,
                status: formData.status,
              }
            : c
        )
      );
    } else {
      // Create new
      const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        name: formData.name,
        document: formData.document,
        email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@email.demo`,
        phone: formData.phone,
        address: formData.address,
        balance: 0, // Inicia con saldo en 0
        creditLimit: Number(formData.creditLimit),
        category: formData.category,
        status: formData.status,
      };
      setCustomerList((prev) => [newCustomer, ...prev]);
    }

    setShowModal(false);
  };

  // KPI Calculations
  const totalCustomers = customerList.length;
  const wholesaleCount = customerList.filter((c) => c.category === 'Mayorista' || c.category === 'Empresa').length;
  const inDebtCustomers = customerList.filter((c) => c.balance < 0);
  const totalDebtAmount = inDebtCustomers.reduce((acc, c) => acc + Math.abs(c.balance), 0);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Banner de Aviso de Demostración */}
      <DemoNotice
        title="Módulo de Clientes & Padrón Comercial"
        description="Gestión unificada de clientes minoristas, mayoristas y cuentas corporativas. En esta etapa los registros se guardan y modifican en la memoria local de la sesión de prueba."
      />

      {/* Encabezado Editorial del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E3DA]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C85A32] bg-[#FDF7F4] px-2.5 py-0.5 rounded-full border border-[#F3D3C4]">
              Directorio Comercial • 16 Secciones
            </span>
            <span className="text-xs text-[#8A908D]">
              {totalCustomers} cuentas registradas
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C201E] tracking-tight">
            Padrón de Clientes
          </h1>
          <p className="text-xs sm:text-sm text-[#595E5B] mt-0.5">
            Administración de cuentas corrientes, condiciones fiscales, límites de crédito comercial y datos de contacto.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C85A32] hover:bg-[#B84C26] active:bg-[#9B3D1D] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm shadow-[#C85A32]/20 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrar Cliente</span>
        </button>
      </div>

      {/* Métricas Resumen del Padrón (Estilo Warm Editorial) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Cuentas */}
        <div className="bg-white rounded-2xl p-4 border border-[#E8E3DA] shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#6F7572] block">
            Total Clientes
          </span>
          <div className="text-xl sm:text-2xl font-bold text-[#1C201E] mt-1">
            {totalCustomers} <span className="text-xs font-normal text-[#8A908D]">cuentas</span>
          </div>
          <span className="text-[11px] text-[#246A48] mt-1 block font-medium">
            Minoristas y empresas
          </span>
        </div>

        {/* Cuentas Mayoristas / Corporativas */}
        <div className="bg-white rounded-2xl p-4 border border-[#E8E3DA] shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#6F7572] block">
            Cuentas Mayoristas
          </span>
          <div className="text-xl sm:text-2xl font-bold text-[#2C4A6F] mt-1">
            {wholesaleCount} <span className="text-xs font-normal text-[#8A908D]">clientes</span>
          </div>
          <span className="text-[11px] text-[#595E5B] mt-1 block">
            Condición comercial especial
          </span>
        </div>

        {/* Clientes con Deuda en Cuenta Corriente */}
        <div className="bg-white rounded-2xl p-4 border border-[#E8E3DA] shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#6F7572] block">
            Con Saldo Deudor
          </span>
          <div className="text-xl sm:text-2xl font-bold text-[#B84C26] mt-1">
            {inDebtCustomers.length} <span className="text-xs font-normal text-[#8A908D]">cuentas</span>
          </div>
          <span className="text-[11px] text-[#B84C26] mt-1 block font-medium">
            Saldo deudor: {formatCurrency(totalDebtAmount)}
          </span>
        </div>

        {/* Estado del Padrón */}
        <div className="bg-white rounded-2xl p-4 border border-[#E8E3DA] shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#6F7572] block">
            Cuentas al Día
          </span>
          <div className="text-xl sm:text-2xl font-bold text-[#246A48] mt-1">
            {totalCustomers - inDebtCustomers.length} <span className="text-xs font-normal text-[#8A908D]">al día</span>
          </div>
          <span className="text-[11px] text-[#246A48] mt-1 block font-medium">
            Línea crediticia habilitada
          </span>
        </div>

      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8E3DA] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Buscador en vivo */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#8A908D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, DNI, CUIT, teléfono..."
            className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl bg-[#FAF8F4] border border-[#E8E3DA] text-[#1C201E] placeholder-[#8A908D] focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition-colors"
          />
        </div>

        {/* Selector de Categoría */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-[#6F7572] shrink-0">Categoría:</span>
          {(['Todas', 'Minorista', 'Mayorista', 'Empresa'] as const).map((cat) => (
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

      {/* Tabla Editorial de Clientes */}
      <div className="bg-white rounded-2xl border border-[#E8E3DA] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-[#FAF8F4] text-[#6F7572] uppercase text-[10px] tracking-wider border-b border-[#E8E3DA]">
              <tr>
                <th className="py-3 px-4 font-bold">Cliente / Razón Social</th>
                <th className="py-3 px-3 font-bold">Identificación</th>
                <th className="py-3 px-3 font-bold">Contacto</th>
                <th className="py-3 px-3 font-bold">Categoría</th>
                <th className="py-3 px-3 text-right font-bold">Límite Crédito</th>
                <th className="py-3 px-3 text-right font-bold">Saldo Cta. Cte.</th>
                <th className="py-3 px-3 text-center font-bold">Estado</th>
                <th className="py-3 px-4 text-center font-bold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3EFEA]">
              {filteredCustomers.map((c) => {
                const hasDebt = c.balance < 0;
                const inFavor = c.balance > 0;

                return (
                  <tr key={c.id} className="hover:bg-[#FAF8F4] transition-colors">
                    
                    {/* Nombre y Dirección */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#1C201E] text-xs sm:text-sm">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-[#8A908D] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[200px]">{c.address}</span>
                      </div>
                    </td>

                    {/* Documento / DNI / CUIT */}
                    <td className="py-3.5 px-3">
                      <span className="font-mono text-[11px] text-[#595E5B] bg-[#FAF8F4] px-2 py-0.5 rounded-md border border-[#E8E3DA]">
                        {c.document}
                      </span>
                    </td>

                    {/* Teléfono y Email */}
                    <td className="py-3.5 px-3 text-[#595E5B]">
                      <div className="font-semibold text-[#1C201E]">{c.phone}</div>
                      <div className="text-[11px] text-[#8A908D]">{c.email}</div>
                    </td>

                    {/* Categoría */}
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-md bg-[#FAF8F4] text-[#2B302D] text-[11px] font-semibold border border-[#E8E3DA]">
                        {c.category}
                      </span>
                    </td>

                    {/* Límite de Crédito */}
                    <td className="py-3.5 px-3 text-right text-[#6F7572] font-medium">
                      {formatCurrency(c.creditLimit)}
                    </td>

                    {/* Saldo de Cuenta Corriente */}
                    <td className="py-3.5 px-3 text-right font-bold text-sm">
                      {hasDebt ? (
                        <span className="text-[#B84C26]">
                          {formatCurrency(c.balance)}
                        </span>
                      ) : inFavor ? (
                        <span className="text-[#246A48]">
                          +{formatCurrency(c.balance)}
                        </span>
                      ) : (
                        <span className="text-[#8A908D] font-normal">$0</span>
                      )}
                    </td>

                    {/* Estado de Cuenta */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {c.status === 'Activo' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF5EF] text-[#246A48] border border-[#CFE7DA]">
                          <CheckCircle2 className="w-3 h-3" />
                          Activo
                        </span>
                      )}
                      {c.status === 'Moroso' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FDF2ED] text-[#B84C26] border border-[#F7D3C4]">
                          <AlertCircle className="w-3 h-3" />
                          Moroso
                        </span>
                      )}
                      {c.status === 'Suspendido' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF8F4] text-[#8A908D] border border-[#E8E3DA]">
                          <XCircle className="w-3 h-3" />
                          Suspendido
                        </span>
                      )}
                    </td>

                    {/* Acción */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(c)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#FAF8F4] hover:bg-[#F3EFEA] text-[#1C201E] border border-[#E8E3DA] transition-colors cursor-pointer"
                        title="Editar datos del cliente"
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
            Mostrando <strong>{filteredCustomers.length}</strong> de {customerList.length} clientes
          </span>
          <span className="text-[11px] text-[#8A908D]">
            COMERCIOS 360 • Padrón de Cuentas Comerciales
          </span>
        </div>
      </div>

      {/* Modal de Registro / Edición de Cliente (Diseño Stitch) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C201E]/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-[#E8E3DA] shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto font-sans">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E8E3DA]">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#C85A32] bg-[#FDF7F4] px-2.5 py-0.5 rounded-md border border-[#F3D3C4] mb-1">
                  {editingCustomer ? 'Modo Edición' : 'Nueva Cuenta'}
                </span>
                <h3 className="text-xl font-serif font-bold text-[#1C201E]">
                  {editingCustomer ? 'Editar Datos del Cliente' : 'Registrar Nuevo Cliente'}
                </h3>
                <p className="text-xs text-[#6F7572] mt-0.5">
                  {editingCustomer
                    ? 'Actualiza los datos de facturación, contacto y límite crediticio.'
                    : 'Carga los datos iniciales para el padrón y cuenta corriente.'}
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
              
              {/* Nombre o Razón Social */}
              <div>
                <label className="block font-bold text-[#2B302D] mb-1">
                  Nombre Completo / Razón Social
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Distribuidora Los Aromos SRL o Juan Pérez"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] focus:bg-white text-[#1C201E] focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition-colors"
                />
              </div>

              {/* Documento & Categoría */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2B302D] mb-1">
                    Documento (DNI o CUIT)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="DNI 35.120.450 o CUIT 30-..."
                    value={formData.document}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] focus:bg-white text-[#1C201E] font-mono focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2B302D] mb-1">
                    Categoría de Cliente
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Customer['category'] })}
                    className="w-full p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] focus:bg-white text-[#1C201E] focus:outline-none focus:border-[#C85A32]"
                  >
                    <option value="Minorista">Minorista</option>
                    <option value="Mayorista">Mayorista</option>
                    <option value="Empresa">Empresa</option>
                  </select>
                </div>
              </div>

              {/* Teléfono & Correo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2B302D] mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+54 11 4455-6677"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] focus:bg-white text-[#1C201E] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2B302D] mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="contacto@cliente.demo"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] focus:bg-white text-[#1C201E] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label className="block font-bold text-[#2B302D] mb-1">
                  Dirección Comercial / Entrega
                </label>
                <input
                  type="text"
                  placeholder="Calle, número, localidad..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] focus:bg-white text-[#1C201E] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              {/* Límite de Crédito & Estado */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2B302D] mb-1">
                    Límite Crédito Cta. Cte. ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] focus:bg-white text-[#1C201E] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2B302D] mb-1">
                    Estado de la Cuenta
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Customer['status'] })}
                    className="w-full p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] focus:bg-white text-[#1C201E] focus:outline-none focus:border-[#C85A32]"
                  >
                    <option value="Activo">Activo (Habilitado)</option>
                    <option value="Moroso">Moroso (Alerta)</option>
                    <option value="Suspendido">Suspendido (Bloqueado)</option>
                  </select>
                </div>
              </div>

              {/* Demo Notice */}
              <div className="p-3 bg-[#FDF7F4] border border-[#F3D3C4] rounded-xl text-[#7C321B] text-[11px] leading-relaxed">
                <strong>Aviso de Demostración:</strong> En esta fase los clientes creados o modificados se actualizan en tiempo real en la memoria de la sesión local. No se utilizan datos de personas reales.
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
                  {editingCustomer ? 'Actualizar Cuenta' : 'Guardar Cliente'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
