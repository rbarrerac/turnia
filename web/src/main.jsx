/**
 * Módulo: Punto de entrada de React — monta la aplicación en el DOM
 * Proyecto: Turnia
 * Autor: Luis
 * Fecha de creación: 15/09/2026
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
<<<<<<< Updated upstream
=======
import { ProveedorAutenticacion } from './contexto/ContextoAutenticacion.jsx';
>>>>>>> Stashed changes
import './estilos/indice.css';

ReactDOM.createRoot(document.getElementById('raiz')).render(
  <React.StrictMode>
    <BrowserRouter>
<<<<<<< Updated upstream
      <App />
=======
      <ProveedorAutenticacion>
        <App />
      </ProveedorAutenticacion>
>>>>>>> Stashed changes
    </BrowserRouter>
  </React.StrictMode>,
);
