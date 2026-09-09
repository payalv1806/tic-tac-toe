const boxes = document.querySelectorAll(".box");
const resetBtn = document.querySelector("#reset-btn");
const newGameBtn = document.querySelector("#new-btn");
const msgContainer = document.querySelector(".msg-container");
const msg = document.querySelector("#msg");

// Mode selection & Matchup UI elements
const startModal = document.querySelector("#start-modal");
const modeAiCard = document.querySelector("#mode-ai-card");
const modeFriendCard = document.querySelector("#mode-friend-card");
const changeModeBtn = document.querySelector("#change-mode-btn");
const modeBadgeText = document.querySelector("#mode-badge-text");

const p1Card = document.querySelector("#player1-card");
const p2Card = document.querySelector("#player2-card");
const p1Name = document.querySelector("#p1-name");
const p2Name = document.querySelector("#p2-name");
const p1Avatar = document.querySelector("#p1-avatar");
const p2Avatar = document.querySelector("#p2-avatar");
const p1Status = document.querySelector("#p1-status");
const p2Status = document.querySelector("#p2-status");

// Streak & Difficulty UI elements
const streakContainer = document.querySelector("#streak-container");
const currentStreakElem = document.querySelector("#current-streak");
const bestStreakElem = document.querySelector("#best-streak");
const difficultyContainer = document.querySelector("#difficulty-container");
const diffBtns = document.querySelectorAll(".diff-btn");

let isVsComputer = true;
let turnO = true; // true: Player O, false: Player X
let count = 0;
let isGameOver = false;
let isAiThinking = false;

// Persistent state
let currentDifficulty = localStorage.getItem("ttt_difficulty") || "medium";
let currentStreak = parseInt(localStorage.getItem("ttt_current_streak") || "0", 10);
let bestStreak = parseInt(localStorage.getItem("ttt_best_streak") || "0", 10);

const winPatterns = [
  [0, 1, 2],
  [0, 3, 6],
  [0, 4, 8],
  [1, 4, 7],
  [2, 5, 8],
  [2, 4, 6],
  [3, 4, 5],
  [6, 7, 8],
];

// Update Win Streak Display
const updateStreakDisplay = () => {
  currentStreakElem.innerText = currentStreak;
  bestStreakElem.innerText = bestStreak;
};

