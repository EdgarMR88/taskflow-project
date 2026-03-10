class QuickTaskManager {
  constructor() {
      this.tasks = [];
      this.currentFilter = 'all';
      this.currentCategory = 'all';
      this.currentView = 'grid';
      this.editingTaskId = null;
      this.currentSearchTerm = '';
      
      this.init();
  }

  init() {
      this.loadTasks();
      this.bindEvents();
      this.updateStats();
      this.renderTasks();
      this.updateEmptyState();
      this.showWelcomeMessage();
      this.initializeButtonStyles();
  }

  initializeButtonStyles() {
      // Aplicar estilos iniciales a los botones
      this.updateFilterButtons();
      this.updateCategoryButtons();
      this.updateViewButtons();
  }

  showWelcomeMessage() {
      if (this.tasks.length === 0) {
          console.log('⚡ ¡Bienvenido a QuickTask! Tu gestor de tareas rápido y eficiente.');
      }
  }

  bindEvents() {
      // Form submission
      document.getElementById('task-form').addEventListener('submit', (e) => {
          e.preventDefault();
          this.addTaskQuickly();
      });

      // Search functionality - CORREGIDO
      document.getElementById('search-input').addEventListener('input', (e) => {
          this.currentSearchTerm = e.target.value;
          this.searchTasksQuickly(e.target.value);
      });

      // Filter buttons - CORREGIDO
      document.querySelectorAll('.filter-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
              e.preventDefault();
              const filter = e.currentTarget.dataset.filter;
              this.setFilter(filter);
          });
      });

      // Category buttons - CORREGIDO
      document.querySelectorAll('.category-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
              e.preventDefault();
              const category = e.currentTarget.dataset.category;
              this.setCategoryFilter(category);
          });
      });

      // View toggle - CORREGIDO
      document.querySelectorAll('.view-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
              e.preventDefault();
              const view = e.currentTarget.dataset.view;
              this.setView(view);
          });
      });

      // Export tasks
      document.getElementById('export-tasks').addEventListener('click', () => {
          this.exportTasks();
      });

      // Clear completed
      document.getElementById('clear-completed').addEventListener('click', () => {
          this.clearCompletedTasks();
      });

      // Modal events
      document.querySelectorAll('.close-modal, .cancel-edit').forEach(btn => {
          btn.addEventListener('click', () => {
              this.closeEditModal();
          });
      });

      document.getElementById('edit-form').addEventListener('submit', (e) => {
          e.preventDefault();
          this.saveEditedTask();
      });

      // Close modal on backdrop click
      document.getElementById('edit-modal').addEventListener('click', (e) => {
          if (e.target.id === 'edit-modal') {
              this.closeEditModal();
          }
      });
  }

  addTaskQuickly() {
      const titleInput = document.getElementById('task-input');
      const prioritySelect = document.getElementById('task-priority');
      const categorySelect = document.getElementById('task-category');
      const dueDateInput = document.getElementById('task-due-date');

      const title = titleInput.value.trim();
      if (!title) return;

      const task = {
          id: Date.now(),
          title: title,
          priority: prioritySelect.value,
          category: categorySelect.value,
          dueDate: dueDateInput?.value ? new Date(dueDateInput.value).toISOString() : null,
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

  searchTasksQuickly(query) {
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

      this.renderFilteredTasks(filteredTasks);
  }

  renderFilteredTasks(tasks) {
      const container = document.getElementById('task-container');
      const emptyState = document.getElementById('empty-state');

      // Limpiar contenedor
      container.innerHTML = '';

      if (tasks.length === 0) {
          // Mostrar estado vacío apropiado
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

          container.innerHTML = `
              <div class="col-span-full text-center py-16">
                  <i class="${emptyIcon} text-6xl text-yellow-500 mb-4 animate-pulse"></i>
                  <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      ${emptyMessage}
                  </h3>
                  <p class="text-gray-500 dark:text-gray-400">
                      ${this.currentSearchTerm || this.currentFilter !== 'all' || this.currentCategory !== 'all' 
                          ? 'Prueba con otros filtros' 
                          : 'Añade tu primera tarea rápida ⚡'}
                  </p>
              </div>
          `;
          return;
      }

      // Renderizar tareas
      container.innerHTML = tasks.map(task => this.createTaskHTML(task)).join('');

      // Bind task events
      this.bindTaskEvents();
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

  saveEditedTask() {
      const taskId = this.editingTaskId;
      const task = this.tasks.find(t => t.id === taskId);
      
      if (!task) return;

      task.title = document.getElementById('edit-task-input').value.trim();
      task.priority = document.getElementById('edit-task-priority').value;
      task.category = document.getElementById('edit-task-category').value;
      const editDueDateEl = document.getElementById('edit-task-due-date');
      task.dueDate = editDueDateEl?.value ? new Date(editDueDateEl.value).toISOString() : null;

      this.saveTasks();
      this.renderTasks();
      this.closeEditModal();
      this.showNotification('✏️ Tarea actualizada', 'success');
  }

  exportTasks() {
      const dataStr = JSON.stringify(this.tasks, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `quicktask-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      this.showNotification('📤 Tareas exportadas', 'success');
  }

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

  updateStats() {
      const totalTasks = this.tasks.length;
      const completedTasks = this.tasks.filter(t => t.completed).length;

      document.getElementById('total-tasks').textContent = `${totalTasks} Tarea${totalTasks !== 1 ? 's' : ''}`;
      document.getElementById('completed-tasks').textContent = `${completedTasks} Completada${completedTasks !== 1 ? 's' : ''}`;
  }

  updateEmptyState() {
      // Este método ya no es necesario porque renderFilteredTasks maneja el estado vacío
  }

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

  saveTasks() {
      localStorage.setItem('quicktask-tasks', JSON.stringify(this.tasks));
  }

  loadTasks() {
      const saved = localStorage.getItem('quicktask-tasks');
      this.tasks = saved ? JSON.parse(saved) : [];
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    new QuickTaskManager();
});