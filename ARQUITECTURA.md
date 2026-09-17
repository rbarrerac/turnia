# Turnia — Documento Maestro de Arquitectura

> **Proyecto:** Turnia — Plataforma de Gestión de Citas para Salón de Belleza
> **Curso:** Aseguramiento de la Calidad del Software — Universidad Mariano Gálvez de Guatemala
> **Entrega:** 2 (Implementación)
> **Integrantes:** Ronald (Estudiante 1) · Luis (Estudiante 2)
> **Última actualización:** _(se actualiza durante el desarrollo)_

---

## 0. Cómo usar este documento

Este es el documento maestro de arquitectura de Turnia. Define **toda** la estructura del proyecto: carpetas, dependencias, modelo de datos, clases, servicios, endpoints y reglas de negocio. Es la fuente de verdad técnica del proyecto.

**Reglas permanentes para el desarrollo (aplican a Claude Code y al equipo):**

1. **Idioma español obligatorio.** Todos los nombres de clases, funciones, variables, rutas, endpoints, tablas y columnas se escriben en español. Solo permanecen en inglés las palabras reservadas del lenguaje (`function`, `const`, `import`, `async`, etc.) y los nombres de librerías de terceros.
2. **Encabezado de autoría en cada archivo.** Todo archivo de código inicia con el bloque de comentario definido en la sección 10.
3. **Este documento es un registro vivo.** Además de la arquitectura, contiene una **bitácora** (sección 12) donde se anota cada avance, error, solución y decisión tomada durante el desarrollo.
4. **Gestión de secretos.** Ninguna credencial se escribe en el código ni se sube al repositorio. Todo secreto vive en `.env` (excluido por `.gitignore`); el repositorio incluye `.env.example` como plantilla.

---

## 1. Visión general del sistema

Turnia es una aplicación web que permite a las clientas de un salón de belleza reservar, consultar y cancelar citas en línea, y a la administradora (propietaria) gestionar el catálogo de servicios, la agenda y los estados de las citas. El sistema envía correos automáticos de confirmación y recordatorio.

- **Arquitectura:** tres capas (presentación, lógica de negocio, datos) bajo paradigma cliente-servidor.
- **Estilo de comunicación:** API REST sobre HTTP/HTTPS con JSON.
- **Autenticación:** tokens JWT sin estado; contraseñas con hash bcrypt.

---

## 2. Pila tecnológica (stack)

| Capa | Tecnología | Versión |
|---|---|---|
| Presentación | React + Vite | 18.x |
| Estilos | Tailwind CSS | 3.x |
| Lógica de negocio | Node.js + Express | 20 LTS / 4.x |
| ORM | Prisma | 5.x |
| Base de datos | PostgreSQL | 16.x |
| Autenticación | jsonwebtoken + bcrypt | — |
| Notificaciones | Nodemailer + node-cron | — |
| Pruebas | Jest + Supertest | 29.x |
| Análisis estático | ESLint | 8.x |
| Control de versiones | Git + GitHub | — |

**Lenguaje:** JavaScript (Node en modo ESM: `"type": "module"`). Prisma provee tipado en el editor sin necesidad de compilar TypeScript.

---

## 3. Estructura de carpetas (monorepo)

