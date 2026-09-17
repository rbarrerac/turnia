/**
 * Módulo: Pruebas de integración de /api/servicios
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 17/09/2026
 */

import request from 'supertest';
import aplicacion from '../../src/aplicacion.js';
import prisma from '../../src/configuracion/baseDeDatos.js';
import { generarToken } from '../../src/utilidades/generadorDeTokens.js';

const idsDeServiciosCreados = [];

let tokenAdministradora;
let tokenClienta;
let idServicioSemilla;

beforeAll(async () => {
  tokenAdministradora = generarToken({
    id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    nombre: 'Administradora de prueba',
    correo: 'admin.prueba@turnia.gt',
    rol: 'administradora',
  });

  tokenClienta = generarToken({
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    nombre: 'Clienta de prueba',
    correo: 'clienta.prueba@turnia.gt',
    rol: 'clienta',
  });

  // Se garantiza al menos un servicio activo, sin depender de que la semilla ya se haya ejecutado.
  const servicioSemilla = await prisma.servicios.create({
    data: {
      nombre: `Servicio semilla de prueba ${Date.now()}`,
      duracion_minutos: 30,
      precio: 50,
      activo: true,
    },
  });
  idServicioSemilla = servicioSemilla.id;
  idsDeServiciosCreados.push(servicioSemilla.id);
});

afterAll(async () => {
  if (idsDeServiciosCreados.length > 0) {
    await prisma.servicios.deleteMany({ where: { id: { in: idsDeServiciosCreados } } });
  }
  await prisma.$disconnect();
});

describe('GET /api/servicios', () => {
  test('devuelve 200 y una lista de servicios', async () => {
    const respuesta = await request(aplicacion).get('/api/servicios');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.exito).toBe(true);
    expect(Array.isArray(respuesta.body.datos)).toBe(true);
    expect(respuesta.body.datos.length).toBeGreaterThan(0);
  });

  test('devuelve el detalle de un servicio existente', async () => {
    const respuesta = await request(aplicacion).get(`/api/servicios/${idServicioSemilla}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.datos.id).toBe(idServicioSemilla);
  });

  test('con id inexistente devuelve 404', async () => {
    const respuesta = await request(aplicacion).get(
      '/api/servicios/00000000-0000-0000-0000-000000000000',
    );

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.exito).toBe(false);
    expect(respuesta.body.error.codigo).toBe('SERVICIO_NO_ENCONTRADO');
  });
});

describe('POST /api/servicios', () => {
  test('sin token devuelve 401', async () => {
    const respuesta = await request(aplicacion).post('/api/servicios').send({
      nombre: 'Servicio sin token',
      duracion_minutos: 30,
      precio: 50,
    });

    expect(respuesta.status).toBe(401);
  });

  test('con token de clienta (no administradora) devuelve 403', async () => {
    const respuesta = await request(aplicacion)
      .post('/api/servicios')
      .set('Authorization', `Bearer ${tokenClienta}`)
      .send({ nombre: 'Servicio de clienta', duracion_minutos: 30, precio: 50 });

    expect(respuesta.status).toBe(403);
  });

  test('con token de administradora y datos válidos devuelve 201', async () => {
    const respuesta = await request(aplicacion)
      .post('/api/servicios')
      .set('Authorization', `Bearer ${tokenAdministradora}`)
      .send({
        nombre: `Servicio de prueba ${Date.now()}`,
        descripcion: 'Servicio creado durante las pruebas automatizadas',
        duracion_minutos: 30,
        precio: 75.5,
      });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.exito).toBe(true);
    expect(respuesta.body.datos.activo).toBe(true);

    idsDeServiciosCreados.push(respuesta.body.datos.id);
  });

  test('con token de administradora y precio negativo devuelve 400', async () => {
    const respuesta = await request(aplicacion)
      .post('/api/servicios')
      .set('Authorization', `Bearer ${tokenAdministradora}`)
      .send({ nombre: 'Servicio inválido', duracion_minutos: 30, precio: -10 });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.exito).toBe(false);
    expect(respuesta.body.error.codigo).toBe('DATOS_INVALIDOS');
  });
});

describe('DELETE /api/servicios/:id', () => {
  test('con administradora desactiva el servicio (activo = false)', async () => {
    const creado = await request(aplicacion)
      .post('/api/servicios')
      .set('Authorization', `Bearer ${tokenAdministradora}`)
      .send({
        nombre: `Servicio a desactivar ${Date.now()}`,
        duracion_minutos: 20,
        precio: 40,
      });
    idsDeServiciosCreados.push(creado.body.datos.id);

    const respuesta = await request(aplicacion)
      .delete(`/api/servicios/${creado.body.datos.id}`)
      .set('Authorization', `Bearer ${tokenAdministradora}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.exito).toBe(true);
    expect(respuesta.body.datos.activo).toBe(false);
  });
});
