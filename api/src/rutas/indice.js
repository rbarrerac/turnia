/**
 * Módulo: Enrutador principal — monta todas las sub-rutas bajo /api
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 15/09/2026
 */

import { Router } from 'express';
import enrutadorAutenticacion from './autenticacion.rutas.js';
import enrutadorServicios from './servicios.rutas.js';
import enrutadorCitas from './citas.rutas.js';
import enrutadorHorarios from './horarios.rutas.js';
import enrutadorUsuarios from './usuarios.rutas.js';

const enrutador = Router();

enrutador.get('/salud', (peticion, respuesta) => {
  respuesta.json({ exito: true, datos: { estado: 'activo' } });
});

enrutador.use('/autenticacion', enrutadorAutenticacion);
enrutador.use('/servicios', enrutadorServicios);
enrutador.use('/citas', enrutadorCitas);
enrutador.use('/horarios', enrutadorHorarios);
enrutador.use('/usuarios', enrutadorUsuarios);

export default enrutador;
