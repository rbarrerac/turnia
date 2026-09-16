/**
 * Módulo: Rutas de usuarios — /api/usuarios
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 15/09/2026
 */

import { Router } from 'express';
import * as controladorUsuarios from '../controladores/usuarios.controlador.js';
import { verificarAutenticacion } from '../middlewares/autenticacion.js';
import { verificarRol } from '../middlewares/autorizacion.js';

const enrutador = Router();

enrutador.get('/', verificarAutenticacion, verificarRol('administradora'), controladorUsuarios.listar);

export default enrutador;
