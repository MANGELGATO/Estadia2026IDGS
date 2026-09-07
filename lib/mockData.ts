export interface DeviceItem {
  id: string;
  name: string;
  category: 'Realidad Virtual' | 'Robótica' | 'Cómputo' | 'Drones' | 'Fabricación digital';
  brand: string;
  model: string;
  inventoryNumber: string;
  status: 'Disponible' | 'Reservado' | 'En uso' | 'En mantenimiento' | 'Fuera de servicio' | 'No disponible';
  location: string;
  specs: string[];
  apps?: string[];
  accessories: string[];
  imageEmoji: string; // visual placeholder
}

export const mockDevices: DeviceItem[] = [
  // ── Realidad Virtual ──────────────────────────────────────────────
  {
    id: 'vr-01',
    name: 'Meta Quest 3',
    category: 'Realidad Virtual',
    brand: 'Meta',
    model: 'Quest 3',
    inventoryNumber: 'PLAI-VR-015',
    status: 'Disponible',
    location: 'Área de Realidad Virtual',
    specs: ['Resolución 4K+ por ojo', '128 GB almacenamiento', 'Procesador Snapdragon XR2 Gen 2', 'Autonomía 2.2 hrs'],
    apps: ['Beat Saber', 'Job Simulator', 'Ocean Rift', 'Spatial'],
    accessories: ['2 Controladores Touch', 'Cable de carga USB-C'],
    imageEmoji: '🥽',
  },
  {
    id: 'vr-02',
    name: 'HTC Vive Pro 2',
    category: 'Realidad Virtual',
    brand: 'HTC',
    model: 'Vive Pro 2',
    inventoryNumber: 'PLAI-VR-008',
    status: 'En uso',
    location: 'Área de Realidad Virtual',
    specs: ['Resolución 5K (2448×2448 por ojo)', 'FOV 120°', 'Frecuencia 120 Hz'],
    apps: ['SteamVR', 'VRchat', 'Tilt Brush'],
    accessories: ['2 Controladores', 'Estaciones base 2.0', 'Link Box'],
    imageEmoji: '🥽',
  },
  {
    id: 'vr-03',
    name: 'Meta Quest 2',
    category: 'Realidad Virtual',
    brand: 'Meta',
    model: 'Quest 2',
    inventoryNumber: 'PLAI-VR-004',
    status: 'En mantenimiento',
    location: 'Área de Realidad Virtual',
    specs: ['Resolución 1832×1920 por ojo', '256 GB', 'Snapdragon XR2'],
    apps: ['Horizon Worlds', 'Supernatural', 'PokerStars VR'],
    accessories: ['2 Controladores', 'Elite Strap', 'Cargador'],
    imageEmoji: '🥽',
  },
  // ── Robótica ──────────────────────────────────────────────────────
  {
    id: 'rob-01',
    name: 'Brazo Robótico DOBOT Magician',
    category: 'Robótica',
    brand: 'DOBOT',
    model: 'Magician Lite',
    inventoryNumber: 'PLAI-ROB-011',
    status: 'Disponible',
    location: 'Laboratorio de Robótica',
    specs: ['Payload 250g', 'Alcance 320 mm', 'Repetibilidad ±0.2 mm', '4 ejes'],
    accessories: ['Cabezal de pluma', 'Succionador de vacío', 'Pinza de agarre', 'Cable USB'],
    imageEmoji: '🦾',
  },
  {
    id: 'rob-02',
    name: 'Kit Arduino Mega',
    category: 'Robótica',
    brand: 'Arduino',
    model: 'Mega 2560 R3',
    inventoryNumber: 'PLAI-ROB-023',
    status: 'Disponible',
    location: 'Laboratorio de Robótica',
    specs: ['Microcontrolador ATmega2560', '54 pines digitales', '16 entradas analógicas', '256KB Flash'],
    accessories: ['Protoboard', 'Kit sensores', 'Cables Dupont', 'Servomotores x4'],
    imageEmoji: '⚙️',
  },
  {
    id: 'rob-03',
    name: 'Raspberry Pi 4 Kit',
    category: 'Robótica',
    brand: 'Raspberry Pi',
    model: 'Pi 4 Model B 8GB',
    inventoryNumber: 'PLAI-ROB-017',
    status: 'Reservado',
    location: 'Laboratorio de Robótica',
    specs: ['CPU Cortex-A72 1.8 GHz', '8 GB RAM', 'Dual HDMI 4K', 'Gigabit Ethernet'],
    accessories: ['Carcasa oficial', 'Fuente 5V 3A', 'microSD 64 GB', 'Ventilador'],
    imageEmoji: '🖥️',
  },
  // ── Fabricación Digital ───────────────────────────────────────────
  {
    id: 'fab-01',
    name: 'Impresora Prusa i3',
    category: 'Fabricación digital',
    brand: 'Prusa',
    model: 'i3 MK3S+',
    inventoryNumber: 'PLAI-FAB-003',
    status: 'Disponible',
    location: 'Taller de Fabricación Digital',
    specs: ['Volumen 25×21×21 cm', 'Resolución 0.05 mm', 'Filamentos PLA/PETG/ASA/Flex'],
    accessories: ['Lámina magnética PEI', 'Cable de poder', 'Bobina PLA 1 kg'],
    imageEmoji: '🖨️',
  },
  {
    id: 'fab-02',
    name: 'Impresora Bambu Lab X1C',
    category: 'Fabricación digital',
    brand: 'Bambu Lab',
    model: 'X1 Carbon',
    inventoryNumber: 'PLAI-FAB-009',
    status: 'En uso',
    location: 'Taller de Fabricación Digital',
    specs: ['Velocidad 500 mm/s', 'Volumen 256×256×256 mm', 'Multi-material AMS', 'Autonivelación LIDAR'],
    accessories: ['AMS Hub 4 colores', 'Filamentos x4', 'Espátula'],
    imageEmoji: '🖨️',
  },
  {
    id: 'fab-03',
    name: 'Escáner 3D Revopoint',
    category: 'Fabricación digital',
    brand: 'Revopoint',
    model: 'RANGE 2',
    inventoryNumber: 'PLAI-FAB-014',
    status: 'Disponible',
    location: 'Taller de Fabricación Digital',
    specs: ['Precisión 0.05 mm', 'Velocidad 18 fps', 'Rango 0.2–3 m', 'Escaneado en color'],
    accessories: ['Marcadores de referencia', 'Cable USB-C', 'Tripié'],
    imageEmoji: '📡',
  },
  // ── Drones ────────────────────────────────────────────────────────
  {
    id: 'dr-01',
    name: 'Drone DJI Mini 3 Pro',
    category: 'Drones',
    brand: 'DJI',
    model: 'Mini 3 Pro',
    inventoryNumber: 'PLAI-DR-002',
    status: 'Reservado',
    location: 'Gabinete de Drones',
    specs: ['Grabación 4K HDR 60fps', 'Peso < 249 g', 'Autonomía 47 min', 'Detección obstáculos 3D'],
    accessories: ['Control RC-N1', '3 Baterías inteligentes', 'Estuche rigido'],
    imageEmoji: '🚁',
  },
  {
    id: 'dr-02',
    name: 'Drone DJI Air 3',
    category: 'Drones',
    brand: 'DJI',
    model: 'Air 3',
    inventoryNumber: 'PLAI-DR-007',
    status: 'Disponible',
    location: 'Gabinete de Drones',
    specs: ['Doble cámara 4K', 'Autonomía 46 min', 'Detección omni-direccional', 'Rango 20 km'],
    accessories: ['Control RC 2', '2 Baterías Plus', 'Shoulder Bag'],
    imageEmoji: '🚁',
  },
  // ── Cómputo ──────────────────────────────────────────────────────
  {
    id: 'comp-01',
    name: 'MacBook Pro 16"',
    category: 'Cómputo',
    brand: 'Apple',
    model: 'MacBook Pro M3 Max',
    inventoryNumber: 'PLAI-COMP-005',
    status: 'Disponible',
    location: 'Sala de Cómputo Principal',
    specs: ['Chip M3 Max 14-core', '36 GB RAM unificada', '1 TB SSD', 'Pantalla Liquid Retina XDR'],
    apps: ['Final Cut Pro', 'Xcode', 'Adobe Creative Suite', 'Logic Pro'],
    accessories: ['Cargador MagSafe 140W', 'USB-C Hub'],
    imageEmoji: '💻',
  },
  {
    id: 'comp-02',
    name: 'Oculus Link PC',
    category: 'Cómputo',
    brand: 'Alienware',
    model: 'Aurora R15',
    inventoryNumber: 'PLAI-COMP-012',
    status: 'No disponible',
    location: 'Sala de Cómputo Principal',
    specs: ['Intel Core i9-13900KF', 'NVIDIA RTX 4090 24GB', '64 GB DDR5', '2 TB NVMe SSD'],
    apps: ['Unity', 'Unreal Engine 5', 'Blender', 'MATLAB'],
    accessories: ['Monitor 4K 144Hz', 'Teclado mecánico', 'Mouse gaming'],
    imageEmoji: '🖥️',
  },
];

