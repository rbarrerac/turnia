/**
 * Módulo: Barra de navegación principal
 * Proyecto: Turnia
 * Autor: Luis
 * Fecha de creación: 15/09/2026
 */

<<<<<<< Updated upstream
function BarraNavegacion() {
  return (
    <nav className="p-4 bg-white shadow">
      <span className="font-semibold">Turnia</span>
=======
import { Link, useNavigate } from 'react-router-dom';
import { useAutenticacion } from '../contexto/ContextoAutenticacion.jsx';

function BarraNavegacion() {
  const { usuario, cerrarSesion } = useAutenticacion();
  const navegar = useNavigate();

  function manejarCerrarSesion() {
    cerrarSesion();
    navegar('/');
  }

  return (
    <nav className="flex flex-wrap items-center justify-between gap-2 bg-white px-4 py-3 shadow">
      <Link to="/" className="text-lg font-semibold text-pink-600">
        Turnia
      </Link>

      <div className="flex items-center gap-4 text-sm">
        {usuario ? (
          <>
            <span className="text-gray-700">Hola, {usuario.nombre}</span>
            <button
              type="button"
              onClick={manejarCerrarSesion}
              className="font-medium text-pink-600 hover:underline"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/inicio-sesion" className="font-medium text-gray-700 hover:text-pink-600">
              Iniciar sesión
            </Link>
            <Link to="/registro" className="font-medium text-pink-600 hover:underline">
              Registrarse
            </Link>
          </>
        )}
      </div>
>>>>>>> Stashed changes
    </nav>
  );
}

export default BarraNavegacion;
