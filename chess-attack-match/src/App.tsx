import { useMemo } from 'react'
import { Board } from './components/Board'
import { HUD } from './components/HUD'
import { LevelComplete } from './components/LevelComplete'
import { Tutorial } from './components/Tutorial'
import { useGameStore } from './state/useGameStore'
import { figmaImages } from './design/figmaTokens'
import type { LevelGoal } from './game/types'

const obstacleLabels: Record<string, string> = {
    ice: 'Ice',
    crate: 'Crates',
    stone: 'Stones',
    vine: 'Vines',
    lock: 'Locks',
    cobweb: 'Cobwebs',
    frozen: 'Frozen Tiles',
}

const tokenLabels: Record<string, string> = {
    king: 'King',
    shield: 'Shield',
    sword: 'Sword',
}

const describeGoal = (
    goal: LevelGoal,
    progress: number,
    target: number,
): { headline: string; progressLabel: string } => {
    switch (goal.type) {
        case 'score':
            return {
                headline: `Score ${target.toLocaleString()} points`,
                progressLabel: `${progress.toLocaleString()} / ${target.toLocaleString()}`,
            }
        case 'clearObstacles':
            return {
                headline: `Clear ${target} ${obstacleLabels[goal.obstacleType] ?? goal.obstacleType}`,
                progressLabel: `${progress} / ${target}`,
            }
        case 'dropTokens':
            return {
                headline: `Drop ${target} ${tokenLabels[goal.tokenType] ?? goal.tokenType}${target > 1 ? 's' : ''}`,
                progressLabel: `${progress} / ${target}`,
            }
        case 'clearBoard':
            return {
                headline: 'Clear the entire board',
                progressLabel: progress >= target ? 'Complete!' : 'In progress...',
            }
        case 'combination':
            return {
                headline: `Complete ${goal.goals.length} objectives`,
                progressLabel: `${progress} / ${target}`,
            }
        default:
            return {
                headline: 'Complete the mission',
                progressLabel: `${progress} / ${target}`,
            }
    }
}

const App = () => {
    const levelIndex = useGameStore((state) => state.levelIndex)
    const level = useGameStore((state) => state.level)
    const board = useGameStore((state) => state.board)
    const movesLeft = useGameStore((state) => state.movesLeft)
    const status = useGameStore((state) => state.status)
    const goalProgress = useGameStore((state) => state.goalProgress)
    const goalTarget = useGameStore((state) => state.goalTarget)
    const restartLevel = useGameStore((state) => state.restartLevel)
    const advanceLevel = useGameStore((state) => state.advanceLevel)
    const lastScoreCalc = useGameStore((state) => state.lastScoreCalculation)
    const levelStars = useGameStore((state) => state.levelStars)

    const { headline, progressLabel } = useMemo(
        () => describeGoal(level.goal, goalProgress, goalTarget),
        [level.goal, goalProgress, goalTarget],
    )

    return (
        <div className="min-h-screen text-slate-100 flex items-center justify-center relative w-full" style={{ backgroundImage: `url(${figmaImages.desktopBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            {/* Background image overlay */}
            <img
                alt=""
                className="absolute inset-0 max-w-none object-cover pointer-events-none w-full h-full"
                src={figmaImages.desktopBackground}
                style={{ objectPosition: '50% 50%' }}
            />

            <Tutorial />

            {/* Main content container - side by side layout like Figma */}
            {/* Use key to force re-render when level changes to prevent black screen */}
            <div key={`level-${levelIndex}`} className="relative z-10 flex flex-col lg:flex-row gap-[40px] lg:gap-[60px] items-center lg:items-start justify-center w-full max-w-[1800px] px-4 py-8">
                {/* Left Panel - Game Info (HUD) */}
                <div style={{ width: '450px' }}>
                    <HUD
                        levelNumber={levelIndex + 1}
                        levelTitle={level.title}
                        movesLeft={movesLeft}
                        goalHeadline={headline}
                        goalProgressLabel={progressLabel}
                        status={status}
                        board={board}
                        onHint={() => {
                            // Hint is handled in Board component via clueTiles state
                            // This is a placeholder - the actual hint display is in Board.tsx
                        }}
                    />
                </div>

                {/* Right Side - Game Board */}
                <div className="flex gap-[10px] items-center flex-1 lg:flex-initial">
                    <main className="flex items-center justify-center w-full">
                        <Board />
                    </main>
                </div>
            </div>

            {/* Footer buttons - positioned at bottom */}
            <footer className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-4 z-20">
                <button
                    type="button"
                    onClick={restartLevel}
                    className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={status === 'won'}
                >
                    Restart
                </button>
                <button
                    type="button"
                    onClick={advanceLevel}
                    className="px-4 py-2 rounded-full bg-slate-200 text-slate-900 font-semibold hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={status !== 'won'}
                >
                    Next Level
                </button>
            </footer>

            {status !== 'playing' && (
                <LevelComplete
                    status={status}
                    levelNumber={levelIndex + 1}
                    goalHeadline={headline}
                    goalProgressLabel={progressLabel}
                    stars={levelStars || (lastScoreCalc?.stars ?? 0)}
                    coins={lastScoreCalc?.coins ?? 0}
                    xp={lastScoreCalc?.xp ?? 0}
                    score={lastScoreCalc?.totalScore ?? 0}
                    onPrimary={status === 'won' ? advanceLevel : restartLevel}
                    onSecondary={restartLevel}
                />
            )}
        </div>
    )
}

export default App

