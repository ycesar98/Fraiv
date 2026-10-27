# Fraiv — Base compartida del proyecto

**Versión:** 0.3 · Documento de trabajo  
**Fecha:** 27 de octubre de 2026  
**Destinatarios:** integrantes del equipo y asistentes de IA que colaboren en el proyecto.

## 1. Finalidad de este documento

Este archivo reúne las decisiones comunes de Fraiv para que las páginas y los juegos mantengan la misma identidad y funcionen como una sola web.

Se distinguen tres estados:

- **Confirmado:** decisión comunicada por el equipo a través de Yari.
- **Propuesta:** recomendación para mantener la cohesión; necesita acuerdo del equipo.
- **Pendiente:** detalle todavía sin decidir. No debe implementarse como si ya estuviera aprobado.

Las decisiones nuevas deben recogerse aquí y en las tareas afectadas de Trello. Si este documento, una tarjeta y una petición nueva se contradicen, se debe señalar la diferencia y aclararla antes de realizar el cambio afectado.

## 2. Descripción y alcance confirmado

Fraiv es una web de juegos para una sola persona. La página principal presenta cuatro juegos y permite abrir cada uno en una pestaña nueva del navegador:

1. Ajedrez simplificado.
2. Tres en raya.
3. Memory.
4. Sopa de letras.

Cuando el juego necesita un rival, se juega contra el ordenador. Memory y Sopa de letras son juegos independientes y no necesitan un rival simulado.

La web tendrá un perfil local con nombre y puntuación acumulada, visible en la cabecera. Debe funcionar tanto en ordenador como en móvil. No hay una fecha de entrega fijada.

### Tecnologías permitidas

- **HTML:** estructura y contenido de las páginas.
- **CSS:** presentación visual y adaptación a las pantallas.
- **JavaScript:** lógica de los juegos, interacciones y almacenamiento local del perfil.

La implementación se realizará con HTML, CSS y JavaScript nativos, sin incorporar otras tecnologías de desarrollo. No se añadirán frameworks, bibliotecas, motores de juegos o servicios externos sin aclarar previamente su compatibilidad con esta restricción.

Trello y GitHub se utilizan para organizar el trabajo y compartir el código.

### Fuera del alcance actual

- Multijugador entre personas, local o por Internet.
- Contraseñas y cuentas compartidas entre dispositivos.
- Clasificación de usuarios o historial de resultados visible.
- Selector de dificultad: cada juego tiene una única dificultad fija.

## 3. Páginas y navegación

### Página principal

Debe incluir:

- Marca Fraiv; el logo está en proceso.
- Perfil con nombre y puntuación acumulada en la cabecera.
- Una descripción breve de la web.
- Acceso a los cuatro juegos.
- Nombre, descripción breve y etiqueta de dificultad de cada juego.

Al seleccionar un juego, su página se abre en una pestaña nueva. La página de inicio permanece disponible en su pestaña original.

### Páginas de juegos

Cada juego debe ofrecer:

- Nombre del juego y dificultad fija.
- Instrucciones que expliquen cómo jugar, ganar, perder y obtener puntos.
- Área de juego adaptada a ordenador y móvil.
- Control para reiniciar.
- Información de estado pertinente: intentos, tiempo, turnos o victorias de la serie.
- Resultado final y cambio de puntuación correspondiente.
- Cabecera coherente con la del resto de la web y perfil actualizado.

**Propuesta:** incluir en todas las páginas un enlace visible a Inicio y un enlace desde el logo a la página principal.

## 4. Perfil y puntuación

### Decisiones confirmadas

- Habrá un único perfil local por navegador para el sitio de Fraiv.
- El perfil tendrá un nombre y una puntuación acumulada.
- No tendrá contraseña en esta versión.
- Los datos se guardarán en el navegador para conservarlos entre visitas.
- El perfil aparecerá en la cabecera.
- La puntuación podrá ser negativa.
- Solo se mostrará el total acumulado; no habrá desglose visible por juego.
- Ganar suma los puntos del juego y perder resta esa misma cantidad.
- Empatar no suma ni resta.
- Reiniciar o abandonar una partida no cuenta como derrota y no modifica los puntos.

| Juego | Dificultad fija | Victoria | Derrota | Empate |
| --- | --- | ---: | ---: | ---: |
| Ajedrez simplificado | Difícil | +30 | −30 | 0 |
| Sopa de letras | Intermedia | +20 | −20 | 0 |
| Tres en raya | Fácil | +10 | −10 | 0 |
| Memory | Fácil | +10 | −10 | 0 |

