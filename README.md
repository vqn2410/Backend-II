# Plataforma de Eventos e Inscripciones - Backend II

> **Institución:** Coderhouse  
> **Estudiante:** Vergara Nicolas  
> **Curso:** Programación Backend II: Diseño y Arquitectura Backend  
> **Comisión:** Comisión #94925  

---

## 📌 Temática del Proyecto
Sistema backend para una **Plataforma de Eventos e Inscripciones**. Permite a organizadores publicar conferencias, talleres y festivales, y a los usuarios registrarse, reservar entradas y gestionar su asistencia.

Esta entrega corresponde a la **Pre-entrega 2: Registro seguro de usuarios**, que suma sobre la base modular en capas de la Pre-entrega 1 el primer flujo real de usuarios: validación, normalización de email, hash de contraseña con **bcrypt** y persistencia en **MongoDB**, sin exponer información sensible.

---

## 🚀 Tecnologías
- **Node.js** (v20+)
- **Express.js** (Framework HTTP)
- **Mongoose** (Modelado de datos para MongoDB)
- **bcrypt** (Hash seguro de contraseñas)
- **Dotenv** (Gestión de variables de entorno)
- **Módulos ECMAScript (ESM)** (`import` / `export`)

---

## 📁 Estructura del Proyecto

```text
backend-ii-actividad/
├── src/
│   ├── app.js                 # Configuración de Express, middlewares y enrutadores (no levanta el server)
│   ├── server.js              # Inicialización y arranque del servidor HTTP
│   ├── config/                # Variables de entorno y configuraciones centrales
│   │   ├── index.js
│   │   └── database.js        # Conexión a MongoDB con Mongoose
│   ├── routes/                # Definición de rutas y endpoints
│   │   ├── health.router.js
│   │   ├── events.router.js
│   │   └── sessions.router.js
│   ├── controllers/           # Manejadores de solicitudes y respuestas HTTP
│   │   ├── health.controller.js
│   │   ├── events.controller.js
│   │   └── sessions.controller.js
│   ├── services/              # Capa de lógica de negocio (agnóstica a Express)
│   │   ├── events.service.js
│   │   └── sessions.service.js
│   ├── repositories/          # Abstracción entre servicios y acceso a datos
│   │   ├── events.repository.js
│   │   └── users.repository.js
│   ├── dao/                   # Data Access Object (operaciones sobre la DB)
│   │   ├── events.dao.js
│   │   └── users.dao.js
│   ├── models/                # Esquemas y modelos de persistencia (Mongoose)
│   │   ├── User.js
│   │   └── Event.js
│   ├── middlewares/           # Middlewares transversales y manejo global de errores
│   │   └── errorHandler.js
│   └── utils/                 # Funciones de soporte y utilitarios
│       ├── index.js
│       └── hash.js            # Helper reutilizable de bcrypt (hash y comparación)
├── .env                       # Variables de entorno locales (ignorado por git)
├── .env.example               # Plantilla de variables de entorno de ejemplo
├── .gitignore                 # Archivos y directorios excluidos del repositorio
├── package.json               # Dependencias, scripts y configuración ESM
└── README.md                  # Documentación del proyecto
```

---

## ⚙️ Configuración de Variables de Entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Configura los valores según tu entorno:

| Variable | Descripción | Valor por defecto |
| :--- | :--- | :--- |
| `PORT` | Puerto en el que escucha el servidor | `8080` |
| `NODE_ENV` | Entorno de ejecución (`development`, `production`) | `development` |
| `MONGO_URL` | URI de conexión a la base de datos MongoDB | `mongodb://localhost:27017/eventos_db` |
| `JWT_SECRET` | Clave secreta para firma y verificación de tokens | `tu_secreto_jwt_aqui` |

---

## 🛠️ Instalación y Ejecución

### 1. Clonar e instalar dependencias
```bash
git clone <URL_DEL_REPOSITORIO>
cd backend-ii-actividad
npm install
```

### 2. Ejecución

* **Modo desarrollo (con recarga automática):**
  ```bash
  npm run dev
  ```

* **Modo producción:**
  ```bash
  npm start
  ```

---

## 🛣️ Rutas Disponibles

### 1. Estado del Servidor (Health Check)
* **GET `/api/health`**
  * **Código HTTP:** `200 OK`
  * **Respuesta:**
    ```json
    {
      "status": "ok",
      "message": "Servidor activo"
    }
    ```

