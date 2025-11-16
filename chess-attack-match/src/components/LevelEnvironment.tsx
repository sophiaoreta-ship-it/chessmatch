import { useMemo } from 'react'
import { useGameStore } from '../state/useGameStore'
import { getLevelTheme } from '../game/levelThemes'
import type { LevelGoal } from '../game/types'

type LevelEnvironmentProps = {
    goal: LevelGoal
}

/**
 * Visual environment elements based on level goal type
 * Provides immediate visual feedback about the level objective
 */
export const LevelEnvironment = ({ goal }: LevelEnvironmentProps) => {
    const theme = getLevelTheme(goal)
    const board = useGameStore((state) => state.board)
    const goalProgress = useGameStore((state) => state.goalProgress)
    const goalTarget = useGameStore((state) => state.goalTarget)
    const BOARD_SIZE = board.length
    const TILE_SIZE_PERCENT = 100 / BOARD_SIZE

    // Calculate token drop progress for drop levels
    const dropProgress = useMemo(() => {
        if (goal.type === 'dropTokens') {
            return { current: goalProgress, target: goalTarget, tokenType: goal.tokenType }
        }
        return null
    }, [goal, goalProgress, goalTarget])

    // Drop levels: Show bottom baskets, downward arrows, and highlighted exit row
    if (theme === 'drop') {
        return (
            <>
                {/* Highlight bottom row with exit zone */}
                <div className="absolute bottom-0 left-0 right-0 h-[calc(100%/6)] bg-gradient-to-t from-cyan-500/20 via-cyan-500/10 to-transparent border-t-2 border-cyan-400/50 pointer-events-none z-0" />

                {/* Bottom baskets for drop levels */}
                <div className="absolute -bottom-8 left-0 right-0 h-16 flex items-center justify-center gap-1 sm:gap-2 pointer-events-none z-10">
                    {Array.from({ length: BOARD_SIZE }).map((_, col) => {
                        const tileX = (col + 0.5) * TILE_SIZE_PERCENT
                        return (
                            <div
                                key={col}
                                className="absolute flex flex-col items-center"
                                style={{
                                    left: `${tileX}%`,
                                    transform: 'translateX(-50%)',
                                }}
                            >
                                {/* Downward arrow above basket */}
                                <div className="mb-1 text-cyan-400 text-xl animate-bounce">↓</div>
                                {/* Basket */}
                                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-cyan-500/30 border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/20">
                                    <span className="text-xl sm:text-2xl">📥</span>
                                </div>
                                {/* Progress indicator if this column has a token */}
                                {dropProgress && (
                                    <div className="mt-1 text-xs text-cyan-300 font-semibold">
                                        {dropProgress.current}/{dropProgress.target}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </>
        )
    }

    // Score levels: Show glowing score emphasis and combo indicators
    if (theme === 'score') {
        return null
    }

    // Obstacle levels: Show warning icons, cracked tile effects, and obstacle highlights
    if (theme === 'obstacle') {
        const obstacleType = goal.type === 'clearObstacles' ? goal.obstacleType : null
        const obstacleCount = useMemo(() => {
            return board.flat().filter(t => t.isObstacle && (!obstacleType || t.obstacleType === obstacleType)).length
        }, [board, obstacleType])

        return (
            <>
                {/* Warning header */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 px-4 py-2 rounded-full border border-orange-400/50 shadow-lg shadow-orange-500/20 pointer-events-none z-10">
                    <span className="text-orange-300 text-lg animate-pulse">⚠️</span>
                    <span className="text-sm text-orange-200 font-bold">
                        Clear {obstacleCount} {obstacleType || 'Obstacles'}
                    </span>
                    <span className="text-orange-300 text-lg animate-pulse">⚠️</span>
                </div>

                {/* Warning indicators and cracked effects around obstacles */}
                <div className="absolute inset-0 pointer-events-none z-10">
                    {board.flatMap((row, rowIndex) =>
                        row.map((tile, colIndex) => {
                            if (tile.isObstacle && tile.obstacleType && (!obstacleType || tile.obstacleType === obstacleType)) {
                                const tileX = (colIndex + 0.5) * TILE_SIZE_PERCENT
                                const tileY = (rowIndex + 0.5) * TILE_SIZE_PERCENT
                                return (
                                    <div
                                        key={`warning-${tile.id}`}
                                        className="absolute"
                                        style={{
                                            left: `${tileX}%`,
                                            top: `${tileY}%`,
                                            transform: 'translate(-50%, -50%)',
                                        }}
                                    >
                                        {/* Warning icon */}
                                        <div className="text-orange-400 text-sm sm:text-base animate-pulse">⚠️</div>
                                        {/* Cracked effect overlay */}
                                        <div className="absolute inset-0 text-red-500/30 text-xs" style={{ fontSize: '24px' }}>
                                            💥
                                        </div>
                                    </div>
                                )
                            }
                            return null
                        }),
                    )}
                </div>
            </>
        )
    }

    // Collect levels: Show collectible icons, counters, and themed tiles
    if (theme === 'collect') {
        const collectibleType = goal.type === 'dropTokens' ? goal.tokenType : null

        return (
            <>
                {/* Collectible header with counter */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-emerald-500/20 px-4 py-2 rounded-full border border-emerald-400/50 shadow-lg shadow-emerald-500/20 pointer-events-none z-10">
                    <span className="text-emerald-300 text-lg">🎯</span>
                    <span className="text-sm text-emerald-200 font-bold">
                        Collect {goalProgress}/{goalTarget} {collectibleType || 'Items'}
                    </span>
                    <span className="text-emerald-300 text-lg">🎯</span>
                </div>

                {/* Highlight collectible tiles */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    {board.flatMap((row, rowIndex) =>
                        row.map((tile, colIndex) => {
                            if (tile.specialToken && (!collectibleType || tile.specialToken === collectibleType)) {
                                const tileX = (colIndex + 0.5) * TILE_SIZE_PERCENT
                                const tileY = (rowIndex + 0.5) * TILE_SIZE_PERCENT
                                return (
                                    <div
                                        key={`collect-${tile.id}`}
                                        className="absolute animate-pulse"
                                        style={{
                                            left: `${tileX}%`,
                                            top: `${tileY}%`,
                                            transform: 'translate(-50%, -50%)',
                                        }}
                                    >
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500/30 border-2 border-emerald-400/60 flex items-center justify-center">
                                            <span className="text-emerald-300 text-sm">✨</span>
                                        </div>
                                    </div>
                                )
                            }
                            return null
                        }),
                    )}
                </div>
            </>
        )
    }

    // Clear board levels: Show clear indicator
    if (theme === 'clear') {
        const clearedTiles = useMemo(() => {
            return board.flat().filter(t => !t.pieceType && !t.isObstacle).length
        }, [board])
        const totalTiles = BOARD_SIZE * BOARD_SIZE

        return (
            <>
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-gradient-to-r from-slate-500/20 via-gray-500/20 to-slate-500/20 px-4 py-2 rounded-full border border-slate-400/50 shadow-lg shadow-slate-500/20 pointer-events-none z-10">
                    <span className="text-slate-300 text-lg">🧹</span>
                    <span className="text-sm text-slate-200 font-bold">
                        Clear All Tiles ({totalTiles - clearedTiles} remaining)
                    </span>
                    <span className="text-slate-300 text-lg">🧹</span>
                </div>
            </>
        )
    }

    // Combination levels: Show multi-objective indicator
    if (theme === 'combination') {
        return (
            <>
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-violet-500/20 px-4 py-2 rounded-full border border-violet-400/50 shadow-lg shadow-violet-500/20 pointer-events-none z-10">
                    <span className="text-violet-300 text-lg">🎯</span>
                    <span className="text-sm text-violet-200 font-bold">
                        Multiple Objectives
                    </span>
                    <span className="text-violet-300 text-lg">🎯</span>
                </div>
            </>
        )
    }

    return null
}

