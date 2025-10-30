/**
 * @fileoverview Error Handler - Manejo centralizado de errores
 * @description Proporciona una clase de error personalizada y un middleware
 * global para manejar todos los errores de la aplicación de forma consistente.
 */

const logger = require('./logger');
const config = require('../config/env');

/**
 * @class AppError
 * @extends Error
 * @description Clase de error personalizada para errores operacionales de la aplicación
 * @param {string} message - Mensaje de error descriptivo
 * @param {number} statusCode - Código de estado HTTP apropiado
 * 
 * @property {number} statusCode - Código de estado HTTP del error
 * @property {boolean} isOperational - Indica si es un error operacional (true) o de programación (false)
 * 
 * @example
 * throw new AppError('User not found', 404);
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Marca errores que son esperados y manejables
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * @function errorHandler
 * @description Middleware global de manejo de errores para Express
 * @param {Error} err - Objeto de error capturado
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para pasar al siguiente middleware
 * 
 * @description Este middleware:
 * 1. Captura todos los errores que ocurren en la aplicación
 * 2. Normaliza diferentes tipos de errores (Mongoose, JWT, etc.)
 * 3. Formatea la respuesta de error de forma consistente
 * 4. Registra el error en los logs
 * 5. Retorna una respuesta JSON con el error apropiado
 * 
 * @description Tipos de errores manejados:
 * - CastError (Mongoose): ObjectId inválido → 404
 * - 11000 (MongoDB): Clave duplicada → 409
 * - ValidationError (Mongoose): Error de validación → 400
 * - AppError: Errores personalizados con su statusCode
 * - Otros: Error genérico → 500
 * 
 * @returns {Object} Respuesta JSON con el error formateado
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('🚨 [ERROR HANDLER] Error capturado:', {
    message: err.message,
    statusCode: err.statusCode || 500,
    name: err.name,
    code: err.code,
    path: req.path,
    method: req.method,
  });

  // Registrar el error completo en los logs
  logger.error(err);

  // ============================================================================
  // MANEJO DE ERRORES ESPECÍFICOS DE MONGOOSE
  // ============================================================================

  // Error de Cast (ObjectId inválido en MongoDB)
  if (err.name === 'CastError') {
    console.error('🚨 [ERROR HANDLER] Error de Cast (ObjectId inválido)');
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Error de clave duplicada (índice único violado)
  if (err.code === 11000) {
    console.error('🚨 [ERROR HANDLER] Error de clave duplicada:', err.keyPattern);
    const field = Object.keys(err.keyPattern)[0];
    const message = `${field} already exists`;
    error = new AppError(message, 409);
  }

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    console.error('🚨 [ERROR HANDLER] Error de validación de Mongoose:', err.errors);
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = new AppError(message, 400);
  }

  // ============================================================================
  // CONSTRUIR RESPUESTA DE ERROR
  // ============================================================================

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  console.error('📤 [ERROR HANDLER] Enviando respuesta de error:', {
    statusCode,
    message,
    hasDetails: !!error.details,
  });

  // Construir objeto de respuesta
  const response = {
    success: false,
    error: message,
    // Solo incluir stack trace en desarrollo para debugging
    ...(config.env === 'development' && { stack: err.stack }),
  };

  // Agregar detalles de validación si existen
  if (error.details) {
    response.details = error.details;
  }

  res.status(statusCode).json(response);
};

module.exports = { AppError, errorHandler };

