/**
 * @fileoverview Logger Configuration - Configuración de logging con Winston
 * @description Configuración del sistema de logging usando Winston para registrar
 * eventos de la aplicación en archivos y consola con diferentes niveles de severidad.
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');

// ============================================================================
// CONFIGURACIÓN DE DIRECTORIO DE LOGS
// ============================================================================

/**
 * Crear directorio de logs si no existe
 * Los logs se guardan en la carpeta 'logs' en la raíz del proyecto
 */
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// ============================================================================
// CONFIGURACIÓN DE WINSTON LOGGER
// ============================================================================

/**
 * @constant logger
 * @description Instancia de Winston Logger configurada para la aplicación
 * 
 * @description Características:
 * - Formato JSON para logs estructurados
 * - Timestamp en formato ISO
 * - Stack traces para errores
 * - Rotación automática de archivos (5MB máximo, 5 archivos máximo)
 * - Diferentes niveles: error, warn, info, debug
 * 
 * @description Transports (destinos de logs):
 * 1. error.log - Solo errores (nivel 'error')
 * 2. combined.log - Todos los logs (todos los niveles)
 * 3. Console - Solo en desarrollo (no en producción)
 * 
 * @property {string} level - Nivel de logging mínimo (configurado en .env)
 * @property {Object} format - Formato de los logs (JSON con timestamp)
 * @property {Array} transports - Destinos donde se escriben los logs
 */
const logger = winston.createLogger({
  level: config.logging.level, // Nivel mínimo de logging (error, warn, info, debug)
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Agregar timestamp
    winston.format.errors({ stack: true }), // Incluir stack traces en errores
    winston.format.splat(), // Interpolación de strings
    winston.format.json() // Formato JSON estructurado
  ),
  defaultMeta: { service: 'user-management-service' }, // Metadata por defecto
  transports: [
    // Archivo para errores solamente
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error', // Solo errores
      maxsize: 5242880, // 5MB máximo por archivo
      maxFiles: 5, // Mantener máximo 5 archivos de error
    }),
    // Archivo para todos los logs
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB máximo por archivo
      maxFiles: 5, // Mantener máximo 5 archivos
    }),
  ],
});

// ============================================================================
// LOGGING EN CONSOLA (SOLO EN DESARROLLO)
// ============================================================================

/**
 * Agregar transporte de consola solo en entornos que no sean producción
 * En producción, los logs solo se escriben en archivos
 * 
 * @description Formato de consola:
 * - Colores para diferentes niveles de log
 * - Timestamp legible
 * - Mensaje formateado
 */
if (config.env !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Colores para diferentes niveles
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
    })
  );
}

module.exports = logger;

