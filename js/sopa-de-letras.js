
/**
 * Sopa de Letras - Juego Interactivo
 */

const CONFIG = {
    gridSize: 10,
    words: [
        'JAVASCRIPT', 'INTERNET', 'CÓDIGO', 'ALGORITMO',
        'ESTRUCTURA', 'WEB', 'SISTEMA', 'DATOS',
        'LOGICA', 'SOFTWARE', 'HARDWARE', 'NUBE',
        'REDES', 'MEMORIA', 'PIXEL', 'BINARIO'
    ],
    pointsPerWin: 20,
    pointsPerLoss: -20
};

let gameState = {
    grid: [],
    wordsToFind: [],
    foundWords: [],
    selectedCells: [],
    timer: null,
    timeLeft: 0,
    isGameActive: false,
    currentPoints: 0
};

// Sistema de puntos


// Elementos HTML
const elements = {
    setup: document.getElementById('setup'),
    gameContainer: document.getElementById('game-container'),
    timeLimitSelect: document.getElementById('time-limit'),
    startGameBtn: document.getElementById('start-game-btn'),
    gridElement: document.getElementById('letter-grid'),
    wordListElement: document.getElementById('word-list'),
    timerElement: document.getElementById('timer'),
    pointsElement: document.getElementById('current-points'),
    resetBtn: document.getElementById('reset-btn'),
    backBtn: document.getElementById('back-btn'),

    // Aviso integrado en la página, sin popup
    gameResult: document.getElementById('game-result'),
    modalTitle: document.getElementById('modal-title'),
    modalMessage: document.getElementById('modal-message'),
    modalBtn: document.getElementById('modal-btn')
};

// Inicialización
function init() {
    elements.startGameBtn.addEventListener('click', startGame);
    elements.resetBtn.addEventListener('click', resetGame);

    elements.backBtn.addEventListener('click', () => {
        gameState.currentPoints = 0;
        window.location.href = '../index.html';
    });

    // El botón del resultado permite volver a jugar
    elements.modalBtn.addEventListener('click', resetGame);

    gameState.currentPoints = Perfil.leer().puntos;
    updatePointsDisplay();

    // El aviso permanece oculto al cargar la página
    elements.gameResult.classList.add('hidden');
}

function startGame() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }

    gameState.timer = null;
    gameState.timeLeft = parseInt(elements.timeLimitSelect.value, 10);
    gameState.isGameActive = true;
    gameState.foundWords = [];
    gameState.selectedCells = [];
    isSelecting = false;

    // Elegir seis palabras aleatorias
    gameState.wordsToFind = shuffle([...CONFIG.words]).slice(0, 6);

    generateGrid();
    renderGrid();
    renderWordList();

    elements.gameResult.classList.add('hidden');
    elements.setup.classList.add('hidden');
    elements.gameContainer.classList.remove('hidden');

    startTimer();
}

