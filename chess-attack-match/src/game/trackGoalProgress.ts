import type {
    BoardMatrix,
    LevelGoal,
    ObstacleType,
    SpecialTokenType,
} from './types'

export interface GoalProgress {
    score: number
    obstaclesCleared: Record<ObstacleType, number>
    tokensDropped: Record<SpecialTokenType, number>
    boardCleared: boolean
}

export const countObstacles = (
    board: BoardMatrix,
    obstacleType?: ObstacleType,
): number => {
    let count = 0
    for (let row = 0; row < board.length; row += 1) {
        for (let col = 0; col < board[row].length; col += 1) {
            const tile = board[row][col]
            if (tile.isObstacle) {
                if (!obstacleType || tile.obstacleType === obstacleType) {
                    count += 1
                }
            }
        }
    }
    return count
}

export const countTokensDropped = (
    board: BoardMatrix,
    tokenType?: SpecialTokenType,
): number => {
    const size = board.length
    let count = 0
    for (let row = 0; row < size; row += 1) {
        for (let col = 0; col < board[row].length; col += 1) {
            const tile = board[row][col]
            if (tile.specialToken) {
                if (!tokenType || tile.specialToken === tokenType) {
                    // Check if token is in bottom row
                    if (row === size - 1 || tile.hasReachedBottom) {
                        count += 1
                    }
                }
            }
        }
    }
    return count
}

export const isBoardCleared = (board: BoardMatrix): boolean => {
    for (let row = 0; row < board.length; row += 1) {
        for (let col = 0; col < board[row].length; col += 1) {
            const tile = board[row][col]
            if (!tile.isObstacle && tile.pieceType !== null) {
                return false
            }
        }
    }
    return true
}

export const computeGoalTarget = (goal: LevelGoal): number => {
    switch (goal.type) {
        case 'score':
            return goal.target
        case 'clearObstacles':
            return goal.target
        case 'dropTokens':
            return goal.target
        case 'clearBoard':
            return 1 // Boolean: 1 = cleared, 0 = not cleared
        case 'combination':
            return goal.goals.length // All sub-goals must be met
        default:
            return 0
    }
}

export const computeGoalProgress = (
    goal: LevelGoal,
    progress: GoalProgress,
): number => {
    switch (goal.type) {
        case 'score':
            return progress.score
        case 'clearObstacles':
            return progress.obstaclesCleared[goal.obstacleType] ?? 0
        case 'dropTokens':
            return progress.tokensDropped[goal.tokenType] ?? 0
        case 'clearBoard':
            return progress.boardCleared ? 1 : 0
        case 'combination':
            // Count how many sub-goals are completed
            return goal.goals.reduce((count, subGoal) => {
                const subProgress = computeGoalProgress(subGoal, progress)
                const subTarget = computeGoalTarget(subGoal)
                return count + (subProgress >= subTarget ? 1 : 0)
            }, 0)
        default:
            return 0
    }
}

export const isGoalComplete = (goal: LevelGoal, progress: GoalProgress): boolean => {
    const currentProgress = computeGoalProgress(goal, progress)
    const target = computeGoalTarget(goal)
    return currentProgress >= target
}


