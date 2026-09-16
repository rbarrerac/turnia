/**
 * Módulo: Middleware de autorización — verifica el rol (administradora/clienta)
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 15/09/2026
 */

export function verificarRol(rolRequerido) {
  return function autorizador(peticion, respuesta, siguiente) {
    // Pendiente de implementar: comparar peticion.usuaria.rol con rolRequerido.
    siguiente();
  };
}

export default verificarRol;