```
turnia/
├── README.md                     # Guía de instalación y ejecución
├── ARQUITECTURA.md               # Este documento
├── .gitignore
├── .env.example                  # Plantilla de variables de entorno (sin valores reales)
│
├── api/                          # Backend — API REST (Node + Express)
│   ├── package.json
│   ├── .eslintrc.json
│   ├── jest.config.js
│   ├── prisma/
│   │   ├── schema.prisma         # Modelo de datos
│   │   ├── migrations/           # Migraciones generadas
│   │   └── semilla.js            # Datos semilla (seed) del catálogo
│   ├── src/
│   │   ├── servidor.js           # Punto de entrada; levanta Express
│   │   ├── configuracion/
│   │   │   ├── entorno.js        # Carga y valida variables de entorno
│   │   │   └── baseDeDatos.js    # Cliente Prisma compartido
│   │   ├── middlewares/
│   │   │   ├── autenticacion.js  # Verifica token JWT
│   │   │   ├── autorizacion.js   # Verifica rol (administradora/clienta)
│   │   │   └── manejadorErrores.js
│   │   ├── rutas/
│   │   │   ├── indice.js         # Monta todas las rutas bajo /api
│   │   │   ├── autenticacion.rutas.js
│   │   │   ├── servicios.rutas.js
│   │   │   ├── citas.rutas.js
│   │   │   ├── horarios.rutas.js
│   │   │   └── usuarios.rutas.js
│   │   ├── controladores/
│   │   │   ├── autenticacion.controlador.js
│   │   │   ├── servicios.controlador.js
│   │   │   ├── citas.controlador.js
│   │   │   ├── horarios.controlador.js
│   │   │   └── usuarios.controlador.js
│   │   ├── servicios/            # Lógica de negocio (clases)
│   │   │   ├── GestorDeAutenticacion.js
│   │   │   ├── GestorDeServicios.js
│   │   │   ├── GestorDeReservas.js      # NÚCLEO: validación de disponibilidad
│   │   │   ├── GestorDeHorarios.js
│   │   │   └── GestorDeNotificaciones.js
│   │   ├── utilidades/
│   │   │   ├── generadorDeTokens.js
│   │   │   ├── validadores.js
│   │   │   └── fechas.js         # Cálculo de rangos horarios
│   │   └── tareas/
│   │       └── recordatorios.tarea.js   # cron: recordatorio 24 h antes
│   └── pruebas/
│       ├── unitarias/
│       │   ├── gestorDeReservas.prueba.js
│       │   └── fechas.prueba.js
│       └── integracion/
│           ├── autenticacion.prueba.js
│           ├── servicios.prueba.js
│           └── citas.prueba.js
│
└── web/                          # Frontend — SPA (React + Vite)
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx              # Punto de entrada de React
        ├── App.jsx               # Enrutador principal
        ├── api/
        │   └── clienteApi.js     # Envoltorio de fetch hacia la API REST
        ├── contexto/
        │   └── ContextoAutenticacion.jsx  # Estado global de sesión
        ├── componentes/
        │   ├── BarraNavegacion.jsx
        │   ├── TarjetaServicio.jsx
        │   ├── SelectorDeHorario.jsx
        │   ├── CalendarioAgenda.jsx
        │   └── RutaProtegida.jsx
        ├── paginas/
        │   ├── PaginaInicio.jsx
        │   ├── PaginaRegistro.jsx
        │   ├── PaginaInicioSesion.jsx
        │   ├── PaginaCatalogo.jsx
        │   ├── PaginaReservar.jsx
        │   ├── PaginaMisCitas.jsx
        │   └── administradora/
        │       ├── PaginaAgenda.jsx
        │       ├── PaginaGestionServicios.jsx
        │       └── PaginaConfiguracionHorario.jsx
        └── estilos/
            └── indice.css        # Directivas de Tailwind
```

---

## 4. Modelo de datos

Seis entidades principales. Nombres de tablas y columnas en español.

### 4.1 Diagrama entidad-relación (resumen textual)

```
usuarios (1) ──< (N) citas >── (N) (1) servicios
horarios_atencion (config semanal de la administradora)
dias_no_laborables (excepciones)
citas (1) ──< (N) notificaciones
```

### 4.2 Definición de tablas

**usuarios**
| Columna | Tipo | Restricción |
|---|---|---|
| id | UUID | PK |
| nombre | VARCHAR(120) | NOT NULL |
| correo | VARCHAR(160) | NOT NULL, UNIQUE |
| telefono | VARCHAR(20) | NULL |
| contrasena_hash | VARCHAR(255) | NOT NULL |
| rol | ENUM(`administradora`, `clienta`) | NOT NULL, default `clienta` |
| activo | BOOLEAN | default true |
| creado_en | TIMESTAMP | default now() |

**servicios**
| Columna | Tipo | Restricción |
|---|---|---|
| id | UUID | PK |
| nombre | VARCHAR(120) | NOT NULL |
| descripcion | TEXT | NULL |
| duracion_minutos | INTEGER | NOT NULL, CHECK > 0 |
| precio | DECIMAL(8,2) | NOT NULL, CHECK >= 0 |
| activo | BOOLEAN | default true |
| creado_en | TIMESTAMP | default now() |

