/**
 * Servicio de tareas - Lógica pura de negocio
 * Sin dependencias de Express, HTTP o base de datos (por ahora)
 * En memoria: arreglo simulado como BD
 */

// Simulación de persistencia en memoria (después será una BD real)
let tareas = [];
let siguienteId = 1;

/**
 * Obtiene todas las tareas.
 * @returns {Array} Arreglo de tareas.
 */
const obtenerTodas = () => {
  return tareas;
};

/**
 * Obtiene una tarea por ID.
 * @param {number|string} id - ID de la tarea.
 * @returns {Object} Tarea encontrada.
 * @throws {Error} Si no existe la tarea.
 */
const obtenerPorId = (id) => {
  const tarea = tareas.find((t) => t.id === parseInt(id, 10));
  if (!tarea) {
    throw new Error('NOT_FOUND');
  }
  return tarea;
};

/**
 * Crea una nueva tarea.
 * @param {Object} datos - { titulo, descripcion, prioridad, estado }.
 * @returns {Object} Tarea creada con ID asignado.
 */
const crearTarea = (datos) => {
  const {
    titulo,
    descripcion = '',
    prioridad = 'media',
    estado = 'pendiente',
    categoria = 'personal',
    fechaVencimiento = null,
    completada = false,
  } = datos;

  const nuevaTarea = {
    id: siguienteId++,
    titulo,
    descripcion,
    prioridad,
    estado,
    categoria,
    fechaVencimiento,
    completada,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  tareas.push(nuevaTarea);
  return nuevaTarea;
};

/**
 * Actualiza una tarea existente (PATCH - actualización parcial).
 * @param {number|string} id - ID de la tarea.
 * @param {Object} datos - Campos a actualizar.
 * @returns {Object} Tarea actualizada.
 * @throws {Error} Si no existe la tarea.
 */
const actualizarTarea = (id, datos) => {
  const tarea = obtenerPorId(id); // Lanza error si no existe

  // Actualizar solo los campos enviados en el payload
  if (datos.titulo !== undefined) tarea.titulo = datos.titulo;
  if (datos.descripcion !== undefined) tarea.descripcion = datos.descripcion;
  if (datos.prioridad !== undefined) tarea.prioridad = datos.prioridad;
  if (datos.estado !== undefined) tarea.estado = datos.estado;
  if (datos.categoria !== undefined) tarea.categoria = datos.categoria;
  if (datos.fechaVencimiento !== undefined) tarea.fechaVencimiento = datos.fechaVencimiento;
  if (datos.completada !== undefined) tarea.completada = datos.completada;

  tarea.updatedAt = new Date().toISOString();

  return tarea;
};

/**
 * Elimina una tarea.
 * @param {number|string} id - ID de la tarea.
 * @throws {Error} Si no existe la tarea.
 */
const eliminarTarea = (id) => {
  const indice = tareas.findIndex((t) => t.id === parseInt(id, 10));
  if (indice === -1) {
    throw new Error('NOT_FOUND');
  }
  tareas.splice(indice, 1);
};

module.exports = {
  obtenerTodas,
  obtenerPorId,
  crearTarea,
  actualizarTarea,
  eliminarTarea,
};
