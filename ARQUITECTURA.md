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
8. **RN-08 — Completado no anticipado.** Una cita solo puede marcarse como `completada` si ya pasaron al menos **10 minutos** desde su `inicia_en`. Si se intenta antes, error `COMPLETADO_ANTICIPADO` (400).

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
| 18/09/2026 | Ronald | avance | Incremento 3 (núcleo: motor de reservas, CU-04/05/06) — Paso 1: se agregó la migración manual `prisma/migrations/20260918000000_agregar_restriccion_sin_superposicion/migration.sql` con `CREATE EXTENSION IF NOT EXISTS btree_gist` y `ALTER TABLE citas ADD CONSTRAINT sin_superposicion EXCLUDE USING gist (tsrange(inicia_en, termina_en) WITH &&) WHERE (estado <> 'cancelada')`, aplicada directamente con `psql` (el proyecto sincroniza el esquema con `prisma db push`, no con `prisma migrate`, porque la base ya tenía tablas creadas antes de adoptar Prisma Migrate — ver decisión del Incremento 2). Verificada con `\d citas`: aparece el índice `"sin_superposicion" EXCLUDE USING gist (...)`. Documentado en `prisma/migrations/README.md`. |
| 18/09/2026 | Ronald | decisión | **Por qué la restricción EXCLUDE es indispensable y no basta con la validación en `GestorDeReservas`:** la validación de aplicación (`validarDisponibilidad`) hace un SELECT y luego un INSERT; entre esos dos pasos, dos peticiones concurrentes pueden leer ambas "libre" antes de que cualquiera escriba (condición de carrera clásica lectura-luego-escritura). Solo una restricción a nivel de base de datos, evaluada de forma atómica por Postgres en el momento del INSERT, puede garantizar la exclusión mutua real. `GestorDeReservas.reservar` intenta primero la validación de aplicación (para dar un error rápido y claro en el caso común) y, si aun así la base de datos rechaza el INSERT por la restricción `sin_superposicion` (Postgres error `23P01`, `exclusion_violation`; Prisma lo entrega como `PrismaClientUnknownRequestError` sin `error.code` propio, así que se detecta buscando `23P01`/`sin_superposicion` en `error.message` — comportamiento verificado empíricamente antes de escribir el código), se traduce a `DISPONIBILIDAD_OCUPADA` (409) igual que el caso normal. La prueba de concurrencia de `pruebas/integracion/citas.prueba.js` (dos `POST /api/citas` simultáneos al mismo horario vía `Promise.all`) confirma el comportamiento de extremo a extremo: siempre una 201 y una 409, nunca dos citas superpuestas. |
| 18/09/2026 | Ronald | avance | Paso 2 (TDD): se escribieron primero las pruebas de `pruebas/unitarias/fechas.prueba.js` (12 casos, incluyendo los límites obligatorios: una cita que termina cuando otra empieza NO se superpone, invadir un minuto SÍ se superpone, el último intervalo del día no excede el cierre) contra `src/utilidades/fechas.js`, que solo tenía funciones esqueleto con otros nombres (`calcularFinDeCita`, `seSuperponenRangos`). Se confirmó que fallaban (`SyntaxError: … does not provide an export named 'calcularFin'`) y luego se implementaron `calcularFin`, `generarIntervalos` y `haySuperposicion` (nombres exactos pedidos en este incremento) hasta que las 12 pruebas pasaron. |
| 18/09/2026 | Ronald | avance | Paso 3 (TDD): se escribieron primero las 14 pruebas de `pruebas/unitarias/gestorDeReservas.prueba.js` contra la clase `GestorDeReservas` (aún con marcadores "Pendiente de implementar"); se confirmó que las 14 fallaban, y luego se implementó la clase completa (`calcularDisponibilidad`, `validarDisponibilidad`, `reservar`, `cancelar`, `obtenerHistorial`, `cambiarEstado`, y `obtenerAgenda` para el endpoint de agenda del Paso 4) hasta que las 14 pasaron. Las pruebas usan la base de datos real de desarrollo (no mocks de Prisma, no configurados en este proyecto) con datos propios aislados (servicio y usuarias de prueba, un día bloqueado en `dias_no_laborables`), limpiados en `afterAll`. |
| 18/09/2026 | Ronald | decisión | Todos los cálculos de horario (`fechas.js`, `GestorDeReservas`) se hacen en UTC de forma consistente en todo el proyecto (así se sembró `horarios_atencion` en el Incremento 2 y así se envían las fechas desde el frontend), en vez de convertir a la zona horaria de Guatemala (UTC-6). Es una simplificación deliberada para este curso: el sistema es internamente consistente (las horas que ve la clienta en el navegador —formateadas también en UTC— coinciden con las que valida el backend), pero un incremento futuro debería adoptar `America/Guatemala` explícitamente si el proyecto pasa a producción real. |
| 18/09/2026 | Ronald | decisión | La disponibilidad (`calcularDisponibilidad`) y la restricción `sin_superposicion` son globales por horario, no por servicio: el modelo de negocio de Turnia es un salón de una sola silla/técnica a la vez (no hay columna que asocie citas a "personal" ni la restricción EXCLUDE las particiona por `servicio_id`), así que dos citas de servicios distintos igual se consideran superpuestas si sus horarios se cruzan. |
| 18/09/2026 | Luis | avance | Paso 4 — `src/controladores/citas.controlador.js` implementado (disponibilidad, crear, listarMias, cancelar, agenda, cambiarEstado), conectado a `GestorDeReservas`. `src/rutas/citas.rutas.js` ya tenía exactamente las rutas y protecciones pedidas desde el esqueleto del Incremento 1 (`GET /disponibilidad` cualquier sesión, `POST /` y `GET /mias` y `PATCH /:id/cancelar` solo clienta, `GET /agenda` y `PATCH /:id/estado` solo administradora); no requirió cambios. Se corrigió que `obtenerAgenda` no filtrara los campos de la clienta relacionada: `include: { clienta: true }` habría expuesto `contrasena_hash` en la respuesta JSON; se cambió a `select` explícito (`id, nombre, correo, telefono`) antes de dejar el endpoint funcional. |
| 18/09/2026 | Luis | avance | Paso 5 — `pruebas/integracion/citas.prueba.js` reescritas con aserciones reales (sin `test.todo`): disponibilidad en día laborable, crear sin token (401), crear como administradora (403 — la reserva la hace la clienta, según sección 13), crear con clienta y horario libre (201), crear en horario ocupado (409), cancelar con más de 2 h (200), historial de la clienta (200), y la **prueba de concurrencia**: dos `POST /api/citas` al mismo servicio/fecha/hora casi simultáneos vía `Promise.all` — se verificó que exactamente uno devuelve 201 y el otro 409 `DISPONIBILIDAD_OCUPADA`. Las fechas de prueba se calculan dinámicamente (próximo lunes, día laborable garantizado por la semilla) y usan horas distintas a las de `gestorDeReservas.prueba.js` (13:00–16:00 vs. 9:00–10:00) para que ambas suites puedan correr en paralelo (Jest usa workers por archivo) sin chocar entre sí contra la restricción `sin_superposicion`, que es global. Todo lo creado se limpia en `afterAll`; se verificó ejecutando `npm run prueba` dos veces seguidas sin dejar residuos. |
| 18/09/2026 | Luis | avance | Frontend: `PaginaReservar` (flujo de 3 pasos: fecha -> horario vía `SelectorDeHorario` -> confirmar), `SelectorDeHorario` (botones de hora formateados en UTC, consistente con el backend) y `PaginaMisCitas` (historial con estado, botón "Cancelar" solo en citas cancelables con 2 h o más de anticipación, y el motivo cuando no se puede) implementados por completo, sin marcadores de posición. Verificado en navegador con Playwright: registro -> login -> catálogo -> reservar -> elegir fecha (próximo lunes) -> ver horarios generados correctamente (pasos de la duración del servicio) -> confirmar -> mensaje de éxito -> "Mis citas" muestra la cita en estado "Pendiente" -> cancelar -> pasa a "Cancelada". Sin errores en consola. |
| 18/09/2026 | Ronald | avance | `npm run prueba` (suite completa: autenticación, servicios, citas, fechas, GestorDeReservas): **49 pruebas pasan, 0 `todo`**, en 5 suites. Ejecutado varias veces seguidas (incluida la ejecución en paralelo de todos los archivos de prueba, que es el comportamiento por defecto de Jest) sin fallos intermitentes y sin dejar datos huérfanos en la base de datos. |
| 18/09/2026 | Ronald | avance | Incremento 4 (CU-08 agenda, CU-09 estados) — backend: los endpoints `GET /api/citas/agenda` y `PATCH /api/citas/:id/estado` ya estaban completos y protegidos para administradora desde el Incremento 3 (`GestorDeReservas.obtenerAgenda` con `select` seguro de la clienta, `cambiarEstado` con las transiciones de RN-04); se confirmó con las pruebas existentes y no requirieron cambios. |
| 18/09/2026 | Ronald | avance | Parte C (arreglo de usabilidad — reactivar servicios): se agregaron `GestorDeServicios.listarTodos()` (activos e inactivos, para la administradora) y `GestorDeServicios.reactivar(id)` (valida existencia igual que `desactivar`; error `SERVICIO_NO_ENCONTRADO` si no existe). Rutas nuevas: `GET /api/servicios/todos` y `PATCH /api/servicios/:id/reactivar`, ambas protegidas para administradora. `GET /api/servicios/todos` se registró **antes** de `GET /api/servicios/:id` en `servicios.rutas.js`: Express interpreta las rutas en el orden en que se declaran, así que si `/:id` fuera primero, una petición a `/todos` se habría interpretado como "buscar el servicio con id 'todos'" en lugar de llegar al controlador correcto. El `GET /api/servicios` público no se tocó y se verificó con una prueba dedicada que sigue sin devolver inactivos. |
| 18/09/2026 | Ronald | avance | Pruebas nuevas en `pruebas/integracion/servicios.prueba.js` (sin tocar las 8 pruebas existentes del Incremento 2): reactivar con administradora (200, `activo=true`) y sin token (401); `GET /todos` con administradora incluye un servicio recién desactivado, sin token (401) y con clienta (403); `GET /servicios` público confirma que un servicio recién desactivado no aparece en la lista. La suite de servicios pasó de 8 a 14 pruebas. |
| 18/09/2026 | Luis | avance | Parte A/B — `PaginaAgenda` (vista de **lista**, no cuadrícula de calendario, por legibilidad con 10–15 citas/día) con modos "Día" y "Semana" (en semana, las citas se agrupan por día con encabezado de fecha), selector de fecha con navegación ← / → (un día o siete según el modo), y `CalendarioAgenda` como componente de fila reutilizado en ambos modos (hora inicio–fin, nombre de la clienta, servicio, etiqueta de estado con color). El nombre `CalendarioAgenda.jsx` se conservó porque así está declarado en la sección 3 de ARQUITECTURA.md, aunque ya no dibuja una cuadrícula; se documentó la decisión en un comentario del propio archivo. |
| 18/09/2026 | Luis | avance | Parte B — cada fila de `CalendarioAgenda` ofrece botones de acción según las transiciones válidas de RN-04 desde el estado actual: "pendiente" muestra "Confirmar" y "Cancelar"; "confirmada" muestra "Completar" y "Cancelar"; "completada" y "cancelada" no muestran acciones. Al cambiar el estado, `PaginaAgenda` recarga la agenda y muestra un mensaje de éxito; si el backend rechaza la transición, muestra el mensaje de error del servidor. |
| 18/09/2026 | Luis | avance | Parte C (frontend) — `PaginaGestionServicios` ahora consume `GET /servicios/todos` en vez de `GET /servicios`, para que la administradora vea también los inactivos (atenuados, con etiqueta "Inactivo"). Cada fila muestra "Desactivar" si está activo o "Reactivar" si no, resolviendo el defecto detectado en pruebas manuales del Incremento 2 (un servicio desactivado "desaparecía" del panel y solo se podía recuperar recreándolo). |
| 18/09/2026 | Luis | avance | Parte D (arreglo de usabilidad — navegación permanente) — `BarraNavegacion` ahora muestra enlaces fijos según el rol en vez de depender del estado de la sesión: clienta ve siempre "Servicios" y "Mis citas"; administradora ve siempre "Agenda", "Servicios" (hacia `/admin/servicios`) y "Horario" (hacia `/admin/horario`, página aún placeholder pendiente de CU-10, fuera de este incremento). Resuelve el defecto detectado en pruebas del Incremento 3: antes "Mis citas" no aparecía en la barra y solo era alcanzable desde el mensaje de éxito al reservar. |
| 18/09/2026 | Ronald | avance | Verificación en navegador con Playwright, de punta a punta: clienta nueva ve "Mis citas" en la barra inmediatamente después de iniciar sesión (sin haber reservado nada); reserva una cita; administradora inicia sesión y ve "Agenda"/"Servicios"/"Horario" fijos; la agenda en modo Día y modo Semana muestra la cita; se cambia el estado pendiente -> confirmada -> completada desde la agenda, y una cita completada ya no muestra botones de acción; se crea, desactiva y reactiva un servicio desde `PaginaGestionServicios`, confirmando visualmente el badge "Activo"/"Inactivo". Sin errores de consola. De paso, esta prueba mostró en vivo un servicio real ("Decoración por uña (diseño)") que había quedado desactivado en pruebas manuales de incrementos anteriores y que, antes de este incremento, era invisible e irrecuperable desde la interfaz — ahora aparece atenuado con su botón "Reactivar". |
| 18/09/2026 | Ronald | avance | `npm run prueba`: **55 pruebas pasan, 0 `todo`**, en 5 suites (49 del Incremento 3 + 6 nuevas de servicios). Ejecutado dos veces seguidas sin fallos intermitentes ni datos huérfanos. |
| 18/09/2026 | Ronald | avance | Incremento 5, Parte A (CU-11/CU-12) — `GestorDeNotificaciones` reescrito con Nodemailer real, con **tolerancia a configuración faltante**: si `SMTP_HOST`/`SMTP_PUERTO`/`SMTP_USUARIO`/`SMTP_CONTRASENA`/`SMTP_REMITENTE` no están completas, no se crea el transportador y el gestor opera en "modo consola" (imprime destinatario/asunto/cuerpo y registra la notificación igual, con `exitoso` según si el envío o la impresión tuvieron éxito). El modo activo se anuncia en consola al construir el gestor. `enviarConfirmacion`/`enviarRecordatorio` registran en `notificaciones` con `enviado_en` y `exitoso` reales, no el marcador fijo `exitoso:false` del Incremento 3. |
| 18/09/2026 | Ronald | decisión | `GestorDeReservas.reservar` ya no inserta un registro `notificaciones` "pendiente" a mano (como quedó documentado en el Incremento 3): ahora llama a `GestorDeNotificaciones.enviarConfirmacion(cita)`, que hace la consulta con `clienta`/`servicio` incluidos si no vienen ya cargados. La llamada está envuelta en su propio `try/catch`: un fallo de notificación (de red, de la base de datos, lo que sea) nunca debe hacer fallar una reserva que ya se creó exitosamente. |
| 18/09/2026 | Ronald | avance | `src/tareas/recordatorios.tarea.js` implementada (RN-06): `enviarRecordatoriosPendientes()` busca citas `confirmada` cuyo `inicia_en` cae en las próximas 24 h y que no tengan ya una notificación `tipo:'recordatorio'`, y les envía (o imprime) el recordatorio; exportada aparte para poder probarla sin esperar al cron. `iniciarTareaRecordatorios()` programa `cron.schedule('0 8 * * *', ...)` — minuto 0, hora 8, todos los días — y se invoca desde `servidor.js` al arrancar. |
| 18/09/2026 | Ronald | decisión | Se encontró que `api/.env` (no `.env.example`) tenía las cinco variables `SMTP_*` con valores de marcador de posición **no vacíos** (`smtp.ejemplo.com`, etc.), heredados del esqueleto del Incremento 1. Con la lógica de tolerancia recién escrita, eso hacía que `GestorDeNotificaciones` creyera que SÍ había SMTP real configurado e intentara conectarse de verdad a un host inexistente en cada prueba. Se vaciaron esas cinco variables en `api/.env` (con un comentario explicando por qué) para que este entorno de desarrollo/evaluación, sin credenciales reales, caiga correctamente en modo consola; `.env.example` conserva los valores ilustrativos como documentación. |
| 18/09/2026 | Ronald | avance | Parte B (RN-08) — `GestorDeReservas.cambiarEstado` valida, solo cuando `nuevoEstado === 'completada'`, que hayan pasado al menos 10 minutos desde `inicia_en`; si no, `COMPLETADO_ANTICIPADO` (400). La validación corre después de la de transición válida (RN-04), así que intentar completar una cita `pendiente` sigue devolviendo `TRANSICION_INVALIDA`, no `COMPLETADO_ANTICIPADO`. RN-08 agregada a la sección 5. |
| 18/09/2026 | Ronald | avance | Pruebas nuevas en `pruebas/unitarias/gestorDeReservas.prueba.js`: completar una cita `confirmada` que empezó hace 5 minutos lanza `COMPLETADO_ANTICIPADO`; completar una que empezó hace 90 minutos funciona. Además, nuevo archivo `pruebas/unitarias/gestorDeNotificaciones.prueba.js` (`enviarConfirmacion`/`enviarRecordatorio` registran la notificación correcta; `enviarRecordatoriosPendientes` solo recoge citas confirmadas dentro de 24 h sin recordatorio previo). |
| 18/09/2026 | Ronald | incidente | Al correr la suite completa varias veces seguidas, `gestorDeReservas.prueba.js` falló de forma intermitente (~1 de cada 3–5 corridas) con un `PrismaClientUnknownRequestError` de `sin_superposicion`, y en otra corrida con una aserción de `CANCELACION_TARDIA` fallida (la cancelación tuvo éxito cuando debía rechazarse). Causa raíz: (1) un nuevo archivo de prueba y uno ya existente usaban el mismo offset relativo fijo (`Date.now() + 60 min`) para crear una cita "cercana"; como Jest corre archivos de prueba en **procesos paralelos** contra la misma base de datos, ambos podían intentar crear casi al mismo instante y chocar contra la restricción `sin_superposicion`; (2) el primer intento de arreglo (verificar disponibilidad con un SELECT antes del INSERT) tenía su propia condición de carrera entre procesos, y además, al reintentar avanzando el reloj en pasos de 5 minutos tras un choque, podía desplazar sin darse cuenta la hora de inicio de la cita más allá del límite de 2 horas que la propia prueba intentaba comprobar. |
| 18/09/2026 | Ronald | decisión | Solución definitiva: reemplazar el patrón "comprobar y luego crear" por "crear y, si la base de datos rechaza por `sin_superposicion` (código Postgres `23P01`), reintentar avanzando 1 minuto" — reaccionar al rechazo *real* de la base de datos es seguro porque Postgres resuelve la condición de carrera de forma atómica, a diferencia de un SELECT previo. Se aplicó este patrón (`crearCitaDePrueba` / `crearCita`) en `gestorDeReservas.prueba.js` y `gestorDeNotificaciones.prueba.js`, y se ajustaron los offsets base de las pruebas sensibles al tiempo (p. ej. "cancelar con menos de 2 horas" pasó de +60 a +30 min; "completar 10 min después" pasó de -40 a -90 min) para que incluso con muchos reintentos de 1 minuto nunca crucen el límite de negocio que la prueba verifica. Verificado ejecutando la suite completa **22 veces seguidas sin ningún fallo** tras el arreglo (antes fallaba en aproximadamente 1 de cada 3–5 corridas). |
| 18/09/2026 | Luis | avance | Parte C — fuentes de Google Fonts vía `<link>` en `index.html` (no como paquete npm): **Playfair Display** (decorativa, para el logo/nombre "Turnia") y **Poppins** (para el resto de la interfaz, con respaldo `sans-serif`). Se eligió Playfair Display sobre Pacifico porque, siendo igual de distintiva para una marca de salón de belleza, es más legible como palabra de marca a tamaños pequeños (Pacifico es cursiva y puede costar más leerse). `tailwind.config.js` expone `font-logo` y `font-base`; `indice.css` aplica `font-base` al `body`. `BarraNavegacion` usa `font-logo` en "Turnia", con tamaño mayor y color distintivo (rosa) frente al resto de los enlaces. |
| 18/09/2026 | Luis | avance | Parte D — modo oscuro: `tailwind.config.js` con `darkMode: 'class'`; nuevo `ContextoTema.jsx` que guarda la preferencia en `localStorage` (`turnia_tema`) y, si no hay ninguna guardada, usa `prefers-color-scheme` del sistema; aplica/quita la clase `dark` en `<html>`. Un botón de alternancia (☀️/🌙) siempre visible en `BarraNavegacion`, con o sin sesión iniciada. Se hizo una pasada de clases `dark:` en todas las páginas y componentes existentes (catálogo, reservar, mis citas, gestión de servicios, agenda, registro, inicio de sesión), no solo en las páginas nuevas de este incremento, para que el tema oscuro sea coherente en todo el sitio y no solo en `PaginaInicio`. |
| 18/09/2026 | Luis | avance | Parte D — `MenuUsuario.jsx`: menú desplegable (tipo redes sociales) que se abre al hacer clic en el nombre/avatar de la usuaria, con "Mi perfil", "Seguridad", el interruptor de tema (duplicado aquí como conveniencia, además del botón siempre visible de la barra) y "Cerrar sesión" (que se movió del botón suelto de la barra a este menú); se cierra al hacer clic fuera (`mousedown` fuera de la referencia del menú). Reemplaza el bloque "Hola, {nombre} / Cerrar sesión" que tenía `BarraNavegacion` desde el Incremento 1. |
| 18/09/2026 | Ronald | avance | Parte D (backend) — `GestorDeAutenticacion` gana `actualizarPerfil(id, {nombre, telefono})`, `cambiarCorreo(id, {correoNuevo, contrasenaActual})` (verifica la contraseña actual con bcrypt antes de nada; `CORREO_DUPLICADO` 409 si el nuevo correo ya existe, con resguardo del código `P2002` de Prisma ante condición de carrera) y `cambiarContrasena(id, {contrasenaActual, contrasenaNueva})` (re-hashea con bcrypt coste 10). Las tres devuelven `CREDENCIALES_INVALIDAS` (401) si la contraseña actual no coincide. Rutas nuevas: `PATCH /api/autenticacion/perfil`, `/correo`, `/contrasena`, las tres protegidas con `verificarAutenticacion` — no chocan con el `GET /perfil` existente porque Express distingue rutas por método además de por path. |
| 18/09/2026 | Luis | avance | Parte D (frontend) — `ContextoAutenticacion` gana `actualizarUsuario(datosParciales)` para reflejar en la sesión en memoria los cambios de perfil/correo sin tener que volver a iniciar sesión. `PaginaPerfil.jsx` (`/perfil`, protegida, cualquier rol) edita nombre y teléfono. `PaginaSeguridad.jsx` (`/seguridad`, protegida, cualquier rol) con dos formularios separados (cambiar correo, cambiar contraseña), cada uno pidiendo la contraseña actual, con mensajes de error/éxito en español. |
| 18/09/2026 | Luis | avance | Pruebas nuevas en `pruebas/integracion/autenticacion.prueba.js`: `PATCH /perfil` actualiza nombre/teléfono y responde 401 sin token; `PATCH /correo` a uno ya existente responde 409; `PATCH /contrasena` con la contraseña actual incorrecta responde 401, y con la correcta permite iniciar sesión con la nueva contraseña acto seguido. La suite de autenticación pasó de 7 a 12 pruebas, sin tocar las 7 anteriores. |
| 18/09/2026 | Luis | avance | Parte E — `PaginaInicio` rediseñada como bienvenida pública ("Bella Aurora — Estudio de Belleza", botón "Reservar cita" que va a `/servicios` con sesión o a `/inicio-sesion` sin ella, enlaces de iniciar sesión/registrarse visibles sin sesión, tarjetas "Quién te atiende" y "Mis trabajos" en cuadrícula responsiva de 1 a 2 columnas), respetando el tema claro/oscuro. `PaginaPanelAdmin.jsx` (`/admin`, protegida administradora) con 4 tarjetas con icono grande (emoji) hacia Agenda, Servicios, Horario y Catálogo/Información. El inicio de sesión de la administradora ahora redirige a `/admin` en vez de directo a `/admin/agenda`. |
| 18/09/2026 | Luis | avance | Marcadores de posición **intencionales** para este incremento (acordados explícitamente, no una omisión): `PaginaTrabajos.jsx` (`/trabajos`, pública) y `PaginaContenidoAdmin.jsx` (`/admin/contenido`, protegida administradora) solo muestran "Próximamente..."; ambas se completan en el Incremento 6. |
| 18/09/2026 | Ronald | avance | Verificación de punta a punta en navegador con Playwright: página de inicio pública con el contenido pedido; alternar tema sin sesión y que persista tras recargar; registro → login → menú desplegable (abre, muestra las 4 opciones, cierra al clic fuera) → editar perfil (el nombre se refleja de inmediato en la barra) → cambiar contraseña → cerrar sesión → iniciar sesión con la contraseña nueva → reservar una cita; el correo de confirmación se imprimió correctamente en la consola del servidor en modo simulado (verificado leyendo el log del proceso `npm run dev`). Login de administradora → `/admin` con las 4 tarjetas → placeholder de `/admin/contenido`. Verificación aparte del botón "Completar" de RN-08: para una cita recién confirmada (próxima semana, 0 min transcurridos) el botón aparece deshabilitado con el tooltip explicando el motivo. Sin errores de consola en ningún flujo. |
| 18/09/2026 | Ronald | avance | `npm run prueba`: **65 pruebas pasan, 0 `todo`**, en 6 suites (55 del Incremento 4 + 4 de RN-08 + 6 de `GestorDeNotificaciones`/recordatorios). Verificado con 22 ejecuciones consecutivas de la suite completa sin fallos intermitentes (ver incidente de condición de carrera arriba) y sin datos huérfanos en la base de datos. |

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
