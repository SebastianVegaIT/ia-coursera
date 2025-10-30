/**
 * @fileoverview User Model - Modelo de datos para usuarios en MongoDB
 * @description Define el esquema de Mongoose para usuarios con validaciones,
 * hooks de pre-save para hashear contraseñas, y métodos de instancia útiles.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/env');

/**
 * @schema userSchema
 * @description Esquema de Mongoose que define la estructura del documento User
 * 
 * @property {String} email - Email del usuario (único, requerido, indexado)
 * @property {String} password - Contraseña hasheada (requerida si no hay OAuth)
 * @property {String} firstName - Nombre del usuario (requerido)
 * @property {String} lastName - Apellido del usuario (requerido)
 * @property {String} username - Nombre de usuario único (opcional, indexado)
 * @property {String} role - Rol: 'student', 'instructor', 'admin' (default: 'student')
 * @property {String} avatar - URL del avatar (opcional)
 * @property {Boolean} isEmailVerified - Estado de verificación de email
 * @property {String} emailVerificationToken - Token para verificar email
 * @property {String} passwordResetToken - Token para reset de contraseña
 * @property {Date} passwordResetExpires - Expiración del token de reset
 * @property {String} oauthProvider - Proveedor OAuth: 'google', 'github', null
 * @property {String} oauthId - ID del usuario en el proveedor OAuth
 * @property {Object} preferences - Preferencias del usuario
 * @property {Object} learningProfile - Perfil de aprendizaje del usuario
 * @property {Boolean} isActive - Estado activo/inactivo de la cuenta
 * @property {Date} lastLogin - Última fecha de login
 * @property {Array} refreshTokens - Array de refresh tokens JWT
 * @property {Date} createdAt - Fecha de creación (automático)
 * @property {Date} updatedAt - Fecha de última actualización (automático)
 */
const userSchema = new mongoose.Schema(
  {
    // ========================================================================
    // INFORMACIÓN BÁSICA
    // ========================================================================
    
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Convertir a minúsculas automáticamente
      trim: true, // Eliminar espacios al inicio y final
      index: true, // Índice para búsquedas rápidas
    },
    
    password: {
      type: String,
      required: function () {
        // Solo requerido si no hay proveedor OAuth
        return !this.oauthProvider;
      },
      minlength: 8,
      select: false, // No incluir en queries por defecto (seguridad)
    },
    
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    
    username: {
      type: String,
      unique: true,
      sparse: true, // Permite múltiples valores null sin conflicto
      trim: true,
      lowercase: true,
    },
    
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      default: 'student',
    },
    
    avatar: {
      type: String,
      default: null,
    },
    
    // ========================================================================
    // VERIFICACIÓN Y SEGURIDAD
    // ========================================================================
    
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    
    emailVerificationToken: {
      type: String,
      default: null,
    },
    
    passwordResetToken: {
      type: String,
      default: null,
    },
    
    passwordResetExpires: {
      type: Date,
      default: null,
    },
    
    // ========================================================================
    // OAUTH (Autenticación externa)
    // ========================================================================
    
    oauthProvider: {
      type: String,
      enum: ['google', 'github', null],
      default: null,
    },
    
    oauthId: {
      type: String,
      default: null,
    },
    
    // ========================================================================
    // PREFERENCIAS DEL USUARIO
    // ========================================================================
    
    preferences: {
      language: {
        type: String,
        default: 'es',
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
    },
    
    // ========================================================================
    // PERFIL DE APRENDIZAJE
    // ========================================================================
    
    learningProfile: {
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner',
      },
      skills: [{
        name: String,
        level: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        },
      }],
      interests: [String],
    },
    
    // ========================================================================
    // ESTADO Y SESIÓN
    // ========================================================================
    
    isActive: {
      type: Boolean,
      default: true,
    },
    
    lastLogin: {
      type: Date,
      default: null,
    },
    
    refreshTokens: [{
      token: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true, // Agrega automáticamente createdAt y updatedAt
    toJSON: {
      // Transformar el documento antes de convertirlo a JSON
      transform: function (doc, ret) {
        // Eliminar campos sensibles del JSON
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.emailVerificationToken;
        delete ret.passwordResetToken;
        return ret;
      },
    },
  }
);

// ============================================================================
// ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS
// ============================================================================

/**
 * Índices para mejorar el rendimiento de las consultas más comunes
 * - Email: búsquedas por email (login, registro)
 * - Username: búsquedas por username
 * - Skills: búsquedas por habilidades en el perfil de aprendizaje
 * - CreatedAt: ordenamiento por fecha de creación
 */
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'learningProfile.skills.name': 1 });
userSchema.index({ createdAt: -1 });

// ============================================================================
// HOOKS (Middleware de Mongoose)
// ============================================================================

/**
 * @hook pre-save
 * @description Hash automático de la contraseña antes de guardar
 * Solo hashea si el password fue modificado (evita re-hashear passwords ya hasheados)
 * 
 * @param {Function} next - Función para continuar el proceso de guardado
 */
userSchema.pre('save', async function (next) {
  // Solo hashear si el password fue modificado
  if (!this.isModified('password')) return next();
  
  try {
    // Generar salt con el número de rounds configurado
    const salt = await bcrypt.genSalt(config.bcrypt.saltRounds);
    // Hashear el password con el salt generado
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// MÉTODOS DE INSTANCIA
// ============================================================================

/**
 * @method comparePassword
 * @description Compara una contraseña en texto plano con la contraseña hasheada
 * @param {string} candidatePassword - Contraseña a verificar
 * @returns {Promise<boolean>} true si la contraseña coincide, false en caso contrario
 * 
 * @example
 * const user = await User.findOne({ email: 'test@example.com' });
 * const isMatch = await user.comparePassword('password123');
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * @method generateVerificationToken
 * @description Genera un token aleatorio para verificar el email del usuario
 * @returns {string} Token de verificación generado
 * 
 * @description El token se guarda en el documento y puede ser usado para
 * verificar el email del usuario mediante un enlace enviado por correo.
 */
userSchema.methods.generateVerificationToken = function () {
  const crypto = require('crypto');
  this.emailVerificationToken = crypto.randomBytes(32).toString('hex');
  return this.emailVerificationToken;
};

/**
 * @method generatePasswordResetToken
 * @description Genera un token aleatorio para resetear la contraseña
 * @returns {string} Token de reset generado
 * 
 * @description El token se guarda en el documento junto con una fecha de expiración
 * (1 hora por defecto). Puede ser usado para permitir al usuario resetear su contraseña.
 */
userSchema.methods.generatePasswordResetToken = function () {
  const crypto = require('crypto');
  this.passwordResetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetExpires = Date.now() + 3600000; // 1 hora desde ahora
  return this.passwordResetToken;
};

/**
 * @model User
 * @description Modelo de Mongoose para usuarios
 * @description Este modelo se utiliza para todas las operaciones CRUD con usuarios
 * en la base de datos MongoDB.
 */
const User = mongoose.model('User', userSchema);

module.exports = User;

