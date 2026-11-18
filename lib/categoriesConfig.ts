import { getPool } from './pool';

export interface SuccessCase {
  title: string;
  desc: string;
}

export interface CategoryConfig {
  id: string;
  name: string;
  description: string;
  plaiUsage: string;
  videoUrl: string;
  color?: string;
  benefits: string[];
  successCases: SuccessCase[];
  updatedAt?: string;
}

export const defaultCategoriesConfig: Record<string, CategoryConfig> = {
  'realidad-virtual': {
    id: 'realidad-virtual',
    name: 'Realidad Virtual',
    description: 'Explora nuestra colección de dispositivos de realidad virtual. Visores, controles y accesorios de última generación para experiencias inmersivas.',
    plaiUsage: 'En PLAi utilizamos los visores de Realidad Virtual para simular entornos de alto riesgo, recorridos inmersivos de arquitectura y diseño, y desarrollar competencias en metaverso e interacción 3D para instituciones educativas y empresas.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    color: '#1e5ca7',
    benefits: ['Simulación de entornos seguros', 'Aprendizaje inmersivo 3D', 'Reducción de costos en prototipos'],
    successCases: [
      { title: 'Recorrido Arquitectónico', desc: 'Visualización de un complejo habitacional antes de su construcción.' },
      { title: 'Simulador Médico', desc: 'Prácticas de cirugía para estudiantes de medicina sin riesgo.' }
    ]
  },
  'robotica': {
    id: 'robotica',
    name: 'Robótica',
    description: 'Kits, brazos robóticos y componentes de automatización para aprender construyendo.',
    plaiUsage: 'Los laboratorios de robótica de PLAi permiten a los estudiantes y profesionales realizar prototipados rápidos, entender la automatización industrial (Industria 4.0) y programar desde cero algoritmos de inteligencia artificial aplicada al hardware.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    color: '#0ea5e9',
    benefits: ['Prototipado rápido', 'Automatización Industrial', 'Programación de hardware aplicado'],
    successCases: [
      { title: 'Brazo Clasificador', desc: 'Sistema robótico capaz de clasificar piezas por color mediante visión por computadora.' },
      { title: 'Vehículo Autónomo', desc: 'Prototipo a escala para navegación en almacenes logísticos.' }
    ]
  },
  'fabricacion-digital': {
    id: 'fabricacion-digital',
    name: 'Fabricación Digital',
    description: 'Impresoras 3D, escáneres y materiales para transformar diseños en objetos reales.',
    plaiUsage: 'Promovemos la cultura Maker en Jalisco permitiendo que emprendedores y estudiantes validen sus diseños físicos rápidamente antes de pasar a producción masiva, sin costo de maquinaria ni licencias.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    color: '#ed8d1b',
    benefits: ['Validación de diseños', 'Cultura Maker', 'Sin costo de maquinaria'],
    successCases: [
      { title: 'Prótesis 3D', desc: 'Desarrollo e impresión de prótesis de bajo costo para niños.' },
      { title: 'Moldes Industriales', desc: 'Creación de moldes rápidos para inyección de plásticos.' }
    ]
  },
  'drones': {
    id: 'drones',
    name: 'Drones',
    description: 'Drones profesionales y educativos para captura aérea, mapeo y entrenamiento de vuelo.',
    plaiUsage: 'Con nuestra flota de Drones, apoyamos capacitaciones en fotogrametría, agricultura de precisión, seguridad y producciones audiovisuales, preparando a los asistentes para certificaciones de vuelo.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    color: '#10b981',
    benefits: ['Fotogrametría avanzada', 'Agricultura de precisión', 'Capacitación para certificaciones'],
    successCases: [
      { title: 'Mapeo Agrícola', desc: 'Análisis de cultivos mediante cámaras multiespectrales para optimizar riego.' },
      { title: 'Inspección de Estructuras', desc: 'Revisión segura de puentes y torres de telecomunicaciones.' }
    ]
  },
  'computo-multimedia': {
    id: 'computo-multimedia',
    name: 'Cómputo / Multimedia',
    description: 'Equipos de alto rendimiento para diseño, edición, gaming y desarrollo.',
    plaiUsage: 'Estaciones de trabajo de grado profesional disponibles para compilar código complejo, realizar renders arquitectónicos o desarrollar videojuegos pesados sin depender de infraestructura costosa propia.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    color: '#0086ff',
    benefits: ['Renders ultrarrápidos', 'Desarrollo sin límites', 'Edición de video 8K'],
    successCases: [
      { title: 'Desarrollo de Videojuego', desc: 'Creación de assets y compilación de un título indie en Unreal Engine 5.' },
      { title: 'Postproducción de Cortometraje', desc: 'Edición, colorización y renderizado de un proyecto cinematográfico local.' }
    ]
  }
};