En Memory y Sopa de letras, el empate no tiene una condición definida actualmente; la columna expresa la regla general de puntuación.

En Tres en raya, los puntos se aplican **una sola vez al terminar la serie**, no después de cada ronda.

En Memory, los puntos se aplican **una sola vez al terminar la partida completa**. Superar una ronda no suma puntos por separado.

### Condiciones necesarias para integrar los juegos

- Todos los juegos deben utilizar el mismo perfil y la misma puntuación acumulada.
- Un resultado final solo puede aplicarse una vez. Pulsar otra vez sobre el tablero terminado o volver a mostrar el resultado no debe duplicar puntos.
- Reiniciar no deshace un resultado que ya se haya contabilizado. Inicia una partida o serie nueva.
- La puntuación obtenida en una pestaña debe reflejarse en la cabecera de las otras páginas abiertas del mismo sitio.
- Cambiar la presentación de una cabecera no debe crear un perfil independiente.

**Propuesta técnica:** utilizar `localStorage`, un mecanismo de JavaScript para guardar datos en el navegador, y un archivo común que gestione el perfil y los puntos. Acordar también cómo se actualizarán las otras pestañas al cambiar la puntuación.

**Pendiente para más adelante:** responsable, estructura exacta de los datos, nombres de las funciones compartidas, creación o edición del nombre y comportamiento cuando todavía no existe perfil. No debe crearse una solución diferente en cada juego.

## 5. Reglas de cada juego

### 5.1. Ajedrez simplificado

**Confirmado:**

- Una persona juega contra el ordenador.
- Dificultad fija: difícil.
- Se gana mediante jaque mate; capturar al rey no es la condición de victoria.
- Límite de 90 segundos por turno.
- Agotar el tiempo supone perder la partida.
- Victoria: +30 puntos. Derrota: −30 puntos.

**Pendiente:**

- Qué reglas se mantienen y cuáles se eliminan en esta versión simplificada: enroque, promoción, captura al paso y condiciones de tablas, entre otras.
- Funcionamiento y nivel del rival controlado por el ordenador.
- Aplicación del límite de tiempo al turno del ordenador.

La etiqueta «difícil» está confirmada, pero no define por sí sola cómo debe decidir las jugadas el ordenador.

### 5.2. Tres en raya

**Confirmado:**

- Una persona juega contra el ordenador.
- Dificultad fija: fácil.
- Una serie termina cuando uno de los participantes consigue **tres victorias**.
- Las rondas empatadas no cuentan para esas victorias.
- Ganar la serie suma 10 puntos; perderla resta 10 puntos.
- Las rondas individuales no modifican la puntuación acumulada del perfil.

Esta regla sustituye la formulación anterior «al mejor de tres»: no se trata de jugar un máximo de tres rondas ni de ganar dos.

**Pendiente:** quién empieza, cómo se alterna el primer turno y cómo juega el ordenador.

### 5.3. Memory

**Confirmado:**

- Juego individual de encontrar parejas.
- Dificultad fija: fácil.
- Cada partida consta de **cuatro rondas consecutivas**. Los cuatro packs se corresponden con esas cuatro rondas.
- Cada ronda presenta seis parejas, es decir, doce cartas.
- La temática de cada ronda se elige de manera aleatoria. Ejemplos: verduras, animales, frutas, deporte y transporte. La cantidad de temáticas disponibles queda abierta.
- Cada ronda comienza con **10 intentos**.
- Cada selección de dos cartas cuenta como un intento, tanto si coinciden como si fallan.
- Al encontrar las seis parejas, se supera la ronda y se avanza a la siguiente; completar la cuarta ronda supone ganar la partida.
- Si se agotan los intentos de una ronda sin completar sus parejas, se pierde la partida completa y no se continúa a la siguiente ronda.
- Completar la última pareja en el intento 10 permite superar la ronda.
- Ganar la partida completa suma **10 puntos en total**.
- Perder la partida completa resta **10 puntos en total**, con independencia de cuántas rondas se hayan superado.
- Las rondas individuales no modifican la puntuación acumulada del perfil.

Esta configuración sustituye la indicación anterior de 15 intentos por partida.

### 5.4. Sopa de letras

**Confirmado:**

