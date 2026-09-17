/**
 * Módulo: GestorDeAutenticacion — registro e inicio de sesión de usuarias
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 18/09/2026
 */

import bcrypt from 'bcrypt';
import prisma from '../configuracion/baseDeDatos.js';
import { generarToken } from '../utilidades/generadorDeTokens.js';
import { esCorreoValido, esContrasenaValida } from '../utilidades/validadores.js';

const COSTE_HASH = 10;

function crearError(codigo, mensaje, codigoHttp) {
  const error = new Error(mensaje);
  error.codigo = codigo;
  error.mensaje = mensaje;
  error.codigoHttp = codigoHttp;
  return error;
}

function omitirContrasena(usuario) {
  const { contrasena_hash: _contrasenaHash, ...resto } = usuario;
  return resto;
}

class GestorDeAutenticacion {
  async registrar(nombre, correo, telefono, contrasena) {
    const errores = [];

    if (typeof nombre !== 'string' || nombre.trim().length === 0) {
      errores.push('El nombre es obligatorio.');
    }
    if (!esCorreoValido(correo)) {
      errores.push('El correo electrónico no es válido.');
    }
    if (!esContrasenaValida(contrasena)) {
      errores.push('La contraseña debe tener al menos 8 caracteres.');
    }

    if (errores.length > 0) {
      throw crearError('DATOS_INVALIDOS', errores.join(' '), 400);
    }

    const correoNormalizado = correo.trim().toLowerCase();

    const existente = await prisma.usuarios.findUnique({ where: { correo: correoNormalizado } });
    if (existente) {
      throw crearError('CORREO_DUPLICADO', 'Ya existe una cuenta registrada con ese correo.', 409);
    }

    const contrasenaHash = await bcrypt.hash(contrasena, COSTE_HASH);

    try {
      const usuario = await prisma.usuarios.create({
        data: {
          nombre: nombre.trim(),
          correo: correoNormalizado,
          telefono: telefono?.trim() || null,
          contrasena_hash: contrasenaHash,
          rol: 'clienta',
        },
      });

      return omitirContrasena(usuario);
    } catch (error) {
      if (error.code === 'P2002') {
        throw crearError('CORREO_DUPLICADO', 'Ya existe una cuenta registrada con ese correo.', 409);
      }
      throw error;
    }
  }

  async iniciarSesion(correo, contrasena) {
    if (typeof correo !== 'string' || typeof contrasena !== 'string') {
      throw crearError('CREDENCIALES_INVALIDAS', 'El correo o la contraseña son incorrectos.', 401);
    }

    const usuario = await prisma.usuarios.findUnique({
      where: { correo: correo.trim().toLowerCase() },
    });

    if (!usuario || !usuario.activo) {
      throw crearError('CREDENCIALES_INVALIDAS', 'El correo o la contraseña son incorrectos.', 401);
    }

    const coincide = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    if (!coincide) {
      throw crearError('CREDENCIALES_INVALIDAS', 'El correo o la contraseña son incorrectos.', 401);
    }

    const token = generarToken({ id: usuario.id, rol: usuario.rol });

    return { token, usuario: omitirContrasena(usuario) };
  }

  async obtenerPorId(id) {
    const usuario = await prisma.usuarios.findUnique({ where: { id } });

    if (!usuario) {
      throw crearError('USUARIO_NO_ENCONTRADO', 'La usuaria no existe.', 404);
    }

    return omitirContrasena(usuario);
  }
}

export default GestorDeAutenticacion;
