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
  AlertCircle,
  KeyRound,
  Shield,
  Zap,
} from 'lucide-react';
import { Employee, CommercialEditionTier } from '../../types';
import { DEMO_EMPLOYEES } from '../../data/demoData';
import { getEditionBadgeStyle } from '../../data/commercialEditions';

export interface DemoPlanProfile {
  id: string;
  name: string;
  username: string;
  password: string;
  planTier: CommercialEditionTier;
  planName: string;
  badgeLabel: string;
  role: 'Administrador';
  description: string;
  highlight: string;
}

export const DEMO_PLAN_PROFILES: DemoPlanProfile[] = [
  {
    id: 'demo-user',
    name: 'Usuario DEMO',
    username: 'DEMO',
    password: 'DEMO',
    planTier: 'demo',
    planName: 'Plan Demo',
    badgeLabel: 'PLAN DEMO',
    role: 'Administrador',
    description: 'Evaluación integral de los 17 módulos del sistema sin límites.',
    highlight: '17 módulos libres',
  },
  {
    id: 'oro-user',
    name: 'Usuario ORO',
    username: 'ORO',
    password: 'ORO',
    planTier: 'basica',
    planName: 'Plan Oro',
    badgeLabel: 'PLAN ORO',
    role: 'Administrador',
    description: 'Monocomercio con ventas en mostrador, catálogo, stock, compras y caja.',
    highlight: '10 módulos esenciales',
  },
  {
    id: 'platino-user',
    name: 'Usuario PLATINO',
    username: 'PLATINO',
    password: 'PLATINO',
    planTier: 'avanzada',
    planName: 'Plan Platino',
    badgeLabel: 'PLAN PLATINO',
    role: 'Administrador',
    description: 'Comercio avanzado con cuentas corrientes, promociones, alertas y marketing.',
    highlight: '16 módulos comerciales',
  },
  {
    id: 'diamante-user',
    name: 'Usuario DIAMANTE',
    username: 'DIAMANTE',
    password: 'DIAMANTE',
    planTier: 'full',
    planName: 'Plan Diamante',
    badgeLabel: 'PLAN DIAMANTE',
    role: 'Administrador',
    description: 'Empresa multisucursal con depósitos logísticos y auditoría SHA-256.',
    highlight: '17 módulos + multisucursal',
  },
];

interface LoginScreenProps {
  onLogin: (employee: Employee, assignedPlan?: CommercialEditionTier) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'employees'>('plans');
  const [selectedPlanProfile, setSelectedPlanProfile] = useState<DemoPlanProfile>(DEMO_PLAN_PROFILES[0]);
  const [selectedRole, setSelectedRole] = useState<'Administrador' | 'Encargado' | 'Cajero'>('Administrador');