- Juego individual.
- Dificultad fija: intermedia.
- Tablero de 10 × 10 letras.
- Se deben encontrar seis palabras.
- Las palabras pueden aparecer en horizontal, vertical y diagonal.
- No se permiten palabras al revés.
- Tiempo máximo por partida: 120 segundos.
- Se gana encontrando todas las palabras antes de que termine el tiempo.
- Victoria: +20 puntos. Derrota: −20 puntos.

**Consecuencia de la condición de victoria:** si termina el tiempo y quedan palabras por encontrar, la partida se considera perdida.

**Pendiente:** temáticas y palabras disponibles; procedimiento de selección de letras en ordenador y móvil.

## 6. Identidad visual

### Decisiones confirmadas

- **Nombre:** Fraiv.
- **Tipografía:** Arial.
- **Logo:** en proceso.
- **Presentación:** coherente en todas las páginas y adaptable a ordenador y móvil.

| Uso | Color |
| --- | --- |
| Fondo principal | `#0F0E17` |
| Títulos | `#FFFFFE` |
| Párrafos | `#A7A9BE` |
| Fondo de botones | `#FF8906` |
| Texto de botones, según la paleta facilitada | `#FFFFFE` |
| Trazo de ilustraciones | `#000000` |
| Color principal de ilustraciones | `#FFFFFE` |
| Resaltado de ilustraciones | `#FF8906` |
| Color secundario de ilustraciones | `#F25F4C` |
| Color terciario de ilustraciones | `#E53170` |

Los colores secundario y terciario de ilustraciones no implican por sí solos estados de error, victoria o derrota. Esos usos todavía no están acordados.

### Propuestas para mantener la cohesión

- Centralizar la paleta y la tipografía en un CSS común.
- Compartir el estilo de cabecera, perfil, botones, tarjetas, instrucciones y mensajes de resultado.
- Reservar el CSS de cada juego para su tablero y sus elementos específicos.
- Acordar tamaños de títulos, separación entre bloques, bordes y apariencia de los controles antes de integrar todas las páginas.
- Revisar la legibilidad del texto claro sobre el botón naranja. Como alternativa pendiente de aprobación, valorar texto oscuro `#0F0E17` sobre `#FF8906`.

**Pendiente para más adelante:** compromiso de accesibilidad y sus criterios concretos, incluyendo teclado, foco visible y contraste. No se declara un nivel de cumplimiento que todavía no se haya acordado y comprobado.

## 7. Organización del código — propuesta

Esta estructura es una propuesta de partida, no describe archivos que ya existan:

```text
fraiv/
├── FRAIV.md
├── index.html
├── juegos/
│   ├── ajedrez.html
│   ├── tres-en-raya.html
│   ├── memory.html
│   └── sopa-de-letras.html
├── css/
│   ├── comun.css
│   ├── inicio.css
│   ├── ajedrez.css
│   ├── tres-en-raya.css
│   ├── memory.css
│   └── sopa-de-letras.css
├── js/
│   ├── perfil.js
│   ├── inicio.js
│   ├── ajedrez.js
│   ├── tres-en-raya.js
│   ├── memory.js
│   └── sopa-de-letras.js
└── assets/
    ├── logos/
    └── juegos/
```

No es necesario crear archivos vacíos si no tienen una función. Por ejemplo, `inicio.js` solo sería necesario si Inicio necesita lógica adicional a la del perfil común.

### Acuerdos técnicos propuestos

- Utilizar nombres de archivos en minúsculas, sin espacios ni tildes, separados por guiones cuando sea necesario.
- Usar `index.html` para Inicio. En Trello la tarea figura como «Crear Inicio.html»; acordar el nombre definitivo antes de enlazar las páginas.
- Evitar selectores generales del CSS de un juego que cambien por accidente las otras páginas.
- Mantener una única gestión compartida de perfil y puntuación.
- Acordar con Yari los cambios en archivos comunes antes de integrarlos.
- Publicar Inicio y los juegos dentro del mismo sitio para que compartan el almacenamiento del navegador.

Antes de integrar el perfil, el equipo debe acordar un **contrato común**: qué datos guarda, cómo se leen y qué función usa cada juego para comunicar una victoria o una derrota. Este contrato queda pendiente junto con su responsable.

## 8. Equipo y reparto de trabajo

Reparto observado en Trello durante la preparación de este documento:

| Área | Responsable asignado |
| --- | --- |
| Página principal | Yari |
| Marca: logo, nombre y paleta | Yari y Lucas Ezequiel |
| Sopa de letras | Giacomo Coiana |
| Tres en raya | Marc Osma López |
| Memory | Gianella |
| Ajedrez | Nayara Yebra Bustos |
| Documento MD | Yahya Barrhel |
| Descripción de la web y de los juegos | Yahya Barrhel |
| Menú de usuario | Pendiente de asignación |
| Prueba final de funcionamiento | Pendiente de asignación |
| Revisión de cambios | Yari |

La asignación de «Menú de usuario» no implica que el sistema de puntuación ya tenga responsable. La coordinación de ambos queda pendiente para más adelante.

Los estados de las tarjetas se consultarán en Trello para evitar que este documento conserve un estado de progreso antiguo. Los textos interiores de las tarjetas no se han podido leer durante esta revisión; no se consideran incorporados al MD.

**Tablero:** [New Project en Trello](https://trello.com/b/QT2AJG4L/new-project).

## 9. GitHub y revisión

### Confirmado

- Repositorio creado: https://github.com/ycesar98/Fraiv
- Ya existen las ramas main y develop.
- Cada persona trabajará en su propia rama.
- Yari y el equipo revisarán los cambios.

### Flujo propuesto

1. Crear el repositorio y acordar la estructura común.
2. Cada persona desarrolla su tarea en su rama.
3. Antes de integrar, presenta los cambios y explica qué archivos ha modificado.
4. Solicita la revisión de Yari mediante una solicitud para incorporar los cambios —pull request—.
5. Los cambios se incorporan a la rama principal después de la revisión.
6. Se actualiza Trello para reflejar el progreso real.

**Pendiente:** nombres de las ramas personales, función de develop, procedimiento final de integración y publicación de la web.

## 10. Criterios comunes propuestos para considerar una tarea terminada

Estos criterios se proponen para acordarlos al retomar la coordinación y las comprobaciones finales:

- La funcionalidad coincide con las reglas confirmadas de este documento.
- La página mantiene la identidad visual de Fraiv.
- La interfaz puede utilizarse en ordenador y móvil sin perder controles necesarios.
- Las instrucciones coinciden con el comportamiento real del juego.
- La puntuación se aplica con los valores acordados y sin duplicar resultados.
- Reiniciar y abandonar no añaden ni restan puntos.
- Los enlaces abren las páginas correctas.
- Los cambios están en la rama de la persona responsable y se han presentado a Yari para revisión.

La organización de las pruebas y sus responsables se decidirán más adelante.

## 11. Instrucciones para asistentes de IA

- Leer este documento antes de proponer o modificar partes del proyecto.
- Respetar las tecnologías, reglas, paleta y reparto acordados.
- Realizar la tarea solicitada y explicar los cambios para que el equipo pueda comprenderlos.
- No convertir propuestas o pendientes en requisitos aprobados.
- No incorporar funcionalidades, dependencias, servicios o dificultades adicionales por iniciativa propia.
- No modificar archivos compartidos de forma que se rompa el trabajo de otros juegos.
- Reutilizar la solución común de perfil y puntuación cuando esté acordada; no crear otra independiente.
- Señalar los conflictos entre el código, este documento y Trello antes de resolverlos mediante suposiciones.
- Diferenciar lo que se ha revisado de lo que se ha comprobado ejecutándolo. No afirmar que una funcionalidad funciona si no se ha comprobado.

## 12. Decisiones pendientes

| Decisión | Estado |
| --- | --- |
| Logo definitivo | En proceso |
| Reglas exactas del ajedrez simplificado y comportamiento del ordenador | Pendiente |
| Inicio de turnos y comportamiento del ordenador en Tres en raya | Pendiente |
| Temáticas, palabras y selección en Sopa de letras | Pendiente |
| Comportamiento de los juegos con temporizador al cambiar de pestaña | Pendiente |
| Creación o edición del perfil y estructura compartida de sus datos | Para más adelante |
| Responsable del perfil y de la puntuación común | Para más adelante |
| Accesibilidad, organización de pruebas y responsables | Para más adelante |
| Estructura de archivos y estilos comunes | Propuesta en este documento |
| Flujo de integración, ramas personales y publicación | Pendiente / propuesta |

Una decisión pendiente no impide avanzar en partes independientes, pero debe resolverse antes de cerrar la funcionalidad a la que afecta.
