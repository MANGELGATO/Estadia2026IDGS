export const MAX_LOAN_MINUTES = 120;

export type TimeRangeResult =
  | { valid: true }
  | { valid: false; reason: 'too-long' | 'non-positive' };

/** Convierte "HH:MM" a minutos desde medianoche. */
export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Valida el rango de un préstamo: fin > inicio y duración máxima de 2 horas. */
export function validateTimeRange(start: string, end: string): TimeRangeResult {
  const diff = toMinutes(end) - toMinutes(start);
  if (diff > MAX_LOAN_MINUTES) return { valid: false, reason: 'too-long' };
  if (diff <= 0) return { valid: false, reason: 'non-positive' };
  return { valid: true };
}
