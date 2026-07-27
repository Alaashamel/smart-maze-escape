/* ============================================================
   Smart Maze Escape - Player
   Handles player movement, auras, and collision detection
   ============================================================ */

class Player {
    /**
     * @param {Maze} maze - Reference to the maze
     */
    constructor(maze) {
        this.maze = maze;
        this.r = maze.playerStart.r;
        this.c = maze.playerStart.c;
        this.keysCollected = 0;
        this.score = 0;
        this.speed = 1.0;         // Base movement speed (cells per move)
        this.speedBoost = false;
        this.speedBoostTimer = 0;
        this.speedBoostDuration = 5; // seconds
        this.isMoving = false;
        this.moveQueue = [];       // Queue of directions to move
    }

    /** Reset player state */
    reset(maze) {
        this.maze = maze;
        this.r = maze.playerStart.r;
        this.c = maze.playerStart.c;
        this.keysCollected = 0;
        this.speed = 1.0;
        this.speedBoost = false;
        this.speedBoostTimer = 0;
        this.isMoving = false;
        this.moveQueue = [];
    }

    /** Queue a movement direction */
    queueMove(direction) {
        this.moveQueue.push(direction);
        if (this.moveQueue.length > 3) {
            this.moveQueue.shift(); // Limit queue size
        }
    }

    /** Process queued moves. Returns true if a move was made. */
    processMove() {
        if (this.isMoving || this.moveQueue.length === 0) return false;

        const dir = this.moveQueue.shift();
        return this._move(dir);
    }

    /** Attempt to move in a direction. Returns true if moved. */
    _move(direction) {
        const moves = {
            'up': [-1, 0], 'down': [1, 0],
            'left': [0, -1], 'right': [0, 1],
            'w': [-1, 0], 's': [1, 0],
            'a': [0, -1], 'd': [0, 1],
            'arrowup': [-1, 0], 'arrowdown': [1, 0],
            'arrowleft': [0, -1], 'arrowright': [0, 1]
        };
        const move = moves[direction.toLowerCase()];
        if (!move) return false;

        const nr = this.r + move[0];
        const nc = this.c + move[1];

        if (!this.maze.isWalkable(nr, nc)) {
            // Wall collision
            audio.playWallHit();
            this._triggerShake();
            return false;
        }

        // Check if exit and has all keys
        if (this.maze.isExit(nr, nc)) {
            if (this.keysCollected < 3) return false; // Locked
            // Will be handled by game logic
        }

        this.r = nr;
        this.c = nc;
        this.isMoving = true;
        // Reset isMoving after a short delay for animation
        setTimeout(() => { this.isMoving = false; }, 150 / this.speed);
        return true;
    }

    /** Update speed boost timer */
    update(deltaTime) {
        if (this.speedBoost) {
            this.speedBoostTimer -= deltaTime;
            if (this.speedBoostTimer <= 0) {
                this.speedBoost = false;
                this.speed = 1.0;
            }
        }
    }

    /** Activate speed boost */
    activateSpeedBoost() {
        this.speedBoost = true;
        this.speedBoostTimer = this.speedBoostDuration;
        this.speed = 1.8;
        audio.playSpeedBoost();
    }

    /** Trigger screen shake effect */
    _triggerShake() {
        const canvas = document.getElementById('game-canvas');
        canvas.classList.remove('shake');
        // Force reflow
        void canvas.offsetWidth;
        canvas.classList.add('shake');
        setTimeout(() => canvas.classList.remove('shake'), 300);
    }

    /** Check if player is at given position */
    isAt(r, c) {
        return this.r === r && this.c === c;
    }

    /** Collect a key */
    collectKey() {
        this.keysCollected++;
        this.score += 100;
        audio.playKeyCollect();
    }

    /** Collect a gift box (returns powerup type) */
    collectGiftBox() {
        this.score += 50;
        audio.playGiftCollect();
        // Randomly return 'speed' or 'freeze'
        return Math.random() < 0.5 ? 'speed' : 'freeze';
    }
}