// Switch Active Difficulty
const setDifficulty = (level) => {
  currentDifficulty = level;
  localStorage.setItem("ttt_difficulty", level);
  diffBtns.forEach((btn) => {
    if (btn.getAttribute("data-level") === level) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
};

// Switch Mode (Computer AI vs 2 Players)
const setMode = (vsComputer) => {
  isVsComputer = vsComputer;
  startModal.classList.add("hide");

  if (isVsComputer) {
    document.body.classList.add("mode-computer");
    document.body.classList.remove("mode-pvp");
    modeBadgeText.innerText = "🤖 Cyber AI Match";
    p1Name.innerText = "You";
    p1Avatar.innerText = "👤";
    p2Name.innerText = "Cyber AI";
    p2Avatar.innerText = "🤖";
    streakContainer.classList.remove("hide");
    difficultyContainer.classList.remove("hide");
  } else {
    document.body.classList.add("mode-pvp");
    document.body.classList.remove("mode-computer");
    modeBadgeText.innerText = "👥 2 Players Match";
    p1Name.innerText = "Player 1";
    p1Avatar.innerText = "👤";
    p2Name.innerText = "Player 2";
    p2Avatar.innerText = "👥";
    streakContainer.classList.add("hide");
    difficultyContainer.classList.add("hide");
  }

  resetGame();
};

// Update active turn badges and cards
const updateStatus = () => {
  if (isGameOver) {
    p1Card.classList.remove("active-turn");
    p2Card.classList.remove("active-turn", "thinking");
    return;
  }

  if (turnO) {
    p1Card.classList.add("active-turn");
    p2Card.classList.remove("active-turn", "thinking");
    p1Status.innerText = isVsComputer ? "Your Turn" : "Turn";
    p2Status.innerText = "Waiting";
  } else {
    p1Card.classList.remove("active-turn");
    p2Card.classList.add("active-turn");
    p1Status.innerText = "Waiting";

    if (isVsComputer && isAiThinking) {
      p2Card.classList.add("thinking");
      p2Status.innerText = "Thinking...";
    } else {
      p2Card.classList.remove("thinking");
      p2Status.innerText = "Turn";
    }
  }
};

const disableBoxes = () => {
  boxes.forEach((box) => {
    box.disabled = true;
  });
};

const enableBoxes = () => {
  boxes.forEach((box) => {
    box.disabled = false;
    box.innerText = "";
    box.classList.remove("box-o", "box-x");
  });
};

const gameDraw = () => {
  isGameOver = true;
  msg.innerText = isVsComputer ? "🤝 It's a Draw!" : "Game was a Draw.";
  msgContainer.classList.remove("hide");
  disableBoxes();
  updateStatus();
};

const showWinner = (winner) => {
  isGameOver = true;
  if (isVsComputer) {
    if (winner === "O") {
      currentStreak++;
      if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
        localStorage.setItem("ttt_best_streak", bestStreak);
      }
      localStorage.setItem("ttt_current_streak", currentStreak);
      updateStreakDisplay();

      const streakNote = currentStreak > 1 ? ` 🔥 ${currentStreak} Win Streak!` : "";
      msg.innerText = `🎉 Congratulations, You Won!${streakNote}`;
    } else {
      currentStreak = 0;
      localStorage.setItem("ttt_current_streak", currentStreak);
      updateStreakDisplay();
      msg.innerText = "🤖 Cyber AI Won! Better luck next time!";
    }
  } else {
    msg.innerText = `Congratulations, winner is ${winner}`;
  }
  msgContainer.classList.remove("hide");
  disableBoxes();
  updateStatus();
};

const checkWinner = () => {
  for (const pattern of winPatterns) {
    const pos1Val = boxes[pattern[0]].innerText;
    const pos2Val = boxes[pattern[1]].innerText;
    const pos3Val = boxes[pattern[2]].innerText;

    if (pos1Val !== "" && pos1Val === pos2Val && pos2Val === pos3Val) {
      showWinner(pos1Val);
      return true;
    }
  }
  return false;
};

// Check for 2-in-a-row opportunity to either win or block
const findWinningSpot = (boardArray, symbol) => {
  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    const vals = [boardArray[a], boardArray[b], boardArray[c]];
    const symbolMatches = vals.filter((val) => val === symbol).length;
    const emptyMatches = vals.filter((val) => val === "").length;

    if (symbolMatches === 2 && emptyMatches === 1) {
      if (boardArray[a] === "") return a;
      if (boardArray[b] === "") return b;
      if (boardArray[c] === "") return c;
    }
  }
  return null;
};

// Evaluate Terminal state for Minimax
const checkTerminal = (board) => {
  for (const [a, b, c] of winPatterns) {
    if (board[a] !== "" && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }
  if (board.every((cell) => cell !== "")) return "tie";
  return null;
};

// Unbeatable Minimax Algorithm
const minimax = (board, depth, isMaximizing) => {
  const result = checkTerminal(board);
  if (result === "X") return 10 - depth;
  if (result === "O") return depth - 10;
  if (result === "tie") return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "X";
        const evaluation = minimax(board, depth + 1, false);
        board[i] = "";
        maxEval = Math.max(maxEval, evaluation);
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "O";
        const evaluation = minimax(board, depth + 1, true);
        board[i] = "";
        minEval = Math.min(minEval, evaluation);
      }
    }
    return minEval;
  }
};

const getMinimaxMove = (boardArray) => {
  let bestScore = -Infinity;
  let bestMoves = [];

  // Optimal instant opening for speed
  if (boardArray[4] === "" && boardArray.filter((c) => c !== "").length <= 1) {
    return 4;
  }

  for (let i = 0; i < 9; i++) {
    if (boardArray[i] === "") {
      boardArray[i] = "X";
      const score = minimax(boardArray, 0, false);
      boardArray[i] = "";
      if (score > bestScore) {
        bestScore = score;
        bestMoves = [i];
      } else if (score === bestScore) {
        bestMoves.push(i);
      }
    }
  }
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
};