### 2. Eventos
* **GET `/api/events`**
  * **Código HTTP:** `200 OK`
  * **Respuesta:**
    ```json
    {
      "status": "success",
      "payload": []
    }
    ```

### 3. Registro de Usuarios (Autenticación)

* **POST `/api/sessions/register`**
  * Registra un nuevo usuario de forma segura (validación + normalización + hash + persistencia).
  * **Campos esperados en el body (JSON):**

    | Campo | Tipo | Requerido | Descripción |
    | :--- | :--- | :--- | :--- |
    | `first_name` | string | ✅ | Nombre del usuario |
    | `last_name` | string | ✅ | Apellido del usuario |
    | `email` | string | ✅ | Email del usuario (se normaliza: `trim` + `lowercase`) |
    | `password` | string | ✅ | Contraseña (mínimo 8 caracteres, se guarda hasheada con bcrypt) |

  * **Reglas de validación:**
    1. `first_name`, `last_name`, `email` y `password` son obligatorios.
    2. El `email` debe tener un formato válido (`algo@dominio.tld`).
    3. La `password` debe tener al menos **8 caracteres**.
    4. El `email` se **normaliza** (trim + lowercase) antes de validar y guardar.
    5. El registro se **rechaza si el email ya existe**.
    6. La `password` se **hashea con bcrypt** (nunca se guarda en texto plano).
    7. El `role` **no puede manipularse desde el body**: siempre se asigna el valor por defecto `user`.

  * **Respuesta `201 Created` (éxito, email normalizado y SIN password):**
    ```json
    {
      "status": "success",
      "payload": {
        "id": "665f2a1b2c3d4e5f6a7b8c9d",
        "first_name": "Ana",
        "last_name": "Pérez",
        "email": "ana@mail.com",
        "role": "user"
      }
    }
    ```

  * **Respuesta `400 Bad Request` (campos faltantes, email inválido o contraseña corta):**
    ```json
    { "status": "error", "message": "Faltan campos obligatorios" }
    ```

  * **Respuesta `409 Conflict` (email ya registrado):**
    ```json
    { "status": "error", "message": "El email ya está registrado" }
    ```

### 4. Sesiones (Estructura base para próximos módulos)
* **POST `/api/sessions/login`**
  * Estructura base para el futuro inicio de sesión y emisión de JWT.
* **GET `/api/sessions/current`**
  * Estructura base para recuperar el perfil del usuario autenticado.

---

## 🧪 Cómo probar el registro (con `curl`)

> Requisito previo: tener MongoDB corriendo en `MONGO_URL` (por defecto `mongodb://localhost:27017/eventos_db`) y el servidor levantado con `npm run dev`.

**1. Registro exitoso**
```bash
curl -X POST http://localhost:8080/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{ "first_name": "Ana", "last_name": "Pérez", "email": " Ana@Mail.com ", "password": "Secreta123" }'
```

**2. Campos faltantes** (espera `400`)
```bash
curl -X POST http://localhost:8080/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{ "first_name": "Ana" }'
```

**3. Email con formato inválido** (espera `400`)
```bash
curl -X POST http://localhost:8080/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{ "first_name": "Ana", "last_name": "Pérez", "email": "correo-invalido", "password": "Secreta123" }'
```

**4. Email ya registrado** (espera `409`)
```bash
curl -X POST http://localhost:8080/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{ "first_name": "Ana", "last_name": "Pérez", "email": "ana@mail.com", "password": "Secreta123" }'
```

**5. Verificar que la contraseña está hasheada en la base de datos** (con `mongosh`)
```bash
mongosh eventos_db --eval 'db.users.find({}, { first_name: 1, email: 1, password: 1 })'
```
El campo `password` debe mostrarse como un hash de bcrypt (empieza con `$2b$`), **nunca** como `Secreta123`.

---

## 📋 Modelos Base Creados

* **`User` (`src/models/User.js`):** `first_name`, `last_name`, `email` (único), `password` (con `select: false` para no exponerlo por defecto), `role` (`user`, `organizer`, `admin`; por defecto `user`), marcas de tiempo (`createdAt`, `updatedAt`). El serializado (`toJSON`) expone `id` y **omite** `password`.
* **`Event` (`src/models/Event.js`):** `title`, `description`, `date`, `location`, `capacity`, `price`, `status`, marcas de tiempo (`createdAt`, `updatedAt`).
