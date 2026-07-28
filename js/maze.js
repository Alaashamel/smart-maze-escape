/* ============================================================
   Smart Maze Escape - Maze Generator
   DFS-based maze generation with guaranteed solvable path
   ============================================================ */

class Maze {
    /**
     * @param {number} rows - Number of rows (should be odd for proper walls)
     * @param {number} cols - Number of columns (should be odd)
     * @param {number} level - Current level (1-3)
     */
    constructor(rows = 15, cols = 15, level = 1) {
        this.rows = rows;
        this.cols = cols;
        this.level = level;
        // Grid: 0 = path, 1 = wall, 2 = key, 3 = exit, 4 = gift box
        this.grid = [];
        this.keys = [];           // Positions of keys [{r, c}]
        this.giftBoxes = [];      // Positions of gift boxes [{r, c}]
        this.exitPos = { r: 0, c: 0 };
        this.playerStart = { r: 0, c: 0 };
        this.movingWalls = [];    // {r, c, dir, timer} for medium/hard
    }

    /** Generate a maze using DFS (recursive backtracker) */
    generate() {
        // Initialize grid with all walls
        this.grid = Array.from({ length: this.rows }, () =>
            Array(this.cols).fill(1)
        );

        // Carve paths (only odd cells to maintain wall integrity)
        const startR = 1, startC = 1;
        this._carve(startR, startC);

        // Set player start and exit
        this.playerStart = { r: 1, c: 1 };
        this.exitPos = { r: this.rows - 2, c: this.cols - 2 };
        this.grid[this.exitPos.r][this.exitPos.c] = 3; // Exit

        // Place keys in accessible locations
        this._placeKeys();

        // Place gift boxes randomly
        this._placeGiftBoxes();

        // Setup moving walls for level 2 and 3
        if (this.level >= 2) {
            this._setupMovingWalls();
        }

        return this.grid;
    }

