/* ============================================================
   Smart Maze Escape - Audio Manager
   Web Audio API for sound effects and music
   ============================================================ */

class AudioManager {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.masterGain = null;
        this._initOnInteraction = this._initOnInteraction.bind(this);
        // Init on first user interaction (browser autoplay policy)
        document.addEventListener('click', this._initOnInteraction, { once: true });
        document.addEventListener('keydown', this._initOnInteraction, { once: true });
    }

    /** Lazily initialize AudioContext on first interaction */
    _initOnInteraction() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.3; // Master volume
            this.masterGain.connect(this.ctx.destination);
        } catch (e) {
            console.warn('Web Audio API not available:', e);
        }
    }

    /** Toggle mute */
    toggleMute() {
        this.muted = !this.muted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.muted ? 0 : 0.3;
        }
        return this.muted;
    }

    /** Play a simple synthesized tone
     *  @param {number} freq - Frequency in Hz
     *  @param {string} type - Oscillator type (sine, square, triangle, sawtooth)
     *  @param {number} duration - Duration in seconds
     *  @param {number} [volume=0.15] - Volume 0-1
     */
    _playTone(freq, type, duration, volume = 0.15) {
        if (!this.ctx || this.muted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    /** Play a melody (array of notes) */
    _playMelody(notes, baseTime = 0.1) {
        if (!this.ctx || this.muted) return;
        notes.forEach(([freq, dur], i) => {
            setTimeout(() => this._playTone(freq, 'sine', dur, 0.12), i * baseTime * 1000);
        });
    }

    /** Key collection sound - ascending chime */
    playKeyCollect() {
        this._playMelody([
            [523, 0.1], [659, 0.1], [784, 0.15]
        ], 0.08);
    }

    /** Gift box collection - magical sparkle */
    playGiftCollect() {
        this._playMelody([
            [880, 0.08], [1047, 0.08], [1319, 0.08], [1568, 0.12]
        ], 0.06);
    }

    /** Guardian alert - ominous low tone */
    playGuardianAlert() {
        this._playTone(110, 'sawtooth', 0.5, 0.1);
        setTimeout(() => this._playTone(98, 'sawtooth', 0.4, 0.08), 300);
    }

    /** Player hit / game over - descending tone */
    playGameOver() {
        this._playMelody([
            [440, 0.2], [370, 0.2], [311, 0.2], [262, 0.4]
        ], 0.12);
    }

    /** Door unlock - triumphant chord */
    playDoorUnlock() {
        this._playTone(523, 'sine', 0.3, 0.1);
        setTimeout(() => this._playTone(659, 'sine', 0.3, 0.1), 100);
        setTimeout(() => this._playTone(784, 'sine', 0.5, 0.12), 200);
    }

    /** Victory fanfare */
    playVictory() {
        this._playMelody([
            [523, 0.15], [587, 0.15], [659, 0.15], [784, 0.15],
            [880, 0.15], [1047, 0.3], [784, 0.15], [1047, 0.5]
        ], 0.1);
    }

    /** Speed boost activate */
    playSpeedBoost() {
        this._playTone(880, 'sine', 0.1, 0.08);
        setTimeout(() => this._playTone(1109, 'sine', 0.15, 0.1), 80);
    }

    /** Freeze activate - icy shimmer */
    playFreeze() {
        this._playMelody([
            [1200, 0.08], [1400, 0.08], [1600, 0.08], [1800, 0.12]
        ], 0.05);
    }

    /** Level start jingle */
    playLevelStart() {
        this._playMelody([
            [392, 0.1], [440, 0.1], [494, 0.1], [523, 0.2]
        ], 0.1);
    }

    /** Wall collision - short thud */
    playWallHit() {
        this._playTone(80, 'triangle', 0.12, 0.06);
    }
}

// Global instance
const audio = new AudioManager();

