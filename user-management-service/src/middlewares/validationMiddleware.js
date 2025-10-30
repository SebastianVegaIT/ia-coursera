/**
 * @fileoverview Validation Middleware - Valida datos de entrada usando Joi
 * @description Middleware que valida los datos del cuerpo de la petición
 * contra un schema Joi antes de que lleguen al controlador.
 */

const { AppError } = require('../utils/errorHandler');

/**
 * @function validate
 * @description Middleware factory que retorna un middleware de validación
 * @param {Object} schema - Schema Joi para validar los datos
 * @returns {Function} Middleware de Express que valida req.body contra el schema
 * 
 * @example
 * // En las rutas:
 * router.post('/register', validate(userSchemas.register), userController.register);
 * 
 * @description Este middleware:
 * 1. Valida req.body contra el schema proporcionado
 * 2. Si hay errores, retorna un error 400 con detalles de validación
 * 3. Si es válido, continúa al siguiente middleware
 * 4. Strip unknown: elimina campos no definidos en el schema
 * 5. Abort early: false permite validar todos los campos antes de retornar errores
 */
const validate = (schema) => {
  return (req, res, next) => {
    console.log('🔍 [VALIDATION] Validando datos de entrada...');
    console.log('🔍 [VALIDATION] Body recibido:', JSON.stringify(req.body, null, 2));

    // Validar el cuerpo de la petición contra el schema
    const { error } = schema.validate(req.body, {
      abortEarly: false, // Validar todos los campos antes de retornar errores
      stripUnknown: true, // Eliminar campos no definidos en el schema
    });

    // Si hay errores de validación
    if (error) {
      // Formatear los errores en un objeto más legible
      const details = error.details.reduce((acc, detail) => {
        acc[detail.path.join('.')] = detail.message;
        return acc;
      }, {});
      
      console.error('❌ [VALIDATION] Error de validación:', details);
      // Crear error de validación con código 400 y detalles
      const validationError = new AppError('Validation failed', 400);
      validationError.details = details;
      return next(validationError);
    }

    console.log('✅ [VALIDATION] Validación exitosa');
    // Si la validación es exitosa, continuar al siguiente middleware
    next();
  };
};

module.exports = validate;

