# Herramientas clave para el desarrollo de APIs backend

Este documento explica qué son y por qué se usan cuatro herramientas fundamentales en el desarrollo de APIs profesionales: **Axios**, **Postman**, **Sentry** y **Swagger**.

---

## Axios

### Qué es

Axios es una librería JavaScript para realizar peticiones HTTP tanto desde el navegador como desde Node.js. Es una alternativa a la API nativa `fetch`, con una interfaz más limpia y con más funcionalidades integradas.

### Por qué se usa

- Convierte automáticamente las respuestas en objetos JavaScript (no hace falta llamar a `.json()` manualmente).
- Interceptores: permite capturar todas las peticiones o respuestas antes de que lleguen al código de la aplicación (útil para añadir cabeceras de autenticación o gestionar errores globalmente).
- Cancelación de peticiones.
- Mejor manejo de errores HTTP: lanza excepción automáticamente si el servidor devuelve un código 4xx o 5xx.
- Compatible con navegadores antiguos.

### Ejemplo básico

```js
import axios from 'axios';

const obtenerTareas = async () => {
  const respuesta = await axios.get('http://localhost:3000/api/v1/tasks');
  return respuesta.data;
};

const crearTarea = async (datos) => {
  const respuesta = await axios.post('http://localhost:3000/api/v1/tasks', datos);
  return respuesta.data;
};
```

### Cuándo usar Axios vs fetch

- `fetch` es nativo, suficiente para proyectos pequeños y sin dependencias adicionales.
- `axios` es preferible en proyectos medianos/grandes donde se necesitan interceptores, manejo centralizado de errores o compatibilidad amplia.

---

## Postman

### Qué es

Postman es una plataforma de colaboración para el desarrollo y prueba de APIs. Permite diseñar, documentar, probar y monitorizar APIs REST (y otros protocolos) desde una interfaz visual sin necesidad de escribir código.

### Por qué se usa

- Probar endpoints manualmente sin necesitar un frontend.
- Organizar peticiones en colecciones (agrupaciones lógicas de endpoints).
- Automatizar pruebas con scripts en JavaScript (pre-request y tests).
- Documentar la API de forma visual y compartirla con el equipo.
- Simular errores intencionados para verificar el comportamiento del servidor (400, 404, 500).
- Entornos configurables: cambiar entre desarrollo, staging y producción simplemente cambiando el entorno activo.

### Flujo típico en este proyecto

1. Abrir Postman y crear una colección `TaskFlow API`.
2. Añadir peticiones para cada endpoint.
3. Ejecutar casos de éxito: `POST` con datos válidos, `GET` de tareas existentes.
4. Ejecutar casos de error: `POST` sin título (esperar 400), `DELETE` de ID inexistente (esperar 404).
5. Documentar en cada petición qué se espera recibir.

---

## Sentry

### Qué es

Sentry es una plataforma de monitorización de errores en tiempo real para aplicaciones web, móviles y de servidor. Captura excepciones y errores no controlados y los envía a un panel centralizado con trazas de pila completas, contexto del usuario y metadatos del entorno.

### Por qué se usa

- En producción, los errores no siempre llegan a los logs del servidor o al usuario.
- Sentry captura automáticamente excepciones y las registra con toda la información necesaria para reproducirlas: navegador, versión de Node, línea de código, variables de contexto.
- Permite priorizar qué errores afectan a más usuarios.
- Integración sencilla con Express, React, Next.js y otros frameworks.
- Alertas configurables: notifica por email o Slack cuando ocurre un error nuevo o supera cierto umbral.

### Ejemplo de integración en Express

```js
const Sentry = require('@sentry/node');

Sentry.init({ dsn: process.env.SENTRY_DSN });

// Middleware de captura de errores de Sentry (va antes del manejador propio)
app.use(Sentry.Handlers.errorHandler());

// Middleware propio de errores (va después)
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Error interno del servidor' });
});
```

### Cuándo activarlo

En entornos de producción o staging. En desarrollo local no es necesario porque los logs de consola son suficientes.

---

## Swagger (OpenAPI)

### Qué es

Swagger es un conjunto de herramientas basadas en la especificación **OpenAPI** para describir, documentar y visualizar APIs REST de forma estandarizada. La especificación OpenAPI define un formato YAML o JSON que describe los endpoints, parámetros, cuerpos de petición y respuestas esperadas de una API.

### Por qué se usa

- Genera documentación interactiva automáticamente: cualquier persona puede ver y probar los endpoints desde el navegador sin configurar nada.
- Es el estándar de la industria para contratos de API.
- Permite generar código cliente (SDK) en múltiples lenguajes automáticamente.
- Facilita la colaboración entre equipos de frontend y backend: el contrato queda definido antes de que nadie escriba código.
- Herramientas como `swagger-ui-express` integran la UI directamente en Express bajo una ruta como `/api/docs`.

### Ejemplo de integración básica en Express

```js
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```

Accediendo a `http://localhost:3000/api/docs` se visualiza la documentación interactiva de todos los endpoints.

### Cuándo es indispensable

- APIs consumidas por terceros o por equipos distintos al que las construye.
- Proyectos donde el contrato de la API debe ser formal y versionado.
- Cuando se necesita generación automática de clientes o mocks.

---

## Resumen comparativo

| Herramienta | Categoría       | Fase de uso principal       |
|-------------|-----------------|----------------------------|
| Axios       | Cliente HTTP    | Frontend y servicios Node   |
| Postman     | Testing y docs  | Desarrollo y QA             |
| Sentry      | Monitorización  | Producción y staging        |
| Swagger     | Documentación   | Diseño, desarrollo y entrega|
