import { env } from './env';
import { getPool } from './db';
import { logger } from './logger';

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
    description:
      'Explora nuestra colección de dispositivos de realidad virtual. Visores, controles y accesorios de última generación para experiencias inmersivas.',
    plaiUsage:
      'En PLAi utilizamos los visores de Realidad Virtual para simular entornos de alto riesgo, recorridos inmersivos de arquitectura y diseño, y desarrollar competencias en metaverso e interacción 3D para instituciones educativas y empresas.',
    videoUrl: '',
    color: '#1e5ca7',
    benefits: [
      'Simulación de entornos seguros',
      'Aprendizaje inmersivo 3D',
      'Reducción de costos en prototipos',
    ],
    successCases: [
      {
        title: 'Recorrido Arquitectónico',
        desc: 'Visualización de un complejo habitacional antes de su construcción.',
      },
      {
        title: 'Simulador Médico',
        desc: 'Prácticas de cirugía para estudiantes de medicina sin riesgo.',
      },
    ],
  },
  robotica: {
    id: 'robotica',
    name: 'Robótica',
    description:
      'Kits, brazos robóticos y componentes de automatización para aprender construyendo.',
    plaiUsage:
      'Los laboratorios de robótica de PLAi permiten a los estudiantes y profesionales realizar prototipados rápidos, entender la automatización industrial (Industria 4.0) y programar desde cero algoritmos de inteligencia artificial aplicada al hardware.',
    videoUrl: '',
    color: '#0ea5e9',
    benefits: [
      'Prototipado rápido',
      'Automatización Industrial',
      'Programación de hardware aplicado',
    ],
    successCases: [
      {
        title: 'Brazo Clasificador',
        desc: 'Sistema robótico capaz de clasificar piezas por color mediante visión por computadora.',
      },
      {
        title: 'Vehículo Autónomo',
        desc: 'Prototipo a escala para navegación en almacenes logísticos.',
      },
    ],
  },
  'fabricacion-digital': {
    id: 'fabricacion-digital',
    name: 'Fabricación Digital',
    description:
      'Impresoras 3D, escáneres y materiales para transformar diseños en objetos reales.',
    plaiUsage:
      'Promovemos la cultura Maker en Jalisco permitiendo que emprendedores y estudiantes validen sus diseños físicos rápidamente antes de pasar a producción masiva, sin costo de maquinaria ni licencias.',
    videoUrl: '',
    color: '#ed8d1b',
    benefits: ['Validación de diseños', 'Cultura Maker', 'Sin costo de maquinaria'],
    successCases: [
      {
        title: 'Prótesis 3D',
        desc: 'Desarrollo e impresión de prótesis de bajo costo para niños.',
      },
      {
        title: 'Moldes Industriales',
        desc: 'Creación de moldes rápidos para inyección de plásticos.',
      },
    ],
  },
  drones: {
    id: 'drones',
    name: 'Drones',
    description:
      'Drones profesionales y educativos para captura aérea, mapeo y entrenamiento de vuelo.',
    plaiUsage:
      'Con nuestra flota de Drones, apoyamos capacitaciones en fotogrametría, agricultura de precisión, seguridad y producciones audiovisuales, preparando a los asistentes para certificaciones de vuelo.',
    videoUrl: '',
    color: '#10b981',
    benefits: [
      'Fotogrametría avanzada',
      'Agricultura de precisión',
      'Capacitación para certificaciones',
    ],
    successCases: [
      {
        title: 'Mapeo Agrícola',
        desc: 'Análisis de cultivos mediante cámaras multiespectrales para optimizar riego.',
      },
      {
        title: 'Inspección de Estructuras',
        desc: 'Revisión segura de puentes y torres de telecomunicaciones.',
      },
    ],
  },
  'computo-multimedia': {
    id: 'computo-multimedia',
    name: 'Cómputo / Multimedia',
    description: 'Equipos de alto rendimiento para diseño, edición, gaming y desarrollo.',
    plaiUsage:
      'Estaciones de trabajo de grado profesional disponibles para compilar código complejo, realizar renders arquitectónicos o desarrollar videojuegos pesados sin depender de infraestructura costosa propia.',
    videoUrl: '',
    color: '#0086ff',
    benefits: ['Renders ultrarrápidos', 'Desarrollo sin límites', 'Edición de video 8K'],
    successCases: [
      {
        title: 'Desarrollo de Videojuego',
        desc: 'Creación de assets y compilación de un título indie en Unreal Engine 5.',
      },
      {
        title: 'Postproducción de Cortometraje',
        desc: 'Edición, colorización y renderizado de un proyecto cinematográfico local.',
      },
    ],
  },
};

