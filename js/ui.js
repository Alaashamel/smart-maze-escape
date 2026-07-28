/* ============================================================
   Smart Maze Escape - UI Manager
   Handles DOM updates, modals, event listeners, and screen transitions
   ============================================================ */

class UIManager {
    constructor(game) {
        this.game = game;
        this.modals = {
            level: document.getElementById('level-modal'),
            instructions: document.getElementById('instructions-modal'),
            gameover: document.getElementById('gameover-modal'),
            settings: document.getElementById('settings-modal')
        };
        
        this._bindEvents();
    }

    /** Bind all UI event listeners */
    _bindEvents() {
        // Top bar buttons
        document.getElementById('btn-restart').addEventListener('click', () => this.game.restart());
        document.getElementById('btn-levels').addEventListener('click', () => this.showLevelModal());
        document.getElementById('btn-instructions').addEventListener('click', () => this.showInstructionsModal());
        document.getElementById('btn-settings').addEventListener('click', () => this.showSettingsModal());

        // Settings controls
        const volumeSlider = document.getElementById('volume-slider');
        const muteToggle = document.getElementById('mute-toggle');
        volumeSlider.addEventListener('input', (e) => {
            const vol = parseInt(e.target.value) / 100;
            if (audio.masterGain) audio.masterGain.gain.value = vol;
            localStorage.setItem('maze-volume', e.target.value);
        });
        muteToggle.addEventListener('change', () => {
            audio.toggleMute();
            localStorage.setItem('maze-muted', muteToggle.checked);
        });

        // Level select buttons
        document.querySelectorAll('.select-level-btn').forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.level-card');
                const level = parseInt(card.dataset.level);
                this.game.setLevel(level);
                this.hideAllModals();
            });
        });

        // Close modal buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.hideAllModals());
        });

        // Modal overlay click to close
        Object.values(this.modals).forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.hideAllModals();
            });
        });

        // Game over buttons
        document.getElementById('btn-replay').addEventListener('click', () => {
            this.hideAllModals();
            this.game.restart();
        });
        document.getElementById('btn-levels-from-end').addEventListener('click', () => {
            this.hideAllModals();
            this.showLevelModal();
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            // Prevent page scrolling with arrow keys
            if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
                e.preventDefault();
            }
            
            // Map keys to directions
            const dirMap = {
                'arrowup': 'up', 'arrowdown': 'down',
                'arrowleft': 'left', 'arrowright': 'right',
                'w': 'up', 's': 'down',
                'a': 'left', 'd': 'right'
            };
            
            const dir = dirMap[key];
            if (dir && !this.game.isGameOver) {
                this.game.player.queueMove(dir);
            }
            
            // Space or Enter to restart
            if (key === ' ' || key === 'enter') {
                if (this.game.isGameOver) {
                    this.hideAllModals();
                    this.game.restart();
                }
            }
        });

        // Mobile control buttons
        document.querySelectorAll('.ctrl-btn').forEach(btn => {
            const handler = () => {
                const dir = btn.dataset.dir;
                if (dir && !this.game.isGameOver) {
                    this.game.player.queueMove(dir);
                }
            };
            btn.addEventListener('click', handler);
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handler();
            });
        });
    }

    /** Update the HUD (score, keys, timer, guardians) */
    updateHUD() {
        const player = this.game.player;
        const levelManager = this.game.levelManager;
        const guardians = this.game.guardians;

        document.getElementById('score-display').textContent = player.score;
        document.getElementById('keys-display').textContent = 
            `${player.keysCollected} / 3`;
        document.getElementById('timer-display').textContent = levelManager.getTimeString();
        document.getElementById('guardian-count').textContent = guardians.length;
        document.getElementById('level-display').textContent = `Level: ${levelManager.getLevelName()}`;
    }

    /** Show the level select modal */
    showLevelModal() {
        this.hideAllModals();
        this.modals.level.classList.remove('hidden');
    }

    /** Show the instructions modal */
    showInstructionsModal() {
        this.hideAllModals();
        this.modals.instructions.classList.remove('hidden');
    }

    /** Show the settings modal */
    showSettingsModal() {
        this.hideAllModals();
        this.modals.settings.classList.remove('hidden');
    }

    /** Show the game over modal with star rating */
    showGameOver(success) {
        const player = this.game.player;
        const levelManager = this.game.levelManager;
        const stars = levelManager.calculateStars(player.keysCollected, player.score);

        document.getElementById('gameover-title').textContent = 
            success ? '🎉 Congratulations!' : '💀 Game Over!';
        
        // Render stars
        const starsContainer = document.getElementById('stars-container');
        starsContainer.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const span = document.createElement('span');
            span.textContent = '⭐';
            span.className = i < stars ? 'star-filled' : 'star-empty';
            starsContainer.appendChild(span);
        }

        document.getElementById('final-score').textContent = player.score;
        document.getElementById('final-keys').textContent = player.keysCollected;
        document.getElementById('final-time').textContent = levelManager.getTimeString();
        document.getElementById('final-level').textContent = levelManager.getLevelName();

        this.hideAllModals();
        this.modals.gameover.classList.remove('hidden');
    }

    /** Hide all modals */
    hideAllModals() {
        Object.values(this.modals).forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    /** Show a temporary message on the canvas (e.g., "Speed Boost!") */
    showCanvasMessage(text) {
        // Rendered by the Game class, but we can add a DOM element overlay
        let msgEl = document.getElementById('canvas-message');
        if (!msgEl) {
            msgEl = document.createElement('div');
            msgEl.id = 'canvas-message';
            msgEl.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: var(--neon-gold, #f1c40f);
                font-size: 1.5rem;
                font-weight: bold;
                text-shadow: 0 0 20px rgba(241,196,15,0.5);
                pointer-events: none;
                z-index: 50;
                transition: opacity 0.5s;
            `;
            document.getElementById('game-container').appendChild(msgEl);
        }
        msgEl.textContent = text;
        msgEl.style.opacity = '1';
        setTimeout(() => { msgEl.style.opacity = '0'; }, 1500);
    }
}
