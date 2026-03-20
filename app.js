/**
 * Gestor principal de la aplicación QuickTask.
 * Se encarga de gestionar el estado de las tareas, los filtros
 * y de sincronizar todo con la interfaz de usuario.
 *
 * Fase 3 — Fase D: las tareas ya no usan localStorage.
 * Toda la persistencia pasa por la API REST a través de gestorRed.
 * Las preferencias de UI (orden, filtro) siguen en localStorage.
 */
class GestorTareasRapidas {
  constructor() {
      this.tareas = [];
      this.filtroActual = 'all';
      this.categoriaActual = 'all';
      this.vistaActual = 'grid';
      this.idTareaEditando = null;
      this.terminoBusqueda = '';
      this.ordenActual = 'created_desc';
      this.filtroVencimiento = 'all';

      this.init();
  }

  /**
   * Inicializa la aplicación: conecta el estado de red, carga tareas
   * desde la API y prepara la interfaz.
   */
  async init() {
      this.configurarEstadoRed();
      this.loadPreferences();
      this.bindEvents();
      this.initializeDateSelectors();
      this.initializeButtonStyles();
      this.initializeSortUI();
      this.initializeDueFilterUI();
      await this.cargarTareas();
      this.updateStats();
      this.showWelcomeMessage();
  }

  // ---------------------------------------------------------------------------
  // ESTADO DE RED
  // ---------------------------------------------------------------------------

  /**
   * Suscribe la UI al estado del gestorRed para mostrar/ocultar
   * la barra de carga y el cartel de error automáticamente.
   */
  configurarEstadoRed() {
      const barraCargando  = document.getElementById('barra-cargando');
      const cartelError    = document.getElementById('cartel-error');
      const mensajeError   = document.getElementById('cartel-error-mensaje');
      const btnCerrar      = document.getElementById('cartel-error-cerrar');

      gestorRed.alCambiar(({ cargando, error }) => {
          if (barraCargando) barraCargando.classList.toggle('hidden', !cargando);

          if (error) {
              if (mensajeError) mensajeError.textContent = error;
              if (cartelError)  cartelError.classList.remove('hidden');
          } else {
              if (cartelError)  cartelError.classList.add('hidden');
          }
      });

      if (btnCerrar) {
          btnCerrar.addEventListener('click', () => {
              if (cartelError) cartelError.classList.add('hidden');
          });
      }
  }

  // ---------------------------------------------------------------------------
  // CARGA INICIAL DESDE API
  // ---------------------------------------------------------------------------

  /**
   * Carga todas las tareas desde el servidor.
   * Si el servidor no está disponible, muestra array vacío (el cartel de error
   * lo gestiona configurarEstadoRed automáticamente).
   */
  async cargarTareas() {
      try {
          this.tareas = await gestorRed.obtenerTareas();
      } catch {
          this.tareas = [];
      }
      this.renderTasks();
  }

  // ---------------------------------------------------------------------------
  // INICIALIZACIÓN DE UI (sin cambios respecto a Fase 1/2)
  // ---------------------------------------------------------------------------

  initializeButtonStyles() {
      this.updateFilterButtons();
      this.updateCategoryButtons();
      this.updateViewButtons();
  }

  showWelcomeMessage() {
      if (this.tareas.length === 0) {
          console.log('⚡ ¡Bienvenido a QuickTask! Tu gestor de tareas rápido y eficiente.');
      }
  }

  // ---------------------------------------------------------------------------
  // BINDING DE EVENTOS
  // ---------------------------------------------------------------------------

  bindEvents() {
      this.bindFormEvents();
      this.bindSearchEvents();
      this.bindFilterEvents();
      this.bindCategoryEvents();
      this.bindDueFilterEvents();
      this.bindViewEvents();
      this.bindSortEvents();
      this.bindBulkActionEvents();
      this.bindModalEvents();
      this.bindKeyboardShortcuts();
      this.bindTaskCardDelegation();
  }

