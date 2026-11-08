# Plataforma de Eventos e Inscripciones - Backend II

> **Institución:** Coderhouse  
> **Estudiante:** Vergara Nicolas  
> **Curso:** Programación Backend II: Diseño y Arquitectura Backend  
> **Comisión:** Comisión #94925  

---

## 📌 Temática del Proyecto
Sistema backend para una **Plataforma de Eventos e Inscripciones**. Permite a organizadores publicar conferencias, talleres y festivales, y a los usuarios registrarse, reservar entradas y gestionar su asistencia.

Esta entrega corresponde a la **Pre-entrega 3: Autenticación con JWT y cookies**, que suma sobre la base de las entregas anteriores (arquitectura en capas y registro seguro) el flujo completo de autenticación: **login**, generación de **JWT**, cookie de autenticación **httpOnly**, ruta protegida **`/current`** y **logout**.

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
│   │   └── auth.middleware.js # Autenticación por JWT (cookie httpOnly)
│   └── utils/                 # Funciones de soporte y utilitarios
│       ├── index.js
│       ├── hash.js            # Helper reutilizable de bcrypt (hash y comparación)
│       └── jwt.js             # Firma y verificación de tokens JWT
├── test/                      # Tests automatizados (Jest + Supertest)
│   ├── helpers/mongo.js       # MongoDB en memoria compartido entre suites
│   ├── setupEnv.cjs           # Variables de entorno para las suites (JWT_SECRET, NODE_ENV)
│   ├── sessions.register.test.js
│   ├── sessions.auth.test.js  # login + current + logout
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
| `JWT_SECRET` | Clave secreta para firma y verificación de tokens (**obligatoria**, sin valor por defecto) | — |
| `JWT_EXPIRES_IN` | Tiempo de vida del token JWT | `1h` |

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

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Estado del servidor |
| `GET` | `/api/events` | Listar eventos |
| `POST` | `/api/sessions/register` | Registrar un usuario (hash de contraseña) |
| `POST` | `/api/sessions/login` | Iniciar sesión y emitir JWT en cookie `httpOnly` |
| `GET` | `/api/sessions/current` | Usuario autenticado (protegida) |
| `POST` | `/api/sessions/logout` | Cerrar sesión (borra la cookie) |

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
  * Autentica un usuario con `email` y `password`, valida el hash con `bcrypt` y emite un **JWT** que se envía en la cookie **`httpOnly`** `currentUser` (no accesible desde JavaScript del cliente).
  * **Campos esperados en el body (JSON):**

    | Campo | Tipo | Requerido | Descripción |
    | :--- | :--- | :--- | :--- |
    | `email` | string | ✅ | Email del usuario (se normaliza: `trim` + `lowercase`) |
    | `password` | string | ✅ | Contraseña en texto plano (se compara contra el hash) |

  * **Respuesta `200 OK` (éxito):** setea la cookie httpOnly `currentUser` con el JWT:
    ```json
    {
      "status": "success",
      "message": "Login correcto"
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
  * Requiere autenticación: cookie httpOnly `currentUser` con un JWT válido.
  * **Respuesta `200 OK`** (devuelve `{ id, email, role }`, sin `password`):
    ```json
    {
      "status": "success",
      "payload": {
        "id": "665f2a...",
        "email": "ana@mail.com",
        "role": "user"
      }
    }
    ```
  * **Respuesta `401 Unauthorized` (sin cookie / token inválido o expirado):**
    ```json
    { "status": "error", "message": "No autenticado" }
    ```

### 6. Cierre de sesión

* **POST `/api/sessions/logout`**
  * Elimina la cookie `currentUser` y confirma el cierre de sesión.
  * **Respuesta `200 OK`:**
    ```json
    { "status": "success", "message": "Sesión cerrada" }
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

## 🔐 Cómo probar login, sesión actual y logout (con `curl`)

> Requisito: tener un usuario registrado (ver sección anterior) y el servidor levantado.

**1. Login exitoso** (responde `{ "status": "success", "message": "Login correcto" }` y guarda la cookie en un archivo)
```bash
curl -X POST http://localhost:8080/api/sessions/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{ "email": "ana@mail.com", "password": "Secreta123" }'
```

**2. Login con credenciales inválidas** (espera `401` con mensaje genérico)
```bash
curl -X POST http://localhost:8080/api/sessions/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "ana@mail.com", "password": "incorrecta" }'
```

**3. Sesión actual con cookie** (espera `200` con `{ id, email, role }`)
```bash
curl -X GET http://localhost:8080/api/sessions/current \
  -b cookies.txt
```

**4. Sesión actual sin cookie** (espera `401`)
```bash
curl -X GET http://localhost:8080/api/sessions/current
```

**5. Logout** (borra la cookie y responde confirmación)
```bash
curl -X POST http://localhost:8080/api/sessions/logout \
  -b cookies.txt -c cookies.txt
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

* **`POST /api/sessions/login`, `GET /api/sessions/current` y `POST /api/sessions/logout`** (`test/sessions.auth.test.js`):
  * `200` — login exitoso: responde `{ message: "Login correcto" }` y setea la cookie httpOnly `currentUser` (con `HttpOnly`, `SameSite=Lax` y `Max-Age=3600`).
  * `200` — normalización del email en el login.
  * `401` — contraseña incorrecta / email no registrado (mensaje genérico).
  * `400` — faltan email o contraseña.
  * `200` — `/current` con cookie válida (devuelve `{ id, email, role }` sin `password`).
  * `401` — `/current` sin cookie, con token inválido o con token expirado.
  * `200` — logout borra la cookie y deja `/current` en `401`.

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

El módulo de **login, JWT, cookies, ruta protegida `current` y logout** ya está implementado sobre la arquitectura en capas:

* **Login** — `SessionsService.login` busca al usuario por email normalizado, recupera el hash con `.select('+password')` y lo valida con `comparePassword` (`src/utils/hash.js`); responde `401` con "Credenciales inválidas" ante email/contraseña que no coincidan, sin especificar cuál falló.
* **JWT** — `src/utils/jwt.js` firma y verifica tokens con `JWT_SECRET` (expiración configurable con `JWT_EXPIRES_IN`).
* **Cookie** — el controlador setea la cookie httpOnly `currentUser` (`httpOnly: true`, `sameSite: 'lax'`, `maxAge: 3600000` y `secure: true` solo en producción); `cookie-parser` la lee en las rutas protegidas.
* **`GET /api/sessions/current`** — `auth.middleware.js` lee la cookie, verifica el JWT y expone `req.user = { id, email, role }` (sin `password`).
* **Logout** — `POST /api/sessions/logout` elimina la cookie `currentUser` y responde confirmación.

### Siguientes pasos sugeridos

* Emitir JWT con expiración más corta para `access token` + `refresh token`.
* Añadir middleware de autorización por `role` (`user`, `organizer`, `admin`).
* Rate limiting y protección contra fuerza bruta en el login.
