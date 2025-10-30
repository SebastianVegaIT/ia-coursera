/**
 * @fileoverview User Controller - Maneja las peticiones HTTP relacionadas con usuarios
 * @description Este módulo contiene los controladores que procesan las peticiones HTTP
 * y delegan la lógica de negocio al servicio correspondiente.
 */

const userService = require('../services/userService');
const logger = require('../utils/logger');
const { AppError } = require('../utils/errorHandler');

/**
 * @class UserController
 * @description Controlador para manejar todas las operaciones relacionadas con usuarios
 */
class UserController {
  /**
   * @method register
   * @description Registra un nuevo usuario en el sistema
   * @route POST /api/users/register
   * @access Public
   * @param {Object} req - Objeto de petición Express
   * @param {Object} req.body - Datos del usuario a registrar
   * @param {string} req.body.email - Email del usuario (requerido)
   * @param {string} req.body.password - Contraseña (requerido, mínimo 8 caracteres)
   * @param {string} req.body.firstName - Nombre del usuario (requerido)
   * @param {string} req.body.lastName - Apellido del usuario (requerido)
   * @param {string} [req.body.username] - Nombre de usuario único (opcional)
   * @param {string} [req.body.role] - Rol del usuario: 'student', 'instructor', 'admin' (opcional, default: 'student')
   * @param {Object} res - Objeto de respuesta Express
   * @param {Function} next - Función para pasar al siguiente middleware
   * @returns {Object} 201 - Usuario creado exitosamente con tokens de acceso
   * @returns {Object} 400 - Error de validación
   * @returns {Object} 409 - Email o username ya registrado
   */
  async register(req, res, next) {
    try {
      console.log('📝 [REGISTER] Iniciando registro de usuario');
      console.log('📝 [REGISTER] Datos recibidos:', {
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username || 'no proporcionado',
      });

      // Delegar la lógica de negocio al servicio
      const { user, tokens } = await userService.createUser(req.body);
      
      console.log('✅ [REGISTER] Usuario registrado exitosamente:', {
        userId: user._id,
        email: user.email,
        role: user.role,
      });

      // Retornar respuesta exitosa con código 201 (Created)
      res.status(201).json({
        success: true,
        data: {
          user,
          tokens,
        },
      });
    } catch (error) {
      console.error('❌ [REGISTER] Error en registro:', {
        message: error.message,
        statusCode: error.statusCode,
        email: req.body.email,
      });
      // Pasar el error al middleware de manejo de errores
      next(error);
    }
  }

  /**
   * @method login
   * @description Autentica un usuario y retorna tokens de acceso
   * @route POST /api/users/login
   * @access Public
   * @param {Object} req - Objeto de petición Express
   * @param {Object} req.body - Credenciales de acceso
   * @param {string} req.body.email - Email del usuario
   * @param {string} req.body.password - Contraseña del usuario
   * @param {Object} res - Objeto de respuesta Express
   * @param {Function} next - Función para pasar al siguiente middleware
   * @returns {Object} 200 - Login exitoso con tokens de acceso
   * @returns {Object} 401 - Credenciales inválidas
   * @returns {Object} 403 - Cuenta desactivada
   */
  async login(req, res, next) {
    try {
      console.log('🔐 [LOGIN] Iniciando login');
      console.log('🔐 [LOGIN] Email recibido:', req.body.email);

      const { email, password } = req.body;
      // Autenticar usuario y obtener tokens
      const { user, tokens } = await userService.loginUser(email, password);
      
      console.log('✅ [LOGIN] Login exitoso:', {
        userId: user._id,
        email: user.email,
        role: user.role,
      });

      res.status(200).json({
        success: true,
        data: {
          user,
          tokens,
        },
      });
    } catch (error) {
      console.error('❌ [LOGIN] Error en login:', {
        message: error.message,
        statusCode: error.statusCode,
        email: req.body.email,
      });
      next(error);
    }
  }

