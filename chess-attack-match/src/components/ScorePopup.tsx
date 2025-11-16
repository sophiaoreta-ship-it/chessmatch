import { useEffect, useState } from 'react'

type ScorePopupProps = {
    score: number
    x: number
    y: number
    multiplier?: number
    onComplete: () => void
}

export const ScorePopup = ({ score, x, y, multiplier, onComplete }: ScorePopupProps) => {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false)
            setTimeout(onComplete, 300) // Wait for fade-out animation
        }, 1500)

        return () => clearTimeout(timer)
    }, [onComplete])

    if (!isVisible) return null

    const displayScore = multiplier ? `${score} × ${multiplier}` : `+${score}`

    return (
        <div
            className="absolute pointer-events-none z-50"
            style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
            }}
        >
            <div
                className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg"
                style={{
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 0 16px rgba(255, 255, 255, 0.3)',
                    animation: 'scoreFloat 1.5s ease-out forwards',
                }}
            >
                {multiplier && (
                    <div className="text-amber-400 animate-pulse text-sm mb-1">COMBO {multiplier}x</div>
                )}
                <div className={multiplier ? 'text-emerald-400' : 'text-yellow-300'}>
                    {displayScore}
                </div>
            </div>
        </div>
    )
}

