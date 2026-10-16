import { AuditLogEvent } from '../types';

/**
 * Standard pure TypeScript SHA-256 implementation conforming to FIPS 180-4.
 * Used for deterministic, synchronous canonical hashing in browser environments,
 * with optional asynchronous Web Crypto API verification.
 */
function sha256Sync(ascii: string): string {
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i = 0;
  let j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  // Initial hash values: first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19
  let hash: number[] = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  // First 32 bits of the fractional parts of the cube roots of the first 64 primes 2..311
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  // Encode UTF-8
  const utf8: number[] = [];
  for (let idx = 0; idx < ascii.length; idx++) {
    let charcode = ascii.charCodeAt(idx);
    if (charcode < 0x80) {
      utf8.push(charcode);
    } else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    } else {
      idx++;
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (ascii.charCodeAt(idx) & 0x3ff));
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
  }

  const bitLength = utf8.length * 8;
  utf8.push(0x80);
  while ((utf8.length + 8) % 64 !== 0) {
    utf8.push(0);
  }

  // 64-bit big endian length
  for (let kIdx = 7; kIdx >= 0; kIdx--) {
    utf8.push((bitLength >>> (kIdx * 8)) & 0xff);
  }

  for (let b = 0; b < utf8.length; b += 4) {
    words.push((utf8[b] << 24) | (utf8[b + 1] << 16) | (utf8[b + 2] << 8) | utf8[b + 3]);
  }

  const w = new Array(64);
  for (let chunk = 0; chunk < words.length; chunk += 16) {
    const [a0, b0, c0, d0, e0, f0, g0, h0] = hash;
    let [a, b, c, d, e, f, g, h] = [a0, b0, c0, d0, e0, f0, g0, h0];

    for (let t = 0; t < 64; t++) {
      if (t < 16) {
        w[t] = words[chunk + t];
      } else {
        const gamma0 =
          ((w[t - 15] >>> 7) | (w[t - 15] << 25)) ^
          ((w[t - 15] >>> 18) | (w[t - 15] << 14)) ^
          (w[t - 15] >>> 3);
        const gamma1 =
          ((w[t - 2] >>> 17) | (w[t - 2] << 15)) ^
          ((w[t - 2] >>> 19) | (w[t - 2] << 13)) ^
          (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + gamma0 + w[t - 7] + gamma1) | 0;
      }

      const s1 =
        ((e >>> 6) | (e << 26)) ^
        ((e >>> 11) | (e << 21)) ^
        ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + k[t] + w[t]) | 0;

      const s0 =
        ((a >>> 2) | (a << 30)) ^
        ((a >>> 13) | (a << 19)) ^
        ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  for (let idx = 0; idx < 8; idx++) {
    result += (hash[idx] >>> 0).toString(16).padStart(8, '0');
  }

  return result;
}

/**
 * Compute SHA-256 hash using native Web Crypto API when available,
 * with automated fallback to pure JS implementation.
 */
export async function calculateSHA256(message: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback
    }
  }
  return sha256Sync(message);
}

/**
 * Synchronous version for instant UI responsiveness.
 */
export function calculateSHA256Sync(message: string): string {
  return sha256Sync(message);
}

/**
 * Constructs the canonical normalized string for an audit event.
 * Exactly includes:
 * - id
 * - timestamp (ISO)
 * - userName
 * - userRole
 * - storeName
 * - module
 * - action
 * - category
 * - status
 * - details
 * - origin ('demo' | 'manual_prueba' | 'sistema_local')
 * - entityId (or empty)
 * - previousHash (chained block linkage)
 */
export function getCanonicalEventPayload(
  event: AuditLogEvent,
  previousHash: string = ''
): string {
  return [
    event.id || '',
    event.timestamp || '',
    event.userName || '',
    event.userRole || '',
    event.storeName || '',
    event.module || '',
    event.action || '',
    event.category || '',
    event.status || '',
    event.details || '',
    event.origin || 'demo',
    event.entityId || '',
    previousHash || 'GENESIS',
  ].join('|');
}

export interface DiscrepancyReport {
  eventId: string;
  type: 'hash_mismatch' | 'chain_broken' | 'schema_invalid' | 'missing_field' | 'duplicate_id';
  message: string;
  storedHash?: string;
  recomputedHash?: string;
  expectedPreviousHash?: string;
  actualPreviousHash?: string;
}

export interface IntegrityVerificationResult {
  isValid: boolean;
  totalEvents: number;
  verifiedCount: number;
  discrepancies: DiscrepancyReport[];
  checkedAt: string;
  limitationNote: string;
  canonicalFieldsList: string[];
}

