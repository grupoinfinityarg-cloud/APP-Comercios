import {
  AuditLogEvent,
  AuditLogModule,
  AuditLogCategory,
  AuditLogStatus,
  Employee,
  Store,
} from '../types';
import { calculateSHA256Sync, getCanonicalEventPayload } from './auditIntegrity';

export interface CreateAuditEventParams {
  module: AuditLogModule;
  action: string;
  category: AuditLogCategory;
  details: string;
  status?: AuditLogStatus; // Defaults to 'exitoso'
  currentUser?: { name?: string; role?: Employee['role'] | 'Sistema'; id?: string } | null;
  currentStore?: { name?: string; id?: string } | null;
  entityId?: string;
  previousValue?: string;
  newValue?: string;
  severity?: 'baja' | 'media' | 'alta' | 'critica';
  terminalCode?: string;
}

// In-memory deduplication cache to prevent double-logging from React double-renders or accidental rapid double clicks
interface RecentLogEntry {
  key: string;
  time: number;
}
const recentLogsWindow: RecentLogEntry[] = [];
const DEDUP_WINDOW_MS = 1200;

function isRecentDuplicate(key: string): boolean {
  const now = Date.now();
  // Clean entries older than window
  while (recentLogsWindow.length > 0 && now - recentLogsWindow[0].time > DEDUP_WINDOW_MS) {
    recentLogsWindow.shift();
  }
  const found = recentLogsWindow.some((entry) => entry.key === key);
  if (found) {
    return true;
  }
  recentLogsWindow.push({ key, time: now });
  return false;
}

/**
 * Creates a valid, cryptographically chained AuditLogEvent with origin 'sistema_local'.
 * Returns null if the event is a duplicate within the short debounce window.
 */
export function createAuditEvent(
  params: CreateAuditEventParams,
  currentLogs: AuditLogEvent[]
): AuditLogEvent | null {
  const dedupKey = `${params.module}|${params.action}|${params.entityId || ''}|${params.details}`;
  if (isRecentDuplicate(dedupKey)) {
    return null;
  }

  // Sort existing events chronologically (oldest to newest) to get the latest block hash
  const chronological = [...currentLogs].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime() || 0;
    const timeB = new Date(b.timestamp).getTime() || 0;
    return timeA - timeB;
  });

  const latestEvent = chronological.length > 0 ? chronological[chronological.length - 1] : null;
  const previousHash =
    latestEvent?.hash ||
    (latestEvent
      ? calculateSHA256Sync(getCanonicalEventPayload(latestEvent, latestEvent.previousHash || ''))
      : 'GENESIS_BLOCK_COMERCIOS360');

  // Ensure the new event timestamp is strictly monotonic (newer than the latest event)
  const nowMs = Date.now();
  const latestTimeMs = latestEvent ? new Date(latestEvent.timestamp).getTime() || 0 : 0;
  const safeTimeMs = Math.max(nowMs, latestTimeMs + 1);
  const now = new Date(safeTimeMs);
  const timestamp = now.toISOString();

  const friendlyTime =
    'Hoy, ' + now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  const id = `aud-loc-${safeTimeMs}-${Math.floor(100 + Math.random() * 900)}`;

  const event: AuditLogEvent = {
    id,
    timestamp,
    displayTime: friendlyTime,
    userName: params.currentUser?.name || 'Usuario del sistema',
    userRole: params.currentUser?.role || 'Sistema',
    userId: params.currentUser?.id,
    storeName: params.currentStore?.name || 'Sucursal Central',
    storeId: params.currentStore?.id || 'store-1',
    module: params.module,
    action: params.action,
    category: params.category,
    status: params.status || 'exitoso',
    details: params.details,
    origin: 'sistema_local', // Strictly marked as real local application operation
    entityId: params.entityId,
    previousValue: params.previousValue,
    newValue: params.newValue,
    severity: params.severity || 'baja',
    terminalCode: params.terminalCode || 'Terminal Web Local',
    previousHash,
  };

  // Calculate real canonical SHA-256 for the new block
  const canonical = getCanonicalEventPayload(event, previousHash);
  event.hash = calculateSHA256Sync(canonical);

  return event;
}
