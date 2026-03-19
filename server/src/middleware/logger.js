/**
 * Middleware logger - Auditoria de peticiones HTTP.
 * Se ejecuta para TODAS las peticiones.
 */

const { performance } = require('node:perf_hooks');

const loggerMiddleware = (req, res, next) => {
  const inicio = performance.now();

  // Escuchar el evento "finish" del stream de respuesta
  res.on('finish', () => {
    const duracion = (performance.now() - inicio).toFixed(2);
    const log = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Estado: ${res.statusCode} (${duracion}ms)`;
    console.log(log);
  });

  next(); // Pasar al siguiente middleware
};

module.exports = loggerMiddleware;
