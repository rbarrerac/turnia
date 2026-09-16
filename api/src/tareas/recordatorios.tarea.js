/**
 * Módulo: Tarea cron — envía recordatorios 24 h antes de cada cita confirmada
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 15/09/2026
 */

import cron from 'node-cron';

export function iniciarTareaRecordatorios() {
  // Pendiente de implementar (RN-06): tarea diaria que busca citas confirmadas
  // que inician en 24 h y envía el recordatorio vía GestorDeNotificaciones.
  return cron.schedule('0 8 * * *', () => {
    console.log('Tarea de recordatorios: pendiente de implementar.');
  }, { scheduled: false });
}

export default iniciarTareaRecordatorios;
