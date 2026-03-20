# TaskFlow – Gestión de tareas con API REST

Aplicación web fullstack para gestionar tareas con fecha de vencimiento, filtros, ordenación y gestión de estados. El frontend está construido en HTML, CSS y JavaScript puro; el backend es una API RESTful con Node.js y Express que sigue una arquitectura estricta por capas.

---

## Demo

**[Ver TaskFlow en vivo](https://taskflow-project-git-tailwind-css-version-edgarmr88s-projects.vercel.app/)**

---

## Características

| Área | Funcionalidad |
|------|---------------|
| **Tareas** | Crear, editar, completar y eliminar. Título, prioridad (alta/media/baja), categoría y fecha de vencimiento obligatoria. |
| **Filtros** | Por estado (todas, pendientes, completadas), por categoría y por vencimiento (vencidas, hoy, próximos 7 días). |
| **Búsqueda** | En tiempo real por título, categoría y prioridad. |
| **Ordenación** | Por fecha de creación (asc/desc), vencimiento, prioridad o título. |
| **Vistas** | Grid o lista. |
| **Red** | Indicador de carga global y banner de error de conexión cuando el servidor no responde. |
| **UX** | Modo oscuro persistente, selector de fecha día/mes/año, atajos de teclado, notificaciones. |

---

## Tecnologías

**Frontend**
- HTML5, Tailwind CSS, JavaScript ES6+
- `fetch` API para comunicación con el backend
- Font Awesome para iconos

**Backend**
- Node.js + Express
- `cors`, `dotenv`
- `nodemon` para recarga automática en desarrollo
- Arquitectura por capas: rutas → controladores → servicios

---

## Estructura del proyecto

```
taskflow-project/
│
├── index.html              # Interfaz principal
├── app.js                  # Lógica de la app: clase GestorTareasRapidas
├── taskHelpers.js          # Utilidades: cálculo de fechas, formateo
├── tema-y-estilos.js       # Toggle tema claro/oscuro
│
├── red/                    # Capa de red del frontend
│   ├── client.js           # Cliente HTTP (fetch) + mapeo de datos frontend↔backend
│   └── tasks-manager.js    # Estado de red (cargando/error) y patrón observador
│
├── server/                 # Backend Node.js + Express
│   ├── .env                # Variables de entorno (no se sube a Git)
│   ├── package.json
│   └── src/
│       ├── index.js            # Punto de entrada: middlewares, rutas, error handler
│       ├── config/
│       │   └── env.js          # Carga y valida variables de entorno
│       ├── routes/
│       │   └── task.routes.js  # Mapeo de URLs a controladores
│       ├── controllers/
│       │   └── task.controller.js  # Extrae req, valida, llama al servicio, responde
│       ├── services/
│       │   └── task.service.js     # Lógica de negocio pura (sin Express)
│       └── middleware/
│           └── logger.js       # Logger HTTP con duración de cada petición
│
├── docs/
│   ├── backend-api.md      # Axios, Postman, Sentry, Swagger: qué son y por qué se usan
│   └── ai/                 # Documentación del flujo de trabajo con IA
│
└── README.md
```

---

## Puesta en marcha

### 1. Clonar el repositorio

```bash
git clone https://github.com/EdgarMR88/taskflow-project
cd taskflow-project
```

### 2. Arrancar el backend

```bash
cd server
npm install
```

Crea el archivo `server/.env` con el siguiente contenido:

```
PORT=3000
NODE_ENV=development
```

Arranca el servidor en modo desarrollo:

```bash
npm run dev
```

El servidor quedará escuchando en `http://localhost:3000`. Verás en la consola:

```
TaskFlow API activa en http://localhost:3000 (development)
```

### 3. Abrir el frontend

Desde la raíz del proyecto, sirve los archivos estáticos con cualquier servidor local:

```bash
# Con Python
python -m http.server 8000

# Con Node.js
npx serve .
```

Abre `http://localhost:8000` en el navegador. El frontend se conectará automáticamente al backend en `http://localhost:3000`.

> Si el servidor no está activo, aparecerá el banner de error rojo en la parte superior de la interfaz.

---

## API REST – Referencia de endpoints

Todos los endpoints usan el prefijo `/api/v1`.

### Verificar que el servidor está activo

```
GET /api/v1/health
```

**Respuesta 200:**
```json
{
  "exito": true,
  "mensaje": "Servidor activo",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### Obtener todas las tareas

```
GET /api/v1/tasks
```

**Respuesta 200:**
```json
{
  "exito": true,
  "total": 2,
  "data": [
    {
      "id": 1,
      "titulo": "Preparar presentación",
      "descripcion": "Slides para el lunes",
      "prioridad": "alta",
      "estado": "pendiente",
      "categoria": "trabajo",
      "fechaVencimiento": "2025-01-20",
      "completada": false,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### Obtener una tarea por ID

```
GET /api/v1/tasks/:id
```

**Respuesta 200:** igual que el objeto anterior pero en `data` directamente.

**Respuesta 404** si el ID no existe:
```json
{
  "exito": false,
  "error": "Tarea con ID 99 no encontrada"
}
```

---

### Crear una tarea

```
POST /api/v1/tasks
Content-Type: application/json
```

**Body (campos obligatorios y opcionales):**
```json
{
  "titulo": "Preparar presentación",
  "descripcion": "Slides para el lunes",
  "prioridad": "alta",
  "estado": "pendiente",
  "categoria": "trabajo",
  "fechaVencimiento": "2025-01-20",
  "completada": false
}
```

| Campo | Tipo | Obligatorio | Valores válidos |
|-------|------|-------------|-----------------|
| `titulo` | string | Sí (mín. 3 caracteres) | cualquier texto |
| `descripcion` | string | No | cualquier texto |
| `prioridad` | string | No (por defecto `"media"`) | `"alta"`, `"media"`, `"baja"` |
| `estado` | string | No (por defecto `"pendiente"`) | `"pendiente"`, `"en_progreso"`, `"completada"` |
| `categoria` | string | No (por defecto `"personal"`) | cualquier texto |
| `fechaVencimiento` | string | No | fecha ISO `YYYY-MM-DD` |
| `completada` | boolean | No (por defecto `false`) | `true`, `false` |

**Respuesta 201:**
```json
{
  "exito": true,
  "mensaje": "Tarea creada exitosamente",
  "data": { ...tarea con id asignado... }
}
```

**Respuesta 400** si falta el título o tiene menos de 3 caracteres:
```json
{
  "exito": false,
  "error": "El campo \"titulo\" es obligatorio y debe ser texto"
}
```

---

### Actualizar una tarea (parcial)

```
PATCH /api/v1/tasks/:id
Content-Type: application/json
```

**Body** (solo los campos a modificar):
```json
{
  "completada": true,
  "estado": "completada"
}
```

**Respuesta 200:**
```json
{
  "exito": true,
  "mensaje": "Tarea actualizada exitosamente",
  "data": { ...tarea actualizada... }
}
```

**Respuesta 404** si el ID no existe.

---

### Eliminar una tarea

```
DELETE /api/v1/tasks/:id
```

**Respuesta 204** (sin cuerpo): la tarea fue eliminada correctamente.

**Respuesta 404** si el ID no existe:
```json
{
  "exito": false,
  "error": "Tarea con ID 5 no encontrada"
}
```

---

## Arquitectura del backend

### Arquitectura por capas

El servidor sigue el principio de separación de responsabilidades, dividido en tres capas unidireccionales. Una petición entra por las rutas, pasa al controlador y llega a los servicios; la respuesta recorre el camino inverso.

```
Petición HTTP
     │
     ▼
 task.routes.js       ← Solo escucha la red. Mapea URL + verbo al controlador.
     │
     ▼
 task.controller.js   ← Extrae req.params/req.body, valida, llama al servicio,
     │                  formatea la respuesta HTTP. No contiene lógica de negocio.
     ▼
 task.service.js      ← Lógica de negocio pura. No conoce Express, req ni res.
                        Lanza errores estándar de JS que el controlador captura.
```

Esta separación garantiza que la capa de servicios sea completamente testeable de forma unitaria sin levantar el servidor.

### Middlewares

Los middlewares son funciones que se ejecutan en cadena para cada petición HTTP, antes de que llegue a la ruta definitiva. Express los procesa en el orden en que se registran con `app.use()`.

#### 1. `express.json()`

Parsea el cuerpo de la petición de texto crudo a objeto JavaScript. Sin este middleware, `req.body` sería `undefined` en todos los endpoints que reciben JSON.

#### 2. `cors()`

Gestiona las cabeceras `Access-Control-Allow-Origin`. Sin él, el navegador bloquea por política de seguridad cualquier petición que venga de un origen distinto al del servidor (por ejemplo, el frontend en el puerto 8000 intentando conectar con la API en el puerto 3000).

En desarrollo se acepta cualquier origen (`*`). En producción se exige la variable de entorno `CORS_ORIGIN` con la URL exacta del frontend desplegado.

#### 3. `loggerMiddleware` (personalizado)

```js
// server/src/middleware/logger.js
const loggerMiddleware = (req, res, next) => {
  const inicio = performance.now();
  res.on('finish', () => {
    const duracion = (performance.now() - inicio).toFixed(2);
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Estado: ${res.statusCode} (${duracion}ms)`);
  });
  next();
};
```

Se suscribe al evento `finish` del stream de respuesta nativo de Node para calcular el tiempo real de procesamiento. Cada petición queda registrada con método, ruta, código de estado y duración en milisegundos. La llamada a `next()` es obligatoria: sin ella la petición quedaría colgada indefinidamente.

#### 4. Middleware global de errores (4 parámetros)

```js
app.use((err, req, res, next) => { ... });
```

Express identifica un middleware como manejador de errores exclusivamente por su firma de cuatro parámetros. Se registra al final de todas las rutas. Recibe cualquier error que haya sido pasado mediante `next(err)` o lanzado de forma no controlada. Mapea semánticamente el error a un código HTTP: `NOT_FOUND` → 404, `ValidationError` → 400, resto → 500. En producción nunca expone detalles técnicos al cliente.

---

## Capa de red del frontend

### `red/client.js`

Encapsula toda comunicación HTTP. Contiene dos clases:

- **`ClienteHttp`**: abstracción genérica sobre `fetch` con soporte para timeout (10s), manejo de respuestas 204 vacías y distinción entre errores de red, timeout y errores HTTP.
- **`ApiTareas`**: interfaz semántica de alto nivel (`obtenerTodas`, `crear`, `actualizar`, `eliminar`) que además traduce los datos entre el esquema del frontend (camelCase en inglés) y el esquema del backend (español).

### `red/tasks-manager.js`

Gestiona el estado de red de la interfaz: `cargando` y `ultimoError`. Usa el patrón observador para notificar a `app.js` cuando el estado cambia, de modo que la barra de carga y el banner de error se actualicen automáticamente.

---

## Atajos de teclado

| Atajo | Acción |
|-------|--------|
| `/` | Enfocar el buscador |
| `N` | Enfocar el campo de nueva tarea |
| `G` | Cambiar vista (grid ↔ lista) |
| `T` | Cambiar tema (claro ↔ oscuro) |
| `Esc` | Cerrar el modal de edición |

*(No se activan cuando el foco está en un input o textarea.)*

---

## Despliegue en Vercel

### Backend

El backend incluye `server/vercel.json` con la configuración necesaria para desplegar el servidor Express como una función serverless de Node.js.

**Pasos:**

1. En [vercel.com](https://vercel.com), crea un nuevo proyecto e importa el repositorio.
2. En la configuración del proyecto, establece **Root Directory** como `server`.
3. Vercel detectará automáticamente `@vercel/node` y usará `src/index.js` como punto de entrada.
4. En **Environment Variables** del panel de Vercel, añade:
   - `PORT` → `3000`
   - `NODE_ENV` → `production`
   - `CORS_ORIGIN` → URL del frontend desplegado (por ejemplo `https://tu-app.vercel.app`)
