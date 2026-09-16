/**
 * Módulo: Controlador de autenticación — registro, inicio de sesión y perfil
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 15/09/2026
 */

import GestorDeAutenticacion from '../servicios/GestorDeAutenticacion.js';

const gestorDeAutenticacion = new GestorDeAutenticacion();

export async function registrar(peticion, respuesta, siguiente) {
  try {
    const { nombre, correo, telefono, contrasena } = peticion.body;
    const usuario = await gestorDeAutenticacion.registrar(nombre, correo, telefono, contrasena);
    respuesta.status(201).json({ exito: true, datos: usuario });
  } catch (error) {
    siguiente(error);
  }
}

export async function iniciarSesion(peticion, respuesta, siguiente) {
  try {
    const { correo, contrasena } = peticion.body;
    const resultado = await gestorDeAutenticacion.iniciarSesion(correo, contrasena);
    respuesta.status(200).json({ exito: true, datos: resultado });
  } catch (error) {
    siguiente(error);
  }
}

export async function obtenerPerfil(peticion, respuesta, siguiente) {
  try {
    const usuario = await gestorDeAutenticacion.obtenerPerfil(peticion.usuario.id);
    respuesta.status(200).json({ exito: true, datos: usuario });
  } catch (error) {
    siguiente(error);
  }
}
