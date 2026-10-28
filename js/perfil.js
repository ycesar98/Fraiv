/* Perfil y puntuación total de Fraiv (compartido por todas las páginas). */
const Perfil = (() => {
  "use strict";

  const CLAVE = "fraiv_perfil";
  const VACIO = { nombre: "", puntos: 0 };

  function leer() {
    try {
      const datos = JSON.parse(localStorage.getItem(CLAVE));
      if (datos && typeof datos.puntos === "number") {
        return { nombre: String(datos.nombre || ""), puntos: datos.puntos };
      }
    } catch (e) { /* almacenamiento no disponible o dato dañado */ }
    return { ...VACIO };
  }

  function guardar(perfil) {
    try { localStorage.setItem(CLAVE, JSON.stringify(perfil)); } catch (e) { /* sin almacenamiento */ }
  }

  function pintar() {
    const p = leer();
    const dropdown = document.getElementById("perfil-dropdown");
    if (!dropdown) return;

    // Si no hay nombre, mostramos el formulario para introducirlo
    if (!p.nombre || p.nombre.trim() === "") {
      dropdown.innerHTML = `
        <div class="formulario-nombre">
          <p>Introduce tu nombre:</p>
          <input type="text" id="input-nombre-usuario" class="input-nombre" placeholder="Ej. Gianella">
          <button id="btn-guardar-nombre" class="boton-guardar">Guardar</button>
        </div>
      `;

      // Asignamos el evento al botón recién creado
      document.getElementById("btn-guardar-nombre").addEventListener("click", () => {
        const nombre = document.getElementById("input-nombre-usuario").value;
        if (nombre.trim()) {
          establecerNombre(nombre);
        }
      });
    } else {
      // Si ya hay nombre, mostramos los datos del jugador
      dropdown.innerHTML = `
        <p>Jugador: <span id="nombre-jugador">${p.nombre}</span></p>
        <p>Puntos: <span id="puntos-jugador">${p.puntos}</span></p>
      `;
    }
  }

  function configurarInteracciones() {
    const trigger = document.getElementById("perfil-trigger");
    const dropdown = document.getElementById("perfil-dropdown");

    if (!trigger || !dropdown) return;

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("visible");
      // Pintamos el contenido justo al abrir para asegurar que esté actualizado
      pintar();
    });

    document.addEventListener("click", () => {
      dropdown.classList.remove("visible");
    });

    dropdown.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  function sumarPuntos(delta) {
    const p = leer();
    p.puntos += Number(delta) || 0;
    guardar(p);
    pintar();
    return p.puntos;
  }

  function establecerNombre(nombre) {
    const p = leer();
    p.nombre = String(nombre || "").trim();
    guardar(p);
    pintar();
  }

  window.addEventListener("storage", e => { if (e.key === CLAVE) pintar(); });
  document.addEventListener("DOMContentLoaded", () => {
    pintar();
    configurarInteracciones();
  });

  return { leer, sumarPuntos, establecerNombre };
})();
