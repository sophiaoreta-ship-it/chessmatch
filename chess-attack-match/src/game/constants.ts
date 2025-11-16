import type { PieceType } from './types'

export const BOARD_SIZE = 6 // 6x6 board

export const DEFAULT_ALLOWED_PIECES: PieceType[] = [
    'knight',
    'rook',
    'bishop',
    'pawn',
]

export const MAX_CASCADE_ITERATIONS = 20
export const MAX_BOARD_GENERATION_ATTEMPTS = 10
export const MAX_SHUFFLE_ATTEMPTS = 20

