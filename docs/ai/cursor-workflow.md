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

### MCP (Model Context Protocol) en este proyecto

#### ¿Qué es MCP?

- **MCP (Model Context Protocol)** es un protocolo para conectar modelos de IA con “servidores” externos (filesystem, GitHub, HTTP, etc.).
- Cada servidor MCP expone herramientas (tools) que la IA puede usar como si fueran funciones remotas.

#### Servidores configurados

- **Global (para todo Cursor)**
  - Servidor: `github`
  - Implementación: `@modelcontextprotocol/server-github` (instalado con `npm install -g @modelcontextprotocol/server-github`).
  - Configuración en `C:\Users\Edgar\.cursor\mcp.json`:
    - Comando: `npx -y @modelcontextprotocol/server-github`
    - Usa la variable de entorno `GITHUB_TOKEN` para autenticar contra la API de GitHub.
- **Por proyecto (`taskflow-project/.cursor/mcp.json`)**
  - Servidor: `filesystem-taskflow`
  - Implementación: `@modelcontextprotocol/server-filesystem` (instalado con `npm install -g @modelcontextprotocol/server-filesystem`).
  - Permite a la IA leer/escribir archivos dentro del directorio del proyecto usando MCP.

#### Resumen de instalación paso a paso

1. **Instalar servidores MCP necesarios**
   - Filesystem:
     - `npm install -g @modelcontextprotocol/server-filesystem`
   - GitHub:
     - `npm install -g @modelcontextprotocol/server-github`
2. **Configurar MCP global (`C:\Users\Edgar\.cursor\mcp.json`)**
   - Añadir:
     - Servidor `github` con:
       - `"command": "npx"`
       - `"args": ["-y", "@modelcontextprotocol/server-github"]`
       - `"env": { "GITHUB_TOKEN": "<PAT de GitHub>" }`
3. **Configurar MCP del proyecto (`taskflow-project/.cursor/mcp.json`)**
   - Añadir:
     - Servidor `filesystem-taskflow` con:
       - `"command": "npx"`
       - `"args": ["-y", "@modelcontextprotocol/server-filesystem", "."]`
4. **Reiniciar Cursor**
   - Cerrar y volver a abrir Cursor para que lea las nuevas configuraciones.
5. **Verificar desde la IA**
   - Comprobar que aparecen:
     - `filesystem-taskflow` como servidor MCP del proyecto.
     - `github` como servidor MCP global.

#### Ejemplos de consultas útiles con MCP

- **Con `filesystem-taskflow`**
  - Pedir a la IA:
    - “Lee el contenido de `app.js` y resume las funciones principales.”
    - “Busca en el proyecto cualquier archivo donde se use `GestorTareasRapidas`.”
    - “Abre y analiza `index.html` para revisar la estructura del formulario de tareas.”
- **Con `github`**
  - Pedir a la IA:
    - “Lista los últimos pull requests abiertos en el repo `EdgarMR88/taskflow-project`.”
    - “Resume los issues abiertos con etiqueta `bug`.”

#### ¿Cuándo es útil MCP en proyectos reales?

- Cuando la IA necesita **acceso seguro y estructurado** a recursos externos:
  - Repositorios GitHub (issues, PRs, código remoto).
  - Sistemas de archivos (monolitos grandes, carpetas fuera del workspace).
  - APIs internas (vía servidores HTTP MCP).
- Permite:
  - Automatizar flujos de trabajo (revisar PRs, generar reportes).
  - Mantener separación clara entre código del proyecto y servicios externos.
  - Reutilizar la misma configuración MCP en varios proyectos/equipos.

---

#### 2026-03-10 — Documentación asistida por IA (ejercicio)

- **Objetivo**: Mejorar README y documentación de funciones; añadir ejemplos de uso.
- **README** (`README.md`):
  - Primera versión mejorada: título, descripción, demo, tabla de características actualizada (filtros desplegables, selector día/mes/año, ordenación, import/export, atajos).
  - Estructura del proyecto actual (index.html, app.js, taskHelpers.js, tema-y-estilos.js, docs/ai).
  - Instrucciones de uso rápido (clonar, servidor local con Python o `npx serve`).
  - **Ejemplos de uso**: crear tarea, filtrar y ordenar, atajos de teclado, exportar/importar, editar tarea.
  - Sección **Documentación de funciones principales**: tabla resumen de `taskHelpers.js` (getDaysInMonth, padTwo, daysUntilTaskExpiration) y de `GestorTareasRapidas` (init, agregarTareaRapida, filtros, renderTasks, sortTasks, applyDueDateFilter, initializeDateSelectors, export/import), con referencia a JSDoc en código.
- **JSDoc en `app.js`**:
  - Añadidos comentarios a: `fillDayOptions`, `syncTaskDueDateFromSelects`, `syncEditDueDateFromSelects`, `setFilter`, `setCategoryFilter`, `setDueFilter`, `setView`, `updateFilterButtons`, `updateCategoryButtons`, `updateViewButtons`, `updateDueFilterButtons`, `applyDueDateFilter`, `sortTasks`.
- **Revisión**: La documentación generada se ha revisado para que coincida con el comportamiento actual (menús desplegables, selector de fecha, atajos, estructura de archivos).
- **Archivos**: `README.md`, `app.js`, `docs/ai/cursor-workflow.md`
