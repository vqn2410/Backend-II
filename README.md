# Plataforma de Eventos e Inscripciones - Backend II

## 📌 Temática del Proyecto
Sistema backend para una **Plataforma de Eventos e Inscripciones**. Permite a organizadores publicar conferencias, talleres y festivales, y a los usuarios registrarse, reservar entradas y gestionar su asistencia.

Esta primera entrega corresponde a la **Pre-entrega 1: Refactor arquitectónico inicial**, estableciendo una base modular, desacoplada y orientada a capas lista para escalar hacia autenticación, autorización por roles, pagos y notificaciones.

---

## 🚀 Tecnologías
- **Node.js** (v20+)
- **Express.js** (Framework HTTP)
- **Mongoose** (Modelado de datos para MongoDB)
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
│   │   └── index.js
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
│   │   └── events.repository.js
│   ├── dao/                   # Data Access Object (operaciones sobre la DB)
│   │   └── events.dao.js
│   ├── models/                # Esquemas y modelos de persistencia (Mongoose)
│   │   ├── User.js
│   │   └── Event.js
│   ├── middlewares/           # Middlewares transversales y manejo global de errores
│   │   └── errorHandler.js
│   └── utils/                 # Funciones de soporte y utilitarios
│       └── index.js
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

### 3. Sesiones / Autenticación (Estructura inicial)
* **POST `/api/sessions/register`**
  * Estructura base para el futuro registro de usuarios.
* **POST `/api/sessions/login`**
  * Estructura base para el futuro inicio de sesión y emisión de JWT.
* **GET `/api/sessions/current`**
  * Estructura base para recuperar el perfil del usuario autenticado.

---

## 📋 Modelos Base Creados

* **`User` (`src/models/User.js`):** `first_name`, `last_name`, `email` (único), `password`, `role` (`user`, `admin`, `organizer`), marcas de tiempo (`createdAt`, `updatedAt`).
* **`Event` (`src/models/Event.js`):** `title`, `description`, `date`, `location`, `capacity`, `price`, `status`, marcas de tiempo (`createdAt`, `updatedAt`).
