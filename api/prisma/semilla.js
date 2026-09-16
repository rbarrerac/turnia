/**
 * Módulo: Script de semilla — carga el catálogo de servicios y la usuaria administradora
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 15/09/2026
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function principal() {
  // Pendiente de implementar: insertar el catálogo semilla (sección 9 de ARQUITECTURA.md)
  // y la usuaria administradora (correo admin@turnia.gt, contraseña vía variable de entorno).
  console.log('Semilla: pendiente de implementar.');
}

principal()
  .catch((error) => {
    console.error('Error al ejecutar la semilla:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
