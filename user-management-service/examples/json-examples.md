# Ejemplos de Respuestas JSON - User Management Service

## 1. Registro de Usuario (POST /api/users/register)

### Request:
```json
{
  "email": "usuario@example.com",
  "password": "password123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "username": "juanperez",
  "role": "student"
}
```

### Response (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "6903a322371aae28a73bcc11",
      "email": "usuario@example.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "username": "juanperez",
      "role": "student",
      "avatar": null,
      "isEmailVerified": false,
      "emailVerificationToken": null,
      "passwordResetToken": null,
      "passwordResetExpires": null,
      "oauthProvider": null,
      "oauthId": null,
      "preferences": {
        "language": "es",
        "timezone": "UTC",
        "notifications": {
          "email": true,
          "push": true
        }
      },
      "learningProfile": {
        "level": "beginner",
        "skills": [],
        "interests": []
      },
      "isActive": true,
      "lastLogin": null,
      "createdAt": "2025-10-30T17:40:50.781Z",
      "updatedAt": "2025-10-30T17:40:50.781Z",
      "__v": 0
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

---

## 2. Login de Usuario (POST /api/users/login)

### Request:
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

### Response (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "6903a322371aae28a73bcc11",
      "email": "usuario@example.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "username": "juanperez",
      "role": "student",
      "avatar": null,
      "isEmailVerified": false,
      "preferences": {
        "language": "es",
        "timezone": "UTC",
        "notifications": {
          "email": true,
          "push": true
        }
      },
      "learningProfile": {
        "level": "beginner",
        "skills": [],
        "interests": []
      },
      "isActive": true,
      "lastLogin": "2025-10-30T17:40:59.234Z",
      "createdAt": "2025-10-30T17:40:50.781Z",
      "updatedAt": "2025-10-30T17:40:59.248Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

---

## 3. Obtener Perfil (GET /api/users/profile)

### Headers:
```
Authorization: Bearer <access_token>
```

### Response (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "6903a322371aae28a73bcc11",
      "email": "usuario@example.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "username": "juanperez",
      "role": "student",
      "avatar": null,
      "isEmailVerified": false,
      "preferences": {
        "language": "es",
        "timezone": "UTC",
        "notifications": {
          "email": true,
          "push": true
        }
      },
      "learningProfile": {
        "level": "beginner",
        "skills": [],
        "interests": []
      },
      "isActive": true,
      "lastLogin": "2025-10-30T17:40:59.234Z",
      "createdAt": "2025-10-30T17:40:50.781Z",
      "updatedAt": "2025-10-30T17:40:59.248Z"
    }
  }
}
```

---

## Estructura Completa del Modelo de Usuario

```json
{
  "_id": "ObjectId de MongoDB",
  "email": "usuario@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "username": "juanperez",
  "role": "student | instructor | admin",
  "avatar": "URL del avatar o null",
  "isEmailVerified": false,
  "emailVerificationToken": "token o null",
  "passwordResetToken": "token o null",
  "passwordResetExpires": "Date o null",
  "oauthProvider": "google | github | null",
  "oauthId": "ID del proveedor OAuth o null",
  "preferences": {
    "language": "es | en | etc",
    "timezone": "UTC",
    "notifications": {
      "email": true,
      "push": true
    }
  },
  "learningProfile": {
    "level": "beginner | intermediate | advanced",
    "skills": [
      {
        "name": "JavaScript",
        "level": "beginner | intermediate | advanced | expert"
      }
    ],
    "interests": ["web development", "backend"]
  },
  "isActive": true,
  "lastLogin": "2025-10-30T17:40:59.234Z",
  "createdAt": "2025-10-30T17:40:50.781Z",
  "updatedAt": "2025-10-30T17:40:59.248Z"
}
```

