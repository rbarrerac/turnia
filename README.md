# Turnia

Plataforma de gestión de citas para salón de belleza. Proyecto del curso de Aseguramiento de la Calidad del Software — Universidad Mariano Gálvez de Guatemala.

- Arquitectura técnica completa (carpetas, modelo de datos, API, reglas de negocio): ver [ARQUITECTURA.md](./ARQUITECTURA.md).
- Guía detallada de instalación: ver [INSTALACION.md](./INSTALACION.md).

## Arranque rápido

### Backend (`api/`)

```bash
cd api
cp .env.example .env   # completa las variables reales
npm install
npm run dev             # http://localhost:4000
```

### Frontend (`web/`)

```bash
cd web
cp .env.example .env   # completa VITE_URL_API si aplica
npm install
npm run dev             # http://localhost:5173
```

## Estado actual

Esta es la etapa de andamiaje: el proyecto arranca y responde, pero la lógica de negocio (gestores, controladores, vistas) aún no está implementada. Ver la bitácora en [ARQUITECTURA.md](./ARQUITECTURA.md#12-bitácora-de-desarrollo).
