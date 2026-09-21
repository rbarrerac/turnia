/**
 * Módulo: Configuración de Jest para las pruebas del backend
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 15/09/2026
 */

export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/pruebas/**/*.prueba.js'],
  // Corre antes de que cada archivo de prueba importe la app: deja las SMTP_*
  // vacías en process.env para que GestorDeNotificaciones use siempre modo
  // consola durante la suite, sin importar el .env de la máquina (ver el
  // propio archivo para el detalle de por qué se asigna "" y no se borra).
  setupFiles: ['<rootDir>/pruebas/configuracion/prepararEntornoDePrueba.js'],
  verbose: true,
};
