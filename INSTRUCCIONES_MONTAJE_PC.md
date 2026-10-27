# 🚀 Guía Rápida para Montar el Proyecto en Cualquier PC

Esta guía te permite clonar, configurar y levantar el proyecto de la **Plataforma de Gestión de Recursos y Espacios de PLAi** en cualquier computadora donde vayas a trabajar en menos de 5 minutos.

---

## 📋 1. Requisitos Previos en la PC

1. **Node.js 22 LTS** (o versión 20+) instalado: [nodejs.org](https://nodejs.org/)
2. **pnpm** instalado globalmente:
   ```powershell
   npm install -g pnpm
   ```
3. **MAMP** instalado (para la base de datos MySQL en puerto 3306): [mamp.info](https://www.mamp.info/)
   * Inicia los servidores en MAMP (Apache y MySQL).

---

## 🗄️ 2. Montar la Base de Datos en MAMP

El archivo completo, limpio y listo para importar es:
📁 **[`plai_database_mamp.sql`](./plai_database_mamp.sql)**

### Opción A: Con 1 comando en Terminal / PowerShell (Más rápido)
Abre PowerShell en la carpeta del proyecto y ejecuta:
```powershell
C:\MAMP\bin\mysql\bin\mysql.exe -u root -proot -P 3306 < plai_database_mamp.sql
```
*(Crea automáticamente la base de datos `plai_recursos`, todas las tablas y siembra los 26 equipos reales de los inventarios).*

### Opción B: Desde la interfaz phpMyAdmin de MAMP
1. Abre MAMP y haz clic en **"Open WebStart page"** -> **Tools** -> **phpMyAdmin** (o visita `http://localhost/phpmyadmin`).
2. En el menú superior ve a **Importar** (*Import*).
3. Selecciona el archivo `plai_database_mamp.sql`.
4. Haz clic en el botón **Continuar** (*Go*) al final de la página.

---

## 💻 3. Levantar la Aplicación Web (Next.js)

1. Abre PowerShell o tu terminal en la carpeta del proyecto:
   ```powershell
   cd Estadia2026IDGS
   ```

2. Genera el archivo de variables locales (si no existe):
   ```powershell
   cp .env.example .env.local
   ```

3. Instala las dependencias:
   ```powershell
   pnpm install
   ```

4. Inicia el servidor de desarrollo:
   ```powershell
   pnpm dev
   ```

5. Abre en tu navegador:
   👉 **http://localhost:3000**

---

## 👥 Cuentas de Acceso Rápido para Pruebas

| Rol | Correo | Perfil y Acceso |
| :--- | :--- | :--- |
| **Administrador** | `juan.perez@plai.edu.mx` | Acceso completo al Backoffice administrativo: `/admin` (Inventario, Mantenimientos, Reservaciones, Usuarios, Reportes). |
| **Colaborador** | `ana.garcia@plai.edu.mx` | Préstamos, asignación de equipos y reportes de incidencias. |
| **Usuario Estándar** | `pedro.sanchez@plai.edu.mx` | Portal de usuario: `/usuario` (Mis Préstamos, Agenda de talleres y solicitud de recursos). |

*(En la pantalla de inicio de sesión `/login` también hay botones de acceso rápido con 1 solo clic).*

---

## 📂 Recursos y Documentación Oficial Incluida

* **Logotipo oficial de PLAi:** [`public/logotipo.png`](./public/logotipo.png)
* **Inventarios PDF oficiales de PLAi:** [`public/documentos/Inventario/`](./public/documentos/Inventario/)
  * `PLANTILLA TECNOLÓGICA .pdf` (30 Meta Quest 3, 18 Oculus Quest, series y estados).
  * `Inventario de material de equipo de laboratorio.docx.pdf` (Drones DJI Mavic 4 Pro / Mini 5 / Flip, Bambu Lab X1C, Escáner Miraco Plus, Robots Abilix, OHBOT, Lego SPIKE, CNC, Torno, micro:bit, etc.).
* **Reporte de Estadía Profesional:** [`REPORTE_ESTADIA_R-ADC-08-07.md`](./REPORTE_ESTADIA_R-ADC-08-07.md)
