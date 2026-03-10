// Gestión de tema (claro/oscuro)
const botonTema = document.getElementById('theme-toggle');
const elementoHtml = document.documentElement;

const temaGuardado = localStorage.getItem('theme') || 'light';
elementoHtml.classList.toggle('dark', temaGuardado === 'dark');

if (botonTema) {
  botonTema.addEventListener('click', () => {
    const esOscuro = elementoHtml.classList.toggle('dark');
    localStorage.setItem('theme', esOscuro ? 'dark' : 'light');
  });
}

// Estilos base para botones de filtro, categoría y vista
document.addEventListener('DOMContentLoaded', () => {
  const estilo = document.createElement('style');
  estilo.textContent = `
    .filter-btn, .category-btn, .view-btn {
      @apply bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-700 dark:hover:text-primary-300;
    }
    .filter-btn.active, .category-btn.active, .view-btn.active {
      @apply bg-primary-500 text-white hover:bg-primary-600;
    }
  `;
  document.head.appendChild(estilo);
});

