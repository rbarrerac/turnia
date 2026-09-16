/**
 * Módulo: Punto de entrada de la API — levanta el servidor Express
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 15/09/2026
 */

import express from 'express';
import cors from 'cors';
import { entorno } from './configuracion/entorno.js';
import enrutadorPrincipal from './rutas/indice.js';
import { manejadorErrores } from './middlewares/manejadorErrores.js';

const aplicacion = express();

aplicacion.use(cors({ origin: entorno.origenPermitido }));
aplicacion.use(express.json());

aplicacion.use('/api', enrutadorPrincipal);

aplicacion.use(manejadorErrores);

aplicacion.listen(entorno.puertoApi, () => {
  console.log(`API de Turnia escuchando en http://localhost:${entorno.puertoApi}`);
});
