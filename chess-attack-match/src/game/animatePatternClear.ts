import { clearTiles } from './clearTiles'
import { collapseBoardFully } from './collapseBoardFully'
import { findAllPatterns } from './findAllPatterns'
import { refillBoard } from './refillBoard'
import { processMatchForSpecialTile } from './createSpecialTile'
import { createEmptyTile } from './generateBoard'
import type { BoardMatrix, Match, Tile } from './types'

export interface TileMovement {
    tileId: string
    fromRow: number
    fromCol: number
    toRow: number
    toCol: number
    isNewTile: boolean // True if tile is spawning from top
}

export interface AnimationStep {
    type: 'highlight' | 'pop' | 'gravity' | 'refill' | 'cascade'
    matches?: Match[]
    movements?: TileMovement[]
    duration: number
}

/**
 * Calculate tile movements for gravity animation
 */
const calculateGravityMovements = (
    oldBoard: BoardMatrix,
    newBoard: BoardMatrix,
): TileMovement[] => {
    const movements: TileMovement[] = []
    const size = oldBoard.length

    // Track where each tile moved to
    const tileMap = new Map<string, { row: number; col: number }>()
    for (let row = 0; row < size; row += 1) {
        for (let col = 0; col < size; col += 1) {
            const tile = newBoard[row][col]
            if (tile.pieceType !== null && !tile.isObstacle) {
                tileMap.set(tile.id, { row, col })
            }
        }
    }

    // Find movements
    for (let row = 0; row < size; row += 1) {
        for (let col = 0; col < size; col += 1) {
            const oldTile = oldBoard[row][col]
            if (oldTile.pieceType !== null && !oldTile.isObstacle) {
                const newPos = tileMap.get(oldTile.id)
                if (newPos && (newPos.row !== row || newPos.col !== col)) {
                    movements.push({
                        tileId: oldTile.id,
                        fromRow: row,
                        fromCol: col,
                        toRow: newPos.row,
                        toCol: newPos.col,
                        isNewTile: false,
                    })
                }
            }
        }
    }

    return movements
}

/**
 * Calculate new tile spawns from top
 */
const calculateRefillMovements = (
    oldBoard: BoardMatrix,
    newBoard: BoardMatrix,
): TileMovement[] => {
    const movements: TileMovement[] = []
    const size = oldBoard.length

    // Find tiles in new board that weren't in old board (spawned from top)
    const oldTileIds = new Set<string>()
    for (let row = 0; row < size; row += 1) {
        for (let col = 0; col < size; col += 1) {
            const tile = oldBoard[row][col]
            if (tile.pieceType !== null) {
                oldTileIds.add(tile.id)
            }
        }
    }

    // New tiles are those not in old board
    for (let row = 0; row < size; row += 1) {
        for (let col = 0; col < size; col += 1) {
            const newTile = newBoard[row][col]
            if (newTile.pieceType !== null && !oldTileIds.has(newTile.id)) {
                // New tile spawned - animate from top (row -1)
                movements.push({
                    tileId: newTile.id,
                    fromRow: -1, // Start from above board
                    fromCol: col,
                    toRow: row,
                    toCol: col,
                    isNewTile: true,
                })
            }
        }
    }

    return movements
}

/**
 * Process a single pattern clear with full animation sequence
 */
export const processPatternClear = (
    board: BoardMatrix,
    matches: Match[],
): {
    steps: AnimationStep[]
    finalBoard: BoardMatrix
    allMatches: Match[]
} => {
    const steps: AnimationStep[] = []
    let workingBoard = board
    const allMatches: Match[] = [...matches]

    // Step 1: Highlight (0.4s)
    steps.push({
        type: 'highlight',
        matches,
        duration: 400,
    })

    // Step 2: Pop animation (0.2s)
    steps.push({
        type: 'pop',
        matches,
        duration: 200,
    })

    // Step 3: Process matches for special tiles and clear
    // Check each match to see if it should create a striped piece
    const matchesToClear: Match[] = []
    const specialTilesToCreate: Array<{ tile: Tile; tilesToClear: Tile[] }> = []

    matches.forEach((match) => {
        const specialTileResult = processMatchForSpecialTile(match)

        if (specialTileResult.shouldCreateSpecial && specialTileResult.specialTile) {
            // Store special tile creation info
            specialTilesToCreate.push({
                tile: specialTileResult.specialTile,
                tilesToClear: specialTileResult.tilesToClear,
            })
        } else {
            // Normal match - add to clear list
            matchesToClear.push(match)
        }
    })

    // Apply special tile transformations
    if (specialTilesToCreate.length > 0) {
        workingBoard = workingBoard.map((row) =>
            row.map((tile) => {
                // Check if this tile should become striped
                const specialTileInfo = specialTilesToCreate.find(
                    (info) => info.tile.id === tile.id,
                )
                if (specialTileInfo) {
                    return specialTileInfo.tile
                }
                // Check if this tile should be cleared (part of a special tile match)
                const shouldClear = specialTilesToCreate.some((info) =>
                    info.tilesToClear.some((t: Tile) => t.id === tile.id),
                )
                if (shouldClear) {
                    return createEmptyTile(tile.row, tile.col)
                }
                return { ...tile }
            }),
        )
    }

    // Clear normal matches (this will also activate any existing striped pieces in the matches)
    if (matchesToClear.length > 0) {
        workingBoard = clearTiles(workingBoard, matchesToClear)
    }

    // Also check if any of the special tiles we're creating are striped pieces that should activate
    // (This handles the case where a newly created striped piece is immediately matched)
    // Note: Newly created striped pieces won't be in matches yet, so this is for future cascades

    // Step 4: Gravity animation
    const beforeGravity = workingBoard
    workingBoard = collapseBoardFully(workingBoard)
    const gravityMovements = calculateGravityMovements(beforeGravity, workingBoard)

    if (gravityMovements.length > 0) {
        steps.push({
            type: 'gravity',
            movements: gravityMovements,
            duration: 180, // 180ms ease-out (within 150-200ms range)
        })
    }

    // Step 5: Refill animation (only after gravity completes)
    // Note: Refill is delayed until gravity animation finishes
    const beforeRefill = workingBoard
    workingBoard = refillBoard(workingBoard)
    const refillMovements = calculateRefillMovements(beforeRefill, workingBoard)

    if (refillMovements.length > 0) {
        steps.push({
            type: 'refill',
            movements: refillMovements,
            duration: 180, // 180ms for new tiles to fall from top (same as gravity)
        })
    }

    return {
        steps,
        finalBoard: workingBoard,
        allMatches,
    }
}

/**
 * Process cascades with full animation sequence
 */
export const processCascades = (
    board: BoardMatrix,
    maxIterations: number = 5,
): {
    steps: AnimationStep[]
    finalBoard: BoardMatrix
    allMatches: Match[]
} => {
    const allSteps: AnimationStep[] = []
    let workingBoard = board
    const allMatches: Match[] = []
    let iterationCount = 0

    while (iterationCount < maxIterations) {
        const cascadeMatches = findAllPatterns(workingBoard)
        if (cascadeMatches.length === 0) break

        allMatches.push(...cascadeMatches)

        // Process this cascade with full animation
        const result = processPatternClear(workingBoard, cascadeMatches)
        allSteps.push(...result.steps)
        workingBoard = result.finalBoard

        iterationCount += 1
    }

    return {
        steps: allSteps,
        finalBoard: workingBoard,
        allMatches,
    }
}

