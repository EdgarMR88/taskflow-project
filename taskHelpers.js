// Función que calcula cuántos días faltan para que venza una tarea.
// taskDate es la fecha de vencimiento de la tarea (string o Date).
function daysUntilTaskExpiration(taskDate) {
    const today = new Date();
    const dueDate = new Date(taskDate);

    if (Number.isNaN(dueDate.getTime())) {
        return null; // Fecha inválida
    }

    const timeDifference = dueDate.getTime() - today.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    return daysDifference;
}