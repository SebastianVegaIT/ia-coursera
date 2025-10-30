/**
 * @fileoverview User Validation Schemas - Schemas de validación Joi para usuarios
 * @description Define todos los schemas de validación Joi utilizados para validar
 * los datos de entrada en las rutas relacionadas con usuarios.
 */

const Joi = require('joi');

/**
 * @namespace userSchemas
 * @description Objeto que contiene todos los schemas de validación para operaciones de usuarios
 */
const userSchemas = {
  /**
   * @schema register
   * @description Schema para validar datos de registro de usuario
   * @property {string} email - Email válido (requerido, se convierte a minúsculas)
   * @property {string} password - Contraseña entre 8 y 128 caracteres (requerido)
   * @property {string} firstName - Nombre entre 1 y 50 caracteres (requerido, se trimea)
   * @property {string} lastName - Apellido entre 1 y 50 caracteres (requerido, se trimea)
   * @property {string} [username] - Username alfanumérico entre 3 y 30 caracteres (opcional, se convierte a minúsculas)
   * @property {string} [role] - Rol: 'student', 'instructor', 'admin' (opcional, default: 'student')
   */
  register: Joi.object({
    email: Joi.string().email().required().lowercase(),
    password: Joi.string().min(8).max(128).required(),
    firstName: Joi.string().trim().min(1).max(50).required(),
    lastName: Joi.string().trim().min(1).max(50).required(),
    username: Joi.string().alphanum().min(3).max(30).lowercase().optional(),
    role: Joi.string().valid('student', 'instructor', 'admin').optional(),
  }),

  /**
   * @schema login
   * @description Schema para validar credenciales de login
   * @property {string} email - Email válido (requerido, se convierte a minúsculas)
   * @property {string} password - Contraseña (requerido)
   */
  login: Joi.object({
    email: Joi.string().email().required().lowercase(),
    password: Joi.string().required(),
  }),

  /**
   * @schema updateProfile
   * @description Schema para validar datos de actualización de perfil
   * Todos los campos son opcionales - solo se validan los campos proporcionados
   * @property {string} [firstName] - Nuevo nombre entre 1 y 50 caracteres (opcional)
   * @property {string} [lastName] - Nuevo apellido entre 1 y 50 caracteres (opcional)
   * @property {string} [username] - Nuevo username alfanumérico entre 3 y 30 caracteres (opcional)
   * @property {string} [avatar] - URL válida para el avatar (opcional)
   * @property {Object} [preferences] - Objeto de preferencias (opcional)
   * @property {string} [preferences.language] - Código de idioma de 2 caracteres (opcional)
   * @property {string} [preferences.timezone] - Zona horaria (opcional)
   * @property {Object} [preferences.notifications] - Configuración de notificaciones (opcional)
   * @property {boolean} [preferences.notifications.email] - Notificaciones por email (opcional)
   * @property {boolean} [preferences.notifications.push] - Notificaciones push (opcional)
   * @property {Object} [learningProfile] - Perfil de aprendizaje (opcional)
   * @property {string} [learningProfile.level] - Nivel: 'beginner', 'intermediate', 'advanced' (opcional)
   * @property {Array} [learningProfile.skills] - Array de habilidades (opcional)
   * @property {string} [learningProfile.skills[].name] - Nombre de la habilidad (requerido si se proporciona skill)
   * @property {string} [learningProfile.skills[].level] - Nivel: 'beginner', 'intermediate', 'advanced', 'expert' (requerido si se proporciona skill)
   * @property {Array<string>} [learningProfile.interests] - Array de intereses (opcional)
   */
  updateProfile: Joi.object({
    firstName: Joi.string().trim().min(1).max(50).optional(),
    lastName: Joi.string().trim().min(1).max(50).optional(),
    username: Joi.string().alphanum().min(3).max(30).lowercase().optional(),
    avatar: Joi.string().uri().optional(),
    preferences: Joi.object({
      language: Joi.string().length(2).optional(),
      timezone: Joi.string().optional(),
      notifications: Joi.object({
        email: Joi.boolean().optional(),
        push: Joi.boolean().optional(),
      }).optional(),
    }).optional(),
    learningProfile: Joi.object({
      level: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
      skills: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          level: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert').required(),
        })
      ).optional(),
      interests: Joi.array().items(Joi.string()).optional(),
    }).optional(),
  }),

  /**
   * @schema changePassword
   * @description Schema para validar datos de cambio de contraseña
   * @property {string} currentPassword - Contraseña actual (requerido)
   * @property {string} newPassword - Nueva contraseña entre 8 y 128 caracteres (requerido)
   */
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(128).required(),
  }),
};

module.exports = userSchemas;

