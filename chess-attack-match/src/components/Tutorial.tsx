import { useState, useEffect } from 'react'
import { useGameStore } from '../state/useGameStore'

type TutorialStep = {
    id: string
    title: string
    description: string
    highlight?: 'board' | 'hud' | 'tiles'
    action?: 'tap' | 'swap' | 'wait'
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to Chess Attack!',
        description: 'Match chess pieces by swapping adjacent tiles to form patterns.',
        highlight: 'board',
        action: 'wait',
    },
    {
        id: 'swap',
        title: 'How to Play',
        description: 'Tap a tile, then tap an adjacent tile to swap them.',
        highlight: 'tiles',
        action: 'swap',
    },
    {
        id: 'patterns',
        title: 'Form Patterns',
        description: 'Create patterns like 3+ rooks in a line, 4 knights in an L-shape, or 4 pawns in a square.',
        highlight: 'board',
        action: 'wait',
    },
    {
        id: 'cascades',
        title: 'Cascades',
        description: 'When tiles fall, they may create new matches automatically!',
        highlight: 'board',
        action: 'wait',
    },
]

export const Tutorial = () => {
    const [currentStep, setCurrentStep] = useState(0)
    const [isVisible, setIsVisible] = useState(false)
    const status = useGameStore((state) => state.status)
    const levelIndex = useGameStore((state) => state.levelIndex)

    useEffect(() => {
        // Show tutorial only on first level
        if (levelIndex === 0 && status === 'playing') {
            const hasSeenTutorial = localStorage.getItem('hasSeenTutorial')
            if (!hasSeenTutorial) {
                setIsVisible(true)
            }
        }
    }, [levelIndex, status])

    if (!isVisible || currentStep >= TUTORIAL_STEPS.length) {
        return null
    }

    const step = TUTORIAL_STEPS[currentStep]

    const handleNext = () => {
        if (currentStep < TUTORIAL_STEPS.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            setIsVisible(false)
            localStorage.setItem('hasSeenTutorial', 'true')
        }
    }

    const handleSkip = () => {
        setIsVisible(false)
        localStorage.setItem('hasSeenTutorial', 'true')
    }

    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center">
            <div className="bg-slate-800 rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
                <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
                <p className="text-slate-300 mb-6">{step.description}</p>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleSkip}
                        className="flex-1 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                    >
                        Skip
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors font-semibold"
                    >
                        {currentStep === TUTORIAL_STEPS.length - 1 ? 'Start Playing' : 'Next'}
                    </button>
                </div>
                <div className="mt-4 flex gap-1 justify-center">
                    {TUTORIAL_STEPS.map((_, index) => (
                        <div
                            key={index}
                            className={`h-2 rounded-full transition-all ${
                                index === currentStep ? 'bg-blue-500 w-8' : 'bg-slate-600 w-2'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}