// Medium Strategy: Win -> Block -> Center -> Corners -> Random
const getMediumMove = (boardArray) => {
  const winMove = findWinningSpot(boardArray, "X");
  if (winMove !== null) return winMove;

  const blockMove = findWinningSpot(boardArray, "O");
  if (blockMove !== null) return blockMove;

  if (boardArray[4] === "") return 4;

  const corners = [0, 2, 6, 8].filter((idx) => boardArray[idx] === "");
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  const remaining = [];
  boardArray.forEach((val, idx) => {
    if (val === "") remaining.push(idx);
  });
  return remaining[Math.floor(Math.random() * remaining.length)];
};

// Easy Strategy: 70% random, 30% medium
const getEasyMove = (boardArray) => {
  const emptySpots = [];
  boardArray.forEach((val, idx) => {
    if (val === "") emptySpots.push(idx);
  });

  if (Math.random() < 0.7) {
    return emptySpots[Math.floor(Math.random() * emptySpots.length)];
  }
  return getMediumMove(boardArray);
};

// Intelligent computer move decision logic according to difficulty
const getComputerChoice = () => {
  const currentBoard = Array.from(boxes).map((b) => b.innerText);

  if (currentDifficulty === "impossible") {
    return getMinimaxMove(currentBoard);
  } else if (currentDifficulty === "easy") {
    return getEasyMove(currentBoard);
  } else {
    return getMediumMove(currentBoard);
  }
};

// Execute AI Move
const makeComputerMove = () => {
  if (isGameOver) return;

  const choice = getComputerChoice();
  if (choice !== undefined && choice !== null) {
    const targetBox = boxes[choice];
    targetBox.innerText = "X";
    targetBox.classList.add("box-x");
    targetBox.disabled = true;
    count++;
    turnO = true;
  }

  isAiThinking = false;

  const isWinner = checkWinner();
  if (count === 9 && !isWinner) {
    gameDraw();
  } else if (!isWinner) {
    updateStatus();
  }
};

const resetGame = () => {
  turnO = true;
  count = 0;
  isGameOver = false;
  isAiThinking = false;
  enableBoxes();
  msgContainer.classList.add("hide");
  updateStatus();
};

// Box click interactions
boxes.forEach((box) => {
  box.addEventListener("click", () => {
    if (isAiThinking || isGameOver || box.innerText !== "") return;

    if (isVsComputer) {
      // Single Player Mode: Human is O
      box.innerText = "O";
      box.classList.add("box-o");
      box.disabled = true;
      count++;
      turnO = false;

      const isWinner = checkWinner();
      if (count === 9 && !isWinner) {
        gameDraw();
      } else if (!isWinner) {
        isAiThinking = true;
        updateStatus();
        setTimeout(makeComputerMove, 450);
      }
    } else {
      // 2 Players Mode (Pass & Play)
      if (turnO) {
        box.innerText = "O";
        box.classList.add("box-o");
        turnO = false;
      } else {
        box.innerText = "X";
        box.classList.add("box-x");
        turnO = true;
      }
      box.disabled = true;
      count++;

      const isWinner = checkWinner();
      if (count === 9 && !isWinner) {
        gameDraw();
      } else if (!isWinner) {
        updateStatus();
      }
    }
  });
});

// Difficulty button handlers
diffBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    setDifficulty(btn.getAttribute("data-level"));
    resetGame();
  });
});

// Mode Selection Popup interactions
modeAiCard.addEventListener("click", () => setMode(true));
modeFriendCard.addEventListener("click", () => setMode(false));

// Change Mode Button triggers popup
changeModeBtn.addEventListener("click", () => {
  startModal.classList.remove("hide");
});

newGameBtn.addEventListener("click", resetGame);
resetBtn.addEventListener("click", resetGame);

// Initial setup
setDifficulty(currentDifficulty);
updateStreakDisplay();
updateStatus();