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
- **jsonwebtoken** (Firma y verificación de JWT)
- **cookie-parser** (Lectura y escritura de cookies)
- **Dotenv** (Gestión de variables de entorno)
- **Módulos ECMAScript (ESM)** (`import` / `export`)
- **Jest** (framework de tests)
- **Supertest** (cliente HTTP para tests de endpoints)
- **mongodb-memory-server** (MongoDB en memoria para tests, sin levantar una instancia a mano)

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
│   │   ├── errorHandler.js
│   │   └── auth.middleware.js # Autenticación por JWT (cookie httpOnly / Bearer)
│   └── utils/                 # Funciones de soporte y utilitarios
│       ├── index.js
│       ├── hash.js            # Helper reutilizable de bcrypt (hash y comparación)
│       └── jwt.js             # Firma y verificación de tokens JWT
├── test/                      # Tests automatizados (Jest + Supertest)
│   ├── helpers/mongo.js       # MongoDB en memoria compartido entre suites
│   ├── sessions.register.test.js
│   ├── sessions.auth.test.js  # login + current
│   └── errorHandler.test.js
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
| `JWT_EXPIRES_IN` | Tiempo de vida del token JWT | `24h` |
| `COOKIE_NAME` | Nombre de la cookie donde se guarda el JWT | `token` |

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
    2. Los campos de presencia se validan tras aplicar `trim`: un string vacío o compuesto **solo por espacios** se rechaza con `400` (no llega a fallar en Mongoose con `500`).
    3. El `email` debe tener un formato válido (`algo@dominio.tld`).
    4. La `password` debe tener al menos **8 caracteres**.
    5. El `email` se **normaliza** (trim + lowercase) antes de validar y guardar.
    6. El registro se **rechaza si el email ya existe** (409).
    7. Una **colisión del índice único** (`E11000`), p. ej. por una carrera concurrente sobre el mismo email, se mapea a `409` en el `errorHandler` en lugar de `500`.
    8. La `password` se **hashea con bcrypt** (nunca se guarda en texto plano).
    9. El `role` **no puede manipularse desde el body**: siempre se asigna el valor por defecto `user`.

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

### 4. Login de Usuarios (Autenticación con JWT)

* **POST `/api/sessions/login`**
  * Autentica un usuario con `email` y `password`, valida el hash con `bcrypt` y emite un **JWT** que se envía en una **cookie `httpOnly`** (no accesible desde JavaScript del cliente).
  * **Campos esperados en el body (JSON):**

    | Campo | Tipo | Requerido | Descripción |
    | :--- | :--- | :--- | :--- |
    | `email` | string | ✅ | Email del usuario (se normaliza: `trim` + `lowercase`) |
    | `password` | string | ✅ | Contraseña en texto plano (se compara contra el hash) |

  * **Respuesta `200 OK` (éxito):** setea la cookie `token` y devuelve el perfil (sin `password`):
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

  * **Respuesta `400 Bad Request` (faltan email o contraseña):**
    ```json
    { "status": "error", "message": "Email y contraseña son obligatorios" }
    ```

  * **Respuesta `401 Unauthorized` (credenciales inválidas):**
    ```json
    { "status": "error", "message": "Credenciales inválidas" }
    ```

### 5. Sesión actual (protegida)

* **GET `/api/sessions/current`**
  * Requiere autenticación (cookie `token` válida o header `Authorization: Bearer <token>`).
  * **Respuesta `200 OK`:** devuelve el perfil del usuario autenticado (sin `password`).
  * **Respuesta `401 Unauthorized` (sin token / token inválido o expirado):**
    ```json
    { "status": "error", "message": "No autenticado" }
    ```

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

## 🔐 Cómo probar login y sesión actual (con `curl`)

> Requisito: tener un usuario registrado (ver sección anterior) y el servidor levantado.

**1. Login exitoso** (guarda la cookie en un archivo para usarla luego)
```bash
curl -X POST http://localhost:8080/api/sessions/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{ "email": "ana@mail.com", "password": "Secreta123" }'
```

**2. Login con credenciales inválidas** (espera `401`)
```bash
curl -X POST http://localhost:8080/api/sessions/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "ana@mail.com", "password": "incorrecta" }'
```

