# 🚀 Guía Rápida para Montar el Proyecto en Cualquier PC

Esta guía te permite clonar, configurar y levantar el proyecto de la **Plataforma de Gestión de Recursos y Espacios de PLAi** en cualquier computadora en menos de 5 minutos, cumpliendo al 100% con el **Estándar Tecnológico PLAi v1.0** (Next.js 16 + React 19 + PostgreSQL 15/16 + NextAuth.js).

---

## 📋 1. Requisitos Previos en la PC

1. **Node.js 22 LTS** (o versión 20+) instalado: [nodejs.org](https://nodejs.org/)
2. **pnpm** instalado globalmente:
   ```powershell
   npm install -g pnpm
   ```
3. **PostgreSQL 15 o 16** (estándar oficial de PLAi) o Docker:
   - Instalador local: [postgresql.org/download](https://www.postgresql.org/download/)
   - O vía Docker con un solo comando:
     ```powershell
     docker run -d --name plai-postgres -e POSTGRES_USER=plai -e POSTGRES_PASSWORD=plai -e POSTGRES_DB=plai_recursos -p 5432:5432 postgres:16-alpine
     ```

---

## 🗄️ 2. Montar y Migrar la Base de Datos (PostgreSQL)

El proyecto utiliza **migraciones versionadas e idempotentes** (`database/migrations/`) y datos de semilla (`database/seeds/`), conforme a la sección 9 del estándar PLAi:

1. Asegúrate de tener creada la base de datos `plai_recursos` en PostgreSQL.
2. Configura tus credenciales en `.env.local` (ver paso 3).
3. Ejecuta las migraciones automatizadas:
   ```powershell
   pnpm db:migrate
   ```
   *(Aplica `001_esquema_inicial.sql` y `002_catalogos_oficiales.sql` registrándolas en la tabla `schema_migrations`).*

4. *(Opcional, solo desarrollo/evaluación)* Siembra los datos de prueba iniciales:
   ```powershell
   pnpm db:seed-demo
   ```

---

## 💻 3. Levantar la Aplicación Web (Next.js)

1. Abre PowerShell o tu terminal en la carpeta del proyecto:
   ```powershell
   cd Estadia2026IDGS
   ```

2. Genera el archivo de variables locales:
   ```powershell
   cp .env.example .env.local
   ```
   *(Ajusta `DB_USER` y `DB_PASSWORD` en `.env.local` según tu instalación local de PostgreSQL).*

3. Instala las dependencias:
   ```powershell
   pnpm install
   ```

4. Ejecuta las pruebas automatizadas (104 pruebas unitarias):
   ```powershell
   pnpm test
   ```

5. Inicia el servidor de desarrollo:
   ```powershell
   pnpm dev
   ```

6. Abre en tu navegador:
   👉 **http://localhost:3000**

---

## 👥 Cuentas de Acceso Rápido para Pruebas (NextAuth.js)

En la pantalla de inicio de sesión `/login` cuentas con botones de acceso rápido de 1 solo clic y autenticación institucional:

| Rol | Correo | Perfil y Acceso |
| :--- | :--- | :--- |
| **Administrador** | `admin@plai.edu.mx` | Acceso completo al Backoffice administrativo: `/admin` (Inventario, Mantenimientos, Reservaciones, Usuarios, Reportes). |
| **Usuario Estándar** | `user@plai.edu.mx` | Portal de usuario: `/usuario` (Mis Préstamos, Agenda de talleres y solicitud de recursos). |

---

## 📂 Recursos y Documentación Oficial Incluida

* **Logotipo oficial de PLAi:** [`public/logotipo.png`](./public/logotipo.png)
* **Carta Responsiva Oficial en PDF:** [`public/documentos/PLAi_Carta_Responsiva_Equipos.pdf`](./public/documentos/PLAi_Carta_Responsiva_Equipos.pdf)
* **Inventarios PDF oficiales de PLAi:** [`public/documentos/Inventario/`](./public/documentos/Inventario/)
* **Reporte de Estadía Profesional:** [`REPORTE_ESTADIA_R-ADC-08-07.md`](./REPORTE_ESTADIA_R-ADC-08-07.md)
* **Estándar Tecnológico PLAi:** [`est_ndar_tecnol_gico_plai.md`](./est_ndar_tecnol_gico_plai.md)
