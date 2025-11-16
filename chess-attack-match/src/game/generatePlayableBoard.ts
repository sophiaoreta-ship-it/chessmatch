import {
    BOARD_SIZE,
    DEFAULT_ALLOWED_PIECES,
    MAX_BOARD_GENERATION_ATTEMPTS,
} from './constants'
import { generateBoard } from './generateBoard'
import { gentleShuffle } from './gentleShuffle'
import { hasAutomaticMatches } from './hasAutomaticMatches'
import { hasValidMoves } from './hasValidMoves'
import { runFullStabilization } from './runFullStabilization'
import type { BoardGenerationOptions, BoardMatrix } from './types'

const generateRandomBoard = (
    size: number,
    allowedPieces: BoardGenerationOptions['allowedPieces'],
    obstacles: BoardGenerationOptions['obstacles'],
    specialTokens: BoardGenerationOptions['specialTokens'],
): BoardMatrix =>
    generateBoard(
        size,
        allowedPieces ?? DEFAULT_ALLOWED_PIECES,
        obstacles ?? [],
        specialTokens ?? [],
    )

export const generatePlayableBoard = (
    options: BoardGenerationOptions = {},
): BoardMatrix => {
    const size = options.size ?? BOARD_SIZE
    let board = generateRandomBoard(
        size,
        options.allowedPieces,
        options.obstacles,
        options.specialTokens,
    )

    for (let i = 0; i < MAX_BOARD_GENERATION_ATTEMPTS; i += 1) {
        board = runFullStabilization(board)

        if (!hasAutomaticMatches(board) && hasValidMoves(board)) {
            return board
        }

        board = gentleShuffle(board)
    }

    console.warn('⚠️ Using fallback board (init failed)')
    return gentleShuffle(board)
}



