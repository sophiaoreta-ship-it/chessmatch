export type AchievementId = 
    | 'first_combo'
    | 'big_match'
    | 'perfect_level'
    | 'combo_master'
    | 'speed_demon'
    | 'obstacle_breaker'

export interface Achievement {
    id: AchievementId
    name: string
    description: string
    icon: string
    unlocked: boolean
    unlockedAt?: number // Timestamp
}

export const ACHIEVEMENTS: Record<AchievementId, Omit<Achievement, 'unlocked' | 'unlockedAt'>> = {
    first_combo: {
        id: 'first_combo',
        name: 'First Combo',
        description: 'Complete your first combo',
        icon: '⭐',
    },
    big_match: {
        id: 'big_match',
        name: 'Big Match',
        description: 'Clear 5+ tiles in a single match',
        icon: '💥',
    },
    perfect_level: {
        id: 'perfect_level',
        name: 'Perfect Level',
        description: 'Earn 3 stars on a level',
        icon: '🏆',
    },
    combo_master: {
        id: 'combo_master',
        name: 'Combo Master',
        description: 'Achieve a 5x combo',
        icon: '🔥',
    },
    speed_demon: {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete a level in under 10 moves',
        icon: '⚡',
    },
    obstacle_breaker: {
        id: 'obstacle_breaker',
        name: 'Obstacle Breaker',
        description: 'Clear 10 obstacles in a single level',
        icon: '💎',
    },
}

export const checkAchievements = (
    achievementId: AchievementId,
    currentAchievements: Achievement[],
): Achievement[] => {
    const achievement = ACHIEVEMENTS[achievementId]
    if (!achievement) return currentAchievements

    // Check if already unlocked
    if (currentAchievements.some(a => a.id === achievementId && a.unlocked)) {
        return currentAchievements
    }

    // Unlock achievement
    return [
        ...currentAchievements,
        {
            ...achievement,
            unlocked: true,
            unlockedAt: Date.now(),
        },
    ]
}



