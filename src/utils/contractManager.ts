/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CommercialContract,
  CommercialEditionTier,
  ContractOperationType,
  ContractStatus,
} from '../types';

/**
 * Constantes comerciales del sistema de contratos y pruebas de COMERCIOS 360.
 */
export const MIN_CONTRACT_DURATION_DAYS = 1;
export const MAX_CONTRACT_DURATION_DAYS = 360;
export const DEFAULT_TRIAL_DURATION_DAYS = 7;
export const DEFAULT_CONTRACT_DURATION_DAYS = 30;

/**
 * Milisegundos exactos en un día estándar (24 * 60 * 60 * 1000).
 */
const MS_PER_DAY = 86_400_000;

/**
 * Planes comerciales válidos en el sistema.
 */
const VALID_PLAN_TIERS: readonly CommercialEditionTier[] = [
  'demo',
  'basica',
  'avanzada',
  'full',
] as const;

/**
 * Tipos de operación comercial válidos.
 */
const VALID_OPERATION_TYPES: readonly ContractOperationType[] = [
  'prueba_gratuita',
  'contratacion_comercial',
] as const;

/**
 * Comprueba si la duración especificada es un número entero válido entre 1 y 360 días, inclusive.
 *
 * Rechaza de forma estricta:
 * - Cero (0).
 * - Números negativos (< 0).
 * - Decimales (e.g. 1.5, 7.2).
 * - Valores superiores a 360 (> 360).
 * - NaN, Infinity y -Infinity.
 * - Valores que no sean de tipo 'number' (strings, null, undefined, booleanos, objetos).
 *
 * @param days Valor a evaluar
 * @returns true si es un número entero en el rango [1, 360], false en cualquier otro caso
 */
export function isValidDurationDays(days: unknown): days is number {
  if (typeof days !== 'number') {
    return false;
  }
  if (!Number.isFinite(days) || Number.isNaN(days)) {
    return false;
  }
  if (!Number.isInteger(days)) {
    return false;
  }
  return days >= MIN_CONTRACT_DURATION_DAYS && days <= MAX_CONTRACT_DURATION_DAYS;
}

/**
 * Convierte de manera segura un valor de fecha (string ISO o Date) a un objeto Date válido sin mutar.
 *
 * @param date Entrada como string ISO o Date
 * @returns Copia del objeto Date validado
 * @throws TypeError si la fecha es inválida o no parseable
 */
function parseSafeDate(date: string | Date, fieldName: string = 'fecha'): Date {
  if (date instanceof Date) {
    if (Number.isNaN(date.getTime())) {
      throw new TypeError(`La ${fieldName} provista no es una fecha válida.`);
    }
    // Retorna una copia exacta para garantizar inmutabilidad
    return new Date(date.getTime());
  }

  if (typeof date === 'string' && date.trim().length > 0) {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      throw new TypeError(`La ${fieldName} provista '${date}' no pudo ser interpretada como fecha válida.`);
    }
    return parsed;
  }

  throw new TypeError(`La ${fieldName} es requerida y debe ser un objeto Date o un string ISO válido.`);
}

/**
 * Calcula la fecha y hora de vencimiento a partir de una fecha de inicio y una cantidad de días enteros.
 *
 * Requisitos y garantías:
 * 1. Valida estrictamente la fecha de inicio.
 * 2. Valida estrictamente que la duración sea un entero entre 1 y 360 días.
 * 3. NO modifica el objeto Date original recibido (función pura e inmutable).
 * 4. Política de cálculo documentada: Se suma la cantidad de días calendario exactos
 *    (`durationDays * 24 horas = durationDays * 86.400.000 ms`), preservando la hora,
 *    minutos, segundos y milisegundos de la fecha de inicio, evitando derivas horarias.
 * 5. Devuelve la fecha resultante formateada como string ISO 8601 canónico (`YYYY-MM-DDTHH:mm:ss.sssZ`).
 *
 * @param startDate Fecha y hora de inicio (Date o string ISO)
 * @param durationDays Cantidad de días enteros de duración (1 a 360)
 * @returns Fecha de vencimiento en formato ISO 8601
 * @throws TypeError si la fecha de inicio es inválida
 * @throws RangeError si durationDays no es un entero entre 1 y 360
 */
export function calculateExpirationDate(
  startDate: string | Date,
  durationDays: number
): string {
  const safeStart = parseSafeDate(startDate, 'fecha de inicio');

  if (!isValidDurationDays(durationDays)) {
    throw new RangeError(
      `La duración debe ser un número entero entre ${MIN_CONTRACT_DURATION_DAYS} y ${MAX_CONTRACT_DURATION_DAYS} días. Se recibió: ${String(durationDays)}`
    );
  }

  // Cálculo puro por milisegundos para evitar efectos secundarios de zonas horarias locales
  const expirationMs = safeStart.getTime() + durationDays * MS_PER_DAY;
  const expirationDate = new Date(expirationMs);

  return expirationDate.toISOString();
}

