/**
 * Módulo: Envoltorio de ruta que exige sesión iniciada (y opcionalmente un rol)
 * Proyecto: Turnia
 * Autor: Luis
 * Fecha de creación: 18/09/2026
 */

import { Navigate } from 'react-router-dom';
import { useAutenticacion } from '../contexto/ContextoAutenticacion.jsx';

function RutaProtegida({ children, rolRequerido }) {
  const { usuario, cargando } = useAutenticacion();

  if (cargando) {
    return <div className="p-8 text-gray-500">Cargando...</div>;
  }

  if (!usuario) {
    return <Navigate to="/inicio-sesion" replace />;
  }

  if (rolRequerido && usuario.rol !== rolRequerido) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RutaProtegida;
