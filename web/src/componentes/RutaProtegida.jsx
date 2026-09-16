/**
 * Módulo: Envoltorio de ruta que exige sesión iniciada (y opcionalmente un rol)
 * Proyecto: Turnia
 * Autor: Luis
 * Fecha de creación: 15/09/2026
 */

function RutaProtegida({ children, rolRequerido }) {
  // Pendiente de implementar: validar sesión con ContextoAutenticacion y redirigir si no aplica.
  return children;
}

export default RutaProtegida;
