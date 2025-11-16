import type { PieceType, SpecialTokenType, Tile } from './types'

const makeId = (prefix: string, row: number, col: number) =>
    `${prefix}-${row}-${col}-${Math.random().toString(36).slice(2, 8)}`

export const createSpecialTokenTile = (
    row: number,
    col: number,
    pieceType: PieceType,
    specialToken: SpecialTokenType,
): Tile => ({
    id: makeId('token', row, col),
    row,
    col,
    pieceType,
    specialToken,
    hasReachedBottom: false,
})


