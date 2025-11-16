type LevelCompleteProps = {
    status: 'won' | 'lost'
    levelNumber: number
    goalHeadline: string
    goalProgressLabel: string
    stars?: number
    coins?: number
    xp?: number
    score?: number
    onPrimary: () => void
    onSecondary: () => void
}

const copyMap: Record<LevelCompleteProps['status'], {
    title: string
    subtitle: string
    primary: string
    secondary: string
}> = {
    won: {
        title: 'Level Complete!',
        subtitle: 'Great job! Ready for the next challenge?',
        primary: 'Next Level',
        secondary: 'Replay Level',
    },
    lost: {
        title: 'Level Failed',
        subtitle: 'Out of moves! Give it another shot.',
        primary: 'Try Again',
        secondary: 'Restart Level',
    },
}

export const LevelComplete = ({
    status,
    levelNumber,
    goalHeadline,
    goalProgressLabel,
    stars = 0,
    coins = 0,
    xp = 0,
    score = 0,
    onPrimary,
    onSecondary,
}: LevelCompleteProps) => {
    const copy = copyMap[status]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-[0_40px_70px_-30px_rgba(15,23,42,0.9)] text-center">
                <p className="text-sm uppercase tracking-widest text-slate-400">
                    Level {levelNumber}
                </p>
                <h2 className="mt-2 text-3xl font-bold text-white">{copy.title}</h2>
                <p className="mt-1 text-sm text-slate-300">{copy.subtitle}</p>

                {status === 'won' && (
                    <div className="mt-6 space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                        <div className="flex items-center justify-center gap-2">
                            {[1, 2, 3].map((star) => (
                                <span
                                    key={star}
                                    className={`text-3xl ${star <= stars
                                            ? 'text-yellow-400'
                                            : 'text-slate-600'
                                        }`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-slate-500">
                                    Score
                                </p>
                                <p className="text-lg font-bold text-white">{score}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-widest text-slate-500">
                                    Coins
                                </p>
                                <p className="text-lg font-bold text-amber-400">{coins}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-widest text-slate-500">
                                    XP
                                </p>
                                <p className="text-lg font-bold text-emerald-400">{xp}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-6 space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-left">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-slate-500">
                            Goal
                        </p>
                        <p className="text-base font-semibold text-white">{goalHeadline}</p>
                        <p className="text-sm text-slate-400">{goalProgressLabel}</p>
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={onPrimary}
                        className="w-full rounded-full bg-emerald-400/90 px-5 py-3 text-base font-semibold text-slate-950 transition hover:bg-emerald-300"
                    >
                        {copy.primary}
                    </button>
                    <button
                        type="button"
                        onClick={onSecondary}
                        className="w-full rounded-full border border-slate-700 px-5 py-3 text-base font-semibold text-slate-200 transition hover:bg-slate-800"
                    >
                        {copy.secondary}
                    </button>
                </div>
            </div>
        </div>
    )
}


