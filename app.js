/**
 * Gestor principal de la aplicación QuickTask.
 * Se encarga de gestionar el estado de las tareas, los filtros
 * y de sincronizar todo con la interfaz de usuario.
 */
class GestorTareasRapidas {
  constructor() {
      this.tasks = [];
      this.currentFilter = 'all';
      this.currentCategory = 'all';
      this.currentView = 'grid';
      this.editingTaskId = null;
      this.currentSearchTerm = '';
      this.currentSort = 'created_desc';
      this.currentDueFilter = 'all';
      
      this.init();
  }

  /**
   * Inicializa la aplicación cargando datos, enlaces de eventos y vista inicial.
   */
  init() {
      this.loadTasks();
      this.loadPreferences();
      this.bindEvents();
      this.updateStats();
      this.renderTasks();
      this.updateEmptyState();
      this.showWelcomeMessage();
      this.initializeButtonStyles();
      this.initializeSortUI();
      this.initializeDueFilterUI();
  }

  initializeButtonStyles() {
      // Aplicar estilos iniciales a los botones
      this.updateFilterButtons();
      this.updateCategoryButtons();
      this.updateViewButtons();
  }

  /**
   * Muestra un mensaje de bienvenida en consola cuando no hay tareas.
   */
  showWelcomeMessage() {
      if (this.tasks.length === 0) {
          console.log('⚡ ¡Bienvenido a QuickTask! Tu gestor de tareas rápido y eficiente.');
      }
  }

  /**
   * Enlaza todos los eventos principales de la interfaz.
   */
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

