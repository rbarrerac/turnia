/**
 * Módulo: Rutas de autenticación — /api/autenticacion
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 15/09/2026
 */

import { Router } from 'express';
import * as controladorAutenticacion from '../controladores/autenticacion.controlador.js';
import { verificarAutenticacion } from '../middlewares/autenticacion.js';

const enrutador = Router();

enrutador.post('/registro', controladorAutenticacion.registrar);
enrutador.post('/inicio-sesion', controladorAutenticacion.iniciarSesion);
enrutador.get('/perfil', verificarAutenticacion, controladorAutenticacion.obtenerPerfil);

export default enrutador;
