const cells = document.querySelectorAll(".cell");
const statusText = document.querySelector("#status-text");
const singlePlayerBtn = document.querySelector("#single-player-btn");
const multiplayerBtn = document.querySelector("#multiplayer-btn");
const resetScoresBtn = document.querySelector("#reset-scores-btn");
const winsDisplay = document.querySelector("#wins");
const lossesDisplay = document.querySelector("#losses");
const drawsDisplay = document.querySelector("#draws");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = false;
let singlePlayerMode = false;
let scores = { wins: 0, losses: 0, draws: 0 };

if (localStorage.getItem("scores")) {
    scores = JSON.parse(localStorage.getItem("scores"));
    updateScoreboard();
}

function initializeGame() {
    cells.forEach(cell => cell.addEventListener("click", cellClicked));
    singlePlayerBtn.addEventListener("click", () => startGame(true));
    multiplayerBtn.addEventListener("click", () => startGame(false));
    resetScoresBtn.addEventListener("click", resetScores);
}

function startGame(isSinglePlayer) {
    singlePlayerMode = isSinglePlayer;
    board = ["", "", "", "", "", "", "", "", ""];
    gameActive = true;
    currentPlayer = "X";
    statusText.textContent = `${currentPlayer}'s turn`;
    cells.forEach(cell => cell.textContent = "");
}

function cellClicked() {
    const cellIndex = this.getAttribute("data-index");

    if (board[cellIndex] !== "" || !gameActive) return;

    board[cellIndex] = currentPlayer;
    this.textContent = currentPlayer;

    if (checkWin()) {
        endGame(`${currentPlayer} wins!`);
        updateScores(currentPlayer === "X" ? "wins" : "losses");
    } else if (board.every(cell => cell !== "")) {
        endGame("It's a draw!");
        updateScores("draws");
    } else {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusText.textContent = `${currentPlayer}'s turn`;

        if (singlePlayerMode && currentPlayer === "O") {
            aiMove();
        }
    }
}

function checkWin() {
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], 
        [0, 3, 6], [1, 4, 7], [2, 5, 8], 
        [0, 4, 8], [2, 4, 6]           
    ];

    return winConditions.some(condition => {
        return condition.every(index => board[index] === currentPlayer);
    });
}


function endGame(message) {
    statusText.textContent = message;
    gameActive = false;
}

function aiMove() {
    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = "O";
            let score = minimax(board, 0, false);
            board[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    board[move] = "O";
    document.querySelector(`[data-index="${move}"]`).textContent = "O";

    if (checkWin()) {
        endGame("O wins!");
        updateScores("losses");
    } else if (board.every(cell => cell !== "")) {
        endGame("It's a draw!");
        updateScores("draws");
    } else {
        currentPlayer = "X";
        statusText.textContent = `${currentPlayer}'s turn`;
    }
}

function minimax(board, depth, isMaximizing) {
    if (checkWin()) return isMaximizing ? -10 : 10;
    if (board.every(cell => cell !== "")) return 0;

    let bestScore = isMaximizing ? -Infinity : Infinity;
    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = isMaximizing ? "O" : "X";
            let score = minimax(board, depth + 1, !isMaximizing);
            board[i] = "";
            bestScore = isMaximizing ? Math.max(score, bestScore) : Math.min(score, bestScore);
        }
    }
    return bestScore;
}


function updateScores(result) {
    scores[result]++;
    localStorage.setItem("scores", JSON.stringify(scores));
    updateScoreboard();
}

function updateScoreboard() {
    winsDisplay.textContent = scores.wins;
    lossesDisplay.textContent = scores.losses;
    drawsDisplay.textContent = scores.draws;
}

function resetScores() {
    scores = { wins: 0, losses: 0, draws: 0 };
    localStorage.setItem("scores", JSON.stringify(scores));
    updateScoreboard();
}

initializeGame();