/**
 * Utilidades de fecha y hora independientes de la zona horaria del contenedor.
 *
 * Regla de arquitectura PLAi:
 * - En Directus / base de datos todo timestamp se almacena en UTC (ISO-8601 con sufijo `Z`).
 * - En la interfaz y en los inputs `datetime-local` todo se interpreta y muestra en `America/Mexico_City`.
 */

export const MEXICO_TIME_ZONE = 'America/Mexico_City';

const HAS_EXPLICIT_TZ_REGEX = /(?:[zZ]|[+-]\d{2}:?\d{2})$/;
const LOCAL_DATETIME_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?$/;

/**
 * Obtiene las partes de calendario (año, mes, día, hora, minuto, segundo) de un instante UTC
 * proyectado a la zona horaria `America/Mexico_City`.
 */
function getMexicoParts(date: Date): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: MEXICO_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(date);
  const pick = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? '0');

  return {
    year: pick('year'),
    month: pick('month'),
    day: pick('day'),
    hour: pick('hour') === 24 ? 0 : pick('hour'),
    minute: pick('minute'),
    second: pick('second'),
  };
}

/**
 * Calcula el desplazamiento (en ms) entre UTC y `America/Mexico_City` para una fecha/hora dada.
 * Fórmula: `utcMs = localWallAsUtcMs - offsetMs` donde `offsetMs = mexicoWallAsUtcMs - probeUtcMs`.
 */
function resolveMexicoWallClockToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number
): Date {
  const wallAsUtcMs = Date.UTC(year, month - 1, day, hour, minute, second);

  // Primera aproximación del offset usando el instante wallAsUtcMs
  const probe1 = new Date(wallAsUtcMs);
  const p1 = getMexicoParts(probe1);
  const p1AsUtc = Date.UTC(p1.year, p1.month - 1, p1.day, p1.hour, p1.minute, p1.second);
  const offset1 = p1AsUtc - probe1.getTime();

  // Segunda iteración para exactitud en bordes históricos de cambio de horario
  const candidate = new Date(wallAsUtcMs - offset1);
  const p2 = getMexicoParts(candidate);
  const p2AsUtc = Date.UTC(p2.year, p2.month - 1, p2.day, p2.hour, p2.minute, p2.second);
  const offset2 = p2AsUtc - candidate.getTime();

  return new Date(wallAsUtcMs - offset2);
}

/**
 * 1. Convierte una fecha/hora local de México (`YYYY-MM-DD`, opcionalmente `HH:MM[:SS]`,
 *    o una cadena `YYYY-MM-DDTHH:mm` / `YYYY-MM-DD HH:mm:ss`) a un timestamp ISO-8601 UTC (`...Z`).
 *    - Si la entrada ya trae zona horaria explícita (`Z` o `±HH:MM`), respeta su instante UTC exacto.
 *    - Nunca depende de `TZ` del contenedor ni del sistema operativo.
 */
export function mexicoLocalToUtcIso(dateOrDateTime: string | Date, time?: string): string {
  if (dateOrDateTime instanceof Date) {
    return dateOrDateTime.toISOString();
  }

  const raw = time ? `${dateOrDateTime.trim()} ${time.trim()}` : dateOrDateTime.trim();
  if (!raw) {
    return new Date().toISOString();
  }

  if (HAS_EXPLICIT_TZ_REGEX.test(raw)) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  const match = LOCAL_DATETIME_REGEX.exec(raw);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = match[4] !== undefined ? Number(match[4]) : 0;
    const minute = match[5] !== undefined ? Number(match[5]) : 0;
    const second = match[6] !== undefined ? Number(match[6]) : 0;

    return resolveMexicoWallClockToUtc(year, month, day, hour, minute, second).toISOString();
  }

  const fallback = new Date(raw);
  if (!Number.isNaN(fallback.getTime())) {
    return fallback.toISOString();
  }
  return raw;
}

/**
 * 2. Formatea cualquier timestamp UTC/ISO (o fecha local) para mostrar en pantalla
 *    siempre en zona horaria `America/Mexico_City` con `Intl.DateTimeFormat`.
 *    Ejemplo: `2026-11-26T17:30:00.000Z` -> `26/11/2026, 11:30`
 */
export function formatMexicoDateTime(val?: string | Date | null): string {
  if (!val) return '';
  const iso = val instanceof Date ? val.toISOString() : mexicoLocalToUtcIso(val);
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return String(val);
  }

  return new Intl.DateTimeFormat('es-MX', {
    timeZone: MEXICO_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
}

/**
 * 3. Genera un valor compatible con `<input type="datetime-local">` (`YYYY-MM-DDTHH:mm`)
 *    calculado en zona horaria `America/Mexico_City` (independiente de la TZ del navegador o servidor).
 */
export function getMexicoDateTimeLocalInput(baseDate: Date = new Date(), offsetMs = 0): string {
  const target = new Date(baseDate.getTime() + offsetMs);
  const p = getMexicoParts(target);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/**
 * Devuelve la fecha actual (`YYYY-MM-DD`) en zona horaria `America/Mexico_City`.
 * Útil para rechazar fechas pasadas y validar `maxAdvanceDays` en el servidor.
 */
export function getMexicoTodayYmd(baseDate: Date = new Date()): string {
  const p = getMexicoParts(baseDate);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/**
 * Suma `days` días calendario a una fecha `YYYY-MM-DD` (aritmética pura en UTC sin deriva de DST).
 */
export function addDaysToYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}
