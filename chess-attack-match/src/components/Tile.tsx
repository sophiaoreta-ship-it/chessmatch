import { useEffect, useState } from 'react'
import clsx from 'clsx'
import type { ObstacleType, PieceType, Tile as TileType } from '../game/types'

const pieceEmoji: Record<PieceType, string> = {
    knight: '♞',
    rook: '♜',
    bishop: '♝',
    pawn: '♟',
}

// Flat solid colors - no gradients, no shadows
const pieceBg: Record<PieceType, string> = {
    knight: '', // Knight uses custom gradient background
    rook: 'bg-blue-500', // Blue - flat solid
    bishop: 'bg-green-500', // Green - flat solid
    pawn: 'bg-orange-500', // Orange - flat solid
}

// Lighter colors for glow effect when matched
const pieceGlowColor: Record<PieceType, string> = {
    knight: 'rgba(196, 181, 253, 0.8)', // Lighter purple
    rook: 'rgba(147, 197, 253, 0.8)', // Lighter blue
    bishop: 'rgba(134, 239, 172, 0.8)', // Lighter green
    pawn: 'rgba(253, 186, 116, 0.8)', // Lighter orange
}

const obstacleBg: Record<ObstacleType, string> = {
    ice: 'bg-cyan-400/30 border-2 border-cyan-300/60',
    crate: 'bg-amber-700/40 border-2 border-amber-600/60',
    stone: 'bg-slate-600/50 border-2 border-slate-500/60',
    vine: 'bg-green-700/40 border-2 border-green-600/60',
    lock: 'bg-yellow-600/40 border-2 border-yellow-500/60',
    cobweb: 'bg-slate-500/30 border-2 border-slate-400/50',
    frozen: 'bg-blue-400/30 border-2 border-blue-300/60',
}

const obstacleEmoji: Record<ObstacleType, string> = {
    ice: '❄️',
    crate: '📦',
    stone: '🪨',
    vine: '🌿',
    lock: '🔒',
    cobweb: '🕸️',
    frozen: '🧊',
}

type TileProps = {
    tile: TileType
    isSelected: boolean
    isPreview: boolean
    isPopping: boolean
    isMatched?: boolean // Tiles that matched a pattern (highlighted before clearing)
    tileMovement?: { fromRow: number; fromCol: number; toRow: number; toCol: number; isNewTile: boolean } // Animation movement data
    swapMovement?: { fromRow: number; fromCol: number; toRow: number; toCol: number } // Swap animation data
    isDisabled: boolean
    isClue: boolean
    isHovered?: boolean
    isPotentialPattern?: boolean
    isSnapped?: boolean
    isInvalid?: boolean
    isSoftHint?: boolean
    softHintType?: 'diagonal' | 'row' | 'column' | 'lshape' | null
    onPointerDown: (tile: TileType) => void
    onPointerEnter: (tile: TileType) => void
    onPointerLeave?: () => void
    onPointerUp: () => void
}

