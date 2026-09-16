/**
 * Módulo: Rutas de horarios — /api/horarios
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 15/09/2026
 */

import { Router } from 'express';
import * as controladorHorarios from '../controladores/horarios.controlador.js';
import { verificarAutenticacion } from '../middlewares/autenticacion.js';
import { exigirRol } from '../middlewares/autorizacion.js';

const enrutador = Router();

enrutador.get('/', controladorHorarios.obtenerHorario);
enrutador.put(
  '/',
  verificarAutenticacion,
  exigirRol('administradora'),
  controladorHorarios.configurarHorario,
);
enrutador.post(
  '/dias-no-laborables',
  verificarAutenticacion,
  exigirRol('administradora'),
  controladorHorarios.agregarDiaNoLaborable,
);
enrutador.delete(
  '/dias-no-laborables/:id',
  verificarAutenticacion,
  exigirRol('administradora'),
  controladorHorarios.eliminarDiaNoLaborable,
);

export default enrutador;
