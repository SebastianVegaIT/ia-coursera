/**
 * @fileoverview Authentication Middleware - Maneja autenticación y autorización
 * @description Middlewares para verificar tokens JWT y permisos de usuarios
 */

const userService = require('../services/userService');
const { AppError } = require('../utils/errorHandler');

/**
 * @function authenticate
 * @description Middleware que verifica la autenticación del usuario mediante JWT
 * @param {Object} req - Objeto de petición Express
 * @param {Object} req.headers - Headers de la petición
 * @param {string} [req.headers.authorization] - Header con formato "Bearer <token>"
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para pasar al siguiente middleware
 * 
 * @description Este middleware:
 * 1. Extrae el token del header Authorization
 * 2. Verifica que el token sea válido usando JWT
 * 3. Decodifica el token y agrega la información del usuario a req.user
 * 4. Si el token es inválido o falta, retorna error 401
 * 
 * @throws {AppError} 401 - Si no se proporciona token o es inválido
 * 
 * @example
 * // En las rutas:
 * router.get('/profile', authenticate, userController.getProfile);
 */
const authenticate = async (req, res, next) => {
  try {
    console.log('🔐 [AUTH] Verificando autenticación...');
    const authHeader = req.headers.authorization;
    
    // Verificar que el header Authorization exista y tenga el formato correcto
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ [AUTH] Token no proporcionado');
      throw new AppError('No token provided', 401);
    }

    // Extraer el token (remover el prefijo "Bearer ")
    const token = authHeader.substring(7);
    console.log('🔍 [AUTH] Verificando token JWT...');
    
    // Verificar y decodificar el token
    const decoded = await userService.verifyToken(token);

    console.log('✅ [AUTH] Token válido:', {
      userId: decoded.id,
      email: decoded.email,
      role: decoded.role,
    });

    // Agregar información del usuario decodificado a la petición
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ [AUTH] Error de autenticación:', {
      message: error.message,
      statusCode: error.statusCode,
    });
    next(error);
  }
};

/**
 * @function authorize
 * @description Middleware factory que verifica que el usuario tenga los roles necesarios
 * @param {...string} roles - Roles permitidos ('student', 'instructor', 'admin')
 * @returns {Function} Middleware que verifica los permisos del usuario
 * 
 * @description Este middleware:
 * 1. Verifica que req.user exista (debe usarse después de authenticate)
 * 2. Verifica que el rol del usuario esté en la lista de roles permitidos
 * 3. Si no tiene permisos, retorna error 403
 * 
 * @throws {AppError} 401 - Si no hay usuario autenticado
 * @throws {AppError} 403 - Si el usuario no tiene los permisos necesarios
 * 
 * @example
 * // En las rutas (solo admin puede acceder):
 * router.get('/users', authenticate, authorize('admin'), userController.getAllUsers);
 * 
 * @example
 * // Múltiples roles permitidos:
 * router.get('/courses', authenticate, authorize('instructor', 'admin'), controller.getCourses);
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Verificar que el rol del usuario esté en la lista de roles permitidos
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};

