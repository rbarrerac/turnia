/**
 * Módulo: Contexto global de sesión (usuaria autenticada)
 * Proyecto: Turnia
 * Autor: Luis
 * Fecha de creación: 15/09/2026
 */

import { createContext, useContext, useState } from 'react';

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

  return <ContextoAutenticacion.Provider value={valor}>{children}</ContextoAutenticacion.Provider>;
}

export function useAutenticacion() {
  return useContext(ContextoAutenticacion);
}

export default ContextoAutenticacion;
