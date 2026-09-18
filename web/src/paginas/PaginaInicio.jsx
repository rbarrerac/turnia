/**
 * Módulo: Página de inicio — bienvenida pública del salón
 * Proyecto: Turnia
 * Autor: Luis
 * Fecha de creación: 18/09/2026
 */

import { Link } from 'react-router-dom';
import { useAutenticacion } from '../contexto/ContextoAutenticacion.jsx';

function PaginaInicio() {
  const { usuario } = useAutenticacion() ?? {};
  const destinoReservar = usuario ? '/servicios' : '/inicio-sesion';

  return (
    <div className="px-4 py-10 mx-auto max-w-4xl">
      <section className="text-center">
        <p className="text-sm font-medium tracking-widest text-pink-600 uppercase dark:text-pink-400">
          Bienvenida a
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-800 sm:text-4xl dark:text-gray-100">
          Bella Aurora — Estudio de Belleza
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Haz tu cita aquí:</p>
        <Link
          to={destinoReservar}
          className="inline-block px-6 py-3 mt-4 font-medium text-white bg-pink-600 rounded-lg shadow hover:bg-pink-700"
        >
          Reservar cita
        </Link>

        {!usuario && (
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/inicio-sesion" className="text-pink-600 hover:underline dark:text-pink-400">
              Inicia sesión
            </Link>{' '}
            o{' '}
            <Link to="/registro" className="text-pink-600 hover:underline dark:text-pink-400">
              regístrate
            </Link>
            .
          </p>
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 mt-12 sm:grid-cols-2">
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Quién te atiende</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            <span className="font-medium">Aurora Marroquín</span>, 34 años, técnica en uñas con 10
            años de experiencia. Especialista en nail art y uñas acrílicas.
          </p>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Mis trabajos</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            Conoce algunos de los diseños y trabajos que hemos hecho para nuestras clientas.
          </p>
          <Link
            to="/trabajos"
            className="inline-block px-4 py-2 mt-4 text-sm font-medium text-pink-700 border border-pink-300 rounded hover:bg-pink-50 dark:text-pink-300 dark:border-pink-700 dark:hover:bg-gray-700"
          >
            Ver galería
          </Link>
        </div>
      </section>
    </div>
  );
}

export default PaginaInicio;