5. Despliega. Vercel ignorará `app.listen()` y gestionará las peticiones directamente a través del `app` exportado.

> En producción, `CORS_ORIGIN` es obligatorio. Si no se define, el backend devolverá un error al intentar conectar desde el frontend desplegado.

### Frontend

El frontend es un sitio estático (HTML + JS + CSS). Puedes desplegarlo en Vercel o en cualquier CDN:

1. Crea un proyecto nuevo en Vercel con la raíz del repositorio (sin subdirectorio).
2. No requiere proceso de build — Vercel sirve los archivos estáticos directamente.
3. Una vez desplegado, actualiza `api/client.js` para que `URL_BASE_API` apunte a la URL del backend en producción:

```js
// api/client.js
const URL_BASE_API = process.env.NODE_ENV === 'production'
  ? 'https://tu-backend.vercel.app/api/v1'
  : 'http://localhost:3000/api/v1';
```

---

## Variables de entorno

| Variable | Descripción | Obligatoria |
|----------|-------------|-------------|
| `PORT` | Puerto en el que escucha el servidor | Sí |
| `NODE_ENV` | Entorno (`development` / `production`) | No (por defecto `development`) |
| `CORS_ORIGIN` | URL del frontend en producción | Solo en producción |

---

## Autor

**Edgar Montoya Rodriguez**

- GitHub: [@EdgarMR88](https://github.com/EdgarMR88)
- LinkedIn: [Edgar Montoya Rodríguez](https://www.linkedin.com/in/edgarmr88)

---

## Licencia

MIT License. Ver [LICENSE](LICENSE) para más detalles.