**horarios_atencion**
| Columna | Tipo | Restricción |
|---|---|---|
| id | UUID | PK |
| dia_semana | SMALLINT | NOT NULL, CHECK 0–6 (0 = domingo) |
| hora_inicio | TIME | NOT NULL |
| hora_fin | TIME | NOT NULL |
| activo | BOOLEAN | default true |

**dias_no_laborables**
| Columna | Tipo | Restricción |
|---|---|---|
| id | UUID | PK |
| fecha | DATE | NOT NULL, UNIQUE |
| motivo | VARCHAR(160) | NULL |

**citas**
| Columna | Tipo | Restricción |
|---|---|---|
| id | UUID | PK |
| clienta_id | UUID | FK → usuarios.id, NOT NULL |
| servicio_id | UUID | FK → servicios.id, NOT NULL |
| inicia_en | TIMESTAMP | NOT NULL |
| termina_en | TIMESTAMP | NOT NULL |
| estado | ENUM(`pendiente`,`confirmada`,`completada`,`cancelada`) | default `pendiente` |
| notas | TEXT | NULL |
| creado_en | TIMESTAMP | default now() |
| actualizado_en | TIMESTAMP | default now() |

> **Regla de integridad clave — no superposición de citas:** se define una restricción de exclusión de PostgreSQL sobre el rango temporal `[inicia_en, termina_en)` para las citas cuyo `estado` no sea `cancelada`. Esto garantiza a nivel de base de datos que dos citas activas no puedan solaparse, incluso ante peticiones concurrentes. Requiere la extensión `btree_gist`:
> ```sql
> CREATE EXTENSION IF NOT EXISTS btree_gist;
> ALTER TABLE citas ADD CONSTRAINT sin_superposicion
>   EXCLUDE USING gist (
>     tsrange(inicia_en, termina_en) WITH &&
>   ) WHERE (estado <> 'cancelada');
> ```
> Como Prisma no modela `EXCLUDE` de forma nativa, esta restricción se agrega mediante una migración SQL manual (ver bitácora).

**notificaciones**
| Columna | Tipo | Restricción |
|---|---|---|
| id | UUID | PK |
| cita_id | UUID | FK → citas.id, NOT NULL |
| tipo | ENUM(`confirmacion`,`recordatorio`) | NOT NULL |
| enviado_en | TIMESTAMP | NULL |
| exitoso | BOOLEAN | default false |

---

## 5. Reglas de negocio

1. **RN-01 — Cálculo de fin de cita.** `termina_en = inicia_en + servicio.duracion_minutos`. Se calcula en el servidor; nunca se confía en el cliente.
2. **RN-02 — Disponibilidad.** Una cita solo puede crearse si: (a) cae dentro del horario de atención del día correspondiente, (b) la fecha no está en `dias_no_laborables`, y (c) no se superpone con otra cita activa.
3. **RN-03 — Cancelación.** Una clienta puede cancelar su cita solo si faltan **2 horas o más** para `inicia_en`. Al cancelar, el horario queda libre.
4. **RN-04 — Estados válidos.** Transiciones permitidas: `pendiente → confirmada → completada`; desde `pendiente` o `confirmada` se puede pasar a `cancelada`. No se permite reactivar una cita cancelada.
5. **RN-05 — Confirmación automática.** Al crear una cita se envía correo de confirmación (registro en `notificaciones`).
6. **RN-06 — Recordatorio automático.** Una tarea cron diaria envía recordatorio 24 h antes de cada cita en estado `confirmada`.
7. **RN-07 — Unicidad de correo.** No pueden existir dos usuarios con el mismo correo.

---

## 6. Diseño de la API REST

Base: `/api`. Formato: JSON. Autenticación: encabezado `Authorization: Bearer <token>`.

### 6.1 Autenticación — `/api/autenticacion`
| Método | Ruta | Descripción | Protegido | Caso de uso |
|---|---|---|---|---|
| POST | `/registro` | Registra una clienta | No | CU-01 |
| POST | `/inicio-sesion` | Autentica y devuelve token JWT | No | CU-02 |
| GET | `/perfil` | Devuelve datos del usuario autenticado | Sí | — |

