
type HelpProps = {
    isOpen: boolean
    onClose: () => void
}

export const Help = ({ isOpen, onClose }: HelpProps) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm px-4">
            <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-[0_40px_70px_-30px_rgba(15,23,42,0.9)] max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">How to Play</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors text-2xl leading-none"
                        aria-label="Close help"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <p className="text-slate-300 mb-4 text-center">
                            <strong className="text-white">Swap adjacent tiles</strong> to form patterns. Each piece has unique rules:
                        </p>
                    </div>

                    {/* Knight Pattern */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">♞</span>
                            <h3 className="text-lg font-semibold text-white">Knight</h3>
                        </div>
                        <p className="text-slate-300 text-sm mb-2">
                            Exactly <strong className="text-white">4 tiles</strong> in an L-shape
                        </p>
                        <div className="flex gap-4 items-start">
                            {/* Horizontal L example */}
                            <div className="grid grid-cols-3 gap-1 max-w-[90px]">
                                <div className="aspect-square rounded bg-purple-500 flex items-center justify-center text-white text-sm font-bold">♞</div>
                                <div className="aspect-square rounded bg-purple-500 flex items-center justify-center text-white text-sm font-bold">♞</div>
                                <div className="aspect-square rounded bg-purple-500 flex items-center justify-center text-white text-sm font-bold">♞</div>
                                <div className="aspect-square rounded bg-purple-500 flex items-center justify-center text-white text-sm font-bold">♞</div>
                                <div className="aspect-square rounded bg-slate-800/50"></div>
                                <div className="aspect-square rounded bg-slate-800/50"></div>
                                <div className="aspect-square rounded bg-slate-800/50"></div>
                                <div className="aspect-square rounded bg-slate-800/50"></div>
                                <div className="aspect-square rounded bg-slate-800/50"></div>
                            </div>
                            {/* Vertical L example */}
                            <div className="grid grid-cols-3 gap-1 max-w-[90px]">
                                <div className="aspect-square rounded bg-purple-500 flex items-center justify-center text-white text-sm font-bold">♞</div>
                                <div className="aspect-square rounded bg-slate-800/50"></div>
                                <div className="aspect-square rounded bg-slate-800/50"></div>
                                <div className="aspect-square rounded bg-purple-500 flex items-center justify-center text-white text-sm font-bold">♞</div>
                                <div className="aspect-square rounded bg-slate-800/50"></div>
                                <div className="aspect-square rounded bg-slate-800/50"></div>
                                <div className="aspect-square rounded bg-purple-500 flex items-center justify-center text-white text-sm font-bold">♞</div>
                                <div className="aspect-square rounded bg-purple-500 flex items-center justify-center text-white text-sm font-bold">♞</div>
                                <div className="aspect-square rounded bg-slate-800/50"></div>
                            </div>
                        </div>
                    </div>

                    {/* Rook Pattern */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">♜</span>
                            <h3 className="text-lg font-semibold text-white">Rook</h3>
                        </div>
                        <p className="text-slate-300 text-sm mb-2">
                            At least <strong className="text-white">3 tiles</strong> in a straight line (horizontal or vertical)
                        </p>
                        <div className="grid grid-cols-3 gap-1 max-w-[90px]">
                            <div className="aspect-square rounded bg-blue-500 flex items-center justify-center text-white text-sm font-bold">♜</div>
                            <div className="aspect-square rounded bg-blue-500 flex items-center justify-center text-white text-sm font-bold">♜</div>
                            <div className="aspect-square rounded bg-blue-500 flex items-center justify-center text-white text-sm font-bold">♜</div>
                        </div>
                    </div>

                    {/* Bishop Pattern */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">♝</span>
                            <h3 className="text-lg font-semibold text-white">Bishop</h3>
                        </div>
                        <p className="text-slate-300 text-sm mb-2">
                            At least <strong className="text-white">3 tiles</strong> in a diagonal line (consecutive)
                        </p>
                        <div className="grid grid-cols-3 gap-1 max-w-[90px]">
                            <div className="aspect-square rounded bg-green-500 flex items-center justify-center text-white text-sm font-bold">♝</div>
                            <div className="aspect-square rounded bg-slate-800/50"></div>
                            <div className="aspect-square rounded bg-slate-800/50"></div>
                            <div className="aspect-square rounded bg-slate-800/50"></div>
                            <div className="aspect-square rounded bg-green-500 flex items-center justify-center text-white text-sm font-bold">♝</div>
                            <div className="aspect-square rounded bg-slate-800/50"></div>
                            <div className="aspect-square rounded bg-slate-800/50"></div>
                            <div className="aspect-square rounded bg-slate-800/50"></div>
                            <div className="aspect-square rounded bg-green-500 flex items-center justify-center text-white text-sm font-bold">♝</div>
                        </div>
                    </div>

                    {/* Pawn Pattern */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">♟</span>
                            <h3 className="text-lg font-semibold text-white">Pawn</h3>
                        </div>
                        <p className="text-slate-300 text-sm mb-2">
                            Exactly <strong className="text-white">4 tiles</strong> in a 2×2 square
                        </p>
                        <div className="grid grid-cols-2 gap-1 max-w-[60px]">
                            <div className="aspect-square rounded bg-orange-500 flex items-center justify-center text-white text-sm font-bold">♟</div>
                            <div className="aspect-square rounded bg-orange-500 flex items-center justify-center text-white text-sm font-bold">♟</div>
                            <div className="aspect-square rounded bg-orange-500 flex items-center justify-center text-white text-sm font-bold">♟</div>
                            <div className="aspect-square rounded bg-orange-500 flex items-center justify-center text-white text-sm font-bold">♟</div>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="mt-6 w-full rounded-full bg-emerald-400/90 px-5 py-3 text-base font-semibold text-slate-950 transition hover:bg-emerald-300"
                >
                    Got it!
                </button>
            </div>
        </div>
    )
}

