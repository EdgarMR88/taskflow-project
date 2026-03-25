require('dotenv').config();

// Validación estricta de configuración
const variablesRequeridas = ['PORT'];

variablesRequeridas.forEach(nombreVariable => {
  if (!process.env[nombreVariable]) {
    throw new Error(`❌ La variable de entorno ${nombreVariable} no está definida en .env`);
  }
});

const entornoNodo = process.env.NODE_ENV || 'development';

module.exports = {
  PORT: parseInt(process.env.PORT, 10),
  NODE_ENV: entornoNodo,
  esDesarrollo: entornoNodo === 'development',
};