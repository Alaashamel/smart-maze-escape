# 🧩 Smart Maze Escape

> **A Neon-Lit, AI-Powered Maze Puzzle Game** — Navigate, Collect, and Escape before the Guardians catch you!

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

---

## 📸 Screenshots

| Gameplay | Level Select | Victory |
|:--------:|:------------:|:-------:|
| ![Gameplay](https://via.placeholder.com/300x200/0a0a1a/00d4ff?text=Maze+Gameplay) | ![Levels](https://via.placeholder.com/300x200/0a0a1a/9b59ff?text=Level+Select) | ![Victory](https://via.placeholder.com/300x200/0a0a1a/f1c40f?text=Victory) |

---

## 🎯 Overview

**Smart Maze Escape** is a complete, production-ready maze game built with **pure HTML, CSS, and JavaScript** — no external libraries or frameworks. It features:

- 🧠 **Smart AI Guardians** that chase you using **BFS shortest-path** algorithms
- 🔐 **Key & Door Puzzle System** — Collect 3 keys to unlock the exit portal
- 🎁 **Power-up Gift Boxes** — Speed boosts and freeze effects
- 🧱 **Dynamic Moving Walls** (Medium & Hard levels)
- ⏱️ **Time-limited challenges**  
- 🌟 **Star Rating System** — Performance-based scoring
- 🎨 **Neon Dark Theme** with glow effects, animations, and particle-style rendering
- 🔊 **Web Audio API Sound Effects** — Synthesized tones and melodies
- 📱 **Mobile-responsive** with on-screen D-pad controls

---

## ✨ Features

### Core Gameplay
- **15×15 procedurally generated maze** (DFS algorithm, guaranteed solvable path)
- **Smooth grid-based movement** (Arrow keys or WASD)
- **3 difficulty levels**: Easy, Medium, Hard

### AI Opponents
- **BFS Pathfinding** — Guardians calculate the shortest route to you
- **Smart Wall Penalty** — Guardians pause 1 second if blocked by a wall
- **Progressive Difficulty** — New guardian spawns every 20–30 seconds (max 3)
- **Freeze Effect** — Temporarily immobilize all guardians

### Interactive Elements
- 🔑 **3 Golden Keys** — Collect all to unlock the exit
- 🎁 **Gift Boxes** — Random power-ups (Speed Boost / Freeze Guardians)
- 🟢 **Pulsing Exit Portal** — Green glow when unlocked

### Visual Design
- **Dark gradient background** with neon blue/purple glow theme
- **Canvas-rendered** with custom shapes, gradients, and animations
- **Player aura** (soft blue) and **Guardian glow** (pulsing red)
- **Screen shake** on wall collision

---

## 🛠️ Technologies Used

| Technology | Purpose |
|:-----------|:--------|
| **HTML5** | Game structure & modal UI |
| **CSS3** | Styling, animations, neon theme, responsive layout |
| **JavaScript (ES6+)** | Game logic, OOP classes, Canvas rendering |
| **Web Audio API** | Synthesized sound effects |
| **Canvas API** | Maze rendering, visual effects, animations |

---

## 🚀 Setup & Run Instructions

### Option 1: Direct Browser (Recommended)
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Alaashamel/smart-maze-escape.git
   cd smart-maze-escape
   ```
2. **Open in browser:**
   - Simply open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari)
   - No build tools, no npm, no servers required!

### Option 2: Live Server (for development)
1. Install [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code
2. Right-click `index.html` → **Open with Live Server**
3. Or use Python:
   ```bash
   python -m http.server 8000
   ```
   Then open `http://localhost:8000`

### Option 3: GitHub Pages
The game is fully client-side and can be deployed to GitHub Pages in one click:
1. Go to repository **Settings** → **Pages**
2. Select branch `main` and folder `/ (root)`
3. Click **Save** — your game is live at `https://alaashamel.github.io/smart-maze-escape/`

---

## 📁 Project Structure

```
smart-maze-escape/
├── index.html              # Main HTML entry point
├── README.md               # This documentation
├── LICENSE                 # MIT License
├── css/
│   └── style.css           # All styling: theme, animations, modals, responsive
├── js/
│   ├── audio.js            # AudioManager class — Web Audio API sound synthesis
│   ├── maze.js             # Maze class — DFS generation, keys, gifts, moving walls
│   ├── player.js           # Player class — movement, speed boost, collision
│   ├── guardian.js         # Guardian class — BFS pathfinding AI, freeze/penalty
│   ├── puzzle.js           # PuzzleManager — key/door logic, power-up activation
│   ├── levels.js           # LevelManager — 3-level config, star rating, timers
│   ├── ui.js               # UIManager — DOM updates, modals, keyboard/mobile input
│   └── game.js             # Game class — Main engine, canvas rendering, game loop
└── assets/                 # (Optional) Future sprite/audio assets
```

---

## 🎮 How to Play

### Objective
Navigate the procedurally generated maze, collect **3 golden keys** to unlock the **green exit portal**, and escape before the guardians catch you!

### Controls
| Key | Action |
|:----|:-------|
| ↑ / W | Move Up |
| ↓ / S | Move Down |
| ← / A | Move Left |
| → / D | Move Right |
| Space | Restart (on game over) |

### Game Elements
- 🧱 **Red Walls** — Impassable (guardians pause 1s if blocked)
- 🔑 **Gold Keys** — Collect all 3 to unlock the exit
- 🟢 **Green Portal** — Exit (pulses when unlocked)
- 🎁 **Gift Boxes** — Random power-ups (speed boost or freeze guardians)
- 👾 **Guardians** — AI chasers using BFS pathfinding

### Scoring
| Action | Points |
|:-------|:-------|
| Key Collected | +100 |
| Gift Box Collected | +50 |
| Level Complete | +500 |
| Star Rating | 1–3 ⭐ based on keys & time |

---

## 🧰 Level System

| Level | Name | Maze Size | Guardians | Moving Walls | Time Limit |
|:-----|:-----|:---------|:----------|:-------------|:-----------|
| 1 | 🌱 Easy | 13×13 | 1 (max) | ❌ No | ♾️ None |
| 2 | 🔥 Medium | 15×15 | 2 (max) | ✅ 3 walls | ⏱️ 3 min |
| 3 | 💀 Hard | 17×17 | 3 (max) | ✅ 5 walls | ⏱️ 2.5 min |

---

## 📝 5-Day Implementation Plan

| Day | Phase | Focus |
|:----|:------|:------|
| **Day 1** | Core Setup | HTML structure, CSS theme, Maze DFS generation, Player movement |
| **Day 2** | Game Engine | Canvas rendering, game loop, collision detection, moving walls |
| **Day 3** | AI & Puzzles | Guardian BFS pathfinding, key/door system, gift boxes, spawn logic |
| **Day 4** | UI & Effects | Modals, star rating, Web Audio sounds, screen shake, glow animations |
| **Day 5** | Polish & Deploy | 3-level balancing, mobile D-pad, bug fixes, README, GitHub Pages |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Alaa Shamel**  
- GitHub: [@Alaashamel](https://github.com/Alaashamel)

---

## 🙏 Acknowledgements

- Inspired by classic maze games and modern roguelike mechanics
- Built with pure web technologies — no frameworks, no shortcuts
- Special thanks to the open-source community for algorithm references

---

> **Made with ❤️ and a lot of 🔥 coffee**