  bindFormEvents() {
      const form = document.getElementById('task-form');
      if (!form) return;
      form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.agregarTareaRapida();
      });
  }

  bindSearchEvents() {
      const searchInput = document.getElementById('search-input');
      if (!searchInput) return;

      let timeoutBusqueda = null;
      const RETARDO_BUSQUEDA_MS = 200;

      searchInput.addEventListener('input', () => {
          if (timeoutBusqueda) clearTimeout(timeoutBusqueda);
          timeoutBusqueda = setTimeout(() => {
              this.terminoBusqueda = searchInput.value.toLowerCase().trim();
              this.renderTasks();
              timeoutBusqueda = null;
          }, RETARDO_BUSQUEDA_MS);
      });
  }

  bindFilterEvents() {
      const select = document.getElementById('filter-status');
      if (select) select.addEventListener('change', (e) => this.setFilter(e.target.value));
  }

  bindCategoryEvents() {
      const select = document.getElementById('filter-category');
      if (select) select.addEventListener('change', (e) => this.setCategoryFilter(e.target.value));
  }

  bindDueFilterEvents() {
      const select = document.getElementById('filter-due');
      if (select) select.addEventListener('change', (e) => this.setDueFilter(e.target.value));
  }

  bindViewEvents() {
      document.querySelectorAll('.view-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
              e.preventDefault();
              this.setView(e.currentTarget.dataset.view);
          });
      });
  }

  bindSortEvents() {
      const sortSelect = document.getElementById('sort-select');
      if (!sortSelect) return;
      sortSelect.addEventListener('change', (e) => {
          this.ordenActual = e.target.value;
          this.savePreferences();
          this.renderTasks();
      });
  }

  bindBulkActionEvents() {
      const clearCompletedBtn = document.getElementById('clear-completed');
      if (clearCompletedBtn) clearCompletedBtn.addEventListener('click', () => this.clearCompletedTasks());

      const completeAllBtn = document.getElementById('complete-all-tasks');
      if (completeAllBtn) completeAllBtn.addEventListener('click', () => this.completarTodasLasTareas());
  }

  bindModalEvents() {
      document.querySelectorAll('.close-modal, .cancel-edit').forEach(btn => {
          btn.addEventListener('click', () => this.closeEditModal());
      });

      const editForm = document.getElementById('edit-form');
      if (editForm) editForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.saveEditedTask();
      });

      const editModal = document.getElementById('edit-modal');
      if (editModal) editModal.addEventListener('click', (e) => {
          if (e.target.id === 'edit-modal') this.closeEditModal();
      });
  }

  bindKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
          if (e.defaultPrevented) return;
          if (e.ctrlKey || e.metaKey || e.altKey) return;

          const activeTag = document.activeElement?.tagName?.toLowerCase();
          const isTyping  = activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable;

          if (e.key === 'Escape') {
              const modal  = document.getElementById('edit-modal');
              const isOpen = modal && !modal.classList.contains('pointer-events-none');
              if (isOpen) { this.closeEditModal(); e.preventDefault(); }
              return;
          }

          if (isTyping) return;

          if (e.key === '/') {
              document.getElementById('search-input')?.focus();
              e.preventDefault();
              return;
          }
          if (e.key === 'n' || e.key === 'N') {
              document.getElementById('task-input')?.focus();
              e.preventDefault();
              return;
          }
          if (e.key === 'g' || e.key === 'G') {
              this.setView(this.vistaActual === 'grid' ? 'list' : 'grid');
              e.preventDefault();
              return;
          }
          if (e.key === 't' || e.key === 'T') {
              document.getElementById('theme-toggle')?.click();
              e.preventDefault();
          }
      });
  }

  // ---------------------------------------------------------------------------
  // CRUD DE TAREAS (ahora async, usando la API)
  // ---------------------------------------------------------------------------

  /**
   * Crea una nueva tarea rápida a partir del formulario lateral.
   */
  async agregarTareaRapida() {
      const titleInput    = document.getElementById('task-input');
      const prioritySelect = document.getElementById('task-priority');
      const categorySelect = document.getElementById('task-category');
      const dueDateInput  = document.getElementById('task-due-date');

      const title = titleInput.value.trim();
      if (!title) return;

      const dueDateValue = dueDateInput?.value?.trim();
      const days = dueDateValue ? daysUntilTaskExpiration(dueDateValue) : null;

      if (!dueDateValue) {
          this.showNotification('La fecha de vencimiento es obligatoria', 'error');
          return;
      }
      if (days === null) {
          this.showNotification('La fecha de vencimiento no es válida', 'error');
          return;
      }
      if (days < 0) {
          this.showNotification('La fecha de vencimiento no puede ser anterior a hoy', 'error');
          return;
      }

      try {
          const nuevaTarea = await gestorRed.crearTarea({
              title,
              priority: prioritySelect.value,
              category: categorySelect.value,
              dueDate:  new Date(dueDateValue).toISOString(),
              completed: false,
          });

          this.tareas.unshift(nuevaTarea);
          this.updateStats();
          this.renderTasks();

          // Resetear formulario
          titleInput.value = '';
          prioritySelect.value = 'media';
          categorySelect.value = 'personal';
          const hoy = new Date();
          const daySel   = document.getElementById('task-due-day');
          const monthSel = document.getElementById('task-due-month');
          const yearSel  = document.getElementById('task-due-year');
          if (monthSel) monthSel.value = hoy.getMonth() + 1;
          if (yearSel)  yearSel.value  = hoy.getFullYear();
          this.fillDayOptions('task-due-day', hoy.getMonth() + 1, hoy.getFullYear());
          if (daySel) daySel.value = hoy.getDate();
          this.syncTaskDueDateFromSelects();

          this.showNotification('✅ Tarea añadida', 'success');
          titleInput.focus();
      } catch (error) {
          this.showNotification(`Error al crear la tarea: ${error.message}`, 'error');
      }
  }

  /**
   * Marca/desmarca una tarea como completada.
   * @param {number} taskId
   */
  async toggleTaskCompletion(taskId) {
      const tarea = this.tareas.find(t => t.id === taskId);
      if (!tarea) return;

      try {
          const tareaActualizada = await gestorRed.actualizarTarea(taskId, {
              completed: !tarea.completed,
          });

          const indice = this.tareas.findIndex(t => t.id === taskId);
          if (indice !== -1) this.tareas[indice] = tareaActualizada;

          this.updateStats();
          this.renderTasks();
          this.showNotification(
              tareaActualizada.completed ? '✅ Tarea completada' : '🔄 Tarea reactivada',
              'success'
          );
      } catch (error) {
          this.showNotification(`Error al actualizar la tarea: ${error.message}`, 'error');
      }
  }

  /**
   * Elimina una tarea del servidor y de la lista local.
   * @param {number} taskId
   */
  async deleteTask(taskId) {
      if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return;

      try {
          await gestorRed.eliminarTarea(taskId);
          this.tareas = this.tareas.filter(t => t.id !== taskId);
          this.updateStats();
          this.renderTasks();
          this.showNotification('🗑️ Tarea eliminada', 'warning');
      } catch (error) {
          this.showNotification(`Error al eliminar la tarea: ${error.message}`, 'error');
      }
  }

  /**
   * Guarda los cambios realizados sobre una tarea en el modal de edición.
   */
  async saveEditedTask() {
      const taskId = this.idTareaEditando;
      const tarea  = this.tareas.find(t => t.id === taskId);
      if (!tarea) return;

      const newTitle = document.getElementById('edit-task-input').value.trim();
      if (!newTitle) {
          this.showNotification('El título de la tarea no puede estar vacío', 'error');
          return;
      }

      const editDueDateEl = document.getElementById('edit-task-due-date');
      const nuevaFecha = editDueDateEl?.value?.trim();

      if (!nuevaFecha) {
          this.showNotification('La fecha de vencimiento es obligatoria', 'error');
          return;
      }
      const diasHasta = daysUntilTaskExpiration(nuevaFecha);
      if (diasHasta === null) {
          this.showNotification('La fecha de vencimiento no es válida', 'error');
          return;
      }
      if (diasHasta < 0) {
          this.showNotification('La fecha de vencimiento no puede ser anterior a hoy', 'error');
          return;
      }

      try {
          const tareaActualizada = await gestorRed.actualizarTarea(taskId, {
              title:    newTitle,
              priority: document.getElementById('edit-task-priority').value,
              category: document.getElementById('edit-task-category').value,
              dueDate:  new Date(nuevaFecha).toISOString(),
          });

          const indice = this.tareas.findIndex(t => t.id === taskId);
          if (indice !== -1) this.tareas[indice] = tareaActualizada;

          this.renderTasks();
          this.closeEditModal();
          this.showNotification('✏️ Tarea actualizada', 'success');
      } catch (error) {
          this.showNotification(`Error al guardar la tarea: ${error.message}`, 'error');
      }
  }

  /**
   * Elimina del servidor todas las tareas completadas en paralelo.
   */
  async clearCompletedTasks() {
      const completadas = this.tareas.filter(t => t.completed);
      if (completadas.length === 0) {
          this.showNotification('ℹ️ No hay tareas completadas', 'info');
          return;
      }
      if (!confirm(`¿Eliminar ${completadas.length} tarea(s) completada(s)?`)) return;

      try {
          await Promise.all(completadas.map(t => gestorRed.eliminarTarea(t.id)));
          this.tareas = this.tareas.filter(t => !t.completed);
          this.updateStats();
          this.renderTasks();
          this.showNotification(`🧹 ${completadas.length} tarea(s) eliminada(s)`, 'success');
      } catch (error) {
          this.showNotification(`Error al limpiar tareas: ${error.message}`, 'error');
          await this.cargarTareas();
      }
  }

  /**
   * Marca todas las tareas pendientes como completadas en paralelo.
   */
  async completarTodasLasTareas() {
      const pendientes = this.tareas.filter(t => !t.completed);
      if (pendientes.length === 0) {
          this.showNotification('ℹ️ Todas las tareas ya están completadas', 'info');
          return;
      }
      if (!confirm(`¿Marcar ${pendientes.length} tarea(s) pendiente(s) como completadas?`)) return;

      try {
          const actualizadas = await Promise.all(
              pendientes.map(t => gestorRed.actualizarTarea(t.id, { completed: true }))
          );
          actualizadas.forEach(tareaActualizada => {
              const indice = this.tareas.findIndex(t => t.id === tareaActualizada.id);
              if (indice !== -1) this.tareas[indice] = tareaActualizada;
          });
          this.updateStats();
          this.renderTasks();
          this.showNotification(`✅ ${pendientes.length} tarea(s) completadas`, 'success');
      } catch (error) {
          this.showNotification(`Error al completar tareas: ${error.message}`, 'error');
          await this.cargarTareas();
      }
  }

  // ---------------------------------------------------------------------------
  // FILTROS Y ORDENACIÓN
  // ---------------------------------------------------------------------------

  buscarTareasRapido(consulta) {
      if (consulta !== undefined) this.terminoBusqueda = consulta.toLowerCase().trim();
      this.renderTasks();
  }

  setFilter(filter) {
      this.filtroActual = filter;
      this.updateFilterButtons();
      this.renderTasks();
  }

  setCategoryFilter(category) {
      this.categoriaActual = category;
      this.updateCategoryButtons();
      this.renderTasks();
  }

  setDueFilter(dueFilter) {
      this.filtroVencimiento = dueFilter;
      this.updateDueFilterButtons();
      this.renderTasks();
  }

  setView(vista) {
      this.vistaActual = vista;
      this.updateViewButtons();
      const container = document.getElementById('task-container');
      container.className = vista === 'list'
          ? 'space-y-3'
          : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4';
      this.renderTasks();
  }

  // ---------------------------------------------------------------------------
  // RENDERIZADO
  // ---------------------------------------------------------------------------

  renderTasks() {
      let tareasFiltradas = [...this.tareas];

      if (this.terminoBusqueda) {
          tareasFiltradas = tareasFiltradas.filter(tarea =>
              tarea.title.toLowerCase().includes(this.terminoBusqueda) ||
              tarea.category.toLowerCase().includes(this.terminoBusqueda) ||
              tarea.priority.toLowerCase().includes(this.terminoBusqueda)
          );
      }

      if (this.filtroActual === 'pending') {
          tareasFiltradas = tareasFiltradas.filter(t => !t.completed);
      } else if (this.filtroActual === 'completed') {
          tareasFiltradas = tareasFiltradas.filter(t => t.completed);
      }

      if (this.categoriaActual !== 'all') {
          tareasFiltradas = tareasFiltradas.filter(t => t.category === this.categoriaActual);
      }

      tareasFiltradas = this.applyDueDateFilter(tareasFiltradas);
      tareasFiltradas = this.sortTasks(tareasFiltradas);

      this.renderFilteredTasks(tareasFiltradas);
  }

  applyDueDateFilter(tareas) {
      const filtro = this.filtroVencimiento || 'all';
      if (filtro === 'all') return tareas;
      if (typeof daysUntilTaskExpiration !== 'function') return tareas;

      const diasHasta = (t) => daysUntilTaskExpiration(t.dueDate);

      switch (filtro) {
          case 'overdue': return tareas.filter(t => { const d = diasHasta(t); return typeof d === 'number' && d < 0; });
          case 'today':   return tareas.filter(t => { const d = diasHasta(t); return typeof d === 'number' && d === 0; });
          case 'next7':   return tareas.filter(t => { const d = diasHasta(t); return typeof d === 'number' && d >= 0 && d <= 7; });
          default: return tareas;
      }
  }

  sortTasks(tareas) {
      const orden = this.ordenActual || 'created_desc';
      const prioridadValor = { alta: 3, media: 2, baja: 1 };
      const copia = [...tareas];

      switch (orden) {
          case 'created_asc':   return copia.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          case 'created_desc':  return copia.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          case 'due_asc':       return copia.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
          case 'due_desc':      return copia.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
          case 'priority_desc': return copia.sort((a, b) => (prioridadValor[b.priority] || 0) - (prioridadValor[a.priority] || 0));
          case 'title_asc':     return copia.sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''), 'es', { sensitivity: 'base' }));
          default: return copia;
      }
  }

  renderFilteredTasks(tareas) {
      const container = document.getElementById('task-container');
      if (!container) return;
      container.innerHTML = tareas.length === 0
          ? this.buildEmptyStateHTML()
          : tareas.map(t => this.createTaskHTML(t)).join('');
  }

  buildEmptyStateHTML() {
      let mensajeVacio = '¡Empieza a ser productivo!';
      let iconoVacio   = 'fas fa-bolt';

      if (this.terminoBusqueda) {
          mensajeVacio = `No se encontraron tareas para "${this.terminoBusqueda}"`;
          iconoVacio   = 'fas fa-search';
      } else if (this.filtroActual === 'completed') {
          mensajeVacio = 'No hay tareas completadas';
          iconoVacio   = 'fas fa-check-circle';
      } else if (this.filtroActual === 'pending') {
          mensajeVacio = 'No hay tareas pendientes';
          iconoVacio   = 'fas fa-clock';
      } else if (this.categoriaActual !== 'all') {
          mensajeVacio = 'No hay tareas en la categoría seleccionada';
          iconoVacio   = 'fas fa-folder-open';
      }

      const textoAyuda = this.terminoBusqueda || this.filtroActual !== 'all' || this.categoriaActual !== 'all'
          ? 'Prueba con otros filtros'
          : 'Añade tu primera tarea rápida ⚡';

      return `
          <div class="col-span-full text-center py-16">
              <i class="${iconoVacio} text-6xl text-yellow-500 mb-4 animate-pulse"></i>
              <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">${mensajeVacio}</h3>
              <p class="text-gray-500 dark:text-gray-400">${textoAyuda}</p>
          </div>
      `;
  }

  createTaskHTML(task) {
      const priorityColors = {
          alta:  'border-red-500 bg-red-50 dark:bg-red-900/20',
          media: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
          baja:  'border-green-500 bg-green-50 dark:bg-green-900/20'
      };
      const priorityIcons  = { alta: '🔴', media: '⚡', baja: '🟢' };
      const categoryIcons  = { personal: '👤', trabajo: '💼', hogar: '🏠', salud: '🏥', estudios: '📚' };

      const completedClass  = task.completed ? 'opacity-60' : '';
      const textDecoration  = task.completed ? 'line-through' : '';
      const dueDateInfo     = this.getDueDateInfo(task);
      const dueDatePill     = dueDateInfo ? `
          <span class="text-xs font-semibold px-2 py-1 rounded-full ${dueDateInfo.className}">
              ${dueDateInfo.label}
          </span>` : '';

      return `
          <div class="task-card bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 ${priorityColors[task.priority]} ${completedClass}
                      transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
               data-task-id="${task.id}">
              <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-2 flex-wrap">
                      <button class="toggle-task text-2xl hover:scale-110 transition-transform duration-300" data-task-id="${task.id}">
                          ${task.completed ? '✅' : '⭕'}
                      </button>
                      <span class="text-lg">${categoryIcons[task.category] || '📌'}</span>
                      <span class="text-sm font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                          ${priorityIcons[task.priority]} ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                      ${dueDatePill}
                  </div>
                  <div class="flex gap-1">
                      <button class="edit-task text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300" data-task-id="${task.id}">
                          <i class="fas fa-edit"></i>
                      </button>
                      <button class="delete-task text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300" data-task-id="${task.id}">
                          <i class="fas fa-trash"></i>
                      </button>
                  </div>
              </div>
              <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-2 ${textDecoration}">${task.title}</h3>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                  ${new Date(task.createdAt).toLocaleDateString('es-ES')}
              </div>
          </div>
      `;
  }

  getDueDateInfo(task) {
      if (!task?.dueDate) return null;
      if (typeof daysUntilTaskExpiration !== 'function') return null;

      const days = daysUntilTaskExpiration(task.dueDate);
      if (days === null) return { label: 'Fecha inválida', className: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' };
      if (days < 0) {
          const abs = Math.abs(days);
          return { label: `Venció hace ${abs} día${abs !== 1 ? 's' : ''}`, className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' };
      }
      if (days === 0) return { label: 'Vence hoy', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200' };
      return { label: `Vence en ${days} día${days !== 1 ? 's' : ''}`, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' };
  }

  // ---------------------------------------------------------------------------
  // DELEGACIÓN DE EVENTOS EN TARJETAS
  // ---------------------------------------------------------------------------

  bindTaskCardDelegation() {
      const container = document.getElementById('task-container');
      if (!container) return;

      container.addEventListener('click', (e) => {
          const btn = e.target.closest('.toggle-task, .edit-task, .delete-task');
          if (!btn) return;
          e.preventDefault();
          const taskId = parseInt(btn.dataset.taskId, 10);
          if (Number.isNaN(taskId)) return;

          if (btn.classList.contains('toggle-task'))       this.toggleTaskCompletion(taskId);
          else if (btn.classList.contains('edit-task'))    this.openEditModal(taskId);
          else if (btn.classList.contains('delete-task'))  this.deleteTask(taskId);
      });
  }

  // ---------------------------------------------------------------------------
  // MODAL DE EDICIÓN
  // ---------------------------------------------------------------------------

  openEditModal(taskId) {
      const task = this.tareas.find(t => t.id === taskId);
      if (!task) return;

      this.idTareaEditando = taskId;
      document.getElementById('edit-task-id').value       = taskId;
      document.getElementById('edit-task-input').value    = task.title;
      document.getElementById('edit-task-priority').value = task.priority;
      document.getElementById('edit-task-category').value = task.category;

      if (task.dueDate) {
          const d    = new Date(task.dueDate);
          const anio = d.getFullYear();
          const mes  = d.getMonth() + 1;
          const dia  = d.getDate();
          this.fillDayOptions('edit-task-due-day', mes, anio);
          const editYear  = document.getElementById('edit-task-due-year');
          const editMonth = document.getElementById('edit-task-due-month');
          const editDay   = document.getElementById('edit-task-due-day');
          if (editYear)  editYear.value  = anio;
          if (editMonth) editMonth.value = mes;
          if (editDay)   editDay.value   = Math.min(dia, getDaysInMonth(mes, anio));
      }
      this.syncEditDueDateFromSelects();

      const modal = document.getElementById('edit-modal');
      modal.classList.remove('opacity-0', 'pointer-events-none');
      modal.querySelector('div').classList.remove('scale-95');
      modal.querySelector('div').classList.add('scale-100');
  }

  closeEditModal() {
      const modal = document.getElementById('edit-modal');
      modal.classList.add('opacity-0', 'pointer-events-none');
      modal.querySelector('div').classList.remove('scale-100');
      modal.querySelector('div').classList.add('scale-95');
      this.idTareaEditando = null;
  }

  // ---------------------------------------------------------------------------
  // SELECTORES DE FECHA (sin cambios respecto a Fase 1/2)
  // ---------------------------------------------------------------------------

  initializeDateSelectors() {
      const anioActual = new Date().getFullYear();
      const hoy        = new Date();
      const diaHoy     = hoy.getDate();
      const mesHoy     = hoy.getMonth() + 1;
      const anioHoy    = hoy.getFullYear();

      const yearSelect = document.getElementById('task-due-year');
      if (yearSelect) {
          yearSelect.innerHTML = '';
          for (let y = anioActual; y <= anioActual + 3; y++) {
              const opt = document.createElement('option');
              opt.value = y; opt.textContent = y;
              yearSelect.appendChild(opt);
          }
      }

      this.fillDayOptions('task-due-day', mesHoy, anioHoy);
      const taskMonth = document.getElementById('task-due-month');
      const taskDay   = document.getElementById('task-due-day');
      if (taskMonth)  taskMonth.value = mesHoy;
      if (yearSelect) yearSelect.value = anioHoy;
      if (taskDay)    taskDay.value = Math.min(diaHoy, getDaysInMonth(mesHoy, anioHoy));
      this.syncTaskDueDateFromSelects();

      taskMonth?.addEventListener('change', () => {
          const mes  = parseInt(document.getElementById('task-due-month').value, 10);
          const anio = parseInt(document.getElementById('task-due-year').value, 10);
          this.fillDayOptions('task-due-day', mes, anio);
          this.syncTaskDueDateFromSelects();
      });
      document.getElementById('task-due-year')?.addEventListener('change', () => {
          const mes  = parseInt(document.getElementById('task-due-month').value, 10);
          const anio = parseInt(document.getElementById('task-due-year').value, 10);
          this.fillDayOptions('task-due-day', mes, anio);
          this.syncTaskDueDateFromSelects();
      });
      taskDay?.addEventListener('change', () => this.syncTaskDueDateFromSelects());

      const editYear = document.getElementById('edit-task-due-year');
      if (editYear) {
          editYear.innerHTML = '';
          for (let y = anioActual - 1; y <= anioActual + 3; y++) {
              const opt = document.createElement('option');
              opt.value = y; opt.textContent = y;
              editYear.appendChild(opt);
          }
      }
      document.getElementById('edit-task-due-month')?.addEventListener('change', () => {
          const mes  = parseInt(document.getElementById('edit-task-due-month').value, 10);
          const anio = parseInt(document.getElementById('edit-task-due-year').value, 10);
          this.fillDayOptions('edit-task-due-day', mes, anio);
          this.syncEditDueDateFromSelects();
      });
      document.getElementById('edit-task-due-year')?.addEventListener('change', () => {
          const mes  = parseInt(document.getElementById('edit-task-due-month').value, 10);
          const anio = parseInt(document.getElementById('edit-task-due-year').value, 10);
          this.fillDayOptions('edit-task-due-day', mes, anio);
          this.syncEditDueDateFromSelects();
      });
      document.getElementById('edit-task-due-day')?.addEventListener('change', () => this.syncEditDueDateFromSelects());
  }

  fillDayOptions(selectId, mes, anio) {
      const select = document.getElementById(selectId);
      if (!select) return;
      const maxDias   = getDaysInMonth(mes, anio);
      const currentVal = select.value;
      select.innerHTML = '';
      for (let d = 1; d <= maxDias; d++) {
          const opt = document.createElement('option');
          opt.value = d; opt.textContent = d;
          select.appendChild(opt);
      }
      select.value = Math.min(parseInt(currentVal || '1', 10), maxDias) || 1;
  }

  syncTaskDueDateFromSelects() {
      const day   = document.getElementById('task-due-day')?.value;
      const month = document.getElementById('task-due-month')?.value;
      const year  = document.getElementById('task-due-year')?.value;
      const hidden = document.getElementById('task-due-date');
      if (hidden && day && month && year) {
          hidden.value = `${year}-${padTwo(month)}-${padTwo(day)}`;
      }
  }

  syncEditDueDateFromSelects() {
      const day   = document.getElementById('edit-task-due-day')?.value;
      const month = document.getElementById('edit-task-due-month')?.value;
      const year  = document.getElementById('edit-task-due-year')?.value;
      const hidden = document.getElementById('edit-task-due-date');
      if (hidden && day && month && year) {
          hidden.value = `${year}-${padTwo(month)}-${padTwo(day)}`;
      }
  }

  // ---------------------------------------------------------------------------
  // ESTADÍSTICAS Y NOTIFICACIONES
  // ---------------------------------------------------------------------------

  updateStats() {
      const total     = this.tareas.length;
      const completed = this.tareas.filter(t => t.completed).length;
      document.getElementById('total-tasks').textContent     = `${total} Tarea${total !== 1 ? 's' : ''}`;
      document.getElementById('completed-tasks').textContent = `${completed} Completada${completed !== 1 ? 's' : ''}`;
  }

  showNotification(message, type = 'info') {
      const notification = document.getElementById('notification');
      const icon         = document.getElementById('notification-icon');
      const messageEl    = document.getElementById('notification-message');

      const config = {
          success: { icon: 'fas fa-check-circle',       bg: 'bg-green-500'  },
          warning: { icon: 'fas fa-exclamation-triangle', bg: 'bg-yellow-500' },
          error:   { icon: 'fas fa-times-circle',         bg: 'bg-red-500'    },
          info:    { icon: 'fas fa-info-circle',           bg: 'bg-blue-500'   }
      };

      const { icon: iconClass, bg } = config[type] || config.info;
      icon.className        = iconClass;
      messageEl.textContent = message;
      notification.className = `fixed top-6 right-6 z-50 px-6 py-4 rounded-lg text-white font-semibold
                               transform transition-all duration-500 flex items-center gap-3 ${bg}`;
      notification.classList.remove('translate-x-full', 'opacity-0');
      setTimeout(() => notification.classList.add('translate-x-full', 'opacity-0'), 3000);
  }

  // ---------------------------------------------------------------------------
  // PREFERENCIAS DE UI (localStorage — no son datos de negocio)
  // ---------------------------------------------------------------------------

  loadPreferences() {
      try {
          const raw   = localStorage.getItem('quicktask-preferences');
          const prefs = raw ? JSON.parse(raw) : null;
          if (prefs?.sort)      this.ordenActual       = prefs.sort;
          if (prefs?.dueFilter) this.filtroVencimiento = prefs.dueFilter;
      } catch {
          // Ignorar preferencias corruptas
      }
  }

  savePreferences() {
      const prefs = { sort: this.ordenActual, dueFilter: this.filtroVencimiento };
      localStorage.setItem('quicktask-preferences', JSON.stringify(prefs));
  }

  // ---------------------------------------------------------------------------
  // SYNC DE UI DE FILTROS
  // ---------------------------------------------------------------------------

  updateFilterButtons() {
      const select = document.getElementById('filter-status');
      if (select) select.value = this.filtroActual || 'all';
  }

  updateCategoryButtons() {
      const select = document.getElementById('filter-category');
      if (select) select.value = this.categoriaActual || 'all';
  }

  updateViewButtons() {
      document.querySelectorAll('.view-btn').forEach(btn => {
          const activo = btn.dataset.view === this.vistaActual;
          this.updateButtonState(btn, activo);
      });
  }

  updateDueFilterButtons() {
      const select = document.getElementById('filter-due');
      if (select) select.value = this.filtroVencimiento || 'all';
  }

  updateButtonState(boton, activo) {
      boton.classList.remove('bg-gray-100', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300', 'bg-purple-500', 'text-white', 'bg-purple-600');
      if (activo) boton.classList.add('bg-purple-500', 'text-white');
      else        boton.classList.add('bg-gray-100', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
  }

  initializeSortUI() {
      const sortSelect = document.getElementById('sort-select');
      if (sortSelect) sortSelect.value = this.ordenActual || 'created_desc';
  }

  initializeDueFilterUI() {
      this.updateDueFilterButtons();
  }
}

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', () => {
    new GestorTareasRapidas();
});
