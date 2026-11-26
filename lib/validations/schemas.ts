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
    userEmail: z.string().trim().email('Formato de correo electrónico inválido').optional(),
    userInstitution: z.string().trim().max(150).optional(),
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

const SAFE_URL_SCHEMA = z
  .string()
  .trim()
  .max(255, 'La URL no puede exceder 255 caracteres')
  .refine(
    (val) => val === '' || val.startsWith('/') || /^https?:\/\//i.test(val),
    'La URL debe ser una ruta relativa (/) o iniciar con http:// o https://'
  );

/**
 * Validación de POST /api/cursos (acepta formato de agenda o formato courseRequestSchema)
 */
export const cursoPayloadSchema = z.object({
  titulo: z.string().trim().min(2).max(200).optional(),
  tipo: z.string().trim().min(2).max(100).optional(),
  fecha: z.string().regex(DATE_REGEX, 'La fecha debe tener formato YYYY-MM-DD'),
  hora: z.string().trim().min(3).max(40).optional(),
  lugar: z.string().trim().min(2).max(180).optional(),
  asistentes: z.coerce.number().int().min(1).max(200).optional(),
  descripcion: z.string().trim().max(1000).optional(),
  solicitanteNombre: z.string().trim().min(2, 'El nombre del solicitante es obligatorio').max(120),
  solicitanteEmail: z.string().trim().email('Correo electrónico inválido').optional().or(z.literal('')),
  institucion: z.string().trim().max(150).optional(),
  icon: z.string().trim().max(20).optional(),
});

/**
 * Validación de POST /api/equipos
 */
export const equipoSchema = z.object({
  id: z.string().trim().min(1).max(64).optional(),
  name: z.string().trim().min(2, 'El nombre del equipo es obligatorio').max(150),
  category: z.enum([
    'Realidad Virtual',
    'Robótica',
    'Cómputo',
    'Drones',
    'Fabricación digital',
  ]),
  brand: z.string().trim().min(1).max(100).default('Genérico'),
  model: z.string().trim().min(1).max(100).default('Estándar'),
  inventoryNumber: z.string().trim().min(2, 'El código PLAi es obligatorio').max(80),
  serialNumber: z.string().trim().max(100).optional().default('N/A'),
  storage: z.string().trim().max(80).optional().default('N/A'),
  status: z
    .enum([
      'Disponible',
      'Reservado',
      'En uso',
      'En mantenimiento',
      'Fuera de servicio',
      'No disponible',
    ])
    .default('Disponible'),
  location: z.string().trim().min(2).max(150).default('Laboratorio de Innovación PLAi'),
  specs: z.array(z.string().trim().max(200)).max(30).optional().default([]),
  accessories: z.array(z.string().trim().max(200)).max(30).optional().default([]),
  imageEmoji: z.string().trim().max(20).optional().default('📦'),
  imageUrl: SAFE_URL_SCHEMA.optional(),
  responsible: z.string().trim().max(120).optional().default('Laboratorio de Innovación PLAi'),
  observations: z.string().trim().max(1000).optional(),
  dateAdded: z.string().trim().max(40).optional(),
});

/**
 * Validación de POST /api/aplicaciones
 */
export const aplicacionSchema = z.object({
  id: z.string().trim().min(1).max(64).optional(),
  name: z.string().trim().min(2, 'El nombre de la aplicación es obligatorio').max(150),
  developer: z.string().trim().max(120).optional().default('Desarrollador Oficial'),
  version: z.string().trim().max(50).optional().default('1.0'),
  category: z.string().trim().min(2, 'La categoría es obligatoria').max(60),
  platform: z.enum(['Meta Quest', 'PC', 'Meta Quest + PC']),
  ageRating: z.string().trim().max(40).optional().default('Todas las edades'),
  description: z.string().trim().max(1000).optional().default('Sin descripción'),
  imageUrl: SAFE_URL_SCHEMA.optional(),
  iconUrl: SAFE_URL_SCHEMA.optional(),
  devicesInstalled: z.coerce.number().int().min(0).max(500).optional().default(1),
  status: z.enum(['Activa', 'Inactiva']).optional().default('Activa'),
});

/**
 * Validación de POST y PUT /api/bitacora
 */
export const bitacoraEntregaSchema = z.object({
  codigoPlai: z.string().trim().min(2, 'El código PLAi es obligatorio').max(80),
  usuarioNombre: z.string().trim().min(2, 'El nombre del usuario es obligatorio').max(120),
  usuarioEmail: z.string().trim().email('Correo electrónico inválido').optional().or(z.literal('')),
  usuarioDependencia: z.string().trim().max(150).optional(),
  fechaEntrega: z.string().trim().min(8).max(40),
  fechaDevolucionEstimada: z.string().trim().min(8).max(40),
  condicionEntrega: z.enum(['Excelente', 'Bueno', 'Regular']).optional().default('Excelente'),
  accesoriosEntregados: z.string().trim().max(500).optional(),
  observacionesEntrega: z.string().trim().max(1000).optional(),
  reservaId: z.string().trim().max(64).optional(),
});