/**
 * Determina si un contrato ha vencido comparando su fecha de vencimiento contra una fecha de referencia.
 *
 * Requisitos y garantías:
 * 1. Acepta una fecha de referencia opcional para facilitar pruebas unitarias controladas sin
 *    depender de la hora real del reloj del sistema.
 * 2. Si no se provee fecha de referencia, utiliza la fecha actual del sistema (`new Date()`).
 * 3. Regla de vencimiento: Un contrato se considera vencido cuando la fecha de referencia
 *    alcanza o supera su vencimiento (`referenceDate >= expirationDate`).
 * 4. Seguridad defensiva: Si la fecha de vencimiento es inválida, retorna `true` (se considera
 *    vencido / no vigente por seguridad para evitar accesos indebidos).
 *
 * @param expirationDate Fecha de vencimiento (Date o string ISO)
 * @param referenceDate Fecha de referencia para la evaluación (opcional, Date o string ISO)
 * @returns true si el contrato está vencido; false si aún está vigente
 */
export function isContractExpired(
  expirationDate: string | Date,
  referenceDate?: string | Date
): boolean {
  try {
    const expDate = parseSafeDate(expirationDate, 'fecha de vencimiento');
    const refDate = referenceDate !== undefined
      ? parseSafeDate(referenceDate, 'fecha de referencia')
      : new Date();

    return refDate.getTime() >= expDate.getTime();
  } catch {
    // Si la fecha de vencimiento es inválida, se considera vencido por política de seguridad
    return true;
  }
}

/**
 * Calcula la cantidad de días enteros restantes hasta el vencimiento de un contrato.
 *
 * Política de redondeo y casos especiales:
 * 1. Se calcula la diferencia en milisegundos: `diffMs = expirationDate.getTime() - referenceDate.getTime()`.
 * 2. Si la diferencia es menor o igual a cero (`diffMs <= 0`), el contrato está vencido y se retorna `0`.
 * 3. Política de redondeo a favor del comerciante: Se aplica `Math.ceil(diffMs / MS_PER_DAY)`.
 *    De esta manera, si restan 24 horas o cualquier fracción de día (ej. 12 horas, 1 minuto),
 *    se computa como 1 día restante completo para evitar que el comerciante vea 0 días
 *    cuando todavía tiene horas disponibles durante la jornada de vencimiento.
 * 4. Si alguna de las fechas es inválida o no interpretable, retorna `0` de forma segura.
 *
 * @param expirationDate Fecha de vencimiento (Date o string ISO)
 * @param referenceDate Fecha de referencia (opcional, Date o string ISO, por defecto hoy)
 * @returns Cantidad de días enteros restantes (>= 0)
 */
export function getRemainingDays(
  expirationDate: string | Date,
  referenceDate?: string | Date
): number {
  try {
    const expDate = parseSafeDate(expirationDate, 'fecha de vencimiento');
    const refDate = referenceDate !== undefined
      ? parseSafeDate(referenceDate, 'fecha de referencia')
      : new Date();

    const diffMs = expDate.getTime() - refDate.getTime();

    if (diffMs <= 0) {
      return 0;
    }

    return Math.ceil(diffMs / MS_PER_DAY);
  } catch {
    return 0;
  }
}

/**
 * Resultado de la validación de coherencia de un contrato.
 */
export interface ContractValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Comprueba la coherencia estructural y las reglas de negocio de un contrato comercial.
 *
 * Reglas de coherencia evaluadas:
 * 1. Identificador de plan válido: debe pertenecer a ['demo', 'basica', 'avanzada', 'full'].
 * 2. Tipo de operación válido: debe ser 'prueba_gratuita' o 'contratacion_comercial'.
 * 3. Duración válida: debe ser un número entero entre 1 y 360 días.
 * 4. Fechas válidas: startDate y expirationDate deben ser interpretables como fechas válidas.
 * 5. Secuencia temporal: expirationDate debe ser estrictamente posterior a startDate.
 * 6. REGLA COMERCIAL DE PRUEBA: Si la operación es 'prueba_gratuita', el plan DEBE ser obligatoriamente 'demo'.
 *    No se permite que una prueba gratuita se asigne a Oro, Platino o Diamante.
 * 7. REGLA COMERCIAL DE CONTRATACIÓN: Si la operación es 'contratacion_comercial', el plan DEBE ser
 *    obligatoriamente 'basica' (Plan Oro), 'avanzada' (Plan Platino) o 'full' (Plan Diamante).
 *    No se permite que una contratación comercial pague por el plan 'demo'.
 *
 * @param contract Objeto de contrato a validar (puede ser parcial para formularios)
 * @returns Objeto con flag `isValid: boolean` y lista de `errors: string[]`
 */
