/**
 * Módulo: Pruebas unitarias de GestorDeReservas
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 18/09/2026
 */

import GestorDeReservas from '../../src/servicios/GestorDeReservas.js';
import prisma from '../../src/configuracion/baseDeDatos.js';

const gestor = new GestorDeReservas();

function proximoDiaSemana(diaSemanaDeseado, diasMinimos = 1) {
  const hoy = new Date();
  const hoyUtc = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate()));
  let candidato = new Date(hoyUtc.getTime() + diasMinimos * 24 * 60 * 60 * 1000);
  while (candidato.getUTCDay() !== diaSemanaDeseado) {
    candidato = new Date(candidato.getTime() + 24 * 60 * 60 * 1000);
  }
  return candidato;
}

function horaEn(fechaUtc, horas, minutos = 0) {
  return new Date(Date.UTC(
    fechaUtc.getUTCFullYear(),
    fechaUtc.getUTCMonth(),
    fechaUtc.getUTCDate(),
    horas,
    minutos,
  ));
}

// Lunes de la próxima semana: día laborable garantizado por la semilla (lun–sáb 9:00–18:00).
const diaLaborable = proximoDiaSemana(1, 1);
// Martes distinto, usado solo para la prueba de día no laborable (no interfiere con el lunes).
const diaParaBloquear = proximoDiaSemana(2, 1);

let servicioPrueba;
let clientaA;
let clientaB;
const idsDeCitasCreadas = [];

beforeAll(async () => {
  servicioPrueba = await prisma.servicios.create({
    data: {
      nombre: `Servicio de prueba GestorDeReservas ${Date.now()}`,
      duracion_minutos: 30,
      precio: 10,
      activo: true,
    },
  });

  clientaA = await prisma.usuarios.create({
    data: {
      nombre: 'Clienta A de prueba',
      correo: `clienta.a.reservas.${Date.now()}@turnia.gt`,
      contrasena_hash: 'hash-no-usado-en-esta-prueba',
      rol: 'clienta',
    },
  });

  clientaB = await prisma.usuarios.create({
    data: {
      nombre: 'Clienta B de prueba',
      correo: `clienta.b.reservas.${Date.now()}@turnia.gt`,
      contrasena_hash: 'hash-no-usado-en-esta-prueba',
      rol: 'clienta',
    },
  });

  await prisma.dias_no_laborables.create({
    data: { fecha: diaParaBloquear, motivo: 'Bloqueado por prueba automatizada' },
  });
});

afterAll(async () => {
  const idsValidos = idsDeCitasCreadas.filter(Boolean);
  if (idsValidos.length > 0) {
    await prisma.notificaciones.deleteMany({ where: { cita_id: { in: idsValidos } } });
    await prisma.citas.deleteMany({ where: { id: { in: idsValidos } } });
  }
  await prisma.citas.deleteMany({ where: { clienta_id: { in: [clientaA.id, clientaB.id] } } });
  await prisma.dias_no_laborables.delete({ where: { fecha: diaParaBloquear } });
  await prisma.usuarios.deleteMany({ where: { id: { in: [clientaA.id, clientaB.id] } } });
  await prisma.servicios.delete({ where: { id: servicioPrueba.id } });
  await prisma.$disconnect();
});

describe('calcularDisponibilidad', () => {
  test('devuelve horarios libres en un día laborable dentro del horario de atención', async () => {
    const disponibilidad = await gestor.calcularDisponibilidad(servicioPrueba.id, diaLaborable);
    expect(disponibilidad.length).toBeGreaterThan(0);
    expect(disponibilidad[0].getTime()).toBeGreaterThanOrEqual(horaEn(diaLaborable, 9).getTime());
    expect(disponibilidad[disponibilidad.length - 1].getTime()).toBeLessThan(
      horaEn(diaLaborable, 18).getTime(),
    );
  });

  test('devuelve lista vacía en un día marcado como no laborable', async () => {
    const disponibilidad = await gestor.calcularDisponibilidad(servicioPrueba.id, diaParaBloquear);
    expect(disponibilidad).toEqual([]);
  });

  test('devuelve lista vacía en domingo (sin horario de atención activo)', async () => {
    const domingo = proximoDiaSemana(0, 1);
    const disponibilidad = await gestor.calcularDisponibilidad(servicioPrueba.id, domingo);
    expect(disponibilidad).toEqual([]);
  });

  test('no incluye horarios ya pasados si la fecha consultada es hoy', async () => {
    const hoy = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
    const disponibilidad = await gestor.calcularDisponibilidad(servicioPrueba.id, hoy);
    const ahora = Date.now();
    expect(disponibilidad.every((horario) => horario.getTime() > ahora)).toBe(true);
  });
});

