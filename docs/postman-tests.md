# Pruebas de la API con Postman – Fase 3

Colección de pruebas ejecutadas contra la API REST de TaskFlow para verificar
el comportamiento correcto de cada endpoint, incluyendo casos de éxito y de error.

**Servidor**: `http://localhost:3000`  
**Prefijo**: `/api/v1`  
**Herramienta**: Postman

> Las pruebas se ejecutaron en orden dentro de la misma sesión del servidor
> para mantener consistencia en los IDs generados por la persistencia en memoria.

---

## Resultados

### Prueba 1 — Verificar que el servidor está activo

| Campo | Valor |
|-------|-------|
| Método | `GET` |
| URL | `http://localhost:3000/api/v1/health` |
| Body | — |
| Código esperado | `200 OK` |
| Código obtenido | `200 OK` ✅ |

**Respuesta:**
```json
{
  "exito": true,
  "mensaje": "Servidor activo",
  "timestamp": "2026-03-20T08:43:00.000Z"
}
```

---

### Prueba 2 — Obtener todas las tareas (array vacío)

| Campo | Valor |
|-------|-------|
| Método | `GET` |
| URL | `http://localhost:3000/api/v1/tasks` |
| Body | — |
| Código esperado | `200 OK` |
| Código obtenido | `200 OK` ✅ |

**Respuesta:**
```json
{
  "exito": true,
  "total": 0,
  "data": []
}
```

---

### Prueba 3 — Crear una tarea válida

| Campo | Valor |
|-------|-------|
| Método | `POST` |
| URL | `http://localhost:3000/api/v1/tasks` |
| Content-Type | `application/json` |
| Código esperado | `201 Created` |
| Código obtenido | `201 Created` ✅ |

**Body enviado:**
```json
{
  "titulo": "Mi primera tarea",
  "prioridad": "alta",
  "categoria": "trabajo",
  "fechaVencimiento": "2026-12-31"
}
```

**Respuesta:**
```json
{
  "exito": true,
  "mensaje": "Tarea creada exitosamente",
  "data": {
    "id": 1,
    "titulo": "Mi primera tarea",
    "descripcion": "",
    "prioridad": "alta",
    "estado": "pendiente",
    "categoria": "trabajo",
    "fechaVencimiento": "2026-12-31",
    "completada": false,
    "createdAt": "2026-03-20T08:47:00.000Z",
    "updatedAt": "2026-03-20T08:47:00.000Z"
  }
}
```

---

### Prueba 4 — Crear tarea sin título (validación)

| Campo | Valor |
|-------|-------|
| Método | `POST` |
| URL | `http://localhost:3000/api/v1/tasks` |
| Content-Type | `application/json` |
| Código esperado | `400 Bad Request` |
| Código obtenido | `400 Bad Request` ✅ |

**Body enviado:**
```json
{
  "descripcion": "sin titulo"
}
```

**Respuesta:**
```json
{
  "exito": false,
  "error": "El campo \"titulo\" es obligatorio y debe ser texto"
}
```

> La validación se verifica en `task.controller.js` antes de llegar a la capa de servicios.
> Si el campo `titulo` está ausente o no es string, el controlador corta la petición
> con `res.status(400)` sin invocar ninguna lógica de negocio.

---

### Prueba 5 — Eliminar tarea con ID inexistente

| Campo | Valor |
|-------|-------|
| Método | `DELETE` |
| URL | `http://localhost:3000/api/v1/tasks/999` |
| Body | — |
| Código esperado | `404 Not Found` |
| Código obtenido | `404 Not Found` ✅ |

**Respuesta:**
```json
{
  "exito": false,
  "error": "Tarea con ID 999 no encontrada"
}
```

> La capa de servicios lanza `throw new Error('NOT_FOUND')` cuando el ID no existe
> en el array en memoria. El controlador captura ese error y responde con `404`.

---

### Prueba 6 — Eliminar tarea existente

| Campo | Valor |
|-------|-------|
| Método | `DELETE` |
| URL | `http://localhost:3000/api/v1/tasks/1` |
| Body | — |
| Código esperado | `204 No Content` |
| Código obtenido | `204 No Content` ✅ |

**Respuesta:** sin cuerpo (comportamiento correcto según la semántica HTTP: un `204`
indica éxito absoluto sin necesidad de devolver datos al cliente).

---

## Resumen

| # | Método | Endpoint | Escenario | Código esperado | Resultado |
|---|--------|----------|-----------|-----------------|-----------|
| 1 | GET | `/api/v1/health` | Servidor activo | 200 | ✅ |
| 2 | GET | `/api/v1/tasks` | Lista vacía | 200 | ✅ |
| 3 | POST | `/api/v1/tasks` | Tarea válida | 201 | ✅ |
| 4 | POST | `/api/v1/tasks` | Sin título | 400 | ✅ |
| 5 | DELETE | `/api/v1/tasks/999` | ID inexistente | 404 | ✅ |
| 6 | DELETE | `/api/v1/tasks/1` | ID existente | 204 | ✅ |

---

## Notas sobre la persistencia

Las tareas se almacenan en un **array en memoria** (`let tareas = []` en `task.service.js`).
Al reiniciar el servidor los datos se pierden. Esto es intencionado en la Fase 3,
donde el objetivo es construir la arquitectura de la API y conectar el frontend,
no implementar una base de datos real. La persistencia real se abordará en fases posteriores.
