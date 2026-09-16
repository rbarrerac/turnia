/**
 * Módulo: Envoltorio de ruta que exige sesión iniciada (y opcionalmente un rol)
 * Proyecto: Turnia
 * Autor: Luis
 * Fecha de creación: 15/09/2026
 */

<<<<<<< Updated upstream
function RutaProtegida({ children, rolRequerido }) {
  // Pendiente de implementar: validar sesión con ContextoAutenticacion y redirigir si no aplica.
=======
import { Navigate } from 'react-router-dom';
import { useAutenticacion } from '../contexto/ContextoAutenticacion.jsx';

function RutaProtegida({ children, rolRequerido }) {
  const { usuario } = useAutenticacion();

  if (!usuario) {
    return <Navigate to="/inicio-sesion" replace />;
  }

  if (rolRequerido && usuario.rol !== rolRequerido) {
    return <Navigate to="/" replace />;
  }

>>>>>>> Stashed changes
  return children;
}

export default RutaProtegida;
