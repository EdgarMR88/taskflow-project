## Prompt engineering aplicado al desarrollo (TaskFlow)

Esta guía reúne prompts “listos para copiar y pegar” para usar con IA en tareas reales de desarrollo: **generar código**, **refactorizar**, **documentar**, **revisar**, y **depurar**.

### Cómo usar estos prompts

- Sustituye lo que esté entre `<...>` por tu caso.
- Si trabajas en Cursor, referencia rutas con `@` (por ejemplo `@app.js`, `@docs/ai/`).
- Cuando el prompt pida “paso a paso”, úsalo para razonar sobre decisiones; si estás en producción, puedes pedir solo el resultado final.

---

## 10+ prompts útiles (con explicación)

### 1) Rol: desarrollador senior + criterios de calidad

**Prompt**

> Actúa como un desarrollador senior. Revisa `@<archivo_o_carpeta>` y propón mejoras priorizadas (Alta/Media/Baja) en: legibilidad, mantenibilidad, errores potenciales y rendimiento.  
> Devuélvelo como:
> - Resumen (3 bullets)
> - Hallazgos (por prioridad)
> - Cambios recomendados (con snippets mínimos si aplica)
> - Riesgos/Trade-offs

**Por qué funciona bien**

- Define un **rol** y un **marco de evaluación** claro, lo que reduce respuestas genéricas.
- Pide una **salida estructurada**, útil para convertir en tareas reales.

---

### 2) Few-shot: formato de issues de GitHub (ejemplos → salida consistente)

**Prompt**

> Quiero que generes issues para GitHub con este formato exacto:
>
> Ejemplo:
> **Título**: Bug: el filtro “Pendientes” no actualiza el contador  
> **Descripción**: Al cambiar de “Todas” a “Pendientes”, el contador de tareas no se actualiza.  
> **Pasos**: 1) ... 2) ...  
> **Resultado esperado**: ...  
> **Resultado actual**: ...  
> **Notas**: ...
>
> Ahora crea 5 issues basados en `@<archivo_o_descripcion_del_problema>` siguiendo exactamente el formato del ejemplo.

**Por qué funciona bien**

- El ejemplo (few-shot) “ancla” el estilo y evita variaciones.
- Convierte análisis en **artefactos accionables** (issues).

---

### 3) Razonamiento paso a paso: plan de refactor seguro

**Prompt**

> Analiza `@<archivo>` y dame un plan **paso a paso** para refactorizar sin romper nada.  
> Reglas:
> - No cambies comportamiento.
> - Divide en commits pequeños.
> - Indica qué probar después de cada commit.
> - Señala puntos de riesgo.

**Por qué funciona bien**

- Fuerza a pensar en **secuencia**, pruebas y riesgos, no solo “cambiar por cambiar”.
- Favorece cambios pequeños y verificables.

---

### 4) Restricciones: respuesta corta, solo patch y nada más

**Prompt**

> Necesito un cambio mínimo en `@<archivo>`.  
> Restricciones:
> - Devuelve SOLO el diff (patch) y nada de explicación.
> - No añadas dependencias.
> - No cambies el estilo existente.
> Cambio: <describe_el_cambio>.

**Por qué funciona bien**

- Las restricciones evitan “overengineering” y respuestas largas.
- Ideal cuando ya tienes claro qué hay que modificar.

---

### 5) Generación de código: función con contrato + casos borde

**Prompt**

> Escribe una función en JavaScript llamada `<nombre>` que haga lo siguiente:  
> - Entrada: <tipos>  
> - Salida: <tipos>  
> - Reglas: <reglas>  
> - Casos borde: <lista>  
> Incluye:
> - JSDoc completo
> - 5 ejemplos de uso (inputs/outputs)
> - Complejidad aproximada (tiempo/espacio)

**Por qué funciona bien**

- Define un “contrato” explícito: reduce ambigüedad.
- Obliga a cubrir casos borde y documentación.

---

### 6) Refactor: dividir función larga en helpers (mínimo comportamiento)

**Prompt**

