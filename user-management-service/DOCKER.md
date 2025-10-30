# 🐳 Guía de Docker - User Management Service

Esta guía explica cómo usar Docker para ejecutar la aplicación User Management Service junto con MongoDB.

## 📋 Requisitos Previos

- Docker Engine >= 20.10
- Docker Compose >= 2.0
- Al menos 2GB de RAM disponible
- Al menos 1GB de espacio en disco

## 🚀 Inicio Rápido

### Desarrollo

```bash
# Construir y ejecutar en modo desarrollo (con hot-reload)
docker-compose -f docker-compose.dev.yml up --build

# O en segundo plano
docker-compose -f docker-compose.dev.yml up -d --build
```

### Producción

```bash
# Construir y ejecutar en modo producción
docker-compose up --build

# O en segundo plano
docker-compose up -d --build
```

## 📁 Estructura de Archivos Docker

```
user-management-service/
├── Dockerfile                 # Dockerfile para producción (multi-stage)
├── Dockerfile.dev             # Dockerfile para desarrollo
├── docker-compose.yml         # Configuración para producción
├── docker-compose.dev.yml     # Configuración para desarrollo
├── .dockerignore              # Archivos excluidos del contexto Docker
└── .env.docker.example        # Ejemplo de variables de entorno
```

## 🔧 Configuración

### Variables de Entorno

1. Copia el archivo de ejemplo:
```bash
cp .env.docker.example .env.docker
```

2. Edita `.env.docker` con tus valores:
```bash
# Valores importantes a cambiar:
JWT_SECRET=tu-secreto-super-seguro-minimo-32-caracteres
JWT_REFRESH_SECRET=tu-secreto-refresh-super-seguro-minimo-32-caracteres
MONGO_ROOT_PASSWORD=contraseña-segura-mongodb
```

3. Carga las variables antes de ejecutar docker-compose:
```bash
export $(cat .env.docker | xargs)
docker-compose up --build
```

O usa `--env-file`:
```bash
docker-compose --env-file .env.docker up --build
```

## 📦 Servicios

### 1. MongoDB (`mongodb`)

- **Puerto**: 27017 (configurable)
- **Usuario root**: `admin` (configurable)
- **Base de datos**: `user_management` (configurable)
- **Volúmenes**: 
  - `mongodb_data`: Datos persistentes
  - `mongodb_config`: Configuración

**Conexión desde el host:**
```bash
mongosh mongodb://admin:admin123@localhost:27017/user_management?authSource=admin
```

### 2. User Management Service (`app`)

- **Puerto**: 3001 (configurable)
- **Health Check**: `http://localhost:3001/health`
- **Endpoints**: Ver `ROUTES.md`

## 🛠️ Comandos Útiles

### Ver logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo la aplicación
docker-compose logs -f app

# Solo MongoDB
docker-compose logs -f mongodb
```

### Ejecutar comandos en contenedores

```bash
# En la aplicación
docker-compose exec app sh

# En MongoDB
docker-compose exec mongodb mongosh

# Ejecutar tests
docker-compose exec app npm test
```

### Detener servicios

```bash
# Detener y eliminar contenedores
docker-compose down

# Detener y eliminar contenedores + volúmenes (⚠️ elimina datos)
docker-compose down -v
```

### Reconstruir imágenes

```bash
# Reconstruir sin caché
docker-compose build --no-cache

# Reconstruir solo un servicio
docker-compose build app
```

### Limpiar recursos Docker

```bash
# Eliminar contenedores detenidos
docker container prune

# Eliminar imágenes no utilizadas
docker image prune

# Eliminar volúmenes no utilizados (⚠️ cuidado)
docker volume prune

# Limpieza completa (⚠️ elimina todo)
docker system prune -a --volumes
```

## 🔍 Verificación y Troubleshooting

### Verificar que los servicios están corriendo

```bash
# Estado de los contenedores
docker-compose ps

# Health checks
docker-compose ps --format "table {{.Name}}\t{{.Status}}"
```

### Verificar logs de errores

```bash
# Ver últimos 100 líneas de logs
docker-compose logs --tail=100 app

# Buscar errores específicos
docker-compose logs app | grep -i error
```

### Verificar conectividad

```bash
# Health check de la aplicación
curl http://localhost:3001/health

