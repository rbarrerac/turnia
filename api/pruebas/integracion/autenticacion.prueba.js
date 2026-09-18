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

describe('PATCH /api/autenticacion/perfil, /correo y /contrasena', () => {
  const correoPerfil = `clienta.perfil.${MARCA_DE_TIEMPO}@turnia.gt`;
  const correoExistente = `clienta.correo.existente.${MARCA_DE_TIEMPO}@turnia.gt`;
  const contrasenaOriginal = 'ClaveOriginal123';
  const contrasenaNueva = 'ClaveNueva456';
  let tokenPerfil;

  beforeAll(async () => {
    correosDeUsuariosCreados.push(correoPerfil, correoExistente);

    await request(aplicacion).post('/api/autenticacion/registro').send({
      nombre: 'Clienta Perfil',
      correo: correoPerfil,
      contrasena: contrasenaOriginal,
    });
    await request(aplicacion).post('/api/autenticacion/registro').send({
      nombre: 'Clienta Correo Existente',
      correo: correoExistente,
      contrasena: contrasenaOriginal,
    });

    const inicioSesion = await request(aplicacion).post('/api/autenticacion/inicio-sesion').send({
      correo: correoPerfil,
      contrasena: contrasenaOriginal,
    });
    tokenPerfil = inicioSesion.body.datos.token;
  });

  test('PATCH /perfil actualiza nombre y teléfono', async () => {
    const respuesta = await request(aplicacion)
      .patch('/api/autenticacion/perfil')
      .set('Authorization', `Bearer ${tokenPerfil}`)
      .send({ nombre: 'Clienta Perfil Actualizada', telefono: '55501234' });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.datos.nombre).toBe('Clienta Perfil Actualizada');
    expect(respuesta.body.datos.telefono).toBe('55501234');
  });

  test('PATCH /perfil sin token devuelve 401', async () => {
    const respuesta = await request(aplicacion)
      .patch('/api/autenticacion/perfil')
      .send({ nombre: 'Sin token' });

    expect(respuesta.status).toBe(401);
  });

  test('PATCH /correo a uno que ya existe devuelve 409', async () => {
    const respuesta = await request(aplicacion)
      .patch('/api/autenticacion/correo')
      .set('Authorization', `Bearer ${tokenPerfil}`)
      .send({ correoNuevo: correoExistente, contrasenaActual: contrasenaOriginal });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body.error.codigo).toBe('CORREO_DUPLICADO');
  });

  test('PATCH /contrasena con la contraseña actual incorrecta devuelve 401', async () => {
    const respuesta = await request(aplicacion)
      .patch('/api/autenticacion/contrasena')
      .set('Authorization', `Bearer ${tokenPerfil}`)
      .send({ contrasenaActual: 'ContrasenaIncorrecta', contrasenaNueva });

    expect(respuesta.status).toBe(401);
    expect(respuesta.body.error.codigo).toBe('CREDENCIALES_INVALIDAS');
  });

  test('PATCH /contrasena con la contraseña actual correcta funciona y permite iniciar sesión con la nueva', async () => {
    const respuesta = await request(aplicacion)
      .patch('/api/autenticacion/contrasena')
      .set('Authorization', `Bearer ${tokenPerfil}`)
      .send({ contrasenaActual: contrasenaOriginal, contrasenaNueva });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.exito).toBe(true);

    const inicioSesionConNueva = await request(aplicacion)
      .post('/api/autenticacion/inicio-sesion')
      .send({ correo: correoPerfil, contrasena: contrasenaNueva });

    expect(inicioSesionConNueva.status).toBe(200);
  });
});
