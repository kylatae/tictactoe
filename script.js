const cells = document.querySelectorAll('.cell');
const statusText = document.querySelector('.status');
const resetBtn = document.querySelector('.reset');
const xWinsElement = document.querySelector('.x-wins');
const oWinsElement = document.querySelector('.o-wins');
const tiesElement = document.querySelector('.ties-count');
let currentPlayer = 'X';
let gameActive = true;
const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

loadScores();

function saveScores() {
  localStorage.setItem('xWins', xWinsElement.textContent);
  localStorage.setItem('oWins', oWinsElement.textContent);
  localStorage.setItem('ties', tiesElement.textContent);
}

function loadScores() {
  const storedXWins = localStorage.getItem('xWins');
  const storedOWins = localStorage.getItem('oWins');
  const storedTies = localStorage.getItem('ties');

  if (storedXWins) xWinsElement.textContent = storedXWins;
  if (storedOWins) oWinsElement.textContent = storedOWins;
  if (storedTies) tiesElement.textContent = storedTies;
}

cells.forEach(cell => {
    cell.addEventListener('click', handleClick);
});

function handleClick() {
    if (!gameActive || this.textContent !== '') return;

  this.textContent = currentPlayer;

  checkWin();
  checkDraw();
  changePlayer();
  if (gameActive) {
    makeCPUMove(); // Make the CPU move after the player's turn
  }
}

function checkWin() {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (cells[a].textContent === currentPlayer &&
            cells[b].textContent === currentPlayer &&
            cells[c].textContent === currentPlayer) {
            statusText.textContent = `${currentPlayer} wins!`;
            if (currentPlayer === 'X') {
              xWinsElement.textContent++;
              fireConfetti();
            } else {
              oWinsElement.textContent++;
            }
            saveScores()
            gameActive = false;
            return;
        }
    }
}


function checkDraw() {
  // If all cells have been filled (no empty cells left), it's a draw
  const allCellsFilled = Array.from(cells).every(cell => cell.textContent !== '');
  if (!gameActive) return;
  if (allCellsFilled) {
    // Declare draw, update game status, etc.
    statusText.textContent = `It's a draw!`;
    tiesElement.textContent++;
    saveScores()
    gameActive = false;
    return;
  }
}

function changePlayer() {
  if (!gameActive) return;
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  statusText.textContent = `${currentPlayer}'s turn`;
}

async function makeCPUMove() {
  // Disable the board
  cells.forEach(cell => {
    cell.style.pointerEvents = 'none';
  });

  // Delay for 1 second
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 1. Check if the CPU can win with the next move
  const winningMove = checkForWinningMove('O');
  if (winningMove) {
    winningMove.textContent = 'O';
    processTurn();
    return;
  }

  // 2. Check if the player is about to win and block if possible
  const blockingMove = checkForWinningMove('X');
  if (blockingMove) {
    blockingMove.textContent = 'O';
    processTurn();
    return;
  }

  // 3. If no immediate win or block, make a random move
  const emptyCells = Array.from(cells).filter(cell => cell.textContent === '');
  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  emptyCells[randomIndex].textContent = 'O';
  processTurn();
}

function processTurn(){
  checkWin();
  checkDraw();
  changePlayer();

  cells.forEach(cell => {
    cell.style.pointerEvents = '';
  });
}


function checkForWinningMove(player) {
  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    if (cells[a].textContent === player && cells[b].textContent === player && cells[c].textContent === '') {
      return cells[c]; // Return the empty cell to win
    }
    if (cells[a].textContent === player && cells[c].textContent === player && cells[b].textContent === '') {
      return cells[b]; // Return the empty cell to win
    }
    if (cells[c].textContent === player && cells[b].textContent === player && cells[a].textContent === '') {
      return cells[a]; // Return the empty cell to win
    }
  }

  return null; // No winning move found
}


resetBtn.addEventListener('click', resetGame);

function resetGame() {
  cells.forEach(cell => {
    cell.textContent = '';
  });
  currentPlayer = 'X'; // Or whoever you want to start the game
  statusText.textContent = `Current Player: ${currentPlayer}`;
  gameActive = true;
}


function fireConfetti() {
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
  }, 250);

}