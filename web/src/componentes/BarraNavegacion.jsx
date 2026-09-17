/**
 * Módulo: Barra de navegación principal
 * Proyecto: Turnia
 * Autor: Luis
 * Fecha de creación: 18/09/2026
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAutenticacion } from '../contexto/ContextoAutenticacion.jsx';

function BarraNavegacion() {
  const { usuario, cerrarSesion } = useAutenticacion() ?? {};
  const navegar = useNavigate();

  function manejarCerrarSesion() {
    cerrarSesion();
    navegar('/');
  }

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white shadow">
      <Link to="/" className="font-semibold text-gray-800">
        Turnia
      </Link>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <Link to="/servicios" className="text-gray-600 hover:text-pink-600">
          Servicios
        </Link>
        {usuario?.rol === 'administradora' && (
          <Link to="/admin/servicios" className="text-gray-600 hover:text-pink-600">
            Gestión de servicios
          </Link>
        )}
        {usuario ? (
          <>
            <span className="text-gray-500">Hola, {usuario.nombre}</span>
            <button
              type="button"
              onClick={manejarCerrarSesion}
              className="text-gray-600 hover:text-pink-600"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/inicio-sesion" className="text-gray-600 hover:text-pink-600">
              Iniciar sesión
            </Link>
            <Link
              to="/registro"
              className="px-3 py-1 text-white bg-pink-600 rounded hover:bg-pink-700"
            >
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default BarraNavegacion;
