import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Store,
  UserCheck,
  CreditCard,
  Layers,
  Info,
  X,
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
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

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

  const handleQuickDemoAccess = () => {
    const emp = DEMO_EMPLOYEES.find((e) => e.role === selectedRole) || DEMO_EMPLOYEES[0];
    onLogin(emp);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#121614] text-[#111413] dark:text-[#F5F7F6] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans transition-colors">
      {/* Background warm ambient gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#C85A32]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#B84C26]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#EFEAE0]/40 dark:bg-[#1C221F]/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl relative z-10">
        
        {/* Top Floating Logo on Mobile */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#C85A32] flex items-center justify-center text-white font-black text-lg shadow-sm">
              360
            </div>
            <div>
              <span className="font-extrabold text-[#111413] dark:text-white tracking-tight text-lg">COMERCIOS</span>
              <span className="text-[#C85A32] font-black text-lg ml-1">360</span>
            </div>
          </div>
          <span className="text-xs font-bold text-[#B84C26] dark:text-[#FFA07A] bg-[#C85A32]/10 dark:bg-[#282F2C] px-3 py-1 rounded-full border border-[#C85A32]/20 dark:border-[#3A433E]">
            Modo Demo
          </span>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Warm Editorial Brand Story */}
          <div className="hidden lg:block lg:col-span-6 space-y-6 pr-4">
            
            {/* Brand Logo & Badges */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#C85A32] flex items-center justify-center text-white font-black text-xl shadow-md shadow-[#C85A32]/25 shrink-0">
                360
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black tracking-tight text-[#111413] dark:text-white">COMERCIOS</span>
                  <span className="bg-[#C85A32] text-white text-xs font-black px-2 py-0.5 rounded tracking-wide">
                    360
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#4B524E] dark:text-[#CBD2CE] font-medium tracking-wide">
                  Gestión Comercial & Puntos de Venta
                </p>
              </div>
            </div>

            {/* Editorial Title */}
            <div className="space-y-3 pt-2">
              <h1 className="text-3xl sm:text-4xl font-serif text-[#111413] dark:text-white font-bold leading-tight tracking-tight">
                El sistema profesional para administrar tus comercios con <span className="italic text-[#C85A32]">precisión y calidez</span>.
              </h1>
              <p className="text-sm sm:text-base text-[#4B524E] dark:text-[#CBD2CE] leading-relaxed">
                Centraliza tus puntos de venta, arqueos de caja, inventarios críticos, padrón de clientes y cuentas corrientes en una experiencia visual clara y cómoda para todo el día.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3 pt-2">
              {[
                { title: 'Inventario inteligente', desc: 'Control de stock físico, alertas de quiebre y valuación al costo.' },
                { title: 'Punto de venta y caja', desc: 'Emisión rápida de comprobantes, turnos y arqueos de efectivo.' },
                { title: 'Cuentas corrientes', desc: 'Gestión de créditos comerciales, saldos adeudados y cobranzas.' },
                { title: 'Multisucursal integrada', desc: 'Administración unificada de locales, depósitos y personal.' },
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#2B302D] dark:text-[#E5E9E6]">
                  <div className="w-5 h-5 rounded-full bg-[#C85A32]/10 dark:bg-[#282F2C] text-[#C85A32] dark:text-[#FFA07A] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#111413] dark:text-white">{feat.title}: </span>
                    <span className="text-[#4B524E] dark:text-[#CBD2CE]">{feat.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Aesthetic Tag */}
            <div className="p-4 rounded-2xl bg-[#F5F1E8] dark:bg-[#1E2421] border border-[#DCD6CC] dark:border-[#343D38] text-xs sm:text-sm text-[#4B524E] dark:text-[#CBD2CE] flex items-center gap-3">
              <Layers className="w-5 h-5 text-[#C85A32] shrink-0" />
              <span>
                Diseño editorial cálido adaptado para máxima legibilidad en computadoras, tablets y celulares.
              </span>
            </div>
          </div>

          {/* Right Column: Warm Login Card */}
          <div className="lg:col-span-6 w-full">
            <div className="bg-white dark:bg-[#1E2421] rounded-3xl p-6 sm:p-9 border border-[#DCD6CC] dark:border-[#343D38] shadow-xl shadow-[#111413]/5 transition-all">
              
              {/* Card Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#B84C26] dark:text-[#FFA07A] bg-[#FDF7F4] dark:bg-[#282F2C] px-3 py-1 rounded-md border border-[#F3D3C4] dark:border-[#3A433E]">
                    <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                    Acceso Demostración
                  </span>
                  <span className="text-xs text-[#5D6561] dark:text-[#CBD2CE] font-semibold">
                    Versión previa v1.0
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#111413] dark:text-white">
                  Iniciar Sesión
                </h2>
                <p className="text-xs sm:text-sm text-[#4B524E] dark:text-[#CBD2CE] mt-1">
                  Ingresa tus credenciales o selecciona un perfil para explorar el sistema.
                </p>
              </div>

              {/* Demo Profile Selector */}
              <div className="mb-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4B524E] dark:text-[#CBD2CE] mb-2">
                  Seleccionar rol de prueba (Demostración):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { role: 'Administrador', icon: UserCheck, desc: 'Control total' },
                    { role: 'Encargado', icon: Store, desc: 'Sucursales' },
                    { role: 'Cajero', icon: CreditCard, desc: 'Caja & POS' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedRole === item.role;
                    return (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => handleRoleSelect(item.role as any)}
                        className={`p-3 rounded-xl text-left border transition-all cursor-pointer min-h-[48px] ${
                          isSelected
                            ? 'bg-[#FDF7F4] dark:bg-[#282F2C] border-[#C85A32] ring-2 ring-[#C85A32]/40 shadow-xs'
                            : 'bg-[#FAF8F4] dark:bg-[#161A18] border-[#DCD6CC] dark:border-[#2E3531] hover:bg-[#F3EFEA] dark:hover:bg-[#222825]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-[#C85A32]' : 'text-[#4B524E] dark:text-[#CBD2CE]'}`} />
                          <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-[#C85A32] dark:text-[#FFA07A]' : 'text-[#111413] dark:text-white'}`}>
                            {item.role}
                          </span>
                        </div>
                        <span className="text-xs text-[#5D6561] dark:text-[#A2A9A5] block truncate">
                          {item.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Email Field */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#111413] dark:text-white mb-1.5">
                    Correo electrónico o Usuario
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#5D6561] dark:text-[#A2A9A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="usuario@comercios360.demo"
                      className="w-full bg-[#FAF8F4] dark:bg-[#161A18] focus:bg-white dark:focus:bg-[#222825] border border-[#DCD6CC] dark:border-[#3A433E] rounded-xl pl-10 pr-3.5 py-3 text-xs sm:text-sm text-[#111413] dark:text-white placeholder-[#5D6561] dark:placeholder-[#A2A9A5] focus:outline-hidden focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition-colors min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs sm:text-sm font-bold text-[#111413] dark:text-white">
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotNotice(true)}
                      className="text-xs text-[#C85A32] dark:text-[#FFA07A] hover:underline font-bold cursor-pointer"
                    >
                      ¿Olvidaste tu clave?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#5D6561] dark:text-[#A2A9A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-[#FAF8F4] dark:bg-[#161A18] focus:bg-white dark:focus:bg-[#222825] border border-[#DCD6CC] dark:border-[#3A433E] rounded-xl pl-10 pr-11 py-3 text-xs sm:text-sm text-[#111413] dark:text-white placeholder-[#5D6561] dark:placeholder-[#A2A9A5] focus:outline-hidden focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition-colors min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5D6561] dark:text-[#CBD2CE] hover:text-[#111413] dark:hover:text-white p-1.5 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      aria-label="Alternar visibilidad de contraseña"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Friendly Inline Notice (Replaces window.alert) */}
                {showForgotNotice && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start justify-between gap-2 text-xs text-amber-900 dark:text-amber-200 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        En este modo demostración podés ingresar con cualquier contraseña o usar el botón de acceso rápido.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowForgotNotice(false)}
                      className="text-amber-700 hover:text-amber-900 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between text-xs sm:text-sm pt-0.5">
                  <label className="flex items-center gap-2 text-[#4B524E] dark:text-[#CBD2CE] cursor-pointer min-h-[36px]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#C85A32] focus:ring-[#C85A32] border-[#DCD6CC] dark:border-[#3A433E] cursor-pointer"
                    />
                    <span>Recordar sesión en este equipo</span>
                  </label>
                </div>

                {/* Demonstration Notice */}
                <div className="p-3.5 rounded-xl bg-[#FDF7F4] dark:bg-[#282F2C] border border-[#F3D3C4] dark:border-[#3A433E] text-[#7C321B] dark:text-[#FFA07A] text-xs sm:text-sm flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-[#C85A32] mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="font-bold block text-[#9B3D1D] dark:text-white">Modo Demostración Activo</strong>
                    No requiere autenticación externa ni base de datos en esta etapa. Puedes acceder con las credenciales sugeridas.
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="space-y-2.5 pt-1">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-[#C85A32] hover:bg-[#B84C26] active:bg-[#9B3D1D] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#C85A32]/25 transition-all cursor-pointer min-h-[44px]"
                  >
                    <span>Iniciar Sesión en COMERCIOS 360</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickDemoAccess}
                    className="w-full py-3 px-4 bg-[#F5F1E8] dark:bg-[#161A18] hover:bg-[#EDE8DC] dark:hover:bg-[#222825] text-[#7C321B] dark:text-[#FFA07A] font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#DCD6CC] dark:border-[#3A433E] transition-colors cursor-pointer min-h-[44px]"
                  >
                    <span>Ingreso Rápido como {selectedRole}</span>
                  </button>
                </div>
              </form>

              {/* Card Footer */}
              <div className="mt-5 pt-4 border-t border-[#DCD6CC] dark:border-[#2E3531] text-center">
                <span className="text-xs text-[#5D6561] dark:text-[#CBD2CE]">
                  COMERCIOS 360 &copy; 2026 • Plataforma de Gestión Comercial
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
