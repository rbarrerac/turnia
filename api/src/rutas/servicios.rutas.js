/**
 * Módulo: Rutas de servicios — /api/servicios
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 15/09/2026
 */

import { Router } from 'express';
import * as controladorServicios from '../controladores/servicios.controlador.js';
import { verificarAutenticacion } from '../middlewares/autenticacion.js';
import { exigirRol } from '../middlewares/autorizacion.js';

const enrutador = Router();

enrutador.get('/', controladorServicios.listar);
enrutador.get('/:id', controladorServicios.obtenerPorId);
enrutador.post('/', verificarAutenticacion, exigirRol('administradora'), controladorServicios.crear);
enrutador.put('/:id', verificarAutenticacion, exigirRol('administradora'), controladorServicios.editar);
enrutador.delete(
  '/:id',
  verificarAutenticacion,
  exigirRol('administradora'),
  controladorServicios.desactivar,
);

export default enrutador;
