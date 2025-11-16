import { useEffect, useState, useRef } from 'react'

type Particle = {
    id: string
    x: number
    y: number
    vx: number
    vy: number
    size: number
    color: string
    life: number
    maxLife: number
}

type ParticleEffectProps = {
    x: number // Center X position in pixels
    y: number // Center Y position in pixels
    type: 'sparkle' | 'star' | 'confetti' | 'combo'
    onComplete?: () => void
}

const PARTICLE_COLORS = {
    sparkle: ['#FFD700', '#FFA500', '#FFFF00', '#FFE135'],
    star: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4'],
    confetti: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'],
    combo: ['#FFD700', '#FF6B6B', '#4ECDC4', '#9B59B6', '#E74C3C'],
}

export const ParticleEffect = ({ x, y, type, onComplete }: ParticleEffectProps) => {
    const [particles, setParticles] = useState<Particle[]>([])
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const count = type === 'combo' ? 30 : type === 'confetti' ? 20 : 15
        const newParticles: Particle[] = []
        const colors = PARTICLE_COLORS[type]

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
            const speed = type === 'combo' ? 2 + Math.random() * 3 : 1 + Math.random() * 2
            const vx = Math.cos(angle) * speed
            const vy = Math.sin(angle) * speed

            newParticles.push({
                id: `${i}-${Date.now()}-${Math.random()}`,
                x: 0, // Start at center, will be positioned relative to container
                y: 0,
                vx,
                vy,
                size: type === 'combo' ? 4 + Math.random() * 4 : 3 + Math.random() * 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 0,
                maxLife: type === 'combo' ? 1000 : 800,
            })
        }

        setParticles(newParticles)

        let animationFrame: number

        const animate = () => {
            setParticles((prev) => {
                const updated = prev
                    .map((p) => ({
                        ...p,
                        x: p.x + p.vx * 0.5,
                        y: p.y + p.vy * 0.5,
                        vy: p.vy + 0.1, // Gravity
                        life: p.life + 16, // ~60fps
                    }))
                    .filter((p) => p.life < p.maxLife)

                if (updated.length === 0) {
                    if (onComplete) onComplete()
                    return updated
                }

                animationFrame = requestAnimationFrame(animate)
                return updated
            })
        }

        animationFrame = requestAnimationFrame(animate)

        return () => {
            if (animationFrame) cancelAnimationFrame(animationFrame)
        }
    }, [x, y, type, onComplete])

    if (!containerRef.current) {
        return (
            <div
                ref={containerRef}
                className="absolute pointer-events-none"
                style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1000,
                }}
            />
        )
    }

    return (
        <div
            ref={containerRef}
            className="absolute pointer-events-none"
            style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
            }}
        >
            {particles.map((particle) => {
                const opacity = Math.max(0, 1 - particle.life / particle.maxLife)
                return (
                    <div
                        key={particle.id}
                        className="absolute rounded-full"
                        style={{
                            left: `${particle.x}px`,
                            top: `${particle.y}px`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            backgroundColor: particle.color,
                            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                            opacity,
                            transform: 'translate(-50%, -50%)',
                        }}
                    />
                )
            })}
        </div>
    )
}

