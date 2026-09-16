/**
 * Módulo: Página de registro de clientas
 * Proyecto: Turnia
 * Autor: Luis
 * Fecha de creación: 15/09/2026
 */

<<<<<<< Updated upstream
function PaginaRegistro() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Registro</h1>
=======
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAutenticacion } from '../contexto/ContextoAutenticacion.jsx';

const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function PaginaRegistro() {
  const { registrar } = useAutenticacion();
  const navegar = useNavigate();

  const [formulario, setFormulario] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    contrasena: '',
  });
  const [errorValidacion, setErrorValidacion] = useState('');
  const [errorServidor, setErrorServidor] = useState('');
  const [enviando, setEnviando] = useState(false);

  function actualizarCampo(campo) {
    return (evento) => setFormulario((anterior) => ({ ...anterior, [campo]: evento.target.value }));
  }

  function validar() {
    if (!formulario.nombre.trim()) return 'El nombre es obligatorio.';
    if (!PATRON_CORREO.test(formulario.correo)) return 'Ingresa un correo con formato válido.';
    if (formulario.contrasena.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    return '';
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setErrorServidor('');

    const mensajeValidacion = validar();
    setErrorValidacion(mensajeValidacion);
    if (mensajeValidacion) return;

    setEnviando(true);
    try {
      await registrar(formulario.nombre, formulario.correo, formulario.telefono, formulario.contrasena);
      navegar('/inicio-sesion', { state: { mensaje: 'Registro exitoso. Ahora inicia sesión.' } });
    } catch (error) {
      setErrorServidor(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-gray-900">Crear cuenta</h1>
        <p className="mt-1 text-center text-sm text-gray-600">
          Regístrate para reservar tus citas en Turnia.
        </p>

        <form onSubmit={manejarEnvio} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              autoComplete="name"
              value={formulario.nombre}
              onChange={actualizarCampo('nombre')}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>

          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-gray-700">
              Correo
            </label>
            <input
              id="correo"
              type="email"
              autoComplete="email"
              value={formulario.correo}
              onChange={actualizarCampo('correo')}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>

          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
              Teléfono <span className="text-gray-400">(opcional)</span>
            </label>
            <input
              id="telefono"
              type="tel"
              autoComplete="tel"
              value={formulario.telefono}
              onChange={actualizarCampo('telefono')}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>

          <div>
            <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="contrasena"
              type="password"
              autoComplete="new-password"
              value={formulario.contrasena}
              onChange={actualizarCampo('contrasena')}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
            <p className="mt-1 text-xs text-gray-500">Mínimo 8 caracteres.</p>
          </div>

          {errorValidacion && (
            <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {errorValidacion}
            </p>
          )}
          {errorServidor && (
            <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {errorServidor}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded bg-pink-600 py-2 font-semibold text-white transition hover:bg-pink-700 disabled:opacity-50"
          >
            {enviando ? 'Registrando…' : 'Registrarme'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/inicio-sesion" className="font-medium text-pink-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
>>>>>>> Stashed changes
    </div>
  );
}

export default PaginaRegistro;
