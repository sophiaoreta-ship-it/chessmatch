import { generatePlayableBoard } from '../src/game/generatePlayableBoard'
import { hasAutomaticMatches } from '../src/game/hasAutomaticMatches'
import { hasValidMoves } from '../src/game/hasValidMoves'
import { BOARD_SIZE, DEFAULT_ALLOWED_PIECES } from '../src/game/constants'

const board = generatePlayableBoard({
    size: BOARD_SIZE,
    allowedPieces: DEFAULT_ALLOWED_PIECES,
})

console.log('rows', board.length)
console.log('cols', board[0]?.length)
console.log('auto matches', hasAutomaticMatches(board))
console.log('has moves', hasValidMoves(board))
console.log('sample column', board.map((row) => row[0]?.pieceType))


