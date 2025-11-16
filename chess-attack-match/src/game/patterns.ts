import type { Tile } from './types'

export const normalizePositions = (tiles: Tile[]) => {
    const minRow = Math.min(...tiles.map((tile) => tile.row))
    const minCol = Math.min(...tiles.map((tile) => tile.col))

    return tiles.map((tile) => ({
        row: tile.row - minRow,
        col: tile.col - minCol,
    }))
}

export const isConsecutive = (values: number[]) => {
    if (values.length <= 1) return true
    for (let i = 1; i < values.length; i += 1) {
        if (values[i] - values[i - 1] !== 1) {
            return false
        }
    }
    return true
}

export const getUniqueSorted = (values: number[]) =>
    Array.from(new Set(values)).sort((a, b) => a - b)

