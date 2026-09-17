/**
 * Módulo: Punto de entrada de la API — levanta el servidor Express
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 15/09/2026
 */

import aplicacion from './aplicacion.js';
import { entorno } from './configuracion/entorno.js';

aplicacion.listen(entorno.puertoApi, () => {
  console.log(`API de Turnia escuchando en http://localhost:${entorno.puertoApi}`);
});