export const Tile = ({
    tile,
    isSelected,
    isPreview: _isPreview,
    isPopping,
    isMatched = false, // Default value
    tileMovement,
    swapMovement,
    isDisabled,
    isClue,
    isHovered: _isHovered = false,
    isPotentialPattern: _isPotentialPattern = false,
    isSnapped: _isSnapped = false,
    isInvalid = false,
    isSoftHint: _isSoftHint = false,
    softHintType: _softHintType = null,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
}: TileProps) => {
    // Use state to trigger gravity animation
    // Start at FROM position, then animate to TO position (0)
    const [gravityTransform, setGravityTransform] = useState<string>('')

    useEffect(() => {
        if (tileMovement && !swapMovement) {
            let initialTranslateY = 0

            if (tileMovement.isNewTile) {
                // New tiles spawn from above the board
                // fromRow is -1, toRow is the target row
                // Start from above: translateY should be negative (up)
                const distanceFromTop = tileMovement.toRow + 1 // +1 because fromRow is -1
                initialTranslateY = -distanceFromTop * 100 // Negative to start above
            } else {
                // Existing tiles fall down
                // Calculate how many rows the tile needs to fall
                const rowDiff = tileMovement.toRow - tileMovement.fromRow
                initialTranslateY = -rowDiff * 100 // Negative to start at old position
            }

            // Set initial position first
            setGravityTransform(`translateY(${initialTranslateY}%)`)

            // Then animate to 0 after a brief moment
            const timeout = setTimeout(() => {
                setGravityTransform('translateY(0%)')
            }, 10) // Small delay to ensure initial transform is applied
            return () => clearTimeout(timeout)
        } else {
            setGravityTransform('')
        }
    }, [tileMovement, swapMovement])

    // Render obstacle tiles with chess piece inside
    if (tile.isObstacle && tile.obstacleType) {
        const obstacleType = tile.obstacleType
        const hasPiece = tile.pieceType !== null

        return (
            <button
                type="button"
                disabled={isDisabled}
                className={clsx(
                    'relative aspect-square flex flex-col items-center justify-center select-none transition-transform duration-150 ease-out outline-none',
                    obstacleBg[obstacleType],
                    isSelected && 'ring-2 ring-white',
                    isClue && 'ring-4 ring-yellow-400 animate-pulse',
                    isPopping && 'animate-pop',
                    isInvalid && 'animate-shake',
                    isDisabled && 'pointer-events-none opacity-90',
                )}
                style={{
                    borderRadius: '14px', // 12-16px rounded corners
                }}
                onPointerDown={(event) => {
                    event.preventDefault()
                    onPointerDown(tile)
                }}
                onPointerEnter={() => {
                    if (isDisabled) return
                    onPointerEnter(tile)
                }}
                onPointerLeave={() => {
                    if (onPointerLeave) onPointerLeave()
                }}
                onPointerUp={() => onPointerUp()}
            >
                {/* Chess piece inside obstacle */}
                {hasPiece && (
                    <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-normal z-10">
                        {pieceEmoji[tile.pieceType!]}
                    </span>
                )}
                {/* Obstacle indicator (small icon) */}
                <span className="text-xs md:text-sm absolute top-1 right-1 opacity-70">
                    {obstacleEmoji[obstacleType]}
                </span>
                {/* Hits remaining indicator */}
                {tile.obstacleHits && tile.obstacleHits > 1 && (
                    <span className="absolute bottom-1 left-1 text-xs font-bold text-white bg-black/50 rounded-full w-5 h-5 flex items-center justify-center">
                        {tile.obstacleHits}
                    </span>
                )}
            </button>
        )
    }

    // Empty tile (no piece, no obstacle)
    if (tile.pieceType === null) {
        return (
            <div
                className="relative aspect-square bg-slate-800/50"
                style={{
                    borderRadius: '14px', // 12-16px rounded corners
                }}
            />
        )
    }

    // Regular tile with chess piece
    // Special styling for knight tiles (purple gradient design)
    const isKnight = tile.pieceType === 'knight'
    const isPawn = tile.pieceType === 'pawn'
    const isRook = tile.pieceType === 'rook'
    const isBishop = tile.pieceType === 'bishop'

    // Calculate transforms for animations
    let transform = ''
    let transition = ''

    // Swap animation takes priority
    if (swapMovement) {
        const deltaRow = swapMovement.toRow - swapMovement.fromRow
        const deltaCol = swapMovement.toCol - swapMovement.fromCol
        // Calculate translate based on tile size (approximately 100% per cell)
        const translateX = deltaCol * 100
        const translateY = deltaRow * 100
        transform = `translate(${translateX}%, ${translateY}%)`
        transition = 'transform 135ms ease-in-out' // Swap animation
    } else if (tileMovement) {
        // Use the gravity transform from state (handled by useEffect)
        transform = gravityTransform
        // Gravity animation: 180ms ease-out (within 150-200ms range)
        transition = tileMovement.isNewTile
            ? 'transform 180ms ease-out' // New tiles fall from top (same duration as gravity)
            : 'transform 180ms ease-out' // Gravity animation (150-200ms range)
    }

    return (
        <button
            type="button"
            disabled={isDisabled}
            style={{
                // For gravity animations: start at FROM position, animate to TO position (0)
                // Use requestAnimationFrame to ensure the initial transform is set before animating
                transform: transform || undefined,
                transition: transition || undefined,
                borderRadius: '16px',
                ...(isKnight && {
                    position: 'relative' as const,
                    overflow: 'hidden' as const,
                }),
                ...(isMatched && {
                    boxShadow: `0 0 15px ${pieceGlowColor[tile.pieceType]}, 0 0 25px ${pieceGlowColor[tile.pieceType]}, 0 0 35px ${pieceGlowColor[tile.pieceType]}`,
                    animation: 'blinkOutline 0.8s ease-in-out infinite',
                }),
            }}
            className={clsx(
                'relative aspect-square flex items-center justify-center select-none transition-transform duration-150 ease-out outline-none',
                pieceBg[tile.pieceType],
                isSelected && 'ring-2 ring-white',
                isMatched && 'ring-2 ring-white',
                isClue && 'ring-4 ring-yellow-400 animate-pulse',
                isPopping && 'animate-pop',
                isInvalid && 'animate-shake',
                isDisabled && 'pointer-events-none opacity-90',
            )}
            onPointerDown={(event) => {
                event.preventDefault()
                onPointerDown(tile)
            }}
            onPointerEnter={() => {
                if (isDisabled) return
                onPointerEnter(tile)
            }}
            onPointerUp={() => onPointerUp()}
        >
            {/* All chess piece tiles - using image assets */}
            {isKnight ? (
                <img
                    src="/assets/knight.svg"
                    alt="Knight"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                        borderRadius: '16px',
                    }}
                />
            ) : isPawn ? (
                <img
                    src="/assets/pawn.svg"
                    alt="Pawn"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                        borderRadius: '16px',
                    }}
                />
            ) : isRook ? (
                <img
                    src="/assets/rook.svg"
                    alt="Rook"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                        borderRadius: '16px',
                    }}
                />
            ) : isBishop ? (
                <img
                    src="/assets/bishop.svg"
                    alt="Bishop"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                        borderRadius: '16px',
                    }}
                />
            ) : (
                <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-normal">
                    {pieceEmoji[tile.pieceType]}
                </span>
            )}

            {/* Striped piece visual indicator */}
            {tile.specialTileType === 'striped' && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        borderRadius: '16px',
                        background: tile.specialTileDirection === 'horizontal'
                            ? 'repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(255, 255, 255, 0.4) 8px, rgba(255, 255, 255, 0.4) 12px)'
                            : 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255, 255, 255, 0.4) 8px, rgba(255, 255, 255, 0.4) 12px)',
                        border: '2px solid rgba(255, 255, 255, 0.6)',
                    }}
                />
            )}
        </button>
    )
}

