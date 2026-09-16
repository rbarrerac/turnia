/**
 * Módulo: GestorDeAutenticacion — registro e inicio de sesión de usuarias
 * Proyecto: Turnia
 * Autor: Ronald
 * Fecha de creación: 15/09/2026
 */

class GestorDeAutenticacion {
  async registrar(nombre, correo, telefono, contrasena) {
    // Pendiente de implementar: hashear contraseña con bcrypt y crear la usuaria.
    return { exito: true, datos: null, mensaje: 'Pendiente de implementar' };
  }

  async iniciarSesion(correo, contrasena) {
    // Pendiente de implementar: validar credenciales y devolver token JWT.
    return { exito: true, datos: null, mensaje: 'Pendiente de implementar' };
  }
}

export default GestorDeAutenticacion;
