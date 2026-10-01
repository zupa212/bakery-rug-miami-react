/**
 * Web Audio API synthesized notification chimes for BakersRug Admin.
 * Zero external audio files or network dependencies required.
 */

class AudioNotificationService {
    private audioCtx: AudioContext | null = null;
    private soundEnabled: boolean = true;

    constructor() {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('rug_admin_sound_enabled');
            this.soundEnabled = saved !== null ? saved === 'true' : true;
        }
    }

    private getAudioContext(): AudioContext | null {
        if (typeof window === 'undefined') return null;
        if (!this.audioCtx) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                this.audioCtx = new AudioContextClass();
            }
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().catch(() => {});
        }
        return this.audioCtx;
    }

    public isSoundEnabled(): boolean {
        return this.soundEnabled;
    }

    public setSoundEnabled(enabled: boolean): void {
        this.soundEnabled = enabled;
        if (typeof window !== 'undefined') {
            localStorage.setItem('rug_admin_sound_enabled', String(enabled));
        }
    }

    public toggleSound(): boolean {
        this.setSoundEnabled(!this.soundEnabled);
        if (this.soundEnabled) {
            this.playChime('success');
        }
        return this.soundEnabled;
    }

    /**
     * Play a luxury harmonic bell chime.
     * @param type 'lead' (ascending high-priority lead chime) | 'success' (subtle 2-tone chime) | 'alert'
     */
    public playChime(type: 'lead' | 'success' | 'alert' = 'lead'): void {
        if (!this.soundEnabled) return;

        const ctx = this.getAudioContext();
        if (!ctx) return;

        try {
            const now = ctx.currentTime;

            if (type === 'lead') {
                // Luxury 3-tone ascending chime (D5 -> A5 -> D6)
                const notes = [
                    { freq: 587.33, start: 0, duration: 0.8, gain: 0.18 }, // D5
                    { freq: 880.00, start: 0.14, duration: 1.0, gain: 0.22 }, // A5
                    { freq: 1174.66, start: 0.28, duration: 1.4, gain: 0.25 }, // D6
                ];

                notes.forEach(({ freq, start, duration, gain }) => {
                    const osc = ctx.createOscillator();
                    const gainNode = ctx.createGain();

                    // Sine + gentle triangle blend for warm bell timbre
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + start);

                    gainNode.gain.setValueAtTime(0.001, now + start);
                    gainNode.gain.exponentialRampToValueAtTime(gain, now + start + 0.03);
                    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

                    osc.connect(gainNode);
                    gainNode.connect(ctx.destination);

                    osc.start(now + start);
                    osc.stop(now + start + duration);
                });
            } else if (type === 'success') {
                // Pleasant 2-tone confirmation chime (A5 -> E6)
                const notes = [
                    { freq: 880.00, start: 0, duration: 0.5, gain: 0.12 },
                    { freq: 1318.51, start: 0.12, duration: 0.8, gain: 0.15 },
                ];

                notes.forEach(({ freq, start, duration, gain }) => {
                    const osc = ctx.createOscillator();
                    const gainNode = ctx.createGain();

                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + start);

                    gainNode.gain.setValueAtTime(0.001, now + start);
                    gainNode.gain.exponentialRampToValueAtTime(gain, now + start + 0.02);
                    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

                    osc.connect(gainNode);
                    gainNode.connect(ctx.destination);

                    osc.start(now + start);
                    osc.stop(now + start + duration);
                });
            } else {
                // Subtle attention alert
                const osc = ctx.createOscillator();
                const gainNode = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(783.99, now); // G5
                osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.15); // C6

                gainNode.gain.setValueAtTime(0.001, now);
                gainNode.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

                osc.connect(gainNode);
                gainNode.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + 0.7);
            }
        } catch (e) {
            console.warn('Audio chime playback failed:', e);
        }
    }
}

export const audioNotification = new AudioNotificationService();
