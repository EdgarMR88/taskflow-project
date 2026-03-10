## Cursor workflow (TaskFlow / QuickTask)

Este documento registra **cambios y decisiones** realizados durante el trabajo asistido con IA en este repo.

### Registro de cambios

#### 2026-03-10 — Fix inicial en `taskHelpers.js`

- **Problema**:
  - `daysUntilTaskExpiration` estaba **duplicada** (una segunda definición incompleta).
  - Se redeclaraba `taskDate` dentro de la función (`const taskDate = new Date(taskDate)`), sombreando el parámetro.
- **Cambio**:
  - Se dejó **una sola** función `daysUntilTaskExpiration`.
  - Se renombró la fecha interna a `dueDate` y se añadió validación de fecha inválida (devuelve `null`).
- **Archivo**: `taskHelpers.js`

#### 2026-03-10 — Integración de fecha de vencimiento (UI + lógica)

- **Objetivo**: permitir que cada tarea tenga una **fecha de vencimiento opcional** y mostrar en la tarjeta si “vence hoy”, “vence en X días” o “venció hace X días”.
- **Cambios en UI (`index.html`)**:
  - Se añadió un `input type="date"` con id `task-due-date` en el formulario de creación.
  - Se añadió un `input type="date"` con id `edit-task-due-date` en el modal de edición.
  - Se incluyó `taskHelpers.js` antes de `app.js` para que `daysUntilTaskExpiration` esté disponible.
- **Cambios en lógica (`app.js`)**:
  - Al crear tarea (`addTaskQuickly`), se guarda `dueDate` (ISO string) o `null`.
  - Al editar (`openEditModal` / `saveEditedTask`), se carga/guarda `dueDate`.
  - En `createTaskHTML`, se renderiza un “pill/badge” de vencimiento usando `getDueDateInfo(task)` y `daysUntilTaskExpiration`.
- **Archivos**: `index.html`, `app.js`

#### 2026-03-10 — Refactor y mejoras con IA (nombres, eventos, tema, validaciones)

- **Nombres y legibilidad**
  - Clase principal renombrada de `QuickTaskManager` a `GestorTareasRapidas`.
  - Métodos públicos renombrados a español donde aporta claridad:
    - `addTaskQuickly` → `agregarTareaRapida`
    - `searchTasksQuickly` → `buscarTareasRapido`
  - Se añadió JSDoc a:
    - Clase `GestorTareasRapidas`
    - Métodos clave: `init`, `showWelcomeMessage`, `bindEvents`, `agregarTareaRapida`, `buscarTareasRapido`, `renderTasks`, `renderFilteredTasks`, `getDueDateInfo`, `saveEditedTask`, `exportTasks`, `clearCompletedTasks`, `updateStats`, `showNotification`, `saveTasks`, `loadTasks`.

- **Refactor de eventos y renderizado**
  - `bindEvents` se dividió en métodos más pequeños y específicos:
    - `bindFormEvents`, `bindSearchEvents`, `bindFilterEvents`, `bindCategoryEvents`, `bindViewEvents`, `bindBulkActionEvents`, `bindModalEvents`.
  - `renderFilteredTasks` ahora delega la construcción del estado vacío en `buildEmptyStateHTML`, reduciendo lógica duplicada y mejorando legibilidad.

- **Tema y estructura de archivos**
  - La lógica de tema (modo claro/oscuro) y estilos de botones se extrajo de `index.html` a un nuevo archivo `tema-y-estilos.js`.
  - `index.html` ahora solo referencia:
    - `taskHelpers.js`
    - `app.js`
    - `tema-y-estilos.js`

- **Validaciones y helpers**
  - `saveEditedTask` ahora valida que el título de la tarea editada no quede vacío; si lo está, muestra una notificación de error y cancela el guardado.
  - `daysUntilTaskExpiration` se mejoró:
    - Renombrando variables y parámetros a español.
    - Añadiendo JSDoc completo.
    - Normalizando ambas fechas a medianoche para evitar desfases por hora.

- **Archivos**: `app.js`, `index.html`, `taskHelpers.js`, `tema-y-estilos.js`

### Notas de compatibilidad

- `dueDate` se guarda como **ISO string** para evitar ambigüedad de formato.
- Si una tarea antigua no tiene `dueDate`, la UI simplemente **no muestra** el indicador de vencimiento.

### Atajos de teclado más utilizados

- `Ctrl+L` - Chat contextual ✅
- `Ctrl+K` - Edición inline ✅
- `Tab` - Aceptar autocompletado ✅
- `Ctrl+Shift+I` - Composer (multi-archivo) ✅

### Ejemplos concretos de mejoras

#### Ejemplo 1: Detección automática de bugs
**Antes:**
```javascript
function daysUntilTaskExpiration(taskDate) {
    const today = new Date();
    const taskDate = new Date(taskDate); // ❌ Shadowing!
    // ...
}
function daysUntilTaskExpiration(taskDate) { // ❌ Duplicada!
}
```

**Después:**
```javascript
function daysUntilTaskExpiration(taskDate) {
    const today = new Date();
    const dueDate = new Date(taskDate); // ✅ Nombre claro
    
    if (Number.isNaN(dueDate.getTime())) {
        return null; // ✅ Validación añadida
    }
    
    const timeDifference = dueDate.getTime() - today.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    return daysDifference;
}
```
