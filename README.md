# Turnia

**Turnia** es una plataforma web de gestión de citas para un salón de belleza (manicura y pedicura). Permite a las clientas reservar, consultar y cancelar sus citas en línea, y a la administradora gestionar el catálogo de servicios, la agenda y los estados de las citas, con correos automáticos de confirmación y recordatorio.

Proyecto del curso de **Aseguramiento de la Calidad del Software** — Universidad Mariano Gálvez de Guatemala.

> Arquitectura técnica completa (carpetas, modelo de datos, API, reglas de negocio y bitácora): ver **[ARQUITECTURA_PROYECTO.md](./ARQUITECTURA_PROYECTO.md)**.

---

## Requisitos del Sistema

| Programa | Versión | Para qué sirve |
|---|---|---|
| **Node.js** | 20 LTS | Ejecutar el backend y construir el frontend |
| **PostgreSQL** | 16.x | Base de datos |
| **Git** | 2.x | Descargar el código y control de versiones |

> Solo necesitas tener PostgreSQL instalado y en ejecución, y saber la contraseña del superusuario `postgres` (la que definiste al instalarlo). El resto — crear la base de datos, el usuario, las tablas y los datos de prueba — lo hace **un solo comando**.

---

## Configuración Inicial

### 1. Clonar el repositorio

```bash
git clone https://github.com/rbarrerac/turnia.git
cd turnia
```

### 2. Configurar variables de entorno (backend)

```bash
cd api
cp .env.example .env      # en Windows (PowerShell): copy .env.example .env
```

Abre `api/.env` y completa **dos** valores mínimos:

```env
# Contraseña del superusuario de PostgreSQL (la que pusiste al instalar Postgres).
# Solo se usa para crear la base y el usuario de la app; nunca se sube al repositorio.
PG_SUPERCLAVE="tu-contraseña-de-postgres"

# Contraseña que tendrá el usuario dedicado de la aplicación (elígela tú).
# Debe coincidir con la que aparece dentro de DATABASE_URL.
DATABASE_URL="postgresql://turnia_app:elige-una-clave-app@localhost:5432/turnia"
```