function startTimer() {
    elements.timerElement.textContent = gameState.timeLeft;

    gameState.timer = setInterval(() => {
        if (!gameState.isGameActive) return;

        gameState.timeLeft--;
        elements.timerElement.textContent = gameState.timeLeft;

        if (gameState.timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

// Generación de la cuadrícula
function generateGrid() {
    gameState.grid = Array(CONFIG.gridSize)
        .fill(null)
        .map(() => Array(CONFIG.gridSize).fill(''));

    gameState.wordsToFind.forEach(word => {
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 100) {
            attempts++;

            const direction = getRandomDirection();
            const row = Math.floor(Math.random() * CONFIG.gridSize);
            const col = Math.floor(Math.random() * CONFIG.gridSize);

            if (canPlaceWord(word, row, col, direction)) {
                placeWord(word, row, col, direction);
                placed = true;
            }
        }
    });

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let r = 0; r < CONFIG.gridSize; r++) {
        for (let c = 0; c < CONFIG.gridSize; c++) {
            if (gameState.grid[r][c] === '') {
                gameState.grid[r][c] =
                    letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
}

function getRandomDirection() {
    const directions = [
        { r: 0, c: 1 },
        { r: 1, c: 0 },
        { r: 1, c: 1 },
        { r: -1, c: 1 }
    ];

    return directions[Math.floor(Math.random() * directions.length)];
}

function canPlaceWord(word, row, col, dir) {
    for (let i = 0; i < word.length; i++) {
        const nr = row + i * dir.r;
        const nc = col + i * dir.c;

        if (
            nr < 0 || nr >= CONFIG.gridSize ||
            nc < 0 || nc >= CONFIG.gridSize
        ) {
            return false;
        }

        if (
            gameState.grid[nr][nc] !== '' &&
            gameState.grid[nr][nc] !== word[i]
        ) {
            return false;
        }
    }

    return true;
}

function placeWord(word, row, col, dir) {
    for (let i = 0; i < word.length; i++) {
        gameState.grid[row + i * dir.r][col + i * dir.c] =
            word[i].toUpperCase();
    }
}

function renderGrid() {
    elements.gridElement.innerHTML = '';

    for (let r = 0; r < CONFIG.gridSize; r++) {
        for (let c = 0; c < CONFIG.gridSize; c++) {
            const cell = document.createElement('div');

            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.textContent = gameState.grid[r][c];

            cell.addEventListener('mousedown', () => startSelection(r, c));
            cell.addEventListener('mouseover', () => updateSelection(r, c));
            cell.addEventListener('mouseup', endSelection);

            elements.gridElement.appendChild(cell);
        }
    }
}

function renderWordList() {
    elements.wordListElement.innerHTML = '';

    gameState.wordsToFind.forEach(word => {
        const li = document.createElement('li');

        li.textContent = word;
        li.id = `word-${word}`;

        elements.wordListElement.appendChild(li);
    });
}

// Selección de palabras
let isSelecting = false;

function startSelection(r, c) {
    if (!gameState.isGameActive) return;

    isSelecting = true;
    gameState.selectedCells = [{ r, c }];

    updateSelectionVisuals();
}

function updateSelection(r, c) {
    if (!isSelecting || !gameState.isGameActive) return;

    if (!gameState.selectedCells.some(cell => cell.r === r && cell.c === c)) {
        gameState.selectedCells.push({ r, c });
    }

    updateSelectionVisuals();
}

function endSelection() {
    if (!isSelecting) return;

    isSelecting = false;

    if (!gameState.isGameActive) {
        gameState.selectedCells = [];
        updateSelectionVisuals();
        return;
    }

    const selectedWord = gameState.selectedCells
        .map(cell => gameState.grid[cell.r][cell.c])
        .join('');

    const reversedWord = selectedWord.split('').reverse().join('');

    const foundWord = gameState.wordsToFind.find(word =>
        word === selectedWord || word === reversedWord
    );

    if (foundWord && !gameState.foundWords.includes(foundWord)) {
        markWordAsFound(foundWord);
    }

    gameState.selectedCells = [];
    updateSelectionVisuals();
}

function updateSelectionVisuals() {
    const cells = document.querySelectorAll('.cell');

    cells.forEach(cell => {
        const r = parseInt(cell.dataset.row, 10);
        const c = parseInt(cell.dataset.col, 10);

        if (gameState.selectedCells.some(selected =>
            selected.r === r && selected.c === c
        )) {
            cell.classList.add('selected');
        } else {
            cell.classList.remove('selected');
        }
    });
}

function markWordAsFound(word) {
    if (gameState.foundWords.includes(word)) return;

    gameState.foundWords.push(word);

    const cells = document.querySelectorAll('.cell');

    cells.forEach(cell => {
        const selected = gameState.selectedCells.some(selectedCell => {
            const r = parseInt(cell.dataset.row, 10);
            const c = parseInt(cell.dataset.col, 10);

            return selectedCell.r === r && selectedCell.c === c;
        });

        if (selected) {
            cell.classList.add('found');
        }
    });

    const listItem = document.getElementById(`word-${word}`);

    if (listItem) {
        listItem.classList.add('found');
    }

    if (gameState.foundWords.length === gameState.wordsToFind.length) {
        endGame(true);
    }
}

// Fin de la partida: muestra un aviso normal en la página
function endGame(won) {
    if (!gameState.isGameActive) return;

    gameState.isGameActive = false;
    isSelecting = false;

    clearInterval(gameState.timer);
    gameState.timer = null;

    const title = won ? '¡Victoria!' : '¡Tiempo agotado!';
    const message = won
        ? 'Has encontrado todas las palabras.'
        : 'No has logrado encontrar todas las palabras a tiempo.';

    const points = won ? CONFIG.pointsPerWin : CONFIG.pointsPerLoss;

    gameState.currentPoints = Perfil.sumarPuntos(points);
    updatePointsDisplay();

    elements.modalTitle.textContent = title;
    elements.modalMessage.textContent =
        `${message} ${points > 0 ? 'Ganaste' : 'Perdiste'} ${Math.abs(points)} puntos.`;

    // Mostrar el resultado dentro de la página
    elements.gameResult.classList.remove('hidden');

    elements.gameResult.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
    });
}

// Volver a la configuración para jugar otra partida
function resetGame() {
    clearInterval(gameState.timer);

    gameState.timer = null;
    gameState.isGameActive = false;
    isSelecting = false;
    gameState.selectedCells = [];

    elements.gameResult.classList.add('hidden');
    elements.gameContainer.classList.add('hidden');
    elements.setup.classList.remove('hidden');

    elements.gridElement.innerHTML = '';
    elements.wordListElement.innerHTML = '';
}

function updatePointsDisplay() {
    elements.pointsElement.textContent = gameState.currentPoints;
}

// Utilidades
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

// Permite finalizar la selección aunque se suelte el ratón fuera de la cuadrícula
window.addEventListener('mouseup', endSelection);

// Inicializar
init();
