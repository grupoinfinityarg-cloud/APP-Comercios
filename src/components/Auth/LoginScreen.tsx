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
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C201E] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans">
      {/* Background warm ambient gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#C85A32]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#B84C26]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#EFEAE0]/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl relative z-10">
        
        {/* Top Floating Logo on Mobile */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#C85A32] flex items-center justify-center text-white font-extrabold text-base shadow-sm">
              360
            </div>
            <div>
              <span className="font-extrabold text-[#1C201E] tracking-tight text-lg">COMERCIOS</span>
              <span className="text-[#C85A32] font-black text-lg ml-1">360</span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-[#B84C26] bg-[#C85A32]/10 px-2.5 py-1 rounded-full border border-[#C85A32]/20">
            Modo Demo
          </span>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Warm Editorial Brand Story */}
          <div className="hidden lg:block lg:col-span-6 space-y-6 pr-4">
            
            {/* Brand Logo & Badges */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#C85A32] flex items-center justify-center text-white font-black text-xl shadow-md shadow-[#C85A32]/20">
                360
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black tracking-tight text-[#1C201E]">COMERCIOS</span>
                  <span className="bg-[#C85A32] text-white text-xs font-black px-2 py-0.5 rounded tracking-wide">
                    360
                  </span>
                </div>
                <p className="text-xs text-[#6F7572] font-medium tracking-wide">
                  Gestión Comercial & Puntos de Venta
                </p>
              </div>
            </div>

            {/* Editorial Title */}
            <div className="space-y-3 pt-2">
              <h1 className="text-3xl sm:text-4xl font-serif text-[#1C201E] font-bold leading-tight tracking-tight">
                El sistema profesional para administrar tus comercios con <span className="italic text-[#C85A32]">precisión y calidez</span>.
              </h1>
              <p className="text-sm text-[#595E5B] leading-relaxed">
                Centraliza tus puntos de venta, arqueos de caja, inventarios críticos, padrón de clientes y cuentas corrientes en una experiencia visual elegante y adaptable.
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
                <div key={idx} className="flex items-start gap-3 text-xs text-[#2B302D]">
                  <div className="w-5 h-5 rounded-full bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-[#1C201E]">{feat.title}: </span>
                    <span className="text-[#595E5B]">{feat.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Aesthetic Tag */}
            <div className="p-3.5 rounded-xl bg-[#F5F1E8] border border-[#E6E0D4] text-xs text-[#6F7572] flex items-center gap-3">
              <Layers className="w-4 h-4 text-[#C85A32] shrink-0" />
              <span>
                Diseño editorial cálido adaptado a computadoras, tablets y celulares.
              </span>
            </div>
          </div>

          {/* Right Column: Warm Login Card */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-3xl p-6 sm:p-9 border border-[#E8E3DA] shadow-xl shadow-[#1C201E]/5 transition-all">
              
              {/* Card Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#C85A32] bg-[#FDF7F4] px-2.5 py-1 rounded-md border border-[#F3D3C4]">
                    <Sparkles className="w-3 h-3 text-[#C85A32]" />
                    Acceso Demostración
                  </span>
                  <span className="text-[11px] text-[#6F7572] font-medium">
                    Versión previa v1.0
                  </span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-[#1C201E]">
                  Iniciar Sesión
                </h2>
                <p className="text-xs text-[#6F7572] mt-1">
                  Ingresa tus credenciales o selecciona un perfil para explorar el sistema.
                </p>
              </div>

              {/* Demo Profile Selector */}
              <div className="mb-5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6F7572] mb-2">
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
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FDF7F4] border-[#C85A32] ring-1 ring-[#C85A32] shadow-xs'
                            : 'bg-[#FAF8F4] border-[#E8E3DA] hover:bg-[#F3EFEA]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#C85A32]' : 'text-[#6F7572]'}`} />
                          <span className={`text-xs font-bold ${isSelected ? 'text-[#C85A32]' : 'text-[#1C201E]'}`}>
                            {item.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#868C88] block truncate leading-none">
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
                  <label className="block text-xs font-semibold text-[#2B302D] mb-1.5">
                    Correo electrónico o Usuario
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8A908D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="usuario@comercios360.demo"
                      className="w-full bg-[#FAF8F4] focus:bg-white border border-[#E8E3DA] rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-[#1C201E] placeholder-[#8A908D] focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition-colors"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#2B302D]">
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('Aviso de demostración: En esta versión previa puedes ingresar con cualquier contraseña.')}
                      className="text-[11px] text-[#C85A32] hover:underline font-medium"
                    >
                      ¿Olvidaste tu clave?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8A908D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-[#FAF8F4] focus:bg-white border border-[#E8E3DA] rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#1C201E] placeholder-[#8A908D] focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A908D] hover:text-[#1C201E] p-1 cursor-pointer"
                      title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      aria-label="Alternar visibilidad de contraseña"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 text-[#595E5B] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#C85A32] focus:ring-[#C85A32] border-[#E8E3DA] cursor-pointer"
                    />
                    <span>Recordar sesión en este equipo</span>
                  </label>
                </div>

                {/* Demonstration Notice */}
                <div className="p-3 rounded-xl bg-[#FDF7F4] border border-[#F3D3C4] text-[#7C321B] text-xs flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-[#C85A32] mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <strong className="font-semibold block text-[#9B3D1D]">Modo Demostración Activo</strong>
                    No requiere autenticación externa ni base de datos en esta etapa. Puedes acceder con las credenciales sugeridas.
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-[#C85A32] hover:bg-[#B84C26] active:bg-[#9B3D1D] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#C85A32]/20 transition-all hover:scale-[1.005] active:scale-[0.995] cursor-pointer"
                  >
                    <span>Iniciar Sesión en COMERCIOS 360</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickDemoAccess}
                    className="w-full py-2.5 px-4 bg-[#F5F1E8] hover:bg-[#EDE8DC] text-[#7C321B] font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-[#E6DFD1] transition-colors cursor-pointer"
                  >
                    <span>Ingreso Rápido como {selectedRole}</span>
                  </button>
                </div>
              </form>

              {/* Card Footer */}
              <div className="mt-5 pt-4 border-t border-[#EFEAE0] text-center">
                <span className="text-[11px] text-[#868C88]">
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
