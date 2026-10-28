/* Memory · lógica del juego.
   Va dentro de una función para no crear variables globales que choquen con perfil.js u otros juegos. */
(() => {
  "use strict";

  const PAREJAS = 6;
  const MAX_INTENTOS = 15;
  const PUNTOS = 10; // victoria +10, derrota −10

  // Temas disponibles: se elige uno al azar en cada partida (la lista no está cerrada).
  const TEMAS = [
    { nombre: "Animales",   items: ["🐶", "🐱", "🦊", "🐼", "🐸", "🦉"] },
    { nombre: "Frutas",     items: ["🍓", "🍋", "🍇", "🍉", "🍑", "🥝"] },
    { nombre: "Espacio",    items: ["🚀", "🪐", "🌙", "⭐", "☄️", "👽"] },
    { nombre: "Comida",     items: ["🍕", "🍔", "🌮", "🍩", "🍣", "🧁"] },
    { nombre: "Deportes",   items: ["⚽", "🏀", "🎾", "🏐", "🏈", "🎱"] },
    { nombre: "Transporte", items: ["🚗", "🚲", "✈️", "🚂", "⛵", "🚁"] }
  ];

  /* Se llama una sola vez por partida terminada y suma el cambio al total compartido.
     resultado: "victoria" | "derrota"; puntos: +10 o −10. */
  function registrarResultadoEnPerfil(resultado, puntos) {
    if (typeof Perfil !== "undefined") Perfil.sumarPuntos(puntos);
  }

  const $ = id => document.getElementById(id);
  const tablero = $("tablero");
  const intentosEl = $("intentos");
  const parejasEl = $("parejas");
  const temaEl = $("tema");
  const resultadoEl = $("resultado");
  const dialogo = $("dialogo-resultado");

  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const azar = (a, b) => Math.random() * (b - a) + a;
  const sinMovimiento = matchMedia("(prefers-reduced-motion: reduce)");

  let idPartida = 0;
  let indiceTema = -1;
  let primera = null;
  let segunda = null;
  let bloqueado = true;
  let terminada = false;
  let intentos = 0;
  let encontradas = 0;

  function mezclar(lista) {
    for (let i = lista.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lista[i], lista[j]] = [lista[j], lista[i]];
    }
    return lista;
  }

  function elegirTema() {
    let i;
    do { i = Math.floor(Math.random() * TEMAS.length); } while (i === indiceTema);
    indiceTema = i;
    return TEMAS[i];
  }

  function actualizarMarcadores() {
    intentosEl.textContent = intentos + " / " + MAX_INTENTOS;
    parejasEl.textContent = encontradas + " / " + PAREJAS;
  }

  async function nuevaPartida() {
    const id = ++idPartida;
    bloqueado = true;
    terminada = false;
    primera = segunda = null;
    intentos = 0;
    encontradas = 0;
    actualizarMarcadores();
    resultadoEl.hidden = true;
    if (dialogo.open) dialogo.close();

    const tema = elegirTema();
    temaEl.textContent = tema.nombre;

    tablero.innerHTML = "";
    mezclar([...tema.items, ...tema.items]).forEach((emoji, i) => {
      const carta = document.createElement("button");
      carta.type = "button";
      carta.className = "carta";
      carta.dataset.id = emoji;
      carta.setAttribute("aria-label", "Carta " + (i + 1) + " boca abajo");
      carta.innerHTML =
        '<div class="carta-giro"><div class="lado lado-tapado"></div><div class="lado lado-cara">' + emoji + "</div></div>";
      carta.addEventListener("click", () => voltear(carta));
      tablero.appendChild(carta);
    });

    await efectoMezcla(id);
    if (id === idPartida) bloqueado = false;
  }

  // Las cartas se juntan en el centro, se barajan y vuelven a su sitio.
  async function efectoMezcla(id) {
    if (sinMovimiento.matches) return;
    const cartas = [...tablero.children];
    const caja = tablero.getBoundingClientRect();
    const cx = caja.left + caja.width / 2;
    const cy = caja.top + caja.height / 2;
    const base = cartas.map(c => {
      const r = c.getBoundingClientRect();
      return { x: cx - (r.left + r.width / 2), y: cy - (r.top + r.height / 2) };
    });

    cartas.forEach(c => c.classList.add("mezclando"));
    await esperar(250);
    if (id !== idPartida) return;

    cartas.forEach((c, i) => {
      c.style.transform = `translate(${base[i].x}px,${base[i].y}px) rotate(${azar(-6, 6)}deg)`;
    });
    await esperar(450);

    for (let k = 0; k < 4; k++) {
      if (id !== idPartida) return;
      const dir = k % 2 ? 1 : -1;
      cartas.forEach((c, i) => {
        const lado = (i % 2 ? 1 : -1) * dir;
        c.style.transform = `translate(${base[i].x + lado * azar(40, 90)}px,${base[i].y + azar(-20, 20)}px) rotate(${lado * azar(6, 18)}deg)`;
        c.style.zIndex = Math.floor(azar(1, 20));
      });
      await esperar(240);
      cartas.forEach((c, i) => {
        c.style.transform = `translate(${base[i].x}px,${base[i].y}px) rotate(${azar(-5, 5)}deg)`;
        c.style.zIndex = Math.floor(azar(1, 20));
      });
      await esperar(200);
    }

    if (id !== idPartida) return;
    cartas.forEach(c => { c.style.transform = ""; c.style.zIndex = ""; });
    await esperar(450);
    cartas.forEach(c => c.classList.remove("mezclando"));
  }

  function voltear(carta) {
    if (bloqueado || terminada) return;
    if (carta.classList.contains("abierta") || carta.classList.contains("acertada")) return;

    carta.classList.add("abierta");
    carta.setAttribute("aria-label", "Carta " + carta.dataset.id);
    if (!primera) { primera = carta; return; }

    segunda = carta;
    bloqueado = true;
    intentos++; // cada selección de dos cartas es un intento, coincidan o no
    actualizarMarcadores();

    const id = idPartida;
    const a = primera;
    const b = segunda;
    primera = segunda = null;

    if (a.dataset.id === b.dataset.id) {
      [a, b].forEach(c => { c.classList.replace("abierta", "acertada"); c.disabled = true; });
      encontradas++;
      actualizarMarcadores();
      if (encontradas === PAREJAS) {
        // Completar la última pareja en el intento 15 también es victoria.
        setTimeout(() => { if (id === idPartida) terminar(true); }, 500);
      } else if (intentos >= MAX_INTENTOS) {
        terminar(false);
      } else {
        bloqueado = false;
      }
    } else {
      setTimeout(() => {
        if (id !== idPartida) return;
        [a, b].forEach(c => {
          c.classList.remove("abierta");
          c.setAttribute("aria-label", "Carta boca abajo");
        });
        if (intentos >= MAX_INTENTOS) terminar(false);
        else bloqueado = false;
      }, 800);
    }
  }

  // El resultado solo se aplica una vez por partida.
  function terminar(victoria) {
    if (terminada) return;
    terminada = true;
    bloqueado = true;

    const delta = victoria ? PUNTOS : -PUNTOS;
    registrarResultadoEnPerfil(victoria ? "victoria" : "derrota", delta);
    mostrarResultado(victoria, delta);
  }

  function mostrarResultado(victoria, delta) {
    const puntos = (delta > 0 ? "+" : "−") + Math.abs(delta) + " puntos";
    const titulo = victoria ? "¡Has ganado!" : "Has perdido";
    const mensaje = victoria
      ? "Encontraste las " + PAREJAS + " parejas en " + intentos + (intentos === 1 ? " intento." : " intentos.")
      : "Se agotaron los " + MAX_INTENTOS + " intentos con " + encontradas + " de " + PAREJAS + " parejas encontradas.";

    resultadoEl.textContent = titulo + " " + mensaje + " Puntuación: " + puntos + ".";
    resultadoEl.hidden = false;

    $("dialogo-titulo").textContent = titulo;
    $("dialogo-mensaje").textContent = mensaje;
    $("dialogo-puntos").textContent = "Puntuación: " + puntos;
    dialogo.showModal();
  }

  $("btn-reiniciar").addEventListener("click", nuevaPartida);
  $("btn-otra-vez").addEventListener("click", nuevaPartida);
  nuevaPartida();
})();
