class TaskManager {
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
  }

  bindEvents() {
      // Form submission
      document.getElementById('task-form').addEventListener('submit', (e) => {
          e.preventDefault();
          this.addTask();
      });

      // Search functionality
      document.getElementById('search-input').addEventListener('input', (e) => {
          this.searchTasks(e.target.value);
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
          this.clearCompletedTasks();
      });

      // Export tasks
      document.getElementById('export-tasks').addEventListener('click', () => {
          this.exportTasks();
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
          this.saveEditedTask();
      });
  }

  addTask() {
      const taskInput = document.getElementById('task-input');
      const prioritySelect = document.getElementById('task-priority');
      const categorySelect = document.getElementById('task-category');

      const taskText = taskInput.value.trim();
      if (!taskText) return;

      const task = {
          id: Date.now(),
          text: taskText,
          priority: prioritySelect.value,
          category: categorySelect.value,
          completed: false,
          createdAt: new Date().toISOString(),
          completedAt: null
      };

      this.tasks.unshift(task);
      this.saveTasks();
      this.renderTasks();
      this.updateStats();
      this.updateEmptyState();

      // Reset form
      taskInput.value = '';
      prioritySelect.value = 'media';
      categorySelect.value = 'personal';

      // Add animation to new task
      setTimeout(() => {
          const newTaskElement = document.querySelector(`[data-id="${task.id}"]`);
          if (newTaskElement) {
              newTaskElement.classList.add('fade-in');
          }
      }, 100);
  }

  deleteTask(id) {
      const taskElement = document.querySelector(`[data-id="${id}"]`);
      if (taskElement) {
          taskElement.classList.add('slide-out');
          setTimeout(() => {
              this.tasks = this.tasks.filter(task => task.id !== id);
              this.saveTasks();
              this.renderTasks();
              this.updateStats();
              this.updateEmptyState();
          }, 300);
      }
  }

  toggleTaskComplete(id) {
      const task = this.tasks.find(t => t.id === id);
      if (task) {
          task.completed = !task.completed;
          task.completedAt = task.completed ? new Date().toISOString() : null;
          this.saveTasks();
          this.renderTasks();
          this.updateStats();
      }
  }

  editTask(id) {
      const task = this.tasks.find(t => t.id === id);
      if (!task) return;

      this.editingTaskId = id;
      
      document.getElementById('edit-task-input').value = task.text;
      document.getElementById('edit-task-priority').value = task.priority;
      document.getElementById('edit-task-category').value = task.category;
      
      document.getElementById('edit-modal').style.display = 'block';
  }

  saveEditedTask() {
      if (!this.editingTaskId) return;

      const task = this.tasks.find(t => t.id === this.editingTaskId);
      if (!task) return;

      task.text = document.getElementById('edit-task-input').value.trim();
      task.priority = document.getElementById('edit-task-priority').value;
      task.category = document.getElementById('edit-task-category').value;

      this.saveTasks();
      this.renderTasks();
      this.closeModal();
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
  }

  setCategoryFilter(category) {
      this.currentCategory = category;
      
      // Update active button
      document.querySelectorAll('.category-filter').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.category === category);
      });
      
      this.renderTasks();
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
  }

  searchTasks(searchTerm) {
      const taskElements = document.querySelectorAll('.task-item');
      const term = searchTerm.toLowerCase();
      
      taskElements.forEach(element => {
          const taskText = element.querySelector('.task-title').textContent.toLowerCase();
          const shouldShow = taskText.includes(term);
          element.style.display = shouldShow ? 'block' : 'none';
      });
  }

  clearCompletedTasks() {
      if (confirm('¿Estás seguro de que quieres eliminar todas las tareas completadas?')) {
          this.tasks = this.tasks.filter(task => !task.completed);
          this.saveTasks();
          this.renderTasks();
          this.updateStats();
          this.updateEmptyState();
      }
  }

  exportTasks() {
      const dataStr = JSON.stringify(this.tasks, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `tasks-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
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
      
      li.innerHTML = `
          <div class="task-header">
              <h3 class="task-title">${this.escapeHtml(task.text)}</h3>
          </div>
          <div class="task-meta">
              <span class="task-badge priority-badge ${task.priority}">${priorityLabels[task.priority]}</span>
              <span class="task-badge category-badge">${categoryIcons[task.category]} ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>
          </div>
          <div class="task-date">
              Creada: ${date}
              ${task.completedAt ? `<br>Completada: ${new Date(task.completedAt).toLocaleDateString('es-ES')}` : ''}
          </div>
          <div class="task-actions">
              <button class="task-btn complete-btn" onclick="taskManager.toggleTaskComplete(${task.id})">
                  <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                  ${task.completed ? 'Reabrir' : 'Completar'}
              </button>
              <button class="task-btn edit-btn" onclick="taskManager.editTask(${task.id})">
                  <i class="fas fa-edit"></i>
                  Editar
              </button>
              <button class="task-btn delete-btn" onclick="taskManager.deleteTask(${task.id})">
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

  saveTasks() {
      localStorage.setItem('taskmaster-tasks', JSON.stringify(this.tasks));
  }

  loadTasks() {
      const saved = localStorage.getItem('taskmaster-tasks');
      if (saved) {
          this.tasks = JSON.parse(saved);
      }
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
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.taskManager = new TaskManager();
});

// Add some keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Enter to add task quickly
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const taskInput = document.getElementById('task-input');
      if (taskInput.value.trim()) {
          taskManager.addTask();
      }
  }
  
  // Escape to close modal
  if (e.key === 'Escape') {
      taskManager.closeModal();
  }
});