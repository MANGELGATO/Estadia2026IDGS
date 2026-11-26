export type ReservacionEstado =
  | 'Pendiente'
  | 'Aprobada'
  | 'Rechazada'
  | 'En uso'
  | 'Completada';

/**
 * Transiciones válidas de estado de una reservación desde `PUT /api/reservaciones`.
 * - Pendiente  -> Aprobada | Rechazada
 * - Aprobada   -> En uso | Rechazada | Completada
 * - En uso     -> (ninguna por edición directa; solo pasa a Completada mediante devolución en Bitácora)
 * - Rechazada  -> terminal
 * - Completada -> terminal
 */
export const VALID_RESERVACION_TRANSITIONS: Record<ReservacionEstado, ReservacionEstado[]> = {
  Pendiente: ['Aprobada', 'Rechazada'],
  Aprobada: ['En uso', 'Rechazada', 'Completada'],
  'En uso': [],
  Rechazada: [],
  Completada: [],
};

export type ReservacionTransitionResult =
  | { valid: true }
  | { valid: false; message: string };

/**
 * Valida si una reservación puede transicionar de `from` a `to` mediante edición/gestión directa.
 * Mantener el mismo estado (`from === to`) siempre es válido para editar datos de la reservación.
 */
export function validateReservacionTransition(
  from: ReservacionEstado,
  to: ReservacionEstado
): ReservacionTransitionResult {
  if (from === to) {
    return { valid: true };
  }

  if (from === 'En uso' && to === 'Completada') {
    return {
      valid: false,
      message:
        'Una reservación "En uso" solo puede pasar a "Completada" registrando la devolución en Bitácora.',
    };
  }

  const allowed = VALID_RESERVACION_TRANSITIONS[from] ?? [];
  if (allowed.includes(to)) {
    return { valid: true };
  }

  if (allowed.length === 0) {
    return {
      valid: false,
      message: `No se puede cambiar el estado de una reservación en "${from}" a "${to}".`,
    };
  }

  return {
    valid: false,
    message: `Transición inválida de "${from}" a "${to}". Estados permitidos: ${allowed.join(', ')}.`,
  };
}

/**
 * Opciones válidas para el `<select>` de estado en el formulario de edición:
 * siempre incluye el estado actual + los estados siguientes permitidos.
 */
export function getAllowedReservationSelectOptions(
  current: ReservacionEstado
): ReservacionEstado[] {
  return [current, ...(VALID_RESERVACION_TRANSITIONS[current] ?? [])];
}