    /** DFS recursive backtracker to carve paths */
    _carve(r, c) {
        this.grid[r][c] = 0; // Carve path
        // Randomize directions
        const dirs = this._shuffle([
            [0, 2], [0, -2], [2, 0], [-2, 0]
        ]);
        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr > 0 && nr < this.rows - 1 &&
                nc > 0 && nc < this.cols - 1 &&
                this.grid[nr][nc] === 1) {
                // Carve wall between
                this.grid[r + dr / 2][c + dc / 2] = 0;
                this._carve(nr, nc);
            }
        }
    }

    /** Fisher-Yates shuffle */
    _shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /** Get all path cells (excluding player start, exit, keys) */
    _getPathCells() {
        const cells = [];
        for (let r = 1; r < this.rows - 1; r++) {
            for (let c = 1; c < this.cols - 1; c++) {
                if (this.grid[r][c] === 0) {
                    cells.push({ r, c });
                }
            }
        }
        return cells;
    }

    /** Place keys in path cells far from start */
    _placeKeys() {
        const numKeys = 3;
        const pathCells = this._getPathCells()
            .filter(cell => {
                const dist = Math.abs(cell.r - this.playerStart.r) +
                             Math.abs(cell.c - this.playerStart.c);
                return dist > 6; // Ensure some distance from start
            });
        this._shuffle(pathCells);
        for (let i = 0; i < Math.min(numKeys, pathCells.length); i++) {
            const { r, c } = pathCells[i];
            this.grid[r][c] = 2; // Key
            this.keys.push({ r, c });
        }
    }

    /** Place gift boxes randomly */
    _placeGiftBoxes() {
        const numGifts = this.level === 1 ? 2 : this.level === 2 ? 3 : 4;
        const pathCells = this._getPathCells()
            .filter(cell => this.grid[cell.r][cell.c] === 0);
        this._shuffle(pathCells);
        for (let i = 0; i < Math.min(numGifts, pathCells.length); i++) {
            const { r, c } = pathCells[i];
            this.grid[r][c] = 4; // Gift box
            this.giftBoxes.push({ r, c });
        }
    }

    /** Setup moving walls for level 2+ */
    _setupMovingWalls() {
        // Find wall cells adjacent to paths
        const wallCells = [];
        for (let r = 1; r < this.rows - 1; r++) {
            for (let c = 1; c < this.cols - 1; c++) {
                if (this.grid[r][c] === 1) {
                    // Check if adjacent to at least one path
                    const adjPaths = [
                        [0, 1], [0, -1], [1, 0], [-1, 0]
                    ].filter(([dr, dc]) => {
                        const nr = r + dr, nc = c + dc;
                        return nr >= 0 && nr < this.rows &&
                               nc >= 0 && nc < this.cols &&
                               this.grid[nr][nc] === 0;
                    });
                    if (adjPaths.length >= 2) {
                        wallCells.push({ r, c });
                    }
                }
            }
        }
        this._shuffle(wallCells);
        const numMoving = this.level === 2 ? 3 : 5;
        for (let i = 0; i < Math.min(numMoving, wallCells.length); i++) {
            const { r, c } = wallCells[i];
            this.movingWalls.push({
                r, c,
                active: false,    // false = wall visible, true = path
                timer: 0,
                interval: 10,     // Toggle every 10 seconds
                originalType: 1   // Was originally a wall
            });
        }
    }

    /** Update moving walls (toggle every 10 seconds) */
    updateMovingWalls(deltaTime) {
        if (this.level < 2) return;
        for (const mw of this.movingWalls) {
            mw.timer += deltaTime;
            if (mw.timer >= mw.interval) {
                mw.timer = 0;
                mw.active = !mw.active;
                if (mw.active) {
                    // Wall opens (becomes path)
                    if (this.grid[mw.r][mw.c] === 1) {
                        this.grid[mw.r][mw.c] = 0;
                    }
                } else {
                    // Wall closes (becomes wall again)
                    this.grid[mw.r][mw.c] = 1;
                }
            }
        }
    }

    /** Reset moving walls to original state */
    resetMovingWalls() {
        for (const mw of this.movingWalls) {
            this.grid[mw.r][mw.c] = mw.originalType;
            mw.active = false;
            mw.timer = 0;
        }
    }

    /** Validate maze is solvable using BFS from start to exit */
    validate() {
        const visited = Array.from({ length: this.rows }, () =>
            Array(this.cols).fill(false)
        );
        const queue = [{ r: this.playerStart.r, c: this.playerStart.c }];
        visited[this.playerStart.r][this.playerStart.c] = true;
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        while (queue.length > 0) {
            const { r, c } = queue.shift();
            if (r === this.exitPos.r && c === this.exitPos.c) return true;
            for (const [dr, dc] of dirs) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols &&
                    !visited[nr][nc] && this.grid[nr][nc] !== 1) {
                    visited[nr][nc] = true;
                    queue.push({ r: nr, c: nc });
                }
            }
        }
        return false;
    }

    /** Check if a cell is walkable */
    isWalkable(r, c) {
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return false;
        return this.grid[r][c] !== 1; // Not a wall
    }

    /** Check if a cell is the exit (requires all keys collected) */
    isExit(r, c) {
        return r === this.exitPos.r && c === this.exitPos.c;
    }

    /** Check if a cell has a key */
    isKey(r, c) {
        return this.grid[r][c] === 2;
    }

    /** Check if a cell has a gift box */
    isGiftBox(r, c) {
        return this.grid[r][c] === 4;
    }

    /** Collect a key at position */
    collectKey(r, c) {
        if (this.grid[r][c] === 2) {
            this.grid[r][c] = 0; // Remove key
            this.keys = this.keys.filter(k => k.r !== r || k.c !== c);
            return true;
        }
        return false;
    }

    /** Collect a gift box at position */
    collectGiftBox(r, c) {
        if (this.grid[r][c] === 4) {
            this.grid[r][c] = 0;
            this.giftBoxes = this.giftBoxes.filter(g => g.r !== r || g.c !== c);
            return true;
        }
        return false;
    }
}

