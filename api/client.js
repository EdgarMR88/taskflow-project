/**
 * Cliente HTTP para TaskFlow API
 * Abstraccion de fetch para comunicarse con el servidor backend.
 *
 * Centralizar las peticiones HTTP aqui facilita cambios globales
 * (por ejemplo, cambiar la URL base o añadir autenticacion en un solo sitio).
 */

// En local (localhost) apuntamos al servidor de desarrollo.
// En cualquier otro dominio (Vercel, etc.) se usa la URL del backend desplegado.
// Cambia la segunda URL por la que te asigne Vercel al desplegar el backend.
const URL_BASE_API = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api/v1'
  : 'https://taskflow-project-dzkm.vercel.app/api/v1';

/**
 * Clase ClienteHttp - Encapsula la logica de comunicacion HTTP.
 * Maneja errores, timeouts y respuestas de forma consistente.
 */
class ClienteHttp {
  constructor(urlBase = URL_BASE_API) {
    this.urlBase = urlBase;
    this.timeoutMs = 10000; // 10 segundos maximos de espera
  }

  /**
   * Realiza una peticion HTTP generica.
   * @param {string} endpoint - Ruta relativa (ej. '/tasks').
   * @param {Object} opciones - Configuracion de fetch.
   * @returns {Promise<Object|null>} Respuesta parseada como JSON o null (204).
   * @throws {Error} Si hay error de red, timeout o respuesta no exitosa.
   */
  async peticion(endpoint, opciones = {}) {
    const url = `${this.urlBase}${endpoint}`;
    const controlador = new AbortController();
    const idTimeout = setTimeout(() => controlador.abort(), this.timeoutMs);

    try {
      const respuesta = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...opciones.headers,
        },
        ...opciones,
        signal: controlador.signal,
      });

      clearTimeout(idTimeout);

      // Algunos endpoints devuelven 204 sin cuerpo (ej. DELETE exitoso)
      const texto = await respuesta.text();
      let datos = null;
      if (texto) {
        try {
          datos = JSON.parse(texto);
        } catch {
          // El cuerpo no es JSON valido (p. ej. HTML de error de proxy/CDN)
          // Se ignora el cuerpo y se usa el codigo HTTP para construir el error
          datos = null;
        }
      }

      // Si el codigo HTTP no es 2xx, lanzar error con detalle del servidor
      if (!respuesta.ok) {
        const mensajeError = datos?.error || `Error HTTP ${respuesta.status}`;
        const error = new Error(mensajeError);
        error.estado = respuesta.status;
        error.datos = datos;
        throw error;
      }

      return datos;
    } catch (error) {
      clearTimeout(idTimeout);

      if (error.name === 'AbortError') {
        throw new Error('Tiempo de espera agotado. Verifica tu conexion.');
      }

      // Error que viene del servidor (ya tiene .estado asignado arriba)
      if (error.estado) {
        throw error;
      }

      // Error de red: servidor no disponible o URL incorrecta
      if (error instanceof TypeError) {
        throw new Error(
          'No se pudo conectar al servidor. Asegurate de que esta en marcha (http://localhost:3000).'
        );
      }

      throw error;
    }
  }

  /** GET - Obtiene recursos. */
  get(endpoint) {
    return this.peticion(endpoint, { method: 'GET' });
  }

  /** POST - Crea un recurso. */
  post(endpoint, cuerpo) {
    return this.peticion(endpoint, {
      method: 'POST',
      body: JSON.stringify(cuerpo),
    });
  }

  /** PATCH - Actualiza parcialmente un recurso. */
  patch(endpoint, cuerpo) {
    return this.peticion(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(cuerpo),
    });
  }

  /** DELETE - Elimina un recurso. */
  delete(endpoint) {
    return this.peticion(endpoint, { method: 'DELETE' });
  }
}

/**
 * Interfaz de alto nivel para operaciones de tareas.
 * Incluye mapeo entre el esquema del frontend (ingles) y del backend (espanol).
 *
 * Frontend usa: { id, title, priority, category, dueDate, completed, createdAt }
 * Backend usa:  { id, titulo, prioridad, categoria, fechaVencimiento, completada, createdAt }
 */
class ApiTareas {
  constructor(cliente = new ClienteHttp()) {
    this.cliente = cliente;
  }

  /**
   * Convierte un objeto del formato frontend al formato que espera el backend.
   * Solo incluye los campos que esten definidos (para soportar PATCH parcial).
   * @param {Object} datos - Objeto en formato frontend.
   * @returns {Object} Objeto en formato backend.
   * @private
   */
  _haciaBackend(datos) {
    const mapeado = {};
    if (datos.title !== undefined)       mapeado.titulo           = datos.title;
    if (datos.priority !== undefined)    mapeado.prioridad        = datos.priority;
    if (datos.category !== undefined)    mapeado.categoria        = datos.category;
    if (datos.dueDate !== undefined)     mapeado.fechaVencimiento = datos.dueDate;
    if (datos.completed !== undefined)   mapeado.completada       = datos.completed;
    if (datos.description !== undefined) mapeado.descripcion      = datos.description;
    return mapeado;
  }

  /**
   * Convierte un objeto del formato backend al formato que usa el frontend.
   * @param {Object} tarea - Objeto en formato backend.
   * @returns {Object} Objeto en formato frontend.
   * @private
   */
  _desdeBackend(tarea) {
    if (!tarea) return null;
    return {
      id:        tarea.id,
      title:     tarea.titulo,
      priority:  tarea.prioridad  ?? 'media',
      category:  tarea.categoria  ?? 'personal',
      dueDate:   tarea.fechaVencimiento ?? null,
      completed: tarea.completada ?? false,
      createdAt: tarea.createdAt,
    };
  }

  /**
   * Obtiene todas las tareas del servidor.
   * @returns {Promise<Array>} Array de tareas en formato frontend.
   */
  async obtenerTodas() {
    const respuesta = await this.cliente.get('/tasks');
    return (respuesta?.data ?? []).map((t) => this._desdeBackend(t));
  }

  /**
   * Obtiene una tarea especifica por ID.
   * @param {number} id - ID de la tarea.
   * @returns {Promise<Object>} Tarea en formato frontend.
   */
  async obtenerPorId(id) {
    const respuesta = await this.cliente.get(`/tasks/${id}`);
    return this._desdeBackend(respuesta?.data);
  }

  /**
   * Crea una nueva tarea.
   * @param {Object} datosTarea - Tarea en formato frontend.
   * @returns {Promise<Object>} Tarea creada con ID del servidor, en formato frontend.
   */
  async crear(datosTarea) {
    const respuesta = await this.cliente.post('/tasks', this._haciaBackend(datosTarea));
    return this._desdeBackend(respuesta?.data);
  }

  /**
   * Actualiza parcialmente una tarea (PATCH).
   * @param {number} id - ID de la tarea.
   * @param {Object} cambios - Campos a actualizar en formato frontend.
   * @returns {Promise<Object>} Tarea actualizada en formato frontend.
   */
  async actualizar(id, cambios) {
    const respuesta = await this.cliente.patch(`/tasks/${id}`, this._haciaBackend(cambios));
    return this._desdeBackend(respuesta?.data);
  }

  /**
   * Elimina una tarea.
   * @param {number} id - ID de la tarea.
   * @returns {Promise<void>}
   */
  async eliminar(id) {
    await this.cliente.delete(`/tasks/${id}`);
  }
}

// Instancia global lista para usar desde app.js
const apiTareas = new ApiTareas();