export const bitacoraDevolucionSchema = z.object({
  id: z.string().trim().min(1, 'El ID de bitácora es obligatorio').max(64),
  fechaDevolucionReal: z.string().trim().min(8).max(40),
  condicionDevolucion: z.enum(['Excelente', 'Bueno', 'Observación', 'En revisión', 'Dañado']),
  accesoriosDevueltos: z.string().trim().max(500).optional().default('Completos'),
  observacionesDevolucion: z.string().trim().max(1000).optional(),
  incidenciaGenerada: z.boolean().optional().default(false),
  descripcionIncidencia: z.string().trim().max(1000).optional(),
});

/**
 * Validación de POST y PUT /api/mantenimiento
 */
export const incidenciaCreateSchema = z.object({
  codigoPlai: z.string().trim().min(2, 'El código PLAi es obligatorio').max(80),
  origen: z
    .enum(['Devolución de Préstamo', 'Revisión Periódica', 'Reporte de Usuario', 'Falla Operativa'])
    .optional()
    .default('Revisión Periódica'),
  tipoFalla: z.enum([
    'Hardware',
    'Software',
    'Calibración',
    'Daño Físico',
    'Accesorio Faltante',
    'Limpieza y Óptica',
  ]),
  severidad: z.enum(['Baja', 'Media', 'Alta', 'Crítica']).optional().default('Media'),
  descripcion: z.string().trim().min(5, 'Describe brevemente la falla (mín. 5 caracteres)').max(1500),
  estado: z
    .enum(['Reportada', 'En diagnóstico', 'En reparación', 'Esperando piezas', 'Resuelta'])
    .optional()
    .default('Reportada'),
  tecnicoResponsable: z.string().trim().max(120).optional(),
  fechaReporte: z.string().trim().max(40).optional(),
  accionesRealizadas: z.string().trim().max(1500).optional(),
});

export const incidenciaUpdateSchema = z.object({
  id: z.string().trim().min(1, 'El ID de incidencia es obligatorio').max(64),
  estado: z.enum([
    'Reportada',
    'En diagnóstico',
    'En reparación',
    'Esperando piezas',
    'Resuelta',
  ]),
  accionesRealizadas: z.string().trim().max(1500).optional(),
});

/**
 * Validación estricta de POST /api/configuracion (impide inyección de claves arbitrarias)
 */
export const systemConfigSchema = z.object({
  labName: z.string().trim().min(3).max(200).optional(),
  labLocation: z.string().trim().min(3).max(250).optional(),
  adminEmail: z.string().trim().email('Correo de administrador inválido').max(150).optional(),
  maintenanceAlertDays: z.coerce.number().int().min(1).max(365).optional(),
  allowPublicView: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
  maxReservationHours: z.coerce.number().int().min(1).max(8).optional(),
  maxAdvanceDays: z.coerce.number().int().min(1).max(90).optional(),
  categorias: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
});

/**
 * Validación estricta de POST /api/categorias
 */
export const categoryUpdateSchema = z.object({
  id: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9-]+$/, 'El identificador de categoría debe contener solo minúsculas, números y guiones'),
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(1000).optional(),
  plaiUsage: z.string().trim().max(2000).optional(),
  videoUrl: SAFE_URL_SCHEMA.optional(),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{3,8}$/, 'Color hexadecimal inválido')
    .optional(),
  benefits: z.array(z.string().trim().min(1).max(200)).max(15).optional(),
  successCases: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(150),
        desc: z.string().trim().max(500).default(''),
      })
    )
    .max(15)
    .optional(),
});

/**
 * Validación estricta de PUT /api/reservaciones
 */
export const reservacionUpdateSchema = z.object({
  id: z.string().trim().min(1, 'El ID de la reservación es obligatorio').max(64),
  estado: z
    .enum(['Pendiente', 'Aprobada', 'Rechazada', 'En uso', 'Completada'])
    .optional(),
  equipoId: z.string().trim().max(64).optional(),
  codigoPlaiAsignado: z.string().trim().max(80).optional(),
  accesoriosIncluidos: z.string().trim().max(500).optional(),
  condicionSalida: z
    .enum(['Excelente', 'Bueno', 'Regular'])
    .optional()
    .or(z.literal('')),
  observacionesAdmin: z.string().trim().max(1000).optional(),
  usuarioNombre: z.string().trim().min(2).max(120).optional(),
  fechaUso: z.string().regex(DATE_REGEX, 'La fecha debe tener formato YYYY-MM-DD').optional(),
  horaInicio: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'La hora de inicio debe tener formato HH:MM')
    .optional(),
  horaFin: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'La hora de fin debe tener formato HH:MM')
    .optional(),
  actividad: z.string().trim().min(2).max(250).optional(),
  registrarEntregaEnBitacora: z.boolean().optional(),
});

/**
 * Validación estricta de POST / PUT /api/usuarios
 */
export const usuarioUpsertSchema = z.object({
  id: z.string().trim().min(1).max(128).optional(),
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe contener al menos 2 caracteres')
    .max(120, 'El nombre no puede exceder 120 caracteres'),
  email: z.string().trim().email('Formato de correo electrónico inválido').max(150),
  status: z.enum(['Activo', 'Inactivo']).optional().default('Activo'),
  dependencia: z.string().trim().max(150).optional(),
  telefono: z.string().trim().max(30).optional().or(z.literal('')),
});
