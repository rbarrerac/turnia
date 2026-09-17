/**
 * Módulo: Lista de citas de la agenda de la administradora
 * Proyecto: Turnia
 * Autor: Luis
 * Fecha de creación: 18/09/2026
 *
 * Decisión de diseño (Incremento 4, CU-08): se usa una vista de LISTA, no una
 * cuadrícula de calendario, por legibilidad con el volumen esperado de citas
 * (10–15 por día). El nombre del archivo se conserva porque así está declarado
 * en la sección 3 de ARQUITECTURA.md.
 */

const ETIQUETAS_ESTADO = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

const ESTILOS_ESTADO = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  confirmada: 'bg-blue-100 text-blue-800',
  completada: 'bg-green-100 text-green-800',
  cancelada: 'bg-gray-200 text-gray-600',
};

// RN-04 — acciones que la administradora puede tomar desde cada estado.
const ACCIONES_POR_ESTADO = {
  pendiente: [
    { estado: 'confirmada', etiqueta: 'Confirmar', estilo: 'text-blue-700 border-blue-300 hover:bg-blue-50' },
    { estado: 'cancelada', etiqueta: 'Cancelar', estilo: 'text-red-700 border-red-300 hover:bg-red-50' },
  ],
  confirmada: [
    { estado: 'completada', etiqueta: 'Completar', estilo: 'text-green-700 border-green-300 hover:bg-green-50' },
    { estado: 'cancelada', etiqueta: 'Cancelar', estilo: 'text-red-700 border-red-300 hover:bg-red-50' },
  ],
  completada: [],
  cancelada: [],
};

function formatearHora(iso) {
  const fecha = new Date(iso);
  const horas = String(fecha.getUTCHours()).padStart(2, '0');
  const minutos = String(fecha.getUTCMinutes()).padStart(2, '0');
  return `${horas}:${minutos}`;
}

function CalendarioAgenda({ citas, onCambiarEstado, actualizandoId }) {
  if (citas.length === 0) {
    return <p className="py-3 text-sm text-gray-500">No hay citas en este rango.</p>;
  }

  return (
    <ul className="space-y-2">
      {citas.map((cita) => {
        const acciones = ACCIONES_POR_ESTADO[cita.estado] ?? [];
        return (
          <li
            key={cita.id}
            className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-gray-200 rounded-lg"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-sm text-gray-700">
                {formatearHora(cita.inicia_en)}–{formatearHora(cita.termina_en)}
              </span>
              <span className="font-medium text-gray-800">{cita.clienta?.nombre ?? 'Clienta'}</span>
              <span className="text-sm text-gray-500">{cita.servicio?.nombre ?? 'Servicio'}</span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${ESTILOS_ESTADO[cita.estado] ?? ''}`}
              >
                {ETIQUETAS_ESTADO[cita.estado] ?? cita.estado}
              </span>
            </div>

            {acciones.length > 0 && (
              <div className="flex gap-2">
                {acciones.map((accion) => (
                  <button
                    key={accion.estado}
                    type="button"
                    disabled={actualizandoId === cita.id}
                    onClick={() => onCambiarEstado(cita, accion.estado)}
                    className={`px-2 py-1 text-xs border rounded disabled:opacity-50 ${accion.estilo}`}
                  >
                    {accion.etiqueta}
                  </button>
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default CalendarioAgenda;
