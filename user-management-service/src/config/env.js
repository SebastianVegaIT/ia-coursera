/**
 * @fileoverview Environment Configuration - Validación y carga de variables de entorno
 * @description Este módulo carga y valida todas las variables de entorno necesarias
 * para el funcionamiento del servicio usando Joi para asegurar tipos y valores correctos.
 */

require('dotenv').config();
const Joi = require('joi');

/**
 * @schema envSchema
 * @description Schema de validación para variables de entorno
 * Valida que todas las variables requeridas estén presentes y tengan valores válidos
 */
const envSchema = Joi.object({
  // Entorno de ejecución
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  
  // Puerto del servidor
  PORT: Joi.number().default(3001),
  
  // URI de conexión a MongoDB
  MONGODB_URI: Joi.string().required(),
  
  // Configuración de JWT
  JWT_SECRET: Joi.string().required(), // Secreto para firmar access tokens
  JWT_EXPIRES_IN: Joi.string().default('7d'), // Expiración de access tokens
  JWT_REFRESH_SECRET: Joi.string().required(), // Secreto para firmar refresh tokens
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'), // Expiración de refresh tokens
  
  // Configuración de bcrypt
  BCRYPT_SALT_ROUNDS: Joi.number().default(12), // Número de rounds para hashear contraseñas
  
  // Configuración de CORS
  CORS_ORIGIN: Joi.string().default('*'), // Origen permitido para CORS
  
  // Nivel de logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
}).unknown();

// Validar las variables de entorno
const { error, value: envVars } = envSchema.validate(process.env);

// Si hay errores de validación, lanzar error y detener la aplicación
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

/**
 * @module config
 * @description Objeto de configuración exportado con todas las variables validadas
 * 
 * @property {string} env - Entorno de ejecución ('development', 'production', 'test')
 * @property {number} port - Puerto del servidor
 * @property {Object} mongodb - Configuración de MongoDB
 * @property {string} mongodb.uri - URI de conexión a MongoDB
 * @property {Object} jwt - Configuración de JWT
 * @property {string} jwt.secret - Secreto para access tokens
 * @property {string} jwt.expiresIn - Tiempo de expiración de access tokens
 * @property {string} jwt.refreshSecret - Secreto para refresh tokens
 * @property {string} jwt.refreshExpiresIn - Tiempo de expiración de refresh tokens
 * @property {Object} bcrypt - Configuración de bcrypt
 * @property {number} bcrypt.saltRounds - Número de rounds para hashear contraseñas
 * @property {Object} cors - Configuración de CORS
 * @property {string} cors.origin - Origen permitido para CORS
 * @property {Object} logging - Configuración de logging
 * @property {string} logging.level - Nivel de logging ('error', 'warn', 'info', 'debug')
 */
module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongodb: {
    uri: envVars.MONGODB_URI,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    refreshExpiresIn: envVars.JWT_REFRESH_EXPIRES_IN,
  },
  bcrypt: {
    saltRounds: envVars.BCRYPT_SALT_ROUNDS,
  },
  cors: {
    origin: envVars.CORS_ORIGIN,
  },
  logging: {
    level: envVars.LOG_LEVEL,
  },
};

