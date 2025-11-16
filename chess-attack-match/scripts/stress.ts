import { performance } from 'node:perf_hooks'
import { generatePlayableBoard } from '../src/game/generatePlayableBoard'
import { runFullStabilizationWithReport } from '../src/game/runFullStabilization'
import { safeShuffle } from '../src/game/safeShuffle'
import { BOARD_SIZE, DEFAULT_ALLOWED_PIECES } from '../src/game/constants'

const iterations = 100
let total = 0

for (let i = 0; i < iterations; i += 1) {
    const start = performance.now()
    let board = generatePlayableBoard({
        size: BOARD_SIZE,
        allowedPieces: DEFAULT_ALLOWED_PIECES,
    })
    const report = runFullStabilizationWithReport(board)
    board = report.board
    board = safeShuffle(board)
    total += performance.now() - start
}

console.log('avg ms', total / iterations)


