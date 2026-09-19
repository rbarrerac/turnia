/**
 * Módulo: Pruebas de integración de /api/trabajos y /api/contenido
 * Proyecto: Turnia
 * Autor: Luis
 * Fecha de creación: 18/09/2026
 */

import fs from 'node:fs';
import path from 'node:path';
import request from 'supertest';
import aplicacion from '../../src/aplicacion.js';
import prisma from '../../src/configuracion/baseDeDatos.js';
import { entorno } from '../../src/configuracion/entorno.js';
import { generarToken } from '../../src/utilidades/generadorDeTokens.js';

const CLAVE_CONTENIDO_PRUEBA = 'atiende_nombre';
const BUFFER_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const idsDeCategoriasCreadas = [];
const idsDeFotosCreadas = [];

let tokenAdministradora;
let tokenClienta;
let valorOriginalDeContenido;

beforeAll(async () => {
  tokenAdministradora = generarToken({
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    nombre: 'Administradora de prueba (galería)',
    correo: 'admin.galeria@turnia.gt',
    rol: 'administradora',
  });

  tokenClienta = generarToken({
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    nombre: 'Clienta de prueba (galería)',
    correo: 'clienta.galeria@turnia.gt',
    rol: 'clienta',
  });

  const filaOriginal = await prisma.contenido_sitio.findUnique({
    where: { clave: CLAVE_CONTENIDO_PRUEBA },
  });
  valorOriginalDeContenido = filaOriginal?.valor ?? null;
});

afterAll(async () => {
  if (idsDeFotosCreadas.length > 0) {
    const fotos = await prisma.fotos_galeria.findMany({ where: { id: { in: idsDeFotosCreadas } } });
    for (const foto of fotos) {
      const ruta = path.join(entorno.directorioSubidas, foto.archivo);
      if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
    }
    await prisma.fotos_galeria.deleteMany({ where: { id: { in: idsDeFotosCreadas } } });
  }

  if (idsDeCategoriasCreadas.length > 0) {
    await prisma.categorias_galeria.deleteMany({ where: { id: { in: idsDeCategoriasCreadas } } });
  }

  if (valorOriginalDeContenido !== null) {
    await prisma.contenido_sitio.update({
      where: { clave: CLAVE_CONTENIDO_PRUEBA },
      data: { valor: valorOriginalDeContenido },
    });
  } else {
    await prisma.contenido_sitio.deleteMany({ where: { clave: CLAVE_CONTENIDO_PRUEBA } });
  }

  await prisma.$disconnect();
});

describe('GET /api/trabajos', () => {
  test('público devuelve 200 y la estructura de categorías con fotos', async () => {
    const categoria = await prisma.categorias_galeria.create({
      data: { nombre: `Categoría de prueba ${Date.now()}` },
    });
    idsDeCategoriasCreadas.push(categoria.id);

    const respuesta = await request(aplicacion).get('/api/trabajos');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.exito).toBe(true);
    expect(Array.isArray(respuesta.body.datos)).toBe(true);

    const encontrada = respuesta.body.datos.find((c) => c.id === categoria.id);
    expect(encontrada).toBeDefined();
    expect(Array.isArray(encontrada.fotos)).toBe(true);
    expect(encontrada.fotos.length).toBe(0);
  });
});

describe('POST /api/trabajos/categorias', () => {
  test('con administradora crea la categoría (201)', async () => {
    const respuesta = await request(aplicacion)
      .post('/api/trabajos/categorias')
      .set('Authorization', `Bearer ${tokenAdministradora}`)
      .send({ nombre: `Categoría admin ${Date.now()}` });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.exito).toBe(true);
    expect(respuesta.body.datos.activo).toBe(true);
    idsDeCategoriasCreadas.push(respuesta.body.datos.id);
  });

  test('con clienta (no administradora) devuelve 403', async () => {
    const respuesta = await request(aplicacion)
      .post('/api/trabajos/categorias')
      .set('Authorization', `Bearer ${tokenClienta}`)
      .send({ nombre: `Categoría de clienta ${Date.now()}` });

    expect(respuesta.status).toBe(403);
  });

  test('sin token devuelve 401', async () => {
    const respuesta = await request(aplicacion)
      .post('/api/trabajos/categorias')
      .send({ nombre: `Categoría sin token ${Date.now()}` });

    expect(respuesta.status).toBe(401);
  });
});

