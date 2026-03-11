# Reflexión final sobre IA y programación

Reflexión a partir del uso de asistentes de IA (Cursor, Copilot, etc.) en el proyecto TaskFlow y en ejercicios de documentación, refactorización y ampliación de funcionalidades.

---

## En qué tareas la IA me ha ayudado más

**Documentación y estructura.** La IA ha sido muy útil para mantener el README al día, redactar tablas de características, describir la estructura del proyecto y escribir ejemplos de uso paso a paso. También para añadir y unificar JSDoc en muchas funciones de una sola vez, algo que manualmente resulta tedioso y fácil de dejar a medias.

**Refactorización guiada.** A la hora de dividir funciones largas (por ejemplo, `bindEvents` en métodos más pequeños), renombrar variables y clases de forma consistente, o extraer lógica a archivos separados (como `tema-y-estilos.js`), la IA ha acelerado el proceso y ha sugerido nombres y agrupaciones que yo luego revisaba y ajustaba.

**Implementación de funcionalidades nuevas.** Para añadir ordenación, filtros por vencimiento, importación desde JSON, atajos de teclado, menús desplegables para filtros y el selector de fecha día/mes/año, la IA ha generado la estructura de código (HTML, eventos, estado) y yo me he centrado en entenderla, probarla y adaptarla al diseño y al flujo del proyecto. Eso ha reducido mucho el tiempo de “escribir desde cero” y me ha permitido centrarme en la integración y en la UX.

**Detección y corrección de bugs.** En casos como la función duplicada en `taskHelpers.js`, el sombreado de la variable `taskDate` o la validación de fechas inválidas, la IA ha identificado el problema y ha propuesto la corrección; yo he comprobado que la solución era correcta antes de aceptarla.

**Configuración y “cómo se hace”.** Para cosas como MCP (Model Context Protocol), configuración de servidores o convenciones de commits, la IA ha servido como guía paso a paso y ha reducido el tiempo de búsqueda en documentación externa.

---

## Casos donde la IA ha fallado o ha generado código incorrecto

**Parches y contexto.** En refactorizaciones grandes (por ejemplo, renombrar muchas propiedades a español en `app.js`), la herramienta de parches ha fallado por diferencias de contexto: saltos de línea, espacios o líneas que no coincidían exactamente con el archivo actual. Ha sido necesario aplicar cambios en bloques más pequeños y revisar el resultado.

**Uso incorrecto de herramientas.** En alguna ocasión se intentó usar una herramienta pensada para notebooks (Jupyter) sobre archivos `.js` o `.html`, lo que no tenía sentido. Son fallos de “qué herramienta usar” más que de la lógica del código, pero obligan a rehacer el cambio con la herramienta adecuada.

**Configuración sensible.** Al configurar MCP con un token de GitHub, en un primer intento el token quedó expuesto como clave en el JSON en lugar de ir en una variable de entorno. La IA no aplicó por defecto las buenas prácticas de seguridad; hubo que corregirlo y recomendar revocar el token.

**Diferencias de entorno.** Comandos que usan `&&` para encadenar en bash no funcionan tal cual en PowerShell; la IA a veces proponía comandos sin tener en cuenta el shell del usuario, lo que generaba errores hasta sustituir `&&` por `;` u otra sintaxis válida.

En conjunto, los fallos han sido sobre todo de **integración** (herramientas, entorno, formato de archivos) y **seguridad/configuración**, más que de algoritmos puramente incorrectos. Por eso la revisión manual sigue siendo imprescindible.

---

## Riesgos de depender demasiado de la IA

**Pérdida de criterio técnico.** Si se acepta el código sin entenderlo, se pierde capacidad para depurar, mantener y evolucionar el proyecto cuando la IA no esté disponible o falle. Es importante que cada cambio sea comprendido al menos a nivel de “qué hace” y “por qué está aquí”.

**Código que “funciona pero no es tuyo”.** Si todo lo escribe la IA y uno solo pega y prueba, es fácil que el estilo, la arquitectura y las decisiones queden incoherentes o que no se sepa explicar el diseño en una revisión o en una entrevista. Conviene usar la IA como acelerador, no como sustituto del razonamiento.

**Sesgos y malas prácticas.** La IA puede repetir patrones obsoletos, ignorar requisitos no escritos (accesibilidad, rendimiento, seguridad) o proponer dependencias innecesarias. Sin revisión, esos patrones se incorporan al proyecto.

**Falsa sensación de seguridad.** Que la IA “lo haya hecho” no garantiza que sea correcto ni que esté alineado con el resto del código o con las convenciones del equipo. Las pruebas y la revisión humana siguen siendo la garantía.

Para mitigar estos riesgos, en este proyecto se ha intentado: revisar cada cambio antes de aceptarlo, documentar en `cursor-workflow.md` qué se hizo y por qué, y mantener una base de código que se pueda seguir leyendo y modificando sin depender siempre del modelo.

---

## Cuándo prefiero programar sin asistencia

**Cuando el problema es pequeño y muy acotado.** Un ajuste de estilo, un cambio de texto o una condición sencilla suele ser más rápido hacerlo a mano que formular el prompt, revisar la respuesta y corregir posibles desvíos.

**Cuando necesito pensar la arquitectura.** Decidir cómo estructurar módulos, qué estado compartir o cómo nombrar conceptos del dominio es algo que prefiero hacer yo primero; luego puedo pedir a la IA que implemente o refactorice según ese diseño.

**Cuando la IA no tiene contexto suficiente.** Si el cambio depende de decisiones antiguas, de convenciones del equipo o de detalles que no están en el código ni en el chat, suele ser más eficaz programar directamente y, si acaso, usar la IA para documentar o para proponer tests después.

**Cuando quiero aprender en profundidad.** Para asimilar un concepto (por ejemplo, un algoritmo o una API), escribir el código a mano y equivocarse suele fijar mejor el aprendizaje que limitarse a integrar código generado.

En resumen: uso la IA sobre todo para **acelerar** tareas repetitivas o bien definidas (documentación, refactors, boilerplate, configuración) y para **explorar** opciones (cómo hacer X, qué considerar para Y). Para **decidir** el qué y el cómo, y para **entender** el código que queda en el repo, sigo prefiriendo programar y revisar sin depender de que la IA lo haga bien a la primera.