type CategoriaRow = {
  id: string;
  nombre: string;
  descripcion: string;
  color: string | null;
  plai_usage: string;
  video_url: string;
  beneficios: unknown;
  casos_exito: unknown;
  updated_at: Date | string | null;
};

function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function mapRow(r: CategoriaRow): CategoryConfig {
  return {
    id: r.id,
    name: r.nombre,
    description: r.descripcion,
    plaiUsage: r.plai_usage,
    videoUrl: r.video_url,
    color: r.color || undefined,
    benefits: parseJson<string[]>(r.beneficios, []),
    successCases: parseJson<SuccessCase[]>(r.casos_exito, []),
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
  };
}

/**
 * Lee la configuración de categorías desde PostgreSQL (tabla `categorias`,
 * sembrada por la migración 002).
 */
export async function getAllCategoriesConfig(): Promise<Record<string, CategoryConfig>> {
  const { rows } = await getPool().query<CategoriaRow>('SELECT * FROM categorias ORDER BY id');
  const result: Record<string, CategoryConfig> = {};
  for (const row of rows) result[row.id] = mapRow(row);
  return result;
}

/**
 * Obtiene la configuración de una categoría por su slug
 */
export async function getCategoryConfig(slug: string): Promise<CategoryConfig | null> {
  const { rows } = await getPool().query<CategoriaRow>('SELECT * FROM categorias WHERE id = $1', [slug]);
  return rows[0] ? mapRow(rows[0]) : null;
}

/**
 * Actualiza (o crea) la configuración de una categoría y la persiste en la base de datos
 */
export async function updateCategoryConfig(
  slug: string,
  updates: Partial<Omit<CategoryConfig, 'id'>>
): Promise<CategoryConfig> {
  const current: CategoryConfig = (await getCategoryConfig(slug)) ||
    defaultCategoriesConfig[slug] || {
      id: slug,
      name: slug,
      description: '',
      plaiUsage: '',
      videoUrl: '',
      benefits: [],
      successCases: [],
    };

  const merged: CategoryConfig = { ...current, ...updates, id: slug };

  const { rows } = await getPool().query<CategoriaRow>(
    `
    INSERT INTO categorias (id, nombre, descripcion, color, plai_usage, video_url, beneficios, casos_exito)
    VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb)
    ON CONFLICT (id) DO UPDATE SET
      nombre = EXCLUDED.nombre,
      descripcion = EXCLUDED.descripcion,
      color = EXCLUDED.color,
      plai_usage = EXCLUDED.plai_usage,
      video_url = EXCLUDED.video_url,
      beneficios = EXCLUDED.beneficios,
      casos_exito = EXCLUDED.casos_exito,
      updated_at = now()
    RETURNING *
    `,
    [
      slug,
      merged.name,
      merged.description,
      merged.color || '#0086ff',
      merged.plaiUsage,
      merged.videoUrl,
      JSON.stringify(merged.benefits || []),
      JSON.stringify(merged.successCases || []),
    ]
  );
  return mapRow(rows[0]);
}