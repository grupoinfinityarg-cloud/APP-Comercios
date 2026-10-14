import React, { useState } from 'react';
import {
  Settings,
  Building,
  Printer,
  Coins,
  Shield,
  Save,
  Database,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { DemoNotice } from '../DemoNotice';

export const SettingsScreen: React.FC = () => {
  const [companyName, setCompanyName] = useState('COMERCIOS 360 SRL');
  const [taxId, setTaxId] = useState('30-71889922-3');
  const [currencySymbol, setCurrencySymbol] = useState('ARS ($)');
  const [printerFormat, setPrinterFormat] = useState('80mm');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <DemoNotice
        title="Módulo 16: Configuración del Sistema & Próximos Pasos"
        description="Parámetros comerciales, impresoras térmicas de tickets y guía técnica de arquitectura para la futura conexión de base de datos y autenticación."
      />

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Configuración General
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Identidad fiscal de la empresa, periféricos de punto de venta y parámetros del sistema
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 rounded-xl text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Configuración guardada en memoria local</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Fiscal & POS Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white">
              <Building className="w-4 h-4 text-blue-600" />
              <span>Datos Fiscales del Negocio</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Razón Social / Nombre Comercial
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  CUIT / Identificación Fiscal
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dirección Comercial Central
                </label>
                <input
                  type="text"
                  defaultValue="Av. Corrientes 1420, CABA"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Moneda Principal
                </label>
                <select
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="ARS ($)">Peso Argentino ($ ARS)</option>
                  <option value="USD ($)">Dólar Estadounidense ($ USD)</option>
                  <option value="EUR (€)">Euro (€ EUR)</option>
                  <option value="CLP ($)">Peso Chileno ($ CLP)</option>
                  <option value="UYU ($)">Peso Uruguayo ($ UYU)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2 pb-3 text-sm font-bold text-slate-900 dark:text-white">
                <Printer className="w-4 h-4 text-indigo-600" />
                <span>Impresora de Comprobantes & Tickets</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ancho de papel de ticketera
                  </label>
                  <select
                    value={printerFormat}
                    onChange={(e) => setPrinterFormat(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="80mm">Térmica 80mm (Estándar comercial)</option>
                    <option value="58mm">Térmica 58mm (Compacta portátil)</option>
                    <option value="A4">Impresora estándar A4</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Leyenda al pie del ticket
                  </label>
                  <input
                    type="text"
                    defaultValue="¡Muchas gracias por su compra! Vuelva pronto."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Configuración (Demo)</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Info: Architecture Roadmap & Database Guide (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-5 border border-slate-800 shadow-md space-y-4 text-xs">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
              <Database className="w-4 h-4" />
              <span>Hoja de Ruta: Próximos Pasos</span>
            </div>

            <p className="text-slate-300 leading-relaxed text-[11px]">
              La aplicación <strong>COMERCIOS 360</strong> ya cuenta con una arquitectura modular completa en React y TypeScript con los 16 módulos solicitados y diseño adaptable.
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <span className="font-bold text-white block">1. Conexión de Base de Datos Real</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Reemplazar <code className="text-blue-400">demoData.ts</code> por una base de datos relacional (PostgreSQL / Cloud SQL) o NoSQL (Firestore) con tablas para comercios, stock, ventas, movimientos de caja y clientes.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <span className="font-bold text-white block">2. Autenticación y Cuentas de Usuario</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Conectar el login a un proveedor seguro (Firebase Auth o JWT) para validar usuarios, contraseñas y permisos RBAC de cajeros y administradores.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <span className="font-bold text-white block">3. Facturación Electrónica Fiscal</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Conexión con webservices fiscales (AFIP / SAT / SII) para comprobantes con validez fiscal y CAE.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400">
              Esta versión visual y funcional permite validar la experiencia de usuario antes de desplegar recursos en la nube.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
