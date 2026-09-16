/**
<<<<<<< Updated upstream
 * Módulo: Contexto global de sesión (usuaria autenticada)
=======
 * Módulo: Contexto global de sesión (usuario autenticado)
>>>>>>> Stashed changes
 * Proyecto: Turnia
 * Autor: Luis
 * Fecha de creación: 15/09/2026
 */

import { createContext, useContext, useState } from 'react';
<<<<<<< Updated upstream

const ContextoAutenticacion = createContext(null);

export function ProveedorAutenticacion({ children }) {
  const [usuaria, setUsuaria] = useState(null);

  function iniciarSesion(_credenciales) {
    // Pendiente de implementar.
  }

  function cerrarSesion() {
    // Pendiente de implementar.
  }

  const valor = { usuaria, iniciarSesion, cerrarSesion };
=======
import * as clienteApi from '../api/clienteApi.js';

const CLAVE_TOKEN = 'turnia_token';
const CLAVE_USUARIO = 'turnia_usuario';

const ContextoAutenticacion = createContext(null);

function leerUsuarioGuardado() {
  try {
    const guardado = localStorage.getItem(CLAVE_USUARIO);
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}

function leerTokenGuardado() {
  try {
    return localStorage.getItem(CLAVE_TOKEN);
  } catch {
    return null;
  }
}

export function ProveedorAutenticacion({ children }) {
  const [usuario, setUsuario] = useState(leerUsuarioGuardado);
  const [token, setToken] = useState(leerTokenGuardado);

  function guardarSesion(nuevoToken, nuevoUsuario) {
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
    try {
      localStorage.setItem(CLAVE_TOKEN, nuevoToken);
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(nuevoUsuario));
    } catch {
      // El almacenamiento local no está disponible; la sesión no persiste al recargar.
    }
  }

  async function iniciarSesion(correo, contrasena) {
    const respuesta = await clienteApi.enviar('/autenticacion/inicio-sesion', { correo, contrasena });
    guardarSesion(respuesta.datos.token, respuesta.datos.usuario);
    return respuesta.datos.usuario;
  }

  async function registrar(nombre, correo, telefono, contrasena) {
    const respuesta = await clienteApi.enviar('/autenticacion/registro', {
      nombre,
      correo,
      telefono,
      contrasena,
    });
    return respuesta.datos;
  }

  function cerrarSesion() {
    setToken(null);
    setUsuario(null);
    try {
      localStorage.removeItem(CLAVE_TOKEN);
      localStorage.removeItem(CLAVE_USUARIO);
    } catch {
      // El almacenamiento local no está disponible.
    }
  }

  const valor = { usuario, token, iniciarSesion, registrar, cerrarSesion };
>>>>>>> Stashed changes

  return <ContextoAutenticacion.Provider value={valor}>{children}</ContextoAutenticacion.Provider>;
}

export function useAutenticacion() {
  return useContext(ContextoAutenticacion);
}

export default ContextoAutenticacion;
