/**
 * Controlador de tareas - Orquestación entre red (HTTP) y lógica de negocio
 * Responsabilidades:
 * 1. Extraer datos de req (params, body)
 * 2. Validar datos de entrada
 * 3. Llamar a servicios
 * 4. Formatear respuesta HTTP
 */

const servicioTareas = require('../services/task.service');

/**
 * GET /api/v1/tasks
 * Obtiene todas las tareas.
 */
const obtenerTodas = (req, res) => {
  try {
    const tareas = servicioTareas.obtenerTodas();
    res.status(200).json({
      exito: true,
      data: tareas,
      total: tareas.length,
    });
  } catch (error) {
    res.status(500).json({
      exito: false,
      error: 'Error al obtener tareas',
    });
  }
};

/**
 * GET /api/v1/tasks/:id
 * Obtiene una tarea por ID.
 */
const obtenerPorId = (req, res) => {
  try {
    const { id } = req.params;
    const tarea = servicioTareas.obtenerPorId(id);
    res.status(200).json({
      exito: true,
      data: tarea,
    });
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({
        exito: false,
        error: `Tarea con ID ${req.params.id} no encontrada`,
      });
    }
    res.status(500).json({
      exito: false,
      error: 'Error al obtener la tarea',
    });
  }
};

/**
 * POST /api/v1/tasks
 * Crea una nueva tarea.
 * Body: { titulo, descripcion?, prioridad?, estado? }
 */
const crearTarea = (req, res) => {
  try {
    const { titulo, descripcion, prioridad, estado, categoria, fechaVencimiento, completada } = req.body;

    // VALIDACION DEFENSIVA - Frontera de red
    if (!titulo || typeof titulo !== 'string') {
      return res.status(400).json({
        exito: false,
        error: 'El campo "titulo" es obligatorio y debe ser texto',
      });
    }

    if (titulo.trim().length < 3) {
      return res.status(400).json({
        exito: false,
        error: 'El titulo debe tener al menos 3 caracteres',
      });
    }

    // Llamar al servicio con datos validados
    const nuevaTarea = servicioTareas.crearTarea({
      titulo: titulo.trim(),
      descripcion: descripcion?.trim() || '',
      prioridad: prioridad || 'media',
      estado: estado || 'pendiente',
      categoria: categoria || 'personal',
      fechaVencimiento: fechaVencimiento || null,
      completada: completada || false,
    });

    // HTTP 201 = Recurso creado exitosamente
    res.status(201).json({
      exito: true,
      data: nuevaTarea,
      mensaje: 'Tarea creada exitosamente',
    });
  } catch (error) {
    res.status(500).json({
      exito: false,
      error: 'Error al crear la tarea',
    });
  }
};

/**
 * PATCH /api/v1/tasks/:id
 * Actualiza parcialmente una tarea.
 * Body: { titulo?, descripcion?, prioridad?, estado? }
 */
const actualizarTarea = (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, prioridad, estado, categoria, fechaVencimiento, completada } = req.body;

    // VALIDACION: si viene titulo, debe ser valido
    if (titulo !== undefined && (typeof titulo !== 'string' || titulo.trim().length < 3)) {
      return res.status(400).json({
        exito: false,
        error: 'El titulo debe ser texto y tener al menos 3 caracteres',
      });
    }

    // Preparar objeto de actualizacion (solo campos definidos)
    const datosActualizacion = {};
    if (titulo !== undefined) datosActualizacion.titulo = titulo.trim();
    if (descripcion !== undefined) datosActualizacion.descripcion = descripcion.trim();
    if (prioridad !== undefined) datosActualizacion.prioridad = prioridad;
    if (estado !== undefined) datosActualizacion.estado = estado;
    if (categoria !== undefined) datosActualizacion.categoria = categoria;
    if (fechaVencimiento !== undefined) datosActualizacion.fechaVencimiento = fechaVencimiento;
    if (completada !== undefined) datosActualizacion.completada = completada;

    const tareaActualizada = servicioTareas.actualizarTarea(id, datosActualizacion);

    res.status(200).json({
      exito: true,
      data: tareaActualizada,
      mensaje: 'Tarea actualizada exitosamente',
    });
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({
        exito: false,
        error: `Tarea con ID ${req.params.id} no encontrada`,
      });
    }
    res.status(500).json({
      exito: false,
      error: 'Error al actualizar la tarea',
    });
  }
};

/**
 * DELETE /api/v1/tasks/:id
 * Elimina una tarea.
 * Retorna HTTP 204 (No Content) sin cuerpo.
 */
const eliminarTarea = (req, res) => {
  try {
    const { id } = req.params;
    servicioTareas.eliminarTarea(id);

    // HTTP 204 = Exito sin contenido en respuesta
    res.status(204).send();
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({
        exito: false,
        error: `Tarea con ID ${req.params.id} no encontrada`,
      });
    }
    res.status(500).json({
      exito: false,
      error: 'Error al eliminar la tarea',
    });
  }
};

module.exports = {
  obtenerTodas,
  obtenerPorId,
  crearTarea,
  actualizarTarea,
  eliminarTarea,
};
