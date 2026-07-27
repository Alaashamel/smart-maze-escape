/* ============================================================
   Smart Maze Escape - Level Manager
   Defines and manages the 3-level system
   ============================================================ */

const LEVEL_CONFIG = {
    1: {
        name: 'Easy',
        description: '🌱 One guardian, no moving walls',
        mazeSize: 13,        // 13x13 maze
        maxGuardians: 1,
        guardianSpawnInterval: 30,   // seconds
        guardianSpeed: 0.35,
        hasMovingWalls: false,
        movingWallCount: 0,
        numKeys: 3,
        numGifts: 2,
        timeLimit: 0,          // 0 = no limit
        guardianStartR: 11,
        guardianStartC: 11
    },
    2: {
        name: 'Medium',
        description: '🔥 Two guardians with moving walls',
        mazeSize: 15,
        maxGuardians: 2,
        guardianSpawnInterval: 25,
        guardianSpeed: 0.4,
        hasMovingWalls: true,
        movingWallCount: 3,
        numKeys: 3,
        numGifts: 3,
        timeLimit: 180,        // 3 minutes
        guardianStartR: 13,
        guardianStartC: 13
    },
    3: {
        name: 'Hard',
        description: '💀 Three guardians, moving walls, time limit',
        mazeSize: 17,
        maxGuardians: 3,
        guardianSpawnInterval: 20,
        guardianSpeed: 0.45,
        hasMovingWalls: true,
        movingWallCount: 5,
        numKeys: 3,
        numGifts: 4,
        timeLimit: 150,        // 2.5 minutes
        guardianStartR: 15,
        guardianStartC: 15
    }
};

class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.config = LEVEL_CONFIG[1];
        this.elapsedTime = 0;
        this.guardianSpawnTimer = 0;
        this.guardiansSpawned = 0;
        this.startTime = 0;
        this.isTimeLimit = false;
    }

    /** Set the current level */
    setLevel(levelNum) {
        if (levelNum < 1 || levelNum > 3) levelNum = 1;
        this.currentLevel = levelNum;
        this.config = LEVEL_CONFIG[levelNum];
        this.reset();
    }

    /** Reset level state */
    reset() {
        this.elapsedTime = 0;
        this.guardianSpawnTimer = 0;
        this.guardiansSpawned = 0;
        this.startTime = Date.now();
        this.isTimeLimit = this.config.timeLimit > 0;
    }

    /** Update timers
     *  @param {number} deltaTime - seconds since last update
     */
    update(deltaTime) {
        this.elapsedTime += deltaTime;
        this.guardianSpawnTimer += deltaTime;
    }

    /** Check if it's time to spawn a new guardian */
    shouldSpawnGuardian() {
        if (this.guardiansSpawned >= this.config.maxGuardians) return false;
        if (this.guardianSpawnTimer >= this.config.guardianSpawnInterval) {
            this.guardianSpawnTimer = 0;
            this.guardiansSpawned++;
            return true;
        }
        return false;
    }

    /** Get appropriate starting position for a guardian */
    getGuardianStartPosition() {
        // Start from corner opposite to player
        const config = this.config;
        const offset = this.guardiansSpawned * 2;
        const r = Math.min(config.guardianStartR + offset, config.mazeSize - 2);
        const c = Math.min(config.guardianStartC + offset, config.mazeSize - 2);
        return { r, c };
    }

    /** Check if player ran out of time */
    hasTimeExpired() {
        if (!this.isTimeLimit) return false;
        return this.elapsedTime >= this.config.timeLimit;
    }

    /** Get formatted time string */
    getTimeString() {
        const totalSec = Math.floor(this.elapsedTime);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }

    /** Calculate star rating based on performance
     *  @param {number} keysCollected - How many keys player collected
     *  @param {number} score - Final score
     *  @returns {number} 1-3 stars
     */
    calculateStars(keysCollected, score) {
        let stars = 1;
        
        // Stars based on keys collected
        if (keysCollected >= 3) stars++;
        
        // Stars based on score
        const levelBase = this.currentLevel * 500;
        if (score >= levelBase + 200) stars++;
        
        // Bonus star for time (if under half time limit or under 60s for no limit)
        if (this.isTimeLimit) {
            if (this.elapsedTime < this.config.timeLimit * 0.5) stars++;
        } else if (this.elapsedTime < 60) {
            stars++;
        }
        
        return Math.min(3, Math.max(1, stars));
    }

    /** Get level name */
    getLevelName() {
        return this.config.name;
    }

    /** Get the level config */
    getConfig() {
        return this.config;
    }
}
