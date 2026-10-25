import { z } from 'zod';
import { validateTimeRange } from '../reservation';

// Regex para validación de fecha YYYY-MM-DD y hora HH:MM
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Esquema Zod de validación estricta para reservación de equipamiento tecnológico
 * Cumple con la regla de negocio normativa de préstamo máximo de 2 horas (Sección 7.2)
 */
export const reservationSchema = z
  .object({
    deviceId: z.union([z.string().min(1, 'El identificador del equipo es obligatorio'), z.number()]),
    userName: z
      .string()
      .trim()
      .min(3, 'El nombre debe contener al menos 3 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres'),
    date: z.string().regex(DATE_REGEX, 'La fecha debe tener formato YYYY-MM-DD'),
    startTime: z.string().regex(TIME_REGEX, 'La hora de inicio debe tener formato HH:MM'),
    endTime: z.string().regex(TIME_REGEX, 'La hora de fin debe tener formato HH:MM'),
    activity: z
      .string()
      .trim()
      .min(3, 'La actividad debe describir el motivo (mínimo 3 caracteres)')
      .max(250, 'La descripción de actividad no puede exceder 250 caracteres'),
    notes: z.string().trim().max(500, 'Las notas no pueden exceder 500 caracteres').optional().default(''),
    acceptPrivacy: z
      .boolean()
      .refine((val) => val === true, 'Es obligatorio aceptar el Aviso de Privacidad institucional'),
  })
  .superRefine((data, ctx) => {
    if (data.startTime && data.endTime) {
      const result = validateTimeRange(data.startTime, data.endTime);
      if (!result.valid) {
        if (result.reason === 'too-long') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'El tiempo máximo de préstamo es de 2 horas. Por favor selecciona un horario menor.',
            path: ['endTime'],
          });
        } else {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'La hora de fin debe ser posterior a la hora de inicio.',
            path: ['endTime'],
          });
        }
      }
    }
  });

export type ReservationInput = z.infer<typeof reservationSchema>;

/**
 * Esquema de validación para solicitud de agendado de cursos (Académica o Privada)
 */
export const courseRequestSchema = z.object({
  courseType: z.enum(['academica', 'privada'], {
    message: 'Tipo de curso no válido (debe ser academica o privada)',
  }),
  institution: z
    .string()
    .trim()
    .min(2, 'El nombre de la institución es obligatorio (mínimo 2 caracteres)')
    .max(150, 'Máximo 150 caracteres'),
  contactName: z
    .string()
    .trim()
    .min(3, 'El nombre de contacto es obligatorio (mínimo 3 caracteres)')
    .max(100, 'Máximo 100 caracteres'),
  contactEmail: z.string().trim().email('Formato de correo electrónico inválido'),
  contactPhone: z.string().trim().max(20).optional().default(''),
  participantsCount: z.coerce
    .number()
    .int('El número de participantes debe ser entero')
    .min(1, 'Debe haber al menos 1 participante')
    .max(100, 'El cupo máximo por solicitud es de 100 participantes'),
  preferredDate: z.string().regex(DATE_REGEX, 'La fecha preferida debe tener formato YYYY-MM-DD'),
  notes: z.string().trim().max(500).optional().default(''),
});

export type CourseRequestInput = z.infer<typeof courseRequestSchema>;

/**
 * Esquema de validación para solicitud de reservación de espacios de innovación
 */
export const spaceRequestSchema = z.object({
  espacioId: z.string().min(1, 'El identificador del espacio es obligatorio'),
  nombreSolicitante: z
    .string()
    .trim()
    .min(3, 'El nombre debe contener al menos 3 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  email: z.string().trim().email('Correo electrónico inválido'),
  fecha: z.string().regex(DATE_REGEX, 'Formato de fecha inválido (YYYY-MM-DD)'),
  hora: z.string().regex(TIME_REGEX, 'Formato de hora inválido (HH:MM)'),
  proposito: z
    .string()
    .trim()
    .min(5, 'El propósito del evento debe contener al menos 5 caracteres')
    .max(500, 'Máximo 500 caracteres'),
  acceptPrivacy: z
    .boolean()
    .refine((val) => val === true, 'Es obligatorio aceptar el Aviso de Privacidad'),
});

export type SpaceRequestInput = z.infer<typeof spaceRequestSchema>;
