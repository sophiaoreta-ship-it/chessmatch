import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { findFirstPattern } from '../game/findPattern'
import { findPatternHints } from '../game/findPatternHints'
import { findSwapHint } from '../game/findSwapHint'
import { useGameStore } from '../state/useGameStore'
import { Tile } from './Tile'
import { soundManager } from '../game/sounds'
import { ScorePopup } from './ScorePopup'
import { ScreenShake } from './ScreenShake'
import { LevelEnvironment } from './LevelEnvironment'
import type { Tile as TileType } from '../game/types'

// Hint delay: 15 seconds of user inactivity
const HINT_IDLE_DELAY = 15_000 // 15 seconds

// Debug: Set to true to test with shorter delay
const DEBUG_HINT = false
const DEBUG_HINT_DELAY = DEBUG_HINT ? 3_000 : HINT_IDLE_DELAY

export const Board = () => {
    const board = useGameStore((state) => state.board)
    const level = useGameStore((state) => state.level)
    const isResolving = useGameStore((state) => state.isResolving)
    const status = useGameStore((state) => state.status)
    const invalidShake = useGameStore((state) => state.invalidShake)
    const poppingTileIds = useGameStore((state) => state.poppingTileIds)
    const matchedTileIds = useGameStore((state) => state.matchedTileIds)
    const tileMovements = useGameStore((state) => state.tileMovements)
    const swappingTiles = useGameStore((state) => state.swappingTiles)
    const scorePopups = useGameStore((state) => state.scorePopups)
    const attemptSwap = useGameStore((state) => state.attemptSwap)
    const removeScorePopup = useGameStore((state) => state.removeScorePopup)
    const boardRef = useRef<HTMLDivElement>(null)

    const [clueTiles, setClueTiles] = useState<string[]>([])
    const [interactionCount, setInteractionCount] = useState(0)
    const hintTimeoutRef = useRef<number | undefined>(undefined)
    const [hoveredTileId, setHoveredTileId] = useState<string | null>(null)
    const [patternHintTiles, setPatternHintTiles] = useState<string[]>([])
    const [selectedTileForSwap, setSelectedTileForSwap] = useState<TileType | null>(null) // First tile selected for swap
    const [swapTargetTiles, setSwapTargetTiles] = useState<string[]>([]) // Adjacent tiles that can be swapped
    const [screenShake, setScreenShake] = useState<{ intensity: number; duration: number } | null>(null)
    const currentCombo = useGameStore((state) => state.currentCombo)

    // Handle hint from HUD button
    useEffect(() => {
        const handleHint = (event: CustomEvent<string[]>) => {
            setClueTiles(event.detail)
            // Clear hint after 3 seconds
            setTimeout(() => setClueTiles([]), 3000)
        }
        window.addEventListener('hint-request', handleHint as EventListener)
        return () => {
            window.removeEventListener('hint-request', handleHint as EventListener)
        }
    }, [])

    const flatTiles = useMemo(
        () => board.flatMap((row) => row.map((tile) => tile)),
        [board],
    )

    const poppingIds = useMemo(
        () => new Set(poppingTileIds),
        [poppingTileIds],
    )

    // Play pop sounds when tiles start popping
    useEffect(() => {
        if (poppingTileIds.length > 0) {
            // Play a pop sound for the first few tiles
            const count = Math.min(poppingTileIds.length, 5)
            for (let i = 0; i < count; i++) {
                setTimeout(() => {
                    soundManager.playPop()
                }, i * 20)
            }

            // Trigger screen shake for big matches or combos
            if (poppingTileIds.length >= 5 || currentCombo >= 2) {
                const intensity = Math.min(0.3 + (poppingTileIds.length / 20) + (currentCombo * 0.1), 1)
                setScreenShake({ intensity, duration: 300 })
            }
        }
    }, [poppingTileIds, currentCombo])

    const isFrozen = isResolving || status !== 'playing'

    // Register user interaction to reset hint timer
    const registerInteraction = useCallback(() => {
        if (isFrozen) return
        setClueTiles([]) // Clear any visible hints
        setInteractionCount((prev) => prev + 1) // Increment to trigger hint timer reset
        // Clear existing hint timeout
        if (hintTimeoutRef.current) {
            window.clearTimeout(hintTimeoutRef.current)
            hintTimeoutRef.current = undefined
        }
    }, [isFrozen])

    // Get adjacent tiles for swap highlighting
    const getAdjacentTiles = useCallback((tile: TileType): TileType[] => {
        const size = board.length
        const adjacent: TileType[] = []

        // Check all 4 directions
        const directions = [
            { row: tile.row - 1, col: tile.col }, // up
            { row: tile.row + 1, col: tile.col }, // down
            { row: tile.row, col: tile.col - 1 }, // left
            { row: tile.row, col: tile.col + 1 }, // right
        ]

        directions.forEach(({ row, col }) => {
            if (row >= 0 && row < size && col >= 0 && col < size) {
                const adjacentTile = board[row][col]
                // Can swap if not an obstacle without a piece
                if (!adjacentTile.isObstacle || adjacentTile.pieceType !== null) {
                    adjacent.push(adjacentTile)
                }
            }
        })

        return adjacent
    }, [board])

    // Hint system: show available moves after 10 seconds of user inactivity
    useEffect(() => {
        // Don't show hints when game is not playable
        if (isFrozen || isResolving || selectedTileForSwap || status !== 'playing') {
            setClueTiles([])
            if (hintTimeoutRef.current) {
                window.clearTimeout(hintTimeoutRef.current)
                hintTimeoutRef.current = undefined
            }
            return
        }

        // Clear existing timeout before starting new one
        if (hintTimeoutRef.current) {
            window.clearTimeout(hintTimeoutRef.current)
            hintTimeoutRef.current = undefined
        }

        // Start hint timer - resets whenever interactionCount changes (user interaction)
        hintTimeoutRef.current = window.setTimeout(() => {
            console.log('Hint timer fired! Checking for hints...')
            // Get fresh state when timer fires
            const currentStatus = useGameStore.getState().status
            const currentIsResolving = useGameStore.getState().isResolving
            const currentBoard = useGameStore.getState().board

            // Double-check game is still playable
            if (currentStatus !== 'playing' || currentIsResolving) {
                return
            }

            // Find a valid swap hint (two tiles that can be swapped to create a match)
            const swapHint = findSwapHint(currentBoard)
            if (swapHint) {
                console.log('Found swap hint:', swapHint[0].id, swapHint[1].id)
                // Highlight both tiles that should be swapped
                setClueTiles([swapHint[0].id, swapHint[1].id])
            } else {
                // Fallback: try to find existing pattern
                const match = findFirstPattern(currentBoard)
                if (match) {
                    console.log('Found existing pattern hint:', match.map(t => t.id))
                    setClueTiles(match.map((tile) => tile.id))
                } else {
                    console.log('No hint found')
                }
            }
        }, DEBUG_HINT_DELAY)

        return () => {
            if (hintTimeoutRef.current) {
                window.clearTimeout(hintTimeoutRef.current)
                hintTimeoutRef.current = undefined
            }
        }
    }, [interactionCount, isFrozen, isResolving, selectedTileForSwap, status])

    // Clear swap selection when board changes or resolving
    useEffect(() => {
        if (isResolving || status !== 'playing') {
            setSelectedTileForSwap(null)
            setSwapTargetTiles([])
        }
    }, [isResolving, status])

    return (
        <section className="w-full pb-16">
            <div
                ref={boardRef}
                className={clsx(
                    'relative mx-auto grid grid-cols-6 gap-3 touch-none overflow-visible backdrop-blur-md border border-white/10',
                    invalidShake && 'animate-shake',
                )}
                style={{
                    width: '800px',
                    height: '800px',
                    background: 'linear-gradient(135deg, rgba(10, 25, 41, 0.4) 0%, rgba(10, 25, 41, 0.6) 100%)',
                    padding: '40px',
                    borderRadius: '16px',
                    boxShadow: '0px 8px 32px 0px rgba(0, 0, 0, 0.5), inset 0px 1px 0px 0px rgba(255, 255, 255, 0.1)',
                }}
            >
                {/* Dynamic environment based on level goal */}
                <LevelEnvironment goal={level.goal} />

                {flatTiles.map((tile) => {
                    const isPopping = poppingIds.has(tile.id)
                    const isMatched = matchedTileIds.includes(tile.id) // Highlight matched pattern
                    const movement = tileMovements.find(m => m.tileId === tile.id) // Find movement animation data
                    const swapMovement = swappingTiles.find(s => s.tileId === tile.id) // Find swap animation data
                    const isClue = clueTiles.includes(tile.id)
                    const isHovered = hoveredTileId === tile.id
                    const isPatternHint = patternHintTiles.includes(tile.id)
                    const isSelectedForSwap = selectedTileForSwap?.id === tile.id
                    const isSwapTarget = swapTargetTiles.includes(tile.id)

                    return (
                        <Tile
                            key={tile.id}
                            tile={tile}
                            isSelected={isSelectedForSwap}
                            isPreview={isSwapTarget}
                            isPopping={isPopping}
                            isMatched={isMatched}
                            tileMovement={movement}
                            swapMovement={swapMovement}
                            isDisabled={isFrozen}
                            isClue={isClue}
                            isHovered={isHovered}
                            isPotentialPattern={isPatternHint}
                            isSnapped={false}
                            isInvalid={false}
                            isSoftHint={false}
                            softHintType={null}
                            onPointerDown={(t) => {
                                registerInteraction()
                                setPatternHintTiles([])

                                if (isFrozen || !t.pieceType) return

                                // If no tile selected, select this one
                                if (!selectedTileForSwap) {
                                    setSelectedTileForSwap(t)
                                    const adjacent = getAdjacentTiles(t)
                                    setSwapTargetTiles(adjacent.map((a) => a.id))
                                } else {
                                    // Second tile clicked - attempt swap
                                    if (selectedTileForSwap.id === t.id) {
                                        // Clicked same tile - deselect
                                        setSelectedTileForSwap(null)
                                        setSwapTargetTiles([])
                                    } else if (swapTargetTiles.includes(t.id)) {
                                        // Clicked adjacent tile - swap
                                        attemptSwap(selectedTileForSwap, t)
                                        setSelectedTileForSwap(null)
                                        setSwapTargetTiles([])
                                    } else {
                                        // Clicked different tile - select new one
                                        setSelectedTileForSwap(t)
                                        const adjacent = getAdjacentTiles(t)
                                        setSwapTargetTiles(adjacent.map((a) => a.id))
                                    }
                                }
                            }}
                            onPointerEnter={(t) => {
                                // Don't reset hint timer on hover - only on actual clicks
                                if (t.pieceType && !selectedTileForSwap && !isFrozen) {
                                    setHoveredTileId(t.id)
                                    const hints = findPatternHints(board, t)
                                    setPatternHintTiles(hints.map((h) => h.id))
                                }
                            }}
                            onPointerLeave={() => {
                                if (!selectedTileForSwap) {
                                    setHoveredTileId(null)
                                    setPatternHintTiles([])
                                }
                            }}
                            onPointerUp={() => {
                                // Interaction already registered on pointerDown
                            }}
                        />
                    )
                })}

                {/* Score Popups */}
                {scorePopups.map((popup) => {
                    // Calculate actual pixel position based on tile grid
                    if (!boardRef.current) return null

                    const boardRect = boardRef.current.getBoundingClientRect()
                    const boardPadding = 16 // Padding from board edges
                    const gap = 8 // Gap between tiles
                    const tileSize = (boardRect.width - boardPadding * 2 - gap * 5) / 6 // 6 columns with gaps

                    // Convert grid position (0-5) to pixel position
                    const x = boardPadding + popup.x * (tileSize + gap) + tileSize / 2
                    const y = boardPadding + popup.y * (tileSize + gap) + tileSize / 2

                    return (
                        <ScorePopup
                            key={popup.id}
                            score={popup.score}
                            x={x}
                            y={y}
                            multiplier={popup.multiplier}
                            onComplete={() => removeScorePopup(popup.id)}
                        />
                    )
                })}

                {/* Screen Shake */}
                {screenShake && (
                    <ScreenShake
                        intensity={screenShake.intensity}
                        duration={screenShake.duration}
                        onComplete={() => setScreenShake(null)}
                    />
                )}
            </div>
        </section>
    )
}

