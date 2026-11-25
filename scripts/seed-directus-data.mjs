#!/usr/bin/env node
/**
 * Script idempotente de carga inicial (seed) en Directus 11 vía API oficial.
 *
 * Carga sin duplicar registros existentes (consulta con `filter[id][_eq]` compatible
 * con Directus 11 sin falsos 403):
 *  - 5 categorías tecnológicas oficiales
 *  - 27 equipos del catálogo oficial (leídos desde `lib/mockData.ts`)
 *  - 15 aplicaciones VR/PC oficiales (leídas desde `lib/mockData.ts`)
 *  - 4 espacios físicos institucionales
 *  - Configuración general inicial (`id = 'general'`)
 *
 * Uso (preferiblemente con el token de servicio `DIRECTUS_TOKEN`, o temporalmente `DIRECTUS_ADMIN_TOKEN`):
 *   DIRECTUS_URL=https://admin.plai.mx \
 *   DIRECTUS_TOKEN=<TOKEN_SERVICIO> \
 *   pnpm directus:seed
 */

import fs from 'node:fs';
import path from 'node:path';

const DIRECTUS_URL = (process.env.DIRECTUS_URL || '').replace(/\/+$/, '');
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || process.env.DIRECTUS_ADMIN_TOKEN || '';
const PREFIX = process.env.DIRECTUS_COLLECTION_PREFIX || 'lab_recursos_';

if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
  console.error(
    'ERROR: Debes definir DIRECTUS_URL y DIRECTUS_TOKEN (o DIRECTUS_ADMIN_TOKEN) antes de ejecutar el seed.'
  );
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: `Bearer ${DIRECTUS_TOKEN}`,
};

const col = (name) => `${PREFIX}${name}`;

