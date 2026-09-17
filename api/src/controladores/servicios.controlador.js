/**
 * Módulo: Controlador de servicios — catálogo del salón (CRUD)
 * Proyecto: Turnia
 * Autor: Luis
 * Fecha de creación: 17/09/2026
 */

import GestorDeServicios from '../servicios/GestorDeServicios.js';

const gestorDeServicios = new GestorDeServicios();

export async function listar(peticion, respuesta, siguiente) {
  try {
    const servicios = await gestorDeServicios.listarActivos();
    respuesta.json({ exito: true, datos: servicios });
  } catch (error) {
    siguiente(error);
  }
}

export async function obtenerPorId(peticion, respuesta, siguiente) {
  try {
    const servicio = await gestorDeServicios.obtenerPorId(peticion.params.id);
    respuesta.json({ exito: true, datos: servicio });
  } catch (error) {
    siguiente(error);
  }
}

export async function crear(peticion, respuesta, siguiente) {
  try {
    const servicio = await gestorDeServicios.crear(peticion.body);
    respuesta.status(201).json({ exito: true, datos: servicio });
  } catch (error) {
    siguiente(error);
  }
}

export async function editar(peticion, respuesta, siguiente) {
  try {
    const servicio = await gestorDeServicios.editar(peticion.params.id, peticion.body);
    respuesta.json({ exito: true, datos: servicio });
  } catch (error) {
    siguiente(error);
  }
}

export async function desactivar(peticion, respuesta, siguiente) {
  try {
    const servicio = await gestorDeServicios.desactivar(peticion.params.id);
    respuesta.json({ exito: true, datos: servicio });
  } catch (error) {
    siguiente(error);
  }
}
