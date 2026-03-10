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

### Notas de compatibilidad

- `dueDate` se guarda como **ISO string** para evitar ambigüedad de formato.
- Si una tarea antigua no tiene `dueDate`, la UI simplemente **no muestra** el indicador de vencimiento.
