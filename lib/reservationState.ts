export type ReservacionEstado =
  | 'Pendiente'
  | 'Aprobada'
  | 'Rechazada'
  | 'En uso'
  | 'Completada';

/**
 * Determina si una reservación corresponde a un equipo físico del inventario
 * (requiere `equipoId` válido y cierre por devolución en Bitácora) o si es una
 * solicitud de espacio físico / curso / visita (no usa equipo del inventario).
 */
export function reservationRequiresEquipment(reserva: {
  id?: string | null;
  folio?: string | null;
  codigoPlaiAsignado?: string | null;
  actividad?: string | null;
}): boolean {
  const id = String(reserva.id || '');
  const folio = String(reserva.folio || '').toUpperCase();
  const codigo = String(reserva.codigoPlaiAsignado || '').toUpperCase();
  const actividad = String(reserva.actividad || '');

  if (
    id.startsWith('esp-') ||
    folio.startsWith('ESP-') ||
    folio.startsWith('CUR-') ||
    codigo.startsWith('ESPACIO-') ||
    actividad.startsWith('[ESPACIO:') ||
    actividad.startsWith('[CURSO / VISITA]')
  ) {
    return false;
  }

  return true;
}

/**
 * Transiciones válidas de estado de una reservación con equipo físico desde `PUT /api/reservaciones`.
 * - Pendiente  -> Aprobada | Rechazada
 * - Aprobada   -> En uso | Rechazada | Completada
 * - En uso     -> (ninguna por edición directa si requiere equipo; pasa a Completada por Bitácora)
 *                 (si es espacio/curso sin préstamo en bitácora, SÍ permite pasar a Completada)
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
 * Valida si una reservación puede transicionar de `from` a `to` mediante `PUT /api/reservaciones`.
 * Mantener el mismo estado (`from === to`) siempre es válido para editar datos de la reservación.
 */
export function validateReservacionTransition(
  from: ReservacionEstado,
  to: ReservacionEstado,
  options?: {
    requiresEquipment?: boolean;
    hasActiveBitacoraLoan?: boolean;
  }
): ReservacionTransitionResult {
  if (from === to) {
    return { valid: true };
  }

  if (from === 'En uso' && to === 'Completada') {
    const requiresEquipment = options?.requiresEquipment ?? true;
    const hasActiveLoan = options?.hasActiveBitacoraLoan ?? false;
    if (!requiresEquipment && !hasActiveLoan) {
      return { valid: true };
    }
    return {
      valid: false,
      message:
        'Una reservación de equipo "En uso" solo puede pasar a "Completada" registrando la devolución en Bitácora.',
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
  current: ReservacionEstado,
  options?: { requiresEquipment?: boolean }
): ReservacionEstado[] {
  const nextStates = [...(VALID_RESERVACION_TRANSITIONS[current] ?? [])];
  if (current === 'En uso' && options?.requiresEquipment === false) {
    nextStates.push('Completada');
  }
  return [current, ...nextStates];
}
