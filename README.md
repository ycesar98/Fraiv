# Fraiv

Fraiv es una página web de juegos de mesa online que reúne diferentes juegos clásicos y de lógica en una misma plataforma. El proyecto está desarrollado con HTML, CSS y JavaScript, con el objetivo de ofrecer una experiencia sencilla, intuitiva y adaptable a diferentes dispositivos.

## Descripción

La plataforma permite acceder a distintos juegos desde el navegador, jugar partidas, consultar las reglas y gestionar las puntuaciones del perfil.

El diseño busca mantener una apariencia coherente entre las páginas, reutilizando estilos y funcionalidades comunes.

## Funcionalidades

- **Varios juegos:** acceso a diferentes juegos clásicos y de lógica.
- **Sistema de puntuación:** gestión de los puntos obtenidos durante las partidas.
- **Perfil de usuario:** almacenamiento local del nombre y la puntuación mediante `localStorage`.
- **Niveles de dificultad:** opciones de dificultad en los juegos que las incorporan.
- **Reglas de juego:** instrucciones accesibles desde la interfaz.
- **Diseño responsive:** adaptación de la interfaz a diferentes tamaños de pantalla.
- **Estilos compartidos:** uso de una hoja de estilos común para mantener la coherencia visual entre las páginas.

## Juegos disponibles

### Tres en raya

Juego clásico de estrategia en el que los jugadores deben conseguir una línea de tres símbolos.

Archivo: `juegos/tres-en-raya.html`

### Sopa de letras

Juego de búsqueda de palabras dentro de una cuadrícula, con seguimiento del tiempo y de la puntuación.

Archivo: `juegos/sopa-de-letras.html`

### Memory

Juego de memoria en el que hay que encontrar las parejas de cartas.

Archivo: `juegos/memory.html`

### Ajedrez

Juego de estrategia basado en el ajedrez clásico.

Archivo: `juegos/ajedrez.html`

## Tecnologías utilizadas

- **HTML5:** estructura y contenido de las páginas.
- **CSS3:** estilos, diseño responsive y animaciones.
- **JavaScript:** lógica de los juegos e interacciones.
- **LocalStorage:** almacenamiento local de los datos del perfil y de las puntuaciones.
- **Git:** control de versiones.
- **GitHub:** alojamiento del repositorio y colaboración entre desarrolladores.

## Estructura del proyecto

La organización documentada durante el desarrollo incluye las siguientes carpetas y archivos:

```text
Fraiv/
├── index.html
├── spec.md
├── css/
│   ├── comun.css
│   ├── tres-en-raya.css
│   ├── sopa-de-letras.css
│   └── memory.css
├── js/
└── juegos/
    ├── tres-en-raya.html
    ├── sopa-de-letras.html
    ├── memory.html
    └── ajedrez.html
```

`comun.css` contiene los estilos compartidos de la interfaz. Cada juego puede utilizar, además, su propia hoja de estilos para los elementos específicos de la partida.

La estructura anterior recoge las rutas identificadas durante el desarrollo y debe contrastarse con la versión definitiva del repositorio antes de considerarse un inventario completo de archivos.

## Instalación y ejecución

### Requisitos

- Git.
- Un navegador web actualizado.
- Visual Studio Code, recomendado para editar y ejecutar el proyecto.

### Clonar el repositorio

```bash
git clone https://github.com/ycesar98/Fraiv.git
```

Accede a la carpeta del proyecto:

```bash
cd Fraiv
```

Abre la carpeta en Visual Studio Code y utiliza la extensión Live Server para ejecutar la página principal desde el navegador.

No se requiere un proceso de compilación para la versión desarrollada con HTML, CSS y JavaScript.

## Desarrollo y colaboración

Para trabajar en una nueva funcionalidad, crea una rama independiente:

```bash
git checkout -b feature/nombre-funcionalidad
```

Cuando hayas terminado los cambios, comprueba el estado del repositorio:

```bash
git status
```

Guarda los cambios y súbelos a GitHub:

```bash
git add .
git commit -m "Descripción de los cambios"
git push origin feature/nombre-funcionalidad
```

Después, abre un Pull Request para revisar e integrar los cambios en la rama correspondiente.

## Estado del proyecto

Fraiv está en desarrollo. Las funcionalidades y los juegos pueden ampliarse y modificarse durante las siguientes fases del proyecto.

## Repositorio

[https://github.com/ycesar98/Fraiv](https://github.com/ycesar98/Fraiv)

## Licencia

La licencia del proyecto está pendiente de especificación.
