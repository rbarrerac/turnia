/**
 * Módulo: Pruebas unitarias de GestorDeNotificaciones y la tarea de recordatorios
 * Proyecto: Turnia
 * Autor: Luis
 * Fecha de creación: 18/09/2026
 */

import GestorDeNotificaciones from '../../src/servicios/GestorDeNotificaciones.js';
import { enviarRecordatoriosPendientes } from '../../src/tareas/recordatorios.tarea.js';
import prisma from '../../src/configuracion/baseDeDatos.js';

const gestor = new GestorDeNotificaciones();

let servicioPrueba;
let clientaPrueba;
const idsDeCitasCreadas = [];

// Instante fijo, lejos de cualquier otra cita creada por esta u otras suites de prueba:
// se calcula una sola vez al cargar el archivo, sumando 45 días a la medianoche UTC de
// "hoy". `GestorDeNotificaciones.enviarRecordatorio` no valida ninguna regla de horario
// (a diferencia de RN-03/RN-08 en GestorDeReservas), así que aquí lo único que debe dejar
// de depender del reloj real es el punto de partida de la cita de prueba: usar un instante
// fijo (en vez de Date.now()) evita que la creación de la cita compita por el mismo hueco
// de tiempo que otras pruebas "ahora + N minutos" cuando la suite corre en paralelo.
function instanteFijoEnElFuturo(diasEnElFuturo, horas) {
  const hoy = new Date();
  const medianocheUtc = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate()));
  return new Date(medianocheUtc.getTime() + diasEnElFuturo * 24 * 60 * 60000 + horas * 60 * 60000);
}
const INSTANTE_FIJO_RECORDATORIO = instanteFijoEnElFuturo(45, 10);

beforeAll(async () => {
  servicioPrueba = await prisma.servicios.create({
    data: {
      nombre: `Servicio de prueba notificaciones ${Date.now()}`,
      duracion_minutos: 30,
      precio: 10,
      activo: true,
    },
  });

  clientaPrueba = await prisma.usuarios.create({
    data: {
      nombre: 'Clienta de prueba notificaciones',
      correo: `clienta.notificaciones.${Date.now()}@turnia.gt`,
      contrasena_hash: 'hash-no-usado-en-esta-prueba',
      rol: 'clienta',
    },
  });
});

afterAll(async () => {
  const idsValidos = idsDeCitasCreadas.filter(Boolean);
  if (idsValidos.length > 0) {
    await prisma.notificaciones.deleteMany({ where: { cita_id: { in: idsValidos } } });
    await prisma.citas.deleteMany({ where: { id: { in: idsValidos } } });
  }
  await prisma.usuarios.delete({ where: { id: clientaPrueba.id } });
  await prisma.servicios.delete({ where: { id: servicioPrueba.id } });
  await prisma.$disconnect();
});

// Crea una cita de prueba reintentando ante un conflicto real de la restricción
// `sin_superposicion`. Un pre-chequeo (SELECT y luego INSERT) no basta: otros
// archivos de prueba corren en procesos paralelos de Jest contra esta misma base
// de datos de desarrollo, así que dos "comprobar-luego-crear" pueden intercalarse.
// Reaccionar al rechazo real de Postgres sí es seguro: la base de datos resuelve
// la condición de carrera de forma atómica.
async function crearCita({ inicioEnMinutos, estado, duracionMinutos = 30, instanteBase = new Date() }) {
  let inicio = new Date(instanteBase.getTime() + inicioEnMinutos * 60000);

  // Paso de 1 minuto: todos los offsets usados en este archivo tienen holgura
  // de varias horas respecto a los límites que importan (ventana de 24 h de
  // RN-06), así que ni siquiera muchos reintentos de 1 min los cruzan.
  for (let intento = 0; intento < 60; intento += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const cita = await prisma.citas.create({
        data: {
          clienta_id: clientaPrueba.id,
          servicio_id: servicioPrueba.id,
          inicia_en: inicio,
          termina_en: new Date(inicio.getTime() + duracionMinutos * 60000),
          estado,
        },
      });
      idsDeCitasCreadas.push(cita.id);
      return cita;
    } catch (error) {
      const mensaje = error?.message ?? '';
      if (!mensaje.includes('sin_superposicion') && !mensaje.includes('23P01')) {
        throw error;
      }
      inicio = new Date(inicio.getTime() + 60000);
    }
  }
  throw new Error('No se pudo crear la cita de prueba tras varios reintentos (notificaciones).');
}

describe('GestorDeNotificaciones', () => {
  test('enviarConfirmacion registra una notificación de tipo confirmacion', async () => {
    const cita = await crearCita({ inicioEnMinutos: 60, estado: 'pendiente' });

    const exitoso = await gestor.enviarConfirmacion(cita);
    expect(exitoso).toBe(true);

    const notificacion = await prisma.notificaciones.findFirst({
      where: { cita_id: cita.id, tipo: 'confirmacion' },
    });
    expect(notificacion).not.toBeNull();
    expect(notificacion.exitoso).toBe(true);
    expect(notificacion.enviado_en).not.toBeNull();
  });

  test('enviarRecordatorio registra una notificación de tipo recordatorio', async () => {
    // `enviarRecordatorio` no valida ninguna regla de horario: solo importa que la cita
    // exista. Se ancla a INSTANTE_FIJO_RECORDATORIO (no a "ahora") para que la creación
    // sea reproducible sin importar el día ni la hora real de ejecución.
    const cita = await crearCita({
      inicioEnMinutos: 120,
      estado: 'confirmada',
      instanteBase: INSTANTE_FIJO_RECORDATORIO,
    });

    const exitoso = await gestor.enviarRecordatorio(cita);
    expect(exitoso).toBe(true);

    const notificacion = await prisma.notificaciones.findFirst({
      where: { cita_id: cita.id, tipo: 'recordatorio' },
    });
    expect(notificacion).not.toBeNull();
    expect(notificacion.exitoso).toBe(true);
  });
});

describe('enviarRecordatoriosPendientes (RN-06)', () => {
  test('solo envía a citas confirmadas dentro de las próximas 24 h sin recordatorio previo', async () => {
    const debeRecibir = await crearCita({ inicioEnMinutos: 12 * 60, estado: 'confirmada' });
    const yaTeniaRecordatorio = await crearCita({ inicioEnMinutos: 10 * 60, estado: 'confirmada' });
    const fueraDeVentana = await crearCita({ inicioEnMinutos: 48 * 60, estado: 'confirmada' });
    const noConfirmada = await crearCita({ inicioEnMinutos: 6 * 60, estado: 'pendiente' });

    await prisma.notificaciones.create({
      data: {
        cita_id: yaTeniaRecordatorio.id,
        tipo: 'recordatorio',
        enviado_en: new Date(),
        exitoso: true,
      },
    });

    const cantidadEnviados = await enviarRecordatoriosPendientes();
    expect(cantidadEnviados).toBeGreaterThanOrEqual(1);

    const notificacionesPorCita = await prisma.notificaciones.findMany({
      where: {
        tipo: 'recordatorio',
        cita_id: { in: [debeRecibir.id, yaTeniaRecordatorio.id, fueraDeVentana.id, noConfirmada.id] },
      },
    });

    const citasConRecordatorio = notificacionesPorCita.map((n) => n.cita_id);
    expect(citasConRecordatorio).toContain(debeRecibir.id);
    expect(citasConRecordatorio.filter((id) => id === yaTeniaRecordatorio.id)).toHaveLength(1);
    expect(citasConRecordatorio).not.toContain(fueraDeVentana.id);
    expect(citasConRecordatorio).not.toContain(noConfirmada.id);
  });
});
