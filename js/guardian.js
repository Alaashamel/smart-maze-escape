/* ============================================================
   Smart Maze Escape - Guardian AI
   BFS pathfinding chaser with smart wall-penalty system
   ============================================================ */

class Guardian {
    /**
     * @param {Maze} maze - Reference to the maze
     * @param {number} id - Guardian identifier
     * @param {number} startR - Starting row
     * @param {number} startC - Starting column
     */
    constructor(maze, id, startR, startC) {
        this.maze = maze;
        this.id = id;
        this.r = startR;
        this.c = startC;
        this.speed = 0.4;           // Moves every ~2.5 sec at base (cells per sec)
        this.moveTimer = 0;
        this.moveInterval = 1.0;    // Move every 1 second
        this.baseMoveInterval = 1.0;
        this.paused = false;
        this.pauseTimer = 0;
        this.pauseDuration = 1.0;   // Pause 1 sec after wall hit
        this.frozen = false;
        this.freezeTimer = 0;
        this.path = [];             // Current BFS path to player
        this.repathTimer = 0;
        this.repathInterval = 0.5;  // Recalculate path every 0.5 sec
        this.caughtPlayer = false;
    }

    /** Reset guardian state */
    reset(maze, startR, startC) {
        this.maze = maze;
        this.r = startR;
        this.c = startC;
        this.moveTimer = 0;
        this.paused = false;
        this.pauseTimer = 0;
        this.frozen = false;
        this.freezeTimer = 0;
        this.path = [];
        this.repathTimer = 0;
        this.caughtPlayer = false;
    }

    /** BFS shortest path algorithm to find the player
     *  @param {number} targetR - Player row
     *  @param {number} targetC - Player column
     *  @returns {Array} Array of [r, c] steps to reach target (empty if unreachable)
     */
    findPath(targetR, targetC) {
        const rows = this.maze.rows;
        const cols = this.maze.cols;
        const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
        const parent = Array.from({ length: rows }, () => Array(cols).fill(null));

        const queue = [{ r: this.r, c: this.c }];
        visited[this.r][this.c] = true;

        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        while (queue.length > 0) {
            const curr = queue.shift();

            // Reached target
            if (curr.r === targetR && curr.c === targetC) {
                // Reconstruct path
                const path = [];
                let node = curr;
                while (node) {
                    path.unshift({ r: node.r, c: node.c });
                    node = parent[node.r][node.c];
                }
                return path;
            }

            for (const [dr, dc] of directions) {
                const nr = curr.r + dr;
                const nc = curr.c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
                    !visited[nr][nc] && this.maze.isWalkable(nr, nc)) {
                    visited[nr][nc] = true;
                    parent[nr][nc] = { r: curr.r, c: curr.c };
                    queue.push({ r: nr, c: nc });
                }
            }
        }

        return []; // No path found
    }

    /** Update guardian AI
     *  @param {number} deltaTime - Time since last update in seconds
     *  @param {number} playerR - Player's current row
     *  @param {number} playerC - Player's current column
     *  @returns {boolean} True if guardian caught the player
     */
    update(deltaTime, playerR, playerC) {
        // Handle freeze state
        if (this.frozen) {
            this.freezeTimer -= deltaTime;
            if (this.freezeTimer <= 0) {
                this.frozen = false;
            }
            return false; // Can't move while frozen
        }

        // Handle pause state (wall penalty)
        if (this.paused) {
            this.pauseTimer -= deltaTime;
            if (this.pauseTimer <= 0) {
                this.paused = false;
            }
            return false;
        }

        // Recalculate BFS path periodically
        this.repathTimer += deltaTime;
        if (this.repathTimer >= this.repathInterval || this.path.length === 0) {
            this.repathTimer = 0;
            this.path = this.findPath(playerR, playerC);
        }

        // Move along path
        this.moveTimer += deltaTime;
        if (this.moveTimer >= this.moveInterval) {
            this.moveTimer = 0;

            if (this.path.length > 1) {
                const nextStep = this.path[1]; // Index 0 is current position
                // Check if next step is walkable (moving walls could have changed it)
                if (this.maze.isWalkable(nextStep.r, nextStep.c)) {
                    this.r = nextStep.r;
                    this.c = nextStep.c;
                    // Remove current position from path
                    this.path.shift();
                } else {
                    // Wall appeared in path! Pause as penalty
                    this.paused = true;
                    this.pauseTimer = this.pauseDuration;
                    this.path = []; // Force repath
                    return false;
                }
            }
        }

        // Check if caught the player
        if (this.r === playerR && this.c === playerC) {
            this.caughtPlayer = true;
            return true;
        }

        return false;
    }

    /** Freeze this guardian for a duration */
    freeze(duration = 5) {
        this.frozen = true;
        this.freezeTimer = duration;
    }

    /** Scale speed based on difficulty multiplier (1.0 = base, 2.0 = double speed) */
    scaleSpeed(multiplier) {
        this.moveInterval = this.baseMoveInterval / multiplier;
    }

    /** Get the current visual state for rendering */
    getState() {
        return {
            r: this.r,
            c: this.c,
            paused: this.paused,
            frozen: this.frozen
        };
    }
}
