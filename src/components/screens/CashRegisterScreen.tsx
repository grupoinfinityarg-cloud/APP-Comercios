import React, { useState } from 'react';
import {
  Receipt,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Lock,
  Unlock,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  Filter,
  Calculator,
  ShieldAlert,
  FileText,
  Printer,
  Sparkles,
  Layers,
} from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { CashMovement } from '../../types';
import { DEMO_CASH_MOVEMENTS } from '../../data/demoData';

export const CashRegisterScreen: React.FC = () => {
  // Shift state (turno abierto por defecto en modo demo)
  const [isShiftOpen, setIsShiftOpen] = useState(true);
  const [shiftResponsible, setShiftResponsible] = useState('Santiago Pérez');
  const [shiftOpeningTime, setShiftOpeningTime] = useState('08:00');
  const [shiftClosingTime, setShiftClosingTime] = useState<string | null>(null);
  const [initialCash, setInitialCash] = useState<number>(35000);

  // Cash movements in memory for current session
  const [movements, setMovements] = useState<CashMovement[]>(DEMO_CASH_MOVEMENTS);

  // Filters & search
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'ingreso' | 'egreso' | 'apertura' | 'cierre'>('todos');

  // Arqueo state
  const [countedCashInput, setCountedCashInput] = useState<string>('');
  const [arqueoRecorded, setArqueoRecorded] = useState<boolean>(false);

  // Modals state
  const [activeModal, setActiveModal] = useState<'movement' | 'open_shift' | 'close_shift' | 'receipt' | null>(null);
  const [movementType, setMovementType] = useState<'ingreso' | 'egreso'>('ingreso');

  // Form states
  const [movementConcept, setMovementConcept] = useState('');
  const [movementAmount, setMovementAmount] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Open shift form state
  const [openShiftAmount, setOpenShiftAmount] = useState('35000');
  const [openShiftResponsible, setOpenShiftResponsible] = useState('Santiago Pérez');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ title: string; text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Closed shift receipt summary
  const [shiftSummaryData, setShiftSummaryData] = useState<{
    openingTime: string;
    closingTime: string;
    responsible: string;
    initialCash: number;
    totalIn: number;
    totalOut: number;
    expectedCash: number;
    countedCash: number;
    difference: number;
  } | null>(null);

  // Calculations
  const totalIn = movements
    .filter((m) => m.type === 'ingreso')
    .reduce((acc, m) => acc + m.amount, 0);

  const totalOut = movements
    .filter((m) => m.type === 'egreso')
    .reduce((acc, m) => acc + m.amount, 0);

  // Regla de cálculo estricta: Fondo Inicial + Ingresos Manuales - Retiros Manuales
  const expectedCashInDrawer = isShiftOpen ? initialCash + totalIn - totalOut : 0;

  // Arqueo calculations
  const parsedCountedCash = countedCashInput.trim() === '' ? null : parseFloat(countedCashInput);
  const arqueoDifference = parsedCountedCash !== null ? parsedCountedCash - expectedCashInDrawer : null;

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filtered movements
  const filteredMovements = movements.filter((m) => {
    const matchesSearch =
      m.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.responsible.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'todos' || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Show toast helper
  const triggerToast = (title: string, text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ title, text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Handler: Register manual movement (Ingreso o Retiro)
  const handleRegisterMovement = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isShiftOpen) {
      setFormError('La caja se encuentra cerrada. Debes abrir el turno para asentar movimientos.');
      return;
    }

    const trimmedConcept = movementConcept.trim();
    if (!trimmedConcept) {
      setFormError('El concepto o motivo del movimiento es obligatorio.');
      return;
    }

    const numAmount = parseFloat(movementAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('El importe debe ser un número positivo mayor a 0.');
      return;
    }

    // Si es egreso, validar que no supere el dinero en caja
    if (movementType === 'egreso' && numAmount > expectedCashInDrawer) {
      setFormError(`El retiro ($${numAmount.toLocaleString('es-AR')}) excede el efectivo disponible en gaveta (${formatCurrency(expectedCashInDrawer)}).`);
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    const newMovement: CashMovement = {
      id: `cm-${Date.now()}`,
      type: movementType,
      concept: trimmedConcept,
      amount: numAmount,
      time: timeString,
      responsible: shiftResponsible,
    };

    setMovements((prev) => [newMovement, ...prev]);
    setActiveModal(null);
    setMovementConcept('');
    setMovementAmount('');
    triggerToast(
      movementType === 'ingreso' ? 'Ingreso registrado' : 'Retiro registrado',
      `${movementType === 'ingreso' ? 'Ingreso extra' : 'Retiro'} de ${formatCurrency(numAmount)}: "${trimmedConcept}"`,
      'success'
    );
  };

  // Handler: Open Shift
  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const numAmount = parseFloat(openShiftAmount);
    if (isNaN(numAmount) || numAmount < 0) {
      setFormError('El fondo inicial debe ser un importe válido (0 o mayor).');
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    setInitialCash(numAmount);
    setShiftResponsible(openShiftResponsible);
    setShiftOpeningTime(timeString);
    setShiftClosingTime(null);
    setIsShiftOpen(true);
    setCountedCashInput('');
    setArqueoRecorded(false);

    const openingMovement: CashMovement = {
      id: `cm-open-${Date.now()}`,
      type: 'apertura',
      concept: `Apertura de turno - Fondo inicial de cambio`,
      amount: numAmount,
      time: timeString,
      responsible: openShiftResponsible,
    };

    setMovements((prev) => [openingMovement, ...prev]);
    setActiveModal(null);
    triggerToast('Turno de caja abierto', `Se registró la apertura con fondo inicial de ${formatCurrency(numAmount)}`, 'success');
  };

  // Handler: Close Shift
  const handleConfirmCloseShift = () => {
    if (!isShiftOpen) return;

    const counted = parsedCountedCash !== null ? parsedCountedCash : expectedCashInDrawer;
    const diff = counted - expectedCashInDrawer;
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    const summary = {
      openingTime: shiftOpeningTime,
      closingTime: timeString,
      responsible: shiftResponsible,
      initialCash,
      totalIn,
      totalOut,
      expectedCash: expectedCashInDrawer,
      countedCash: counted,
      difference: diff,
    };

    const closingMovement: CashMovement = {
      id: `cm-close-${Date.now()}`,
      type: 'cierre',
      concept: `Cierre de turno - Efectivo contado: ${formatCurrency(counted)} (Dif: ${diff >= 0 ? '+' : ''}${formatCurrency(diff)})`,
      amount: counted,
      time: timeString,
      responsible: shiftResponsible,
    };

    setMovements((prev) => [closingMovement, ...prev]);
    setShiftClosingTime(timeString);
    setIsShiftOpen(false);
    setShiftSummaryData(summary);
    setActiveModal('receipt');
    triggerToast('Turno cerrado correctamente', `Turno finalizado a las ${timeString} hs.`, 'info');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Banner de Aviso de Demostración */}
      <DemoNotice
        title="Módulo 6: Control de Caja & Arqueo de Dinero"
        description="Apertura y cierre de turnos de mostrador, fondo inicial para vuelto, registro manual de entradas/salidas de efectivo y conciliación física de gaveta en memoria para esta sesión de demostración."
      />

      {/* Notificación Toast en pantalla */}
      {toastMessage && (
        <div className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs border transition-all animate-in fade-in ${
          toastMessage.type === 'success'
            ? 'bg-[#EBF5EF] border-[#CFE7DA] text-[#246A48]'
            : toastMessage.type === 'warning'
            ? 'bg-[#FEF6EC] border-[#F8E1C4] text-[#9A6216]'
            : 'bg-[#F0F5FA] border-[#D6E4F0] text-[#2C4A6F]'
        }`}>
          <div className="flex items-center gap-2.5">
            {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#246A48] shrink-0" />}
            {toastMessage.type === 'warning' && <AlertCircle className="w-5 h-5 text-[#9A6216] shrink-0" />}
            {toastMessage.type === 'info' && <Receipt className="w-5 h-5 text-[#2C4A6F] shrink-0" />}
            <div>
              <p className="font-bold">{toastMessage.title}</p>
              <p className="text-xs opacity-90">{toastMessage.text}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 hover:opacity-70 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Encabezado Editorial del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E3DA]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C85A32] bg-[#FDF7F4] px-2.5 py-0.5 rounded-full border border-[#F3D3C4]">
              Tesorería & Operaciones • Sección 6
            </span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border ${
              isShiftOpen
                ? 'bg-[#EBF5EF] text-[#246A48] border-[#CFE7DA]'
                : 'bg-[#FAF8F4] text-[#8A908D] border-[#E8E3DA]'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isShiftOpen ? 'bg-[#246A48] animate-pulse' : 'bg-[#8A908D]'}`} />
              {isShiftOpen ? 'Turno Abierto' : 'Turno Cerrado'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C201E] tracking-tight">
            Control de Caja Diaria & Arqueo
          </h1>
          <p className="text-xs sm:text-sm text-[#595E5B] mt-0.5">
            {isShiftOpen ? (
              <>Caja 01 • Responsable: <strong>{shiftResponsible}</strong> • Abierto desde las <strong>{shiftOpeningTime} hs</strong></>
            ) : (
              <>Caja 01 actualmente inactiva. Inicia un nuevo turno para registrar operaciones.</>
            )}
          </p>
        </div>

        {/* Acciones Rápidas de Cabecera */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {isShiftOpen ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setMovementType('egreso');
                  setMovementConcept('');
                  setMovementAmount('');
                  setFormError(null);
                  setActiveModal('movement');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#FAF8F4] hover:bg-[#F3EFEA] text-[#1C201E] text-xs font-bold rounded-xl border border-[#E8E3DA] transition-all cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5 text-[#B84C26]" />
                <span>Retiro / Gasto</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMovementType('ingreso');
                  setMovementConcept('');
                  setMovementAmount('');
                  setFormError(null);
                  setActiveModal('movement');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#FAF8F4] hover:bg-[#F3EFEA] text-[#1C201E] text-xs font-bold rounded-xl border border-[#E8E3DA] transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#246A48]" />
                <span>Ingreso Extra</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormError(null);
                  setActiveModal('close_shift');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#C85A32] hover:bg-[#B84C26] active:bg-[#9B3D1D] text-white text-xs font-bold rounded-xl shadow-xs shadow-[#C85A32]/20 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Cerrar Turno</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                setActiveModal('open_shift');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#246A48] hover:bg-[#1E573B] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Abrir Turno de Caja</span>
            </button>
          )}
        </div>
      </div>

      {/* Métricas Resumen de Caja (Estilo Warm Editorial Stitch) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Fondo Inicial */}
        <div className="bg-white rounded-2xl p-4 border border-[#E8E3DA] shadow-xs">
          <div className="flex items-center justify-between text-[#6F7572] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            <span>Fondo de Apertura</span>
            <Unlock className="w-3.5 h-3.5 text-[#8A908D]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#1C201E] mt-1">
            {formatCurrency(initialCash)}
          </div>
          <span className="text-[11px] text-[#595E5B] mt-1 block">
            {isShiftOpen ? `Fondo inicial (${shiftOpeningTime} hs)` : 'Última apertura'}
          </span>
        </div>

        {/* Ingresos Manuales */}
        <div className="bg-white rounded-2xl p-4 border border-[#E8E3DA] shadow-xs">
          <div className="flex items-center justify-between text-[#6F7572] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            <span>Ingresos Manuales</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#246A48]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#246A48] mt-1">
            +{formatCurrency(totalIn)}
          </div>
          <span className="text-[11px] text-[#246A48] mt-1 block font-medium">
            {movements.filter((m) => m.type === 'ingreso').length} ingresos registrados
          </span>
        </div>

        {/* Retiros / Gastos */}
        <div className="bg-white rounded-2xl p-4 border border-[#E8E3DA] shadow-xs">
          <div className="flex items-center justify-between text-[#6F7572] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            <span>Retiros / Gastos</span>
            <ArrowDownRight className="w-3.5 h-3.5 text-[#B84C26]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#B84C26] mt-1">
            -{formatCurrency(totalOut)}
          </div>
          <span className="text-[11px] text-[#B84C26] mt-1 block font-medium">
            {movements.filter((m) => m.type === 'egreso').length} retiros registrados
          </span>
        </div>

        {/* Efectivo Esperado en Gaveta */}
        <div className="bg-[#FAF8F4] rounded-2xl p-4 border-2 border-[#C85A32] shadow-xs">
          <div className="flex items-center justify-between text-[#C85A32] text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
            <span>Efectivo Esperado</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#C85A32] mt-1">
            {formatCurrency(expectedCashInDrawer)}
          </div>
          <span className="text-[11px] text-[#595E5B] mt-1 block font-medium">
            {isShiftOpen ? 'Saldo teórico en gaveta' : 'Caja cerrada'}
          </span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN INTERACTIVA DE ARQUEO DE CAJA FÍSICA                               */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E3DA] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8E3DA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FDF7F4] text-[#C85A32] flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#1C201E]">
                Arqueo de Efectivo en Gaveta
              </h2>
              <p className="text-xs text-[#595E5B]">
                Ingresa el efectivo contado físicamente en los billetes de la caja para calcular la diferencia
              </p>
            </div>
          </div>

          <span className="text-xs text-[#8A908D] font-mono self-start sm:self-auto">
            Regla: Esperado = Apertura + Ingresos - Egresos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Columna Entrada de Efectivo Contado */}
          <div className="md:col-span-6 space-y-2">
            <label className="block text-xs font-bold text-[#6F7572] uppercase tracking-wider">
              Efectivo Contado Físico ($):
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#8A908D] font-bold">
                  $
                </span>
                <input
                  type="number"
                  disabled={!isShiftOpen}
                  value={countedCashInput}
                  onChange={(e) => {
                    setCountedCashInput(e.target.value);
                    setArqueoRecorded(true);
                  }}
                  placeholder={`Ej: ${expectedCashInDrawer}`}
                  className="w-full pl-8 pr-3.5 py-2.5 text-sm font-bold rounded-xl bg-[#FAF8F4] border border-[#E8E3DA] text-[#1C201E] placeholder-[#8A908D] focus:outline-none focus:border-[#C85A32] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <button
                type="button"
                disabled={!isShiftOpen}
                onClick={() => {
                  setCountedCashInput(expectedCashInDrawer.toString());
                  setArqueoRecorded(true);
                  triggerToast('Efectivo cuadrado', 'Se estableció el efectivo contado igual al saldo esperado.', 'info');
                }}
                className="px-3 py-2.5 bg-[#FAF8F4] hover:bg-[#F3EFEA] border border-[#E8E3DA] text-[#1C201E] text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Cuadre Exacto
              </button>
            </div>
          </div>

          {/* Columna Resultado de la Diferencia */}
          <div className="md:col-span-6 p-4 rounded-2xl border bg-[#FAF8F4] flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F7572] block">
              Resultado de Conciliación
            </span>
            
            {parsedCountedCash === null ? (
              <p className="text-xs text-[#8A908D] mt-1">
                Ingresa el monto contado para verificar sobrantes o faltantes en tiempo real.
              </p>
            ) : arqueoDifference === 0 ? (
              <div className="mt-1 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-[#246A48] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Arqueo Exacto (Sin diferencias)
                  </span>
                  <span className="text-[11px] text-[#595E5B]">
                    El dinero físico coincide perfectamente con el saldo esperado en gaveta.
                  </span>
                </div>
                <span className="text-lg font-black text-[#246A48]">$0</span>
              </div>
            ) : (arqueoDifference ?? 0) > 0 ? (
              <div className="mt-1 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-[#2C4A6F] flex items-center gap-1.5">
                    <ArrowUpRight className="w-4 h-4" />
                    Sobrante en Gaveta
                  </span>
                  <span className="text-[11px] text-[#595E5B]">
                    Hay más efectivo físico que el registrado teóricamente.
                  </span>
                </div>
                <span className="text-lg font-black text-[#2C4A6F]">
                  +{formatCurrency(arqueoDifference!)}
                </span>
              </div>
            ) : (
              <div className="mt-1 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-[#B84C26] flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    Faltante de Caja
                  </span>
                  <span className="text-[11px] text-[#B84C26]">
                    Se detecta un descuadre de dinero respecto al saldo esperado.
                  </span>
                </div>
                <span className="text-lg font-black text-[#B84C26]">
                  {formatCurrency(arqueoDifference!)}
                </span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* TABLA EDITORIAL DE MOVIMIENTOS DEL TURNO                                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-[#E8E3DA] shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
        
        {/* Cabecera y Filtros */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E8E3DA]">
          <div>
            <h2 className="font-serif font-bold text-base sm:text-lg text-[#1C201E]">
              Planilla de Movimientos del Turno
            </h2>
            <p className="text-xs text-[#6F7572]">
              Registro cronológico de aperturas, ingresos extraordinarios, retiros de dinero y cierres
            </p>
          </div>

          <span className="text-xs text-[#8A908D] font-medium self-start md:self-auto">
            {filteredMovements.length} movimientos
          </span>
        </div>

        {/* Buscador y Filtros por Tipo */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#8A908D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar concepto o responsable..."
              className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl bg-[#FAF8F4] border border-[#E8E3DA] text-[#1C201E] placeholder-[#8A908D] focus:outline-none focus:border-[#C85A32] transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { id: 'todos', label: 'Todos' },
                { id: 'ingreso', label: 'Ingresos' },
                { id: 'egreso', label: 'Egresos' },
                { id: 'apertura', label: 'Aperturas' },
                { id: 'cierre', label: 'Cierres' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTypeFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  typeFilter === f.id
                    ? 'bg-[#C85A32] text-white shadow-xs'
                    : 'bg-[#FAF8F4] text-[#595E5B] hover:bg-[#F3EFEA] border border-[#E8E3DA]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla para Computadoras y Tablets */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-[#FAF8F4] text-[#6F7572] uppercase text-[10px] tracking-wider border-b border-[#E8E3DA]">
              <tr>
                <th className="py-3 px-4 font-bold">Hora</th>
                <th className="py-3 px-3 font-bold">Tipo</th>
                <th className="py-3 px-3 font-bold">Concepto / Detalle</th>
                <th className="py-3 px-3 font-bold">Responsable</th>
                <th className="py-3 px-4 text-right font-bold">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3EFEA]">
              {filteredMovements.map((mov) => {
                const isPositive = mov.type === 'ingreso' || mov.type === 'apertura';
                return (
                  <tr key={mov.id} className="hover:bg-[#FAF8F4] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#6F7572] whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#8A908D]" />
                        {mov.time} hs
                      </span>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          mov.type === 'apertura'
                            ? 'bg-[#EBF5EF] text-[#246A48] border border-[#CFE7DA]'
                            : mov.type === 'ingreso'
                            ? 'bg-[#EBF5EF] text-[#246A48] border border-[#CFE7DA]'
                            : mov.type === 'cierre'
                            ? 'bg-[#F0F5FA] text-[#2C4A6F] border border-[#D6E4F0]'
                            : 'bg-[#FDF2F0] text-[#B84C26] border border-[#FADBD8]'
                        }`}
                      >
                        {mov.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-[#1C201E]">
                      {mov.concept}
                    </td>
                    <td className="py-3.5 px-3 text-[#595E5B] whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-[#8A908D]" />
                        {mov.responsible}
                      </span>
                    </td>
                    <td
                      className={`py-3.5 px-4 text-right font-bold text-sm whitespace-nowrap ${
                        isPositive ? 'text-[#246A48]' : 'text-[#B84C26]'
                      }`}
                    >
                      {isPositive ? '+' : '-'} {formatCurrency(mov.amount)}
                    </td>
                  </tr>
                );
              })}
              {filteredMovements.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#8A908D]">
                    No se registraron movimientos con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Tarjetas Responsivas para Celulares Android */}
        <div className="md:hidden space-y-2.5">
          {filteredMovements.map((mov) => {
            const isPositive = mov.type === 'ingreso' || mov.type === 'apertura';
            return (
              <div
                key={mov.id}
                className="p-3.5 rounded-2xl bg-[#FAF8F4] border border-[#E8E3DA] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#8A908D] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {mov.time} hs
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      mov.type === 'apertura'
                        ? 'bg-[#EBF5EF] text-[#246A48]'
                        : mov.type === 'ingreso'
                        ? 'bg-[#EBF5EF] text-[#246A48]'
                        : mov.type === 'cierre'
                        ? 'bg-[#F0F5FA] text-[#2C4A6F]'
                        : 'bg-[#FDF2F0] text-[#B84C26]'
                    }`}
                  >
                    {mov.type}
                  </span>
                </div>

                <p className="font-bold text-xs text-[#1C201E]">
                  {mov.concept}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-[#E8E3DA]/80 text-xs">
                  <span className="text-[11px] text-[#6F7572] flex items-center gap-1">
                    <User className="w-3 h-3 text-[#8A908D]" />
                    {mov.responsible}
                  </span>
                  <span
                    className={`font-black text-sm ${
                      isPositive ? 'text-[#246A48]' : 'text-[#B84C26]'
                    }`}
                  >
                    {isPositive ? '+' : '-'} {formatCurrency(mov.amount)}
                  </span>
                </div>
              </div>
            );
          })}
          {filteredMovements.length === 0 && (
            <div className="p-8 text-center text-xs text-[#8A908D] bg-[#FAF8F4] rounded-2xl border border-[#E8E3DA]">
              No se encontraron movimientos registrados.
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: REGISTRAR INGRESO O RETIRO MANUAL                                  */}
      {/* ========================================================================= */}
      {activeModal === 'movement' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C201E]/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[#E8E3DA] shadow-2xl text-xs space-y-4 font-sans animate-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E3DA]">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  movementType === 'ingreso' ? 'bg-[#EBF5EF] text-[#246A48]' : 'bg-[#FDF2F0] text-[#B84C26]'
                }`}>
                  {movementType === 'ingreso' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#1C201E]">
                    {movementType === 'ingreso' ? 'Registrar Ingreso Manual' : 'Registrar Retiro / Gasto'}
                  </h3>
                  <p className="text-[11px] text-[#6F7572]">
                    Movimiento de gaveta en turno abierto
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-[#8A908D] hover:text-[#1C201E] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-[#FDF2F0] border border-[#FADBD8] text-[#B84C26] rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterMovement} className="space-y-3.5">
              
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6F7572] mb-1">
                  Tipo de movimiento:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovementType('ingreso')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      movementType === 'ingreso'
                        ? 'bg-[#246A48] text-white shadow-xs'
                        : 'bg-[#FAF8F4] text-[#595E5B] border border-[#E8E3DA]'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ingreso</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType('egreso')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      movementType === 'egreso'
                        ? 'bg-[#B84C26] text-white shadow-xs'
                        : 'bg-[#FAF8F4] text-[#595E5B] border border-[#E8E3DA]'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>Retiro / Gasto</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6F7572] mb-1">
                  Concepto o Motivo del Movimiento <span className="text-[#B84C26]">*</span>
                </label>
                <input
                  type="text"
                  value={movementConcept}
                  onChange={(e) => setMovementConcept(e.target.value)}
                  placeholder={
                    movementType === 'egreso'
                      ? 'Ej: Pago de flete, compra de artículos de limpieza'
                      : 'Ej: Aporte de cambio menudo, ingreso por cobranza'
                  }
                  className="w-full p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] text-[#1C201E] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6F7572] mb-1">
                  Importe en Efectivo ($) <span className="text-[#B84C26]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8A908D] font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={movementAmount}
                    onChange={(e) => setMovementAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] text-[#1C201E] font-bold focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-[#8A908D]">
                  <span>Efectivo disponible en gaveta:</span>
                  <strong className="text-[#1C201E]">{formatCurrency(expectedCashInDrawer)}</strong>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 bg-[#FAF8F4] hover:bg-[#F3EFEA] text-[#1C201E] font-bold rounded-xl border border-[#E8E3DA] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 text-white font-bold rounded-xl shadow-xs cursor-pointer ${
                    movementType === 'ingreso' ? 'bg-[#246A48] hover:bg-[#1E573B]' : 'bg-[#B84C26] hover:bg-[#9B3D1D]'
                  }`}
                >
                  Confirmar {movementType === 'ingreso' ? 'Ingreso' : 'Retiro'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: APERTURA DE TURNO                                                  */}
      {/* ========================================================================= */}
      {activeModal === 'open_shift' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C201E]/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[#E8E3DA] shadow-2xl text-xs space-y-4 font-sans animate-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E3DA]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EBF5EF] text-[#246A48] flex items-center justify-center">
                  <Unlock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#1C201E]">
                    Apertura de Turno de Caja
                  </h3>
                  <p className="text-[11px] text-[#6F7572]">
                    Registra el fondo de cambio inicial para comenzar a operar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-[#8A908D] hover:text-[#1C201E] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-[#FDF2F0] border border-[#FADBD8] text-[#B84C26] rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleOpenShift} className="space-y-3.5">
              
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6F7572] mb-1">
                  Fondo Inicial de Cambio ($) <span className="text-[#B84C26]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8A908D] font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={openShiftAmount}
                    onChange={(e) => setOpenShiftAmount(e.target.value)}
                    placeholder="35000"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] text-[#1C201E] font-bold focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
                <span className="text-[11px] text-[#8A908D] mt-1 block">
                  Billetes colocados físicamente en gaveta para dar cambio.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6F7572] mb-1">
                  Responsable del Turno:
                </label>
                <select
                  value={openShiftResponsible}
                  onChange={(e) => setOpenShiftResponsible(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] text-[#1C201E] focus:outline-none focus:border-[#C85A32]"
                >
                  <option value="Santiago Pérez">Santiago Pérez (Cajero)</option>
                  <option value="Valeria Rossi">Valeria Rossi (Encargada)</option>
                  <option value="Martín Gómez">Martín Gómez (Administrador)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 bg-[#FAF8F4] hover:bg-[#F3EFEA] text-[#1C201E] font-bold rounded-xl border border-[#E8E3DA] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#246A48] hover:bg-[#1E573B] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Iniciar Turno
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRMACIÓN Y CIERRE DE TURNO                                     */}
      {/* ========================================================================= */}
      {activeModal === 'close_shift' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C201E]/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[#E8E3DA] shadow-2xl text-xs space-y-4 font-sans animate-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E3DA]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FDF7F4] text-[#C85A32] flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#1C201E]">
                    Cierre de Turno de Caja
                  </h3>
                  <p className="text-[11px] text-[#6F7572]">
                    Conciliación y rendición final de efectivo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-[#8A908D] hover:text-[#1C201E] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 p-3.5 bg-[#FAF8F4] rounded-2xl border border-[#E8E3DA]">
              <div className="flex justify-between text-[#6F7572]">
                <span>Fondo Inicial de Apertura:</span>
                <span className="font-bold text-[#1C201E]">{formatCurrency(initialCash)}</span>
              </div>
              <div className="flex justify-between text-[#246A48]">
                <span>Total Ingresos Manuales (+):</span>
                <span className="font-bold">+{formatCurrency(totalIn)}</span>
              </div>
              <div className="flex justify-between text-[#B84C26]">
                <span>Total Retiros Manuales (-):</span>
                <span className="font-bold">-{formatCurrency(totalOut)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#E8E3DA] font-bold text-[#1C201E]">
                <span>EFECTIVO ESPERADO EN GAVETA:</span>
                <span className="text-base text-[#C85A32] font-black">{formatCurrency(expectedCashInDrawer)}</span>
              </div>
            </div>

            {/* Ingreso de Arqueo Final para el cierre */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6F7572] mb-1">
                Efectivo Contado al Cierre ($):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8A908D] font-bold">
                  $
                </span>
                <input
                  type="number"
                  value={countedCashInput}
                  onChange={(e) => setCountedCashInput(e.target.value)}
                  placeholder={`Ej: ${expectedCashInDrawer}`}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F4] text-[#1C201E] font-bold focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              {parsedCountedCash !== null && (
                <div className="mt-2 p-2.5 rounded-xl bg-white border border-[#E8E3DA] flex items-center justify-between text-xs">
                  <span>Diferencia de Arqueo:</span>
                  <span className={`font-black ${
                    arqueoDifference === 0
                      ? 'text-[#246A48]'
                      : (arqueoDifference ?? 0) > 0
                      ? 'text-[#2C4A6F]'
                      : 'text-[#B84C26]'
                  }`}>
                    {arqueoDifference === 0
                      ? 'Cuadre Exacto ($0)'
                      : `${(arqueoDifference ?? 0) > 0 ? '+' : ''}${formatCurrency(arqueoDifference!)}`}
                  </span>
                </div>
              )}
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF8F4] border border-[#E8E3DA] text-[10px] text-[#6F7572] text-center">
              Al confirmar el cierre, la caja quedará inactiva y se emitirá el resumen de rendición del turno.
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 bg-[#FAF8F4] hover:bg-[#F3EFEA] text-[#1C201E] font-bold rounded-xl border border-[#E8E3DA] cursor-pointer"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleConfirmCloseShift}
                className="flex-1 py-2.5 bg-[#C85A32] hover:bg-[#B84C26] text-white font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Confirmar Cierre
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: COMPROBANTE DE CIERRE DE TURNO (RENDICIÓN)                         */}
      {/* ========================================================================= */}
      {activeModal === 'receipt' && shiftSummaryData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C201E]/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[#E8E3DA] shadow-2xl text-xs space-y-4 font-sans my-8 animate-in zoom-in-95">
            
            {/* Cabecera del Comprobante */}
            <div className="text-center pb-3 border-b border-[#E8E3DA] space-y-1">
              <div className="w-10 h-10 rounded-xl bg-[#C85A32] text-white font-black text-lg flex items-center justify-center mx-auto shadow-sm">
                360
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1C201E]">COMERCIOS 360</h3>
              <p className="text-[11px] text-[#595E5B]">
                Comprobante de Rendición & Cierre de Caja
              </p>
              <p className="text-[10px] text-[#8A908D]">
                Sucursal Central • Caja N° 01 • CUIT: 30-71889922-3
              </p>
              <div className="inline-block mt-2 px-3 py-1 bg-[#FAF8F4] border border-[#E8E3DA] rounded-lg">
                <span className="font-mono font-bold text-xs text-[#C85A32]">
                  CIERRE-{Date.now().toString().slice(-6)}
                </span>
              </div>
            </div>

            {/* Metadatos del Turno */}
            <div className="py-2 space-y-1.5 border-b border-[#E8E3DA] text-[#595E5B]">
              <div className="flex justify-between">
                <span>Responsable de Caja:</span>
                <span className="font-bold text-[#1C201E]">{shiftSummaryData.responsible}</span>
              </div>
              <div className="flex justify-between">
                <span>Horario del Turno:</span>
                <span className="font-bold text-[#1C201E]">
                  {shiftSummaryData.openingTime} a {shiftSummaryData.closingTime} hs
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estado:</span>
                <span className="font-bold text-[#246A48] bg-[#EBF5EF] px-2 py-0.2 rounded">
                  Turno Finalizado
                </span>
              </div>
            </div>

            {/* Desglose de Caja */}
            <div className="space-y-1.5 py-1 text-xs">
              <div className="flex justify-between text-[#6F7572]">
                <span>Fondo Inicial de Apertura:</span>
                <span className="font-bold text-[#1C201E]">{formatCurrency(shiftSummaryData.initialCash)}</span>
              </div>
              <div className="flex justify-between text-[#246A48]">
                <span>Ingresos Extraordinarios (+):</span>
                <span className="font-bold">+{formatCurrency(shiftSummaryData.totalIn)}</span>
              </div>
              <div className="flex justify-between text-[#B84C26]">
                <span>Retiros / Gastos del Turno (-):</span>
                <span className="font-bold">-{formatCurrency(shiftSummaryData.totalOut)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#E8E3DA] font-bold text-[#1C201E]">
                <span>EFECTIVO TEÓRICO ESPERADO:</span>
                <span className="text-sm font-black text-[#1C201E]">{formatCurrency(shiftSummaryData.expectedCash)}</span>
              </div>
              <div className="flex justify-between items-center text-[#1C201E] font-bold">
                <span>EFECTIVO CONTADO FÍSICO:</span>
                <span className="text-sm font-black text-[#C85A32]">{formatCurrency(shiftSummaryData.countedCash)}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-[#E8E3DA] font-bold">
                <span>Diferencia de Arqueo:</span>
                <span className={`text-sm font-black ${
                  shiftSummaryData.difference === 0
                    ? 'text-[#246A48]'
                    : shiftSummaryData.difference > 0
                    ? 'text-[#2C4A6F]'
                    : 'text-[#B84C26]'
                }`}>
                  {shiftSummaryData.difference === 0
                    ? 'Cuadre Exacto ($0)'
                    : `${shiftSummaryData.difference > 0 ? '+' : ''}${formatCurrency(shiftSummaryData.difference)}`}
                </span>
              </div>
            </div>

            {/* Disclaimer Demo */}
            <div className="p-2.5 rounded-xl bg-[#FAF8F4] border border-[#E8E3DA] text-[10px] text-[#6F7572] text-center leading-relaxed">
              <strong>Comprobante de Demostración:</strong> Rendición de arqueo generada en memoria sin validez fiscal vinculante.
            </div>

            {/* Botones de Acción */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-[#FAF8F4] hover:bg-[#F3EFEA] text-[#1C201E] font-bold rounded-xl border border-[#E8E3DA] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 bg-[#C85A32] hover:bg-[#B84C26] text-white font-bold rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
