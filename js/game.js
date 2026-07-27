/* ============================================================
   Smart Maze Escape - Main Game Engine
   Canvas rendering, game loop, collision detection, state management
   ============================================================ */

class Game {
    constructor() {
        // Core components
        this.maze = null;
        this.player = null;
        this.puzzle = null;
        this.levelManager = new LevelManager();
        this.ui = new UIManager(this);
        this.guardians = [];

        // Canvas setup
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 0;    // Calculated dynamically
        this.canvasWidth = 0;
        this.canvasHeight = 0;

        // Game state
        this.isRunning = false;
        this.isGameOver = false;
        this.isPaused = false;
        this.lastTime = 0;
        this.animFrameId = null;
        this.freezeTimer = 0;
        this.freezeDuration = 5;

        // Initialize
        this._resizeCanvas();
        window.addEventListener('resize', () => this._resizeCanvas());
        this.setLevel(1);
    }

    /** Resize canvas to fit container */
    _resizeCanvas() {
        const container = document.getElementById('game-container');
        const maxW = container.clientWidth - 20;
        const maxH = container.clientHeight - 20;
        const size = this.levelManager ? this.levelManager.getConfig().mazeSize : 15;
        
        // Calculate cell size to fit maze in view
        this.cellSize = Math.floor(Math.min(maxW, maxH) / size);
        this.canvasWidth = this.cellSize * size;
        this.canvasHeight = this.cellSize * size;
        
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
    }

    /** Set the current level and initialize game */
    setLevel(levelNum) {
        this.levelManager.setLevel(levelNum);
        this._initLevel();
        this._resizeCanvas();
        
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            this._gameLoop(this.lastTime);
        }
        
