import type { Match, SpecialTileType, Tile } from './types'

/**
 * Create a special tile (striped, wrapped, or color bomb) from a regular tile
 */
export const createSpecialTile = (
    tile: Tile,
    specialType: SpecialTileType,
    direction?: 'horizontal' | 'vertical',
): Tile => {
    if (!tile.pieceType) {
        throw new Error('Cannot create special tile from tile without piece type')
    }

    return {
        ...tile,
        specialTileType: specialType,
        specialTileDirection: direction,
    }
}

/**
 * Check if a match should create a special tile and return the transformed match
 * Returns: { shouldCreateSpecial: boolean, specialTile: Tile | null, tilesToClear: Tile[] }
 */
export const processMatchForSpecialTile = (match: Match): {
    shouldCreateSpecial: boolean
    specialTile: Tile | null
    tilesToClear: Tile[]
} => {
    // Rook or Bishop patterns with exactly 4 tiles create striped pieces
    if ((match.pieceType === 'rook' || match.pieceType === 'bishop') && match.tiles.length === 4) {
        let direction: 'horizontal' | 'vertical' = 'horizontal'

        if (match.pieceType === 'rook') {
            // For Rook: determine if it's horizontal or vertical
            const isHorizontal = match.tiles[0].row === match.tiles[1].row
            direction = isHorizontal ? 'horizontal' : 'vertical'
        } else if (match.pieceType === 'bishop') {
            // For Bishop: determine direction based on diagonal orientation
            // Check if it's a major diagonal (top-left to bottom-right) or minor diagonal (top-right to bottom-left)
            const sortedTiles = [...match.tiles].sort((a, b) => a.row - b.row || a.col - b.col)
            const rowDiff = sortedTiles[sortedTiles.length - 1].row - sortedTiles[0].row
            const colDiff = sortedTiles[sortedTiles.length - 1].col - sortedTiles[0].col

            // If the diagonal is more horizontal (col diff > row diff), use horizontal direction
            // Otherwise use vertical direction
            direction = Math.abs(colDiff) > Math.abs(rowDiff) ? 'horizontal' : 'vertical'
        }

        // Pick the center tile (index 2) to transform
        const centerIndex = 2
        const specialTile = createSpecialTile(
            match.tiles[centerIndex],
            'striped',
            direction,
        )

        // Return the other 3 tiles to clear
        const tilesToClear = match.tiles.filter((_, i) => i !== centerIndex)

        return {
            shouldCreateSpecial: true,
            specialTile,
            tilesToClear,
        }
    }

    // No special tile for this match
    return {
        shouldCreateSpecial: false,
        specialTile: null,
        tilesToClear: match.tiles,
    }
}