declare global {
  var __plaiCategoriesCache: Record<string, CategoryConfig> | undefined;
}

function getMemoryCategories(): Record<string, CategoryConfig> {
  if (!global.__plaiCategoriesCache) {
    global.__plaiCategoriesCache = structuredClone(defaultCategoriesConfig);
  }
  return global.__plaiCategoriesCache;
}

interface CategoriaRow {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  plai_usage: string;
  video_url: string;
  beneficios: string[] | string;
  casos_exito: SuccessCase[] | string;
  updated_at: string | Date | null;
}

/**
 * Lee la configuración centralizada de categorías desde PostgreSQL / Neon.
 * Si no hay base de datos configurada (ej. entorno de pruebas unitarias), usa memoria sin escribir en disco.
 */
export async function getAllCategoriesConfig(): Promise<Record<string, CategoryConfig>> {
  if (env.hasDatabaseConfig) {
    try {
      const pool = getPool();
      const { rows } = await pool.query<CategoriaRow>(
        'SELECT id, nombre, descripcion, color, plai_usage, video_url, beneficios, casos_exito, updated_at FROM categorias ORDER BY id ASC'
      );
      if (rows.length > 0) {
        const result: Record<string, CategoryConfig> = { ...defaultCategoriesConfig };
        for (const r of rows) {
          const benefits = Array.isArray(r.beneficios)
            ? r.beneficios
            : typeof r.beneficios === 'string'
            ? JSON.parse(r.beneficios)
            : [];
          const successCases = Array.isArray(r.casos_exito)
            ? r.casos_exito
            : typeof r.casos_exito === 'string'
            ? JSON.parse(r.casos_exito)
            : [];
          result[r.id] = {
            id: r.id,
            name: r.nombre,
            description: r.descripcion,
            color: r.color || '#0086ff',
            plaiUsage: r.plai_usage,
            videoUrl: r.video_url || '',
            benefits,
            successCases,
            updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
          };
        }
        return result;
      }
    } catch (error) {
      logger.error('Error al consultar categorías en PostgreSQL', { error: String(error) });
    }
  }

  return getMemoryCategories();
}

export async function getCategoryConfig(slug: string): Promise<CategoryConfig | null> {
  const all = await getAllCategoriesConfig();
  return all[slug] || defaultCategoriesConfig[slug] || null;
}

export async function updateCategoryConfig(
  slug: string,
  updates: Partial<Omit<CategoryConfig, 'id'>>
): Promise<CategoryConfig> {
  const all = await getAllCategoriesConfig();
  const current = all[slug] ||
    defaultCategoriesConfig[slug] || {
      id: slug,
      name: slug,
      description: '',
      plaiUsage: '',
      videoUrl: '',
      color: '#0086ff',
      benefits: [],
      successCases: [],
    };

  const updated: CategoryConfig = {
    ...current,
    ...updates,
    id: slug,
    updatedAt: new Date().toISOString(),
  };

  if (env.hasDatabaseConfig) {
    try {
      const pool = getPool();
      await pool.query(
        `
        INSERT INTO categorias (id, nombre, descripcion, color, plai_usage, video_url, beneficios, casos_exito, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, NOW())
        ON CONFLICT (id) DO UPDATE SET
          nombre = EXCLUDED.nombre,
          descripcion = EXCLUDED.descripcion,
          color = EXCLUDED.color,
          plai_usage = EXCLUDED.plai_usage,
          video_url = EXCLUDED.video_url,
          beneficios = EXCLUDED.beneficios,
          casos_exito = EXCLUDED.casos_exito,
          updated_at = NOW()
        `,
        [
          updated.id,
          updated.name,
          updated.description,
          updated.color || '#0086ff',
          updated.plaiUsage,
          updated.videoUrl || '',
          JSON.stringify(updated.benefits || []),
          JSON.stringify(updated.successCases || []),
        ]
      );
      logger.info('Configuración de categoría persistida en PostgreSQL', {
        slug,
        updatedAt: updated.updatedAt,
      });
      return updated;
    } catch (error) {
      logger.error('Error al persistir categoría en PostgreSQL', { slug }, error);
      throw error;
    }
  }

  const cache = getMemoryCategories();
  cache[slug] = updated;
  return updated;
}