> En `@<archivo>`, refactoriza la función `<nombre>` para:
> - Reducir complejidad
> - Extraer helpers con nombres claros
> - Mantener el mismo comportamiento
> - No cambiar la UI/UX
> Devuelve:
> - Lista de nuevos helpers (nombre + responsabilidad)
> - Patch final

**Por qué funciona bien**

- Establece objetivos concretos (complejidad + extracción).
- Evita cambios funcionales accidentales.

---

### 7) Documentación: README orientado a usuario (sin tecnicismos innecesarios)

**Prompt**

> Redacta un README para `@<repo>` orientado a usuario final.  
> Debe incluir:
> - Qué hace (1 párrafo)
> - Features (bullets)
> - Cómo usar (pasos)
> - Cómo ejecutar local (comandos)
> - Capturas: deja placeholders
> Restricciones:
> - Máximo 200 líneas
> - Español

**Por qué funciona bien**

- Pide estructura completa y limita longitud.
- Útil para repos públicos: mejora onboarding.

---

### 8) Validaciones: checklist + implementación

**Prompt**

> Revisa los formularios en `@<archivo_html>` y la lógica en `@<archivo_js>`.  
> 1) Propón una checklist de validaciones (obligatorios, formatos, límites, fechas, UX).  
> 2) Implementa las validaciones faltantes en JS con mensajes claros.  
> Restricción: no uses librerías externas.

**Por qué funciona bien**

- Pide primero “qué validar” y luego “cómo implementarlo”.
- Mantiene el stack simple (sin dependencias).

---

### 9) Depuración: reproducir, aislar, corregir, prevenir

**Prompt**

> Tengo este bug: <describe_bug>.  
> Código relevante: `@<archivo>`  
> Quiero que sigas este proceso:
> 1) Hipótesis (3 posibles causas)
> 2) Cómo reproducir (pasos concretos)
> 3) Evidencia que buscarías (logs/condiciones)
> 4) Fix mínimo (patch)
> 5) Prevención: test o validación para que no vuelva

**Por qué funciona bien**

- Evita “adivinar” y obliga a un flujo de depuración real.
- Produce una solución + una medida preventiva.

---

### 10) Performance: identificar cuellos de botella sin micro-optimizaciones

**Prompt**

> Analiza `@<archivo>` y su flujo de ejecución.  
> Encuentra 3 mejoras de rendimiento con mayor impacto, prioriza y explica:
> - Qué se cambia
> - Por qué impacta
> - Riesgos
> Restricción: no micro-optimices; enfócate en cambios de diseño/flujo.

**Por qué funciona bien**

- Enfoca en impacto real, no en “optimizar por optimizar”.
- Pide riesgos: reduce regresiones.

---

### 11) Restricciones fuertes: estilo y compatibilidad

**Prompt**

> Haz un cambio en `@<archivo>` con estas reglas estrictas:
> - Mantén naming en español
> - No uses features más nuevas que ES2020
> - No cambies los IDs/clases del HTML
> - No cambies el comportamiento observable
> Devuelve solo el patch.

**Por qué funciona bien**

- Controla compatibilidad y evita cambios que rompan la UI.
- Muy útil en proyectos sin build tooling.

---

### 12) Few-shot: crear JSDoc consistente (antes/después)

**Prompt**

> Quiero JSDoc con este estilo:
> - 1 frase breve
> - `@param` con tipos simples
> - `@returns` claro
>
> Ejemplo:
> ```js
> /**
>  * Calcula los días restantes hasta una fecha.
>  * @param {string|Date} fecha
>  * @returns {number|null}
>  */
> ```
>
> Ahora añade JSDoc a estas funciones en `@<archivo>`: <lista_de_funciones>.

**Por qué funciona bien**

- El ejemplo fija el estilo (few-shot) para que quede homogéneo.
- Reduce la variabilidad del formato de documentación.

---

## Ideas de prompts para este repo (TaskFlow)

- **Auditoría completa**: “Analiza `@app.js` y `@index.html` y dime 10 mejoras priorizadas.”
- **Refactor controlado**: “Refactoriza `bindTaskEvents` para usar delegación de eventos.”
- **Docs**: “Actualiza `@docs/ai/cursor-workflow.md` con lo que cambiamos hoy.”