describe('POST /api/trabajos (subir foto)', () => {
  let categoriaId;

  beforeAll(async () => {
    const categoria = await prisma.categorias_galeria.create({
      data: { nombre: `Categoría para fotos ${Date.now()}` },
    });
    categoriaId = categoria.id;
    idsDeCategoriasCreadas.push(categoriaId);
  });

  test('con administradora sube la foto (201) y queda accesible en /archivos', async () => {
    const respuesta = await request(aplicacion)
      .post('/api/trabajos')
      .set('Authorization', `Bearer ${tokenAdministradora}`)
      .field('categoria_id', categoriaId)
      .field('titulo', 'Foto de prueba')
      .attach('archivo', BUFFER_PNG, 'foto.png');

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.exito).toBe(true);
    expect(respuesta.body.datos.categoria_id).toBe(categoriaId);
    expect(respuesta.body.datos.titulo).toBe('Foto de prueba');
    idsDeFotosCreadas.push(respuesta.body.datos.id);

    const rutaArchivo = path.join(entorno.directorioSubidas, respuesta.body.datos.archivo);
    expect(fs.existsSync(rutaArchivo)).toBe(true);

    const respuestaArchivo = await request(aplicacion).get(
      `/archivos/trabajos/${respuesta.body.datos.archivo}`,
    );
    expect(respuestaArchivo.status).toBe(200);
  });

  test('con un tipo de archivo no permitido devuelve 400 ARCHIVO_INVALIDO', async () => {
    const respuesta = await request(aplicacion)
      .post('/api/trabajos')
      .set('Authorization', `Bearer ${tokenAdministradora}`)
      .field('categoria_id', categoriaId)
      .attach('archivo', Buffer.from('esto no es una imagen'), 'malo.gif');

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.exito).toBe(false);
    expect(respuesta.body.error.codigo).toBe('ARCHIVO_INVALIDO');
  });

  test('sin token devuelve 401', async () => {
    const respuesta = await request(aplicacion)
      .post('/api/trabajos')
      .field('categoria_id', categoriaId)
      .attach('archivo', BUFFER_PNG, 'foto2.png');

    expect(respuesta.status).toBe(401);
  });
});

describe('DELETE /api/trabajos/:id (eliminar foto)', () => {
  test('elimina el registro y el archivo físico del disco', async () => {
    const categoria = await prisma.categorias_galeria.create({
      data: { nombre: `Categoría para eliminar foto ${Date.now()}` },
    });
    idsDeCategoriasCreadas.push(categoria.id);

    const subida = await request(aplicacion)
      .post('/api/trabajos')
      .set('Authorization', `Bearer ${tokenAdministradora}`)
      .field('categoria_id', categoria.id)
      .attach('archivo', BUFFER_PNG, 'foto3.png');

    expect(subida.status).toBe(201);
    const rutaArchivo = path.join(entorno.directorioSubidas, subida.body.datos.archivo);
    expect(fs.existsSync(rutaArchivo)).toBe(true);

    const respuesta = await request(aplicacion)
      .delete(`/api/trabajos/${subida.body.datos.id}`)
      .set('Authorization', `Bearer ${tokenAdministradora}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.exito).toBe(true);
    expect(fs.existsSync(rutaArchivo)).toBe(false);

    const enBaseDeDatos = await prisma.fotos_galeria.findUnique({
      where: { id: subida.body.datos.id },
    });
    expect(enBaseDeDatos).toBeNull();
  });
});

describe('GET /api/contenido', () => {
  test('público devuelve 200 y un objeto de contenido', async () => {
    const respuesta = await request(aplicacion).get('/api/contenido');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.exito).toBe(true);
    expect(typeof respuesta.body.datos).toBe('object');
    expect(respuesta.body.datos).not.toBeNull();
  });
});

describe('PUT /api/contenido', () => {
  test('con administradora actualiza el contenido y lo refleja en una consulta posterior', async () => {
    const nuevoValor = `Valor de prueba ${Date.now()}`;

    const respuesta = await request(aplicacion)
      .put('/api/contenido')
      .set('Authorization', `Bearer ${tokenAdministradora}`)
      .send({ [CLAVE_CONTENIDO_PRUEBA]: nuevoValor });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.exito).toBe(true);
    expect(respuesta.body.datos[CLAVE_CONTENIDO_PRUEBA]).toBe(nuevoValor);

    const consulta = await request(aplicacion).get('/api/contenido');
    expect(consulta.body.datos[CLAVE_CONTENIDO_PRUEBA]).toBe(nuevoValor);
  });

  test('con clienta (no administradora) devuelve 403', async () => {
    const respuesta = await request(aplicacion)
      .put('/api/contenido')
      .set('Authorization', `Bearer ${tokenClienta}`)
      .send({ [CLAVE_CONTENIDO_PRUEBA]: 'no debería aplicarse' });

    expect(respuesta.status).toBe(403);
  });
});
