import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { Employee } from '../../types';
import { DEMO_EMPLOYEES } from '../../data/demoData';

interface LoginScreenProps {
  onLogin: (employee: Employee) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<'Administrador' | 'Encargado' | 'Cajero'>('Administrador');
  const [email, setEmail] = useState('martin.gomez@comercios360.demo');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);

  const handleRoleSelect = (role: 'Administrador' | 'Encargado' | 'Cajero') => {
    setSelectedRole(role);
    const emp = DEMO_EMPLOYEES.find((e) => e.role === role);
    if (emp) {
      setEmail(emp.email);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = DEMO_EMPLOYEES.find((e) => e.role === selectedRole) || DEMO_EMPLOYEES[0];
    onLogin(emp);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background subtle radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Brand Story & System Features */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/25">
              360
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                COMERCIOS <span className="text-blue-500">360</span>
              </h1>
              <p className="text-sm text-slate-400 font-medium">
                Sistema Integral de Gestión Comercial
              </p>
            </div>
          </div>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Plataforma profesional diseñada para administrar comercios minoristas y mayoristas:
            puntos de venta, inventario multi-sucursal, cuentas corrientes, compras, caja y reportes en tiempo real.
          </p>

          {/* Value highlights */}
          <div className="space-y-3 pt-2">
            {[
              '16 módulos comerciales integrados y navegación fluida',
              'Control preciso de stock, reposición y punto de reorden',
              'Gestión de clientes, límites y deudas en cuenta corriente',
              'Arqueos de caja diarios, métodos de cobro y registro de gastos',
            ].map((feat, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
            <Building2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Arquitectura modular React + TypeScript</span>
              <p className="mt-0.5">
                Diseñado para operar en cualquier pantalla (celulares, tablets y computadoras) con datos de demostración interactivos.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
            
            {/* Header of the Card */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Acceso Demostración
                </span>
                <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                  Fase 1 Previa
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">Ingreso al Sistema</h2>
              <p className="text-xs text-slate-400 mt-1">
                Selecciona un perfil de prueba para explorar los 16 módulos comerciales.
              </p>
            </div>

            {/* Role Switcher Pills */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Seleccionar perfil de acceso de prueba:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Administrador', 'Encargado', 'Cajero'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all text-center border ${
                      selectedRole === role
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    aria-label="Ver u ocultar contraseña"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Demo Notice Warning */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div className="text-[11px] leading-relaxed text-amber-200">
                  <strong className="font-semibold block text-amber-300">Modo de demostración visual</strong>
                  No existe base de datos ni autenticación remota configurada todavía. El inicio de sesión es una demostración directa para explorar la app.
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>Ingresar a COMERCIOS 360</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-4 text-center">
              <span className="text-[11px] text-slate-500">
                COMERCIOS 360 • Versión Inicial de Arquitectura & Prototipo
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