  /**
   * @method getProfile
   * @description Obtiene el perfil del usuario autenticado
   * @route GET /api/users/profile
   * @access Private (requiere autenticación)
   * @param {Object} req - Objeto de petición Express
   * @param {Object} req.user - Usuario autenticado (agregado por middleware de autenticación)
   * @param {string} req.user.id - ID del usuario autenticado
   * @param {Object} res - Objeto de respuesta Express
   * @param {Function} next - Función para pasar al siguiente middleware
   * @returns {Object} 200 - Perfil del usuario
   * @returns {Object} 404 - Usuario no encontrado
   */
  async getProfile(req, res, next) {
    try {
      // Obtener usuario por ID del token JWT
      const user = await userService.getUserById(req.user.id);
      
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @method updateProfile
   * @description Actualiza el perfil del usuario autenticado
   * @route PUT /api/users/profile
   * @access Private (requiere autenticación)
   * @param {Object} req - Objeto de petición Express
   * @param {Object} req.user - Usuario autenticado
   * @param {string} req.user.id - ID del usuario autenticado
   * @param {Object} req.body - Datos a actualizar
   * @param {string} [req.body.firstName] - Nuevo nombre
   * @param {string} [req.body.lastName] - Nuevo apellido
   * @param {string} [req.body.username] - Nuevo username
   * @param {Object} [req.body.preferences] - Preferencias del usuario
   * @param {Object} [req.body.learningProfile] - Perfil de aprendizaje
   * @param {Object} res - Objeto de respuesta Express
   * @param {Function} next - Función para pasar al siguiente middleware
   * @returns {Object} 200 - Perfil actualizado exitosamente
   * @returns {Object} 404 - Usuario no encontrado
   * @returns {Object} 409 - Username ya en uso
   */
  async updateProfile(req, res, next) {
    try {
      // Actualizar usuario con los datos proporcionados
      const user = await userService.updateUser(req.user.id, req.body);
      
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @method deleteAccount
   * @description Desactiva la cuenta del usuario autenticado (soft delete)
   * @route DELETE /api/users/account
   * @access Private (requiere autenticación)
   * @param {Object} req - Objeto de petición Express
   * @param {Object} req.user - Usuario autenticado
   * @param {string} req.user.id - ID del usuario autenticado
   * @param {Object} res - Objeto de respuesta Express
   * @param {Function} next - Función para pasar al siguiente middleware
   * @returns {Object} 200 - Cuenta desactivada exitosamente
   * @returns {Object} 404 - Usuario no encontrado
   */
  async deleteAccount(req, res, next) {
    try {
      // Marcar cuenta como inactiva (no eliminar físicamente)
      await userService.deleteUser(req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Account deactivated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @method changePassword
   * @description Cambia la contraseña del usuario autenticado
   * @route POST /api/users/change-password
   * @access Private (requiere autenticación)
   * @param {Object} req - Objeto de petición Express
   * @param {Object} req.user - Usuario autenticado
   * @param {string} req.user.id - ID del usuario autenticado
   * @param {Object} req.body - Datos para cambio de contraseña
   * @param {string} req.body.currentPassword - Contraseña actual
   * @param {string} req.body.newPassword - Nueva contraseña (mínimo 8 caracteres)
   * @param {Object} res - Objeto de respuesta Express
   * @param {Function} next - Función para pasar al siguiente middleware
   * @returns {Object} 200 - Contraseña cambiada exitosamente
   * @returns {Object} 401 - Contraseña actual incorrecta
   * @returns {Object} 404 - Usuario no encontrado
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await userService.changePassword(req.user.id, currentPassword, newPassword);
      
      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @method getAllUsers
   * @description Lista todos los usuarios con paginación (solo para administradores)
   * @route GET /api/users/users
   * @access Private (requiere autenticación y rol admin)
   * @param {Object} req - Objeto de petición Express
   * @param {Object} req.query - Parámetros de consulta
   * @param {number} [req.query.page=1] - Número de página
   * @param {number} [req.query.limit=10] - Resultados por página
   * @param {string} [req.query.role] - Filtrar por rol: 'student', 'instructor', 'admin'
   * @param {string} [req.query.search] - Búsqueda por email, nombre o apellido
   * @param {Object} res - Objeto de respuesta Express
   * @param {Function} next - Función para pasar al siguiente middleware
   * @returns {Object} 200 - Lista de usuarios con información de paginación
   */
  async getAllUsers(req, res, next) {
    try {
      const result = await userService.getAllUsers(req.query);
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @method getUserById
   * @description Obtiene un usuario específico por ID (solo para administradores)
   * @route GET /api/users/users/:id
   * @access Private (requiere autenticación y rol admin)
   * @param {Object} req - Objeto de petición Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.id - ID del usuario a obtener
   * @param {Object} res - Objeto de respuesta Express
   * @param {Function} next - Función para pasar al siguiente middleware
   * @returns {Object} 200 - Usuario encontrado
   * @returns {Object} 404 - Usuario no encontrado
   */
  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();