describe('reservar', () => {
  test('reservar en horario libre funciona y crea la cita en estado pendiente', async () => {
    const inicio = horaEn(diaLaborable, 9, 0);
    const cita = await gestor.reservar(clientaA.id, servicioPrueba.id, inicio, 'Primera visita');

    idsDeCitasCreadas.push(cita.id);

    expect(cita.estado).toBe('pendiente');
    expect(cita.clienta_id).toBe(clientaA.id);
    expect(new Date(cita.termina_en).toISOString()).toBe(
      new Date(inicio.getTime() + 30 * 60000).toISOString(),
    );
  });

  test('reservar en un horario ya ocupado lanza DISPONIBILIDAD_OCUPADA', async () => {
    const inicio = horaEn(diaLaborable, 10, 0);
    const primera = await gestor.reservar(clientaA.id, servicioPrueba.id, inicio, null);
    idsDeCitasCreadas.push(primera.id);

    const inicioSolapado = horaEn(diaLaborable, 10, 15);
    await expect(gestor.reservar(clientaB.id, servicioPrueba.id, inicioSolapado, null)).rejects.toMatchObject({
      codigo: 'DISPONIBILIDAD_OCUPADA',
      codigoHttp: 409,
    });
  });

  test('reservar fuera del horario de atención lanza FUERA_DE_HORARIO', async () => {
    const inicioMuyTemprano = horaEn(diaLaborable, 6, 0);
    await expect(
      gestor.reservar(clientaA.id, servicioPrueba.id, inicioMuyTemprano, null),
    ).rejects.toMatchObject({ codigo: 'FUERA_DE_HORARIO', codigoHttp: 400 });
  });

  test('reservar en un día no laborable falla con FUERA_DE_HORARIO', async () => {
    const inicio = horaEn(diaParaBloquear, 11, 0);
    await expect(gestor.reservar(clientaA.id, servicioPrueba.id, inicio, null)).rejects.toMatchObject({
      codigo: 'FUERA_DE_HORARIO',
      codigoHttp: 400,
    });
  });
});

describe('cancelar', () => {
  test('cancelar con menos de 2 horas de anticipación lanza CANCELACION_TARDIA', async () => {
    const citaProximaAEmpezar = await prisma.citas.create({
      data: {
        clienta_id: clientaA.id,
        servicio_id: servicioPrueba.id,
        inicia_en: new Date(Date.now() + 60 * 60000),
        termina_en: new Date(Date.now() + 90 * 60000),
        estado: 'pendiente',
      },
    });
    idsDeCitasCreadas.push(citaProximaAEmpezar.id);

    await expect(gestor.cancelar(citaProximaAEmpezar.id, clientaA.id)).rejects.toMatchObject({
      codigo: 'CANCELACION_TARDIA',
      codigoHttp: 400,
    });
  });

  test('cancelar una cita ajena responde 403', async () => {
    const citaDeClientaA = await prisma.citas.create({
      data: {
        clienta_id: clientaA.id,
        servicio_id: servicioPrueba.id,
        inicia_en: new Date(Date.now() + 5 * 24 * 60 * 60000),
        termina_en: new Date(Date.now() + 5 * 24 * 60 * 60000 + 30 * 60000),
        estado: 'pendiente',
      },
    });
    idsDeCitasCreadas.push(citaDeClientaA.id);

    await expect(gestor.cancelar(citaDeClientaA.id, clientaB.id)).rejects.toMatchObject({
      codigo: 'SIN_PERMISO',
      codigoHttp: 403,
    });
  });

  test('cancelar con 2 horas o más de anticipación deja la cita en estado cancelada', async () => {
    const citaLejana = await prisma.citas.create({
      data: {
        clienta_id: clientaA.id,
        servicio_id: servicioPrueba.id,
        inicia_en: new Date(Date.now() + 6 * 24 * 60 * 60000),
        termina_en: new Date(Date.now() + 6 * 24 * 60 * 60000 + 30 * 60000),
        estado: 'pendiente',
      },
    });
    idsDeCitasCreadas.push(citaLejana.id);

    const cancelada = await gestor.cancelar(citaLejana.id, clientaA.id);
    expect(cancelada.estado).toBe('cancelada');
  });
});

describe('cambiarEstado', () => {
  test('una transición de estado inválida falla', async () => {
    const citaCancelada = await prisma.citas.create({
      data: {
        clienta_id: clientaA.id,
        servicio_id: servicioPrueba.id,
        inicia_en: new Date(Date.now() + 7 * 24 * 60 * 60000),
        termina_en: new Date(Date.now() + 7 * 24 * 60 * 60000 + 30 * 60000),
        estado: 'cancelada',
      },
    });
    idsDeCitasCreadas.push(citaCancelada.id);

    await expect(gestor.cambiarEstado(citaCancelada.id, 'confirmada')).rejects.toMatchObject({
      codigo: 'TRANSICION_INVALIDA',
      codigoHttp: 400,
    });
  });

  test('una transición de estado válida (pendiente -> confirmada) se aplica', async () => {
    const citaPendiente = await prisma.citas.create({
      data: {
        clienta_id: clientaA.id,
        servicio_id: servicioPrueba.id,
        inicia_en: new Date(Date.now() + 8 * 24 * 60 * 60000),
        termina_en: new Date(Date.now() + 8 * 24 * 60 * 60000 + 30 * 60000),
        estado: 'pendiente',
      },
    });
    idsDeCitasCreadas.push(citaPendiente.id);

    const actualizada = await gestor.cambiarEstado(citaPendiente.id, 'confirmada');
    expect(actualizada.estado).toBe('confirmada');
  });
});

describe('obtenerHistorial', () => {
  test('devuelve las citas de la clienta con los datos del servicio incluidos', async () => {
    const historial = await gestor.obtenerHistorial(clientaA.id);
    expect(Array.isArray(historial)).toBe(true);
    expect(historial.length).toBeGreaterThan(0);
    expect(historial.every((cita) => cita.clienta_id === clientaA.id)).toBe(true);
    expect(historial[0].servicio).toBeDefined();
    expect(historial[0].servicio.nombre).toBeDefined();
  });
});
