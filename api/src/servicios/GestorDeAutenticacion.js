/**
 * Módulo: GestorDeAutenticacion — registro e inicio de sesión de usuarias
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 15/09/2026
 */

import bcrypt from 'bcrypt';
import prisma from '../configuracion/baseDeDatos.js';
import { generarToken } from '../utilidades/generadorDeTokens.js';
import { esCorreoValido, esContrasenaValida } from '../utilidades/validadores.js';
import { crearErrorHttp } from '../utilidades/erroresHttp.js';

const RONDAS_SAL = 10;

function omitirContrasena(usuario) {
  const { contrasena_hash, ...resto } = usuario;
  return resto;
}

class GestorDeAutenticacion {
  async registrar(nombre, correo, telefono, contrasena) {
    if (!esCorreoValido(correo) || !esContrasenaValida(contrasena)) {
      throw crearErrorHttp(
        400,
        'DATOS_INVALIDOS',
        'El correo debe tener un formato válido y la contraseña debe tener al menos 8 caracteres.',
      );
    }

    const usuarioExistente = await prisma.usuarios.findUnique({ where: { correo } });
    if (usuarioExistente) {
      throw crearErrorHttp(409, 'CORREO_DUPLICADO', 'Ya existe una usuaria registrada con ese correo.');
    }

    const contrasenaHash = await bcrypt.hash(contrasena, RONDAS_SAL);

    const usuario = await prisma.usuarios.create({
      data: {
        nombre,
        correo,
        telefono,
        contrasena_hash: contrasenaHash,
        rol: 'clienta',
      },
    });

    return omitirContrasena(usuario);
  }

  async iniciarSesion(correo, contrasena) {
    const usuario = await prisma.usuarios.findUnique({ where: { correo } });

    if (!usuario || !usuario.activo) {
      throw crearErrorHttp(401, 'CREDENCIALES_INVALIDAS', 'Correo o contraseña incorrectos.');
    }

    const coincide = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    if (!coincide) {
      throw crearErrorHttp(401, 'CREDENCIALES_INVALIDAS', 'Correo o contraseña incorrectos.');
    }

    const token = generarToken({ id: usuario.id, rol: usuario.rol });

    return { token, usuario: omitirContrasena(usuario) };
  }

  async obtenerPerfil(id) {
    const usuario = await prisma.usuarios.findUnique({ where: { id } });

    if (!usuario) {
      throw crearErrorHttp(404, 'NO_ENCONTRADO', 'Usuaria no encontrada.');
    }

    return omitirContrasena(usuario);
  }
}

export default GestorDeAutenticacion;
