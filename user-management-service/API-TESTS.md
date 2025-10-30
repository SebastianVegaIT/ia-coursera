# Guía de Pruebas de Endpoints API

## 🧪 Pruebas de Endpoints - User Management Service

### Configuración Inicial

**Base URL:** `http://localhost:3001`

---

## 1️⃣ Health Check

**Endpoint:** `GET /health`

**Request:**
```bash
curl http://localhost:3001/health
```

**Response esperado (200 OK):**
```json
{
  "status": "OK",
  "timestamp": "2025-10-30T17:44:34.816Z",
  "service": "user-management-service"
}
```

---

## 2️⃣ Registro de Usuario

**Endpoint:** `POST /api/users/register`

**Request:**
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

**Response esperado (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "usuario@example.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "username": "juanperez",
      "role": "student",
      ...
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

---

## 3️⃣ Login de Usuario

**Endpoint:** `POST /api/users/login`

**Request:**
```bash
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "password123"
  }'
```

**Response esperado (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

---

## 4️⃣ Obtener Perfil (Protegido)

**Endpoint:** `GET /api/users/profile`

**Headers requeridos:**
```
Authorization: Bearer <access_token>
```

**Request:**
```bash
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 5️⃣ Actualizar Perfil (Protegido)

**Endpoint:** `PUT /api/users/profile`

**Request:**
```bash
curl -X PUT http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan Carlos",
    "preferences": {
      "language": "en",
      "notifications": {
        "email": true,
        "push": false
      }
    },
    "learningProfile": {
      "level": "intermediate",
      "skills": [
        {"name": "JavaScript", "level": "advanced"}
      ],
      "interests": ["web development", "backend"]
    }
  }'
```

---

## 📝 Script de Prueba Completo

```bash
#!/bin/bash

BASE_URL="http://localhost:3001"

echo "=== Pruebas de API ==="

# 1. Health Check
curl -s "$BASE_URL/health" | python3 -m json.tool

# 2. Registrar usuario
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test'$(date +%s)'@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }')

# Extraer token
TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['tokens']['accessToken'])")

# 3. Obtener perfil
curl -s -X GET "$BASE_URL/api/users/profile" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

