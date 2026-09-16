/**
 * Módulo: Configuración global de Jest — carga las variables de entorno de pruebas
 * Proyecto: Turnia
 * Autor: Luis
 * Fecha de creación: 15/09/2026
 */

import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directorioActual = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.resolve(directorioActual, '../.env.prueba') });
