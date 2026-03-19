# Arquitectura del Backend (Fase 3)

## Objetivo

Este backend implementa una API REST para gestionar tareas con Node.js y Express, siguiendo una arquitectura por capas para separar responsabilidades y facilitar mantenimiento, pruebas y escalabilidad.

## Stack técnico

- Node.js
- Express
- CORS
- dotenv
- nodemon (desarrollo)

## Estructura de carpetas

```text
server/
├── src/
│   ├── config/
│   │   └── env.js
│   ├── controllers/
│   │   └── task.controller.js
│   ├── middleware/
│   │   └── logger.js
│   ├── routes/
│   │   └── task.routes.js
│   ├── services/
│   │   └── task.service.js
│   └── index.js
├── docs/
│   └── ARCHITECTURE.md
├── .env
├── .gitignore
└── package.json
```

## Arquitectura por capas

### 1) Capa de rutas (`routes`)

Responsabilidad: mapear URL + método HTTP al controlador correspondiente.

- No contiene lógica de negocio.
- Define los endpoints de `/api/v1/tasks`.

### 2) Capa de controladores (`controllers`)

Responsabilidad: orquestar la entrada/salida HTTP.

- Lee `req.params` y `req.body`.
- Ejecuta validación defensiva de datos de entrada.
- Invoca la capa de servicios.
- Devuelve respuestas HTTP con códigos y estructura JSON.

### 3) Capa de servicios (`services`)

Responsabilidad: lógica de negocio pura.

- No depende de Express ni de HTTP.
- Gestiona la colección de tareas en memoria.
- Lanza errores de dominio (`NOT_FOUND`) para que el controlador/middleware los traduzcan a HTTP.

## Flujo de una petición

1. Llega la petición HTTP a Express.
2. Pasa por middlewares globales:
   - `express.json()`
   - `cors(...)`
   - `loggerMiddleware`
3. Se enruta a `/api/v1/tasks`.
4. El controlador valida y delega al servicio.
5. El servicio procesa la lógica y devuelve resultado o error.
6. El controlador responde con el código HTTP correspondiente.
7. Si hay error no controlado, interviene el middleware global de errores.

## Middlewares globales

## `express.json()`

Convierte el cuerpo JSON de entrada en objetos JavaScript accesibles desde `req.body`.

## `cors(...)`

Permite solicitudes desde el frontend en desarrollo (origen configurado) y habilita credenciales.

## `loggerMiddleware`

Registra auditoría de cada petición al finalizar la respuesta:

- timestamp
- método HTTP
- URL
- código de estado
- duración en ms

## Manejo de errores

### 404 de ruta no encontrada

Si ninguna ruta coincide, se devuelve:

- código: `404`
- mensaje: `Ruta no encontrada`

### Middleware global de errores

Ubicado al final del pipeline con firma `(err, req, res, next)`.

Mapeo actual:

- `err.message === 'NOT_FOUND'` -> `404`
- `err.name === 'ValidationError'` -> `400`
- cualquier otro caso -> `500`

En desarrollo, puede incluir detalle técnico del error para depuración.

## Contrato REST actual

Base URL local:

- `http://localhost:3000`

Endpoints:

- `GET /api/v1/health`
- `GET /api/v1/tasks`
- `GET /api/v1/tasks/:id`
- `POST /api/v1/tasks`
- `PATCH /api/v1/tasks/:id`
- `DELETE /api/v1/tasks/:id`

## Reglas de validación (actuales)

En creación y actualización parcial:

- `titulo` obligatorio en creación.
- `titulo` debe ser texto.
- `titulo` mínimo 3 caracteres.
- `prioridad` debe ser número si se envía.

## Estado de persistencia

Actualmente la persistencia es en memoria (`array` dentro de `task.service.js`).

Implicaciones:

- Reiniciar el servidor borra los datos.
- No hay concurrencia multi-instancia.
- Es válido para fase de aprendizaje y pruebas iniciales.

## Variables de entorno

Definidas en `.env` y cargadas desde `src/config/env.js`.

Variables mínimas:

- `PORT`
- `NODE_ENV` (opcional, por defecto `development`)
- `CORS_ORIGIN` (opcional)

La aplicación valida variables críticas al arrancar y falla rápido si faltan.

## Ejecución local

Desde `server/`:

```bash
npm install
npm run dev
```

Servidor por defecto:

- `http://localhost:3000`

## Pruebas recomendadas (Postman/Thunder Client)

Casos de éxito:

- `GET /api/v1/health` -> 200
- `POST /api/v1/tasks` válido -> 201
- `DELETE /api/v1/tasks/:id` existente -> 204

Casos de error:

- `POST /api/v1/tasks` sin `titulo` -> 400
- `GET /api/v1/tasks/:id` inexistente -> 404
- `DELETE /api/v1/tasks/:id` inexistente -> 404

