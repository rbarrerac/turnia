/**
 * Módulo: Tarjeta que muestra un servicio del catálogo
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 17/09/2026
 */

import { Link } from 'react-router-dom';

function formatearDuracion(minutos) {
  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;

  if (horas === 0) return `${minutosRestantes} min`;
  if (minutosRestantes === 0) return `${horas} h`;
  return `${horas} h ${minutosRestantes} min`;
}

function formatearPrecio(precio) {
  return `Q${Number(precio).toFixed(2)}`;
}

function TarjetaServicio({ servicio }) {
  return (
    <div className="flex flex-col justify-between h-full p-4 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-lg dark:border-gray-700 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{servicio.nombre}</h3>
        {servicio.descripcion && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{servicio.descripcion}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-sm">
          <span className="text-gray-600 dark:text-gray-300">{formatearDuracion(servicio.duracion_minutos)}</span>
          <span className="font-semibold text-gray-800 dark:text-gray-100">{formatearPrecio(servicio.precio)}</span>
        </div>
      </div>
      <Link
        to={`/reservar/${servicio.id}`}
        className="inline-block px-4 py-2 mt-4 text-sm font-medium text-center text-white bg-pink-600 rounded hover:bg-pink-700"
      >
        Reservar
      </Link>
    </div>
  );
}

export default TarjetaServicio;
