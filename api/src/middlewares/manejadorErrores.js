/**
 * Módulo: Middleware centralizado de manejo de errores
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 15/09/2026
 */

export function manejadorErrores(error, peticion, respuesta, _siguiente) {
  const codigoHttp = error.codigoHttp ?? 500;
  const codigo = error.codigo ?? 'ERROR_INTERNO';
  const mensaje = error.mensaje ?? 'Ocurrió un error inesperado en el servidor.';

  if (codigoHttp >= 500) {
    console.error(error);
  }

  respuesta.status(codigoHttp).json({
    exito: false,
    error: { codigo, mensaje },
  });
}

export default manejadorErrores;
