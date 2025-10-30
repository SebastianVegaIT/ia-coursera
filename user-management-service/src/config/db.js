/**
 * @fileoverview Database Configuration - Conexión a MongoDB
 * @description Maneja la conexión a MongoDB usando Mongoose con configuración
 * optimizada y manejo de eventos de conexión y desconexión.
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');
const config = require('./env');

/**
 * @function connectDB
 * @description Establece conexión con MongoDB usando Mongoose
 * @returns {Promise<Connection>} Promesa que resuelve con la conexión de Mongoose
 * 
 * @description Esta función:
 * 1. Conecta a MongoDB usando la URI configurada
 * 2. Configura listeners para eventos de conexión, error y desconexión
 * 3. Implementa graceful shutdown para cerrar la conexión correctamente
 * 4. Termina el proceso si la conexión falla
 * 
 * @description Opciones de conexión:
 * - useNewUrlParser: Usar el nuevo parser de URLs de MongoDB
 * - useUnifiedTopology: Usar el nuevo motor de descubrimiento de servidores
 * - maxPoolSize: Número máximo de conexiones en el pool (10)
 * - serverSelectionTimeoutMS: Timeout para seleccionar servidor (5 segundos)
 * - socketTimeoutMS: Timeout para operaciones de socket (45 segundos)
 * 
 * @throws {Error} Si la conexión falla, termina el proceso con código 1
 * 
 * @example
 * const connection = await connectDB();
 * console.log('Conectado a MongoDB');
 */
const connectDB = async () => {
  try {
    // Opciones de conexión optimizadas para producción
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Máximo de conexiones simultáneas en el pool
      serverSelectionTimeoutMS: 5000, // Timeout para seleccionar servidor
      socketTimeoutMS: 45000, // Timeout para operaciones de socket
    };

    // Establecer conexión con MongoDB
    await mongoose.connect(config.mongodb.uri, options);

    // ========================================================================
    // EVENT LISTENERS PARA LA CONEXIÓN
    // ========================================================================

    // Evento cuando la conexión es exitosa
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully');
    });

    // Evento cuando hay un error en la conexión
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    // Evento cuando la conexión se desconecta
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // ========================================================================
    // GRACEFUL SHUTDOWN
    // ========================================================================

    // Manejar señal SIGINT (Ctrl+C) para cerrar la conexión correctamente
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return mongoose.connection;
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    // Terminar el proceso si no se puede conectar a la base de datos
    process.exit(1);
  }
};

module.exports = connectDB;

