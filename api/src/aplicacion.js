/**
 * Módulo: Configuración de la aplicación Express (sin levantar el servidor)
 * Proyecto: Turnia
 * Autor: Luis
 * Fecha de creación: 17/09/2026
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

export default aplicacion;
