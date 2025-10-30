# User Management Service

Microservicio de gestión de usuarios para la plataforma de aprendizaje en línea personalizada.

## 📋 Descripción

Este servicio proporciona todas las funcionalidades necesarias para la gestión de usuarios, incluyendo registro, autenticación, gestión de perfiles y administración de usuarios.

## 🚀 Características

- ✅ Registro y autenticación de usuarios
- ✅ Gestión de perfiles de usuario
- ✅ Roles y permisos (student, instructor, admin)
- ✅ JWT authentication con refresh tokens
- ✅ Validación de entrada con Joi
- ✅ Logging estructurado con Winston
- ✅ Manejo centralizado de errores
- ✅ Rate limiting
- ✅ Seguridad con Helmet y CORS
- ✅ Perfiles de aprendizaje personalizados
- ✅ Preparado para escalabilidad

## 📁 Estructura del Proyecto

```
user-management-service/
├── src/
│   ├── config/          # Configuraciones (DB, server, env)
│   ├── controllers/     # Controladores de rutas
│   ├── models/          # Modelos de MongoDB/Mongoose
│   ├── routes/          # Definición de rutas
│   ├── middlewares/     # Middlewares (auth, validation)
│   ├── services/        # Lógica de negocio
│   ├── schemas/         # Schemas de validación Joi
│   ├── utils/           # Utilidades (logger, errorHandler)
│   └── app.js           # Configuración de Express
├── tests/               # Tests unitarios e integración
├── logs/                # Logs de la aplicación
└── package.json
```

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
cd user-management-service
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/learning-platform-users
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret
```

4. **Asegúrate de que MongoDB esté corriendo**
```bash
# Con Docker
docker run -d -p 27017:27017 mongo

# O con MongoDB instalado localmente
mongod
```

## 🚀 Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

### Testing
```bash
npm test
npm run test:watch
```

## 📡 API Endpoints

### Autenticación Pública

- `POST /api/users/register` - Registro de nuevo usuario
- `POST /api/users/login` - Login de usuario

### Rutas Protegidas (requieren autenticación)

- `GET /api/users/profile` - Obtener perfil del usuario autenticado
- `PUT /api/users/profile` - Actualizar perfil del usuario
- `DELETE /api/users/account` - Desactivar cuenta del usuario
- `POST /api/users/change-password` - Cambiar contraseña

### Rutas Admin (requieren rol admin)

- `GET /api/users/users` - Listar todos los usuarios (con paginación)
- `GET /api/users/users/:id` - Obtener usuario por ID

### Health Check

- `GET /health` - Estado del servicio

## 📝 Ejemplos de Uso

### Registrar un nuevo usuario

```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "password123",
    "firstName": "Juan",
    "lastName": "Pérez",
    "username": "juanperez"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "password123"
  }'
```

### Obtener perfil (requiere token)

```bash
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Actualizar perfil

```bash
curl -X PUT http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan Carlos",
    "preferences": {
      "language": "es",
      "notifications": {
        "email": true,
        "push": false
      }
    },
    "learningProfile": {
      "level": "intermediate",
      "skills": [
        {
          "name": "JavaScript",
          "level": "advanced"
        }
      ],
      "interests": ["web development", "backend"]
    }
  }'
```

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt (12 salt rounds)
- JWT tokens con expiración configurable
- Refresh tokens para renovación automática
- Rate limiting (100 requests por 15 minutos)
- Helmet para headers de seguridad
- Validación de entrada con Joi
- Sanitización de datos

## 📊 Modelo de Usuario

El modelo de usuario incluye:

- Información básica (email, nombre, apellido, username)
- Autenticación (password, tokens, OAuth)
- Roles (student, instructor, admin)
- Preferencias (idioma, timezone, notificaciones)
- Perfil de aprendizaje (nivel, habilidades, intereses)
- Estado de cuenta (activo/inactivo, verificación de email)

## 🧪 Testing

Los tests están organizados en:
- `tests/userService.test.js` - Tests del servicio
- `tests/userController.test.js` - Tests de los controladores

Ejecutar tests:
```bash
npm test
```

## 📦 Dependencias Principales

- **express** - Framework web
- **mongoose** - ODM para MongoDB
- **bcryptjs** - Hashing de contraseñas
- **jsonwebtoken** - JWT authentication
- **joi** - Validación de esquemas
- **winston** - Logging
- **helmet** - Seguridad HTTP headers
- **express-rate-limit** - Rate limiting

## 🔧 Configuración

Las variables de entorno se validan automáticamente al iniciar el servidor. Ver `.env.example` para todas las opciones disponibles.

## 📈 Próximas Mejoras

- [ ] Verificación de email
- [ ] Reset de contraseña
- [ ] OAuth integration (Google, GitHub)
- [ ] Upload de avatares
- [ ] Notificaciones por email
- [ ] Integración con Redis para caché
- [ ] Eventos para otros microservicios

## 📄 Licencia

ISC

## 👥 Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

