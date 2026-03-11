## Experimentos con IA en programación

Este documento recoge una serie de experimentos para comparar **resolver problemas sin IA** vs **con ayuda de IA**, midiendo:

- **Tiempo invertido**
- **Calidad del código**
- **Comprensión del problema**

---

### Metodología 

- **Herramienta**: cronómetro temporizador.
- **Reglas**:
  - “Sin IA”: no usar chat, copilots, ni autocompletado inteligente.
  - “Con IA”: usar prompts claros; permitir 1–3 iteraciones.
  - Parar el tiempo cuando:
    - el código compila/funciona
    - y tienes una breve explicación/documentación
- **Criterios de calidad**:
  - Correctitud (casos borde)
  - Legibilidad
  - Facilidad de mantenimiento
  - Complejidad / simplicidad

---

## Parte A — 3 problemas pequeños (genéricos)

### A1) Validar contraseña (fuerza mínima)

**Problema**  
Dada una contraseña, validar:
- Mínimo 8 caracteres
- Al menos 1 mayúscula, 1 minúscula, 1 número
- Sin espacios

#### Solución “sin IA” 

- Enfoque: escribir una función `validarPassword(pwd)` con regex simples y pruebas rápidas.
- Tiempo estimado: **10–20 min**

Código:

```js
function validarPassword(pwd) {
  if (typeof pwd !== 'string') return false;
  if (pwd.length < 8) return false;
  if (/\s/.test(pwd)) return false;
  if (!/[a-z]/.test(pwd)) return false;
  if (!/[A-Z]/.test(pwd)) return false;
  if (!/[0-9]/.test(pwd)) return false;
  return true;
}
```

#### Solución “con IA”

- Prompt recomendado:
  - “Escribe `validarPassword` con JSDoc y tests de ejemplo; cubre casos borde.”
- Tiempo estimado: **3–8 min** (incluye revisión)
- Diferencias típicas:
  - Mejor documentación (JSDoc)
  - Más casos borde propuestos

#### Comparación

- **Tiempo**: IA gana (menos tiempo).
- **Calidad**: empate o IA ligera ventaja (más cobertura), si revisas el resultado.
- **Comprensión**: similar; IA ayuda a recordar reglas/casos borde.

---

### A2) Agrupar por clave (groupBy)

**Problema**  
Dado un array de objetos y una clave, devolver un objeto agrupado por dicha clave.

#### Sin IA 

Tiempo estimado: **8–15 min**

```js
function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item?.[key];
    const bucket = k ?? '__undefined__';
    (acc[bucket] ??= []).push(item);
    return acc;
  }, {});
}
```

#### Con IA

- Prompt: “Implementa `groupBy` sin mutar el array; añade ejemplos y explica complejidad.”
- Tiempo estimado: **2–6 min**

#### Comparación

- **Tiempo**: IA gana.
- **Calidad**: IA suele proponer más opciones (Map vs objeto), pero hay que elegir la que encaje.
- **Comprensión**: IA ayuda a verbalizar trade-offs.

---

### A3) Parsear query string a objeto

**Problema**  
Convertir `"a=1&b=hola%20mundo&b=otra"` en `{ a: "1", b: ["hola mundo", "otra"] }`.

#### Sin IA 

Tiempo estimado: **15–30 min** (por casos borde: keys repetidas, vacío, decode).

```js
function parseQueryString(qs) {
  const out = {};
  const clean = (qs || '').replace(/^\?/, '').trim();
  if (!clean) return out;

  for (const part of clean.split('&')) {
    if (!part) continue;
    const [kRaw, vRaw = ''] = part.split('=');
    const k = decodeURIComponent(kRaw || '');
    const v = decodeURIComponent(vRaw || '');
    if (!k) continue;

    if (Object.prototype.hasOwnProperty.call(out, k)) {
      out[k] = Array.isArray(out[k]) ? [...out[k], v] : [out[k], v];
    } else {
      out[k] = v;
    }
  }
  return out;
}
```

