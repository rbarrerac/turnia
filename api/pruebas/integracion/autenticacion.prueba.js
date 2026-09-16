/**
 * Módulo: Pruebas de integración de /api/autenticacion
 * Proyecto: Turnia
 * Autor: Luis
 * Fecha de creación: 15/09/2026
 */

import request from 'supertest';
import aplicacion from '../../src/aplicacion.js';
import prisma from '../../src/configuracion/baseDeDatos.js';

const CORREO_PRUEBA = 'prueba.autenticacion@turnia.gt';
const CONTRASENA_VALIDA = 'ClaveSegura123';

beforeAll(async () => {
  await prisma.usuarios.deleteMany({ where: { correo: CORREO_PRUEBA } });
});

afterAll(async () => {
  await prisma.usuarios.deleteMany({ where: { correo: CORREO_PRUEBA } });
  await prisma.$disconnect();
});

describe('POST /api/autenticacion/registro', () => {
  test('registra una clienta nueva y responde 201', async () => {
    const respuesta = await request(aplicacion).post('/api/autenticacion/registro').send({
      nombre: 'Clienta de Prueba',
      correo: CORREO_PRUEBA,
      telefono: '12345678',
      contrasena: CONTRASENA_VALIDA,
    });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.exito).toBe(true);
    expect(respuesta.body.datos.correo).toBe(CORREO_PRUEBA);
    expect(respuesta.body.datos.rol).toBe('clienta');
    expect(respuesta.body.datos.contrasena_hash).toBeUndefined();
  });

  test('rechaza un registro con correo duplicado y responde 409', async () => {
    const respuesta = await request(aplicacion).post('/api/autenticacion/registro').send({
      nombre: 'Clienta Duplicada',
      correo: CORREO_PRUEBA,
      telefono: '12345678',
      contrasena: CONTRASENA_VALIDA,
    });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body.exito).toBe(false);
    expect(respuesta.body.error.codigo).toBe('CORREO_DUPLICADO');
  });

  test('rechaza un registro con contraseña corta y responde 400', async () => {
    const respuesta = await request(aplicacion).post('/api/autenticacion/registro').send({
      nombre: 'Clienta Inválida',
      correo: 'correo.no.usado@turnia.gt',
      telefono: '12345678',
      contrasena: '123',
    });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.exito).toBe(false);
    expect(respuesta.body.error.codigo).toBe('DATOS_INVALIDOS');
  });
});

describe('POST /api/autenticacion/inicio-sesion', () => {
  test('inicia sesión con credenciales correctas y responde 200 con un token', async () => {
    const respuesta = await request(aplicacion).post('/api/autenticacion/inicio-sesion').send({
      correo: CORREO_PRUEBA,
      contrasena: CONTRASENA_VALIDA,
    });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.exito).toBe(true);
    expect(typeof respuesta.body.datos.token).toBe('string');
    expect(respuesta.body.datos.usuario.correo).toBe(CORREO_PRUEBA);
  });

  test('rechaza el inicio de sesión con contraseña incorrecta y responde 401', async () => {
    const respuesta = await request(aplicacion).post('/api/autenticacion/inicio-sesion').send({
      correo: CORREO_PRUEBA,
      contrasena: 'ClaveIncorrecta123',
    });

    expect(respuesta.status).toBe(401);
    expect(respuesta.body.exito).toBe(false);
    expect(respuesta.body.error.codigo).toBe('CREDENCIALES_INVALIDAS');
  });
});

describe('GET /api/autenticacion/perfil', () => {
  test('rechaza el acceso sin token y responde 401', async () => {
    const respuesta = await request(aplicacion).get('/api/autenticacion/perfil');

    expect(respuesta.status).toBe(401);
    expect(respuesta.body.exito).toBe(false);
  });

  test('devuelve el perfil cuando el token es válido', async () => {
    const respuestaInicioSesion = await request(aplicacion).post('/api/autenticacion/inicio-sesion').send({
      correo: CORREO_PRUEBA,
      contrasena: CONTRASENA_VALIDA,
    });
    const { token } = respuestaInicioSesion.body.datos;

    const respuesta = await request(aplicacion)
      .get('/api/autenticacion/perfil')
      .set('Authorization', `Bearer ${token}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.datos.correo).toBe(CORREO_PRUEBA);
  });
});
