/**
 * Módulo: Página de inicio de sesión
 * Proyecto: Turnia
 * Autor: Luis
 * Fecha de creación: 18/09/2026
 */

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAutenticacion } from '../contexto/ContextoAutenticacion.jsx';

function PaginaInicioSesion() {
  const { iniciarSesion } = useAutenticacion();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensajeError, setMensajeError] = useState(null);

  const registroExitoso = ubicacion.state?.registroExitoso === true;

  async function manejarEnviar(evento) {
    evento.preventDefault();
    setMensajeError(null);
    setEnviando(true);

    try {
      const usuario = await iniciarSesion(correo.trim(), contrasena);
      navegar(usuario.rol === 'administradora' ? '/admin/agenda' : '/servicios', { replace: true });
    } catch (error) {
      setMensajeError(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800">Iniciar sesión</h1>

        {registroExitoso && (
          <p className="p-3 mt-4 text-sm text-green-800 bg-green-100 rounded">
            Cuenta creada correctamente. Ahora puedes iniciar sesión.
          </p>
        )}

        {mensajeError && (
          <p className="p-3 mt-4 text-sm text-red-800 bg-red-100 rounded">{mensajeError}</p>
        )}

        <form onSubmit={manejarEnviar} className="mt-6 space-y-4">
          <label className="flex flex-col text-sm text-gray-600">
            Correo electrónico
            <input
              type="email"
              value={correo}
              onChange={(evento) => setCorreo(evento.target.value)}
              required
              className="px-3 py-2 mt-1 border border-gray-300 rounded"
            />
          </label>

          <label className="flex flex-col text-sm text-gray-600">
            Contraseña
            <input
              type="password"
              value={contrasena}
              onChange={(evento) => setContrasena(evento.target.value)}
              required
              className="px-3 py-2 mt-1 border border-gray-300 rounded"
            />
          </label>

          <button
            type="submit"
            disabled={enviando}
            className="w-full px-4 py-2 font-medium text-white bg-pink-600 rounded hover:bg-pink-700 disabled:opacity-50"
          >
            {enviando ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-pink-600 hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}

export default PaginaInicioSesion;
