/**
 * @fileoverview User Service - Contiene la lógica de negocio para operaciones de usuarios
 * @description Este módulo maneja todas las operaciones relacionadas con usuarios:
 * creación, autenticación, actualización, eliminación y generación de tokens JWT.
 */

const User = require('../models/userModel');
const { AppError } = require('../utils/errorHandler');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * @class UserService
 * @description Servicio que encapsula la lógica de negocio para operaciones de usuarios
 */
class UserService {
  /**
   * @method createUser
   * @description Crea un nuevo usuario en el sistema
   * @param {Object} userData - Datos del usuario a crear
   * @param {string} userData.email - Email del usuario (debe ser único)
   * @param {string} userData.password - Contraseña (será hasheada automáticamente)
   * @param {string} userData.firstName - Nombre del usuario
   * @param {string} userData.lastName - Apellido del usuario
   * @param {string} [userData.username] - Username único (opcional)
   * @param {string} [userData.role] - Rol del usuario (default: 'student')
   * @returns {Promise<Object>} Objeto con el usuario creado y tokens de acceso
   * @returns {Object.user} Información del usuario (sin password ni tokens sensibles)
   * @returns {Object.tokens} Tokens JWT (accessToken y refreshToken)
   * @throws {AppError} 409 - Si el email o username ya están registrados
   * @throws {AppError} 400 - Si hay errores de validación
   */
  async createUser(userData) {
    try {
      console.log('🔍 [SERVICE] Verificando si el email existe:', userData.email);
      
      // Verificar si el email ya existe en la base de datos
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.error('❌ [SERVICE] Email ya registrado:', userData.email);
        throw new AppError('Email already registered', 409);
      }
      console.log('✅ [SERVICE] Email disponible');

      // Verificar si el username ya existe (si se proporciona)
      if (userData.username) {
        console.log('🔍 [SERVICE] Verificando si el username existe:', userData.username);
        const existingUsername = await User.findOne({ username: userData.username });
        if (existingUsername) {
          console.error('❌ [SERVICE] Username ya en uso:', userData.username);
          throw new AppError('Username already taken', 409);
        }
        console.log('✅ [SERVICE] Username disponible');
      }

      console.log('💾 [SERVICE] Creando nuevo usuario en la base de datos...');
      // Crear instancia del modelo User con los datos proporcionados
      const user = new User(userData);
      // Guardar en la base de datos (el password se hashea automáticamente en el pre-save hook)
      await user.save();
      console.log('✅ [SERVICE] Usuario guardado en BD:', user._id);

      console.log('🔑 [SERVICE] Generando tokens JWT...');
      // Generar tokens de acceso y refresh
      const tokens = await this.generateTokens(user);
      console.log('✅ [SERVICE] Tokens generados exitosamente');

      // Ocultar información sensible antes de retornar
      const userObject = user.toObject();
      delete userObject.password; // No retornar el password hasheado
      delete userObject.refreshTokens; // No retornar los refresh tokens

      logger.info(`User created: ${user.email}`);
      console.log('✅ [SERVICE] Usuario creado completamente:', {
        userId: user._id,
        email: user.email,
        role: user.role,
      });

      return {
        user: userObject,
        tokens,
      };
    } catch (error) {
      console.error('❌ [SERVICE] Error en createUser:', {
        message: error.message,
        stack: error.stack,
        email: userData.email,
      });
      logger.error(`Error creating user: ${error.message}`);
      throw error;
    }
  }

  /**
   * @method loginUser
   * @description Autentica un usuario y genera tokens de acceso
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<Object>} Objeto con el usuario autenticado y tokens
   * @returns {Object.user} Información del usuario
   * @returns {Object.tokens} Tokens JWT (accessToken y refreshToken)
   * @throws {AppError} 401 - Si las credenciales son inválidas
   * @throws {AppError} 403 - Si la cuenta está desactivada
   */
  async loginUser(email, password) {
    try {
      console.log('🔍 [SERVICE] Buscando usuario:', email);
      
      // Buscar usuario con password (normalmente el password está oculto con select: false)
      const user = await User.findOne({ email }).select('+password');
      
      // Verificar si el usuario existe
      if (!user) {
        console.error('❌ [SERVICE] Usuario no encontrado:', email);
        throw new AppError('Invalid email or password', 401);
      }

      console.log('🔐 [SERVICE] Verificando contraseña...');
      // Comparar la contraseña proporcionada con la almacenada (hasheada)
      if (!(await user.comparePassword(password))) {
        console.error('❌ [SERVICE] Contraseña incorrecta para:', email);
        throw new AppError('Invalid email or password', 401);
      }
      console.log('✅ [SERVICE] Contraseña correcta');

      // Verificar si la cuenta está activa
      if (!user.isActive) {
        console.error('❌ [SERVICE] Cuenta desactivada:', email);
        throw new AppError('Account is deactivated', 403);
      }

      console.log('💾 [SERVICE] Actualizando último login...');
      // Actualizar timestamp del último login
      user.lastLogin = new Date();
      await user.save();

      console.log('🔑 [SERVICE] Generando tokens JWT...');
      // Generar nuevos tokens de acceso y refresh
      const tokens = await this.generateTokens(user);
      console.log('✅ [SERVICE] Tokens generados');

      logger.info(`User logged in: ${user.email}`);
      console.log('✅ [SERVICE] Login exitoso:', {
        userId: user._id,
        email: user.email,
        role: user.role,
      });

      return {
        user: user.toObject(),
        tokens,
      };
    } catch (error) {
      console.error('❌ [SERVICE] Error en loginUser:', {
        message: error.message,
        stack: error.stack,
        email: email,
      });
      logger.error(`Error logging in user: ${error.message}`);
      throw error;
    }
  }

  /**
   * @method getUserById
   * @description Obtiene un usuario por su ID
   * @param {string} userId - ID del usuario (MongoDB ObjectId)
   * @returns {Promise<Object>} Objeto del usuario encontrado
   * @throws {AppError} 404 - Si el usuario no existe
   */
  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      return user;
    } catch (error) {
      logger.error(`Error getting user: ${error.message}`);
      throw error;
    }
  }

  /**
   * @method getAllUsers
   * @description Obtiene una lista paginada de usuarios con filtros opcionales
   * @param {Object} [query={}] - Parámetros de consulta
   * @param {number} [query.page=1] - Número de página (default: 1)
   * @param {number} [query.limit=10] - Cantidad de resultados por página (default: 10)
   * @param {string} [query.role] - Filtrar por rol: 'student', 'instructor', 'admin'
   * @param {string} [query.search] - Búsqueda por email, firstName o lastName (case-insensitive)
   * @returns {Promise<Object>} Objeto con la lista de usuarios y metadatos de paginación
   * @returns {Array} users - Array de usuarios encontrados
   * @returns {Object} pagination - Información de paginación
   * @returns {number} pagination.page - Página actual
   * @returns {number} pagination.limit - Resultados por página
   * @returns {number} pagination.total - Total de usuarios que coinciden con los filtros
   * @returns {number} pagination.pages - Total de páginas
   */
  async getAllUsers(query = {}) {
    try {
      // Extraer parámetros de paginación y filtros
      const { page = 1, limit = 10, role, search } = query;
      const skip = (page - 1) * limit; // Calcular cuántos documentos saltar

      // Construir objeto de filtro para MongoDB
      const filter = {};
      if (role) filter.role = role; // Filtrar por rol si se proporciona
      
      // Búsqueda por email, nombre o apellido (case-insensitive)
      if (search) {
        filter.$or = [
          { email: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
        ];
      }

      // Consultar usuarios con paginación y ordenamiento
      const users = await User.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }); // Ordenar por fecha de creación (más recientes primero)

      // Contar total de documentos que coinciden con los filtros
      const total = await User.countDocuments(filter);

      return {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit), // Calcular total de páginas
        },
      };
    } catch (error) {
      logger.error(`Error getting users: ${error.message}`);
      throw error;
    }
  }

  /**
   * @method updateUser
   * @description Actualiza los datos de un usuario existente
   * @param {string} userId - ID del usuario a actualizar
   * @param {Object} updateData - Datos a actualizar (solo se actualizan los campos proporcionados)
   * @param {string} [updateData.firstName] - Nuevo nombre
   * @param {string} [updateData.lastName] - Nuevo apellido
   * @param {string} [updateData.username] - Nuevo username (debe ser único)
   * @param {Object} [updateData.preferences] - Nuevas preferencias
   * @param {Object} [updateData.learningProfile] - Nuevo perfil de aprendizaje
   * @returns {Promise<Object>} Usuario actualizado
   * @throws {AppError} 404 - Si el usuario no existe
   * @throws {AppError} 409 - Si el username ya está en uso por otro usuario
   */
  async updateUser(userId, updateData) {
    try {
      // Si se actualiza el username, verificar que no esté en uso por otro usuario
      if (updateData.username) {
        const existingUser = await User.findOne({ 
          username: updateData.username,
          _id: { $ne: userId } // Excluir el usuario actual de la búsqueda
        });
        if (existingUser) {
          throw new AppError('Username already taken', 409);
        }
      }

      // Actualizar usuario usando findByIdAndUpdate con opciones
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData }, // Usar $set para actualizar solo los campos proporcionados
        { new: true, runValidators: true } // Retornar documento actualizado y ejecutar validaciones
      );

      if (!user) {
        throw new AppError('User not found', 404);
      }

      logger.info(`User updated: ${user.email}`);
      return user;
    } catch (error) {
      logger.error(`Error updating user: ${error.message}`);
      throw error;
    }
  }

  /**
   * @method deleteUser
   * @description Desactiva un usuario (soft delete - no elimina físicamente)
   * @param {string} userId - ID del usuario a desactivar
   * @returns {Promise<Object>} Usuario desactivado
   * @throws {AppError} 404 - Si el usuario no existe
   */
  async deleteUser(userId) {
    try {
      // Soft delete: marcar como inactivo en lugar de eliminar físicamente
      const user = await User.findByIdAndUpdate(
        userId,
        { isActive: false },
        { new: true }
      );

      if (!user) {
        throw new AppError('User not found', 404);
      }

      logger.info(`User deactivated: ${user.email}`);
      return user;
    } catch (error) {
      logger.error(`Error deleting user: ${error.message}`);
      throw error;
    }
  }

  /**
   * @method changePassword
   * @description Cambia la contraseña del usuario después de verificar la actual
   * @param {string} userId - ID del usuario
   * @param {string} currentPassword - Contraseña actual del usuario
   * @param {string} newPassword - Nueva contraseña (será hasheada automáticamente)
   * @returns {Promise<Object>} Objeto con mensaje de éxito
   * @throws {AppError} 404 - Si el usuario no existe
   * @throws {AppError} 401 - Si la contraseña actual es incorrecta
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Obtener usuario incluyendo el password (normalmente está oculto)
      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Verificar que la contraseña actual sea correcta
      if (!(await user.comparePassword(currentPassword))) {
        throw new AppError('Current password is incorrect', 401);
      }

      // Actualizar contraseña (se hasheará automáticamente en el pre-save hook)
      user.password = newPassword;
      await user.save();

      logger.info(`Password changed for user: ${user.email}`);
      return { message: 'Password changed successfully' };
    } catch (error) {
      logger.error(`Error changing password: ${error.message}`);
      throw error;
    }
  }

  /**
   * @method generateTokens
   * @description Genera tokens JWT (access y refresh) para un usuario
   * @param {Object} user - Objeto del usuario
   * @param {string} user._id - ID del usuario
   * @param {string} user.email - Email del usuario
   * @param {string} user.role - Rol del usuario
   * @returns {Promise<Object>} Objeto con accessToken y refreshToken
   * @returns {string} accessToken - Token de acceso (expira en 7 días por defecto)
   * @returns {string} refreshToken - Token de refresh (expira en 30 días por defecto)
   */
  async generateTokens(user) {
    // Crear payload para los tokens JWT
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    // Generar access token con expiración corta
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    // Generar refresh token con expiración larga
    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });

    // Guardar refresh token en el usuario para poder revocarlo si es necesario
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * @method verifyToken
   * @description Verifica y decodifica un token JWT
   * @param {string} token - Token JWT a verificar
   * @returns {Promise<Object>} Payload decodificado del token
   * @returns {string} id - ID del usuario
   * @returns {string} email - Email del usuario
   * @returns {string} role - Rol del usuario
   * @throws {AppError} 401 - Si el token es inválido o ha expirado
   */
  async verifyToken(token) {
    try {
      // Verificar y decodificar el token usando el secreto configurado
      const decoded = jwt.verify(token, config.jwt.secret);
      return decoded;
    } catch (error) {
      // Si el token es inválido o ha expirado, lanzar error
      throw new AppError('Invalid or expired token', 401);
    }
  }
}

module.exports = new UserService();

