class QuickTaskManager {
  constructor() {
      this.tasks = [];
      this.currentFilter = 'todas';
      this.currentCategory = 'todas';
      this.currentView = 'grid';
      this.editingTaskId = null;
      
      this.init();
  }

  init() {
      this.loadTasks();
      this.bindEvents();
      this.updateStats();
      this.renderTasks();
      this.updateEmptyState();
      this.showWelcomeMessage();
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

      // Search functionality
      document.getElementById('search-input').addEventListener('input', (e) => {
          this.searchTasksQuickly(e.target.value);
      });

      // Filter buttons
      document.querySelectorAll('.filter-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
              this.setFilter(e.target.dataset.filter);
          });
      });

      // Category filters
      document.querySelectorAll('.category-filter').forEach(btn => {
          btn.addEventListener('click', (e) => {
              this.setCategoryFilter(e.target.dataset.category);
          });
      });

      // View toggle
      document.getElementById('grid-view').addEventListener('click', () => {
          this.setView('grid');
      });

      document.getElementById('list-view').addEventListener('click', () => {
          this.setView('list');
      });

      // Clear completed tasks
      document.getElementById('clear-completed').addEventListener('click', () => {
          this.clearCompletedTasksQuickly();
      });

      // Export tasks
      document.getElementById('export-tasks').addEventListener('click', () => {
          this.exportTasksQuickly();
      });

      // Modal events
      document.getElementById('edit-modal').addEventListener('click', (e) => {
          if (e.target.id === 'edit-modal') {
              this.closeModal();
          }
      });

      document.querySelector('.close-modal').addEventListener('click', () => {
          this.closeModal();
      });

      document.getElementById('cancel-edit').addEventListener('click', () => {
          this.closeModal();
      });

      document.getElementById('edit-form').addEventListener('submit', (e) => {
          e.preventDefault();
          this.saveEditedTaskQuickly();
      });
  }

  addTaskQuickly() {
      const taskInput = document.getElementById('task-input');
      const prioritySelect = document.getElementById('task-priority');
      const categorySelect = document.getElementById('task-category');

      const taskText = taskInput.value.trim();
      if (!taskText) {
          this.showQuickNotification('⚠️ ¡Escribe algo para crear una tarea rápida!', 'warning');
          return;
      }

      const task = {
          id: Date.now(),
          text: taskText,
          priority: prioritySelect.value,
          category: categorySelect.value,
          completed: false,
          createdAt: new Date().toISOString(),
          completedAt: null,
          isQuickTask: true // Marca especial de QuickTask
      };

      this.tasks.unshift(task);
      this.saveTasksQuickly();
      this.renderTasks();
      this.updateStats();
      this.updateEmptyState();

      // Reset form
      taskInput.value = '';
      prioritySelect.value = 'media';
      categorySelect.value = 'personal';

      // Quick notification
      this.showQuickNotification('⚡ ¡Tarea añadida rápidamente!', 'success');

      // Add animation to new task
      setTimeout(() => {
          const newTaskElement = document.querySelector(`[data-id="${task.id}"]`);
          if (newTaskElement) {
              newTaskElement.classList.add('fade-in');
          }
      }, 100);
  }

  deleteTaskQuickly(id) {
      const taskElement = document.querySelector(`[data-id="${id}"]`);
      if (taskElement) {
          taskElement.classList.add('slide-out');
          setTimeout(() => {
              this.tasks = this.tasks.filter(task => task.id !== id);
              this.saveTasksQuickly();
              this.renderTasks();
              this.updateStats();
              this.updateEmptyState();
              this.showQuickNotification('🗑️ Tarea eliminada rápidamente', 'info');
          }, 300);
      }
  }

  toggleTaskCompleteQuickly(id) {
      const task = this.tasks.find(t => t.id === id);
      if (task) {
          task.completed = !task.completed;
          task.completedAt = task.completed ? new Date().toISOString() : null;
          this.saveTasksQuickly();
          this.renderTasks();
          this.updateStats();
          
          const message = task.completed ? 
              '✅ ¡Tarea completada rápidamente!' : 
              '🔄 Tarea reabierta rápidamente';
          this.showQuickNotification(message, 'success');
      }
  }

  editTaskQuickly(id) {
      const task = this.tasks.find(t => t.id === id);
      if (!task) return;

      this.editingTaskId = id;
      
      document.getElementById('edit-task-input').value = task.text;
      document.getElementById('edit-task-priority').value = task.priority;
      document.getElementById('edit-task-category').value = task.category;
      
      document.getElementById('edit-modal').style.display = 'block';
  }

  saveEditedTaskQuickly() {
      if (!this.editingTaskId) return;

      const task = this.tasks.find(t => t.id === this.editingTaskId);
      if (!task) return;

      const newText = document.getElementById('edit-task-input').value.trim();
      if (!newText) {
          this.showQuickNotification('⚠️ El título no puede estar vacío', 'warning');
          return;
      }

      task.text = newText;
      task.priority = document.getElementById('edit-task-priority').value;
      task.category = document.getElementById('edit-task-category').value;
      task.updatedAt = new Date().toISOString();

      this.saveTasksQuickly();
      this.renderTasks();
      this.closeModal();
      this.showQuickNotification('⚡ Tarea editada rápidamente', 'success');
  }

  closeModal() {
      document.getElementById('edit-modal').style.display = 'none';
      this.editingTaskId = null;
  }

  setFilter(filter) {
      this.currentFilter = filter;
      
      // Update active button
      document.querySelectorAll('.filter-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.filter === filter);
      });
      
      this.renderTasks();
      this.showQuickNotification(`🔍 Filtro aplicado: ${filter}`, 'info');
  }

  setCategoryFilter(category) {
      this.currentCategory = category;
      
      // Update active button
      document.querySelectorAll('.category-filter').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.category === category);
      });
      
      this.renderTasks();
      const categoryName = category === 'todas' ? 'todas' : category;
      this.showQuickNotification(`📂 Categoría: ${categoryName}`, 'info');
  }

  setView(view) {
      this.currentView = view;
      const taskList = document.getElementById('task-list');
      
      // Update active button
      document.querySelectorAll('.view-btn').forEach(btn => {
          btn.classList.remove('active');
      });
      document.getElementById(`${view}-view`).classList.add('active');
      
      // Update list class
      taskList.className = view === 'grid' ? 'task-grid' : 'task-list';
      
      const viewName = view === 'grid' ? 'cuadrícula' : 'lista';
      this.showQuickNotification(`👁️ Vista: ${viewName}`, 'info');
  }

  searchTasksQuickly(searchTerm) {
      const taskElements = document.querySelectorAll('.task-item');
      const term = searchTerm.toLowerCase().trim();
      
      if (!term) {
          taskElements.forEach(element => {
              element.style.display = 'block';
          });
          return;
      }
      
      let foundTasks = 0;
      taskElements.forEach(element => {
          const taskTitle = element.querySelector('.task-title').textContent.toLowerCase();
          const categoryBadge = element.querySelector('.category-badge').textContent.toLowerCase();
          const priorityBadge = element.querySelector('.priority-badge').textContent.toLowerCase();
          
          // Búsqueda mejorada en título, categoría y prioridad
          const shouldShow = taskTitle.includes(term) || 
                            categoryBadge.includes(term) || 
                            priorityBadge.includes(term);
          
          element.style.display = shouldShow ? 'block' : 'none';
          if (shouldShow) foundTasks++;
      });
      
      // Mostrar resultado de búsqueda
      if (term) {
          this.showQuickNotification(`🔎 ${foundTasks} tareas encontradas`, 'info');
      }
  }

  clearCompletedTasksQuickly() {
      const completedCount = this.tasks.filter(task => task.completed).length;
      
      if (completedCount === 0) {
          this.showQuickNotification('ℹ️ No hay tareas completadas para limpiar', 'info');
          return;
      }
      
      if (confirm(`¿Estás seguro de que quieres eliminar ${completedCount} tareas completadas rápidamente?`)) {
          this.tasks = this.tasks.filter(task => !task.completed);
          this.saveTasksQuickly();
          this.renderTasks();
          this.updateStats();
          this.updateEmptyState();
          this.showQuickNotification(`🧹 ${completedCount} tareas eliminadas rápidamente`, 'success');
      }
  }

  exportTasksQuickly() {
      if (this.tasks.length === 0) {
          this.showQuickNotification('ℹ️ No hay tareas para exportar', 'info');
          return;
      }

      const exportData = {
          appName: 'QuickTask',
          version: '1.0.0',
          exportDate: new Date().toISOString(),
          totalTasks: this.tasks.length,
          completedTasks: this.tasks.filter(t => t.completed).length,
          tasks: this.tasks
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `quicktask-export-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      this.showQuickNotification('📤 Tareas exportadas rápidamente', 'success');
  }

  renderTasks() {
      const taskList = document.getElementById('task-list');
      const filteredTasks = this.getFilteredTasks();
      
      taskList.innerHTML = '';
      
      filteredTasks.forEach(task => {
          const taskElement = this.createTaskElement(task);
          taskList.appendChild(taskElement);
      });
      
      this.updateEmptyState();
  }

  getFilteredTasks() {
      let filtered = [...this.tasks];
      
      // Filter by completion status
      if (this.currentFilter === 'pendientes') {
          filtered = filtered.filter(task => !task.completed);
      } else if (this.currentFilter === 'completadas') {
          filtered = filtered.filter(task => task.completed);
      }
      
      // Filter by category
      if (this.currentCategory !== 'todas') {
          filtered = filtered.filter(task => task.category === this.currentCategory);
      }
      
      return filtered;
  }

  createTaskElement(task) {
      const li = document.createElement('li');
      li.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
      li.dataset.id = task.id;
      
      const categoryIcons = {
          personal: '👤',
          trabajo: '💼',
          hogar: '🏠',
          salud: '🏥',
          estudios: '📚'
      };
      
      const priorityLabels = {
          alta: '🔴 Alta',
          media: '🟡 Media',
          baja: '🟢 Baja'
      };
      
      const date = new Date(task.createdAt).toLocaleDateString('es-ES');
      const quickBadge = task.isQuickTask ? '<span class="task-badge" style="background: rgba(243, 156, 18, 0.2); color: #f39c12; border: 1px solid #f39c12;">⚡ QuickTask</span>' : '';
      
      li.innerHTML = `
          <div class="task-header">
              <h3 class="task-title">${this.escapeHtml(task.text)}</h3>
          </div>
          <div class="task-meta">
              <span class="task-badge priority-badge ${task.priority}">${priorityLabels[task.priority]}</span>
              <span class="task-badge category-badge">${categoryIcons[task.category]} ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>
              ${quickBadge}
          </div>
          <div class="task-date">
              Creada: ${date}
              ${task.completedAt ? `<br>Completada: ${new Date(task.completedAt).toLocaleDateString('es-ES')}` : ''}
              ${task.updatedAt ? `<br>Editada: ${new Date(task.updatedAt).toLocaleDateString('es-ES')}` : ''}
          </div>
          <div class="task-actions">
              <button class="task-btn complete-btn" onclick="quickTaskManager.toggleTaskCompleteQuickly(${task.id})">
                  <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                  ${task.completed ? 'Reabrir' : 'Completar'}
              </button>
              <button class="task-btn edit-btn" onclick="quickTaskManager.editTaskQuickly(${task.id})">
                  <i class="fas fa-bolt"></i>
                  Editar
              </button>
              <button class="task-btn delete-btn" onclick="quickTaskManager.deleteTaskQuickly(${task.id})">
                  <i class="fas fa-trash"></i>
                  Eliminar
              </button>
          </div>
      `;
      
      return li;
  }

  updateStats() {
      const totalTasks = this.tasks.length;
      const completedTasks = this.tasks.filter(task => task.completed).length;
      
      document.getElementById('total-tasks').textContent = totalTasks;
      document.getElementById('completed-tasks').textContent = completedTasks;
  }

  updateEmptyState() {
      const taskList = document.getElementById('task-list');
      const emptyState = document.getElementById('empty-state');
      
      if (taskList.children.length === 0) {
          emptyState.style.display = 'block';
      } else {
          emptyState.style.display = 'none';
      }
  }

  saveTasksQuickly() {
      try {
          localStorage.setItem('quicktask-data', JSON.stringify({
              tasks: this.tasks,
              lastSaved: new Date().toISOString(),
              version: '1.0.0'
          }));
      } catch (error) {
          this.showQuickNotification('⚠️ Error al guardar tareas', 'error');
          console.error('Error saving tasks:', error);
      }
  }

  loadTasks() {
      try {
          const saved = localStorage.getItem('quicktask-data');
          if (saved) {
              const data = JSON.parse(saved);
              this.tasks = data.tasks || [];
              console.log('⚡ Tareas cargadas rápidamente desde QuickTask');
          }
      } catch (error) {
          console.error('Error loading tasks:', error);
          this.tasks = [];
      }
  }

  showQuickNotification(message, type = 'info') {
      // Crear notificación temporal
      const notification = document.createElement('div');
      notification.className = `quick-notification ${type}`;
      notification.textContent = message;
      
      // Estilos de la notificación
      notification.style.cssText = `
          position: fixed;
          top: 100px;
          right: 20px;
          background: ${type === 'success' ? '#27ae60' : type === 'warning' ? '#f39c12' : type === 'error' ? '#e74c3c' : '#3498db'};
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          z-index: 1001;
          animation: quickSlideIn 0.3s ease;
          max-width: 300px;
      `;
      
      document.body.appendChild(notification);
      
      // Eliminar después de 3 segundos
      setTimeout(() => {
          notification.style.animation = 'quickSlideOut 0.3s ease';
          setTimeout(() => {
              if (notification.parentNode) {
                  notification.parentNode.removeChild(notification);
              }
          }, 300);
      }, 3000);
  }

  escapeHtml(text) {
      const map = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
      };
      return text.replace(/[&<>"']/g, m => map[m]);
  }

  // Método para obtener estadísticas rápidas
  getQuickStats() {
      const total = this.tasks.length;
      const completed = this.tasks.filter(t => t.completed).length;
      const pending = total - completed;
      const byPriority = {
          alta: this.tasks.filter(t => t.priority === 'alta' && !t.completed).length,
          media: this.tasks.filter(t => t.priority === 'media' && !t.completed).length,
          baja: this.tasks.filter(t => t.priority === 'baja' && !t.completed).length
      };
      
      return { total, completed, pending, byPriority };
  }
}

// Añadir estilos para las notificaciones
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
  @keyframes quickSlideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes quickSlideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(notificationStyles);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.quickTaskManager = new QuickTaskManager();
  
  // Mensaje de bienvenida en consola
  console.log(`
  ⚡ QuickTask v1.0.0 - ¡Cargado exitosamente!
  🚀 Tu gestor de tareas rápido y eficiente
  💡 Usa Ctrl+Enter para añadir tareas rápidamente
  📊 Escribe quickTaskManager.getQuickStats() para ver estadísticas
  `);
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Enter to add task quickly
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const taskInput = document.getElementById('task-input');
      if (taskInput.value.trim()) {
          quickTaskManager.addTaskQuickly();
      } else {
          taskInput.focus();
          quickTaskManager.showQuickNotification('⚡ ¡Escribe una tarea rápida!', 'info');
      }
  }
  
  // Escape to close modal
  if (e.key === 'Escape') {
      quickTaskManager.closeModal();
  }
  
  // Ctrl + F to focus search
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      document.getElementById('search-input').focus();
      quickTaskManager.showQuickNotification('🔍 Búsqueda rápida activada', 'info');
  }
});