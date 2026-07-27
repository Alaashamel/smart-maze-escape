/* ============================================================
   Smart Maze Escape - Puzzle Manager
   Handles key/door logic, gift box powerups, and exit validation
   ============================================================ */

class PuzzleManager {
    /**
     * @param {Maze} maze - Reference to the maze
     * @param {Player} player - Reference to the player
     */
    constructor(maze, player) {
        this.maze = maze;
        this.player = player;
        this.totalKeys = 3;
        this.keysCollected = 0;
        this.exitUnlocked = false;
        this.powerupActive = null;   // 'speed' or 'freeze' or null
        this.powerupTimer = 0;
        this.powerupDuration = 5;    // Seconds
    }

    /** Reset puzzle state */
    reset(maze, player) {
        this.maze = maze;
        this.player = player;
        this.keysCollected = 0;
        this.exitUnlocked = false;
        this.powerupActive = null;
        this.powerupTimer = 0;
    }

    /** Check and handle player interactions with maze elements
     *  @returns {Object|null} { type: 'key'|'gift'|'exit', powerup?: string }
     */
    checkInteractions() {
        const { r, c } = this.player;

        // Check for key pickup
        if (this.maze.isKey(r, c)) {
            this.maze.collectKey(r, c);
            this.keysCollected++;
            this.player.collectKey();
            
            if (this.keysCollected >= this.totalKeys) {
                this.exitUnlocked = true;
                audio.playDoorUnlock();
            }
            return { type: 'key' };
        }

        // Check for gift box pickup
        if (this.maze.isGiftBox(r, c)) {
            const powerup = this.maze.collectGiftBox(r, c) 
                ? this.player.collectGiftBox() 
                : null;
            
            if (powerup) {
                this.activatePowerup(powerup);
                return { type: 'gift', powerup };
            }
        }

        // Check for exit
        if (this.maze.isExit(r, c) && this.exitUnlocked) {
            return { type: 'exit' };
        }

        return null;
    }

    /** Activate a powerup */
    activatePowerup(type) {
        this.powerupActive = type;
        this.powerupTimer = this.powerupDuration;

        if (type === 'speed') {
            this.player.activateSpeedBoost();
        } else if (type === 'freeze') {
            audio.playFreeze();
        }
    }

    /** Update powerup timers */
    update(deltaTime) {
        if (this.powerupActive) {
            this.powerupTimer -= deltaTime;
            if (this.powerupTimer <= 0) {
                this.powerupActive = null;
                this.powerupTimer = 0;
            }
        }
    }

    /** Check if the exit should be rendered as unlocked */
    isExitAccessible() {
        return this.exitUnlocked;
    }

    /** Get remaining keys needed */
    getKeysRemaining() {
        return Math.max(0, this.totalKeys - this.keysCollected);
    }
}
