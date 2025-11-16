import { useEffect, useState } from 'react'

type ScreenShakeProps = {
    intensity: number // 0-1, controls shake strength
    duration: number // milliseconds
    onComplete?: () => void
}

export const ScreenShake = ({ intensity, duration, onComplete }: ScreenShakeProps) => {
    const [isShaking, setIsShaking] = useState(false)

    useEffect(() => {
        if (intensity > 0) {
            setIsShaking(true)
            const timer = setTimeout(() => {
                setIsShaking(false)
                if (onComplete) onComplete()
            }, duration)
            return () => clearTimeout(timer)
        }
    }, [intensity, duration, onComplete])

    if (!isShaking) return null

    const shakeAmount = intensity * 10 // Max 10px shake

    return (
        <div
            className="fixed inset-0 pointer-events-none z-50"
            style={{
                animation: `screenShake ${duration}ms ease-out`,
                transform: `translate(${Math.random() * shakeAmount - shakeAmount / 2}px, ${Math.random() * shakeAmount - shakeAmount / 2}px)`,
            }}
        />
    )
}