### 6.2 Servicios — `/api/servicios`
| Método | Ruta | Descripción | Protegido | Caso de uso |
|---|---|---|---|---|
| GET | `/` | Lista servicios activos | No | CU-03 |
| GET | `/:id` | Detalle de un servicio | No | CU-03 |
| POST | `/` | Crea servicio | Sí (administradora) | CU-07 |
| PUT | `/:id` | Edita servicio | Sí (administradora) | CU-07 |
| DELETE | `/:id` | Desactiva servicio | Sí (administradora) | CU-07 |

### 6.3 Citas — `/api/citas`
| Método | Ruta | Descripción | Protegido | Caso de uso |
|---|---|---|---|---|
| GET | `/disponibilidad` | Horarios libres para un servicio y fecha | Sí | CU-04 |
| POST | `/` | Crea una reserva | Sí (clienta) | CU-04 |
| GET | `/mias` | Historial de citas de la clienta | Sí (clienta) | CU-06 |
| PATCH | `/:id/cancelar` | Cancela una cita | Sí (clienta) | CU-05 |
| GET | `/agenda` | Agenda por día/semana | Sí (administradora) | CU-08 |
| PATCH | `/:id/estado` | Cambia estado de la cita | Sí (administradora) | CU-09 |

### 6.4 Horarios — `/api/horarios`
| Método | Ruta | Descripción | Protegido | Caso de uso |
|---|---|---|---|---|
| GET | `/` | Consulta horario de atención | No | — |
| PUT | `/` | Configura horario semanal | Sí (administradora) | CU-10 |
| POST | `/dias-no-laborables` | Registra día no laborable | Sí (administradora) | CU-10 |
| DELETE | `/dias-no-laborables/:id` | Elimina día no laborable | Sí (administradora) | CU-10 |

### 6.5 Formato de respuesta estándar
```json
// Éxito
{ "exito": true, "datos": { ... } }
// Error
{ "exito": false, "error": { "codigo": "DISPONIBILIDAD_OCUPADA", "mensaje": "El horario ya no está disponible." } }
```

### 6.6 Códigos HTTP usados
`200` OK · `201` Creado · `400` Solicitud inválida · `401` No autenticado · `403` Sin permiso · `404` No encontrado · `409` Conflicto (p. ej. superposición) · `500` Error interno.

---

## 7. Clases de la lógica de negocio

**GestorDeAutenticacion**
- `registrar(nombre, correo, telefono, contrasena)` → crea usuario, hashea contraseña.
- `iniciarSesion(correo, contrasena)` → valida y devuelve token JWT.

**GestorDeServicios**
- `listarActivos()`, `obtenerPorId(id)`, `crear(datos)`, `editar(id, datos)`, `desactivar(id)`.

**GestorDeReservas** _(núcleo)_
- `calcularDisponibilidad(servicioId, fecha)` → devuelve lista de horarios libres.
- `validarDisponibilidad(servicioId, iniciaEn)` → aplica RN-02; lanza error si no está disponible.
- `reservar(clientaId, servicioId, iniciaEn, notas)` → crea la cita (RN-01, RN-02, RN-05).
- `cancelar(citaId, clientaId)` → aplica RN-03.
- `cambiarEstado(citaId, nuevoEstado)` → aplica RN-04.

**GestorDeHorarios**
- `obtenerHorario()`, `configurarHorario(dias)`, `agregarDiaNoLaborable(fecha, motivo)`, `eliminarDiaNoLaborable(id)`.

**GestorDeNotificaciones**
- `enviarConfirmacion(cita)`, `enviarRecordatorio(cita)`.

---

## 8. Frontend — páginas y flujo

