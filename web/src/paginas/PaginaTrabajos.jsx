/**
 * Módulo: Página de galería de trabajos
 * Proyecto: Turnia
 * Autor: Luis
 * Fecha de creación: 18/09/2026
 *
 * Marcador de posición intencional (acordado para este incremento): el catálogo
 * con fotos de trabajos se implementa en el Incremento 6.
 */

import { Link } from 'react-router-dom';

function PaginaTrabajos() {
  return (
    <div className="px-4 py-16 mx-auto text-center max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Mis trabajos</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-300">Próximamente: galería de trabajos.</p>
      <Link to="/" className="inline-block mt-6 text-pink-600 hover:underline dark:text-pink-400">
        Volver al inicio
      </Link>
    </div>
  );
}

export default PaginaTrabajos;
