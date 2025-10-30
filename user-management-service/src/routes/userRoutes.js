/**
 * @fileoverview User Routes - Definición de todas las rutas relacionadas con usuarios
 * @description Este módulo define todas las rutas HTTP para operaciones de usuarios,
 * incluyendo rutas públicas, protegidas y administrativas.
 */

const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const userSchemas = require('../schemas/userSchemas');

const router = express.Router();

// ============================================================================
// RUTAS PÚBLICAS (No requieren autenticación)
// ============================================================================

/**
 * @route POST /api/users/register
 * @description Registra un nuevo usuario en el sistema
 * @access Public
 * @middleware validate(userSchemas.register) - Valida los datos de entrada
 */
router.post('/register', validate(userSchemas.register), userController.register);

/**
 * @route POST /api/users/login
 * @description Autentica un usuario y retorna tokens de acceso
 * @access Public
 * @middleware validate(userSchemas.login) - Valida las credenciales
 */
router.post('/login', validate(userSchemas.login), userController.login);

// ============================================================================
// RUTAS PROTEGIDAS (Requieren autenticación con JWT)
// ============================================================================

/**
 * @route GET /api/users/profile
 * @description Obtiene el perfil del usuario autenticado
 * @access Private
 * @middleware authenticate - Verifica el token JWT
 */
router.get('/profile', authenticate, userController.getProfile);

/**
 * @route PUT /api/users/profile
 * @description Actualiza el perfil del usuario autenticado
 * @access Private
 * @middleware authenticate - Verifica el token JWT
 * @middleware validate(userSchemas.updateProfile) - Valida los datos de actualización
 */
router.put('/profile', authenticate, validate(userSchemas.updateProfile), userController.updateProfile);

/**
 * @route DELETE /api/users/account
 * @description Desactiva la cuenta del usuario autenticado (soft delete)
 * @access Private
 * @middleware authenticate - Verifica el token JWT
 */
router.delete('/account', authenticate, userController.deleteAccount);

/**
 * @route POST /api/users/change-password
 * @description Cambia la contraseña del usuario autenticado
 * @access Private
 * @middleware authenticate - Verifica el token JWT
 * @middleware validate(userSchemas.changePassword) - Valida las contraseñas
 */
router.post('/change-password', authenticate, validate(userSchemas.changePassword), userController.changePassword);

// ============================================================================
// RUTAS ADMINISTRATIVAS (Requieren autenticación y rol admin)
// ============================================================================

/**
 * @route GET /api/users/users
 * @description Lista todos los usuarios con paginación y filtros
 * @access Private/Admin
 * @middleware authenticate - Verifica el token JWT
 * @middleware authorize('admin') - Verifica que el usuario tenga rol admin
 * @query {number} [page=1] - Número de página
 * @query {number} [limit=10] - Resultados por página
 * @query {string} [role] - Filtrar por rol
 * @query {string} [search] - Búsqueda por email, nombre o apellido
 */
router.get('/users', authenticate, authorize('admin'), userController.getAllUsers);

/**
 * @route GET /api/users/users/:id
 * @description Obtiene un usuario específico por ID
 * @access Private/Admin
 * @middleware authenticate - Verifica el token JWT
 * @middleware authorize('admin') - Verifica que el usuario tenga rol admin
 * @param {string} id - ID del usuario (MongoDB ObjectId)
 */
router.get('/users/:id', authenticate, authorize('admin'), userController.getUserById);

module.exports = router;

