/**
 * Módulo: Utilidades de cálculo de fechas y rangos horarios
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 18/09/2026
 */

const MILISEGUNDOS_POR_MINUTO = 60000;

export function calcularFin(iniciaEn, duracionMinutos) {
  return new Date(new Date(iniciaEn).getTime() + duracionMinutos * MILISEGUNDOS_POR_MINUTO);
}

export function generarIntervalos(horaInicio, horaFin, duracionMinutos) {
  const intervalos = [];
  const finJornada = new Date(horaFin).getTime();
  let inicioCandidato = new Date(horaInicio).getTime();

  while (inicioCandidato + duracionMinutos * MILISEGUNDOS_POR_MINUTO <= finJornada) {
    intervalos.push(new Date(inicioCandidato));
    inicioCandidato += duracionMinutos * MILISEGUNDOS_POR_MINUTO;
  }

  return intervalos;
}

export function haySuperposicion(inicioA, finA, inicioB, finB) {
  return new Date(inicioA).getTime() < new Date(finB).getTime()
    && new Date(inicioB).getTime() < new Date(finA).getTime();
}