# Conectarse a MongoDB desde el host
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### Problemas Comunes

#### 1. Puerto ya en uso

**Error**: `Bind for 0.0.0.0:3001 failed: port is already allocated`

**Solución**:
```bash
# Cambiar el puerto en docker-compose.yml o .env.docker
PORT=3002
```

#### 2. MongoDB no se conecta

**Error**: `MongoNetworkError: connect ECONNREFUSED`

**Solución**:
```bash
# Verificar que MongoDB está corriendo
docker-compose ps mongodb

# Ver logs de MongoDB
docker-compose logs mongodb

# Verificar que el health check pasó
docker-compose ps mongodb
```

#### 3. Permisos de volúmenes

**Error**: `Permission denied` al acceder a volúmenes

**Solución**:
```bash
# En Linux, ajustar permisos
sudo chown -R 1001:1001 ./logs
```

#### 4. Variables de entorno no cargadas

**Error**: `Config validation error`

**Solución**:
```bash
# Asegúrate de que todas las variables requeridas estén definidas
# Verifica .env.docker o usa --env-file
docker-compose --env-file .env.docker up
```

## 🏗️ Arquitectura de las Imágenes

### Dockerfile (Producción)

- **Multi-stage build** para optimizar tamaño
- **Stage 1**: Instala dependencias de producción
- **Stage 2**: Instala todas las dependencias y ejecuta tests
- **Stage 3**: Imagen final solo con dependencias de producción y código

### Dockerfile.dev (Desarrollo)

- Instala todas las dependencias (incluyendo devDependencies)
- Monta código fuente como volumen para hot-reload
- Usa `nodemon` para auto-recarga

## 📊 Volúmenes y Persistencia

### Volúmenes Nombre

1. **mongodb_data**: Datos de MongoDB
2. **mongodb_config**: Configuración de MongoDB
3. **logs**: Logs de la aplicación (solo en desarrollo)

### Backup de Datos

```bash
# Backup de MongoDB
docker-compose exec mongodb mongodump --archive=/tmp/backup.archive --gzip

# Restaurar backup
docker-compose exec mongodb mongorestore --archive=/tmp/backup.archive --gzip
```

## 🔒 Seguridad

### Buenas Prácticas

1. **Nunca** subas `.env.docker` con credenciales reales al repositorio
2. Usa **secretos de Docker** en producción
3. Cambia las contraseñas por defecto
4. Usa JWT secrets fuertes (mínimo 32 caracteres)
5. Limita el acceso a los puertos expuestos

### Secretos en Producción

```yaml
# docker-compose.prod.yml
services:
  app:
    secrets:
      - jwt_secret
      - mongodb_password

secrets:
  jwt_secret:
    external: true
  mongodb_password:
    external: true
```

## 🚢 Despliegue

### Build y Push de Imagen

```bash
# Build
docker build -t user-management-service:latest .

# Tag para registry
docker tag user-management-service:latest registry.example.com/user-management-service:v1.0.0

# Push
docker push registry.example.com/user-management-service:v1.0.0
```

### Usar Imagen desde Registry

```yaml
# En docker-compose.yml
services:
  app:
    image: registry.example.com/user-management-service:v1.0.0
    # En lugar de build:
    # build:
    #   context: .
    #   dockerfile: Dockerfile
```

## 📝 Ejemplos de Uso

### Desarrollo Local

```bash
# Iniciar servicios
docker-compose -f docker-compose.dev.yml up

# En otra terminal, ejecutar tests
docker-compose -f docker-compose.dev.yml exec app npm test

# Ver logs en tiempo real
docker-compose -f docker-compose.dev.yml logs -f app
```

### Testing

```bash
# Ejecutar tests
docker-compose exec app npm test

# Ejecutar tests con coverage
docker-compose exec app npm test -- --coverage
```

### Producción

```bash
# Build y ejecutar
docker-compose up -d --build

# Verificar estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Actualizar aplicación
docker-compose pull app
docker-compose up -d app
```

## 📚 Referencias

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker Image](https://hub.docker.com/_/mongo)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

## 🆘 Soporte

Si encuentras problemas:

1. Verifica los logs: `docker-compose logs`
2. Verifica el estado: `docker-compose ps`
3. Verifica las variables de entorno
4. Consulta la documentación de Docker
5. Revisa los issues en el repositorio

