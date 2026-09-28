import React from 'react';
import { playClickSound } from '../utils/audio';

export default function WinnerModal({
  isOpen,
  message,
  onPlayAgain,
  onViewHistory,
  soundEnabled
}) {
  if (!isOpen) return null;

  return (
    <div className="msg-container">
      <p id="msg">{message}</p>
      <div className="winner-modal-actions">
        <button
          type="button"
          id="new-btn"
          onClick={() => {
            playClickSound(soundEnabled);
            onPlayAgain();
          }}
        >
          Play Again
        </button>
        <button
          type="button"
          className="secondary-btn"
          onClick={() => {
            playClickSound(soundEnabled);
            onViewHistory();
          }}
        >
          📜 View Records
        </button>
      </div>
    </div>
  );
}