**3. Sesión actual con cookie** (espera `200` con el perfil)
```bash
curl -X GET http://localhost:8080/api/sessions/current \
  -b cookies.txt
```

**4. Sesión actual sin cookie** (espera `401`)
```bash
curl -X GET http://localhost:8080/api/sessions/current
```

**5. Sesión actual con header Bearer** (alternativa a la cookie)
```bash
TOKEN=$(node -e "const { sign } = require('jsonwebtoken'); console.log(sign({ id: 'x', email: 'ana@mail.com', role: 'user' }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '24h' }))")
curl -X GET http://localhost:8080/api/sessions/current \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🧪 Tests automatizados

El proyecto incluye una suite de tests con **Jest + Supertest** que levanta una instancia de **MongoDB en memoria** (`mongodb-memory-server`), por lo que **no hace falta tener MongoDB corriendo a mano** para validar los flujos.

```bash
npm test          # ejecuta la suite completa una vez
npm run test:watch  # modo watch (recarga al cambiar archivos)
```

### Cobertura

* **`POST /api/sessions/register`** (`test/sessions.register.test.js`):
  * `201` — registro exitoso, sin exponer `password` ni `_id`.
  * `201` — normalización del email (`trim` + `lowercase`).
  * `201` — el campo `role` del body se ignora (siempre queda `user`).
  * `409` — email ya registrado.
  * `400` — campos faltantes.
  * `400` — campos de solo espacios (`"   "`).
  * `400` — email con formato inválido.
  * `400` — contraseña demasiado corta.
  * Verificación de que la contraseña queda **hasheada** en la base (`$2b$...`).

* **`POST /api/sessions/login` y `GET /api/sessions/current`** (`test/sessions.auth.test.js`):
  * `200` — login exitoso (setea cookie `httpOnly` con el JWT).
  * `200` — normalización del email en el login.
  * `401` — contraseña incorrecta / email no registrado.
  * `400` — faltan email o contraseña.
  * `200` — `/current` con cookie válida (devuelve el perfil sin `password`).
  * `401` — `/current` sin cookie o con token inválido.

* **`errorHandler`** (`test/errorHandler.test.js`):
  * Mapeo del error `E11000` (clave duplicada) a `409` en vez de `500`.
  * Preservación del `statusCode` de los errores de negocio (`400`, etc.).
  * `500` como valor por defecto para errores inesperados.

---

## 📋 Modelos Base Creados

* **`User` (`src/models/User.js`):** `first_name`, `last_name`, `email` (único), `password` (con `select: false` para no exponerlo por defecto), `role` (`user`, `organizer`, `admin`; por defecto `user`), marcas de tiempo (`createdAt`, `updatedAt`). El serializado (`toJSON`) expone `id` y **omite** `password`.
* **`Event` (`src/models/Event.js`):** `title`, `description`, `date`, `location`, `capacity`, `price`, `status`, marcas de tiempo (`createdAt`, `updatedAt`).

---

## ✅ Módulo de autenticación (implementado)

El módulo de **login, JWT, cookies y la ruta `current`** ya está implementado sobre la arquitectura en capas:

* **Login** — `SessionsService.login` busca al usuario por email normalizado, recupera el hash con `.select('+password')` y lo valida con `comparePassword` (`src/utils/hash.js`); responde `401` ante credenciales inválidas.
* **JWT** — `src/utils/jwt.js` firma y verifica tokens con `JWT_SECRET` (y `JWT_EXPIRES_IN`).
* **Cookie** — el controlador setea una cookie `httpOnly` (segura en producción) con el token; `cookie-parser` la lee en las rutas protegidas.
* **`GET /api/sessions/current`** — `auth.middleware.js` valida el token (cookie o header `Authorization: Bearer`) y expone `req.user` sin `password`.

### Siguientes pasos sugeridos

* Emitir JWT con expiración más corta para `access token` + `refresh token`.
* Añadir middleware de autorización por `role` (`user`, `organizer`, `admin`).
* Endpoint de cierre de sesión (`logout`) que limpie la cookie.
* Rate limiting y protección contra fuerza bruta en el login.