| Página | Ruta | Actor | Descripción |
|---|---|---|---|
| PaginaInicio | `/` | Todos | Bienvenida y acceso al catálogo |
| PaginaRegistro | `/registro` | Clienta | Formulario de registro |
| PaginaInicioSesion | `/inicio-sesion` | Todos | Autenticación |
| PaginaCatalogo | `/servicios` | Todos | Lista de servicios con precio y duración |
| PaginaReservar | `/reservar/:servicioId` | Clienta | Selector de fecha/hora y confirmación |
| PaginaMisCitas | `/mis-citas` | Clienta | Historial y cancelación |
| PaginaAgenda | `/admin/agenda` | Administradora | Calendario diario/semanal |
| PaginaGestionServicios | `/admin/servicios` | Administradora | CRUD de servicios |
| PaginaConfiguracionHorario | `/admin/horario` | Administradora | Horario y días no laborables |

Inspiración de interfaz de reservas: flujo simple de tres pasos (elegir servicio → elegir fecha/hora → confirmar), similar a la referencia de Zoe Guatemala.

---

## 9. Catálogo semilla (datos de ejemplo)

Precios y duraciones basados en el mercado real de salones en Ciudad de Guatemala (Fresha, Rebecana, Boho Sense; rangos Q25–Q449, 30 min–2.5 h). La administradora podrá editarlos.

| Servicio | Duración (min) | Precio (Q) |
|---|---|---|
| Manicura clásica | 45 | 90.00 |
| Manicura con gelish | 60 | 150.00 |
| Pedicura clásica | 60 | 120.00 |
| Pedicura spa | 90 | 195.00 |
| Manicura + pedicura | 120 | 250.00 |
| Uñas acrílicas (set completo) | 120 | 300.00 |
| Relleno de acrílico | 90 | 180.00 |
| Uñas de gel / extensiones | 120 | 280.00 |
| Retiro de acrílico/gel | 30 | 60.00 |
| Decoración por uña (diseño) | 15 | 25.00 |

Usuario administradora semilla: correo `admin@turnia.gt` (contraseña se define vía variable de entorno o script, nunca en el código).

---

## 10. Encabezado de autoría (obligatorio en cada archivo)

```js
/**
 * Módulo: <nombre y propósito del archivo>
 * Proyecto: Turnia
 * Autor: Ronald            // o Luis
 * Fecha de creación: DD/MM/AAAA
 */
```

---

## 11. Variables de entorno (`.env.example`)

```
# Base de datos
DATABASE_URL="postgresql://usuario:contrasena@localhost:5432/turnia"

# Autenticación
JWT_SECRET="cadena-larga-aleatoria-cambiar-en-produccion"
JWT_EXPIRACION="7d"

# Servidor de correo (SMTP)
SMTP_HOST="smtp.ejemplo.com"
SMTP_PUERTO="587"
SMTP_USUARIO="tu-correo@ejemplo.com"
SMTP_CONTRASENA="clave-de-aplicacion"
SMTP_REMITENTE="Turnia <no-responder@turnia.gt>"

# Servidor
PUERTO_API="4000"
ORIGEN_PERMITIDO="http://localhost:5173"
```

---

## 12. Bitácora de desarrollo

> Registro cronológico de avances, errores, soluciones y decisiones. Cada entrada indica fecha, autor y descripción. _(Se completa durante la construcción.)_

