/**
 * Módulo: Envoltorio de fetch hacia la API REST de Turnia
 * Proyecto: Turnia
 * Autor: Luis
 * Fecha de creación: 15/09/2026
 */

const URL_BASE = import.meta.env.VITE_URL_API ?? 'http://localhost:4000/api';
// URL de los archivos estáticos (galería de trabajos): la misma raíz que la API,
// sin el sufijo "/api" (p. ej. http://localhost:4000/archivos/trabajos/<archivo>).
const URL_ARCHIVOS = URL_BASE.replace(/\/api\/?$/, '');

async function peticion(ruta, opciones = {}) {
  // Con FormData (subida de archivos) el navegador debe fijar su propio
  // Content-Type (con el boundary del multipart); no se debe forzar JSON.
  const esFormData = typeof FormData !== 'undefined' && opciones.body instanceof FormData;

  const respuesta = await fetch(`${URL_BASE}${ruta}`, {
    ...opciones,
    headers: {
      ...(esFormData ? {} : { 'Content-Type': 'application/json' }),
      ...opciones.headers,
    },
  });

  const cuerpo = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    const mensaje = cuerpo?.error?.mensaje ?? `Error en la petición (${respuesta.status})`;
    throw new Error(mensaje);
  }

  return cuerpo;
}

const CLAVE_TOKEN = 'turnia_token';

export function obtenerToken() {
  return localStorage.getItem(CLAVE_TOKEN);
}

export function guardarToken(token) {
  localStorage.setItem(CLAVE_TOKEN, token);
}

export function borrarToken() {
  localStorage.removeItem(CLAVE_TOKEN);
}

function encabezadosAutenticados() {
  const token = obtenerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function obtener(ruta) {
  return peticion(ruta, { method: 'GET', headers: encabezadosAutenticados() });
}

export function enviar(ruta, cuerpo) {
  return peticion(ruta, {
    method: 'POST',
    headers: encabezadosAutenticados(),
    body: JSON.stringify(cuerpo),
  });
}

// Subida de archivos (multipart/form-data), p. ej. una foto de la galería de trabajos.
export function enviarArchivo(ruta, formData) {
  return peticion(ruta, {
    method: 'POST',
    headers: encabezadosAutenticados(),
    body: formData,
  });
}

// Construye la URL pública de un archivo guardado en el almacenamiento del servidor
// (p. ej. una foto de la galería), a partir del nombre de archivo devuelto por la API.
export function urlArchivo(rutaRelativa) {
  return `${URL_ARCHIVOS}/archivos/${rutaRelativa}`;
}

export function actualizar(ruta, cuerpo) {
  return peticion(ruta, {
    method: 'PUT',
    headers: encabezadosAutenticados(),
    body: JSON.stringify(cuerpo),
  });
}

export function actualizarParcial(ruta, cuerpo) {
  return peticion(ruta, {
    method: 'PATCH',
    headers: encabezadosAutenticados(),
    body: JSON.stringify(cuerpo),
  });
}

export function eliminar(ruta) {
  return peticion(ruta, { method: 'DELETE', headers: encabezadosAutenticados() });
}
