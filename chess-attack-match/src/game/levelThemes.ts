import type { LevelGoal } from './types'

export type LevelTheme = 'score' | 'drop' | 'obstacle' | 'collect' | 'clear' | 'combination'

/**
 * Determine the primary theme for a level based on its goal
 */
export const getLevelTheme = (goal: LevelGoal): LevelTheme => {
    switch (goal.type) {
        case 'score':
            return 'score'
        case 'dropTokens':
            return 'drop'
        case 'clearObstacles':
            return 'obstacle'
        case 'clearBoard':
            return 'clear'
        case 'combination':
            // For combination goals, determine primary theme from first goal
            if (goal.goals.length > 0) {
                return getLevelTheme(goal.goals[0])
            }
            return 'score' // Default
        default:
            return 'score'
    }
}

/**
 * Get theme-specific CSS classes and styles
 */
export const getThemeClasses = (theme: LevelTheme): {
    boardBg: string
    boardBorder: string
    progressBar: string
    accentColor: string
} => {
    switch (theme) {
        case 'score':
            return {
                boardBg: 'bg-gradient-to-br from-purple-900/90 via-slate-900 to-indigo-950',
                boardBorder: 'border-purple-500/30',
                progressBar: 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400',
                accentColor: 'purple',
            }
        case 'drop':
            return {
                boardBg: 'bg-gradient-to-br from-blue-900/90 via-slate-900 to-cyan-950',
                boardBorder: 'border-cyan-500/30',
                progressBar: 'bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400',
                accentColor: 'cyan',
            }
        case 'obstacle':
            return {
                boardBg: 'bg-gradient-to-br from-orange-900/90 via-slate-900 to-red-950',
                boardBorder: 'border-orange-500/30',
                progressBar: 'bg-gradient-to-r from-orange-500 via-red-500 to-orange-400',
                accentColor: 'orange',
            }
        case 'collect':
            return {
                boardBg: 'bg-gradient-to-br from-green-900/90 via-slate-900 to-emerald-950',
                boardBorder: 'border-emerald-500/30',
                progressBar: 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400',
                accentColor: 'emerald',
            }
        case 'clear':
            return {
                boardBg: 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950',
                boardBorder: 'border-slate-500/30',
                progressBar: 'bg-gradient-to-r from-slate-500 via-gray-500 to-slate-400',
                accentColor: 'slate',
            }
        case 'combination':
            return {
                boardBg: 'bg-gradient-to-br from-violet-900/90 via-slate-900 to-purple-950',
                boardBorder: 'border-violet-500/30',
                progressBar: 'bg-gradient-to-r from-violet-500 via-purple-500 to-violet-400',
                accentColor: 'violet',
            }
        default:
            return {
                boardBg: 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950',
                boardBorder: 'border-slate-800',
                progressBar: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
                accentColor: 'emerald',
            }
    }
}