  const [usernameInput, setUsernameInput] = useState('DEMO');
  const [passwordInput, setPasswordInput] = useState('DEMO');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotNotice, setShowForgotNotice] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper to create Employee instance for a plan profile
  const createEmployeeForPlan = (profile: DemoPlanProfile): Employee => ({
    id: profile.id,
    name: profile.name,
    email: `${profile.username.toLowerCase()}@comercios360.local`,
    username: profile.username,
    role: profile.role,
    store: 'Sucursal Central',
    phone: `+54 11 0000-${profile.username}`,
    status: 'Activo',
    lastAccess: 'Ahora',
    assignedPlan: profile.planTier,
    notes: `Perfil demostrativo local asignado a ${profile.planName}.`,
  });

  // Handle plan card selection
  const handleSelectPlanProfile = (profile: DemoPlanProfile) => {
    setSelectedPlanProfile(profile);
    setUsernameInput(profile.username);
    setPasswordInput(profile.password);
    setErrorMessage(null);
  };

  // Direct 1-click quick access for a plan profile
  const handleQuickPlanLogin = (profile: DemoPlanProfile) => {
    const employee = createEmployeeForPlan(profile);
    onLogin(employee, profile.planTier);
  };

  // Handle operational role selection
  const handleRoleSelect = (role: 'Administrador' | 'Encargado' | 'Cajero') => {
    setSelectedRole(role);
    const emp = DEMO_EMPLOYEES.find((e) => e.role === role);
    if (emp) {
      setUsernameInput(emp.email);
      setPasswordInput('demo1234');
      setErrorMessage(null);
    }
  };

  // Direct 1-click quick access for operational role
  const handleQuickRoleLogin = () => {
    const emp = DEMO_EMPLOYEES.find((e) => e.role === selectedRole) || DEMO_EMPLOYEES[0];
    onLogin(emp, 'demo');
  };

  // Handle manual form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const userClean = usernameInput.trim();
    const passClean = passwordInput.trim();

    if (!userClean || !passClean) {
      setErrorMessage('Por favor ingrese usuario y contraseña.');
      return;
    }

    const upperUser = userClean.toUpperCase();
    const upperPass = passClean.toUpperCase();

    // 1. Check against the 4 commercial demo plan profiles
    const matchedProfile = DEMO_PLAN_PROFILES.find(
      (p) => p.username === upperUser && p.password === upperPass
    );

    if (matchedProfile) {
      const employee = createEmployeeForPlan(matchedProfile);
      onLogin(employee, matchedProfile.planTier);
      return;
    }

    // 2. Check against existing operational employees (preserving employee flow)
    const matchedEmployee = DEMO_EMPLOYEES.find(
      (emp) =>
        emp.email.toLowerCase() === userClean.toLowerCase() ||
        (emp.username && emp.username.toLowerCase() === userClean.toLowerCase())
    );

    if (matchedEmployee) {
      // Validate employee password: default demo password or employee pin
      if (
        passClean === 'demo1234' ||
        passClean === matchedEmployee.pin ||
        passClean === '1234'
      ) {
        onLogin(matchedEmployee, matchedEmployee.assignedPlan || 'demo');
        return;
      } else {
        setErrorMessage('Contraseña incorrecta para el usuario de empleado.');
        return;
      }
    }

    // 3. Invalid credentials rejection
    setErrorMessage(
      'Credenciales inválidas. Ingrese uno de los perfiles de prueba (ej: DEMO / DEMO, ORO / ORO, PLATINO / PLATINO, DIAMANTE / DIAMANTE) o use los botones de acceso rápido.'
    );
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
            Demostración Local
          </span>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Warm Editorial Brand Story */}
          <div className="hidden lg:block lg:col-span-5 space-y-6 pr-2 pt-2">
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
              <h1 className="text-2xl sm:text-3xl font-serif text-[#111413] dark:text-white font-bold leading-tight tracking-tight">
                Acceso a los planes comerciales de <span className="italic text-[#C85A32]">demostración local</span>.
              </h1>
              <p className="text-xs sm:text-sm text-[#4B524E] dark:text-[#CBD2CE] leading-relaxed">
                Explore las capacidades de cada plan comercial (Demo, Oro, Platino y Diamante) o ingrese con los roles operativos del equipo para validar la experiencia completa de mostrador.
              </p>
            </div>

            {/* 4 Commercial Plans Summary */}
            <div className="space-y-2.5 pt-1">
              {DEMO_PLAN_PROFILES.map((prof) => {
                const style = getEditionBadgeStyle(prof.planTier);
                return (
                  <div
                    key={prof.id}
                    className="p-3 rounded-xl bg-white/70 dark:bg-[#1E2421]/70 border border-[#DCD6CC] dark:border-[#343D38] text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${style.badgeClass}`}>
                          {prof.badgeLabel}
                        </span>
                        <span className="font-bold text-[#111413] dark:text-white">{prof.name}</span>
                      </div>
                      <span className="text-[#5D6561] dark:text-[#A2A9A5] text-[11px] block mt-0.5">
                        {prof.description}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] bg-[#FAF8F4] dark:bg-[#161A18] px-2 py-1 rounded border border-[#DCD6CC] dark:border-[#2E3531] text-[#7C321B] dark:text-[#FFA07A] font-bold shrink-0 ml-2">
                      {prof.username}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Aesthetic Tag */}
            <div className="p-3.5 rounded-2xl bg-[#F5F1E8] dark:bg-[#1E2421] border border-[#DCD6CC] dark:border-[#343D38] text-xs text-[#4B524E] dark:text-[#CBD2CE] flex items-center gap-3">
              <Layers className="w-5 h-5 text-[#C85A32] shrink-0" />
              <span>
                Diseñado para demostraciones y capacitaciones comerciales sin necesidad de conexión externa ni suscripciones pagas.
              </span>
            </div>
          </div>

          {/* Right Column: Warm Login Card */}
          <div className="lg:col-span-7 w-full">
            <div className="bg-white dark:bg-[#1E2421] rounded-3xl p-5 sm:p-8 border border-[#DCD6CC] dark:border-[#343D38] shadow-xl shadow-[#111413]/5 transition-all">
              {/* Card Header */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#B84C26] dark:text-[#FFA07A] bg-[#FDF7F4] dark:bg-[#282F2C] px-3 py-1 rounded-md border border-[#F3D3C4] dark:border-[#3A433E]">
                    <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                    Acceso Demostración
                  </span>
                  <span className="text-xs text-[#5D6561] dark:text-[#CBD2CE] font-semibold">
                    v1.0 Local
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#111413] dark:text-white">
                  Iniciar Sesión
                </h2>
                <p className="text-xs sm:text-sm text-[#4B524E] dark:text-[#CBD2CE] mt-1">
                  Elija un perfil de prueba con acceso rápido o ingrese usuario y clave correspondientes.
                </p>
              </div>

              {/* Tab Selector: Perfiles de Planes vs Roles Operativos */}
              <div className="flex border-b border-[#DCD6CC] dark:border-[#2E3531] mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('plans');
                    handleSelectPlanProfile(DEMO_PLAN_PROFILES[0]);
                  }}
                  className={`flex-1 pb-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'plans'
                      ? 'border-[#C85A32] text-[#C85A32] dark:text-[#FFA07A]'
                      : 'border-transparent text-[#5D6561] dark:text-[#CBD2CE] hover:text-[#111413] dark:hover:text-white'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Perfiles por Plan Comercial</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('employees');
                    handleRoleSelect('Administrador');
                  }}
                  className={`flex-1 pb-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'employees'
                      ? 'border-[#C85A32] text-[#C85A32] dark:text-[#FFA07A]'
                      : 'border-transparent text-[#5D6561] dark:text-[#CBD2CE] hover:text-[#111413] dark:hover:text-white'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Roles Operativos</span>
                </button>
              </div>

              {/* TAB 1: 4 Demo Plan Profiles */}
              {activeTab === 'plans' && (
                <div className="mb-5 space-y-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#4B524E] dark:text-[#CBD2CE]">
                      Perfiles de prueba disponibles (4 Planes):
                    </label>
                    <span className="text-[11px] text-[#5D6561] dark:text-[#A2A9A5]">
                      Clic para precargar o botón de ingreso directo
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {DEMO_PLAN_PROFILES.map((profile) => {
                      const isSelected = selectedPlanProfile.id === profile.id;
                      const style = getEditionBadgeStyle(profile.planTier);
                      return (
                        <div
                          key={profile.id}
                          onClick={() => handleSelectPlanProfile(profile)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#FDF7F4] dark:bg-[#282F2C] border-[#C85A32] ring-2 ring-[#C85A32]/40 shadow-xs'
                              : 'bg-[#FAF8F4] dark:bg-[#161A18] border-[#DCD6CC] dark:border-[#2E3531] hover:bg-[#F3EFEA] dark:hover:bg-[#222825]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1.5 mb-1.5">
                              <span className="text-xs sm:text-sm font-black text-[#111413] dark:text-white">
                                {profile.name}
                              </span>
                              <span
                                className={`text-[9px] font-black px-2 py-0.5 rounded-full border leading-none ${style.badgeClass}`}
                              >
                                {profile.badgeLabel}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#5D6561] dark:text-[#CBD2CE] line-clamp-2 leading-relaxed mb-2">
                              {profile.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-[#DCD6CC]/60 dark:border-[#2E3531] flex items-center justify-between gap-2 mt-auto">
                            <span className="text-[10px] font-mono font-bold text-[#7C321B] dark:text-[#FFA07A] bg-white/70 dark:bg-[#1A1F1C] px-2 py-0.5 rounded border border-[#DCD6CC]/50 dark:border-[#3A433E]">
                              {profile.username} / {profile.password}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickPlanLogin(profile);
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold bg-[#C85A32] hover:bg-[#B84C26] active:bg-[#9B3D1D] text-white rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                              title={`Ingresar inmediatamente como ${profile.name}`}
                            >
                              <Zap className="w-3 h-3" />
                              <span>Acceso Rápido</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: Operational Roles (Administrador, Encargado, Cajero) */}
              {activeTab === 'employees' && (
                <div className="mb-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4B524E] dark:text-[#CBD2CE] mb-2">
                    Seleccionar rol operativo de empleado:
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
                            <Icon
                              className={`w-4 h-4 ${isSelected ? 'text-[#C85A32]' : 'text-[#4B524E] dark:text-[#CBD2CE]'}`}
                            />
                            <span
                              className={`text-xs sm:text-sm font-bold ${
                                isSelected ? 'text-[#C85A32] dark:text-[#FFA07A]' : 'text-[#111413] dark:text-white'
                              }`}
                            >
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
              )}

              {/* Error Message Box */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <strong className="font-bold block">Error de autenticación</strong>
                    <span>{errorMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Login Form (Manual typing or preloaded) */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username / Email Field */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#111413] dark:text-white mb-1.5">
                    Usuario o Correo
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#5D6561] dark:text-[#A2A9A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => {
                        setUsernameInput(e.target.value);
                        setErrorMessage(null);
                      }}
                      required
                      placeholder="DEMO, ORO, PLATINO o DIAMANTE"
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
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setErrorMessage(null);
                      }}
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

                {/* Inline Forgot Notice */}
                {showForgotNotice && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start justify-between gap-2 text-xs text-amber-900 dark:text-amber-200 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Para perfiles de demostración, el usuario y la clave son iguales (ej: DEMO/DEMO, ORO/ORO).
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowForgotNotice(false)}
                      className="text-amber-700 hover:text-amber-900 p-0.5 cursor-pointer"
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
                    <strong className="font-bold block text-[#9B3D1D] dark:text-white">
                      Modo Demostración Activo
                    </strong>
                    Perfiles de prueba locales sin autenticación remota ni cobro recurrente. Cada perfil aplica las reglas de su plan asignado.
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

                  {activeTab === 'plans' ? (
                    <button
                      type="button"
                      onClick={() => handleQuickPlanLogin(selectedPlanProfile)}
                      className="w-full py-3 px-4 bg-[#F5F1E8] dark:bg-[#161A18] hover:bg-[#EDE8DC] dark:hover:bg-[#222825] text-[#7C321B] dark:text-[#FFA07A] font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#DCD6CC] dark:border-[#3A433E] transition-colors cursor-pointer min-h-[44px]"
                    >
                      <Zap className="w-4 h-4 text-[#C85A32]" />
                      <span>Ingreso Rápido como {selectedPlanProfile.name}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleQuickRoleLogin}
                      className="w-full py-3 px-4 bg-[#F5F1E8] dark:bg-[#161A18] hover:bg-[#EDE8DC] dark:hover:bg-[#222825] text-[#7C321B] dark:text-[#FFA07A] font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#DCD6CC] dark:border-[#3A433E] transition-colors cursor-pointer min-h-[44px]"
                    >
                      <UserCheck className="w-4 h-4 text-[#C85A32]" />
                      <span>Ingreso Rápido como {selectedRole}</span>
                    </button>
                  )}
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
