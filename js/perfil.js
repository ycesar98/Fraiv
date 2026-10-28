/* Perfil y puntuación total de Fraiv (compartido por todas las páginas).
   Los juegos NO tocan localStorage: solo llaman a Perfil.sumarPuntos(+/-N).
   Propuesta de contrato, pendiente de acordar con el equipo. */
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

  // Dibuja el nombre y el total en el hueco #perfil-cabecera de la cabecera.
  function pintar() {
    const hueco = document.getElementById("perfil-cabecera");
    if (!hueco) return;
    const p = leer();
    hueco.textContent = (p.nombre ? p.nombre + " · " : "") + p.puntos + " pts";
  }

  // delta: +10 al ganar, −10 al perder. Devuelve el nuevo total.
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

  // Si el total cambia desde otra pestaña, la cabecera se actualiza sola.
  window.addEventListener("storage", e => { if (e.key === CLAVE) pintar(); });
  document.addEventListener("DOMContentLoaded", pintar);

  return { leer, sumarPuntos, establecerNombre };
})();
