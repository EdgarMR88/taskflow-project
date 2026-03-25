/**
 * Gestor de red de tareas
 * Coordina las llamadas a la API con la gestion de estados de red:
 * cargando, error y exito.
 *
 * Arquitectura:
 *   client.js        → HTTP puro (fetch, timeouts, errores de red)
 *   tasks-manager.js → Estado de red (cargando/error) + patron observador
 *   app.js           → Logica de UI (renderiza, filtra, ordena)
 */

class GestorRedTareas {
  constructor(clienteApi) {
    this.api = clienteApi;
    this.cargando = false;
    this.ultimoError = null;
    this._observadores = [];
  }

  /**
   * Registra un observador que se invocara cada vez que cambie
   * el estado de red (cargando / ultimoError).
   * @param {Function} callback - Recibe { cargando, error }.
   */
  alCambiar(callback) {
    this._observadores.push(callback);
  }

  /**
   * Notifica a todos los observadores registrados con el estado actual.
   * @private
   */
  _notificar() {
    const estado = { cargando: this.cargando, error: this.ultimoError };
    this._observadores.forEach((cb) => cb(estado));
  }

  /**
   * Ejecuta una operacion asincrona gestionando automaticamente
   * los estados cargando/error y notificando a los observadores.
   * Usa finally para garantizar que "cargando" siempre vuelve a false.
   * @param {Function} operacion - Funcion asincrona a ejecutar.
   * @returns {Promise<*>} Resultado de la operacion.
   * @private
   */
  async _ejecutar(operacion) {
    this.cargando = true;
    this.ultimoError = null;
    this._notificar();

    try {
      return await operacion();
    } catch (error) {
      this.ultimoError = error.message;
      throw error;
    } finally {
      this.cargando = false;
      this._notificar();
    }
  }

  /**
   * Obtiene todas las tareas del servidor.
   * @returns {Promise<Array>} Array de tareas.
   */
  obtenerTareas() {
    return this._ejecutar(() => this.api.obtenerTodas());
  }

  /**
   * Crea una nueva tarea en el servidor.
   * @param {Object} datos - { titulo, descripcion?, prioridad?, estado? }
   * @returns {Promise<Object>} Tarea creada con ID del servidor.
   */
  crearTarea(datos) {
    return this._ejecutar(() => this.api.crear(datos));
  }

  /**
   * Actualiza parcialmente una tarea en el servidor (PATCH).
   * @param {number} id - ID de la tarea.
   * @param {Object} cambios - Campos a actualizar.
   * @returns {Promise<Object>} Tarea actualizada.
   */
  actualizarTarea(id, cambios) {
    return this._ejecutar(() => this.api.actualizar(id, cambios));
  }

  /**
   * Elimina una tarea del servidor.
   * @param {number} id - ID de la tarea.
   * @returns {Promise<void>}
   */
  eliminarTarea(id) {
    return this._ejecutar(() => this.api.eliminar(id));
  }
}

// Instancia global lista para usar desde app.js
// Depende de "apiTareas" definida en red/client.js (debe cargarse antes)
const gestorRed = new GestorRedTareas(apiTareas);
