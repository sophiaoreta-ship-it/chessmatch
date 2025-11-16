import { create } from 'zustand'
import { calculateScore, calculateMatchScore, type ScoreCalculation } from '../game/calculateScore'
import { clearTiles } from '../game/clearTiles'
import { collapseBoardFully } from '../game/collapseBoardFully'
import { generatePlayableBoard } from '../game/generatePlayableBoard'
import { createTile, createEmptyTile, randomPiece } from '../game/generateBoard'
import { processMatchForSpecialTile } from '../game/createSpecialTile'
import { hasValidMoves } from '../game/hasValidMoves'
import { levels } from '../game/levels'
import { refillBoard } from '../game/refillBoard'
import { runFullStabilizationWithReport } from '../game/runFullStabilization'
import { safeShuffle } from '../game/safeShuffle'
import { soundManager } from '../game/sounds'
import { findAllPatterns } from '../game/findAllPatterns'
// autoClearPatterns removed - now using animated auto-clears via processPatternClear
import { processPatternClear } from '../game/animatePatternClear'
import {
    computeGoalProgress,
    computeGoalTarget,
    countObstacles,
    countTokensDropped,
    isBoardCleared,
    isGoalComplete,
    type GoalProgress,
} from '../game/trackGoalProgress'
import { validatePattern } from '../game/validatePattern'
import type {
    BoardMatrix,
    LevelConfig,
    Match,
    ObstacleType,
    PieceType,
    SpecialTokenType,
    Tile,
} from '../game/types'
import { BOARD_SIZE } from '../game/constants'

const PIECE_TYPES: PieceType[] = ['knight', 'rook', 'bishop', 'pawn']
const POP_ANIMATION_MS = 220
const INVALID_SHAKE_MS = 400

const createEmptyCounts = () =>
    PIECE_TYPES.reduce<Record<PieceType, number>>((acc, type) => {
        acc[type] = 0
        return acc
    }, {} as Record<PieceType, number>)

// Goal target computation moved to trackGoalProgress.ts

const ensurePlayableBoard = (level: LevelConfig): BoardMatrix => {
    return generatePlayableBoard({
        size: BOARD_SIZE,
        allowedPieces: level.allowedPieces,
        obstacles: level.obstacles,
        specialTokens: level.specialTokens,
    })
}

type GameStatus = 'playing' | 'won' | 'lost'

type SelectionState = {
    isActive: boolean
    tiles: Tile[]
    previewTileId: string | null
    pieceType: PieceType | null
}

type ClearSummary = {
    tilesCleared: number
    pieceType: PieceType
}

interface GameState {
    board: BoardMatrix
    boardSize: number
    levelIndex: number
    level: LevelConfig
    movesLeft: number
    goalProgress: number
    goalTarget: number
    status: GameStatus
    selection: SelectionState
    isDragging: boolean
    isResolving: boolean
    invalidShake: boolean
    invalidReason?: string
    poppingTileIds: string[]
    matchedTileIds: string[] // Tiles that matched a pattern (highlighted before clearing)
    tileMovements: Array<{ tileId: string; fromRow: number; fromCol: number; toRow: number; toCol: number; isNewTile: boolean }> // Tiles currently animating
    isAnimating: boolean // True when animations are playing
    swappingTiles: Array<{ tileId: string; fromRow: number; fromCol: number; toRow: number; toCol: number }> // Tiles currently swapping
    isSwapping: boolean // True when swap animation is playing
    scorePopups: Array<{ id: string; score: number; x: number; y: number; multiplier?: number }> // Floating score popups
    currentCombo: number // Current combo multiplier (0 = no combo)
    levelStars: number // Stars earned for this level (1-3)
    clearedCounts: Record<PieceType, number>
    lastPlayerClear: ClearSummary | null
    cascades: Match[]
    hasMovesHint: boolean
    score: number
    totalStars: number
    totalCoins: number
    totalXP: number
    lastScoreCalculation: ScoreCalculation | null
    autoAdvanceTimer: number | undefined
    initialObstacles: Record<ObstacleType, number>
    initialTokens: Record<SpecialTokenType, number>
    startSelection: (tile: Tile) => void
    extendSelection: (tile: Tile) => void
    endSelection: () => void
    cancelSelection: () => void
    restartLevel: () => void
    advanceLevel: () => void
    attemptSwap: (from: Tile, to: Tile) => void
    removeScorePopup: (id: string) => void
}

let popTimeout: number | undefined
let shakeTimeout: number | undefined

const resetSelectionState = (): SelectionState => ({
    isActive: false,
    tiles: [],
    previewTileId: null,
    pieceType: null,
})

const buildGoalProgress = (
    board: BoardMatrix,
    currentScore: number,
    initialObstacles: Record<ObstacleType, number>,
    initialTokens: Record<SpecialTokenType, number>, // Used in function body
): GoalProgress => {
    const obstaclesCleared: Record<ObstacleType, number> = {
        ice: 0,
        crate: 0,
        stone: 0,
        vine: 0,
        lock: 0,
        cobweb: 0,
        frozen: 0,
    }

    const tokensDropped: Record<SpecialTokenType, number> = {
        king: 0,
        shield: 0,
        sword: 0,
    }

        // Calculate obstacles cleared (initial - current)
        ; (Object.keys(obstaclesCleared) as ObstacleType[]).forEach((obstacleType) => {
            const current = countObstacles(board, obstacleType)
            obstaclesCleared[obstacleType] = Math.max(0, (initialObstacles[obstacleType] ?? 0) - current)
        })

        // Calculate tokens dropped
        ; (Object.keys(tokensDropped) as SpecialTokenType[]).forEach((tokenType) => {
            tokensDropped[tokenType] = countTokensDropped(board, tokenType)
        })

    // Note: initialTokens reserved for future tracking/comparison
    void initialTokens

    return {
        score: currentScore,
        obstaclesCleared,
        tokensDropped,
        boardCleared: isBoardCleared(board),
    }
}

