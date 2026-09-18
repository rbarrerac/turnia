/**
 * Módulo: Página de gestión de contenido del salón
 * Proyecto: Turnia
 * Autor: Luis
 * Fecha de creación: 18/09/2026
 *
 * Marcador de posición intencional (acordado para este incremento): la gestión
 * de contenido (catálogo/información del salón) se implementa en el Incremento 6.
 */

import { Link } from 'react-router-dom';

function PaginaContenidoAdmin() {
  return (
    <div className="px-4 py-16 mx-auto text-center max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Catálogo / Información</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-300">Próximamente: gestión de contenido.</p>
      <Link to="/admin" className="inline-block mt-6 text-pink-600 hover:underline dark:text-pink-400">
        Volver al panel
      </Link>
    </div>
  );
}

export default PaginaContenidoAdmin;
