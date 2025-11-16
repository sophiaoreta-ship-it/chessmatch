// Simple sound effects using Web Audio API
class SoundManager {
    private audioContext: AudioContext | null = null
    private enabled: boolean = true

    constructor() {
        // Initialize audio context on first user interaction
        if (typeof window !== 'undefined') {
            this.audioContext = null // Will be created on first use
        }
    }

    private getAudioContext(): AudioContext {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        }
        return this.audioContext
    }

    // Soft "pop" sound for tile clearing
    playPop(): void {
        if (!this.enabled) return
        try {
            const ctx = this.getAudioContext()
            const oscillator = ctx.createOscillator()
            const gainNode = ctx.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(ctx.destination)

            oscillator.frequency.setValueAtTime(400, ctx.currentTime)
            oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1)

            gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

            oscillator.start(ctx.currentTime)
            oscillator.stop(ctx.currentTime + 0.1)
        } catch (e) {
            // Silently fail if audio is not available
        }
    }

    // Cascading chimes for multiple matches
    playCascade(level: number = 1): void {
        if (!this.enabled) return
        try {
            const ctx = this.getAudioContext()

            for (let i = 0; i < Math.min(level, 5); i++) {
                setTimeout(() => {
                    const oscillator = ctx.createOscillator()
                    const gainNode = ctx.createGain()

                    oscillator.connect(gainNode)
                    gainNode.connect(ctx.destination)

                    // Higher pitch for each cascade
                    const frequency = 300 + i * 100
                    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
                    oscillator.type = 'sine'

                    gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)

                    oscillator.start(ctx.currentTime)
                    oscillator.stop(ctx.currentTime + 0.15)
                }, i * 50)
            }
        } catch (e) {
            // Silently fail if audio is not available
        }
    }

    // Satisfying "whoosh" for pattern completion
    playWhoosh(): void {
        if (!this.enabled) return
        try {
            const ctx = this.getAudioContext()
            const oscillator = ctx.createOscillator()
            const gainNode = ctx.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(ctx.destination)

            // Sweep from high to low
            oscillator.frequency.setValueAtTime(600, ctx.currentTime)
            oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.3)
            oscillator.type = 'sawtooth'

            gainNode.gain.setValueAtTime(0.25, ctx.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

            oscillator.start(ctx.currentTime)
            oscillator.stop(ctx.currentTime + 0.3)
        } catch (e) {
            // Silently fail if audio is not available
        }
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled
    }
}

export const soundManager = new SoundManager()

