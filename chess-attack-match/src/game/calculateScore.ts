import type { Match } from './types'

const BASE_SCORE_PER_TILE = 100
const CASCADE_MULTIPLIER = 1.5
const LONG_LINE_MULTIPLIER = 1.2 // Bonus for longer rook/bishop lines
const OBSTACLE_BONUS = 50 // Extra score for clearing obstacles

export interface ScoreCalculation {
    baseScore: number
    cascadeBonus: number
    totalScore: number
    stars: number
    coins: number
    xp: number
}

// Calculate score for a single match (used for real-time updates)
export const calculateMatchScore = (
    match: Match,
    cascadeIndex: number, // 0 = initial match, 1+ = cascades
    obstaclesCleared: number = 0,
): number => {
    const baseScore = match.tiles.length * BASE_SCORE_PER_TILE
    
    // Cascade multiplier: each cascade adds 1.5x multiplier
    const multiplier = cascadeIndex > 0 ? 1 + cascadeIndex * CASCADE_MULTIPLIER : 1
    const matchScore = baseScore * multiplier
    
    // Obstacle clearing bonus
    const obstacleBonus = obstaclesCleared * OBSTACLE_BONUS
    
    return Math.round(matchScore + obstacleBonus)
}

export const calculateScore = (
    tilesCleared: number,
    cascades: Match[],
    obstaclesCleared: number = 0,
    longestLine: number = 0,
): ScoreCalculation => {
    const baseScore = tilesCleared * BASE_SCORE_PER_TILE

    // Cascade bonus: each cascade adds multiplier
    let cascadeBonus = 0
    cascades.forEach((cascade, index) => {
        const multiplier = 1 + index * CASCADE_MULTIPLIER
        cascadeBonus += cascade.tiles.length * BASE_SCORE_PER_TILE * multiplier
    })

    // Long line bonus for rook/bishop (4+ tiles)
    let lineBonus = 0
    if (longestLine >= 4) {
        lineBonus = longestLine * BASE_SCORE_PER_TILE * (LONG_LINE_MULTIPLIER - 1)
    }

    // Obstacle clearing bonus
    const obstacleBonus = obstaclesCleared * OBSTACLE_BONUS

    const totalScore = baseScore + cascadeBonus + lineBonus + obstacleBonus

    // Stars: 1-3 based on score performance
    let stars = 1
    if (totalScore >= 500) stars = 2
    if (totalScore >= 1000) stars = 3

    // Coins: 1 coin per 100 points
    const coins = Math.floor(totalScore / 100)

    // XP: 1 XP per 50 points
    const xp = Math.floor(totalScore / 50)

    return {
        baseScore,
        cascadeBonus,
        totalScore,
        stars,
        coins,
        xp,
    }
}

