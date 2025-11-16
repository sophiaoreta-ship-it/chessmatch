import { createEmptyTile, createTile } from './generateBoard'
import type { BoardMatrix, Match, Tile } from './types'

const keyFor = (row: number, col: number) => `${row}:${col}`

// Pawn: Find 1 tile behind the target (for 2x2 cluster, clear the cluster itself)
// For a 4-tile 2x2 cluster, we could add additional tiles, but for now just clear the cluster
const findPawnBehindTiles = (match: Match): Set<string> => {
    if (match.pieceType !== 'pawn' || match.tiles.length !== 4) {
        return new Set()
    }

    // Pawn pattern: 4 tiles in a 2x2 cluster
    // For now, just clear the cluster itself (no additional tiles)
    // If we want to add an effect like "1 tile behind target", we'd need to determine
    // which corner is the "target" and add tiles in that direction

    // For simplicity, return empty set (cluster clears itself via match.tiles)
    return new Set<string>()
}

// Rook: Find entire row or column to clear (small-scale wipe)
const findRookWipeTiles = (board: BoardMatrix, match: Match): Set<string> => {
    if (match.pieceType !== 'rook' || match.tiles.length < 3) {
        return new Set()
    }

    const wipeTiles = new Set<string>()
    const size = board.length
    const first = match.tiles[0]

    // Check if it's a horizontal or vertical line
    const sameRow = match.tiles.every((tile) => tile.row === first.row)
    const sameCol = match.tiles.every((tile) => tile.col === first.col)

    if (sameRow) {
        // Clear entire row
        for (let col = 0; col < size; col += 1) {
            wipeTiles.add(keyFor(first.row, col))
        }
    } else if (sameCol) {
        // Clear entire column
        for (let row = 0; row < size; row += 1) {
            wipeTiles.add(keyFor(row, first.col))
        }
    }

    return wipeTiles
}

// Bishop: Extend diagonal blast (clear entire diagonal)
const findBishopBlastTiles = (board: BoardMatrix, match: Match): Set<string> => {
    if (match.pieceType !== 'bishop' || match.tiles.length < 3) {
        return new Set()
    }

    const blastTiles = new Set<string>()
    const size = board.length
    const first = match.tiles[0]

    // Determine which diagonal (major or minor)
    const majorDiagonal = first.row - first.col
    const minorDiagonal = first.row + first.col

    const onMajor = match.tiles.every((tile) => tile.row - tile.col === majorDiagonal)
    const onMinor = match.tiles.every((tile) => tile.row + tile.col === minorDiagonal)

    if (onMajor) {
        // Clear entire major diagonal (down-right)
        for (let row = 0; row < size; row += 1) {
            const col = row - majorDiagonal
            if (col >= 0 && col < size) {
                blastTiles.add(keyFor(row, col))
            }
        }
    } else if (onMinor) {
        // Clear entire minor diagonal (down-left)
        for (let row = 0; row < size; row += 1) {
            const col = minorDiagonal - row
            if (col >= 0 && col < size) {
                blastTiles.add(keyFor(row, col))
            }
        }
    }

    return blastTiles
}

// Find tiles to clear when a striped piece is activated
const findStripedTiles = (board: BoardMatrix, tile: Tile): Set<string> => {
    const stripedTiles = new Set<string>()
    const size = board.length

    if (tile.specialTileType === 'striped' && tile.specialTileDirection) {
        if (tile.specialTileDirection === 'horizontal') {
            // Clear entire row
            for (let col = 0; col < size; col += 1) {
                stripedTiles.add(keyFor(tile.row, col))
            }
        } else {
            // Clear entire column
            for (let row = 0; row < size; row += 1) {
                stripedTiles.add(keyFor(row, tile.col))
            }
        }
    }

    return stripedTiles
}

export const clearTiles = (board: BoardMatrix, matches: Match[]): BoardMatrix => {
    if (matches.length === 0) {
        return board
    }

    console.log('🧹 clearTiles called with', matches.length, 'matches')
    matches.forEach((match, index) => {
        console.log(`  Match ${index + 1}:`, {
            pieceType: match.pieceType,
            tileCount: match.tiles.length,
            tileIds: match.tiles.map((t) => t.id),
            hasStriped: match.tiles.some((t) => t.specialTileType === 'striped'),
        })
    })

    const positions = new Set<string>()
    matches.forEach((match) => {
        // Check if any tile in the match is a striped piece
        // First check the match tiles, but also verify against the board state
        let stripedTile = match.tiles.find((tile) => tile.specialTileType === 'striped')

        // If not found in match tiles, check the board directly (tiles might have been cloned without specialTileType)
        if (!stripedTile) {
            for (const tile of match.tiles) {
                const boardTile = board[tile.row]?.[tile.col]
                if (boardTile?.specialTileType === 'striped') {
                    stripedTile = boardTile
                    console.log('🎯 Found striped piece in board (not in match tiles):', {
                        matchTileId: tile.id,
                        boardTileId: boardTile.id,
                        row: boardTile.row,
                        col: boardTile.col,
                    })
                    break
                }
            }
        }

        if (stripedTile) {
            // Striped piece activated - clear entire row or column
            console.log('🎯 Striped piece activated!', {
                pieceType: stripedTile.pieceType,
                direction: stripedTile.specialTileDirection,
                row: stripedTile.row,
                col: stripedTile.col,
                matchPieceType: match.pieceType,
                matchTileCount: match.tiles.length,
            })
            const stripedTiles = findStripedTiles(board, stripedTile)
            console.log('🎯 Clearing tiles:', Array.from(stripedTiles))
            stripedTiles.forEach((key) => positions.add(key))
        } else {
            // Normal match - add the matched tiles themselves
            match.tiles.forEach((tile) => {
                positions.add(keyFor(tile.row, tile.col))
            })

            // Pawn special: also clear 1 tile behind target
            if (match.pieceType === 'pawn') {
                const behind = findPawnBehindTiles(match)
                behind.forEach((key) => positions.add(key))
            }

            // Rook special: clear entire row or column (small-scale wipe) - only for non-striped matches
            if (match.pieceType === 'rook' && match.tiles.length < 4) {
                const wipeTiles = findRookWipeTiles(board, match)
                wipeTiles.forEach((key) => positions.add(key))
            }

            // Bishop special: extend diagonal blast (clear entire diagonal)
            if (match.pieceType === 'bishop') {
                const blastTiles = findBishopBlastTiles(board, match)
                blastTiles.forEach((key) => positions.add(key))
            }
        }
    })

    return board.map((row, rowIndex) =>
        row.map((tile, colIndex) => {
            if (positions.has(keyFor(rowIndex, colIndex))) {
                const originalTile = board[rowIndex][colIndex]

                // If it's an obstacle with a piece inside, break the obstacle instead of clearing
                if (originalTile.isObstacle && originalTile.obstacleType && originalTile.pieceType !== null) {
                    const currentHits = originalTile.obstacleHits ?? 1
                    const newHits = currentHits - 1

                    // If obstacle is broken (hits reach 0), convert to regular tile
                    if (newHits <= 0) {
                        // Ice breaks - tile becomes free with the piece inside
                        return createTile(rowIndex, colIndex, originalTile.pieceType)
                    } else {
                        // Obstacle still has hits left - reduce hits but keep obstacle
                        return {
                            ...originalTile,
                            obstacleHits: newHits,
                        }
                    }
                }

                // Regular tile or obstacle without piece - clear it completely
                return createEmptyTile(rowIndex, colIndex)
            }
            return { ...tile }
        }),
    )
}


