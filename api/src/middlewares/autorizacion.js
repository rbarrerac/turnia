/**
 * Módulo: Middleware de autorización — exige uno o más roles permitidos
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 15/09/2026
 */

import { crearErrorHttp } from '../utilidades/erroresHttp.js';

export function exigirRol(...rolesPermitidos) {
  return function autorizador(peticion, respuesta, siguiente) {
    if (!peticion.usuario || !rolesPermitidos.includes(peticion.usuario.rol)) {
      siguiente(crearErrorHttp(403, 'SIN_PERMISO', 'No tienes permiso para acceder a este recurso.'));
      return;
    }
    siguiente();
  };
}

export default exigirRol;
