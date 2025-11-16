import { useGameStore } from '../state/useGameStore'

type BoosterType = 'shuffle' | 'extraMoves' | 'hint' | 'showMatches'

interface Booster {
    id: BoosterType
    name: string
    description: string
    icon: string
    cost: number
    count: number
}

const BOOSTERS: Booster[] = [
    {
        id: 'shuffle',
        name: 'Shuffle',
        description: 'Shuffle the board',
        icon: '🔀',
        cost: 0,
        count: 3,
    },
    {
        id: 'extraMoves',
        name: 'Extra Moves',
        description: 'Add 5 moves',
        icon: '➕',
        cost: 0,
        count: 2,
    },
    {
        id: 'hint',
        name: 'Hint',
        description: 'Show a possible match',
        icon: '💡',
        cost: 0,
        count: 5,
    },
    {
        id: 'showMatches',
        name: 'Show All',
        description: 'Highlight all possible matches',
        icon: '👁️',
        cost: 0,
        count: 1,
    },
]

export const BoosterPanel = () => {
    const status = useGameStore((state) => state.status)
    const isResolving = useGameStore((state) => state.isResolving)

    if (status !== 'playing' || isResolving) return null

    const handleBooster = (booster: Booster) => {
        // TODO: Implement booster logic
        console.log(`Using booster: ${booster.name}`)
    }

    return (
        <div className="fixed bottom-4 left-4 flex gap-2 z-50">
            {BOOSTERS.map((booster) => (
                <button
                    key={booster.id}
                    type="button"
                    onClick={() => handleBooster(booster)}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors flex flex-col items-center gap-1 min-w-[80px]"
                    disabled={booster.count === 0}
                >
                    <span className="text-2xl">{booster.icon}</span>
                    <span className="text-xs text-slate-300">{booster.name}</span>
                    {booster.count > 0 && (
                        <span className="text-xs font-bold text-green-400">{booster.count}</span>
                    )}
                </button>
            ))}
        </div>
    )
}



