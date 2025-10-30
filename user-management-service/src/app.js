/**
 * @fileoverview Express Application Configuration
 * @description Configuración principal de la aplicación Express con middlewares,
 * rutas y manejo de errores para el servicio de gestión de usuarios.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const logger = require('./utils/logger');
const { errorHandler } = require('./utils/errorHandler');
const userRoutes = require('./routes/userRoutes');

const app = express();

// ============================================================================
// MIDDLEWARES DE SEGURIDAD
// ============================================================================

/**
 * Helmet - Configuración de seguridad HTTP headers
 * Content Security Policy permite scripts inline para la página HTML de prueba
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

/**
 * CORS - Configuración de Cross-Origin Resource Sharing
 * Permite peticiones desde el origen configurado en variables de entorno
 */
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// ============================================================================
// MIDDLEWARES DE COMPRESIÓN Y PARSING
// ============================================================================

/**
 * Compression - Comprime las respuestas HTTP para reducir el tamaño de transferencia
 */
app.use(compression());

/**
 * Static Files - Sirve archivos estáticos desde la carpeta 'public'
 * Permite acceder a la página HTML de prueba en http://localhost:3001
 */
app.use(express.static('public'));

/**
 * Body Parsing - Parsea el cuerpo de las peticiones JSON y URL-encoded
 * Límite de 10MB para permitir uploads de archivos grandes si es necesario
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================================
// MIDDLEWARES DE SEGURIDAD ADICIONALES
// ============================================================================

/**
 * Rate Limiting - Limita el número de peticiones por IP
 * Previene ataques de fuerza bruta y abuso de la API
 * Configuración: máximo 100 peticiones por 15 minutos por IP
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// ============================================================================
// LOGGING
// ============================================================================

/**
 * Morgan - Logger HTTP para Express
 * Registra todas las peticiones HTTP en formato 'combined'
 * Solo se activa en entornos que no sean 'test'
 */
if (config.env !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  }));
}

// ============================================================================
// RUTAS
// ============================================================================

/**
 * Health Check Endpoint
 * Permite verificar el estado del servicio sin autenticación
 * @route GET /health
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'user-management-service',
  });
});

/**
 * User Routes - Todas las rutas relacionadas con usuarios
 * Prefijo: /api/users
 * Ejemplos:
 * - POST /api/users/register
 * - POST /api/users/login
 * - GET /api/users/profile
 */
app.use('/api/users', userRoutes);

// ============================================================================
// MANEJO DE ERRORES
// ============================================================================

/**
 * 404 Handler - Maneja rutas no encontradas
 * Debe estar después de todas las rutas definidas
 */
app.use((req, res, next) => {
  console.warn('⚠️ [404] Ruta no encontrada:', {
    method: req.method,
    path: req.path,
    url: req.url,
  });
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

/**
 * Error Handler - Middleware global de manejo de errores
 * Debe ser el último middleware en la cadena
 * Captura todos los errores y los formatea apropiadamente
 */
app.use(errorHandler);

module.exports = app;

