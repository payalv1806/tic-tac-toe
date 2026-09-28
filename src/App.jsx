import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Board from './components/Board';
import SetupModal from './components/SetupModal';
import HistoryModal from './components/HistoryModal';
import WinnerModal from './components/WinnerModal';
import { checkWinner, getComputerMove } from './utils/ai';
import {
  playMoveSound,
  playWinSound,
  playUndoSound,
  playClickSound
} from './utils/audio';

export default function App() {
  // Game Configuration State
  const [isVsComputer, setIsVsComputer] = useState(true);
  const [gridSize, setGridSize] = useState(3);
  const [difficulty, setDifficulty] = useState(() => {
    return localStorage.getItem('ttt_difficulty') || 'medium';
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('ttt_sound_enabled') !== 'false';
  });

  // Gameplay State
  const winLength = gridSize === 15 ? 5 : 3;
  const [board, setBoard] = useState(() => new Array(3 * 3).fill(''));
  const [turnO, setTurnO] = useState(true);
  const [moveHistory, setMoveHistory] = useState([]);
  const [winningLine, setWinningLine] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Modals & Messages
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [winnerModalOpen, setWinnerModalOpen] = useState(false);
  const [winnerMsg, setWinnerMsg] = useState('');

  // Streaks & History Records
  const [currentStreak, setCurrentStreak] = useState(() => {
    return parseInt(localStorage.getItem('ttt_current_streak') || '0', 10);
  });
  const [bestStreak, setBestStreak] = useState(() => {
    return parseInt(localStorage.getItem('ttt_best_streak') || '0', 10);
  });
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem('ttt_react_history');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Keep body classes in sync for theme & board width
  useEffect(() => {
    if (isVsComputer) {
      document.body.classList.add('mode-computer');
      document.body.classList.remove('mode-pvp');
    } else {
      document.body.classList.add('mode-pvp');
      document.body.classList.remove('mode-computer');
    }

    if (gridSize === 15) {
      document.body.classList.add('board-15');
    } else {
      document.body.classList.remove('board-15');
    }
  }, [isVsComputer, gridSize]);

  // Persist difficulty & sound
  const handleDifficultyChange = (lvl) => {
    playClickSound(soundEnabled);
    setDifficulty(lvl);
    localStorage.setItem('ttt_difficulty', lvl);
    resetGame(gridSize);
  };

  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    localStorage.setItem('ttt_sound_enabled', nextVal);
    if (nextVal) playClickSound(true);
  };

  // Reset Game
  const resetGame = (newSize = gridSize) => {
    setBoard(new Array(newSize * newSize).fill(''));
    setTurnO(true);
    setMoveHistory([]);
    setWinningLine(null);
    setIsGameOver(false);
    setIsAiThinking(false);
    setWinnerModalOpen(false);
  };

  // Record a finished match into history
  const recordMatch = (resultType, winnerName, symbol, totalMoves) => {
    const newRecord = {
      id: Date.now(),
      date: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        day: 'numeric'
      }),
      mode: isVsComputer ? 'AI Battle' : '2 Players',
      difficulty: isVsComputer ? difficulty : 'PvP',
      gridSize: `${gridSize}×${gridSize}`,
      moves: totalMoves,
      resultType,
      winnerName,
      symbol
    };

    setHistory((prev) => {
      const updated = [newRecord, ...prev];
      if (updated.length > 50) updated.pop();
      localStorage.setItem('ttt_react_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Handle Game End
  const handleWin = (symbol, line, currentMovesCount) => {
    setIsGameOver(true);
    setWinningLine(line);
    playWinSound(soundEnabled);

    let resultType = 'win';
    let title = '';

    if (isVsComputer) {
      if (symbol === 'O') {
        const nextStreak = currentStreak + 1;
        setCurrentStreak(nextStreak);
        localStorage.setItem('ttt_current_streak', nextStreak);
        if (nextStreak > bestStreak) {
          setBestStreak(nextStreak);
          localStorage.setItem('ttt_best_streak', nextStreak);
        }
        const streakTag = nextStreak > 1 ? ` 🔥 ${nextStreak} Win Streak!` : '';
        setWinnerMsg(`🎉 Victory! You Won!${streakTag}`);
        resultType = 'win';
        title = 'You (Player O)';
      } else {
        setCurrentStreak(0);
        localStorage.setItem('ttt_current_streak', 0);
        setWinnerMsg('🤖 Cyber AI Won! Better luck next time!');
        resultType = 'loss';
        title = 'Cyber AI (Player X)';
      }
    } else {
      const winnerName = symbol === 'O' ? 'Player 1 (O)' : 'Player 2 (X)';
      setWinnerMsg(`🎉 Congratulations! ${winnerName} Won!`);
      resultType = symbol === 'O' ? 'win' : 'loss';
      title = winnerName;
    }

    recordMatch(resultType, title, symbol, currentMovesCount);
    setTimeout(() => setWinnerModalOpen(true), 600);
  };

  const handleDraw = (currentMovesCount) => {
    setIsGameOver(true);
    setWinnerMsg(isVsComputer ? "🤝 It's a Draw!" : 'Game was a Draw!');
    recordMatch('draw', 'Draw', '-', currentMovesCount);
    setTimeout(() => setWinnerModalOpen(true), 400);
  };

  // AI Move Execution
  useEffect(() => {
    if (!isVsComputer || turnO || isGameOver || winningLine) return;

    setIsAiThinking(true);
    const delay = gridSize === 15 ? 260 : 360;

    const timer = setTimeout(() => {
      const choice = getComputerMove(board, gridSize, difficulty);
      if (choice !== null && choice !== undefined && board[choice] === '') {
        const newBoard = [...board];
        newBoard[choice] = 'X';
        const newMoveCount = moveHistory.length + 1;
        const newHistory = [
          ...moveHistory,
          { index: choice, symbol: 'X', player: 'ai' }
        ];

        setBoard(newBoard);
        setMoveHistory(newHistory);
        playMoveSound(false, soundEnabled);

        const winResult = checkWinner(newBoard, gridSize, winLength);
        if (winResult) {
          handleWin(winResult.winner, winResult.line, newMoveCount);
        } else if (newMoveCount === gridSize * gridSize) {
          handleDraw(newMoveCount);
        } else {
          setTurnO(true);
        }
      }
      setIsAiThinking(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [
    isVsComputer,
    turnO,
    isGameOver,
    winningLine,
    board,
    gridSize,
    difficulty,
    moveHistory,
    soundEnabled,
    winLength
  ]);

  // Human Cell Click Handler
  const handleCellClick = (idx) => {
    if (isAiThinking || isGameOver || board[idx] !== '') return;

    if (isVsComputer) {
      const newBoard = [...board];
      newBoard[idx] = 'O';
      const newMoveCount = moveHistory.length + 1;
      const newHistory = [
        ...moveHistory,
        { index: idx, symbol: 'O', player: 'human' }
      ];

      setBoard(newBoard);
      setMoveHistory(newHistory);
      playMoveSound(true, soundEnabled);

      const winResult = checkWinner(newBoard, gridSize, winLength);
      if (winResult) {
        handleWin(winResult.winner, winResult.line, newMoveCount);
      } else if (newMoveCount === gridSize * gridSize) {
        handleDraw(newMoveCount);
      } else {
        setTurnO(false);
      }
    } else {
      // 2 Players Mode
      const symbol = turnO ? 'O' : 'X';
      const newBoard = [...board];
      newBoard[idx] = symbol;
      const newMoveCount = moveHistory.length + 1;
      const newHistory = [
        ...moveHistory,
        { index: idx, symbol, player: turnO ? 'p1' : 'p2' }
      ];

      setBoard(newBoard);
      setMoveHistory(newHistory);
      playMoveSound(turnO, soundEnabled);

      const winResult = checkWinner(newBoard, gridSize, winLength);
      if (winResult) {
        handleWin(winResult.winner, winResult.line, newMoveCount);
      } else if (newMoveCount === gridSize * gridSize) {
        handleDraw(newMoveCount);
      } else {
        setTurnO(!turnO);
      }
    }
  };

  // Undo Move Feature
  const handleUndo = () => {
    if (isAiThinking || moveHistory.length === 0) return;

    playUndoSound(soundEnabled);

    // If undoing after game over, dismiss modal and clear winning highlight
    if (isGameOver) {
      setIsGameOver(false);
      setWinningLine(null);
      setWinnerModalOpen(false);
    }

    if (isVsComputer) {
      const historyCopy = [...moveHistory];
      const newBoard = [...board];

      // Pop AI move
      const aiMove = historyCopy.pop();
      if (aiMove) newBoard[aiMove.index] = '';

      // Pop human move
      if (
        historyCopy.length > 0 &&
        historyCopy[historyCopy.length - 1].player === 'human'
      ) {
        const humanMove = historyCopy.pop();
        newBoard[humanMove.index] = '';
      }

      setBoard(newBoard);
      setMoveHistory(historyCopy);
      setTurnO(true);
    } else {
      // 2 Players mode
      const historyCopy = [...moveHistory];
      const lastMove = historyCopy.pop();
      const newBoard = [...board];
      if (lastMove) {
        newBoard[lastMove.index] = '';
        setTurnO(lastMove.symbol === 'O');
      }
      setBoard(newBoard);
      setMoveHistory(historyCopy);
    }
  };

  // Setup Apply
  const handleApplySetup = (newVsComp, newSize) => {
    setIsVsComputer(newVsComp);
    setGridSize(newSize);
    setSetupModalOpen(false);
    resetGame(newSize);
  };

  // Clear History
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('ttt_react_history');
  };

  const lastMoveIndex =
    moveHistory.length > 0 ? moveHistory[moveHistory.length - 1].index : null;

  return (
    <>
      <h1 id="game-title">
        {gridSize === 15 ? 'Gomoku 15×15' : 'Tic Tac Toe'}
      </h1>

      <main>
        {/* Top Action Bar */}
        <div className="top-bar">
          <button
            type="button"
            id="back-to-menu-btn"
            className="nav-btn back-btn"
            onClick={() => {
              playClickSound(soundEnabled);
              setSetupModalOpen(true);
            }}
            title="Open Game Setup"
          >
            <span className="btn-arrow">←</span> Setup
          </button>

          <div className="mode-pill" id="mode-badge">
            <span className="mode-pill-dot" />
            <span>
              {isVsComputer ? '🤖 AI Match' : '👥 2 Players'} •{' '}
              {gridSize}×{gridSize}
            </span>
          </div>

          <div className="top-bar-actions">
            <button
              type="button"
              id="sound-toggle-btn"
              className="nav-btn icon-only-btn"
              onClick={toggleSound}
              title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            >
              <span>{soundEnabled ? '🔊' : '🔇'}</span>
            </button>

            <button
              type="button"
              id="history-btn"
              className="nav-btn history-nav-btn"
              onClick={() => {
                playClickSound(soundEnabled);
                setHistoryModalOpen(true);
              }}
              title="View Player Records & Match History"
            >
              <span>📜</span> Records
            </button>
          </div>
        </div>

        {/* Win Condition Rule Banner */}
        <div className="win-rule-banner" id="win-rule-banner">
          <span className="rule-icon">🎯</span>
          <span>
            Win Condition: Connect <strong>{winLength} in a row</strong>
            {gridSize === 15 ? ' (Gomoku)' : ''}
          </span>
        </div>

        {/* Win Streak Tracker (Only in Computer Mode) */}
        {isVsComputer && (
          <div className="streak-container" id="streak-container">
            <div className="streak-pill">
              <span className="streak-icon">🔥</span>
              <span className="streak-text">
                Win Streak: <strong>{currentStreak}</strong>
              </span>
              <span className="streak-divider">•</span>
              <span className="streak-best">
                Best: <strong>{bestStreak}</strong>
              </span>
            </div>
          </div>
        )}

        {/* AI Difficulty Selector (Only in Computer Mode) */}
        {isVsComputer && (
          <div className="difficulty-container" id="difficulty-container">
            <div className="difficulty-bar">
              <button
                type="button"
                className={`diff-btn ${difficulty === 'easy' ? 'active' : ''}`}
                onClick={() => handleDifficultyChange('easy')}
              >
                🟢 Easy
              </button>
              <button
                type="button"
                className={`diff-btn ${difficulty === 'medium' ? 'active' : ''}`}
                onClick={() => handleDifficultyChange('medium')}
              >
                🟡 Medium
              </button>
              <button
                type="button"
                className={`diff-btn ${difficulty === 'impossible' ? 'active' : ''}`}
                onClick={() => handleDifficultyChange('impossible')}
              >
                🔴 Impossible
              </button>
            </div>
          </div>
        )}

        {/* Live Matchup Dashboard */}
        <div className="players-dashboard">
          {/* Player 1 Card */}
          <div
            className={`player-card ${turnO && !isGameOver ? 'active-turn' : ''}`}
            id="player1-card"
          >
            <div className="player-avatar-box">
              <span className="player-avatar">👤</span>
            </div>
            <div className="player-info">
              <span className="player-name">
                {isVsComputer ? 'You' : 'Player 1'}
              </span>
              <span className="player-symbol symbol-o">O</span>
            </div>
            <span className="turn-status-badge">
              {turnO && !isGameOver
                ? isVsComputer
                  ? 'Your Turn'
                  : 'Turn'
                : 'Waiting'}
            </span>
          </div>

          {/* VS Divider */}
          <div className="vs-divider">
            <span className="vs-text">VS</span>
          </div>

          {/* Player 2 / AI Card */}
          <div
            className={`player-card ${!turnO && !isGameOver ? 'active-turn' : ''} ${
              isAiThinking ? 'thinking' : ''
            }`}
            id="player2-card"
          >
            <div className="player-avatar-box ai-avatar-box">
              <span className="player-avatar">
                {isVsComputer ? '🤖' : '👥'}
              </span>
            </div>
            <div className="player-info">
              <span className="player-name">
                {isVsComputer ? 'Cyber AI' : 'Player 2'}
              </span>
              <span className="player-symbol symbol-x">X</span>
            </div>
            <span className="turn-status-badge">
              {isAiThinking
                ? 'Thinking...'
                : !turnO && !isGameOver
                ? 'Turn'
                : 'Waiting'}
            </span>
          </div>
        </div>

        {/* Interactive Tactical Board */}
        <Board
          gridSize={gridSize}
          board={board}
          winningLine={winningLine}
          lastMoveIndex={lastMoveIndex}
          onCellClick={handleCellClick}
          disabled={isAiThinking || isGameOver}
          moveCount={moveHistory.length}
          isGameOver={isGameOver}
        />

        {/* Bottom Controls: Undo & Reset */}
        <div className="bottom-controls">
          <button
            type="button"
            id="undo-btn"
            className="control-btn undo-btn"
            disabled={moveHistory.length === 0 || isAiThinking}
            onClick={handleUndo}
            title="Take back previous move"
          >
            <span>↩</span> Undo Move
          </button>
          <button
            type="button"
            id="reset-btn"
            className="control-btn primary-btn"
            onClick={() => {
              playUndoSound(soundEnabled);
              resetGame(gridSize);
            }}
          >
            <span>🔄</span> Reset Game
          </button>
        </div>
      </main>

      {/* Setup Modal */}
      <SetupModal
        isOpen={setupModalOpen}
        currentVsComputer={isVsComputer}
        currentGridSize={gridSize}
        onApply={handleApplySetup}
        onClose={() => setSetupModalOpen(false)}
        soundEnabled={soundEnabled}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={historyModalOpen}
        history={history}
        bestStreak={bestStreak}
        onClearHistory={handleClearHistory}
        onClose={() => setHistoryModalOpen(false)}
        soundEnabled={soundEnabled}
      />

      {/* Winner / Draw Celebration Modal */}
      <WinnerModal
        isOpen={winnerModalOpen}
        message={winnerMsg}
        onPlayAgain={() => {
          resetGame(gridSize);
        }}
        onViewHistory={() => {
          setWinnerModalOpen(false);
          setHistoryModalOpen(true);
        }}
        soundEnabled={soundEnabled}
      />
    </>
  );
}
