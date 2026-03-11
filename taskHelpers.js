/**
 * Devuelve el número de días del mes (1-12) en el año dado.
 * @param {number} mes - Mes (1-12).
 * @param {number} anio - Año (ej. 2025).
 * @returns {number} Días del mes (28-31).
 */
function getDaysInMonth(mes, anio) {
    return new Date(anio, mes, 0).getDate();
}

/**
 * Formatea un número a 2 dígitos (para día/mes en ISO).
 * @param {number} n - Número a formatear.
 * @returns {string} Cadena de 2 dígitos (ej. "05").
 */
function padTwo(n) {
    return String(n).padStart(2, '0');
}

/**
 * Calcula cuántos días faltan (o han pasado) para que venza una tarea.
 * @param {string|Date} fechaTarea - Fecha de vencimiento (cadena ISO o instancia Date).
 * @returns {number|null} Días hasta el vencimiento (negativo si ya pasó, 0 si es hoy) o null si la fecha es inválida.
 */
function daysUntilTaskExpiration(fechaTarea) {
    const hoy = new Date();
    const fechaVencimiento = new Date(fechaTarea);

    if (Number.isNaN(fechaVencimiento.getTime())) {
        return null; // Fecha inválida
    }

    // Normalizar a medianoche para evitar desfases por hora
    hoy.setHours(0, 0, 0, 0);
    fechaVencimiento.setHours(0, 0, 0, 0);

    const diferenciaTiempo = fechaVencimiento.getTime() - hoy.getTime();
    const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

    return diferenciaDias;
}