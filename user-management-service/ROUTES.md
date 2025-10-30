# Rutas Disponibles - User Management Service

## Endpoints Disponibles

### 1. Health Check
```
GET /health
```
**Respuesta:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-30T17:42:36.675Z",
  "service": "user-management-service"
}
```

---

### 2. Autenticación Pública

#### Registro de Usuario
```
POST /api/users/register
```
**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "username": "juanperez"
}
```

#### Login de Usuario
```
POST /api/users/login
```
**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

---

### 3. Rutas Protegidas (requieren token Bearer)

#### Obtener Perfil
```
GET /api/users/profile
```
**Headers:**
```
Authorization: Bearer <access_token>
```

#### Actualizar Perfil
```
PUT /api/users/profile
```
**Headers:**
```
Authorization: Bearer <access_token>
```
**Body:**
```json
{
  "firstName": "Juan Carlos",
  "preferences": {
    "language": "es"
  }
}
```

#### Cambiar Contraseña
```
POST /api/users/change-password
```
**Headers:**
```
Authorization: Bearer <access_token>
```
**Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

#### Eliminar Cuenta
```
DELETE /api/users/account
```
**Headers:**
```
Authorization: Bearer <access_token>
```

---

### 4. Rutas Admin (requieren rol admin)

#### Listar Usuarios
```
GET /api/users/users?page=1&limit=10&role=student&search=test
```
**Headers:**
```
Authorization: Bearer <admin_access_token>
```

#### Obtener Usuario por ID
```
GET /api/users/users/:id
```
**Headers:**
```
Authorization: Bearer <admin_access_token>
```

---

## Ejemplos de Uso con cURL

### Registrar usuario:
```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "password123",
    "firstName": "Juan",
    "lastName": "Pérez"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "password123"
  }'
```

### Obtener perfil:
```bash
TOKEN="tu_access_token_aqui"
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## Errores Comunes

### 404 Route not found
**Causa:** La ruta solicitada no existe
**Solución:** Verifica que estés usando una de las rutas listadas arriba

### 401 Unauthorized
**Causa:** Token faltante o inválido
**Solución:** Incluye el header `Authorization: Bearer <token>`

### 403 Forbidden
**Causa:** No tienes permisos suficientes
**Solución:** Necesitas rol de admin para rutas administrativas

### 400 Validation failed
**Causa:** Los datos enviados no cumplen con la validación
**Solución:** Verifica el formato de los datos según el schema

---

## Notas Importantes

- Todas las rutas bajo `/api/users/*` requieren el prefijo `/api/users`
- Las rutas protegidas requieren el header `Authorization: Bearer <token>`
- El token se obtiene al hacer login o registro exitoso
- El health check está disponible en `/health` sin autenticación

