/**
 * Módulo: Middleware de autenticación — verifica el token JWT
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 15/09/2026
 */

export function verificarAutenticacion(peticion, respuesta, siguiente) {
  // Pendiente de implementar: extraer el encabezado Authorization, verificar
  // el token JWT y adjuntar la usuaria autenticada a peticion.usuaria.
  siguiente();
}

export default verificarAutenticacion;
