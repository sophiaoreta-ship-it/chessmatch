import type { Tile } from './types'
import { getUniqueSorted, isConsecutive, normalizePositions } from './patterns'
import { knightShapes } from './shapeDefinitions'

export type ValidationResult =
    | {
        isValid: true
        reason?: undefined
    }
    | {
        isValid: false
        reason: string
    }

const KNIGHT_SHAPE_KEYS = new Set(
    knightShapes.map((shape) =>
        shape
            .map((point) => `${point.row}:${point.col}`)
            .sort()
            .join('|'),
    ),
)

// Knight must be exactly 4-tile L-shape
const isKnightShape = (tiles: Tile[]) => {
    // Only accept 4-tile patterns
    if (tiles.length !== 4) return false

    // Check if it's a valid 4-tile L-shape
    const normalized = normalizePositions(tiles)
    const key = normalized
        .map((position) => `${position.row}:${position.col}`)
        .sort()
        .join('|')
    return KNIGHT_SHAPE_KEYS.has(key)
}

const isRookShape = (tiles: Tile[]) => {
    if (tiles.length < 3) return false // Minimum 3 tiles for rook
    const first = tiles[0]
    const sameRow = tiles.every((tile) => tile.row === first.row)
    const sameCol = tiles.every((tile) => tile.col === first.col)

    if (!sameRow && !sameCol) return false

    if (sameRow) {
        const columns = getUniqueSorted(tiles.map((tile) => tile.col))
        return columns.length === tiles.length && isConsecutive(columns)
    }

    const rows = getUniqueSorted(tiles.map((tile) => tile.row))
    return rows.length === tiles.length && isConsecutive(rows)
}

const isBishopShape = (tiles: Tile[]) => {
    if (tiles.length < 3) return false // Minimum 3 tiles for bishop
    const majorDiagonal = tiles[0].row - tiles[0].col
    const minorDiagonal = tiles[0].row + tiles[0].col

    const onMajor = tiles.every((tile) => tile.row - tile.col === majorDiagonal)
    const onMinor = tiles.every((tile) => tile.row + tile.col === minorDiagonal)

    if (!onMajor && !onMinor) {
        return false
    }

    const sortedTiles = [...tiles].sort((a, b) => a.row - b.row || a.col - b.col)

    for (let i = 1; i < sortedTiles.length; i += 1) {
        const prev = sortedTiles[i - 1]
        const current = sortedTiles[i]
        if (
            Math.abs(prev.row - current.row) !== 1 ||
            Math.abs(prev.col - current.col) !== 1
        ) {
            return false
        }
    }

    return true
}

// Pawn: 4 tiles forming a 2x2 square cluster (diagonal capture pattern)
// Example: All 4 corners of a 2x2 area are pawns
const isPawnShape = (tiles: Tile[]) => {
    if (tiles.length !== 4) return false // Must be exactly 4 tiles

    // Check if tiles form a 2x2 square cluster
    const rows = getUniqueSorted(tiles.map((tile) => tile.row))
    const cols = getUniqueSorted(tiles.map((tile) => tile.col))

    // Must have exactly 2 unique rows and 2 unique columns
    if (rows.length !== 2 || cols.length !== 2) return false

    // Rows and columns must be consecutive
    if (!isConsecutive(rows) || !isConsecutive(cols)) return false

    // Check that all 4 positions are present
    const expectedPositions = new Set<string>()
    for (const row of rows) {
        for (const col of cols) {
            expectedPositions.add(`${row}:${col}`)
        }
    }

    const actualPositions = new Set(tiles.map((tile) => `${tile.row}:${tile.col}`))

    // All 4 positions must be present
    return expectedPositions.size === actualPositions.size &&
        [...expectedPositions].every(pos => actualPositions.has(pos))
}

export const validatePattern = (tiles: Tile[]): ValidationResult => {
    if (tiles.length < 2) {
        return { isValid: false, reason: 'needs at least 2 tiles' }
    }

    const [first, ...rest] = tiles
    if (first.pieceType === null) {
        return { isValid: false, reason: 'missing piece' }
    }
    const allSameType = rest.every((tile) => tile.pieceType === first.pieceType)

    if (!allSameType) {
        return { isValid: false, reason: 'tiles must match piece type' }
    }

    switch (first.pieceType) {
        case 'knight':
            return isKnightShape(tiles)
                ? { isValid: true }
                : { isValid: false, reason: 'invalid knight L shape' }
        case 'rook':
            return isRookShape(tiles)
                ? { isValid: true }
                : { isValid: false, reason: 'rook pattern must be straight and contiguous' }
        case 'bishop':
            return isBishopShape(tiles)
                ? { isValid: true }
                : { isValid: false, reason: 'bishop pattern must be diagonal and contiguous' }
        case 'pawn':
            return isPawnShape(tiles)
                ? { isValid: true }
                : { isValid: false, reason: 'pawn pattern must be 4 tiles forming a 2x2 cluster' }
        default:
            return { isValid: false, reason: 'unknown piece type' }
    }
}

