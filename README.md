# 🎮 Cyber Tic-Tac-Toe & 15×15 Gomoku Matrix

A modern, high-performance web game built with **React** and **Vite**, featuring cyber glassmorphic aesthetics, 3D luminous stones, sound effects, and intelligent AI.

## ✨ Features

- **Classic 3×3 Arena**: Classic 3-in-a-row Tic-Tac-Toe.
- **Mega 15×15 Matrix**: Gomoku / Five-in-a-Row tournament matrix with traditional star points (Hoshi dots).
- **Intelligent Cyber AI**:
  - Unbeatable Minimax for 3×3.
  - High-performance heuristic Gomoku engine for 15×15 (instant win detection, critical 5-in-a-row blocks, threat creation/defense, and tactical positional scoring in `<50ms`).
  - 3 Selectable Difficulties: 🟢 Easy, 🟡 Medium, 🔴 Impossible.
- **2 Players Mode**: Pass & play battle for two players.
- **Move Undo ("↩ Undo Move")**: Easily take back moves during gameplay.
- **Player Records & History ("📜 Records")**: Lifetime statistics (Total games, Wins, Losses, Draws, Win Rate %, Best Streak) and match history log saved in `localStorage`.
- **High-Tech HUD Framing**: Live target coordinate tracker (`AIM: H8`), cyber corner brackets, and move counters.
- **Last-Move Radar Beacon**: Concentric animated golden pulse ring highlighting the latest move.
- **Golden Victory Laser Line**: Shimmering golden beam highlighting winning 5-in-a-row or 3-in-a-row lines.
- **Web Audio API Sound Effects**: Built-in dynamic sound synthesis with mute/unmute toggle (`🔊` / `🔇`).

## 🛠️ Development & Deployment

### Run Locally
```bash
npm install
npm run dev
```

### Build for Production
```bash
npm run build
```

### Deploy to GitHub Pages
```bash
npm run deploy
```
*(Or push to `main` branch to automatically trigger the included GitHub Actions workflow)*
