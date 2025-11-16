import { MAX_SHUFFLE_ATTEMPTS } from './constants'
import { gentleShuffle } from './gentleShuffle'
import { hasAutomaticMatches } from './hasAutomaticMatches'
import { hasValidMoves } from './hasValidMoves'
import type { BoardMatrix } from './types'

export const safeShuffle = (board: BoardMatrix): BoardMatrix => {
    let current = board
    for (let attempt = 0; attempt < MAX_SHUFFLE_ATTEMPTS; attempt += 1) {
        // Use gentle shuffle to cluster pieces and make patterns easier to spot
        const shuffled = gentleShuffle(current)
        if (!hasAutomaticMatches(shuffled) && hasValidMoves(shuffled)) {
            return shuffled
        }
        current = shuffled
    }

    console.warn('⚠️ Shuffle attempts capped to prevent infinite loop')
    return gentleShuffle(current)
}