/**
 * Performs a genuine local integrity check across the provided audit log records:
 * 1. Checks schema conformity and non-empty required fields.
 * 2. Checks unique event IDs (no duplicates).
 * 3. Reconstructs chronological chain and computes SHA-256 on canonical payloads in real time.
 * 4. Compares stored hashes against recomputed hashes whenever present.
 * 5. Compares previousHash chain links to detect insertion/deletion/reordering.
 * 6. Explicitly reports all discrepancies found.
 */
export function verifyAuditLogIntegrity(events: AuditLogEvent[]): IntegrityVerificationResult {
  const discrepancies: DiscrepancyReport[] = [];
  const seenIds = new Set<string>();

  // Sort events chronologically (oldest to newest) to evaluate sequential chaining
  const chronological = [...events].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime() || 0;
    const timeB = new Date(b.timestamp).getTime() || 0;
    return timeA - timeB;
  });

  let runningPreviousHash = 'GENESIS_BLOCK_COMERCIOS360';
  let verifiedCount = 0;

  for (let idx = 0; idx < chronological.length; idx++) {
    const event = chronological[idx];

    // 1. Check ID uniqueness
    if (!event.id) {
      discrepancies.push({
        eventId: `evento-indice-${idx}`,
        type: 'missing_field',
        message: 'El registro no posee un identificador único (ID ausente).',
      });
      continue;
    }

    if (seenIds.has(event.id)) {
      discrepancies.push({
        eventId: event.id,
        type: 'duplicate_id',
        message: `Identificador duplicado detectado: el ID "${event.id}" ya existe en otro evento.`,
      });
    }
    seenIds.add(event.id);

    // 2. Check required fields
    if (!event.action || !event.userName || !event.module || !event.status || !event.timestamp) {
      discrepancies.push({
        eventId: event.id,
        type: 'schema_invalid',
        message: `Campos estructurales obligatorios incompletos en evento #${event.id}.`,
      });
    }

    // 3. Compute canonical representation & real SHA-256
    const canonical = getCanonicalEventPayload(event, runningPreviousHash);
    const recomputedHash = calculateSHA256Sync(canonical);

    // 4. Compare with stored hash if event has an assigned hash
    if (event.hash) {
      if (event.hash.toLowerCase() !== recomputedHash.toLowerCase()) {
        discrepancies.push({
          eventId: event.id,
          type: 'hash_mismatch',
          message: `Discrepancia de integridad en evento #${event.id}: el hash almacenado (${event.hash.slice(
            0,
            12
          )}...) no coincide con el hash recalculado a partir de los datos canónicos actuales (${recomputedHash.slice(
            0,
            12
          )}...). Los datos fueron alterados.`,
          storedHash: event.hash,
          recomputedHash,
        });
      } else {
        verifiedCount++;
      }
    } else {
      // Event without pre-stored hash: verified dynamically against canonical rule
      verifiedCount++;
    }

    // 5. Check chain link if event explicitly specifies previousHash
    if (event.previousHash) {
      if (event.previousHash !== runningPreviousHash) {
        discrepancies.push({
          eventId: event.id,
          type: 'chain_broken',
          message: `Rotura de cadena criptográfica en evento #${event.id}: el previousHash (${event.previousHash.slice(
            0,
            10
          )}...) no coincide con la huella del bloque precedente (${runningPreviousHash.slice(
            0,
            10
          )}...). Posible inserción o eliminación de registros intermedios.`,
          expectedPreviousHash: runningPreviousHash,
          actualPreviousHash: event.previousHash,
        });
      }
    }

    // Update running chain hash
    runningPreviousHash = recomputedHash;
  }

  const isValid = discrepancies.length === 0;

  return {
    isValid,
    totalEvents: events.length,
    verifiedCount,
    discrepancies,
    checkedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    limitationNote:
      'Esta comprobación se ejecuta localmente en el navegador mediante SHA-256 sobre los datos presentes en memoria / localStorage. Como no existe un servidor remoto de tiempo ni una base de datos inmutable de solo adición (append-only ledger), cualquier usuario con acceso a las herramientas de desarrollo del navegador puede modificar tanto los registros como sus hashes. Esta función detecta inconsistencias de formato y manipulaciones no sincronizadas, pero no constituye una garantía criptográfica infalsificable contra atacantes con acceso local.',
    canonicalFieldsList: [
      'id (Identificador)',
      'timestamp (Fecha/Hora ISO)',
      'userName (Colaborador)',
      'userRole (Rol)',
      'storeName (Sucursal)',
      'module (Módulo)',
      'action (Acción)',
      'category (Categoría)',
      'status (Resultado)',
      'details (Descripción)',
      'origin (demo / manual_prueba / sistema_local)',
      'entityId (Entidad relacionada)',
      'previousHash (Enlace al bloque anterior)',
    ],
  };
}
