export const MAX_LOAN_MINUTES = 120;
export const ABSOLUTE_MAX_LOAN_MINUTES = 8 * 60; // Tope técnico máximo configurable (8 horas)

export type TimeRangeResult =
  | { valid: true }
  | { valid: false; reason: 'too-long' | 'non-positive' };

/** Convierte "HH:MM" a minutos desde medianoche. */
export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Valida el rango de un préstamo: fin > inicio y duración <= `maxMinutes`
 * (por defecto `MAX_LOAN_MINUTES = 120`, o el valor configurado en `maxReservationHours * 60`).
 */
export function validateTimeRange(
  start: string,
  end: string,
  maxMinutes: number = MAX_LOAN_MINUTES
): TimeRangeResult {
  const diff = toMinutes(end) - toMinutes(start);
  if (diff > maxMinutes) return { valid: false, reason: 'too-long' };
  if (diff <= 0) return { valid: false, reason: 'non-positive' };
  return { valid: true };
}
