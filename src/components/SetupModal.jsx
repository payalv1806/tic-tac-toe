import React, { useState } from 'react';
import { playClickSound } from '../utils/audio';

export default function SetupModal({
  isOpen,
  currentVsComputer,
  currentGridSize,
  onApply,
  onClose,
  soundEnabled
}) {
  const [selectedVsComputer, setSelectedVsComputer] = useState(currentVsComputer);
  const [selectedGridSize, setSelectedGridSize] = useState(currentGridSize);

  if (!isOpen) return null;

  const handleModeSelect = (vsComputer) => {
    playClickSound(soundEnabled);
    setSelectedVsComputer(vsComputer);
  };

  const handleGridSelect = (size) => {
    playClickSound(soundEnabled);
    setSelectedGridSize(size);
  };

  const handleSubmit = () => {
    playClickSound(soundEnabled);
    onApply(selectedVsComputer, selectedGridSize);
  };

  return (
    <div className="start-modal-overlay" onClick={onClose}>
      <div className="start-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-icon">🎮</span>
          <h2>Game Setup</h2>
          <p>Choose your opponent and battlefield matrix</p>
        </div>

        {/* Step 1: Select Opponent */}
        <div className="setup-section-title">1. Select Opponent</div>
        <div className="mode-cards-container">
          <button
            type="button"
            className={`mode-selection-card ${selectedVsComputer ? 'selected' : ''}`}
            onClick={() => handleModeSelect(true)}
          >
            <div className="card-badge ai-badge">AI Mode</div>
            <div className="card-icon-wrapper ai-icon-wrapper">
              <span className="card-icon">🤖</span>
            </div>
            <div className="card-content">
              <h3>Play with Computer</h3>
              <p>Challenge the Cyber AI with selectable difficulties</p>
            </div>
            <span className="card-check">✓</span>
          </button>

          <button
            type="button"
            className={`mode-selection-card ${!selectedVsComputer ? 'selected' : ''}`}
            onClick={() => handleModeSelect(false)}
          >
            <div className="card-badge friend-badge">PvP Mode</div>
            <div className="card-icon-wrapper friend-icon-wrapper">
              <span className="card-icon">👥</span>
            </div>
            <div className="card-content">
              <h3>Play with Friend</h3>
              <p>Classic pass & play battle for two players</p>
            </div>
            <span className="card-check">✓</span>
          </button>
        </div>

        {/* Step 2: Select Board Size */}
        <div className="setup-section-title">2. Select Grid Size</div>
        <div className="grid-selection-container">
          <button
            type="button"
            className={`grid-option-card ${selectedGridSize === 3 ? 'active' : ''}`}
            onClick={() => handleGridSelect(3)}
          >
            <div className="grid-card-badge">Classic</div>
            <div className="grid-visual-preview preview-3">
              <span /><span /><span />
              <span /><span /><span />
              <span /><span /><span />
            </div>
            <h4>3 × 3 Arena</h4>
            <p>Connect <strong>3 in a row</strong></p>
          </button>

          <button
            type="button"
            className={`grid-option-card ${selectedGridSize === 15 ? 'active' : ''}`}
            onClick={() => handleGridSelect(15)}
          >
            <div className="grid-card-badge mega-badge">Mega Pro</div>
            <div className="grid-visual-preview preview-15">
              <div className="preview-dense-mesh" />
            </div>
            <h4>15 × 15 Matrix</h4>
            <p>Gomoku: <strong>5 in a row</strong></p>
          </button>
        </div>

        {/* Start Button */}
        <button
          type="button"
          id="start-game-btn"
          className="modal-action-btn"
          onClick={handleSubmit}
        >
          🚀 Start Battle
        </button>
      </div>
    </div>
  );
}