| Fecha | Autor | Tipo | Descripción |
|---|---|---|---|
| 15/09/2026 | Ronald | avance | Creación del andamiaje inicial del monorepo: estructura completa de carpetas de `api/` y `web/`, `package.json` con dependencias (backend y frontend), `schema.prisma` con los seis modelos y enums, servidor Express funcional con endpoint `GET /api/salud`, enrutador/controladores/gestores/middlewares/utilidades/tareas como esqueletos con marcador de posición, y frontend React + Vite + Tailwind con enrutador y páginas placeholder. Lógica de negocio pendiente para el siguiente paso. |
| 15/09/2026 | Ronald | decisión | `.env.example` se creó tanto en la raíz (documentación general, según sección 3) como en `api/.env.example` (versión funcional que Prisma y dotenv cargan automáticamente desde la carpeta `api/`). |
| 15/09/2026 | Ronald | decisión | La restricción `EXCLUDE USING gist` (no superposición de citas) y las restricciones `CHECK` del modelo de datos no se modelan en `schema.prisma` por limitación de Prisma; quedan documentadas en `api/prisma/migrations/README.md` para agregarse como migración SQL manual cuando exista una base de datos PostgreSQL disponible. |
| 17/09/2026 | Luis | avance | Incremento 2 — backend: implementado `GestorDeServicios` (listarActivos, obtenerPorId, crear, editar, desactivar con borrado lógico) y su controlador/rutas bajo `/api/servicios`, ya montadas en el incremento anterior. `GET /` y `GET /:id` quedan públicos; `POST`, `PUT` y `DELETE` protegidos con `verificarAutenticacion` + `verificarRol("administradora")`. |
| 17/09/2026 | Luis | decisión | Los middlewares `verificarAutenticacion` (extrae y verifica el JWT del encabezado `Authorization`) y `verificarRol` (compara `peticion.usuaria.rol`), y las utilidades `generarToken`/`verificarToken`, quedaron sin implementar como esqueleto desde el Incremento 1. Se implementaron ahora en su forma mínima porque CU-07 los exige explícitamente para proteger el catálogo; se optó por verificación de JWT sin consulta a base de datos (sesión sin estado, según sección 1). No se tocó `GestorDeAutenticacion` (registrar/iniciarSesion) ni su controlador/rutas: el flujo de registro e inicio de sesión (CU-01/CU-02) queda pendiente para un incremento futuro. |
| 17/09/2026 | Luis | avance | Se implementó `api/prisma/semilla.js`: inserta la usuaria administradora (correo desde `CORREO_ADMIN`, contraseña hasheada con bcrypt desde `CONTRASENA_ADMIN`; si falta, usa "Admin1234" solo en desarrollo e imprime advertencia), el catálogo de 10 servicios de la sección 9 y el horario semanal por defecto (lunes a sábado 9:00–18:00, domingo inactivo) en `horarios_atencion`. El script es idempotente (verifica existencia por correo/nombre/día antes de insertar) y se verificó ejecutándolo dos veces seguidas sin duplicar datos. |
| 17/09/2026 | Luis | decisión | Se renombró la variable de entorno de semilla `SEMILLA_CONTRASENA_ADMIN` (placeholder del Incremento 1) a `CORREO_ADMIN` y `CONTRASENA_ADMIN`, agregadas a `.env.example` (raíz y `api/`) y a `api/.env` local, según lo pedido para este incremento. |
| 17/09/2026 | Luis | decisión | Se extrajo la configuración de Express (`aplicacion.js`) de `servidor.js` para poder importar la app en las pruebas de integración con Supertest sin levantar un puerto real; `servidor.js` ahora solo importa `aplicacion.js` y llama `listen`. Cambio estructural, sin alterar ninguna lógica de negocio existente. |
| 17/09/2026 | Ronald | avance | Incremento 2 — frontend: implementadas `PaginaCatalogo` (pública, consume `GET /api/servicios`, cuadrícula responsiva de 1 columna en móvil a 3 en escritorio) y `TarjetaServicio` (formato de precio en quetzales y duración legible, p. ej. "1 h 30 min", con botón "Reservar" hacia `/reservar/:servicioId`). Implementada `PaginaGestionServicios` (tabla con editar/desactivar, formulario de creación/edición reutilizado, mensajes de éxito/error en español). |
| 17/09/2026 | Ronald | decisión | `RutaProtegida` y `ContextoAutenticacion` estaban como esqueleto sin funcionalidad real desde el Incremento 1 (y `main.jsx` no envolvía la app en el proveedor de contexto). Se implementaron en su forma mínima porque el requisito explícito de este incremento es que `PaginaGestionServicios` esté "protegida con RutaProtegida y rol administradora": `ContextoAutenticacion` ahora decodifica el JWT guardado en `localStorage` (clave `turnia_token`) para conocer la usuaria y su rol sin llamada al servidor, y `RutaProtegida` redirige a `/inicio-sesion` sin sesión o a `/` si el rol no coincide. La seguridad real sigue siendo responsabilidad exclusiva del backend (los middlewares); esto es solo control de acceso de interfaz. No se implementó `PaginaInicioSesion` ni el flujo real de autenticación (CU-02), que queda pendiente para un incremento futuro — mientras tanto, probar `PaginaGestionServicios` manualmente requiere colocar un JWT válido en `localStorage.turnia_token` (ver instrucciones de prueba). |
| 17/09/2026 | Ronald | avance | Pruebas de integración `pruebas/integracion/servicios.prueba.js` (Jest + Supertest): listar (200 y lista no vacía, generada por la propia prueba para no depender de que la semilla ya se haya ejecutado), detalle existente (200), detalle inexistente (404 `SERVICIO_NO_ENCONTRADO`), crear sin token (401), crear con token de clienta (403), crear con token de administradora y datos válidos (201), crear con precio negativo (400 `DATOS_INVALIDOS`), desactivar con administradora (200, `activo=false`). Los tokens de prueba se generan directamente con `generarToken`, sin pasar por el endpoint de inicio de sesión (no implementado aún). Las pruebas limpian los servicios que crean en un `afterAll`. `npm run prueba` corre las 5 suites del proyecto (incluidas las `test.todo` de autenticación/citas del incremento anterior) en verde: 8 pruebas reales pasan, 4 quedan como `todo` pendientes de incrementos futuros. |
| 17/09/2026 | Ronald | avance | Verificación manual en navegador (Playwright headless) tras levantar `api` y `web` en local: catálogo muestra las 10 tarjetas correctas con precio en Q y duración legible, en escritorio (3 columnas) y en 375 px (1 columna, sin scroll horizontal); `/admin/servicios` redirige a `/inicio-sesion` sin token y, con un JWT de administradora en `localStorage`, muestra la tabla de 10 servicios y permite crear uno nuevo con mensaje de éxito; sin errores en consola del navegador. |
| 18/09/2026 | Ronald | incidente | El Incremento 1 (autenticación, CU-01/CU-02) quedó inicialmente sin implementar (marcadores de placeholder y pruebas `todo`); se detectó al no poder iniciar sesión y se corrigió implementando la lógica real. |
| 18/09/2026 | Ronald | avance | Incremento 1 — backend: implementado `GestorDeAutenticacion.registrar` (valida nombre, correo con `esCorreoValido`, contraseña ≥ 8 caracteres con `esContrasenaValida`; correo duplicado -> `CORREO_DUPLICADO` 409, también como resguardo ante condición de carrera capturando el código `P2002` de Prisma; hashea con bcrypt coste 10; crea con rol `clienta`; nunca devuelve `contrasena_hash`) y `GestorDeAutenticacion.iniciarSesion` (credenciales inválidas, usuaria inexistente e inactiva devuelven el mismo error `CREDENCIALES_INVALIDAS` 401, para no revelar si el correo existe; genera JWT con `{ id, rol }` vía `generarToken`). `validadores.js` implementado (`esCorreoValido`, `esContrasenaValida`, mínimo 8 caracteres). Controlador y rutas de `/api/autenticacion` (`POST /registro` 201, `POST /inicio-sesion` 200, `GET /perfil` 200 protegido) conectados al gestor real. |
| 18/09/2026 | Ronald | decisión | `generadorDeTokens.js` y `middlewares/autenticacion.js` ya habían quedado implementados de forma funcional durante el Incremento 2 (eran infraestructura necesaria para proteger el catálogo); se les actualizó únicamente el encabezado de autoría a este incremento, sin tocar su lógica. `middlewares/autorizacion.js` (`verificarRol`) no se tocó en absoluto, tal como se pidió, porque ya lo usa el Incremento 2 y funciona. |
| 18/09/2026 | Ronald | decisión | El middleware adjunta la usuaria autenticada en `peticion.usuaria = { id, rol }` (no `req.usuario`), respetando el nombre de propiedad ya establecido desde el esqueleto original del Incremento 1 y usado por `verificarRol` del Incremento 2 (`peticion.usuaria.rol`). Cambiarlo a `usuario` habría roto la autorización del catálogo de servicios. |
| 18/09/2026 | Luis | avance | Incremento 1 — frontend: `ContextoAutenticacion` rediseñado para hacer llamadas reales a la API (`iniciarSesion(correo, contrasena)`, `registrar(datos)`, `cerrarSesion()`) en vez de solo decodificar el JWT en el cliente; al montar, si hay token en `localStorage` restaura la sesión llamando a `GET /api/autenticacion/perfil` (valida el token contra el servidor y trae los datos completos de la usuaria). El estado expuesto se renombró de `usuaria` a `usuario` (capa de frontend, independiente del `peticion.usuaria` del backend); se actualizaron en consecuencia `RutaProtegida` y `BarraNavegacion` (únicos consumidores). `clienteApi.js` ganó `guardarToken`/`borrarToken` junto al `obtenerToken` existente, como único punto de manejo del token; el adjuntado automático del encabezado `Authorization` ya funcionaba desde el Incremento 1 original. |
| 18/09/2026 | Luis | avance | `PaginaRegistro` y `PaginaInicioSesion` implementadas con formularios reales, validación en cliente y mensajes de error del servidor en español. Al iniciar sesión, redirige a `/admin/agenda` si el rol es `administradora` o a `/servicios` si es `clienta`. `BarraNavegacion` ahora muestra "Iniciar sesión"/"Registrarse" sin sesión, y el nombre de la usuaria más "Cerrar sesión" con sesión. |
| 18/09/2026 | Luis | avance | Pruebas de integración `pruebas/integracion/autenticacion.prueba.js` reescritas por completo (sin `test.todo`, todas con aserciones reales): registro exitoso (201, sin `contrasena_hash`), correo duplicado (409), contraseña corta (400), inicio de sesión correcto (200, con `datos.token`), contraseña incorrecta (401), perfil sin token (401) y perfil con token válido (200). Usan correos con marca de tiempo y limpian las usuarias creadas en `afterAll`. `npm run prueba`: 15 pruebas reales pasan (7 de autenticación + 8 de servicios del Incremento 2, que se verificaron intactas), 0 `todo` en autenticación; quedan 3 `todo` sin relación con este incremento (`citas`, `gestorDeReservas`, `fechas` — placeholders de incrementos futuros de reservas, fuera de este alcance). |
| 18/09/2026 | Luis | avance | Verificación manual: `curl` a `POST /api/autenticacion/inicio-sesion` con la administradora semilla devuelve un token JWT real y el usuario (ya no el marcador "Pendiente de implementar"). Flujo completo probado en navegador con Playwright: registro -> redirección a inicio de sesión con mensaje de éxito -> login como clienta va a `/servicios` -> barra muestra el nombre y permite cerrar sesión -> clienta no puede entrar a `/admin/servicios` (redirige a `/`) -> la sesión persiste tras recargar la página -> login como administradora va a `/admin/agenda` y sí puede entrar a `/admin/servicios` (confirma que el Incremento 2 sigue funcionando con sesión real) -> contraseña incorrecta muestra el mensaje de error. Sin errores en consola del navegador. |

