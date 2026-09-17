/**
 * Módulo: Envoltorio de fetch hacia la API REST de Turnia
 * Proyecto: Turnia
 * Autor: Luis
 * Fecha de creación: 15/09/2026
 */

const URL_BASE = import.meta.env.VITE_URL_API ?? 'http://localhost:4000/api';

async function peticion(ruta, opciones = {}) {
  const respuesta = await fetch(`${URL_BASE}${ruta}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
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
