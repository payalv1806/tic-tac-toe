import React, { useState } from 'react';

const STAR_POINTS_15 = [48, 56, 112, 168, 176];

export default function Board({
  gridSize,
  board,
  winningLine,
  lastMoveIndex,
  onCellClick,
  disabled,
  moveCount,
  isGameOver
}) {
  const [hoverCoord, setHoverCoord] = useState('TARGET: READY');

  const getCoordinateLabel = (idx) => {
    const r = Math.floor(idx / gridSize);
    const c = idx % gridSize;
    if (gridSize === 15) {
      const colChar = String.fromCharCode(65 + c); // A to O
      const rowNum = 15 - r; // 15 to 1
      return `AIM: ${colChar}${rowNum}`;
    } else {
      const rowNames = ['TOP', 'MID', 'BOT'];
      const colNames = ['LEFT', 'CTR', 'RIGHT'];
      return `AIM: ${rowNames[r]}-${colNames[c]}`;
    }
  };

  const handleMouseEnter = (idx) => {
    if (!isGameOver && board[idx] === '') {
      setHoverCoord(getCoordinateLabel(idx));
    }
  };

  const handleMouseLeave = () => {
    if (!isGameOver) {
      setHoverCoord('TARGET: READY');
    }
  };

  return (
    <div className="container" id="board-container">
      {/* Decorative Cyber Corner Brackets */}
      <span className="hud-corner corner-tl" />
      <span className="hud-corner corner-tr" />
      <span className="hud-corner corner-bl" />
      <span className="hud-corner corner-br" />

      {/* Board HUD Telemetry Bar */}
      <div className="board-hud-header">
        <div className="hud-item hud-left">
          <span className="hud-pulse-dot" />
          <span className="hud-label">
            {gridSize === 15 ? '15×15 MATRIX' : '3×3 ARENA'}
          </span>
        </div>
        <div className="hud-item hud-center">
          <span className="hud-aim-text">{hoverCoord}</span>
        </div>
        <div className="hud-item hud-right">
          <span className="hud-moves-badge">MOVES: {moveCount}</span>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="board-grid-wrapper">
        <div className={`game grid-${gridSize}`} id="game-board">
          {board.map((cellValue, idx) => {
            const isWinning = winningLine && winningLine.includes(idx);
            const isLast = lastMoveIndex === idx;
            const isStar = gridSize === 15 && STAR_POINTS_15.includes(idx);

            const classes = [
              'box',
              cellValue === 'O' ? 'box-o' : '',
              cellValue === 'X' ? 'box-x' : '',
              isWinning ? 'winning-cell' : '',
              isLast ? 'last-move' : '',
              isStar ? 'star-point' : ''
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={idx}
                type="button"
                className={classes}
                disabled={disabled || cellValue !== '' || isGameOver}
                onClick={() => onCellClick(idx)}
                onMouseEnter={() => handleMouseEnter(idx)}
                onMouseLeave={handleMouseLeave}
                aria-label={`Cell ${idx + 1}`}
              >
                {cellValue}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
