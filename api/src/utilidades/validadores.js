/**
 * Módulo: Funciones de validación de datos de entrada
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 18/09/2026
 */

const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LONGITUD_MINIMA_CONTRASENA = 8;

export function esCorreoValido(correo) {
  return typeof correo === 'string' && PATRON_CORREO.test(correo.trim());
}

export function esContrasenaValida(contrasena) {
  return typeof contrasena === 'string' && contrasena.length >= LONGITUD_MINIMA_CONTRASENA;
}
