/**
 * Módulo: Ayuda para crear errores con código de aplicación y estado HTTP
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 15/09/2026
 */

export function crearErrorHttp(codigoHttp, codigo, mensaje) {
  const error = new Error(mensaje);
  error.codigoHttp = codigoHttp;
  error.codigo = codigo;
  error.mensaje = mensaje;
  return error;
}

export default crearErrorHttp;
