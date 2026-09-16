/**
 * Módulo: Rutas de citas — /api/citas
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 15/09/2026
 */

import { Router } from 'express';
import * as controladorCitas from '../controladores/citas.controlador.js';
import { verificarAutenticacion } from '../middlewares/autenticacion.js';
import { exigirRol } from '../middlewares/autorizacion.js';

const enrutador = Router();

enrutador.get('/disponibilidad', verificarAutenticacion, controladorCitas.obtenerDisponibilidad);
enrutador.post('/', verificarAutenticacion, exigirRol('clienta'), controladorCitas.crear);
enrutador.get('/mias', verificarAutenticacion, exigirRol('clienta'), controladorCitas.listarMias);
enrutador.patch(
  '/:id/cancelar',
  verificarAutenticacion,
  exigirRol('clienta'),
  controladorCitas.cancelar,
);
enrutador.get(
  '/agenda',
  verificarAutenticacion,
  exigirRol('administradora'),
  controladorCitas.obtenerAgenda,
);
enrutador.patch(
  '/:id/estado',
  verificarAutenticacion,
  exigirRol('administradora'),
  controladorCitas.cambiarEstado,
);

export default enrutador;
