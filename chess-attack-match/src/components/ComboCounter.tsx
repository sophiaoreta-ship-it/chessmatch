type ComboCounterProps = {
    combo: number
    isActive: boolean
}

export const ComboCounter = ({ combo, isActive }: ComboCounterProps) => {
    if (!isActive || combo < 2) return null

    return (
        <div
            className="fixed top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
            style={{
                animation: 'comboPulse 0.6s ease-out',
            }}
        >
            <div className="bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-2xl border-2 border-white/30">
                <div className="text-center">
                    <div className="text-sm uppercase tracking-widest text-white/90 font-semibold">
                        Combo
                    </div>
                    <div className="text-4xl font-bold text-white drop-shadow-lg">
                        {combo}x
                    </div>
                </div>
            </div>
        </div>
    )
}



