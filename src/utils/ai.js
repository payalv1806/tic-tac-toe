// ============================================================
// GAME LOGIC & AI ENGINE: MINIMAX (3x3) & GOMOKU HEURISTIC (15x15)
// ============================================================

export const winPatterns3x3 = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export const checkWinner = (board, gridSize, winLength) => {
  if (gridSize === 3) {
    for (const pattern of winPatterns3x3) {
      const [a, b, c] = pattern;
      if (board[a] !== "" && board[a] === board[b] && board[b] === board[c]) {
        return { winner: board[a], line: [a, b, c] };
      }
    }
    return null;
  }

  // 15x15 Gomoku (5-in-a-row) Directional Check
  const directions = [
    [0, 1],  // Horizontal
    [1, 0],  // Vertical
    [1, 1],  // Diagonal \
    [1, -1]  // Diagonal /
  ];

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const symbol = board[r * gridSize + c];
      if (!symbol) continue;

      for (const [dr, dc] of directions) {
        const line = [];
        let hasWin = true;

        for (let step = 0; step < winLength; step++) {
          const nr = r + dr * step;
          const nc = c + dc * step;

          if (nr < 0 || nr >= gridSize || nc < 0 || nc >= gridSize) {
            hasWin = false;
            break;
          }

          const idx = nr * gridSize + nc;
          if (board[idx] !== symbol) {
            hasWin = false;
            break;
          }
          line.push(idx);
        }

        if (hasWin) {
          return { winner: symbol, line };
        }
      }
    }
  }
  return null;
};

// --- 3x3 Minimax Logic ---
const check3x3Terminal = (board) => {
  for (const [a, b, c] of winPatterns3x3) {
    if (board[a] !== "" && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }
  if (board.every((c) => c !== "")) return "tie";
  return null;
};

const minimax3x3 = (board, depth, isMaximizing) => {
  const result = check3x3Terminal(board);
  if (result === "X") return 10 - depth;
  if (result === "O") return depth - 10;
  if (result === "tie") return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "X";
        const score = minimax3x3(board, depth + 1, false);
        board[i] = "";
        maxEval = Math.max(maxEval, score);
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "O";
        const score = minimax3x3(board, depth + 1, true);
        board[i] = "";
        minEval = Math.min(minEval, score);
      }
    }
    return minEval;
  }
};

const get3x3BestMove = (board) => {
  const count = board.filter((c) => c !== "").length;
  if (board[4] === "" && count <= 1) return 4;

  let bestScore = -Infinity;
  let bestMoves = [];

  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "X";
      const score = minimax3x3(board, 0, false);
      board[i] = "";

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

// --- 15x15 Gomoku High-Performance Heuristic Engine ---
const countLinePattern = (board, gridSize, r, c, dr, dc, symbol) => {
  let count = 0;
  let blocked = 0;

  // Forward
  let step = 1;
  while (true) {
    const nr = r + dr * step;
    const nc = c + dc * step;
    if (nr < 0 || nr >= gridSize || nc < 0 || nc >= gridSize) {
      blocked++;
      break;
    }
    const val = board[nr * gridSize + nc];
    if (val === symbol) {
      count++;
    } else {
      if (val !== "") blocked++;
      break;
    }
    step++;
  }

  // Backward
  step = 1;
  while (true) {
    const nr = r - dr * step;
    const nc = c - dc * step;
    if (nr < 0 || nr >= gridSize || nc < 0 || nc >= gridSize) {
      blocked++;
      break;
    }
    const val = board[nr * gridSize + nc];
    if (val === symbol) {
      count++;
    } else {
      if (val !== "") blocked++;
      break;
    }
    step++;
  }

  return { count: count + 1, blocked };
};

const evaluateGomokuPosition = (board, gridSize, idx, symbol) => {
  const r = Math.floor(idx / gridSize);
  const c = idx % gridSize;
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  let score = 0;

  for (const [dr, dc] of directions) {
    const { count, blocked } = countLinePattern(board, gridSize, r, c, dr, dc, symbol);

    if (count >= 5) {
      score += 100000;
    } else if (count === 4) {
      if (blocked === 0) score += 10000;
      else if (blocked === 1) score += 2000;
    } else if (count === 3) {
      if (blocked === 0) score += 1500;
      else if (blocked === 1) score += 200;
    } else if (count === 2) {
      if (blocked === 0) score += 100;
      else if (blocked === 1) score += 20;
    }
  }

  // Bonus for central tactical control
  const center = Math.floor(gridSize / 2);
  const distFromCenter = Math.abs(r - center) + Math.abs(c - center);
  score += Math.max(0, 15 - distFromCenter);

  return score;
};

const getGomokuCandidates = (board, gridSize) => {
  const candidates = new Set();
  const radius = 2;
  let hasStones = false;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (board[r * gridSize + c] !== "") {
        hasStones = true;
        for (let dr = -radius; dr <= radius; dr++) {
          for (let dc = -radius; dc <= radius; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
              const nIdx = nr * gridSize + nc;
              if (board[nIdx] === "") {
                candidates.add(nIdx);
              }
            }
          }
        }
      }
    }
  }

  if (!hasStones) {
    const center = Math.floor(gridSize / 2);
    return [center * gridSize + center];
  }

  return Array.from(candidates);
};

const get15x15BestMove = (board, gridSize, difficulty) => {
  const candidates = getGomokuCandidates(board, gridSize);
  if (candidates.length === 0) return null;

  // 1. Instant check: Can AI win this turn?
  for (const idx of candidates) {
    const r = Math.floor(idx / gridSize);
    const c = idx % gridSize;
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (const [dr, dc] of directions) {
      const { count } = countLinePattern(board, gridSize, r, c, dr, dc, "X");
      if (count >= 5) return idx;
    }
  }

  // 2. Critical Block: Can Opponent win on next turn?
  for (const idx of candidates) {
    const r = Math.floor(idx / gridSize);
    const c = idx % gridSize;
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (const [dr, dc] of directions) {
      const { count } = countLinePattern(board, gridSize, r, c, dr, dc, "O");
      if (count >= 5) return idx;
    }
  }

  if (difficulty === "easy" && Math.random() < 0.65) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  let bestScore = -Infinity;
  let bestMoves = [];

  for (const idx of candidates) {
    const attackScore = evaluateGomokuPosition(board, gridSize, idx, "X");
    const defendScore = evaluateGomokuPosition(board, gridSize, idx, "O");

    const defenseMultiplier = difficulty === "impossible" ? 1.3 : 0.9;
    let totalScore = attackScore + (defendScore * defenseMultiplier);

    if (difficulty === "medium") {
      totalScore += (Math.random() * 80 - 40);
    }

    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestMoves = [idx];
    } else if (Math.abs(totalScore - bestScore) < 5) {
      bestMoves.push(idx);
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
};

export const getComputerMove = (board, gridSize, difficulty) => {
  if (gridSize === 3) {
    if (difficulty === "impossible") {
      return get3x3BestMove(board);
    } else if (difficulty === "easy") {
      const empty = [];
      board.forEach((val, idx) => { if (val === "") empty.push(idx); });
      return Math.random() < 0.7
        ? empty[Math.floor(Math.random() * empty.length)]
        : get3x3BestMove(board);
    } else {
      // Medium
      const empty = [];
      board.forEach((val, idx) => { if (val === "") empty.push(idx); });
      return Math.random() < 0.35
        ? empty[Math.floor(Math.random() * empty.length)]
        : get3x3BestMove(board);
    }
  } else {
    return get15x15BestMove(board, gridSize, difficulty);
  }
};
