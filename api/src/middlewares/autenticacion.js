/**
 * Módulo: Middleware de autenticación — verifica el token JWT
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 15/09/2026
 */

import { verificarToken } from '../utilidades/generadorDeTokens.js';
import { crearErrorHttp } from '../utilidades/erroresHttp.js';

export function verificarAutenticacion(peticion, respuesta, siguiente) {
  const encabezado = peticion.headers.authorization;

  if (!encabezado || !encabezado.startsWith('Bearer ')) {
    siguiente(crearErrorHttp(401, 'NO_AUTENTICADO', 'Debes iniciar sesión para acceder a este recurso.'));
    return;
  }

  const token = encabezado.slice('Bearer '.length);

  try {
    const cargaUtil = verificarToken(token);
    peticion.usuario = { id: cargaUtil.id, rol: cargaUtil.rol };
    siguiente();
  } catch (error) {
    siguiente(crearErrorHttp(401, 'NO_AUTENTICADO', 'El token es inválido o ha expirado.'));
  }
}

export default verificarAutenticacion;
