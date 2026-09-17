/**
 * Módulo: Página de gestión (CRUD) del catálogo de servicios
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 17/09/2026
 */

import { useEffect, useState } from 'react';
import { obtener, enviar, actualizar, eliminar } from '../../api/clienteApi.js';

const FORMULARIO_VACIO = { id: null, nombre: '', descripcion: '', duracion_minutos: '', precio: '' };

function PaginaGestionServicios() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [mensajeError, setMensajeError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);

  async function cargarServicios() {
    setCargando(true);
    try {
      const respuesta = await obtener('/servicios');
      setServicios(respuesta.datos ?? []);
    } catch (error) {
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarServicios();
  }, []);

  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setFormulario((anterior) => ({ ...anterior, [name]: value }));
  }

  function editarServicio(servicio) {
    setFormulario({
      id: servicio.id,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion ?? '',
      duracion_minutos: String(servicio.duracion_minutos),
      precio: String(servicio.precio),
    });
    setMensajeError(null);
    setMensajeExito(null);
  }

  function cancelarEdicion() {
    setFormulario(FORMULARIO_VACIO);
  }

  async function manejarEnviarFormulario(evento) {
    evento.preventDefault();
    setMensajeError(null);
    setMensajeExito(null);
    setEnviando(true);

    const datos = {
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim() || null,
      duracion_minutos: Number(formulario.duracion_minutos),
      precio: Number(formulario.precio),
    };

    try {
      if (formulario.id) {
        await actualizar(`/servicios/${formulario.id}`, datos);
        setMensajeExito('Servicio actualizado correctamente.');
      } else {
        await enviar('/servicios', datos);
        setMensajeExito('Servicio creado correctamente.');
      }
      setFormulario(FORMULARIO_VACIO);
      await cargarServicios();
    } catch (error) {
      setMensajeError(error.message);
    } finally {
      setEnviando(false);
    }
  }

  async function manejarDesactivar(servicio) {
    const confirmado = window.confirm(
      `¿Desactivar "${servicio.nombre}"? Dejará de mostrarse en el catálogo.`,
    );
    if (!confirmado) return;

    setMensajeError(null);
    setMensajeExito(null);
    try {
      await eliminar(`/servicios/${servicio.id}`);
      setMensajeExito(`Servicio "${servicio.nombre}" desactivado.`);
      await cargarServicios();
    } catch (error) {
      setMensajeError(error.message);
    }
  }

  return (
    <div className="max-w-5xl px-4 py-8 mx-auto">
      <h1 className="text-2xl font-bold text-gray-800">Gestión de servicios</h1>

      {mensajeExito && (
        <p className="p-3 mt-4 text-green-800 bg-green-100 rounded">{mensajeExito}</p>
      )}
      {mensajeError && <p className="p-3 mt-4 text-red-800 bg-red-100 rounded">{mensajeError}</p>}

      <form
        onSubmit={manejarEnviarFormulario}
        className="grid grid-cols-1 gap-3 p-4 mt-6 bg-white border border-gray-200 rounded-lg sm:grid-cols-2"
      >
        <h2 className="font-semibold text-gray-700 sm:col-span-2">
          {formulario.id ? 'Editar servicio' : 'Nuevo servicio'}
        </h2>

        <label className="flex flex-col text-sm text-gray-600">
          Nombre
          <input
            name="nombre"
            value={formulario.nombre}
            onChange={manejarCambio}
            required
            className="px-2 py-1 mt-1 border border-gray-300 rounded"
          />
        </label>

        <label className="flex flex-col text-sm text-gray-600">
          Duración (minutos)
          <input
            name="duracion_minutos"
            type="number"
            min="1"
            step="1"
            value={formulario.duracion_minutos}
            onChange={manejarCambio}
            required
            className="px-2 py-1 mt-1 border border-gray-300 rounded"
          />
        </label>

        <label className="flex flex-col text-sm text-gray-600 sm:col-span-2">
          Descripción
          <textarea
            name="descripcion"
            value={formulario.descripcion}
            onChange={manejarCambio}
            rows={2}
            className="px-2 py-1 mt-1 border border-gray-300 rounded"
          />
        </label>

        <label className="flex flex-col text-sm text-gray-600">
          Precio (Q)
          <input
            name="precio"
            type="number"
            min="0"
            step="0.01"
            value={formulario.precio}
            onChange={manejarCambio}
            required
            className="px-2 py-1 mt-1 border border-gray-300 rounded"
          />
        </label>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            disabled={enviando}
            className="px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded hover:bg-pink-700 disabled:opacity-50"
          >
            {formulario.id ? 'Guardar cambios' : 'Crear servicio'}
          </button>
          {formulario.id && (
            <button
              type="button"
              onClick={cancelarEdicion}
              className="px-4 py-2 text-sm border border-gray-300 rounded"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="mt-8 overflow-x-auto">
        {cargando ? (
          <p className="text-gray-500">Cargando servicios...</p>
        ) : (
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 pr-2">Nombre</th>
                <th className="py-2 pr-2">Duración</th>
                <th className="py-2 pr-2">Precio</th>
                <th className="py-2 pr-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((servicio) => (
                <tr key={servicio.id} className="border-b border-gray-100">
                  <td className="py-2 pr-2">{servicio.nombre}</td>
                  <td className="py-2 pr-2">{servicio.duracion_minutos} min</td>
                  <td className="py-2 pr-2">Q{Number(servicio.precio).toFixed(2)}</td>
                  <td className="py-2 pr-2">
                    <div className="flex gap-3">
                      <button
                        onClick={() => editarServicio(servicio)}
                        className="text-blue-600 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => manejarDesactivar(servicio)}
                        className="text-red-600 hover:underline"
                      >
                        Desactivar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {servicios.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500">
                    No hay servicios activos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default PaginaGestionServicios;
