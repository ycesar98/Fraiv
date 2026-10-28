const cells = document.querySelectorAll('.celda');
const statusElement = document.getElementById('status');
const userWinsElement = document.getElementById('victorias-usuario');
const aiWinsElement = document.getElementById('victorias-ordenador');
const resetButton = document.getElementById('reset-btn');

let board = ["", "", "", "", "", "", "", "", ""];
let gameActive = true;
let userTurn = false;
let userWins = 0;
let aiWins = 0;
let aiTimer = null;
let roundTimer = null;

const USER_SYMBOL = "X";
const AI_SYMBOL = "O";

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Filas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columnas
    [0, 4, 8], [2, 4, 6]             // Diagonales
];

function initGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    gameActive = true;
    cells.forEach((cell, index) => {
        cell.innerText = "";
        cell.disabled = false;
        cell.setAttribute('aria-label', `Casilla ${index + 1} vacía`);
    });

    const userStarts = Math.random() < 0.5;
    if (userStarts) {
        userTurn = true;
        statusElement.innerText = "Tu turno (X)";
    } else {
        userTurn = false;
        statusElement.innerText = "El ordenador está empezando...";
        aiTimer = setTimeout(aiMove, 600);
    }
}

function handleCellClick(e) {
    const clickedCell = e.target;
    const index = Number(clickedCell.getAttribute('data-index'));

    if (!gameActive || !userTurn || board[index] !== "") return;

    userTurn = false;
    makeMove(index, USER_SYMBOL);

    if (gameActive) {
        statusElement.innerText = "El ordenador está pensando...";
        aiTimer = setTimeout(aiMove, 500);
    }
}

function makeMove(index, symbol) {
    board[index] = symbol;
    cells[index].innerText = symbol;
    cells[index].setAttribute('aria-label', `Casilla ${index + 1}: ${symbol}`);

    checkResult();
}

function aiMove() {
    if (!gameActive) return;

    let move = null;

    const isIntelligent = Math.random() < 0.85;

    if (isIntelligent) {
        // 1. Intentar ganar inmediatamente
        move = findBestMove(AI_SYMBOL);
        // 2. Bloquear al usuario para que no gane
        if (move === null) {
            move = findBestMove(USER_SYMBOL);
        }
    }

    // 3. Priorizar centro (siempre que esté vacío)
    if (move === null && board[4] === "") {
        move = 4;
    }

    // 4. Moverse a una esquina o espacio vacío aleatoriamente
    if (move === null) {
        const availableMoves = board.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
        if (availableMoves.length > 0) {
            move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
    }

    if (move !== null) {
        makeMove(move, AI_SYMBOL);
        if (gameActive) {
            userTurn = true;
            statusElement.innerText = "Tu turno (X)";
        }
    }
}

function findBestMove(symbol) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        const values = [board[a], board[b], board[c]];
        const symbolCount = values.filter(v => v === symbol).length;
        const emptyCount = values.filter(v => v === "").length;

        if (symbolCount === 2 && emptyCount === 1) {
            if (board[a] === "") return a;
            if (board[b] === "") return b;
            if (board[c] === "") return c;
        }
    }
    return null;
}

function checkResult() {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            finishRound(board[a]);
            return;
        }
    }

    if (!board.includes("")) {
        finishRound(null);
    }
}

function finishRound(winner) {
    gameActive = false;
    userTurn = false;
    cells.forEach(cell => { cell.disabled = true; });

    let seriesEnded = false;
    if (winner === USER_SYMBOL) {
        userWins++;
        statusElement.innerText = "¡Has ganado la ronda!";
        seriesEnded = userWins === 3;
    } else if (winner === AI_SYMBOL) {
        aiWins++;
        statusElement.innerText = "El ordenador ha ganado la ronda.";
        seriesEnded = aiWins === 3;
    } else {
        statusElement.innerText = "¡Empate! La serie continúa.";
    }

    updateSeriesScore();
    if (seriesEnded) {
        const userWonSeries = userWins === 3;
        statusElement.innerText = userWonSeries
            ? "¡Has ganado la serie! +10 puntos."
            : "El ordenador ha ganado la serie. −10 puntos.";
        Perfil.sumarPuntos(userWonSeries ? 10 : -10);
    }

    roundTimer = setTimeout(() => {
        if (seriesEnded) {
            userWins = 0;
            aiWins = 0;
            updateSeriesScore();
        }
        initGame();
    }, 3000);
}

function updateSeriesScore() {
    userWinsElement.innerText = userWins;
    aiWinsElement.innerText = aiWins;
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', () => {
    clearTimeout(aiTimer);
    clearTimeout(roundTimer);
    userWins = 0;
    aiWins = 0;
    updateSeriesScore();
    initGame();
});

updateSeriesScore();
initGame();