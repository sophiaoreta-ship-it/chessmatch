export type PieceType = 'knight' | 'rook' | 'bishop' | 'pawn'

export type SpecialTileType = 'striped' | 'wrapped' | 'colorBomb' | null

export type ObstacleType = 'ice' | 'crate' | 'stone' | 'vine' | 'lock' | 'cobweb' | 'frozen'

export type SpecialTokenType = 'king' | 'shield' | 'sword'

export interface Coordinate {
    row: number
    col: number
}

export interface Tile extends Coordinate {
    id: string
    pieceType: PieceType | null
    isObstacle?: boolean
    obstacleType?: ObstacleType
    obstacleHits?: number // For obstacles that need multiple hits
    specialToken?: SpecialTokenType
    hasReachedBottom?: boolean // Track if special token reached bottom
    specialTileType?: SpecialTileType // Power-up tile type
    specialTileDirection?: 'horizontal' | 'vertical' // For striped tiles
}

export type BoardMatrix = Tile[][]

export interface Move {
    from: Coordinate
    to: Coordinate
}

export interface BoardGenerationOptions {
    size?: number
    allowedPieces?: PieceType[]
    obstacles?: ObstacleConfig[]
    specialTokens?: SpecialTokenConfig[]
}

export type LevelGoal =
    | {
        type: 'score'
        target: number
    }
    | {
        type: 'clearObstacles'
        obstacleType: ObstacleType
        target: number
    }
    | {
        type: 'dropTokens'
        tokenType: SpecialTokenType
        target: number
    }
    | {
        type: 'clearBoard'
    }
    | {
        type: 'combination'
        goals: LevelGoal[]
    }

export interface ObstacleConfig {
    type: ObstacleType
    position: Coordinate
    hitsRequired?: number // Default: 1 for ice, 2 for crates, 3 for stone
}

export interface SpecialTokenConfig {
    type: SpecialTokenType
    position: Coordinate
}

export interface LevelConfig {
    id: number
    title: string
    moveLimit: number
    allowedPieces: PieceType[]
    goal: LevelGoal
    obstacles?: ObstacleConfig[]
    specialTokens?: SpecialTokenConfig[]
}

export interface Match {
    pieceType: PieceType
    tiles: Tile[]
}