Los demás valores ya vienen con valores por defecto que funcionan en local. El envío de correos es **opcional**: si no configuras las variables `SMTP_*`, el sistema imprime los correos en la consola (modo simulado) y todo lo demás funciona igual. Ver [Notificaciones por correo](#notificaciones-por-correo).

> **Nunca subas tu archivo `.env` al repositorio.** Ya está excluido en `.gitignore`.

### 3. Instalar dependencias

```bash
# Backend (dentro de api/)
npm install

# Frontend (en otra ventana, desde la raíz)
cd web
npm install
```

### 4. Preparar la base de datos (un solo comando)

Desde la carpeta `api/`:

```bash
npm run preparar
```

Este comando hace **todo** de una vez:
1. Crea el usuario de base de datos `turnia_app` y la base de datos `turnia`.
2. Activa la extensión `btree_gist` (necesaria para impedir citas superpuestas).
3. Crea las tablas y aplica la restricción de no-superposición.
4. Carga los datos de arranque: catálogo de servicios, horario de atención, y las cuentas de prueba (administradora y clienta).

> Si necesitas empezar de cero (borrar todo y volver a crearlo), ejecuta:
> ```bash
> npm run reiniciar-bd && npm run preparar
> ```

### 5. Iniciar el proyecto

Necesitas **dos** ventanas de terminal abiertas al mismo tiempo.

**Ventana 1 — Backend (desde `api/`):**
```bash
npm run dev          # API en http://localhost:4000
```

**Ventana 2 — Frontend (desde `web/`):**
```bash
npm run dev          # Web en http://localhost:5173
```

Abre el navegador en **http://localhost:5173**.

---

## Cuentas de Prueba

Se crean automáticamente al ejecutar `npm run preparar` (los valores salen de tu `api/.env`; estos son los de por defecto):

| Rol | Correo | Contraseña |
|---|---|---|
| Administradora    | `admin@turnia.gt`     | `Admin1234Dev!`   |
| Clienta           | `clienta@turnia.gt`   | `Clienta1234Dev!` |

> Puedes cambiar estos valores en `api/.env` (variables `CORREO_ADMIN`, `CONTRASENA_ADMIN`, `CORREO_CLIENTA`, `CONTRASENA_CLIENTA`) antes de correr `npm run preparar` o `npm run semilla`.

---

## Arranque rápido (para quien ya tiene todo instalado)

```bash
git clone https://github.com/<usuario>/turnia.git

cd turnia/api
cp .env.example .env        # luego editar PG_SUPERCLAVE y DATABASE_URL
npm install
npm run preparar            # crea base, usuario, tablas, restricción y datos
npm run dev                 # backend en :4000

# en otra ventana:
cd ../web
npm install
npm run dev                 # frontend en :5173
```

---

## Scripts (backend, dentro de `api/`)

| Script | Descripción |
|---|---|
| `npm run dev` | Inicia el backend con recarga automática (puerto 4000) |
| `npm start` | Inicia el backend sin recarga |
| `npm run preparar` | **Todo en uno:** crea usuario + base + extensión, sincroniza el esquema y la restricción, y carga los datos semilla |
| `npm run preparar-bd` | Solo crea el usuario, la base y la extensión |
| `npm run reiniciar-bd` | Borra el usuario y la base y los vuelve a crear desde cero |
| `npm run esquema` | Sincroniza las tablas (Prisma) y aplica la restricción de no-superposición |
| `npm run semilla` | Carga catálogo, horario y las cuentas de prueba (administradora y clienta) |
| `npm run prueba` | Ejecuta la batería de pruebas automatizadas (Jest) |
| `npm run lint` | Análisis estático del código (ESLint) |

---

## Mantenimiento de la Base de Datos

**Reiniciar (borrar y recrear todo):**
```bash
npm run reiniciar-bd && npm run preparar
```

**Pasos manuales equivalentes** (por si prefieres hacerlo con `psql` a mano):
```bash
# 1) Borrar la base y el usuario existentes
psql -U postgres -c "DROP DATABASE IF EXISTS turnia;" -c "DROP ROLE IF EXISTS turnia_app;"

# 2) Crear el usuario y la base (con el usuario como dueño)
psql -U postgres -c "CREATE ROLE turnia_app WITH LOGIN PASSWORD 'la-clave-de-la-app';"
psql -U postgres -c "CREATE DATABASE turnia OWNER turnia_app;"

# 3) Activar la extensión necesaria
psql -U postgres -d turnia -c "CREATE EXTENSION IF NOT EXISTS btree_gist;"

# 4) Crear las tablas (con DATABASE_URL apuntando a turnia_app)
npx prisma generate && npx prisma db push

# 5) Aplicar la restricción de no-superposición
psql -U turnia_app -d turnia -c "ALTER TABLE citas DROP CONSTRAINT IF EXISTS sin_superposicion;" -c "ALTER TABLE citas ADD CONSTRAINT sin_superposicion EXCLUDE USING gist (tsrange(inicia_en, termina_en) WITH &&) WHERE (estado <> 'cancelada');"

# 6) Cargar los datos de arranque
npm run semilla
```

---

## Estructura del Proyecto

```
turnia/
├── README.md                 # Esta guía
├── ARQUITECTURA_PROYECTO.md  # Documento de arquitectura (público)
├── .gitignore
├── .env.example              # Plantilla de variables de entorno (sin valores reales)
├── api/                      # Backend — API REST (Node.js + Express + Prisma)
│   ├── prisma/               # Esquema, semilla y preparación de la base de datos
│   ├── src/                  # Código fuente (rutas, controladores, lógica de negocio)
│   └── pruebas/              # Pruebas unitarias y de integración (Jest + Supertest)
└── web/                      # Frontend — SPA (React + Vite + Tailwind CSS)
    └── src/                  # Páginas, componentes y estado de sesión
```

---

## API Endpoints (principales)

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| POST | `/api/autenticacion/registro` | Registrar una clienta | Público |
| POST | `/api/autenticacion/inicio-sesion` | Iniciar sesión (devuelve token) | Público |
| GET | `/api/autenticacion/perfil` | Perfil del usuario actual | Con sesión |
| GET | `/api/servicios` | Listar servicios activos | Público |
| GET | `/api/servicios/:id` | Detalle de un servicio | Público |
| POST · PUT · DELETE | `/api/servicios` · `/api/servicios/:id` | Gestionar catálogo | Administradora |
| GET | `/api/citas/disponibilidad` | Horarios libres para un servicio y fecha | Con sesión |
| POST | `/api/citas` | Crear una reserva | Clienta |
| GET | `/api/citas/mias` | Historial de citas de la clienta | Clienta |
| PATCH | `/api/citas/:id/cancelar` | Cancelar una cita | Clienta |
| GET | `/api/citas/agenda` | Agenda por día/semana | Administradora |
| PATCH | `/api/citas/:id/estado` | Cambiar estado de una cita | Administradora |

Formato de respuesta: JSON. Éxito → `{ "exito": true, "datos": { ... } }`. Error → `{ "exito": false, "error": { "codigo": "...", "mensaje": "..." } }`.

---

## Pruebas

Desde `api/`:

```bash
npm run prueba
```

Resultado esperado: **6 suites, 65 pruebas, 0 fallidas**. Las pruebas de integración ejecutan la API en memoria (Supertest), por lo que no necesitas levantar el servidor ni usar Postman.

> El detalle de cada caso está en los documentos **Matriz de Casos de Prueba** y **Comandos de la Matriz de Pruebas**.

---

## Notificaciones por correo

Por defecto, el sistema funciona en **modo consola**: los correos de confirmación y recordatorio se imprimen en la terminal del backend en lugar de enviarse. Esto permite que el proyecto funcione sin credenciales de correo.

Para enviar correos reales (por ejemplo, con Gmail):

1. Activa la verificación en dos pasos en tu cuenta de Google.
2. Genera una **Contraseña de aplicación** (Google Account → Seguridad → Contraseñas de aplicaciones).
3. Completa en `api/.env`:
   ```env
   SMTP_HOST="smtp.gmail.com"
   SMTP_PUERTO="587"
   SMTP_USUARIO="tucorreo@gmail.com"
   SMTP_CONTRASENA="la-contraseña-de-aplicación-de-16-letras"
   SMTP_REMITENTE="Bella Aurora <tucorreo@gmail.com>"
   ```
4. Reinicia el backend. Ahora los correos se envían de verdad.

---

## Tecnologías

**Backend:** Node.js · Express · Prisma ORM · PostgreSQL · JWT · bcrypt · Nodemailer · node-cron
**Frontend:** React 18 · Vite · Tailwind CSS · React Router
**Pruebas y calidad:** Jest · Supertest · ESLint
