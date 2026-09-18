/**
 * Módulo: Aplica de forma idempotente la restricción sin_superposicion sobre citas (RN-02)
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 18/09/2026
 */

import 'dotenv/config';
import { Client } from 'pg';

async function principal() {
  const cliente = new Client({ connectionString: process.env.DATABASE_URL });
  await cliente.connect();

  try {
    console.log('Aplicando restricción "sin_superposicion" sobre la tabla citas...');

    await cliente.query('ALTER TABLE citas DROP CONSTRAINT IF EXISTS sin_superposicion;');
    await cliente.query(`
      ALTER TABLE citas ADD CONSTRAINT sin_superposicion
        EXCLUDE USING gist (
          tsrange(inicia_en, termina_en) WITH &&
        ) WHERE (estado <> 'cancelada');
    `);

    console.log('Restricción "sin_superposicion" aplicada correctamente.');
  } finally {
    await cliente.end();
  }
}

principal().catch((error) => {
  console.error('Error al aplicar la restricción sin_superposicion:', error.message);
  process.exitCode = 1;
});
