import { useState, useEffect, useRef } from 'react'
import { Help } from './Help'
import { ComboCounter } from './ComboCounter'
import { useGameStore } from '../state/useGameStore'
import { figmaColors, figmaTypography, figmaShadows, figmaImages } from '../design/figmaTokens'
import type { BoardMatrix } from '../game/types'

type HUDProps = {
    levelNumber: number
    levelTitle: string
    movesLeft: number
    goalHeadline: string
    goalProgressLabel: string
    status: 'playing' | 'won' | 'lost'
    board: BoardMatrix
    onHint: (tileIds: string[]) => void
}

export const HUD = ({
    levelNumber,
    movesLeft,
    goalProgressLabel,
    board: _board,
    onHint: _onHint,
}: HUDProps) => {
    const [isHelpOpen, setIsHelpOpen] = useState(false)
    const level = useGameStore((state) => state.level)
    const goalProgress = useGameStore((state) => state.goalProgress)
    const goalTarget = useGameStore((state) => state.goalTarget)
    const currentCombo = useGameStore((state) => state.currentCombo)
    const isResolving = useGameStore((state) => state.isResolving)
    const totalCoins = useGameStore((state) => state.totalCoins)
    const currentScore = useGameStore((state) => state.score)

    // Calculate progress percentage
    const progressPercentage = Math.min((goalProgress / goalTarget) * 100, 100)

    // Extract score from goal headline if it's a score goal
    const scoreValue = level.goal.type === 'score' ? currentScore.toLocaleString() : goalTarget.toLocaleString()

    // Split score into individual characters for stagger animation
    const scoreChars = scoreValue.split('')
    const prevScoreRef = useRef(scoreValue)
    const [animatingChars, setAnimatingChars] = useState<Set<number>>(new Set())

    // Trigger animation when score changes
    useEffect(() => {
        if (prevScoreRef.current !== scoreValue) {
            // Animate all characters
            const charsToAnimate = new Set(Array.from({ length: scoreChars.length }, (_, i) => i))
            setAnimatingChars(charsToAnimate)

            // Clear animation after it completes
            const timer = setTimeout(() => {
                setAnimatingChars(new Set())
            }, 600) // Animation duration (0.3s per char, max delay)

            prevScoreRef.current = scoreValue
            return () => clearTimeout(timer)
        }
    }, [scoreValue, scoreChars.length])

    return (
        <>
            {/* Mini Help Button */}
            <button
                type="button"
                onClick={() => setIsHelpOpen(true)}
                className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-blue-500/80 hover:bg-blue-500 text-white font-bold text-lg flex items-center justify-center shadow-lg transition-all hover:scale-110"
                aria-label="Show help"
                title="How to play"
            >
                ?
            </button>

            {/* Left Panel - Glass Effect */}
            <div
                className="flex flex-col gap-[44px] items-center justify-center overflow-clip py-[11px] relative rounded-[24px] flex-1 backdrop-blur-md border border-white/20"
                style={{
                    background: 'linear-gradient(135deg, rgba(80, 168, 235, 0.15) 0%, rgba(80, 168, 235, 0.25) 100%)',
                    boxShadow: '0px 8px 32px 0px rgba(0, 0, 0, 0.37), inset 0px 1px 0px 0px rgba(255, 255, 255, 0.2)',
                    paddingLeft: '40px',
                    paddingRight: '40px',
                }}
            >
                {/* Top Section: Coins and Hearts */}
                <div className="flex items-start justify-between relative shrink-0 w-full">
                    {/* Coins */}
                    <div className="flex gap-[5px] items-start relative shrink-0">
                        <div className="overflow-clip relative shrink-0 size-[45px]">
                            <div className="absolute inset-[8.33%_8.33%_10.1%_8.33%]">
                                <img alt="Coins" className="block max-w-none size-full" src={figmaImages.coinIcon} />
                            </div>
                        </div>
                        <p
                            className="font-['Besley',serif] font-normal leading-[normal] relative shrink-0 text-[24px] text-white"
                            style={{ fontFamily: figmaTypography.besley }}
                        >
                            {totalCoins.toLocaleString()}
                        </p>
                    </div>

                    {/* Hearts - Lives (fixed at 3) */}
                    <div className="flex gap-[10px] items-center justify-center relative shrink-0">
                        <div className="h-[32.35px] relative shrink-0 w-[35px]">
                            <img alt="Hearts" className="block max-w-none size-full" src={figmaImages.heartIcon} />
                        </div>
                        <p
                            className="font-['Besley',serif] font-normal leading-[normal] relative shrink-0 text-[24px] text-white"
                            style={{ fontFamily: figmaTypography.besley }}
                        >
                            3
                        </p>
                    </div>
                </div>

                {/* Middle Section: Avatar/Level Number and Moves */}
                <div className="flex gap-[46px] items-center justify-center relative shrink-0 w-full">
                    {/* Avatar with Level Number */}
                    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid justify-items-start leading-[0] relative shrink-0">
                        <div className="col-[1] ml-0 mt-0 relative row-[1] size-[175.111px]">
                            <div className="absolute inset-[-2.86%]">
                                <img alt="" className="block max-w-none size-full" src={figmaImages.avatarEllipse} />
                            </div>
                        </div>
                        <div className="col-[1] grid-cols-[max-content] grid-rows-[max-content] inline-grid justify-items-start ml-[3.56px] mt-[12.44px] relative row-[1]">
                            <div
                                className="col-[1] ml-[-17.25px] mt-0 relative row-[1] size-[206.948px]"
                                style={{
                                    maskImage: `url('${figmaImages.avatarMask}')`,
                                    WebkitMaskImage: `url('${figmaImages.avatarMask}')`,
                                    maskSize: '163.556px 163.556px',
                                    maskPosition: '17.246px 0px',
                                    maskRepeat: 'no-repeat',
                                }}
                            >
                                <img alt="Avatar" className="block max-w-none size-full" height="206.948" src={figmaImages.avatarImage} width="206.948" />
                            </div>
                        </div>
                    </div>

                    {/* Moves Display */}
                    <div className="flex flex-col items-center relative shrink-0 w-[126px]">
                        <p
                            className={`font-['Besley',serif] font-bold h-[134.82px] leading-[normal] relative shrink-0 text-[#d0eaff] text-[100.8px] w-full whitespace-pre-wrap ${movesLeft <= 10 && movesLeft > 0 ? 'animate-[blink_1s_ease-in-out_infinite]' : ''}`}
                            style={{
                                fontFamily: figmaTypography.besley,
                                textShadow: figmaShadows.textShadow,
                            }}
                        >
                            {movesLeft}
                        </p>
                        <div className="box-border flex gap-[12.6px] items-center justify-center p-[12.6px] relative shrink-0">
                            <p
                                className="font-['Cabin',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#001f37] text-[20.16px]"
                                style={{ fontFamily: figmaTypography.cabin }}
                            >
                                Moves left
                            </p>
                        </div>
                    </div>
                </div>

                {/* Goal Section */}
                <div className="flex flex-col gap-[16px] items-start relative shrink-0">
                    <p
                        className="font-['Cabin',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#001f37] text-[20.16px]"
                        style={{ fontFamily: figmaTypography.cabin }}
                    >
                        Level {levelNumber} Goal:
                    </p>
                    <div
                        className="border-2 border-[#4e97d5] border-solid h-[113px] relative rounded-[8px] shrink-0 w-[380px]"
                        style={{
                            backgroundImage: figmaColors.goalBoxGradient,
                        }}
                    >
                        <div className="h-[113px] overflow-clip relative rounded-[inherit] w-[380px] flex items-center justify-center">
                            <div className="flex items-center justify-center w-full">
                                {scoreChars.map((char, index) => (
                                    <span
                                        key={`${scoreValue}-${index}-${char}`}
                                        className="inline-block font-['Besley',serif] font-bold italic leading-[normal] text-[64px] text-white"
                                        style={{
                                            fontFamily: figmaTypography.besley,
                                            animation: animatingChars.has(index)
                                                ? `scoreStagger 0.3s ease-out ${index * 0.05}s`
                                                : 'none',
                                        }}
                                    >
                                        {char}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="absolute inset-[-2px] pointer-events-none" style={{ boxShadow: figmaShadows.inset }} />
                    </div>
                </div>

                {/* Progress Bar Section */}
                <div className="flex flex-col gap-[16px] items-end relative shrink-0 w-full">
                    <div
                        className="border-[#4e97d5] border-[0.5px] border-solid h-[17px] relative rounded-[24px] shrink-0 w-full"
                        style={{
                            backgroundImage: figmaColors.progressBarGradient,
                        }}
                    >
                        <div className="h-[17px] overflow-clip relative rounded-[inherit] w-full">
                            <div
                                className="absolute bg-[#ffff58] border-[0.5px] border-solid border-white h-[17px] left-0 rounded-[24px] top-0 transition-all duration-500"
                                style={{
                                    width: `${progressPercentage}%`,
                                    boxShadow: '0 0 10px rgba(255, 255, 88, 0.8), 0 0 20px rgba(255, 255, 88, 0.6), 0 0 30px rgba(255, 255, 88, 0.4)',
                                }}
                            >
                                <div className="absolute inset-[-0.5px] pointer-events-none" style={{ boxShadow: figmaShadows.inset }} />
                            </div>
                        </div>
                        <div className="absolute inset-[-0.5px] pointer-events-none" style={{ boxShadow: figmaShadows.inset }} />
                    </div>
                    <p
                        className="font-['Cabin',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#001f37] text-[16px]"
                        style={{ fontFamily: figmaTypography.cabin }}
                    >
                        {goalProgressLabel}
                    </p>
                </div>
            </div>

            <ComboCounter combo={currentCombo} isActive={isResolving && currentCombo > 0} />
            <Help isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        </>
    )
}