async function existsById(collectionName, id) {
  const url = new URL(`${DIRECTUS_URL}/items/${encodeURIComponent(col(collectionName))}`);
  url.searchParams.set('filter[id][_eq]', String(id));
  url.searchParams.set('limit', '1');

  const res = await fetch(url.toString(), { method: 'GET', headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Error al consultar ${col(collectionName)}/${id} (HTTP ${res.status}): ${body}`);
  }
  const json = await res.json();
  return Array.isArray(json.data) && json.data.length > 0;
}

async function seedIfMissing(collectionName, record) {
  if (await existsById(collectionName, record.id)) {
    return 'skipped';
  }

  const res = await fetch(`${DIRECTUS_URL}/items/${encodeURIComponent(col(collectionName))}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(record),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Error al insertar en ${col(collectionName)} (${record.id}) HTTP ${res.status}: ${body}`);
  }
  return 'created';
}

const CATEGORIAS = [
  {
    id: 'realidad-virtual',
    nombre: 'Realidad Virtual',
    descripcion: 'Explora nuestra colección de dispositivos de realidad virtual. Visores, controles y accesorios de última generación para experiencias inmersivas.',
    color: '#1e5ca7',
    plai_usage: 'En PLAi utilizamos los visores de Realidad Virtual para simular entornos de alto riesgo, recorridos inmersivos de arquitectura y diseño, y desarrollar competencias en metaverso e interacción 3D para instituciones educativas y empresas.',
    video_url: '',
    beneficios: ['Simulación de entornos seguros', 'Aprendizaje inmersivo 3D', 'Reducción de costos en prototipos'],
    casos_exito: [
      { title: 'Recorrido Arquitectónico', desc: 'Visualización de un complejo habitacional antes de su construcción.' },
      { title: 'Simulador Médico', desc: 'Prácticas de cirugía para estudiantes de medicina sin riesgo.' },
    ],
  },
  {
    id: 'robotica',
    nombre: 'Robótica',
    descripcion: 'Kits, brazos robóticos y componentes de automatización para aprender construyendo.',
    color: '#0ea5e9',
    plai_usage: 'Los laboratorios de robótica de PLAi permiten a los estudiantes y profesionales realizar prototipados rápidos, entender la automatización industrial (Industria 4.0) y programar desde cero algoritmos de inteligencia artificial aplicada al hardware.',
    video_url: '',
    beneficios: ['Prototipado rápido', 'Automatización Industrial', 'Programación de hardware aplicado'],
    casos_exito: [
      { title: 'Brazo Clasificador', desc: 'Sistema robótico capaz de clasificar piezas por color mediante visión por computadora.' },
      { title: 'Vehículo Autónomo', desc: 'Prototipo a escala para navegación en almacenes logísticos.' },
    ],
  },
  {
    id: 'fabricacion-digital',
    nombre: 'Fabricación Digital',
    descripcion: 'Impresoras 3D, escáneres y materiales para transformar diseños en objetos reales.',
    color: '#ed8d1b',
    plai_usage: 'Promovemos la cultura Maker en Jalisco permitiendo que emprendedores y estudiantes validen sus diseños físicos rápidamente antes de pasar a producción masiva, sin costo de maquinaria ni licencias.',
    video_url: '',
    beneficios: ['Validación de diseños', 'Cultura Maker', 'Sin costo de maquinaria'],
    casos_exito: [
      { title: 'Prótesis 3D', desc: 'Desarrollo e impresión de prótesis de bajo costo para niños.' },
      { title: 'Moldes Industriales', desc: 'Creación de moldes rápidos para inyección de plásticos.' },
    ],
  },
  {
    id: 'drones',
    nombre: 'Drones',
    descripcion: 'Drones profesionales y educativos para captura aérea, mapeo y entrenamiento de vuelo.',
    color: '#10b981',
    plai_usage: 'Con nuestra flota de Drones, apoyamos capacitaciones en fotogrametría, agricultura de precisión, seguridad y producciones audiovisuales, preparando a los asistentes para certificaciones de vuelo.',
    video_url: '',
    beneficios: ['Fotogrametría avanzada', 'Agricultura de precisión', 'Capacitación para certificaciones'],
    casos_exito: [
      { title: 'Mapeo Agrícola', desc: 'Análisis de cultivos mediante cámaras multiespectrales para optimizar riego.' },
      { title: 'Inspección de Estructuras', desc: 'Revisión segura de puentes y torres de telecomunicaciones.' },
    ],
  },
  {
    id: 'computo-multimedia',
    nombre: 'Cómputo / Multimedia',
    descripcion: 'Equipos de alto rendimiento para diseño, edición, gaming y desarrollo.',
    color: '#0086ff',
    plai_usage: 'Estaciones de trabajo de grado profesional disponibles para compilar código complejo, realizar renders arquitectónicos o desarrollar videojuegos pesados sin depender de infraestructura costosa propia.',
    video_url: '',
    beneficios: ['Renders ultrarrápidos', 'Desarrollo sin límites', 'Edición de video 8K'],
    casos_exito: [
      { title: 'Desarrollo de Videojuego', desc: 'Creación de assets y compilación de un título indie en Unreal Engine 5.' },
      { title: 'Postproducción de Cortometraje', desc: 'Edición, colorización y renderizado de un proyecto cinematográfico local.' },
    ],
  },
];

const ESPACIOS = [
  {
    id: 'auditorio',
    nombre: 'Auditorio Principal',
    tipo: 'Auditorio',
    capacidad: 150,
    ubicacion: 'Torre C, Ciudad Creativa Digital, Guadalajara',
    descripcion: 'Espacio ideal para conferencias magistrales, exhibiciones de proyectos y eventos corporativos con capacidad acústica profesional.',
    caracteristicas: ['Proyector láser 4K', 'Sistema de audio envolvente', 'Iluminación escénica DMX', 'Wi-Fi dedicado 1 Gbps'],
    color: '#0086ff',
    estado: 'Disponible',
  },
  {
    id: 'aula-robotica',
    nombre: 'Aula de Robótica y Automatización',
    tipo: 'Laboratorio',
    capacidad: 30,
    ubicacion: 'Torre C, Ciudad Creativa Digital, Guadalajara',
    descripcion: 'Laboratorio equipado para prácticas de mecatrónica, cinemática, IoT y programación embebida.',
    caracteristicas: ['15 Estaciones de trabajo', 'Osciloscopios digitales', 'Brazos DOBOT Magician', 'Cautines y extractores de humo'],
    color: '#0ea5e9',
    estado: 'Disponible',
  },
  {
    id: 'taller-maker',
    nombre: 'Taller de Fabricación Digital (FabLab)',
    tipo: 'Taller Maker',
    capacidad: 25,
    ubicacion: 'Torre C, Ciudad Creativa Digital, Guadalajara',
    descripcion: 'Espacio de prototipado rápido con impresoras 3D, escaneo tridimensional y estación de postprocesado.',
    caracteristicas: ['Impresoras Bambu Lab y Prusa', 'Escáneres Revopoint', 'Herramientas de banco y corte', 'Mesa de trabajo para 25 personas'],
    color: '#ed8d1b',
    estado: 'Disponible',
  },
  {
    id: 'lab-vr',
    nombre: 'Laboratorio de Tecnologías Inmersivas (VR/AR)',
    tipo: 'Laboratorio VR',
    capacidad: 20,
    ubicacion: 'Torre C, Ciudad Creativa Digital, Guadalajara',
    descripcion: 'Área despejada de 80 m² con sensores perimetrales para simulación inmersiva y experiencias multiusuario.',
    caracteristicas: ['Área despejada libre de obstáculos', 'Puntos de anclaje para visores PC-VR', 'Monitores auxiliares para espectadores', 'Red local de baja latencia'],
    color: '#1e5ca7',
    estado: 'Disponible',
  },
];

const CONFIG_GENERAL = {
  id: 'general',
  valor: {
    labName: 'SOLUCIONES PLAi — Laboratorio de Innovación, Robótica y Tecnologías Inmersivas',
    labLocation: 'Torre C, Ciudad Creativa Digital, Guadalajara, Jalisco',
    adminEmail: 'plai.ayuda@plai.mx',
    maintenanceAlertDays: 30,
    allowPublicView: true,
    requireApproval: true,
    maxReservationHours: 2,
    maxAdvanceDays: 14,
    categorias: ['Realidad Virtual', 'Robótica', 'Fabricación Digital', 'Drones', 'Cómputo'],
  },
};

const CATEGORY_TO_ID = {
  'Realidad Virtual': 'realidad-virtual',
  'Robótica': 'robotica',
  'Fabricación digital': 'fabricacion-digital',
  'Drones': 'drones',
  'Cómputo': 'computo-multimedia',
};

function loadOfficialCatalogFromMockData() {
  const mockPath = path.join(process.cwd(), 'lib', 'mockData.ts');
  const src = fs.readFileSync(mockPath, 'utf8');
  const devMatch = src.match(/export const mockDevices: DeviceItem\[\] = (\[[\s\S]*?\n\]);/);
  const appMatch = src.match(/export const mockApps: AppItem\[\] = (\[[\s\S]*?\n\]);/);
  if (!devMatch || !appMatch) {
    throw new Error('No se pudieron extraer los catálogos oficiales de lib/mockData.ts');
  }
  const devices = JSON.parse(devMatch[1]).map((d) => ({
    id: d.id,
    categoria_id: CATEGORY_TO_ID[d.category] || 'realidad-virtual',
    nombre: d.name,
    marca: d.brand,
    modelo: d.model,
    almacenamiento: d.storage || 'N/A',
    numero_serie: d.serialNumber || `SN-${d.id}`,
    codigo_plai: d.inventoryNumber,
    estado: d.status || 'Disponible',
    ubicacion: d.location || 'Laboratorio de Innovación PLAi',
    especificaciones: d.specs || [],
    accesorios: d.accessories || [],
    imagen_emoji: d.imageEmoji || '📦',
    imagen_url: d.imageUrl || null,
    responsable: d.responsible || 'Laboratorio de Innovación PLAi',
    observaciones: d.observations || null,
  }));
  const apps = JSON.parse(appMatch[1]).map((a) => ({
    id: a.id,
    nombre: a.name,
    desarrollador: a.developer,
    version: a.version || '1.0',
    categoria: a.category,
    plataforma: a.platform,
    clasificacion_edad: a.ageRating || 'Todas las edades',
    descripcion: a.description || '',
    imagen_url: a.imageUrl || null,
    equipos_instalados: Number(a.devicesInstalled || 1),
    estado: a.status || 'Activa',
  }));
  return { devices, apps };
}

async function seedCollection(name, records) {
  let created = 0;
  let skipped = 0;
  for (const rec of records) {
    const status = await seedIfMissing(name, rec);
    if (status === 'created') created += 1;
    else skipped += 1;
  }
  console.log(`  [${col(name)}] ${created} creados, ${skipped} ya existían (total: ${records.length})`);
}

async function main() {
  console.log(`Cargando catálogos iniciales oficiales con prefijo "${PREFIX}" en ${DIRECTUS_URL}...`);
  const { devices, apps } = loadOfficialCatalogFromMockData();

  await seedCollection('categorias', CATEGORIAS);
  await seedCollection('equipos', devices);
  await seedCollection('aplicaciones', apps);
  await seedCollection('espacios', ESPACIOS);
  await seedCollection('configuracion', [CONFIG_GENERAL]);

  console.log('\nCarga inicial en Directus finalizada correctamente.');
}

main().catch((err) => {
  console.error('Error durante el seed de Directus:', err);
  process.exit(1);
});