const getInitialObstacleCounts = (level: LevelConfig): Record<ObstacleType, number> => {
    const counts: Record<ObstacleType, number> = {
        ice: 0,
        crate: 0,
        stone: 0,
        vine: 0,
        lock: 0,
        cobweb: 0,
        frozen: 0,
    }

    level.obstacles?.forEach((obs) => {
        counts[obs.type] = (counts[obs.type] ?? 0) + 1
    })

    return counts
}

const getInitialTokenCounts = (level: LevelConfig): Record<SpecialTokenType, number> => {
    const counts: Record<SpecialTokenType, number> = {
        king: 0,
        shield: 0,
        sword: 0,
    }

    level.specialTokens?.forEach((token) => {
        counts[token.type] = (counts[token.type] ?? 0) + 1
    })

    return counts
}

export const useGameStore = create<GameState>((set, get) => {
    // Automatically clear any existing patterns on the board (uses autoClearPatterns)

    const initialise = (levelIndex: number) => {
        const level = levels[levelIndex % levels.length]
        const board = ensurePlayableBoard(level)

        // Don't auto-clear silently - let the animated auto-clear handle it
        // This will be processed with animations when the level starts

        const initialObstacles = getInitialObstacleCounts(level)
        const initialTokens = getInitialTokenCounts(level)
        const goalProgress = buildGoalProgress(board, 0, initialObstacles, initialTokens)
        return {
            board,
            level,
            levelIndex,
            movesLeft: level.moveLimit,
            goalTarget: computeGoalTarget(level.goal),
            goalProgress: computeGoalProgress(level.goal, goalProgress),
            status: 'playing' as GameStatus,
            selection: resetSelectionState(),
            isDragging: false,
            isResolving: true, // Start as resolving to lock input until auto-clears complete
            invalidShake: false,
            invalidReason: undefined,
            poppingTileIds: [],
            matchedTileIds: [],
            tileMovements: [],
            isAnimating: true, // Start as animating to lock input until auto-clears complete
            swappingTiles: [],
            isSwapping: false,
            scorePopups: [],
            currentCombo: 0,
            levelStars: 0,
            clearedCounts: createEmptyCounts(),
            lastPlayerClear: null,
            cascades: [],
            hasMovesHint: hasValidMoves(board),
            score: 0,
            totalStars: 0,
            totalCoins: 0,
            totalXP: 0,
            lastScoreCalculation: null,
            autoAdvanceTimer: undefined,
            initialObstacles,
            initialTokens,
        }
    }

    const initialState = initialise(0)

    // Process initial auto-clears with animations after a brief delay
    // This ensures the board is rendered before animations start
    window.setTimeout(() => {
        const state = get()
        const initialPatterns = findAllPatterns(state.board)

        if (initialPatterns.length === 0) {
            // No patterns, unlock input immediately
            set((current) => ({
                ...current,
                isResolving: false,
                isAnimating: false,
            }))
            return
        }

        // Process auto-clears with full animation sequence
        const allMatches: Match[] = []

        const processAutoClear = (board: BoardMatrix, iteration: number): void => {
            if (iteration >= 10) {
                // Safety limit, unlock input
                set((current) => ({
                    ...current,
                    isResolving: false,
                    isAnimating: false,
                }))
                return
            }

            const patterns = findAllPatterns(board)
            if (patterns.length === 0) {
                // Board is stable, unlock input
                set((current) => ({
                    ...current,
                    isResolving: false,
                    isAnimating: false,
                }))
                return
            }

            allMatches.push(...patterns)

            // Process with full animation sequence
            const result = processPatternClear(board, patterns)
            const patternTileIds = patterns.flatMap(m => m.tiles.map(t => t.id))

            // Step 1: Highlight (0.4s - within 0.3-0.5s range)
            set((current) => ({
                ...current,
                matchedTileIds: patternTileIds,
            }))

            window.setTimeout(() => {
                set((current) => ({
                    ...current,
                    matchedTileIds: [],
                    poppingTileIds: patternTileIds,
                }))

                // Step 2: Pop (0.2s)
                window.setTimeout(() => {
                    const gravityMovements = result.steps.find(s => s.type === 'gravity')?.movements || []
                    const refillMovements = result.steps.find(s => s.type === 'refill')?.movements || []

                    set((current) => ({
                        ...current,
                        tileMovements: [...gravityMovements, ...refillMovements],
                        poppingTileIds: [],
                    }))

                    // Step 3: Gravity + Refill (380ms)
                    window.setTimeout(() => {
                        set((current) => ({
                            ...current,
                            board: result.finalBoard,
                            tileMovements: [],
                        }))

                        // Continue checking for more patterns (cascade)
                        processAutoClear(result.finalBoard, iteration + 1)
                    }, 380)
                }, 200)
            }, 400)
        }

        // Start processing
        processAutoClear(state.board, 0)
    }, 100) // Small delay to ensure board is rendered

    return {
        boardSize: BOARD_SIZE,
        ...initialState,

        startSelection: (tile) => {
            const state = get()
            if (state.isResolving || state.status !== 'playing') {
                return
            }

            // Allow obstacles with pieces to be selected (ice with chess pieces inside)
            if (tile.pieceType === null) {
                return
            }

            if (popTimeout) {
                window.clearTimeout(popTimeout)
                popTimeout = undefined
            }

            set((current) => ({
                ...current,
                isDragging: true,
                selection: {
                    isActive: true,
                    tiles: [tile],
                    previewTileId: tile.id,
                    pieceType: tile.pieceType,
                },
            }))
        },

        extendSelection: (tile) => {
            const state = get()
            if (!state.isDragging || !state.selection.isActive) {
                return
            }

            // Allow obstacles with pieces to be selected (ice with chess pieces inside)
            if (tile.pieceType === null) {
                return
            }

            if (state.selection.tiles.some((selected) => selected.id === tile.id)) {
                return
            }

            if (state.selection.pieceType && tile.pieceType !== state.selection.pieceType) {
                return
            }

            // Pattern snapping is handled in the UI layer (Board.tsx)
            // This keeps the store clean and avoids circular dependencies

            set((current) => ({
                ...current,
                selection: {
                    ...current.selection,
                    tiles: [...current.selection.tiles, tile],
                    previewTileId: tile.id,
                    pieceType: current.selection.pieceType ?? tile.pieceType,
                },
            }))
        },

        cancelSelection: () => {
            set((current) => ({
                ...current,
                isDragging: false,
                selection: resetSelectionState(),
            }))
        },

        endSelection: () => {
            const state = get()
            if (!state.isDragging || !state.selection.isActive) {
                set((current) => ({
                    ...current,
                    isDragging: false,
                    selection: resetSelectionState(),
                }))
                return
            }

            const selectionTiles = state.selection.tiles
            if (selectionTiles.length === 0) {
                set((current) => ({
                    ...current,
                    isDragging: false,
                    selection: resetSelectionState(),
                }))
                return
            }

            const validation = validatePattern(selectionTiles)

            if (!validation.isValid) {
                if (shakeTimeout) {
                    window.clearTimeout(shakeTimeout)
                }

                set((current) => ({
                    ...current,
                    isDragging: false,
                    selection: resetSelectionState(),
                    invalidShake: true,
                    invalidReason: validation.reason,
                }))

                shakeTimeout = window.setTimeout(() => {
                    set((current) => ({
                        ...current,
                        invalidShake: false,
                        invalidReason: undefined,
                    }))
                }, INVALID_SHAKE_MS)

                return
            }

            const pieceType = selectionTiles[0].pieceType!

            if (popTimeout) {
                window.clearTimeout(popTimeout)
            }

            set((current) => ({
                ...current,
                isDragging: false,
                isResolving: true,
                selection: resetSelectionState(),
                poppingTileIds: selectionTiles.map((tile) => tile.id),
                invalidShake: false,
                invalidReason: undefined,
            }))

            // Add delay before clearing tiles (150ms for visual feedback)
            popTimeout = window.setTimeout(() => {
                // Play whoosh sound for pattern completion
                soundManager.playWhoosh()

                const {
                    level,
                    board,
                    clearedCounts: totalClearedCounts,
                    movesLeft,
                    score: currentScore,
                    initialObstacles,
                    initialTokens,
                } = get()

                // Check if this match should create a special tile (striped for 4-tile Rook or Bishop matches)
                const matchForSpecialCheck: Match = {
                    pieceType,
                    tiles: selectionTiles.map((tile) => ({ ...tile })),
                }
                const specialTileResult = processMatchForSpecialTile(matchForSpecialCheck)

                let workingBoard = board

                if (specialTileResult.shouldCreateSpecial && specialTileResult.specialTile) {
                    console.log('Creating striped piece from 4-tile match:', {
                        pieceType,
                        tileCount: selectionTiles.length,
                        specialTile: specialTileResult.specialTile,
                    })

                    // Create striped piece - transform one tile and only clear the others
                    workingBoard = workingBoard.map((row) =>
                        row.map((tile) => {
                            // Check if this is the tile that should become striped
                            if (tile.id === specialTileResult.specialTile!.id) {
                                console.log('Transforming tile to striped:', tile.id, 'at', tile.row, tile.col)
                                return specialTileResult.specialTile!
                            }
                            // Check if this tile should be cleared
                            const shouldClear = specialTileResult.tilesToClear.some(
                                (t) => t.id === tile.id,
                            )
                            if (shouldClear) {
                                return createEmptyTile(tile.row, tile.col)
                            }
                            return { ...tile }
                        }),
                    )
                } else {
                    console.log('No special tile created:', {
                        pieceType,
                        tileCount: selectionTiles.length,
                        shouldCreate: specialTileResult.shouldCreateSpecial,
                    })
                    // Normal match - process normally
                    const selectionMatch: Match = {
                        pieceType,
                        tiles: selectionTiles.map((tile) => ({ ...tile })),
                    }
                    workingBoard = clearTiles(workingBoard, [selectionMatch])
                }

                // Find longest line for bonus calculation
                const longestLine = Math.max(
                    ...selectionTiles.map((tile) => {
                        if (pieceType === 'rook') {
                            // Check horizontal or vertical line length
                            const sameRow = selectionTiles.filter((t) => t.row === tile.row)
                            const sameCol = selectionTiles.filter((t) => t.col === tile.col)
                            return Math.max(sameRow.length, sameCol.length)
                        }
                        if (pieceType === 'bishop') {
                            return selectionTiles.length
                        }
                        return selectionTiles.length
                    }),
                )
                // Step 1: Collapse - tiles above fall down to fill gaps
                workingBoard = collapseBoardFully(workingBoard)
                // Step 2: Refill - new tiles generate only in top row and fall down
                workingBoard = refillBoard(workingBoard)

                // Ensure board is completely filled - no empty spaces (safety check)
                // BUT preserve special tiles (striped pieces)
                const size = workingBoard.length
                for (let row = 0; row < size; row += 1) {
                    for (let col = 0; col < size; col += 1) {
                        const tile = workingBoard[row][col]
                        if (!tile.isObstacle && tile.pieceType === null && !tile.specialTileType) {
                            // Emergency fill - should not happen but ensure board is complete
                            // Don't overwrite special tiles
                            const pieceType = randomPiece(level.allowedPieces)
                            workingBoard[row][col] = createTile(row, col, pieceType)
                        }
                    }
                }

                // Check if we created a striped piece and verify it's still on the board
                if (specialTileResult.shouldCreateSpecial && specialTileResult.specialTile) {
                    const stripedPieceStillExists = workingBoard.some((row) =>
                        row.some((tile) => tile.id === specialTileResult.specialTile!.id && tile.specialTileType === 'striped'),
                    )
                    console.log('Striped piece after gravity/refill:', stripedPieceStillExists ? 'PRESERVED' : 'LOST')
                }

                const resolution = runFullStabilizationWithReport(workingBoard)

                // Play cascade sounds for each cascade
                if (resolution.cascades.length > 0) {
                    resolution.cascades.forEach((cascade, index) => {
                        setTimeout(() => {
                            soundManager.playCascade(cascade.tiles.length)
                        }, index * 100)
                    })
                }

                // After stabilization, check if there are valid moves
                // If no valid moves exist, reshuffle the board
                if (!hasValidMoves(resolution.board)) {
                    workingBoard = safeShuffle(resolution.board)
                } else {
                    workingBoard = resolution.board
                }

                const updatedCounts = { ...totalClearedCounts }
                updatedCounts[pieceType] += selectionTiles.length
                PIECE_TYPES.forEach((type) => {
                    updatedCounts[type] += resolution.clearedByPiece[type]
                })

                let updatedMoves = movesLeft - 1
                if (updatedMoves < 0) updatedMoves = 0

                // workingBoard already has valid moves (reshuffled if needed above)
                let nextBoard = workingBoard
                const hasMoves = hasValidMoves(nextBoard)

                // Count obstacles cleared in this move
                const obstaclesBefore = countObstacles(board)
                const obstaclesAfter = countObstacles(nextBoard)
                const obstaclesClearedThisMove = Math.max(0, obstaclesBefore - obstaclesAfter)

                // Calculate score with new parameters
                const totalTilesCleared = selectionTiles.length + resolution.cascades.reduce(
                    (sum, cascade) => sum + cascade.tiles.length,
                    0,
                )
                const scoreCalc = calculateScore(
                    totalTilesCleared,
                    resolution.cascades,
                    obstaclesClearedThisMove,
                    longestLine,
                )

                const newScore = currentScore + scoreCalc.totalScore

                // Build goal progress from current state
                const goalProgress = buildGoalProgress(
                    nextBoard,
                    newScore,
                    initialObstacles,
                    initialTokens,
                )

                const updatedGoalProgress = computeGoalProgress(level.goal, goalProgress)
                const target = computeGoalTarget(level.goal)

                // Check goal completion
                const goalComplete = isGoalComplete(level.goal, goalProgress)

                let status: GameStatus = 'playing'
                if (goalComplete) {
                    status = 'won'
                } else if (updatedMoves <= 0) {
                    status = 'lost'
                }

                const currentState = get()
                const newStars = currentState.totalStars + scoreCalc.stars
                const newCoins = currentState.totalCoins + scoreCalc.coins
                const newXP = currentState.totalXP + scoreCalc.xp

                set((current) => ({
                    ...current,
                    board: nextBoard,
                    movesLeft: updatedMoves,
                    goalProgress: Math.min(updatedGoalProgress, target),
                    status,
                    isResolving: false,
                    poppingTileIds: [],
                    matchedTileIds: [],
                    clearedCounts: updatedCounts,
                    lastPlayerClear: {
                        tilesCleared: selectionTiles.length,
                        pieceType,
                    },
                    cascades: resolution.cascades,
                    hasMovesHint: hasMoves,
                    score: newScore,
                    totalStars: newStars,
                    totalCoins: newCoins,
                    totalXP: newXP,
                    lastScoreCalculation: scoreCalc,
                }))

                // Auto-advance after 3 seconds if level won
                if (status === 'won') {
                    const timer = window.setTimeout(() => {
                        const { advanceLevel } = get()
                        advanceLevel()
                    }, 3000)
                    set((current) => ({
                        ...current,
                        autoAdvanceTimer: timer,
                    }))
                }
            }, POP_ANIMATION_MS)
        },

        restartLevel: () => {
            if (popTimeout) {
                window.clearTimeout(popTimeout)
                popTimeout = undefined
            }
            if (shakeTimeout) {
                window.clearTimeout(shakeTimeout)
                shakeTimeout = undefined
            }

            const state = get()
            if (state.autoAdvanceTimer) {
                window.clearTimeout(state.autoAdvanceTimer)
            }

            const newState = initialise(state.levelIndex)
            set((current) => ({
                ...current,
                ...newState,
            }))

            // Process initial auto-clears with animations
            window.setTimeout(() => {
                const currentState = get()
                const initialPatterns = findAllPatterns(currentState.board)

                if (initialPatterns.length === 0) {
                    set((current) => ({
                        ...current,
                        isResolving: false,
                        isAnimating: false,
                    }))
                    return
                }

                const allMatches: Match[] = []
                const processAutoClear = (board: BoardMatrix, iteration: number): void => {
                    if (iteration >= 10) {
                        set((current) => ({
                            ...current,
                            isResolving: false,
                            isAnimating: false,
                        }))
                        return
                    }

                    const patterns = findAllPatterns(board)
                    if (patterns.length === 0) {
                        set((current) => ({
                            ...current,
                            isResolving: false,
                            isAnimating: false,
                        }))
                        return
                    }

                    allMatches.push(...patterns)
                    const result = processPatternClear(board, patterns)
                    const patternTileIds = patterns.flatMap(m => m.tiles.map(t => t.id))

                    set((current) => ({
                        ...current,
                        matchedTileIds: patternTileIds,
                    }))

                    window.setTimeout(() => {
                        set((current) => ({
                            ...current,
                            matchedTileIds: [],
                            poppingTileIds: patternTileIds,
                        }))

                        window.setTimeout(() => {
                            const gravityMovements = result.steps.find(s => s.type === 'gravity')?.movements || []
                            const refillMovements = result.steps.find(s => s.type === 'refill')?.movements || []

                            set((current) => ({
                                ...current,
                                tileMovements: [...gravityMovements, ...refillMovements],
                                poppingTileIds: [],
                            }))

                            window.setTimeout(() => {
                                set((current) => ({
                                    ...current,
                                    board: result.finalBoard,
                                    tileMovements: [],
                                }))

                                processAutoClear(result.finalBoard, iteration + 1)
                            }, 380)
                        }, 200)
                    }, 400)
                }

                processAutoClear(currentState.board, 0)
            }, 100)
        },

        advanceLevel: () => {
            if (popTimeout) {
                window.clearTimeout(popTimeout)
                popTimeout = undefined
            }
            if (shakeTimeout) {
                window.clearTimeout(shakeTimeout)
                shakeTimeout = undefined
            }

            const state = get()
            if (state.autoAdvanceTimer) {
                window.clearTimeout(state.autoAdvanceTimer)
            }

            // Initialize new level state
            const newState = initialise((state.levelIndex + 1) % levels.length)

            // Immediately set all state in one atomic update to close LevelComplete modal instantly
            // This ensures the backdrop disappears immediately and the board renders right away
            set((current) => ({
                ...current,
                ...newState,
                status: 'playing', // Explicitly ensure status is 'playing' to close modal
            }))

            // Process initial auto-clears with animations
            window.setTimeout(() => {
                const currentState = get()
                const initialPatterns = findAllPatterns(currentState.board)

                if (initialPatterns.length === 0) {
                    set((current) => ({
                        ...current,
                        isResolving: false,
                        isAnimating: false,
                    }))
                    return
                }

                const allMatches: Match[] = []
                const processAutoClear = (board: BoardMatrix, iteration: number): void => {
                    if (iteration >= 10) {
                        set((current) => ({
                            ...current,
                            isResolving: false,
                            isAnimating: false,
                        }))
                        return
                    }

                    const patterns = findAllPatterns(board)
                    if (patterns.length === 0) {
                        set((current) => ({
                            ...current,
                            isResolving: false,
                            isAnimating: false,
                        }))
                        return
                    }

                    allMatches.push(...patterns)
                    const result = processPatternClear(board, patterns)
                    const patternTileIds = patterns.flatMap(m => m.tiles.map(t => t.id))

                    set((current) => ({
                        ...current,
                        matchedTileIds: patternTileIds,
                    }))

                    window.setTimeout(() => {
                        set((current) => ({
                            ...current,
                            matchedTileIds: [],
                            poppingTileIds: patternTileIds,
                        }))

                        window.setTimeout(() => {
                            const gravityMovements = result.steps.find(s => s.type === 'gravity')?.movements || []
                            const refillMovements = result.steps.find(s => s.type === 'refill')?.movements || []

                            set((current) => ({
                                ...current,
                                tileMovements: [...gravityMovements, ...refillMovements],
                                poppingTileIds: [],
                            }))

                            window.setTimeout(() => {
                                set((current) => ({
                                    ...current,
                                    board: result.finalBoard,
                                    tileMovements: [],
                                }))

                                processAutoClear(result.finalBoard, iteration + 1)
                            }, 380)
                        }, 200)
                    }, 400)
                }

                processAutoClear(currentState.board, 0)
            }, 100)
        },

        removeScorePopup: (id: string) => {
            set((current) => ({
                ...current,
                scorePopups: current.scorePopups.filter((popup) => popup.id !== id),
            }))
        },

        attemptSwap: (from: Tile, to: Tile) => {
            const state = get()
            if (state.isResolving || state.status !== 'playing') {
                return
            }

            // Check if tiles are adjacent
            const rowDiff = Math.abs(from.row - to.row)
            const colDiff = Math.abs(from.col - to.col)
            const isAdjacent = (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)

            if (!isAdjacent) {
                return
            }

            // Check if either tile is an obstacle without a piece
            if ((from.isObstacle && from.pieceType === null) || (to.isObstacle && to.pieceType === null)) {
                return
            }

            // Step 1: Lock input and start swap animation
            set((current) => ({
                ...current,
                isSwapping: true,
                swappingTiles: [
                    { tileId: from.id, fromRow: from.row, fromCol: from.col, toRow: to.row, toCol: to.col },
                    { tileId: to.id, fromRow: to.row, fromCol: to.col, toRow: from.row, toCol: from.col },
                ],
            }))

            // Step 2: Animate swap (135ms ease-in-out)
            window.setTimeout(() => {
                // After swap animation, check if valid
                const swappedBoard = state.board.map((row) => row.map((tile) => ({ ...tile })))
                const fromTile = swappedBoard[from.row][from.col]
                const toTile = swappedBoard[to.row][to.col]

                // Swap the tiles
                swappedBoard[from.row][from.col] = { ...toTile, row: from.row, col: from.col }
                swappedBoard[to.row][to.col] = { ...fromTile, row: to.row, col: to.col }

                // Check if swap creates valid patterns
                const matches = findAllPatterns(swappedBoard)

                // Check if swap created any matches involving the swapped tiles
                const swappedIds = new Set([from.id, to.id])
                const hasValidMatch = matches.some((match) =>
                    match.tiles.some((tile) => swappedIds.has(tile.id)),
                )

                if (!hasValidMatch) {
                    // Invalid swap - reverse animation
                    // Pause 100ms before reversing
                    window.setTimeout(() => {
                        set((current) => ({
                            ...current,
                            swappingTiles: [
                                { tileId: from.id, fromRow: to.row, fromCol: to.col, toRow: from.row, toCol: from.col },
                                { tileId: to.id, fromRow: from.row, fromCol: from.col, toRow: to.row, toCol: to.col },
                            ],
                            invalidShake: true,
                            invalidReason: 'No pattern formed',
                        }))

                        // After reverse animation (135ms), re-enable input
                        window.setTimeout(() => {
                            set((current) => ({
                                ...current,
                                isSwapping: false,
                                swappingTiles: [],
                                invalidShake: false,
                                invalidReason: undefined,
                            }))
                        }, 135) // Reverse animation duration
                    }, 100) // Pause before reversing

                    return
                }

                // Valid swap - update board and clear swap animation
                set((current) => ({
                    ...current,
                    board: swappedBoard,
                    isSwapping: false,
                    swappingTiles: [],
                }))

                // Valid swap - continue with pattern clearing sequence
                const matchedTiles = matches[0].tiles.map((tile) => tile.id)
                const initialMatch = matches[0]

                // Calculate and update score IMMEDIATELY for initial match (before animations)
                const currentState = get()
                const initialMatchScore = calculateMatchScore(initialMatch, 0, 0)
                const newScore = currentState.score + initialMatchScore

                // Update goal progress immediately
                const goalProgress = buildGoalProgress(
                    swappedBoard,
                    newScore,
                    currentState.initialObstacles,
                    currentState.initialTokens,
                )
                const updatedGoalProgress = computeGoalProgress(currentState.level.goal, goalProgress)
                const target = computeGoalTarget(currentState.level.goal)

                // Generate score popup for initial match
                const centerRow = initialMatch.tiles.reduce((sum, t) => sum + t.row, 0) / initialMatch.tiles.length
                const centerCol = initialMatch.tiles.reduce((sum, t) => sum + t.col, 0) / initialMatch.tiles.length
                const initialPopup = {
                    id: `popup-initial-${Date.now()}-${Math.random()}`,
                    score: initialMatchScore,
                    x: centerCol,
                    y: centerRow,
                    multiplier: undefined,
                }

                // Step 1: Lock input, highlight matched tiles, and UPDATE SCORE IMMEDIATELY (0.4s)
                set((current) => ({
                    ...current,
                    isResolving: true,
                    isAnimating: true, // Lock input during animations
                    invalidShake: false,
                    invalidReason: undefined,
                    matchedTileIds: matchedTiles, // Highlight matched tiles
                    score: newScore, // Update score immediately
                    goalProgress: Math.min(updatedGoalProgress, target), // Update goal progress immediately
                    scorePopups: [...current.scorePopups, initialPopup], // Show score popup immediately
                }))

                // Play whoosh sound for swap
                soundManager.playWhoosh()

                // Step 2: After highlight, start pop animation (0.2s)
                window.setTimeout(() => {
                    set((current) => ({
                        ...current,
                        matchedTileIds: [],
                        poppingTileIds: matchedTiles, // Start popping animation
                    }))

                    // Step 3: After pop, process pattern clear and cascades
                    window.setTimeout(() => {
                        // Process initial pattern clear with animations
                        const initialResult = processPatternClear(swappedBoard, [matches[0]])
                        const allMatches: Match[] = [matches[0]]

                        // Set tile movements for gravity animation
                        const gravityMovements = initialResult.steps.find(s => s.type === 'gravity')?.movements || []
                        const refillMovements = initialResult.steps.find(s => s.type === 'refill')?.movements || []

                        set((current) => ({
                            ...current,
                            tileMovements: [...gravityMovements, ...refillMovements],
                            poppingTileIds: [], // Clear pop animation
                        }))

                        // Wait for gravity + refill animations (180ms + 180ms = 360ms)
                        window.setTimeout(() => {
                            // Update board after gravity animation
                            set((current) => ({
                                ...current,
                                board: initialResult.finalBoard,
                                tileMovements: [], // Clear movements
                            }))

                            // Process cascades and auto-clears sequentially
                            const processNextCascade = (board: BoardMatrix, cascadeIteration: number): void => {
                                if (cascadeIteration >= 10) {
                                    // Safety limit reached, finalize
                                    finalizeMove(board, allMatches, cascadeIteration)
                                    return
                                }

                                // Check for any patterns (cascades or auto-clears)
                                const cascadeMatches = findAllPatterns(board)
                                if (cascadeMatches.length === 0) {
                                    // No more patterns - check if shuffle needed, then finalize
                                    let workingBoard = board
                                    if (!hasValidMoves(workingBoard)) {
                                        workingBoard = safeShuffle(workingBoard)
                                        // After shuffle, check for auto-clears
                                        const autoClearMatches = findAllPatterns(workingBoard)
                                        if (autoClearMatches.length > 0) {
                                            // Continue cascade processing to handle auto-clears with animations
                                            processNextCascade(workingBoard, cascadeIteration)
                                            return
                                        }
                                    }
                                    // No more patterns and board is playable, finalize
                                    finalizeMove(workingBoard, allMatches, cascadeIteration)
                                    return
                                }

                                allMatches.push(...cascadeMatches)

                                // Calculate and update score IMMEDIATELY for each cascade match
                                const currentState = get()
                                let cumulativeScore = currentState.score
                                const cascadePopups: Array<{ id: string; score: number; x: number; y: number; multiplier?: number }> = []

                                cascadeMatches.forEach((match, matchIndex) => {
                                    // Cascade index: cascadeIteration + 1 (first cascade is index 1, second is index 2, etc.)
                                    const cascadeIndex = cascadeIteration + 1
                                    const matchScore = calculateMatchScore(match, cascadeIndex, 0)
                                    cumulativeScore += matchScore

                                    // Generate score popup for this cascade match
                                    const centerRow = match.tiles.reduce((sum, t) => sum + t.row, 0) / match.tiles.length
                                    const centerCol = match.tiles.reduce((sum, t) => sum + t.col, 0) / match.tiles.length
                                    cascadePopups.push({
                                        id: `popup-cascade-${cascadeIteration}-${matchIndex}-${Date.now()}-${Math.random()}`,
                                        score: matchScore,
                                        x: centerCol,
                                        y: centerRow,
                                        multiplier: cascadeIndex + 1, // Show multiplier (2x, 3x, etc.)
                                    })
                                })

                                // Update goal progress with new cumulative score
                                const cascadeGoalProgress = buildGoalProgress(
                                    board,
                                    cumulativeScore,
                                    currentState.initialObstacles,
                                    currentState.initialTokens,
                                )
                                const cascadeUpdatedGoalProgress = computeGoalProgress(currentState.level.goal, cascadeGoalProgress)
                                const cascadeTarget = computeGoalTarget(currentState.level.goal)

                                // Update combo counter (cascadeIteration + 1 because first match is index 0)
                                const combo = cascadeIteration + 2 // +2 because first match is combo 1, first cascade is combo 2

                                // Update score, goal progress, and show popups IMMEDIATELY (before animations)
                                set((current) => ({
                                    ...current,
                                    currentCombo: combo,
                                    score: cumulativeScore, // Update score immediately
                                    goalProgress: Math.min(cascadeUpdatedGoalProgress, cascadeTarget), // Update goal progress immediately
                                    scorePopups: [...current.scorePopups, ...cascadePopups], // Show score popups immediately
                                }))

                                // Play cascade sounds
                                cascadeMatches.forEach((match, index) => {
                                    setTimeout(() => {
                                        soundManager.playCascade(match.tiles.length)
                                    }, index * 50)
                                })

                                // Process this cascade/auto-clear with full animation sequence
                                const cascadeResult = processPatternClear(board, cascadeMatches)

                                // Highlight cascade matches (0.3-0.5s as specified)
                                const cascadeTileIds = cascadeMatches.flatMap(m => m.tiles.map(t => t.id))
                                set((current) => ({
                                    ...current,
                                    matchedTileIds: cascadeTileIds,
                                }))

                                // Step 1: Highlight (0.4s - within 0.3-0.5s range)
                                window.setTimeout(() => {
                                    set((current) => ({
                                        ...current,
                                        matchedTileIds: [],
                                        poppingTileIds: cascadeTileIds,
                                    }))

                                    // Step 2: Pop (0.2s)
                                    window.setTimeout(() => {
                                        const cascadeGravityMovements = cascadeResult.steps.find(s => s.type === 'gravity')?.movements || []
                                        const cascadeRefillMovements = cascadeResult.steps.find(s => s.type === 'refill')?.movements || []

                                        set((current) => ({
                                            ...current,
                                            tileMovements: [...cascadeGravityMovements, ...cascadeRefillMovements],
                                            poppingTileIds: [],
                                        }))

                                        // Step 3: Gravity + Refill (360ms total: 180ms gravity + 180ms refill)
                                        window.setTimeout(() => {
                                            set((current) => ({
                                                ...current,
                                                board: cascadeResult.finalBoard,
                                                tileMovements: [],
                                            }))

                                            // After refill, check for auto-clears (patterns that formed from new tiles)
                                            // This continues the cascade/auto-clear sequence
                                            processNextCascade(cascadeResult.finalBoard, cascadeIteration + 1)
                                        }, 360)
                                    }, 200)
                                }, 400)
                            }

                            // Start cascade processing
                            processNextCascade(initialResult.finalBoard, 0)
                        }, 360) // Wait for initial gravity (180ms) + refill (180ms)

                        // Finalize the move after all animations complete
                        const finalizeMove = (finalBoard: BoardMatrix, finalMatches: Match[], cascadeCount: number = 0): void => {
                            const {
                                level,
                                clearedCounts: totalClearedCounts,
                                movesLeft,
                                score: currentScore, // Score is already updated incrementally
                                initialObstacles,
                                initialTokens,
                            } = get()

                            // Note: Shuffle and auto-clear check is now handled in processNextCascade
                            // before it calls finalizeMove, so we can proceed directly to finalization
                            const workingBoard = finalBoard

                            // Score is already updated incrementally, but calculate final score for record-keeping
                            const totalTilesCleared = finalMatches.reduce((sum, match) => sum + match.tiles.length, 0)
                            const obstaclesClearedThisMove = 0
                            const scoreCalc = calculateScore(
                                totalTilesCleared,
                                finalMatches,
                                obstaclesClearedThisMove,
                                0,
                            )

                            // Score is already updated, so use currentScore (which was updated incrementally)
                            const newScore = currentScore
                            let updatedMoves = movesLeft - 1
                            if (updatedMoves < 0) updatedMoves = 0

                            // Goal progress is already updated incrementally, but recalculate for consistency
                            const goalProgress = buildGoalProgress(
                                workingBoard,
                                newScore,
                                initialObstacles,
                                initialTokens,
                            )

                            const updatedGoalProgress = computeGoalProgress(level.goal, goalProgress)
                            const target = computeGoalTarget(level.goal)
                            const goalComplete = isGoalComplete(level.goal, goalProgress)

                            let status: GameStatus = 'playing'
                            if (goalComplete) {
                                status = 'won'
                            } else if (updatedMoves <= 0) {
                                status = 'lost'
                            }

                            // Calculate level stars based on performance (score per move ratio)
                            const movesUsed = level.moveLimit - updatedMoves
                            const scorePerMove = movesUsed > 0 ? newScore / movesUsed : newScore
                            let levelStars = 1
                            if (scorePerMove >= 2000) levelStars = 3
                            else if (scorePerMove >= 1000) levelStars = 2

                            // If level won, ensure at least 1 star
                            if (status === 'won' && levelStars === 0) levelStars = 1

                            // Score popups are already generated and shown incrementally, so no need to regenerate
                            // Just keep the existing popups

                            const currentState = get()
                            const newStars = currentState.totalStars + scoreCalc.stars
                            const newCoins = currentState.totalCoins + scoreCalc.coins
                            const newXP = currentState.totalXP + scoreCalc.xp

                            // Re-enable input after all animations complete
                            // Score and goalProgress are already updated incrementally
                            set((current) => ({
                                ...current,
                                board: workingBoard,
                                movesLeft: updatedMoves,
                                goalProgress: Math.min(updatedGoalProgress, target), // Final consistency check
                                status,
                                isResolving: false,
                                isAnimating: false, // Re-enable input
                                clearedCounts: totalClearedCounts,
                                score: newScore, // Already updated incrementally, but ensure consistency
                                totalStars: newStars,
                                totalCoins: newCoins,
                                totalXP: newXP,
                                lastScoreCalculation: scoreCalc, // Keep for record-keeping
                                levelStars,
                                // scorePopups already updated incrementally, keep as is
                                currentCombo: cascadeCount > 0 ? cascadeCount + 1 : 0, // Reset combo if no cascades
                            }))

                            // Clear combo after a delay if no more cascades
                            if (cascadeCount === 0) {
                                setTimeout(() => {
                                    set((current) => ({
                                        ...current,
                                        currentCombo: 0,
                                    }))
                                }, 1000)
                            }

                            // Auto-advance after 3 seconds if level won
                            if (status === 'won') {
                                const timer = window.setTimeout(() => {
                                    const { advanceLevel } = get()
                                    advanceLevel()
                                }, 3000)
                                set((current) => ({
                                    ...current,
                                    autoAdvanceTimer: timer,
                                }))
                            }
                        }
                    }, 200) // Delay after pop animation
                }, 400) // 0.4 second confirmation moment
            }, 135) // Swap animation duration
        },
    }
})