#### Con IA

- Prompt: “Implementa `parseQueryString` con soporte para repetidos y `?` inicial; añade ejemplos.”
- Tiempo estimado: **5–12 min** (incluye revisión)

#### Comparación

- **Tiempo**: IA gana más que en problemas simples.
- **Calidad**: IA ayuda a cubrir casos borde, pero puede inventar comportamientos; hay que revisar.
- **Comprensión**: mejora (te fuerza a definir comportamiento de repetidos).

---

## Parte B — 3 tareas relacionadas con TaskFlow

> Contexto: TaskFlow (QuickTask) es una app de tareas en HTML/JS con filtros, búsqueda, persistencia y fecha de vencimiento.

### B1) Delegación de eventos en tarjetas (performance/limpieza)

**Objetivo**  
Cambiar el enlace de eventos por “botón” (`querySelectorAll(...).forEach(...)`) a **delegación de eventos** en el contenedor, para reducir listeners y simplificar rerenders.

#### Sin IA

- Enfoque: detectar clicks en `#task-container`, inspeccionar `event.target.closest(...)`, y actuar según clase `toggle-task`, `edit-task`, `delete-task`.
- Tiempo estimado: **30–60 min**
- Riesgo: romper selectores o dataset IDs si no se prueba bien.

#### Con IA

- Prompt:
  - “Refactoriza `bindTaskEvents` para usar delegación de eventos y mantener comportamiento; devuelve patch mínimo.”
- Tiempo estimado: **10–25 min** (incluye revisión y prueba manual)

#### Comparación

- **Tiempo**: IA ayuda mucho por ser un refactor mecánico.
- **Calidad**: suele mejorar (menos listeners), si se revisa bien.
- **Comprensión**: aumenta si pides explicación del patrón.

---

### B2) Migración de datos en localStorage (compatibilidad)

**Objetivo**  
Si cambiaste el esquema de `task` (p.ej. `dueDate` obligatorio), añadir una rutina que:
- detecte tareas antiguas sin `dueDate`
- aplique un valor por defecto o las marque para edición

#### Sin IA

- Enfoque: al cargar, mapear tareas, validar shape y normalizar.
- Tiempo estimado: **25–50 min**

#### Con IA

- Prompt:
  - “Añade `migrateStoredTasks()` que normalice tareas antiguas, sin romper; incluye estrategia para dueDate faltante.”
- Tiempo estimado: **10–25 min**

#### Comparación

- **Tiempo**: IA gana.
- **Calidad**: IA suele proponer migraciones sólidas, pero hay que decidir la política de negocio (default vs bloquear).
- **Comprensión**: mejora si se documenta el esquema.

---

### B3) Documentación técnica: flujo de datos y módulos

**Objetivo**  
Mejorar docs para que un nuevo colaborador entienda:
- Flujo: UI → estado → persistencia → render
- Archivos: `app.js`, `index.html`, `taskHelpers.js`, `tema-y-estilos.js`, `.cursor/mcp.json`

#### Sin IA

- Enfoque: leer el código, escribir doc paso a paso.
- Tiempo estimado: **40–90 min**

#### Con IA

- Prompt:
  - “Lee `@app.js` y `@index.html` y escribe una explicación de flujo (máx 40 líneas) + diagrama en texto.”
- Tiempo estimado: **15–35 min** (incluye revisión)

#### Comparación

- **Tiempo**: IA gana.
- **Calidad**: IA produce buen primer borrador; el humano corrige precisión.
- **Comprensión**: muy buena (obliga a ordenar mentalmente el sistema).

---

## Conclusiones generales

- La IA aporta más valor cuando:
  - hay **muchos casos borde**
  - hay **refactors mecánicos** (renombres, extracción de helpers, delegación de eventos)
  - se necesita **estructura/documentación** rápida
- La IA requiere revisión extra cuando:
  - hay decisiones de negocio (política de migración, restricciones de UX)
  - hay dependencias o integraciones externas (GitHub/MCP)