export interface AppItem {
  id: string;
  name: string;
  category: string;
  iconUrl: string; // Emoji for mockup
  description: string;
}

export const mockApps: AppItem[] = [
  { id: 'app-1', name: 'Unity', category: 'Desarrollo de Videojuegos', iconUrl: '🎮', description: 'Motor gráfico 3D líder para realidad virtual y desarrollo de videojuegos multiplataforma.' },
  { id: 'app-2', name: 'Unreal Engine 5', category: 'Desarrollo de Videojuegos', iconUrl: '👾', description: 'Herramienta de creación 3D en tiempo real más avanzada con fotorealismo.' },
  { id: 'app-3', name: 'Blender', category: 'Modelado 3D', iconUrl: '🧊', description: 'Suite de creación 3D gratuita y de código abierto para modelado, animación y render.' },
  { id: 'app-4', name: 'Arduino IDE', category: 'Programación de Hardware', iconUrl: '🔌', description: 'Entorno de desarrollo integrado oficial para programar placas Arduino.' },
  { id: 'app-5', name: 'Fusion 360', category: 'Modelado 3D', iconUrl: '⚙️', description: 'Software CAD, CAM y CAE basado en la nube para diseño de producto y manufactura.' },
  { id: 'app-6', name: 'PrusaSlicer', category: 'Impresión 3D', iconUrl: '🖨️', description: 'Herramienta avanzada de laminado para preparar modelos 3D antes de la impresión.' },
];