---

## 13. Trazabilidad casos de uso → componentes

| Caso de uso | Endpoint | Clase | Página frontend |
|---|---|---|---|
| CU-01 Registrarse | POST /autenticacion/registro | GestorDeAutenticacion | PaginaRegistro |
| CU-02 Iniciar sesión | POST /autenticacion/inicio-sesion | GestorDeAutenticacion | PaginaInicioSesion |
| CU-03 Consultar servicios | GET /servicios | GestorDeServicios | PaginaCatalogo |
| CU-04 Reservar cita | POST /citas | GestorDeReservas | PaginaReservar |
| CU-05 Cancelar cita | PATCH /citas/:id/cancelar | GestorDeReservas | PaginaMisCitas |
| CU-06 Consultar historial | GET /citas/mias | GestorDeReservas | PaginaMisCitas |
| CU-07 Gestionar catálogo | POST/PUT/DELETE /servicios | GestorDeServicios | PaginaGestionServicios |
| CU-08 Ver calendario | GET /citas/agenda | GestorDeReservas | PaginaAgenda |
| CU-09 Gestionar estado | PATCH /citas/:id/estado | GestorDeReservas | PaginaAgenda |
| CU-10 Configurar horario | PUT /horarios | GestorDeHorarios | PaginaConfiguracionHorario |
| CU-11 Enviar confirmación | (interno, al reservar) | GestorDeNotificaciones | — |
| CU-12 Enviar recordatorio | (cron diario) | GestorDeNotificaciones | — |