        audio.playLevelStart();
    }

    /** Initialize all game objects for the current level */
    _initLevel() {
        const config = this.levelManager.getConfig();
        
        // Generate maze
        this.maze = new Maze(config.mazeSize, config.mazeSize, this.levelManager.currentLevel);
        this.maze.generate();

        // Create player
        this.player = new Player(this.maze);
        
        // Create puzzle manager
        this.puzzle = new PuzzleManager(this.maze, this.player);

        // Initialize guardians
        this.guardians = [];
        const guardianPos = this.levelManager.getGuardianStartPosition();
        const firstGuardian = new Guardian(
            this.maze, 
            0, 
            guardianPos.r, 
            guardianPos.c
        );
        firstGuardian.moveInterval = 1.0 / config.guardianSpeed;
        this.guardians.push(firstGuardian);
        this.levelManager.guardiansSpawned = 1;
        this.levelManager.guardianSpawnTimer = 0;

        // Reset state
        this.isGameOver = false;
        this.freezeTimer = 0;
        this.levelManager.reset();
        
        // Spawn the first guardian alert
        setTimeout(() => audio.playGuardianAlert(), 500);
    }

    /** Main game loop using requestAnimationFrame */
    _gameLoop(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.05); // Cap at 50ms
        this.lastTime = timestamp;

        if (!this.isGameOver && !this.isPaused) {
            this._update(deltaTime);
        }

        this._render();
        
        this.animFrameId = requestAnimationFrame((t) => this._gameLoop(t));
    }

    /** Update game logic */
    _update(deltaTime) {
        // Update timers
        this.levelManager.update(deltaTime);
        this.player.update(deltaTime);
        this.puzzle.update(deltaTime);
        this.maze.updateMovingWalls(deltaTime);

        // Process player movement
        this.player.processMove();

        // Check for interactions (keys, gifts, exit)
        const interaction = this.puzzle.checkInteractions();
        if (interaction) {
            if (interaction.type === 'gift' && interaction.powerup === 'freeze') {
                this._freezeAllGuardians();
            }
            if (interaction.type === 'exit') {
                this._handleVictory();
                return;
            }
        }

        // Update guardians and check for spawn
        this._updateGuardians(deltaTime);

        // Check for guardian collision
        this._checkGuardianCollision();

        // Check time limit
        if (this.levelManager.hasTimeExpired()) {
            this._handleGameOver(false);
        }

        // Update HUD
        this.ui.updateHUD();
    }

    /** Update all guardian AI */
    _updateGuardians(deltaTime) {
        const playerPos = { r: this.player.r, c: this.player.c };

        // Update existing guardians
        for (const guardian of this.guardians) {
            if (guardian.frozen) continue; // Skip frozen guardians
            const caught = guardian.update(deltaTime, playerPos.r, playerPos.c);
            if (caught) {
                this._handleGameOver(false);
                return;
            }
        }

        // Check for new guardian spawn
        if (this.levelManager.shouldSpawnGuardian()) {
            const pos = this.levelManager.getGuardianStartPosition();
            const newGuardian = new Guardian(
                this.maze,
                this.guardians.length,
                pos.r,
                pos.c
            );
            const config = this.levelManager.getConfig();
            newGuardian.moveInterval = 1.0 / config.guardianSpeed;
            this.guardians.push(newGuardian);
            audio.playGuardianAlert();
            this.ui.showCanvasMessage('⚠️ New Guardian Spawned!');
        }
    }

    /** Check if any guardian is at the player's position */
    _checkGuardianCollision() {
        for (const guardian of this.guardians) {
            if (guardian.r === this.player.r && guardian.c === this.player.c) {
                this._handleGameOver(false);
                return;
            }
        }
    }

    /** Freeze all guardians */
    _freezeAllGuardians() {
        this.freezeTimer = this.freezeDuration;
        for (const guardian of this.guardians) {
            guardian.freeze(this.freezeDuration);
        }
        this.ui.showCanvasMessage('❄️ Guardians Frozen!');
    }

    /** Handle victory */
    _handleVictory() {
        this.isGameOver = true;
        this.player.score += 500; // Level completion bonus
        audio.playVictory();
        this.ui.updateHUD();
        setTimeout(() => {
            this.ui.showGameOver(true);
        }, 500);
    }

    /** Handle game over */
    _handleGameOver(won) {
        if (this.isGameOver) return; // Prevent multiple triggers
        this.isGameOver = true;
        
        if (won) {
            audio.playVictory();
        } else {
            audio.playGameOver();
        }
        
        setTimeout(() => {
            this.ui.showGameOver(won);
        }, 300);
    }

    /** Restart current level */
    restart() {
        this._initLevel();
        this._resizeCanvas();
        this.ui.updateHUD();
        audio.playLevelStart();
    }

    /** Render everything to the canvas */
    _render() {
        const ctx = this.ctx;
        const cs = this.cellSize;
        const rows = this.maze.rows;
        const cols = this.maze.cols;

        // Clear canvas with dark background
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Draw maze cells
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = c * cs;
                const y = r * cs;
                const cell = this.maze.grid[r][c];

                if (cell === 1) {
                    // Wall - red/brown with border
                    ctx.fillStyle = '#2c1810';
                    ctx.fillRect(x, y, cs, cs);
                    ctx.fillStyle = '#4a2a1a';
                    ctx.fillRect(x + 2, y + 2, cs - 4, cs - 4);
                    ctx.strokeStyle = '#5a3a2a';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, cs, cs);
                } else {
                    // Path - beige/dark
                    ctx.fillStyle = '#1a1a2e';
                    ctx.fillRect(x, y, cs, cs);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
                    ctx.fillRect(x + 1, y + 1, cs - 2, cs - 2);

                    // Check for special items
                    if (cell === 2) {
                        // Key - glowing gold
                        this._drawKey(x, y, cs);
                    } else if (cell === 3) {
                        // Exit portal - pulsing green
                        this._drawExit(x, y, cs);
                    } else if (cell === 4) {
                        // Gift box - bouncing
                        this._drawGiftBox(x, y, cs);
                    }
                }
            }
        }

        // Draw moving wall indicators
        if (this.maze.movingWalls.length > 0) {
            const time = performance.now() / 1000;
            for (const mw of this.maze.movingWalls) {
                if (mw.active) {
                    // Wall is open, draw indicator
                    const x = mw.c * cs;
                    const y = mw.r * cs;
                    ctx.fillStyle = `rgba(0, 212, 255, ${0.1 + Math.sin(time * 2) * 0.05})`;
                    ctx.fillRect(x, y, cs, cs);
                    ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
                    ctx.setLineDash([4, 4]);
                    ctx.strokeRect(x, y, cs, cs);
                    ctx.setLineDash([]);
                }
            }
        }

        // Draw guardians
        for (const guardian of this.guardians) {
            this._drawGuardian(guardian);
        }

        // Draw player
        this._drawPlayer();

        // Draw freeze overlay if active
        if (this.freezeTimer > 0) {
            ctx.fillStyle = `rgba(100, 200, 255, ${0.05 + Math.sin(performance.now() / 200) * 0.02})`;
            ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        }
    }

    /** Draw a glowing golden key */
    _drawKey(x, y, size) {
        const cx = x + size / 2;
        const cy = y + size / 2;
        const time = performance.now() / 800;

        // Glow effect
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.6);
        gradient.addColorStop(0, 'rgba(241, 196, 15, 0.8)');
        gradient.addColorStop(0.5, 'rgba(241, 196, 15, 0.3)');
        gradient.addColorStop(1, 'rgba(241, 196, 15, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, size, size);

        // Key shape
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.sin(time) * 0.1);

        // Key head (circle)
        ctx.beginPath();
        ctx.arc(0, -size * 0.15, size * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = '#f1c40f';
        ctx.fill();
        ctx.strokeStyle = '#d4a800';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Key shaft
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(-size * 0.04, -size * 0.05, size * 0.08, size * 0.3);
        
        // Key teeth
        ctx.fillRect(-size * 0.04, size * 0.15, size * 0.15, size * 0.05);
        ctx.fillRect(-size * 0.04, size * 0.22, size * 0.12, size * 0.05);

        ctx.restore();
    }

    /** Draw pulsing green exit portal */
    _drawExit(x, y, size) {
        const cx = x + size / 2;
        const cy = y + size / 2;
        const time = performance.now() / 600;
        const pulse = 0.8 + Math.sin(time) * 0.2;

        // Outer glow
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * pulse);
        gradient.addColorStop(0, `rgba(46, 204, 113, ${0.4})`);
        gradient.addColorStop(0.5, `rgba(46, 204, 113, ${0.2})`);
        gradient.addColorStop(1, 'rgba(46, 204, 113, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, size, size);

        // Portal frame
        ctx.save();
        ctx.translate(cx, cy);

        // Outer ring
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.35 * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#2ecc71';
        ctx.shadowBlur = 15 * pulse;
        ctx.stroke();

        // Inner fill
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.25 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(46, 204, 113, ${0.3})`;
        ctx.fill();

        // Center dot
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = '#2ecc71';
        ctx.shadowBlur = 25;
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    /** Draw bouncing gift box */
    _drawGiftBox(x, y, size) {
        const cx = x + size / 2;
        const cy = y + size / 2;
        const time = performance.now() / 400;
        const bounce = Math.abs(Math.sin(time)) * 2;

        ctx.save();
        ctx.translate(cx, cy - bounce);

        // Box body
        const half = size * 0.25;
        ctx.fillStyle = '#e74c3c';
        ctx.shadowColor = '#e74c3c';
        ctx.shadowBlur = 8;
        ctx.fillRect(-half, -half, half * 2, half * 2);

        // Ribbon cross
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(-2, -half, 4, half * 2);
        ctx.fillRect(-half, -2, half * 2, 4);

        // Bow
        ctx.beginPath();
        ctx.arc(-half * 0.3, -half * 1.1, half * 0.25, 0, Math.PI * 2);
        ctx.arc(half * 0.3, -half * 1.1, half * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = '#f1c40f';
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    /** Draw a guardian with red glow */
    _drawGuardian(guardian) {
        const cs = this.cellSize;
        const x = guardian.c * cs;
        const y = guardian.r * cs;
        const cx = x + cs / 2;
        const cy = y + cs / 2;
        const time = performance.now() / 400;
        const pulse = 0.9 + Math.sin(time) * 0.1;

        ctx.save();
        ctx.translate(cx, cy);

        // Red glow aura
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, cs * 0.6 * pulse);
        const alpha = guardian.frozen ? 0.3 : 0.6;
        grad.addColorStop(0, `rgba(231, 76, 60, ${alpha})`);
        grad.addColorStop(0.5, `rgba(231, 76, 60, ${alpha * 0.5})`);
        grad.addColorStop(1, 'rgba(231, 76, 60, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, cs * 0.6 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Guardian body (circle)
        ctx.beginPath();
        ctx.arc(0, 0, cs * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = guardian.frozen ? '#74b9ff' : '#e74c3c';
        ctx.shadowColor = guardian.frozen ? '#74b9ff' : '#e74c3c';
        ctx.shadowBlur = 15;
        ctx.fill();

        // Eyes
        const eyeOffset = cs * 0.12;
        const eyeSize = cs * 0.06;
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(-eyeOffset, -eyeOffset * 0.5, eyeSize, 0, Math.PI * 2);
        ctx.arc(eyeOffset, -eyeOffset * 0.5, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Pupils (look toward player)
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-eyeOffset + 1, -eyeOffset * 0.5, eyeSize * 0.4, 0, Math.PI * 2);
        ctx.arc(eyeOffset + 1, -eyeOffset * 0.5, eyeSize * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Pause indicator
        if (guardian.paused) {
            ctx.fillStyle = '#fff';
            ctx.font = `${cs * 0.2}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('💫', 0, cs * 0.45);
        }

        // Frozen indicator
        if (guardian.frozen) {
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = `${cs * 0.25}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('❄️', 0, cs * 0.45);
        }

        ctx.restore();
    }

    /** Draw player with blue aura */
    _drawPlayer() {
        const cs = this.cellSize;
        const x = this.player.c * cs;
        const y = this.player.r * cs;
        const cx = x + cs / 2;
        const cy = y + cs / 2;
        const time = performance.now() / 500;
        const pulse = 0.9 + Math.sin(time) * 0.1;

        ctx.save();
        ctx.translate(cx, cy);

        // Blue aura
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, cs * 0.7 * pulse);
        grad.addColorStop(0, 'rgba(0, 212, 255, 0.5)');
        grad.addColorStop(0.5, 'rgba(0, 212, 255, 0.2)');
        grad.addColorStop(1, 'rgba(0, 212, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, cs * 0.7 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Player body
        ctx.beginPath();
        ctx.arc(0, 0, cs * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = '#00d4ff';
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 20;
        ctx.fill();

        // Inner circle
        ctx.beginPath();
        ctx.arc(0, 0, cs * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = '#7fdbff';
        ctx.shadowBlur = 0;
        ctx.fill();

        // Eyes (facing direction - based on last move)
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-cs * 0.08, -cs * 0.08, cs * 0.04, 0, Math.PI * 2);
        ctx.arc(cs * 0.08, -cs * 0.08, cs * 0.04, 0, Math.PI * 2);
        ctx.fill();

        // Speed boost indicator
        if (this.player.speedBoost) {
            ctx.strokeStyle = 'rgba(241, 196, 15, 0.6)';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#f1c40f';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(0, 0, cs * 0.45, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }
}

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    // Make game accessible globally for debugging
    window.game = game;
});
