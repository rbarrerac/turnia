/**
 * Módulo: Pruebas de integración de /api/autenticacion
 * Proyecto: Turnia
 * Autor: Luis
 * Fecha de creación: 18/09/2026
 */

import request from 'supertest';
import aplicacion from '../../src/aplicacion.js';
import prisma from '../../src/configuracion/baseDeDatos.js';

const MARCA_DE_TIEMPO = Date.now();
const CORREO_NUEVO = `clienta.prueba.${MARCA_DE_TIEMPO}@turnia.gt`;
const CORREO_DUPLICADO = `clienta.duplicada.${MARCA_DE_TIEMPO}@turnia.gt`;
const CONTRASENA_VALIDA = 'ClaveSegura123';

const correosDeUsuariosCreados = [CORREO_NUEVO, CORREO_DUPLICADO];

afterAll(async () => {
  await prisma.usuarios.deleteMany({ where: { correo: { in: correosDeUsuariosCreados } } });
  await prisma.$disconnect();
});

describe('POST /api/autenticacion/registro', () => {
  test('registrar una usuaria nueva devuelve 201 y el usuario sin contrasena_hash', async () => {
    const respuesta = await request(aplicacion).post('/api/autenticacion/registro').send({
      nombre: 'Clienta de prueba',
      correo: CORREO_NUEVO,
      telefono: '12345678',
      contrasena: CONTRASENA_VALIDA,
    });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.exito).toBe(true);
    expect(respuesta.body.datos.correo).toBe(CORREO_NUEVO);
    expect(respuesta.body.datos.rol).toBe('clienta');
    expect(respuesta.body.datos.contrasena_hash).toBeUndefined();
  });

  test('registrar con correo duplicado devuelve 409', async () => {
    await request(aplicacion).post('/api/autenticacion/registro').send({
      nombre: 'Primera Clienta',
      correo: CORREO_DUPLICADO,
      contrasena: CONTRASENA_VALIDA,
    });

    const respuesta = await request(aplicacion).post('/api/autenticacion/registro').send({
      nombre: 'Segunda Clienta',
      correo: CORREO_DUPLICADO,
      contrasena: CONTRASENA_VALIDA,
    });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body.exito).toBe(false);
    expect(respuesta.body.error.codigo).toBe('CORREO_DUPLICADO');
  });

  test('registrar con contraseña corta devuelve 400', async () => {
    const respuesta = await request(aplicacion).post('/api/autenticacion/registro').send({
      nombre: 'Clienta con clave corta',
      correo: `clienta.clave.corta.${MARCA_DE_TIEMPO}@turnia.gt`,
      contrasena: '123',
    });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.exito).toBe(false);
    expect(respuesta.body.error.codigo).toBe('DATOS_INVALIDOS');
  });
});

describe('POST /api/autenticacion/inicio-sesion', () => {
  test('iniciar sesión con credenciales correctas devuelve 200 y un token', async () => {
    const respuesta = await request(aplicacion).post('/api/autenticacion/inicio-sesion').send({
      correo: CORREO_NUEVO,
      contrasena: CONTRASENA_VALIDA,
    });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.exito).toBe(true);
    expect(typeof respuesta.body.datos.token).toBe('string');
    expect(respuesta.body.datos.token.length).toBeGreaterThan(0);
    expect(respuesta.body.datos.usuario.correo).toBe(CORREO_NUEVO);
    expect(respuesta.body.datos.usuario.contrasena_hash).toBeUndefined();
  });

  test('iniciar sesión con contraseña incorrecta devuelve 401', async () => {
    const respuesta = await request(aplicacion).post('/api/autenticacion/inicio-sesion').send({
      correo: CORREO_NUEVO,
      contrasena: 'ContrasenaIncorrecta1',
    });

    expect(respuesta.status).toBe(401);
    expect(respuesta.body.exito).toBe(false);
    expect(respuesta.body.error.codigo).toBe('CREDENCIALES_INVALIDAS');
  });
});

describe('GET /api/autenticacion/perfil', () => {
  test('acceder sin token devuelve 401', async () => {
    const respuesta = await request(aplicacion).get('/api/autenticacion/perfil');

    expect(respuesta.status).toBe(401);
    expect(respuesta.body.exito).toBe(false);
  });

  test('acceder con un token válido devuelve el perfil de la usuaria', async () => {
    const inicioSesion = await request(aplicacion).post('/api/autenticacion/inicio-sesion').send({
      correo: CORREO_NUEVO,
      contrasena: CONTRASENA_VALIDA,
    });
    const token = inicioSesion.body.datos.token;

    const respuesta = await request(aplicacion)
      .get('/api/autenticacion/perfil')
      .set('Authorization', `Bearer ${token}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.datos.correo).toBe(CORREO_NUEVO);
  });
});
