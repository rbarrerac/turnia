/**
 * Módulo: Página de inicio de sesión
 * Proyecto: Turnia
 * Autor: Luis
 * Fecha de creación: 15/09/2026
 */

<<<<<<< Updated upstream
function PaginaInicioSesion() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>
=======
import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAutenticacion } from '../contexto/ContextoAutenticacion.jsx';

function PaginaInicioSesion() {
  const { iniciarSesion } = useAutenticacion();
  const navegar = useNavigate();
  const ubicacion = useLocation();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const mensajeExito = ubicacion.state?.mensaje;

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const usuario = await iniciarSesion(correo, contrasena);
      navegar(usuario.rol === 'administradora' ? '/admin/agenda' : '/servicios');
    } catch (errorPeticion) {
      setError(errorPeticion.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-gray-900">Iniciar sesión</h1>

        {mensajeExito && (
          <p className="mt-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700" role="status">
            {mensajeExito}
          </p>
        )}

        <form onSubmit={manejarEnvio} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-gray-700">
              Correo
            </label>
            <input
              id="correo"
              type="email"
              autoComplete="email"
              value={correo}
              onChange={(evento) => setCorreo(evento.target.value)}
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
              autoComplete="current-password"
              value={contrasena}
              onChange={(evento) => setContrasena(evento.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>

          {error && (
            <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded bg-pink-600 py-2 font-semibold text-white transition hover:bg-pink-700 disabled:opacity-50"
          >
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-medium text-pink-600 hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
>>>>>>> Stashed changes
    </div>
  );
}

export default PaginaInicioSesion;
