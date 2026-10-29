(() => {
    'use strict';
  
    /* ---------- Configuración ---------- */
    const POINTS = 30;
    const TURN_MS = 90000; // límite por turno del jugador (no se aplica al turno del ordenador: pendiente)
    const SEARCH = { skill: 20, depth: 16, time: 2000 }; // dificultad fija: difícil
    // Se prueba primero un stockfish.js local y después el CDN (Stockfish.js 10, un solo archivo).
    const ENGINE_SOURCES = [
      '../js/stockfish.js',
      'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js'
    ];
    const GLYPH = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
    const NAMES = { k: 'rey', q: 'dama', r: 'torre', b: 'alfil', n: 'caballo', p: 'peón' };
    const FILES = 'abcdefgh';
    const MESSAGES = {
      win: ['¡Victoria! Has ganado la partida', '¡Victoria! +30 puntos'],
      loss: ['Derrota. La computadora ha ganado', 'Derrota. −30 puntos'],
      timeout: ['Derrota. Se agotaron tus 90 segundos', 'Derrota. −30 puntos'],
      draw: ['Empate. La partida ha terminado en tablas', 'Empate. 0 puntos']
    };
  
    const $ = (id) => document.getElementById(id);
    const el = {
      board: $('board'), promo: $('promo'), turn: $('turn'), status: $('status'), tiempo: $('tiempo'),
      engineMsg: $('engineMsg'), resultCard: $('resultCard'), result: $('result'),
      resultMsg: $('resultMsg'), resultPts: $('resultPts'), side: $('side'), history: $('history'),
      btnReset: $('btnReset'), btnFlip: $('btnFlip')
    };
  
    if (typeof Chess === 'undefined') {
      el.status.textContent = 'Error: chess.js no se ha cargado';
      el.engineMsg.hidden = false;
      el.engineMsg.textContent = 'No se pudo cargar chess.js desde el CDN. Descarga chess.min.js (versión 0.10.3) y colócalo en la carpeta js.';
      return;
    }
  
    /* ---------- Estado ---------- */
    let game = new Chess();
    let humanColor = 'w';    // color del jugador; la computadora juega el contrario
    let gameId = 0;          // identificador independiente por partida
    let scoredGame = -1;     // id de la última partida ya contabilizada
    let selected = null, legal = [], flipped = false, thinking = false, promoMove = null;
    let engine = null, engineError = null, pending = null, outstanding = 0;
    let endReason = null, deadline = 0, timerId = null;
  
    /* ---------- Resultado ---------- */
    function drawReason() {
      if (game.in_stalemate()) return 'ahogado';
      if (game.in_threefold_repetition()) return 'repetición de posición';
      if (game.insufficient_material()) return 'material insuficiente';
      return 'regla de los cincuenta movimientos';
    }
  
    // Suma o resta puntos con el módulo común Perfil (js/perfil.js). Solo se llama una vez por partida.
    function sumarPuntos(delta) { if (typeof Perfil !== 'undefined') Perfil.sumarPuntos(delta); }
    function isOver() { return game.game_over() || scoredGame === gameId; }
  
    function finishGame(forced) {
      if (scoredGame === gameId) return; // el resultado de esta partida ya se procesó
      scoredGame = gameId;
      stopTimer();
      let result = forced || 'draw';
      if (!forced && game.in_checkmate()) result = game.turn() === humanColor ? 'loss' : 'win';
      if (result === 'win') sumarPuntos(POINTS);
      else if (result === 'loss') sumarPuntos(-POINTS);
      const key = result === 'loss' && endReason === 'tiempo' ? 'timeout' : result;
      el.result.className = 'result ' + result;
      el.resultMsg.textContent = MESSAGES[key][0];
      el.resultPts.textContent = MESSAGES[key][1];
      el.resultCard.hidden = false;
    }
  
    /* ---------- Temporizador del turno del jugador ---------- */
    function stopTimer() { clearInterval(timerId); timerId = null; el.tiempo.textContent = '—'; }
    function tick() {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      el.tiempo.textContent = left + ' s';
      if (left <= 0) {
        endReason = 'tiempo'; selected = null; legal = []; promoMove = null; el.promo.hidden = true;
        finishGame('loss');
        render();
      }
    }
    function beginHumanTurn() {
      if (!engine || isOver() || game.turn() !== humanColor) return;
      stopTimer();
      deadline = Date.now() + TURN_MS;
      timerId = setInterval(tick, 250);
      tick();
    }
  
    /* ---------- Render ---------- */
    function kingSquare(color) {
      const rows = game.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = rows[r][c];
          if (p && p.type === 'k' && p.color === color) return FILES[c] + (8 - r);
        }
      }
      return null;
    }
  
    function canPlay() {
      return !!engine && !thinking && !promoMove && !isOver() && game.turn() === humanColor;
    }
  
    function renderBoard() {
      const active = document.activeElement;
      const focusSq = active && el.board.contains(active) ? active.dataset.sq : null;
      const last = game.history({ verbose: true }).slice(-1)[0];
      const check = game.in_check() ? kingSquare(game.turn()) : null;
      let html = '';
      for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
          const rank = flipped ? r + 1 : 8 - r;
          const file = flipped ? 7 - f : f;
          const sq = FILES[file] + rank;
          const p = game.get(sq);
          const target = legal.some((m) => m.to === sq);
          const cls = ['sq', (file + rank) % 2 === 1 ? 'd' : 'l'];
          if (last && (last.from === sq || last.to === sq)) cls.push('lm');
          if (sq === selected) cls.push('sel');
          if (target) cls.push('lg');
          if (target && p) cls.push('cap');
          if (sq === check) cls.push('chk');
          const label = sq + (p ? `, ${NAMES[p.type]} (${p.color === 'w' ? 'blancas' : 'negras'})` : ', vacía');
          html += `<button class="${cls.join(' ')}" data-sq="${sq}" aria-label="${label}">` +
            (p ? `<span class="pc ${p.color}">${GLYPH[p.type]}\uFE0E</span>` : '') + '</button>';
        }
      }
      el.board.innerHTML = html;
      el.board.classList.toggle('busy', thinking);
      if (focusSq) {
        const b = el.board.querySelector(`[data-sq="${focusSq}"]`);
        if (b) b.focus();
      }
    }
  
    function renderInfo() {
      const over = isOver();
      const side = game.turn() === 'w' ? 'Blancas' : 'Negras';
      el.turn.textContent = over ? '—' : `${side} (${game.turn() === humanColor ? 'tú' : 'computadora'})`;
      let s;
      if (engineError) s = 'IA no disponible';
      else if (!engine) s = 'Cargando Stockfish…';
      else if (thinking) s = 'La computadora está pensando…';
      else if (endReason === 'tiempo') s = 'Tiempo agotado';
      else if (game.in_checkmate()) s = 'Jaque mate';
      else if (over) s = 'Tablas: ' + drawReason();
      else if (game.in_check()) s = 'Jaque';
      else s = 'En juego';
      el.status.textContent = s;
      el.engineMsg.hidden = !engineError;
      el.engineMsg.textContent = engineError || '';
  
      const h = game.history();
      let html = '';
      for (let i = 0; i < h.length; i += 2) {
        html += `<li><span>${i / 2 + 1}.</span><span>${h[i]}</span><span>${h[i + 1] || ''}</span></li>`;
      }
      el.history.innerHTML = html || '<li class="empty">Sin movimientos todavía</li>';
      el.history.scrollTop = el.history.scrollHeight;
  
    }
  
    function render() { renderBoard(); renderInfo(); }
  
    /* ---------- Interacción del jugador ---------- */
    function onSquare(sq) {
      if (!canPlay()) return;
      const piece = game.get(sq);
      if (selected && legal.some((m) => m.to === sq)) { attemptMove(selected, sq); return; }
      if (piece && piece.color === humanColor && sq !== selected) {
        selected = sq;
        legal = game.moves({ square: sq, verbose: true });
      } else {
        selected = null;
        legal = [];
      }
      render();
    }
  
    function attemptMove(from, to) {
      if (legal.find((m) => m.to === to).promotion) {
        promoMove = { from, to };
        el.promo.hidden = false;
        render();
        el.promo.querySelector('button').focus();
        return;
      }
      playerMove(from, to);
    }
  
    function playerMove(from, to, promotion) {
      const move = game.move({ from, to, promotion });
      if (!move) return;
      stopTimer();
      selected = null; legal = []; promoMove = null;
      el.promo.hidden = true;
      if (game.game_over()) { finishGame(); render(); return; }
      render();
      engineMove();
    }
  
    /* ---------- Stockfish (UCI) ---------- */
    function tryWorker(src) {
      return new Promise((resolve, reject) => {
        let w;
        try {
          const abs = new URL(src, location.href).href;
          const blob = new Blob([`importScripts(${JSON.stringify(abs)});`], { type: 'text/javascript' });
          w = new Worker(URL.createObjectURL(blob));
        } catch (e) { reject(e); return; }
        const timer = setTimeout(() => { w.terminate(); reject(new Error('tiempo de espera agotado')); }, 10000);
        w.onerror = () => { clearTimeout(timer); w.terminate(); reject(new Error('no se pudo cargar')); };
        w.onmessage = (e) => {
          if (String(e.data).includes('uciok')) { clearTimeout(timer); resolve(w); }
        };
        w.postMessage('uci');
      });
    }
  
    async function loadEngine() {
      const errors = [];
      for (const src of ENGINE_SOURCES) {
        try { return await tryWorker(src); } catch (e) { errors.push(`${src} (${e.message})`); }
      }
      throw new Error(errors.join(' · '));
    }
  
    function engineMove() {
      if (!engine || thinking || isOver() || game.turn() === humanColor) return;
      thinking = true;
      pending = { gameId, fen: game.fen() };
      outstanding++;
      engine.postMessage('setoption name Skill Level value ' + SEARCH.skill);
      engine.postMessage('position fen ' + pending.fen);
      engine.postMessage(`go depth ${SEARCH.depth} movetime ${SEARCH.time}`);
      render();
    }
  
    function onEngineMessage(e) {
      const line = String(e.data);
      if (!line.startsWith('bestmove')) return;
      outstanding = Math.max(0, outstanding - 1);
      if (outstanding > 0 || !pending) return; // respuesta de una búsqueda cancelada
      const p = pending;
      pending = null;
      if (p.gameId !== gameId || p.fen !== game.fen() || game.turn() === humanColor) return;
      thinking = false;
      const mv = line.split(/\s+/)[1] || '';
      const move = /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(mv)
        ? game.move({ from: mv.slice(0, 2), to: mv.slice(2, 4), promotion: mv[4] })
        : null;
      if (!move) {
        engineError = `Stockfish devolvió una jugada no válida («${mv || 'ninguna'}»). Pulsa «Reiniciar partida» para continuar.`;
      } else if (game.game_over()) {
        finishGame();
      }
      render();
      beginHumanTurn();
    }
  
    /* ---------- Controles ---------- */
    function newGame() {
      gameId++;
      endReason = null; stopTimer();
      if (engine && outstanding > 0) engine.postMessage('stop');
      if (engine) engine.postMessage('ucinewgame');
      pending = null; thinking = false; promoMove = null;
      selected = null; legal = [];
      if (engine) engineError = null;
      humanColor = el.side.value;
      flipped = humanColor === 'b'; // el jugador siempre ve sus piezas abajo
      game = new Chess();
      el.promo.hidden = true;
      el.resultCard.hidden = true;
      render();
      engineMove(); // si juegas con negras, la computadora abre la partida
      beginHumanTurn();
    }
  
    el.board.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-sq]');
      if (b) onSquare(b.dataset.sq);
    });
    el.promo.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b || !promoMove) return;
      const { from, to } = promoMove;
      if (!b.dataset.p) { promoMove = null; el.promo.hidden = true; render(); return; }
      playerMove(from, to, b.dataset.p);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && promoMove) { promoMove = null; el.promo.hidden = true; render(); }
    });
    el.btnReset.addEventListener('click', newGame);
    el.side.addEventListener('change', newGame);
    el.btnFlip.addEventListener('click', () => { flipped = !flipped; render(); });
  
    /* ---------- Inicio ---------- */
    render();
    loadEngine().then((w) => {
      engine = w;
      engine.onmessage = onEngineMessage;
      engine.onerror = () => {
        engineError = 'El motor Stockfish dejó de responder. Recarga la página.';
        thinking = false;
        render();
      };
      engine.postMessage('ucinewgame');
      render();
      engineMove();
      beginHumanTurn();
    }).catch((err) => {
      engineError = 'No se pudo cargar Stockfish. Recursos probados: ' + err.message +
        '. Cómo corregirlo: abre el proyecto con un servidor local (python3 -m http.server 8000 y luego http://localhost:8000), ' +
        'comprueba tu conexión a internet o coloca stockfish.js (Stockfish.js 10, un solo archivo) en la carpeta js.';
      render();
    });
  })();
  