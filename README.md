# ⚡ QuickTask Project

**Tu gestor de tareas rápido, eficiente y moderno**

Una aplicación web completa para la gestión ágil de tareas personales, diseñada para personas que valoran la velocidad y la eficiencia en su productividad diaria.

![QuickTask Preview](https://via.placeholder.com/800x400/f39c12/ffffff?text=⚡+QuickTask+Preview)

## 🚀 Demo en Vivo
🔗 **[Ver QuickTask en Acción](tu-enlace-de-vercel-aqui)**

---

## ⚡ ¿Por qué QuickTask?

QuickTask nace de la necesidad de tener un gestor de tareas que sea **rápido**, **intuitivo** y **sin complicaciones**. Perfecto para profesionales, estudiantes y cualquier persona que quiera organizar su día de forma eficiente.

---

## ✨ Características Principales

### 🏃‍♂️ **Gestión Rápida de Tareas**
- ⚡ **Creación instantánea** con `Ctrl + Enter`
- ✏️ **Edición rápida** con modal dedicado
- 🗑️ **Eliminación con animación** para mejor UX
- ☑️ **Completar/Reabrir** tareas con un clic
- 🔄 **Notificaciones instantáneas** de cada acción

### 🎨 **Diseño Moderno QuickTask**
- 🌟 **Tema naranja eléctrico** inspirado en la velocidad
- 📱 **Diseño responsive** para todos los dispositivos
- 💫 **Animaciones fluidas** y transiciones elegantes
- 🎭 **Efectos visuales** sutiles y profesionales
- ⚡ **Iconos animados** que dan vida a la interfaz

### 🔍 **Búsqueda y Filtrado Inteligente**
- 🔎 **Búsqueda en tiempo real** por título, categoría y prioridad
- 📂 **Filtros por estado**: Todas, Pendientes, Completadas
- 🏷️ **Filtros por categoría**: Personal, Trabajo, Hogar, Salud, Estudios
- 🎚️ **Combinación múltiple** de filtros
- 📈 **Contador de resultados** en tiempo real

### 🏆 **Sistema de Prioridades Visuales**
- 🔴 **Alta prioridad** - Borde rojo, para tareas urgentes
- 🟡 **Media prioridad** - Borde amarillo, para tareas importantes
- 🟢 **Baja prioridad** - Borde verde, para tareas rutinarias

### 📊 **Dashboard y Estadísticas**
- 📈 **Contador en tiempo real** de tareas totales
- ✅ **Progreso de completadas** siempre visible
- 📋 **Estado vacío amigable** cuando empiezas
- 🎯 **Estadísticas detalladas** disponibles en consola

### 💾 **Persistencia Inteligente**
- 🏪 **AutoGuardado** en LocalStorage tras cada acción
- 🔄 **Carga automática** al abrir la aplicación
- 📤 **Exportación completa** con metadatos en JSON
- 🧹 **Limpieza rápida** de tareas completadas

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **HTML5** | Latest | Estructura semántica optimizada |
| **CSS3** | Latest | Estilos modernos con tema QuickTask |
| **JavaScript** | ES6+ | Lógica OOP con clase QuickTaskManager |
| **Font Awesome** | 6.0.0 | Iconografía profesional |
| **LocalStorage** | Native | Persistencia de datos local |

---

## 🏗️ Arquitectura del Proyecto

```
quicktask-project/
├── 📄 index.html          # Estructura HTML principal
├── 🎨 style.css           # Estilos CSS con tema QuickTask
├── ⚡ app.js              # Lógica JavaScript (Clase QuickTaskManager)
├── 📚 README.md           # Documentación del proyecto
└── 📁 assets/             # Recursos adicionales (opcional)
  └── 🖼️ images/         # Imágenes del proyecto
```

---

## 🚀 Instalación y Uso

### **Opción 1: Clonar el Repositorio**
```bash
# Clonar el repositorio
git clone https://github.com/EdgarMR88/quicktask-project

# Navegar al directorio
cd quicktask-project

# Abrir en el navegador
# Simplemente abre index.html en tu navegador favorito
```

### **Opción 2: Descargar ZIP**
1. Descarga el archivo ZIP del repositorio
2. Extrae los archivos
3. Abre `index.html` en tu navegador

### **Opción 3: Servidor Local (Recomendado)**
```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (si tienes live-server instalado)
npx live-server

# Luego visita: http://localhost:8000
```

---

## 📖 Guía de Uso

### 1. 🆕 **Crear una Nueva Tarea Rápida**
1. Escribe el título de la tarea en el campo "¿Qué necesitas hacer rápidamente?"
2. Selecciona la prioridad (Alta, Media, Baja)
3. Elige una categoría (Personal, Trabajo, Hogar, etc.)
4. Haz clic en "⚡ Añadir Rápido" o presiona `Ctrl + Enter`

### 2. 🔍 **Buscar Tareas Rápidamente**
- Escribe en el campo "Buscar tareas rápidamente..."
- Los resultados se filtran automáticamente mientras escribes
- La búsqueda incluye título, categoría y prioridad
- Búsqueda insensible a mayúsculas/minúsculas

### 3. 🎛️ **Filtrar Tareas**
- **Por Estado**: Usa los botones "Todas", "Pendientes", "Completadas"
- **Por Categoría**: Selecciona una categoría específica en la barra lateral
- **Combinar**: Puedes usar búsqueda + filtros simultáneamente

### 4. ✏️ **Editar una Tarea**
1. Haz clic en el botón "⚡ Editar" de cualquier tarea
2. Modifica los campos en el modal que aparece
3. Guarda con "⚡ Guardar Rápido" o cancela la edición

### 5. ✅ **Completar Tareas**
- Haz clic en "Completar" para marcar una tarea como terminada
- Las tareas completadas se muestran con estilo diferente
- Puedes "Reabrir" tareas completadas si es necesario

### 6. 📤 **Exportar Datos**
- Haz clic en "📤 Exportar Tareas" para descargar un archivo JSON
- El archivo contiene todas tus tareas con metadatos completos y estadísticas

---

## ⌨️ Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl + Enter` | Añadir tarea rápidamente |
| `Ctrl + F` | Enfocar búsqueda rápida |
| `Escape` | Cerrar modal de edición |

---

## 🎨 Personalización

### **Cambiar Colores del Tema QuickTask**
Modifica las variables CSS en `style.css`:

```css
:root {
  /* Tema QuickTask Original */
  --color-principal: #f39c12;    /* Naranja eléctrico */
  --color-secundario: #e67e22;   /* Naranja oscuro */
  --color-acento: #f1c40f;       /* Amarillo rayo */
  
  /* Tema Azul Rápido (alternativo) */
  /* --color-principal: #3498db; */
  /* --color-secundario: #2980b9; */
  /* --color-acento: #74b9ff; */
}
```

### **Añadir Nuevas Categorías**
En el archivo `app.js`, modifica el objeto `categoryIcons`:

```javascript
const categoryIcons = {
  personal: '👤',
  trabajo: '💼',
  hogar: '🏠',
  salud: '🏥',
  estudios: '📚',
  // Añade nuevas categorías aquí
  deporte: '🏃‍♂️',
  viajes: '✈️',
  finanzas: '💰'
};
```

---

## 🧪 Características Técnicas

### 📱 **Responsive Design**
- **Mobile First**: Diseñado primero para móviles
- **Breakpoints**: 480px, 768px, 1024px
- **Flexbox & Grid**: Layouts modernos y flexibles

### 🔒 **Seguridad**
- **Escape de HTML**: Prevención de ataques XSS
- **Validación**: Validación de entrada de datos
- **Sanitización**: Limpieza de datos del usuario

### ⚡ **Performance**
- **Vanilla JavaScript**: Sin dependencias pesadas
- **LocalStorage**: Almacenamiento local eficiente
- **Animaciones optimizadas**: Transiciones suaves sin lag

### 🎯 **Programación Orientada a Objetos**
- **Clase QuickTaskManager**: Encapsulación de toda la lógica
- **Métodos organizados**: Separación clara de responsabilidades
- **Estado centralizado**: Gestión consistente del estado
- **Notificaciones inteligentes**: Sistema de feedback inmediato

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si quieres mejorar QuickTask:

1. **Fork** el repositorio
2. Crea una **rama** para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. **Commit** tus cambios (`git commit -m 'Añadir nueva característica'`)
4. **Push** a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un **Pull Request**

### 🐛 **Reportar Bugs**
Si encuentras un error, por favor:
- Abre un **Issue** en GitHub
- Describe el problema detalladamente
- Incluye pasos para reproducir el error
- Añade capturas de pantalla si es posible

---

## 📋 Roadmap Futuro

- [ ] 🌙 **Modo oscuro** toggle
- [ ] 📅 **Fechas de vencimiento** para tareas
- [ ] 🔔 **Notificaciones** del navegador
- [ ] 📊 **Gráficos** de productividad
- [ ] 🔄 **Sincronización** en la nube
- [ ] 👥 **Colaboración** entre usuarios
- [ ] 📱 **PWA** (Progressive Web App)
- [ ] 🎯 **Subtareas** anidadas
- [ ] 🏷️ **Tags personalizados** para tareas
- [ ] 📈 **Analytics** de productividad

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

**Edgar Montoya Rodriguez**
- GitHub: [@EdgarMR88](https://github.com/EdgarMR88)
- LinkedIn: [linkedin.com/in/edgarmr88](https://linkedin.com/in/edgarmr88)
- Email: edgamr88@gmail.com

---

## 🙏 Agradecimientos

- **Font Awesome** por los iconos profesionales
- **Vercel** por el hosting gratuito
- **MDN Web Docs** por la documentación excelente
- **CSS-Tricks** por las guías de CSS moderno

---

⚡ **¡Si QuickTask te ayuda a ser más productivo, dale una estrella en GitHub!** ⭐

---

### 🚀 **¿Listo para ser más rápido con tus tareas?**

**[🔗 Prueba QuickTask ahora](tu-enlace-de-vercel-aqui)** y experimenta la diferencia de un gestor de tareas verdaderamente rápido.