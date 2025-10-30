# ============================================================================
# Dockerfile para User Management Service
# ============================================================================
# Multi-stage build para optimizar el tamaño de la imagen final

# ============================================================================
# STAGE 1: Dependencies - Instalar dependencias
# ============================================================================
FROM node:18-alpine AS dependencies

# Metadatos
LABEL maintainer="user-management-service"
LABEL description="User Management Service para plataforma de aprendizaje"

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias de producción y desarrollo
# Usa npm install si no existe package-lock.json, npm ci si existe
RUN if [ -f package-lock.json ]; then \
      npm ci --only=production; \
    else \
      npm install --only=production; \
    fi && \
    npm cache clean --force

# ============================================================================
# STAGE 2: Builder - Compilar y preparar la aplicación
# ============================================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package.json package-lock.json* ./

# Instalar todas las dependencias (incluyendo devDependencies para tests)
# Usa npm install si no existe package-lock.json, npm ci si existe
RUN if [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi && \
    npm cache clean --force

# Copiar código fuente
COPY . .

# Ejecutar tests (opcional, descomentar si quieres tests en el build)
# RUN npm test

# ============================================================================
# STAGE 3: Production - Imagen final optimizada
# ============================================================================
FROM node:18-alpine AS production

# Información de la imagen
LABEL maintainer="user-management-service"
LABEL description="User Management Service - Imagen de producción"

# Crear usuario no-root para mayor seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar node_modules desde stage de dependencies
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar código fuente desde stage de builder
COPY --from=builder --chown=nodejs:nodejs /app/src ./src
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/public ./public

# Crear directorio de logs con permisos correctos
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Cambiar al usuario no-root
USER nodejs

# Exponer puerto de la aplicación
EXPOSE 3001

# Health check para verificar que la aplicación está funcionando
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Variable de entorno para modo producción
ENV NODE_ENV=production

# Comando para iniciar la aplicación
CMD ["node", "src/config/server.js"]