      searchInput.addEventListener('input', (e) => {
          this.currentSearchTerm = e.target.value;
          this.buscarTareasRapido(e.target.value);
      });
  }

  bindFilterEvents() {
      document.querySelectorAll('.filter-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
              e.preventDefault();
              const filter = e.currentTarget.dataset.filter;
              this.setFilter(filter);
          });
      });
  }

  bindCategoryEvents() {
      document.querySelectorAll('.category-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
              e.preventDefault();
              const category = e.currentTarget.dataset.category;
              this.setCategoryFilter(category);
          });
      });
  }

  bindDueFilterEvents() {
      document.querySelectorAll('.due-filter-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
              e.preventDefault();
              const dueFilter = e.currentTarget.dataset.dueFilter;
              this.setDueFilter(dueFilter);
          });
      });
  }

  bindViewEvents() {
      document.querySelectorAll('.view-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
              e.preventDefault();
              const view = e.currentTarget.dataset.view;
              this.setView(view);
          });
      });
  }

  bindSortEvents() {
      const sortSelect = document.getElementById('sort-select');
      if (!sortSelect) return;

      sortSelect.addEventListener('change', (e) => {
          this.currentSort = e.target.value;
          this.savePreferences();
          this.renderTasks();
      });
  }

  bindBulkActionEvents() {
      const exportBtn = document.getElementById('export-tasks');
      if (exportBtn) {
          exportBtn.addEventListener('click', () => {
              this.exportTasks();
          });
      }

      const importBtn = document.getElementById('import-tasks');
      const importInput = document.getElementById('import-file-input');
      if (importBtn && importInput) {
          importBtn.addEventListener('click', () => {
              importInput.value = '';
              importInput.click();
          });

          importInput.addEventListener('change', async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              await this.importTasksFromFile(file);
          });
      }

      const clearCompletedBtn = document.getElementById('clear-completed');
      if (clearCompletedBtn) {
          clearCompletedBtn.addEventListener('click', () => {
              this.clearCompletedTasks();
          });
      }
  }

  bindModalEvents() {
      document.querySelectorAll('.close-modal, .cancel-edit').forEach(btn => {
          btn.addEventListener('click', () => {
              this.closeEditModal();
          });
      });

      const editForm = document.getElementById('edit-form');
      if (editForm) {
          editForm.addEventListener('submit', (e) => {
              e.preventDefault();
              this.saveEditedTask();
          });
      }

      const editModal = document.getElementById('edit-modal');
      if (editModal) {
          editModal.addEventListener('click', (e) => {
              if (e.target.id === 'edit-modal') {
                  this.closeEditModal();
              }
          });
      }
  }

  bindKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
          if (e.defaultPrevented) return;
          if (e.ctrlKey || e.metaKey || e.altKey) return;

          const activeTag = document.activeElement?.tagName?.toLowerCase();
          const isTyping = activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable;

          // Si hay un modal abierto, permitir ESC incluso si estás escribiendo
          if (e.key === 'Escape') {
              const modal = document.getElementById('edit-modal');
              const isOpen = modal && !modal.classList.contains('pointer-events-none');
              if (isOpen) {
                  this.closeEditModal();
                  e.preventDefault();
              }
              return;
          }

          if (isTyping) return;

          if (e.key === '/') {
              const search = document.getElementById('search-input');
              if (search) {
                  search.focus();
                  e.preventDefault();
              }
              return;
          }

          if (e.key === 'n' || e.key === 'N') {
              const input = document.getElementById('task-input');
              if (input) {
                  input.focus();
                  e.preventDefault();
              }
              return;
          }

          if (e.key === 'g' || e.key === 'G') {
              const nextView = this.currentView === 'grid' ? 'list' : 'grid';
              this.setView(nextView);
              e.preventDefault();
              return;
          }

          if (e.key === 't' || e.key === 'T') {
              const toggle = document.getElementById('theme-toggle');
              if (toggle) {
                  toggle.click();
                  e.preventDefault();
              }
          }
      });
  }

  /**
   * Crea una nueva tarea rápida a partir del formulario lateral.
   */
  agregarTareaRapida() {
      const titleInput = document.getElementById('task-input');
      const prioritySelect = document.getElementById('task-priority');
      const categorySelect = document.getElementById('task-category');
      const dueDateInput = document.getElementById('task-due-date');

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

      const task = {
          id: Date.now(),
          title: title,
          priority: prioritySelect.value,
          category: categorySelect.value,
          dueDate: new Date(dueDateValue).toISOString(),
          completed: false,
          createdAt: new Date().toISOString()
      };

      this.tasks.unshift(task);
      this.saveTasks();
      this.updateStats();
      this.renderTasks(); // CORREGIDO: Renderizar inmediatamente
      this.updateEmptyState();

      // Reset form
      titleInput.value = '';
      prioritySelect.value = 'media';
      categorySelect.value = 'personal';
      if (dueDateInput) dueDateInput.value = '';

      this.showNotification('✅ Tarea añadida rápidamente', 'success');
      titleInput.focus();
  }

  /**
   * Actualiza el término de búsqueda y vuelve a renderizar las tareas.
   * @param {string} query - Texto introducido en el buscador.
   */
  buscarTareasRapido(query) {
      this.currentSearchTerm = query.toLowerCase().trim();
      this.renderTasks(); // CORREGIDO: Usar renderTasks que ya aplica todos los filtros
  }

  setFilter(filter) {
      this.currentFilter = filter;
      this.updateFilterButtons();
      this.renderTasks();
  }

  setCategoryFilter(category) {
      this.currentCategory = category;
      this.updateCategoryButtons();
      this.renderTasks();
  }

  setDueFilter(dueFilter) {
      this.currentDueFilter = dueFilter;
      this.updateDueFilterButtons();
      this.renderTasks();
  }

  setView(view) {
      this.currentView = view;
      this.updateViewButtons();
      
      const container = document.getElementById('task-container');
      if (view === 'list') {
          container.className = 'space-y-3';
      } else {
          container.className = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4';
      }

      this.renderTasks();
  }

  // NUEVOS MÉTODOS para actualizar botones
  updateFilterButtons() {
      document.querySelectorAll('.filter-btn').forEach(btn => {
          const isActive = btn.dataset.filter === this.currentFilter;
          this.updateButtonState(btn, isActive);
      });
  }

  updateCategoryButtons() {
      document.querySelectorAll('.category-btn').forEach(btn => {
          const isActive = btn.dataset.category === this.currentCategory;
          this.updateButtonState(btn, isActive);
      });
  }

  updateViewButtons() {
      document.querySelectorAll('.view-btn').forEach(btn => {
          const isActive = btn.dataset.view === this.currentView;
          this.updateButtonState(btn, isActive);
      });
  }

  updateDueFilterButtons() {
      document.querySelectorAll('.due-filter-btn').forEach(btn => {
          const isActive = btn.dataset.dueFilter === this.currentDueFilter;
          this.updateButtonState(btn, isActive);
      });
  }

  updateButtonState(button, isActive) {
      // Remover todas las clases
      button.classList.remove(
          'bg-gray-100', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300',
          'bg-purple-500', 'text-white', 'bg-purple-600'
      );
      
      if (isActive) {
          button.classList.add('bg-purple-500', 'text-white');
      } else {
          button.classList.add('bg-gray-100', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
      }
  }

  /**
   * Aplica filtros (búsqueda, estado y categoría) y renderiza el resultado.
   */
  renderTasks() {
      let filteredTasks = [...this.tasks];

      // Aplicar filtro de búsqueda PRIMERO
      if (this.currentSearchTerm) {
          filteredTasks = filteredTasks.filter(task => 
              task.title.toLowerCase().includes(this.currentSearchTerm) ||
              task.category.toLowerCase().includes(this.currentSearchTerm) ||
              task.priority.toLowerCase().includes(this.currentSearchTerm)
          );
      }

      // Apply status filter
      if (this.currentFilter === 'pending') {
          filteredTasks = filteredTasks.filter(task => !task.completed);
      } else if (this.currentFilter === 'completed') {
          filteredTasks = filteredTasks.filter(task => task.completed);
      }

      // Apply category filter
      if (this.currentCategory !== 'all') {
          filteredTasks = filteredTasks.filter(task => task.category === this.currentCategory);
      }

      filteredTasks = this.applyDueDateFilter(filteredTasks);
      filteredTasks = this.sortTasks(filteredTasks);

      this.renderFilteredTasks(filteredTasks);
  }

  applyDueDateFilter(tasks) {
      const filter = this.currentDueFilter || 'all';
      if (filter === 'all') return tasks;
      if (typeof daysUntilTaskExpiration !== 'function') return tasks;

      const daysUntil = (task) => daysUntilTaskExpiration(task.dueDate);

      switch (filter) {
          case 'overdue':
              return tasks.filter(t => {
                  const d = daysUntil(t);
                  return typeof d === 'number' && d < 0;
              });
          case 'today':
              return tasks.filter(t => {
                  const d = daysUntil(t);
                  return typeof d === 'number' && d === 0;
              });
          case 'next7':
              return tasks.filter(t => {
                  const d = daysUntil(t);
                  return typeof d === 'number' && d >= 0 && d <= 7;
              });
          default:
              return tasks;
      }
  }

  sortTasks(tasks) {
      const sort = this.currentSort || 'created_desc';
      const priorityRank = { alta: 3, media: 2, baja: 1 };

      const copy = [...tasks];

      switch (sort) {
          case 'created_asc':
              return copy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          case 'created_desc':
              return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          case 'due_asc':
              return copy.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
          case 'due_desc':
              return copy.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
          case 'priority_desc':
              return copy.sort((a, b) => (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0));
          case 'title_asc':
              return copy.sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''), 'es', { sensitivity: 'base' }));
          default:
              return copy;
      }
  }

  /**
   * Renderiza en el DOM la lista de tareas ya filtradas.
   * @param {Array<Object>} tasks - Tareas filtradas que se deben mostrar.
   */
  renderFilteredTasks(tasks) {
      const container = document.getElementById('task-container');
      if (!container) return;

      // Limpiar contenedor
      container.innerHTML = '';

      if (tasks.length === 0) {
          container.innerHTML = this.buildEmptyStateHTML();
          return;
      }

      // Renderizar tareas
      container.innerHTML = tasks.map(task => this.createTaskHTML(task)).join('');

      // Enlazar eventos de cada tarjeta
      this.bindTaskEvents();
  }

  buildEmptyStateHTML() {
      let emptyMessage = '';
      let emptyIcon = 'fas fa-bolt';
      
      if (this.currentSearchTerm) {
          emptyMessage = `No se encontraron tareas para "${this.currentSearchTerm}"`;
          emptyIcon = 'fas fa-search';
      } else if (this.currentFilter === 'completed') {
          emptyMessage = 'No hay tareas completadas';
          emptyIcon = 'fas fa-check-circle';
      } else if (this.currentFilter === 'pending') {
          emptyMessage = 'No hay tareas pendientes';
          emptyIcon = 'fas fa-clock';
      } else if (this.currentCategory !== 'all') {
          emptyMessage = `No hay tareas en la categoría seleccionada`;
          emptyIcon = 'fas fa-folder-open';
      } else {
          emptyMessage = '¡Empieza a ser productivo!';
          emptyIcon = 'fas fa-bolt';
      }

      const helperText = this.currentSearchTerm || this.currentFilter !== 'all' || this.currentCategory !== 'all' 
          ? 'Prueba con otros filtros' 
          : 'Añade tu primera tarea rápida ⚡';

      return `
          <div class="col-span-full text-center py-16">
              <i class="${emptyIcon} text-6xl text-yellow-500 mb-4 animate-pulse"></i>
              <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  ${emptyMessage}
              </h3>
              <p class="text-gray-500 dark:text-gray-400">
                  ${helperText}
              </p>
          </div>
      `;
  }

  createTaskHTML(task) {
      const priorityColors = {
          alta: 'border-red-500 bg-red-50 dark:bg-red-900/20',
          media: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
          baja: 'border-green-500 bg-green-50 dark:bg-green-900/20'
      };

      const priorityIcons = {
          alta: '🔴',
          media: '⚡',
          baja: '🟢'
      };

      const categoryIcons = {
          personal: '👤',
          trabajo: '💼',
          hogar: '🏠',
          salud: '🏥',
          estudios: '📚'
      };

      const completedClass = task.completed ? 'opacity-60' : '';
      const textDecoration = task.completed ? 'line-through' : '';

      const dueDateInfo = this.getDueDateInfo(task);
      const dueDatePill = dueDateInfo
          ? `
              <span class="text-xs font-semibold px-2 py-1 rounded-full ${dueDateInfo.className}">
                  ${dueDateInfo.label}
              </span>
          `
          : '';

      return `
          <div class="task-card bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 ${priorityColors[task.priority]} ${completedClass} 
                      transform hover:scale-105 transition-all duration-300 hover:shadow-lg" 
               data-task-id="${task.id}">
              
              <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-2">
                      <button class="toggle-task text-2xl hover:scale-110 transition-transform duration-300" 
                              data-task-id="${task.id}">
                          ${task.completed ? '✅' : '⭕'}
                      </button>
                      <span class="text-lg">${categoryIcons[task.category]}</span>
                      <span class="text-sm font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                          ${priorityIcons[task.priority]} ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                      ${dueDatePill}
                  </div>
                  
                  <div class="flex gap-1">
                      <button class="edit-task text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300" 
                              data-task-id="${task.id}">
                          <i class="fas fa-edit"></i>
                      </button>
                      <button class="delete-task text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300" 
                              data-task-id="${task.id}">
                          <i class="fas fa-trash"></i>
                      </button>
                  </div>
              </div>
              
              <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-2 ${textDecoration}">
                  ${task.title}
              </h3>
              
              <div class="text-xs text-gray-500 dark:text-gray-400">
                  ${new Date(task.createdAt).toLocaleDateString('es-ES')}
              </div>
          </div>
      `;
  }

  /**
   * Devuelve información de texto y estilo sobre la fecha de vencimiento.
   * @param {{ dueDate?: string }} task
   * @returns {{ label: string, className: string } | null}
   */
  getDueDateInfo(task) {
      if (!task?.dueDate) return null;
      if (typeof daysUntilTaskExpiration !== 'function') return null;

      const days = daysUntilTaskExpiration(task.dueDate);
      if (days === null) {
          return { label: 'Fecha inválida', className: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' };
      }

      if (days < 0) {
          const abs = Math.abs(days);
          return {
              label: `Venció hace ${abs} día${abs !== 1 ? 's' : ''}`,
              className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
          };
      }

      if (days === 0) {
          return {
              label: 'Vence hoy',
              className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200'
          };
      }

      return {
          label: `Vence en ${days} día${days !== 1 ? 's' : ''}`,
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
      };
  }

  bindTaskEvents() {
      // Toggle task completion
      document.querySelectorAll('.toggle-task').forEach(btn => {
          btn.addEventListener('click', (e) => {
              const taskId = parseInt(e.currentTarget.dataset.taskId);
              this.toggleTaskCompletion(taskId);
          });
      });

      // Edit task
      document.querySelectorAll('.edit-task').forEach(btn => {
          btn.addEventListener('click', (e) => {
              const taskId = parseInt(e.currentTarget.dataset.taskId);
              this.openEditModal(taskId);
          });
      });

      // Delete task
      document.querySelectorAll('.delete-task').forEach(btn => {
          btn.addEventListener('click', (e) => {
              const taskId = parseInt(e.currentTarget.dataset.taskId);
              this.deleteTask(taskId);
          });
      });
  }

  toggleTaskCompletion(taskId) {
      const task = this.tasks.find(t => t.id === taskId);
      if (task) {
          task.completed = !task.completed;
          this.saveTasks();
          this.updateStats();
          this.renderTasks();
          
          const message = task.completed ? '✅ Tarea completada' : '🔄 Tarea reactivada';
          this.showNotification(message, 'success');
      }
  }

  deleteTask(taskId) {
      if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
          this.tasks = this.tasks.filter(t => t.id !== taskId);
          this.saveTasks();
          this.updateStats();
          this.renderTasks();
          this.updateEmptyState();
          this.showNotification('🗑️ Tarea eliminada', 'warning');
      }
  }

  openEditModal(taskId) {
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) return;

      this.editingTaskId = taskId;
      
      document.getElementById('edit-task-id').value = taskId;
      document.getElementById('edit-task-input').value = task.title;
      document.getElementById('edit-task-priority').value = task.priority;
      document.getElementById('edit-task-category').value = task.category;
      const editDueDateEl = document.getElementById('edit-task-due-date');
      if (editDueDateEl) {
          editDueDateEl.value = task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '';
      }

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
      this.editingTaskId = null;
  }

  /**
   * Guarda los cambios realizados sobre una tarea en el modal de edición.
   * Incluye validación para evitar títulos vacíos.
   */
  saveEditedTask() {
      const taskId = this.editingTaskId;
      const task = this.tasks.find(t => t.id === taskId);
      
      if (!task) return;

      const newTitle = document.getElementById('edit-task-input').value.trim();
      if (!newTitle) {
          this.showNotification('El título de la tarea no puede estar vacío', 'error');
          return;
      }

      task.title = newTitle;
      task.priority = document.getElementById('edit-task-priority').value;
      task.category = document.getElementById('edit-task-category').value;
      const editDueDateEl = document.getElementById('edit-task-due-date');
      const nuevaFecha = editDueDateEl?.value?.trim();

      if (!nuevaFecha) {
          this.showNotification('La fecha de vencimiento es obligatoria', 'error');
          return;
      }

      const diasHastaVencimiento = daysUntilTaskExpiration(nuevaFecha);

      if (diasHastaVencimiento === null) {
          this.showNotification('La fecha de vencimiento no es válida', 'error');
          return;
      }

      if (diasHastaVencimiento < 0) {
          this.showNotification('La fecha de vencimiento no puede ser anterior a hoy', 'error');
          return;
      }

      task.dueDate = new Date(nuevaFecha).toISOString();

      this.saveTasks();
      this.renderTasks();
      this.closeEditModal();
      this.showNotification('✏️ Tarea actualizada', 'success');
  }

  /**
   * Exporta las tareas actuales a un archivo JSON descargable.
   */
  exportTasks() {
      const dataStr = JSON.stringify(this.tasks, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `quicktask-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      this.showNotification('📤 Tareas exportadas', 'success');
  }

  async importTasksFromFile(file) {
      try {
          const text = await file.text();
          const parsed = JSON.parse(text);

          if (!Array.isArray(parsed)) {
              this.showNotification('El JSON debe ser un array de tareas', 'error');
              return;
          }

          const imported = parsed
              .map((t) => this.normalizeImportedTask(t))
              .filter(Boolean);

          if (imported.length === 0) {
              this.showNotification('No se encontraron tareas válidas para importar', 'error');
              return;
          }

          const replace = confirm(
              `Se importarán ${imported.length} tarea(s).\n\nAceptar: reemplazar todas las tareas actuales.\nCancelar: añadir (merge) a las tareas actuales.`
          );

          this.tasks = replace ? imported : [...imported, ...this.tasks];
          this.saveTasks();
          this.updateStats();
          this.renderTasks();

          this.showNotification('📥 Importación completada', 'success');
      } catch (err) {
          console.error(err);
          this.showNotification('Error al importar JSON (formato inválido)', 'error');
      }
  }

  normalizeImportedTask(raw) {
      if (!raw || typeof raw !== 'object') return null;

      const title = String(raw.title ?? '').trim();
      if (!title) return null;

      const priority = raw.priority;
      const category = raw.category;
      const dueDate = raw.dueDate;

      const allowedPriorities = new Set(['alta', 'media', 'baja']);
      const allowedCategories = new Set(['personal', 'trabajo', 'hogar', 'salud', 'estudios']);

      if (!allowedPriorities.has(priority)) return null;
      if (!allowedCategories.has(category)) return null;

      const days = typeof dueDate === 'string' ? daysUntilTaskExpiration(dueDate) : null;
      if (days === null) return null;

      const createdAt = raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString();
      const completed = Boolean(raw.completed);

      return {
          id: typeof raw.id === 'number' ? raw.id : Date.now() + Math.floor(Math.random() * 100000),
          title,
          priority,
          category,
          dueDate: new Date(dueDate).toISOString(),
          completed,
          createdAt
      };
  }

  /**
   * Elimina todas las tareas marcadas como completadas,
   * mostrando mensajes informativos según el caso.
   */
  clearCompletedTasks() {
      const completedCount = this.tasks.filter(t => t.completed).length;
      
      if (completedCount === 0) {
          this.showNotification('ℹ️ No hay tareas completadas', 'info');
          return;
      }

      if (confirm(`¿Eliminar ${completedCount} tarea(s) completada(s)?`)) {
          this.tasks = this.tasks.filter(t => !t.completed);
          this.saveTasks();
          this.updateStats();
          this.renderTasks();
          this.updateEmptyState();
          this.showNotification(`🧹 ${completedCount} tarea(s) eliminada(s)`, 'success');
      }
  }

  /**
   * Actualiza los contadores de tareas totales y completadas en el header.
   */
  updateStats() {
      const totalTasks = this.tasks.length;
      const completedTasks = this.tasks.filter(t => t.completed).length;

      document.getElementById('total-tasks').textContent = `${totalTasks} Tarea${totalTasks !== 1 ? 's' : ''}`;
      document.getElementById('completed-tasks').textContent = `${completedTasks} Completada${completedTasks !== 1 ? 's' : ''}`;
  }

  updateEmptyState() {
      // Este método ya no es necesario porque renderFilteredTasks maneja el estado vacío
  }

  /**
   * Muestra una notificación flotante en la esquina superior derecha.
   * @param {string} message - Texto a mostrar.
   * @param {'success'|'warning'|'error'|'info'} [type='info'] - Tipo de notificación.
   */
  showNotification(message, type = 'info') {
      const notification = document.getElementById('notification');
      const icon = document.getElementById('notification-icon');
      const messageEl = document.getElementById('notification-message');

      const config = {
          success: { icon: 'fas fa-check-circle', bg: 'bg-green-500' },
          warning: { icon: 'fas fa-exclamation-triangle', bg: 'bg-yellow-500' },
          error: { icon: 'fas fa-times-circle', bg: 'bg-red-500' },
          info: { icon: 'fas fa-info-circle', bg: 'bg-blue-500' }
      };

      const { icon: iconClass, bg } = config[type] || config.info;

      icon.className = iconClass;
      messageEl.textContent = message;
      notification.className = `fixed top-6 right-6 z-50 px-6 py-4 rounded-lg text-white font-semibold
                               transform transition-all duration-500 flex items-center gap-3 ${bg}`;

      // Show notification
      notification.classList.remove('translate-x-full', 'opacity-0');

      // Hide after 3 seconds
      setTimeout(() => {
          notification.classList.add('translate-x-full', 'opacity-0');
      }, 3000);
  }

  /**
   * Persiste las tareas en localStorage.
   */
  saveTasks() {
      localStorage.setItem('quicktask-tasks', JSON.stringify(this.tasks));
  }

  loadPreferences() {
      try {
          const raw = localStorage.getItem('quicktask-preferences');
          const prefs = raw ? JSON.parse(raw) : null;
          if (prefs?.sort) this.currentSort = prefs.sort;
          if (prefs?.dueFilter) this.currentDueFilter = prefs.dueFilter;
      } catch {
          // Ignorar preferencias corruptas
      }
  }

  savePreferences() {
      const prefs = { sort: this.currentSort, dueFilter: this.currentDueFilter };
      localStorage.setItem('quicktask-preferences', JSON.stringify(prefs));
  }

  initializeSortUI() {
      const sortSelect = document.getElementById('sort-select');
      if (!sortSelect) return;
      sortSelect.value = this.currentSort || 'created_desc';
  }

  initializeDueFilterUI() {
      this.updateDueFilterButtons();
  }

  /**
   * Carga las tareas almacenadas previamente en localStorage.
   */
  loadTasks() {
      const saved = localStorage.getItem('quicktask-tasks');
      this.tasks = saved ? JSON.parse(saved) : [];
  }
}

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', () => {
    new GestorTareasRapidas();
});