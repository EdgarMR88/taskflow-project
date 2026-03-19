/**
 * Rutas de tareas - Mapea URLs HTTP a controladores
 * Prefijo: /api/v1/tasks
 */

const express = require('express');
const router = express.Router();
const controladorTareas = require('../controllers/task.controller');

// GET /api/v1/tasks - Obtener todas las tareas
router.get('/', controladorTareas.obtenerTodas);

// GET /api/v1/tasks/:id - Obtener una tarea por ID
router.get('/:id', controladorTareas.obtenerPorId);

// POST /api/v1/tasks - Crear una nueva tarea
router.post('/', controladorTareas.crearTarea);

// PATCH /api/v1/tasks/:id - Actualizar parcialmente una tarea
router.patch('/:id', controladorTareas.actualizarTarea);

// DELETE /api/v1/tasks/:id - Eliminar una tarea
router.delete('/:id', controladorTareas.eliminarTarea);

module.exports = router;
