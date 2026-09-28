import React from 'react';
import { playClickSound } from '../utils/audio';

export default function HistoryModal({
  isOpen,
  history,
  bestStreak,
  onClearHistory,
  onClose,
  soundEnabled
}) {
  if (!isOpen) return null;

  let wins = 0;
  let losses = 0;
  let draws = 0;

  history.forEach((m) => {
    if (m.resultType === 'win') wins++;
    else if (m.resultType === 'loss') losses++;
    else if (m.resultType === 'draw') draws++;
  });

  const total = history.length;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  const handleClear = () => {
    playClickSound(soundEnabled);
    if (window.confirm("Are you sure you want to clear your match records?")) {
      onClearHistory();
    }
  };

  const handleClose = () => {
    playClickSound(soundEnabled);
    onClose();
  };

  return (
    <div className="history-modal-overlay" onClick={handleClose}>
      <div className="history-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="history-header">
          <div className="history-title-group">
            <span className="modal-icon">📜</span>
            <h2>Player Records & History</h2>
          </div>
          <button
            type="button"
            className="history-close-btn"
            onClick={handleClose}
            title="Close History"
          >
            ✕
          </button>
        </div>

        {/* Stats Dashboard Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-num">{total}</span>
            <span className="stat-label">Total Matches</span>
          </div>
          <div className="stat-card win-stat">
            <span className="stat-num">{wins}</span>
            <span className="stat-label">Wins</span>
          </div>
          <div className="stat-card loss-stat">
            <span className="stat-num">{losses}</span>
            <span className="stat-label">Losses</span>
          </div>
          <div className="stat-card draw-stat">
            <span className="stat-num">{draws}</span>
            <span className="stat-label">Draws</span>
          </div>
          <div className="stat-card rate-stat">
            <span className="stat-num">{winRate}%</span>
            <span className="stat-label">Win Rate</span>
          </div>
          <div className="stat-card streak-stat">
            <span className="stat-num">{bestStreak}</span>
            <span className="stat-label">Best Streak</span>
          </div>
        </div>

        {/* Recent Matches List Header */}
        <div className="history-list-header">
          <h3>Match History Log</h3>
          {total > 0 && (
            <button
              type="button"
              className="clear-btn"
              onClick={handleClear}
            >
              🗑️ Clear History
            </button>
          )}
        </div>

        {/* Matches List */}
        <div className="history-list">
          {total === 0 ? (
            <div className="history-empty">
              No matches recorded yet. Play a game to view history!
            </div>
          ) : (
            history.map((m) => {
              const badgeLabel =
                m.resultType === 'win'
                  ? '🏆 Win'
                  : m.resultType === 'loss'
                  ? '💀 Loss'
                  : '🤝 Draw';

              return (
                <div className="history-item" key={m.id}>
                  <div className="history-item-left">
                    <span className={`history-result-badge ${m.resultType}`}>
                      {badgeLabel}
                    </span>
                    <div className="history-details">
                      <span className="history-title">{m.winnerName}</span>
                      <span className="history-meta">
                        {m.date} • {m.mode}
                        {m.mode.includes('AI') ? ` (${m.difficulty})` : ''} •{' '}
                        {m.moves} moves
                      </span>
                    </div>
                  </div>
                  <span className="history-grid-tag">{m.gridSize}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
