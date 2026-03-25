/**
 * Gestor principal de la aplicación QuickTask.
 * Fase 3 — Fase D: persistencia via API REST (gestorRed).
 * Preferencias de UI (orden, filtro) en localStorage.
 */

const CONFIG = {
    DEBOUNCE_MS: 200,
    priorities:    { alta: 3, media: 2, baja: 1 },
    priorityIcons: { alta: '🔴', media: '⚡', baja: '🟢' },
    categoryIcons: { personal: '👤', trabajo: '💼', hogar: '🏠', salud: '🏥', estudios: '📚' },
    priorityColors: {
        alta:  'border-red-500 bg-red-50 dark:bg-red-900/20',
        media: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
        baja:  'border-green-500 bg-green-50 dark:bg-green-900/20',
    },
};
Object.freeze(CONFIG);

class GestorTareasRapidas {
    constructor() {
        this.tareas            = [];
        this.filtroActual      = 'all';
        this.categoriaActual   = 'all';
        this.vistaActual       = 'grid';
        this.idTareaEditando   = null;
        this.terminoBusqueda   = '';
        this.ordenActual       = 'created_desc';
        this.filtroVencimiento = 'all';
        this.init().catch((err) => console.error('Error al inicializar la aplicacion:', err));
    }

    async init() {
        this.configurarEstadoRed();
        this.loadPreferences();
        this.bindEvents();
        this.initializeDateSelectors();
        this.updateSelectUI('filter-status',   this.filtroActual);
        this.updateSelectUI('filter-category', this.categoriaActual);
        this.updateSelectUI('filter-due',      this.filtroVencimiento);
        this.updateViewButtons();
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) sortSelect.value = this.ordenActual;
        await this.cargarTareas();
        this.updateStats();
        if (this.tareas.length === 0) console.log('⚡ ¡Bienvenido a QuickTask! Tu gestor de tareas rápido y eficiente.');
    }

    configurarEstadoRed() {
        const barraCargando = document.getElementById('barra-cargando');
        const cartelError   = document.getElementById('cartel-error');
        const mensajeError  = document.getElementById('cartel-error-mensaje');
        const btnCerrar     = document.getElementById('cartel-error-cerrar');
        gestorRed.alCambiar(({ cargando, error }) => {
            if (barraCargando) barraCargando.classList.toggle('hidden', !cargando);
            if (error) {
                if (mensajeError) mensajeError.textContent = error;
                if (cartelError)  cartelError.classList.remove('hidden');
            } else {
                if (cartelError) cartelError.classList.add('hidden');
            }
        });
        if (btnCerrar) btnCerrar.addEventListener('click', () => cartelError?.classList.add('hidden'));
    }

    async cargarTareas() {
        try { this.tareas = await gestorRed.obtenerTareas(); }
        catch { this.tareas = []; }
        this.renderTasks();
    }

    bindEvents() {
        // Formulario de nueva tarea
        const form = document.getElementById('task-form');
        if (form) form.addEventListener('submit', (e) => { e.preventDefault(); this.agregarTareaRapida(); });

        // Búsqueda con debounce
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            let t = null;
            searchInput.addEventListener('input', () => {
                clearTimeout(t);
                t = setTimeout(() => { this.terminoBusqueda = searchInput.value.toLowerCase().trim(); this.renderTasks(); }, CONFIG.DEBOUNCE_MS);
            });
        }

        // Filtros select
        const filterConfigs = [
            ['filter-status',   (v) => this.setFilter(v)],
            ['filter-category', (v) => this.setCategoryFilter(v)],
            ['filter-due',      (v) => this.setDueFilter(v)],
        ];
        filterConfigs.forEach(([id, fn]) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', (e) => fn(e.target.value));
        });

        // Vista y ordenación
        document.querySelectorAll('.view-btn').forEach(btn =>
            btn.addEventListener('click', (e) => { e.preventDefault(); this.setView(e.currentTarget.dataset.view); })
        );
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) sortSelect.addEventListener('change', (e) => { this.ordenActual = e.target.value; this.savePreferences(); this.renderTasks(); });

        // Acciones masivas
        document.getElementById('clear-completed')?.addEventListener('click', () => this.clearCompletedTasks());
        document.getElementById('complete-all-tasks')?.addEventListener('click', () => this.completarTodasLasTareas());

        // Modal de edición
        document.querySelectorAll('.close-modal, .cancel-edit').forEach(btn => btn.addEventListener('click', () => this.closeEditModal()));
        document.getElementById('edit-form')?.addEventListener('submit', (e) => { e.preventDefault(); this.saveEditedTask(); });
        document.getElementById('edit-modal')?.addEventListener('click', (e) => { if (e.target.id === 'edit-modal') this.closeEditModal(); });

        // Atajos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
            const tag      = document.activeElement?.tagName?.toLowerCase();
            const isTyping = tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable;
            if (e.key === 'Escape') {
                const modal = document.getElementById('edit-modal');
                if (modal && !modal.classList.contains('pointer-events-none')) { this.closeEditModal(); e.preventDefault(); }
                return;
            }
            if (isTyping) return;
            if (e.key === '/') { document.getElementById('search-input')?.focus(); e.preventDefault(); return; }
            if (e.key === 'n' || e.key === 'N') { document.getElementById('task-input')?.focus(); e.preventDefault(); return; }
            if (e.key === 'g' || e.key === 'G') { this.setView(this.vistaActual === 'grid' ? 'list' : 'grid'); e.preventDefault(); return; }
            if (e.key === 't' || e.key === 'T') { document.getElementById('theme-toggle')?.click(); e.preventDefault(); }
        });

        // Delegación de eventos en tarjetas
        const container = document.getElementById('task-container');
        if (container) {
            container.addEventListener('click', (e) => {
                const btn = e.target.closest('.toggle-task, .edit-task, .delete-task');
                if (!btn) return;
                e.preventDefault();
                const taskId = parseInt(btn.dataset.taskId, 10);
                if (Number.isNaN(taskId)) return;
                if (btn.classList.contains('toggle-task'))      this.toggleTaskCompletion(taskId);
                else if (btn.classList.contains('edit-task'))   this.openEditModal(taskId);
                else if (btn.classList.contains('delete-task')) this.deleteTask(taskId);
            });
        }
    }

    async agregarTareaRapida() {
        const titleInput     = document.getElementById('task-input');
        const prioritySelect = document.getElementById('task-priority');
        const categorySelect = document.getElementById('task-category');
        const title          = titleInput.value.trim();
        if (!title) return;

        const dueDateValue = document.getElementById('task-due-date')?.value?.trim();
        const error = this.validateDueDate(dueDateValue);
        if (error) { this.showNotification(error, 'error'); return; }

        try {
            const nuevaTarea = await gestorRed.crearTarea({
                title, priority: prioritySelect.value, category: categorySelect.value,
                dueDate: new Date(dueDateValue).toISOString(), completed: false,
            });
            this.tareas.unshift(nuevaTarea);
            this.updateStats();
            this.renderTasks();

            // Resetear formulario al día de hoy
            titleInput.value = ''; prioritySelect.value = 'media'; categorySelect.value = 'personal';
            const hoy = new Date();
            this.fillDayOptions('task-due-day', hoy.getMonth() + 1, hoy.getFullYear());
            const dayEl = document.getElementById('task-due-day'), monthEl = document.getElementById('task-due-month'), yearEl = document.getElementById('task-due-year');
            if (monthEl) monthEl.value = hoy.getMonth() + 1;
            if (yearEl)  yearEl.value  = hoy.getFullYear();
            if (dayEl)   dayEl.value   = hoy.getDate();
            this.syncDateFromSelects('task-due');

            this.showNotification('✅ Tarea añadida', 'success');
            titleInput.focus();
        } catch (err) {
            this.showNotification(`Error al crear la tarea: ${err.message}`, 'error');
        }
    }

    async toggleTaskCompletion(taskId) {
        const tarea = this.tareas.find(t => t.id === taskId);
        if (!tarea) return;
        try {
            const updated = await gestorRed.actualizarTarea(taskId, { completed: !tarea.completed });
            const i = this.tareas.findIndex(t => t.id === taskId);
            if (i !== -1) this.tareas[i] = updated;
            this.updateStats(); this.renderTasks();
            this.showNotification(updated.completed ? '✅ Tarea completada' : '🔄 Tarea reactivada', 'success');
        } catch (err) {
            this.showNotification(`Error al actualizar la tarea: ${err.message}`, 'error');
        }
    }

    async deleteTask(taskId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return;
        try {
            await gestorRed.eliminarTarea(taskId);
            this.tareas = this.tareas.filter(t => t.id !== taskId);
            this.updateStats(); this.renderTasks();
            this.showNotification('🗑️ Tarea eliminada', 'warning');
        } catch (err) {
            this.showNotification(`Error al eliminar la tarea: ${err.message}`, 'error');
        }
    }

    async saveEditedTask() {
        const taskId = this.idTareaEditando;
        if (!this.tareas.find(t => t.id === taskId)) return;
        const newTitle = document.getElementById('edit-task-input').value.trim();
        if (!newTitle) { this.showNotification('El título de la tarea no puede estar vacío', 'error'); return; }
        const dueDateValue = document.getElementById('edit-task-due-date')?.value?.trim();
        const error = this.validateDueDate(dueDateValue);
        if (error) { this.showNotification(error, 'error'); return; }
        try {
            const updated = await gestorRed.actualizarTarea(taskId, {
                title: newTitle,
                priority: document.getElementById('edit-task-priority').value,
                category: document.getElementById('edit-task-category').value,
                dueDate:  new Date(dueDateValue).toISOString(),
            });
            const i = this.tareas.findIndex(t => t.id === taskId);
            if (i !== -1) this.tareas[i] = updated;
            this.renderTasks(); this.closeEditModal();
            this.showNotification('✏️ Tarea actualizada', 'success');
        } catch (err) {
            this.showNotification(`Error al guardar la tarea: ${err.message}`, 'error');
        }
    }

    async clearCompletedTasks() {
        const completadas = this.tareas.filter(t => t.completed);
        if (completadas.length === 0) { this.showNotification('ℹ️ No hay tareas completadas', 'info'); return; }
        if (!confirm(`¿Eliminar ${completadas.length} tarea(s) completada(s)?`)) return;
        try {
            await Promise.all(completadas.map(t => gestorRed.eliminarTarea(t.id)));
            this.tareas = this.tareas.filter(t => !t.completed);
            this.updateStats(); this.renderTasks();
            this.showNotification(`🧹 ${completadas.length} tarea(s) eliminada(s)`, 'success');
        } catch (err) {
            this.showNotification(`Error al limpiar tareas: ${err.message}`, 'error');
            await this.cargarTareas();
        }
    }

    async completarTodasLasTareas() {
        const pendientes = this.tareas.filter(t => !t.completed);
        if (pendientes.length === 0) { this.showNotification('ℹ️ Todas las tareas ya están completadas', 'info'); return; }
        if (!confirm(`¿Marcar ${pendientes.length} tarea(s) pendiente(s) como completadas?`)) return;
        try {
            const actualizadas = await Promise.all(pendientes.map(t => gestorRed.actualizarTarea(t.id, { completed: true })));
            actualizadas.forEach(updated => {
                const i = this.tareas.findIndex(t => t.id === updated.id);
                if (i !== -1) this.tareas[i] = updated;
            });
            this.updateStats(); this.renderTasks();
            this.showNotification(`✅ ${pendientes.length} tarea(s) completadas`, 'success');
        } catch (err) {
            this.showNotification(`Error al completar tareas: ${err.message}`, 'error');
            await this.cargarTareas();
        }
    }

    buscarTareasRapido(consulta) {
        if (consulta !== undefined) this.terminoBusqueda = consulta.toLowerCase().trim();
        this.renderTasks();
    }

    setFilter(filter) {
        this.filtroActual = filter;
        this.updateSelectUI('filter-status', filter);
        this.renderTasks();
    }

    setCategoryFilter(category) {
        this.categoriaActual = category;
        this.updateSelectUI('filter-category', category);
        this.renderTasks();
    }

    setDueFilter(dueFilter) {
        this.filtroVencimiento = dueFilter;
        this.updateSelectUI('filter-due', dueFilter);
        this.savePreferences();
        this.renderTasks();
    }

    setView(vista) {
        this.vistaActual = vista;
        this.updateViewButtons();
        const container = document.getElementById('task-container');
        container.className = vista === 'list' ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4';
        this.renderTasks();
    }

    renderTasks() {
        let tareas = [...this.tareas];
        if (this.terminoBusqueda) {
            tareas = tareas.filter(t =>
                t.title.toLowerCase().includes(this.terminoBusqueda) ||
                t.category.toLowerCase().includes(this.terminoBusqueda) ||
                t.priority.toLowerCase().includes(this.terminoBusqueda)
            );
        }
        if (this.filtroActual === 'pending')        tareas = tareas.filter(t => !t.completed);
        else if (this.filtroActual === 'completed') tareas = tareas.filter(t => t.completed);
        if (this.categoriaActual !== 'all') tareas = tareas.filter(t => t.category === this.categoriaActual);
        tareas = this.applyDueDateFilter(tareas);
        tareas = this.sortTasks(tareas);
        this.renderFilteredTasks(tareas);
    }

    applyDueDateFilter(tareas) {
        const filtro = this.filtroVencimiento || 'all';
        if (filtro === 'all' || typeof daysUntilTaskExpiration !== 'function') return tareas;
        const d = (t) => daysUntilTaskExpiration(t.dueDate);
        switch (filtro) {
            case 'overdue': return tareas.filter(t => { const v = d(t); return typeof v === 'number' && v < 0; });
            case 'today':   return tareas.filter(t => { const v = d(t); return typeof v === 'number' && v === 0; });
            case 'next7':   return tareas.filter(t => { const v = d(t); return typeof v === 'number' && v >= 0 && v <= 7; });
            default: return tareas;
        }
    }

    sortTasks(tareas) {
        const copia = [...tareas];
        switch (this.ordenActual || 'created_desc') {
            case 'created_asc':   return copia.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'created_desc':  return copia.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'due_asc':       return copia.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            case 'due_desc':      return copia.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
            case 'priority_desc': return copia.sort((a, b) => (CONFIG.priorities[b.priority] || 0) - (CONFIG.priorities[a.priority] || 0));
            case 'title_asc':     return copia.sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''), 'es', { sensitivity: 'base' }));
            default: return copia;
        }
    }

    renderFilteredTasks(tareas) {
        const container = document.getElementById('task-container');
        if (!container) return;
        container.innerHTML = tareas.length === 0 ? this.buildEmptyStateHTML() : tareas.map(t => this.createTaskHTML(t)).join('');
    }

    buildEmptyStateHTML() {
        let msg = '¡Empieza a ser productivo!', icon = 'fas fa-bolt';
        if (this.terminoBusqueda)                  { msg = `No se encontraron tareas para "${this.terminoBusqueda}"`; icon = 'fas fa-search'; }
        else if (this.filtroActual === 'completed') { msg = 'No hay tareas completadas'; icon = 'fas fa-check-circle'; }
        else if (this.filtroActual === 'pending')   { msg = 'No hay tareas pendientes';  icon = 'fas fa-clock'; }
        else if (this.categoriaActual !== 'all')    { msg = 'No hay tareas en la categoría seleccionada'; icon = 'fas fa-folder-open'; }
        const help = this.terminoBusqueda || this.filtroActual !== 'all' || this.categoriaActual !== 'all'
            ? 'Prueba con otros filtros' : 'Añade tu primera tarea rápida ⚡';
        return `
            <div class="col-span-full text-center py-16">
                <i class="${icon} text-6xl text-yellow-500 mb-4 animate-pulse"></i>
                <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">${msg}</h3>
                <p class="text-gray-500 dark:text-gray-400">${help}</p>
            </div>`;
    }

    createTaskHTML(task) {
        const completedClass = task.completed ? 'opacity-60' : '';
        const textDecoration = task.completed ? 'line-through' : '';
        const dueDateInfo    = this.getDueDateInfo(task);
        const dueDatePill    = dueDateInfo
            ? `<span class="text-xs font-semibold px-2 py-1 rounded-full ${dueDateInfo.className}">${dueDateInfo.label}</span>`
            : '';
        return `
            <div class="task-card bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 ${CONFIG.priorityColors[task.priority]} ${completedClass}
                        transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                 data-task-id="${task.id}">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-2 flex-wrap">
                        <button class="toggle-task text-2xl hover:scale-110 transition-transform duration-300" data-task-id="${task.id}">${task.completed ? '✅' : '⭕'}</button>
                        <span class="text-lg">${CONFIG.categoryIcons[task.category] || '📌'}</span>
                        <span class="text-sm font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                            ${CONFIG.priorityIcons[task.priority]} ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                        ${dueDatePill}
                    </div>
                    <div class="flex gap-1">
                        <button class="edit-task text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300" data-task-id="${task.id}"><i class="fas fa-edit"></i></button>
                        <button class="delete-task text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300" data-task-id="${task.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-2 ${textDecoration}">${task.title}</h3>
                <div class="text-xs text-gray-500 dark:text-gray-400">${new Date(task.createdAt).toLocaleDateString('es-ES')}</div>
            </div>`;
    }

    getDueDateInfo(task) {
        if (!task?.dueDate || typeof daysUntilTaskExpiration !== 'function') return null;
        const days = daysUntilTaskExpiration(task.dueDate);
        if (days === null)  return { label: 'Fecha inválida', className: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' };
        if (days < 0) {
            const abs = Math.abs(days);
            return { label: `Venció hace ${abs} día${abs !== 1 ? 's' : ''}`, className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' };
        }
        if (days === 0) return { label: 'Vence hoy', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200' };
        return { label: `Vence en ${days} día${days !== 1 ? 's' : ''}`, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' };
    }

    openEditModal(taskId) {
        const task = this.tareas.find(t => t.id === taskId);
        if (!task) return;
        this.idTareaEditando = taskId;
        document.getElementById('edit-task-id').value       = taskId;
        document.getElementById('edit-task-input').value    = task.title;
        document.getElementById('edit-task-priority').value = task.priority;
        document.getElementById('edit-task-category').value = task.category;
        if (task.dueDate) {
            const d = new Date(task.dueDate);
            const anio = d.getFullYear(), mes = d.getMonth() + 1, dia = d.getDate();
            this.fillDayOptions('edit-task-due-day', mes, anio);
            const yearEl = document.getElementById('edit-task-due-year'), monthEl = document.getElementById('edit-task-due-month'), dayEl = document.getElementById('edit-task-due-day');
            if (yearEl)  yearEl.value  = anio;
            if (monthEl) monthEl.value = mes;
            if (dayEl)   dayEl.value   = Math.min(dia, getDaysInMonth(mes, anio));
        }
        this.syncDateFromSelects('edit-task-due');
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

    initializeDateSelectors() {
        const anioActual = new Date().getFullYear();
        const hoy        = new Date();
        this.initDatePicker('task-due',      hoy.getMonth() + 1, hoy.getDate(), anioActual,     anioActual + 3);
        this.initDatePicker('edit-task-due', hoy.getMonth() + 1, hoy.getDate(), anioActual - 1, anioActual + 3);
    }

    initDatePicker(prefix, mesInicial, diaInicial, anioMin, anioMax) {
        const yearSel  = document.getElementById(`${prefix}-year`);
        const monthSel = document.getElementById(`${prefix}-month`);
        const daySel   = document.getElementById(`${prefix}-day`);
        const anioHoy  = new Date().getFullYear();
        if (yearSel) {
            yearSel.innerHTML = '';
            for (let y = anioMin; y <= anioMax; y++) {
                const opt = document.createElement('option');
                opt.value = y; opt.textContent = y;
                yearSel.appendChild(opt);
            }
            yearSel.value = anioHoy;
        }
        this.fillDayOptions(`${prefix}-day`, mesInicial, anioHoy);
        if (monthSel) monthSel.value = mesInicial;
        if (daySel)   daySel.value   = Math.min(diaInicial, getDaysInMonth(mesInicial, anioHoy));
        this.syncDateFromSelects(prefix);
        const updateDays = () => {
            const mes  = parseInt(document.getElementById(`${prefix}-month`)?.value, 10);
            const anio = parseInt(document.getElementById(`${prefix}-year`)?.value, 10);
            this.fillDayOptions(`${prefix}-day`, mes, anio);
            this.syncDateFromSelects(prefix);
        };
        monthSel?.addEventListener('change', updateDays);
        yearSel?.addEventListener('change',  updateDays);
        daySel?.addEventListener('change',   () => this.syncDateFromSelects(prefix));
    }

    fillDayOptions(selectId, mes, anio) {
        const select = document.getElementById(selectId);
        if (!select) return;
        const maxDias = getDaysInMonth(mes, anio), currentVal = select.value;
        select.innerHTML = '';
        for (let d = 1; d <= maxDias; d++) {
            const opt = document.createElement('option');
            opt.value = d; opt.textContent = d;
            select.appendChild(opt);
        }
        select.value = Math.min(parseInt(currentVal || '1', 10), maxDias) || 1;
    }

    syncDateFromSelects(prefix) {
        const day = document.getElementById(`${prefix}-day`)?.value;
        const month = document.getElementById(`${prefix}-month`)?.value;
        const year  = document.getElementById(`${prefix}-year`)?.value;
        const hidden = document.getElementById(`${prefix}-date`);
        if (hidden && day && month && year) hidden.value = `${year}-${padTwo(month)}-${padTwo(day)}`;
    }

    validateDueDate(dateValue) {
        if (!dateValue) return 'La fecha de vencimiento es obligatoria';
        const days = daysUntilTaskExpiration(dateValue);
        if (days === null) return 'La fecha de vencimiento no es válida';
        if (days < 0)      return 'La fecha de vencimiento no puede ser anterior a hoy';
        return null;
    }

    updateStats() {
        const total = this.tareas.length, completed = this.tareas.filter(t => t.completed).length;
        document.getElementById('total-tasks').textContent     = `${total} Tarea${total !== 1 ? 's' : ''}`;
        document.getElementById('completed-tasks').textContent = `${completed} Completada${completed !== 1 ? 's' : ''}`;
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const icon         = document.getElementById('notification-icon');
        const messageEl    = document.getElementById('notification-message');
        const config = {
            success: { icon: 'fas fa-check-circle',        bg: 'bg-green-500'  },
            warning: { icon: 'fas fa-exclamation-triangle', bg: 'bg-yellow-500' },
            error:   { icon: 'fas fa-times-circle',         bg: 'bg-red-500'    },
            info:    { icon: 'fas fa-info-circle',           bg: 'bg-blue-500'   },
        };
        const { icon: iconClass, bg } = config[type] || config.info;
        icon.className = iconClass;
        messageEl.textContent = message;
        notification.className = `fixed top-6 right-6 z-50 px-6 py-4 rounded-lg text-white font-semibold transform transition-all duration-500 flex items-center gap-3 ${bg}`;
        notification.classList.remove('translate-x-full', 'opacity-0');
        setTimeout(() => notification.classList.add('translate-x-full', 'opacity-0'), 3000);
    }

    loadPreferences() {
        try {
            const prefs = JSON.parse(localStorage.getItem('quicktask-preferences') || 'null');
            if (prefs?.sort)      this.ordenActual       = prefs.sort;
            if (prefs?.dueFilter) this.filtroVencimiento = prefs.dueFilter;
        } catch { /* Ignorar preferencias corruptas */ }
    }

    savePreferences() {
        localStorage.setItem('quicktask-preferences', JSON.stringify({ sort: this.ordenActual, dueFilter: this.filtroVencimiento }));
    }

    updateSelectUI(selectId, value) {
        const select = document.getElementById(selectId);
        if (select) select.value = value || 'all';
    }

    updateViewButtons() {
        document.querySelectorAll('.view-btn').forEach(btn => {
            const activo = btn.dataset.view === this.vistaActual;
            btn.classList.remove('bg-gray-100', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300', 'bg-purple-500', 'text-white', 'bg-purple-600');
            if (activo) btn.classList.add('bg-purple-500', 'text-white');
            else        btn.classList.add('bg-gray-100', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
        });
    }
}

document.addEventListener('DOMContentLoaded', () => { new GestorTareasRapidas(); });