export function validateContractCoherence(
  contract: Partial<CommercialContract>
): ContractValidationResult {
  const errors: string[] = [];

  // 1. Validación de identificador único
  if (!contract.id || typeof contract.id !== 'string' || contract.id.trim() === '') {
    errors.push('El contrato debe tener un identificador único no vacío.');
  }

  // 2. Validación del tipo de operación
  if (!contract.operationType || !VALID_OPERATION_TYPES.includes(contract.operationType)) {
    errors.push(
      `El tipo de operación es inválido. Debe ser 'prueba_gratuita' o 'contratacion_comercial'.`
    );
  }

  // 3. Validación del plan comercial
  if (!contract.planTier || !VALID_PLAN_TIERS.includes(contract.planTier)) {
    errors.push(
      `El plan comercial es inválido. Debe ser uno de los identificadores válidos: 'demo', 'basica', 'avanzada', 'full'.`
    );
  }

  // 4. Validación de duración
  if (!isValidDurationDays(contract.durationDays)) {
    errors.push(
      `La duración es inválida. Debe ser un número entero entre ${MIN_CONTRACT_DURATION_DAYS} y ${MAX_CONTRACT_DURATION_DAYS} días.`
    );
  }

  // 5. Validación de fechas
  let startParsed: Date | null = null;
  let endParsed: Date | null = null;

  try {
    if (contract.startDate) {
      startParsed = parseSafeDate(contract.startDate, 'fecha de inicio');
    } else {
      errors.push('La fecha de inicio es requerida.');
    }
  } catch (err) {
    errors.push(err instanceof Error ? err.message : 'Fecha de inicio inválida.');
  }

  try {
    if (contract.expirationDate) {
      endParsed = parseSafeDate(contract.expirationDate, 'fecha de vencimiento');
    } else {
      errors.push('La fecha de vencimiento es requerida.');
    }
  } catch (err) {
    errors.push(err instanceof Error ? err.message : 'Fecha de vencimiento inválida.');
  }

  if (startParsed && endParsed) {
    if (endParsed.getTime() <= startParsed.getTime()) {
      errors.push('La fecha de vencimiento debe ser estrictamente posterior a la fecha de inicio.');
    }
  }

  // 6. Regla de coherencia exclusiva: Prueba gratuita ↔ PLAN DEMO
  if (contract.operationType === 'prueba_gratuita') {
    if (contract.planTier && contract.planTier !== 'demo') {
      errors.push(
        `Incoherencia comercial: Toda prueba gratuita debe utilizar exclusivamente el PLAN DEMO ('demo'). Se especificó '${contract.planTier}'.`
      );
    }
  }

  // 7. Regla de coherencia exclusiva: Contratación comercial ↔ PLAN ORO, PLATINO o DIAMANTE
  if (contract.operationType === 'contratacion_comercial') {
    if (contract.planTier === 'demo') {
      errors.push(
        `Incoherencia comercial: Una contratación comercial directa no puede utilizar el PLAN DEMO; debe seleccionar Plan Oro ('basica'), Plan Platino ('avanzada') o Plan Diamante ('full').`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Parámetros para la creación de un nuevo contrato comercial.
 */
export interface CreateContractParams {
  id?: string;
  storeId?: string;
  merchantName?: string;
  operationType: ContractOperationType;
  planTier: CommercialEditionTier;
  durationDays?: number;
  startDate?: string | Date;
  status?: ContractStatus;
  notes?: string;
}

/**
 * Función fábrica pura para instanciar un contrato comercial coherente y validado.
 *
 * Reglas por defecto:
 * - Si es 'prueba_gratuita': fuerza el plan a 'demo' y duración predeterminada a 7 días.
 * - Si es 'contratacion_comercial': duración predeterminada a 30 días.
 * - Calcula automáticamente la fecha de vencimiento a partir de la fecha de inicio y duración.
 * - Genera identificador único si no se provee.
 *
 * @param params Parámetros de configuración del contrato
 * @returns Instancia completa de CommercialContract
 * @throws Error si el contrato resultante no pasa la validación de coherencia
 */
export function createCommercialContract(params: CreateContractParams): CommercialContract {
  const isTrial = params.operationType === 'prueba_gratuita';

  // Plan obligatorio: prueba gratuita fuerza 'demo', contratación requiere basica/avanzada/full
  const resolvedPlanTier: CommercialEditionTier = isTrial ? 'demo' : params.planTier;

  // Duración predeterminada: 7 días para pruebas, 30 días para contrataciones
  const resolvedDuration: number =
    params.durationDays !== undefined
      ? params.durationDays
      : isTrial
      ? DEFAULT_TRIAL_DURATION_DAYS
      : DEFAULT_CONTRACT_DURATION_DAYS;

  // Fecha de inicio: ahora por defecto
  const startObj = params.startDate ? parseSafeDate(params.startDate, 'fecha de inicio') : new Date();
  const startIso = startObj.toISOString();

  // Cálculo automático del vencimiento
  const expirationIso = calculateExpirationDate(startObj, resolvedDuration);

  const contract: CommercialContract = {
    id: params.id || `contract-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    storeId: params.storeId,
    merchantName: params.merchantName,
    operationType: params.operationType,
    planTier: resolvedPlanTier,
    startDate: startIso,
    durationDays: resolvedDuration,
    expirationDate: expirationIso,
    status: params.status || 'activo',
    createdAt: new Date().toISOString(),
    notes: params.notes,
  };

  const validation = validateContractCoherence(contract);
  if (!validation.isValid) {
    throw new Error(`Error de coherencia al crear contrato: ${validation.errors.join(' | ')}`);
  }

  return contract;
}
