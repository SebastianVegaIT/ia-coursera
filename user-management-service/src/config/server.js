/**
 * @fileoverview Server Entry Point - Punto de entrada del servidor
 * @description Este archivo es el punto de entrada principal que:
 * 1. Conecta a MongoDB
 * 2. Inicia el servidor Express
 * 3. Maneja el graceful shutdown
 * 4. Maneja errores no capturados
 */

const app = require('../app');
const config = require('./env');
const logger = require('../utils/logger');
const connectDB = require('./db');

// ============================================================================
// INICIALIZACIÓN DEL SERVIDOR
// ============================================================================

/**
 * Conectar a MongoDB y luego iniciar el servidor Express
 * Si la conexión a la BD falla, el proceso termina con código 1
 */
connectDB()
  .then(() => {
    // Iniciar servidor HTTP en el puerto configurado
    const server = app.listen(config.port, () => {
      logger.info(`User Management Service running on port ${config.port} in ${config.env} mode`);
    });

    // ========================================================================
    // GRACEFUL SHUTDOWN
    // ========================================================================

    /**
     * @function gracefulShutdown
     * @description Cierra el servidor de forma ordenada cuando se recibe señal de terminación
     * 
     * @description Flujo:
     * 1. Cierra el servidor HTTP para dejar de aceptar nuevas conexiones
     * 2. Espera a que las conexiones existentes terminen
     * 3. Si después de 10 segundos aún hay conexiones, fuerza el cierre
     */
    const gracefulShutdown = () => {
      logger.info('Received shutdown signal, closing server gracefully...');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Timeout de seguridad: forzar cierre después de 10 segundos
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Escuchar señales de terminación del sistema operativo
    process.on('SIGTERM', gracefulShutdown); // Señal de terminación estándar
    process.on('SIGINT', gracefulShutdown);  // Ctrl+C

    // ========================================================================
    // MANEJO DE ERRORES NO CAPTURADOS
    // ========================================================================

    /**
     * Manejar promesas rechazadas no capturadas
     * Previene que el proceso se cuelgue con errores no manejados
     */
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Rejection:', err);
      server.close(() => {
        process.exit(1);
      });
    });
  })
  .catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });

