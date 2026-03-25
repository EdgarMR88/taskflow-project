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



