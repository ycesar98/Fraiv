/**
 * Sopa de Letras - Juego Interactivo
 */

const CONFIG = {
    gridSize: 10,
    words: ['JAVASCRIPT', 'INTERNET', 'CÓDIGO', 'ALGORITMO', 'ESTRUCTURA', 'WEB', 'SISTEMA', 'DATOS', 'LOGICA', 'SOFTWARE', 'HARDWARE', 'NUBE', 'REDIES', 'MEMORIA', 'PIXEL', 'BINARIO'],
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

// Mock User System (since we don't have the main page yet)
const userSystem = {
    points: 0,
    updatePoints(amount) {
        this.points += amount;
        console.log(`Puntos actualizados. Total: ${this.points}`);
        localStorage.setItem('userPoints', this.points);
    },
    getPoints() {
        return parseInt(localStorage.getItem('userPoints')) || 0;
    }
};

// DOM Elements
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
    overlay: document.getElementById('overlay'),
    modalTitle: document.getElementById('modal-title'),
    modalMessage: document.getElementById('modal-message'),
    modalBtn: document.getElementById('modal-btn')
};

// --- Initialization ---

function init() {
    elements.startGameBtn.addEventListener('click', startGame);
    elements.resetBtn.addEventListener('click', resetGame);
    elements.backBtn.addEventListener('click', () => {
        // Reset internal session points before leaving
        gameState.currentPoints = 0;
        updatePointsDisplay();
        window.location.href = '../index.html';
    });
    elements.modalBtn.addEventListener('click', () => {
        elements.overlay.classList.add('hidden');
    });

    // Load initial points
    gameState.currentPoints = 0; // Session points start at 0
    updatePointsDisplay();
}

function startGame() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }

    const limit = parseInt(elements.timeLimitSelect.value);
    gameState.timeLeft = limit;
    gameState.isGameActive = true;
    gameState.foundWords = [];
    gameState.selectedCells = [];

    // Pick 5-8 random words from the list
    gameState.wordsToFind = shuffle([...CONFIG.words]).slice(0, 6);

    generateGrid();
    renderGrid();
    renderWordList();

    elements.setup.classList.add('hidden');
    elements.gameContainer.classList.remove('hidden');

    startTimer();
}

function startTimer() {
    elements.timerElement.textContent = gameState.timeLeft;
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        elements.timerElement.textContent = gameState.timeLeft;

        if (gameState.timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

// --- Grid Logic ---

function generateGrid() {
    // Create empty grid
    gameState.grid = Array(CONFIG.gridSize).fill(null).map(() =>
        Array(CONFIG.gridSize).fill('')
    );

    // Place words
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

    // Fill remaining cells with random letters
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < CONFIG.gridSize; r++) {
        for (let c = 0; c < CONFIG.gridSize; c++) {
            if (gameState.grid[r][c] === '') {
                gameState.grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
}

function getRandomDirection() {
    const directions = [
        { r: 0, c: 1 },   // Horizontal
        { r: 1, c: 0 },   // Vertical
        { r: 1, c: 1 },   // Diagonal Down-Right
        { r: -1, c: 1 },  // Diagonal Up-Right
    ];
    return directions[Math.floor(Math.random() * directions.length)];
}

function canPlaceWord(word, row, col, dir) {
    for (let i = 0; i < word.length; i++) {
        const nr = row + i * dir.r;
        const nc = col + i * dir.c;
        if (nr < 0 || nr >= CONFIG.gridSize || nc < 0 || nc >= CONFIG.gridSize) return false;
        if (gameState.grid[nr][nc] !== '' && gameState.grid[nr][nc] !== word[i]) return false;
    }
    return true;
}

function placeWord(word, row, col, dir) {
    for (let i = 0; i < word.length; i++) {
        gameState.grid[row + i * dir.r][col + i * dir.c] = word[i].toUpperCase();
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

// --- Interaction ---

let isSelecting = false;
function startSelection(r, c) {
    if (!gameState.isGameActive) return;
    isSelecting = true;
    gameState.selectedCells = [{ r, c }];
    updateSelectionVisuals();
}

function updateSelection(r, c) {
    if (!isSelecting) return;

    // Avoid duplicates and ensure continuity (simple path for this version)
    if (!gameState.selectedCells.some(cell => cell.r === r && cell.c === c)) {
        gameState.selectedCells.push({ r, c });
    }
    updateSelectionVisuals();
}

function endSelection() {
    if (!isSelecting) return;
    isSelecting = false;

    const selectedWord = gameState.selectedCells.map(cell =>
        gameState.grid[cell.r][cell.c]
    ).join('');

    const reversedWord = selectedWord.split('').reverse().join('');

    const foundWord = gameState.wordsToFind.find(w =>
        w === selectedWord || w === reversedWord
    );

    if (foundWord) {
        markWordAsFound(foundWord);
    }

    gameState.selectedCells = [];
    updateSelectionVisuals();
}

function updateSelectionVisuals() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);
        if (gameState.selectedCells.some(cellS => cellS.r === r && cellS.c === c)) {
            cell.classList.add('selected');
        } else {
            cell.classList.remove('selected');
        }
    });
}

function markWordAsFound(word) {
    gameState.foundWords.push(word);

    // Mark cells as found
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        if (gameState.selectedCells.some(cellS => {
            const r = parseInt(cell.dataset.row);
            const c = parseInt(cell.dataset.col);
            return cellS.r === r && cellS.c === c;
        })) {
            cell.classList.add('found');
        }
    });

    // Update word list
    const li = document.getElementById(`word-${word}`);
    if (li) li.classList.add('found');

    updateSelectionVisuals();

    if (gameState.foundWords.length === gameState.wordsToFind.length) {
        endGame(true);
    }
}

function endGame(won) {
    gameState.isGameActive = false;
    clearInterval(gameState.timer);

    const title = won ? '¡Victoria!' : '¡Tiempo Agotado!';
    const message = won ? 'Has encontrado todas las palabras.' : 'No has logrado encontrar todas las palabras a tiempo.';
    const points = won ? CONFIG.pointsPerWin : CONFIG.pointsPerLoss;

    userSystem.updatePoints(points);
    gameState.currentPoints = userSystem.getPoints();
    updatePointsDisplay();

    elements.modalTitle.textContent = title;
    elements.modalMessage.textContent = `${message} ${points > 0 ? 'Ganaste' : 'Perdiste'} ${Math.abs(points)} puntos.`;
    elements.overlay.classList.remove('hidden');
}

function resetGame() {
    clearInterval(gameState.timer);
    gameState.isGameActive = false;
    gameState.selectedCells = [];

    elements.gameContainer.classList.add('hidden');
    elements.setup.classList.remove('hidden');
}

function updatePointsDisplay() {
    elements.pointsElement.textContent = gameState.currentPoints;
}

// Utils
function shuffle(array) {
    for (let i = array.length; i > 0; i--) {
        const j = Math.floor(Math.random() * (i - 1));
        [array[i - 1], array[j]] = [array[j], array[i - 1]];
    }
    return array;
}

// Global listener for mouseup to handle selection outside grid
window.addEventListener('mouseup', endSelection);

// Initialize the app
init();
