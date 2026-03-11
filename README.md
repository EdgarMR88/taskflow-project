# ⚡ QuickTask (TaskFlow) – Gestión rápida de tareas

**Aplicación web para gestionar tareas con fecha de vencimiento, filtros, ordenación e importación/exportación.**

Interfaz responsive con Tailwind CSS, modo oscuro persistente, búsqueda en tiempo real, filtros por estado/categoría/vencimiento, selector de fecha día-mes-año y atajos de teclado.

---

## 🚀 Demo

🔗 **[Ver QuickTask en vivo](https://taskflow-project-git-tailwind-css-version-edgarmr88s-projects.vercel.app/)**

---

## ✨ Características

| Área | Funcionalidad |
|------|----------------|
| **Tareas** | Crear, editar, completar y eliminar. Título, prioridad (alta/media/baja), categoría y **fecha de vencimiento obligatoria**. |
| **Filtros** | Menús desplegables: **por estado** (todas, pendientes, completadas), **por categoría** (personal, trabajo, hogar, salud, estudios), **por vencimiento** (todas, vencidas, vence hoy, próximos 7 días). |
| **Búsqueda** | En tiempo real por título, categoría y prioridad. |
| **Ordenación** | Por fecha de creación (asc/desc), vencimiento (asc/desc), prioridad o título. |
| **Vistas** | Grid o lista. |
| **Datos** | Persistencia en `localStorage`, **exportar a JSON**, **importar desde JSON** (reemplazar o fusionar). |
| **UX** | Modo oscuro con persistencia, selector de fecha día/mes/año (sin calendario nativo), **atajos de teclado**, notificaciones. |

---

## 🛠️ Tecnologías

- **HTML5**, **Tailwind CSS**, **JavaScript ES6+**
- **LocalStorage** para persistencia
- **Font Awesome** para iconos  
Sin dependencias de build: solo abrir `index.html` o usar un servidor local.

---

## 📁 Estructura del proyecto

```
taskflow-project/
├── index.html          # Interfaz principal (formulario, filtros, lista, modal edición)
├── app.js              # Lógica: clase GestorTareasRapidas, eventos, renderizado
├── taskHelpers.js      # Utilidades: días hasta vencimiento, días del mes, formateo
├── tema-y-estilos.js   # Toggle tema claro/oscuro y estilos base de botones
├── README.md
├── docs/
│   └── ai/             # Documentación generada con IA (workflow, prompts, experimentos)
└── .cursor/            # Configuración MCP del proyecto
```

---

## 🚀 Uso rápido

### Opción 1: Abrir directamente

```bash
git clone https://github.com/EdgarMR88/taskflow-project
cd taskflow-project
# Abrir index.html en el navegador (doble clic o desde el IDE)
```

### Opción 2: Servidor local (recomendado)

```bash
cd taskflow-project
python -m http.server 8000
# Abrir http://localhost:8000
```

Con Node.js:

```bash
npx serve .
# Abrir la URL que indique (ej. http://localhost:3000)
```

---

## 📖 Ejemplos de uso

### Crear una tarea

1. Escribe el título en **«¿Qué necesitas hacer rápidamente?»**.
2. Elige **prioridad** (alta, media, baja) y **categoría** (personal, trabajo, hogar, etc.).
3. Selecciona **día, mes y año** de vencimiento en los desplegables (la fecha no puede ser anterior a hoy).
4. Pulsa **«Añadir Rápido»** o usa el atajo **`N`**.

La tarea aparece en la lista y se guarda automáticamente.

### Filtrar y ordenar

- **Por estado:** desplegable «Por estado» → Todas / Pendientes / Completadas.
- **Por categoría:** desplegable «Por categoría» → una categoría o Todas.
- **Por vencimiento:** desplegable «Por vencimiento» → Todas / Vencidas / Vence hoy / Próximos 7 días.
- **Ordenar:** en la barra superior, selector «Ordenar por» → fecha de creación, vencimiento, prioridad o título.

La búsqueda de texto filtra en tiempo real; se combina con los filtros anteriores.

### Atajos de teclado

| Atajo | Acción |
|-------|--------|
| `/` | Enfocar el buscador |
| `N` | Enfocar el campo de nueva tarea |
| `G` | Cambiar vista (grid ↔ lista) |
| `T` | Cambiar tema (claro ↔ oscuro) |
| `Esc` | Cerrar el modal de edición |

*(No se activan cuando el foco está en un input o textarea.)*

### Exportar e importar

- **Exportar:** botón «Exportar Tareas» → descarga un JSON con todas las tareas actuales.
- **Importar:** botón «Importar JSON» → eliges un archivo JSON; la app te pregunta si **reemplazar** las tareas actuales o **fusionar** con las existentes. Las fechas y campos se normalizan al importar.

### Editar una tarea

Clic en el lápiz (editar) en la tarjeta → se abre el modal. Cambia título, prioridad, categoría o fecha de vencimiento y pulsa **«Guardar»**. La fecha se elige con los mismos desplegables día/mes/año.

---

## 📚 Documentación de funciones principales

La lógica está en **`app.js`** (clase `GestorTareasRapidas`) y **`taskHelpers.js`**.

### taskHelpers.js

| Función | Descripción |
|---------|-------------|
| `getDaysInMonth(mes, anio)` | Devuelve el número de días del mes (1–12) en el año dado. |
| `padTwo(n)` | Formatea un número a dos dígitos (ej. `5` → `"05"`) para fechas ISO. |
| `daysUntilTaskExpiration(fechaTarea)` | Calcula días hasta el vencimiento (negativo si ya pasó, `0` si es hoy, `null` si la fecha es inválida). |

### app.js – GestorTareasRapidas

| Método / concepto | Descripción |
|-------------------|-------------|
| `init()` | Carga tareas y preferencias, enlaza eventos, inicializa selectores de fecha, filtros y vista. |
| `agregarTareaRapida()` | Crea una tarea desde el formulario; valida título y fecha obligatoria (no vacía, válida, no pasada). |
| `buscarTareasRapido(query)` | Actualiza el término de búsqueda y re-renderiza. |
| `setFilter` / `setCategoryFilter` / `setDueFilter` | Aplican filtro por estado, categoría o vencimiento y vuelven a renderizar. |
| `renderTasks()` | Aplica búsqueda, filtros de estado/categoría/vencimiento y ordenación; llama a `renderFilteredTasks`. |
| `sortTasks(tasks)` | Ordena el array por el criterio actual (creación, vencimiento, prioridad, título). |
| `applyDueDateFilter(tasks)` | Filtra por vencidas / vence hoy / próximos 7 días. |
| `initializeDateSelectors()` | Rellena y enlaza los desplegables día/mes/año del formulario y del modal de edición; mantiene el input oculto en formato ISO. |
| `exportTasks()` | Descarga un JSON con todas las tareas. |
| `importTasksFromFile(file)` | Lee el archivo, parsea JSON, normaliza tareas y permite reemplazar o fusionar. |

Para más detalle, ver los comentarios JSDoc en el código.

---

## 👨‍💻 Autor

**Edgar Montoya Rodriguez**

- GitHub: [@EdgarMR88](https://github.com/EdgarMR88)
- LinkedIn: [Edgar Montoya Rodríguez](https://www.linkedin.com/in/edgarmr88)

---

## 📄 Licencia

MIT License. Ver [LICENSE](LICENSE) para más detalles.
