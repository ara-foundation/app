import React, { useEffect, useState } from 'react'
import PageLikePanel from '@/components/panel/PageLikePanel'
import Link from '@/components/custom-ui/Link'
import Button from '@/components/custom-ui/Button'
import { getIcon } from '@/components/icon'
import NumberFlow from '@number-flow/react'
import { ROADMAP_EVENT_TYPES, type VersionReleasedEventDetail } from '@/types/roadmap'
import { solarForgeByVersion } from '@/client-side/all-stars'
import type { SolarForgeByVersionResult, SolarUser } from '@/types/all-stars'
import { getStarById } from '@/client-side/star'
import type { User } from '@/types/star'
import MenuAvatar from '@/components/MenuAvatar'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'

const VersionSolarForge: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false)
    const [versionTag, setVersionTag] = useState<string>('')
    const [galaxyId, setGalaxyId] = useState<string>('')
    const [result, setResult] = useState<SolarForgeByVersionResult | null>(null)
    const [users, setUsers] = useState<Array<User & { earnedStars: number; roles: string[] }>>([])
    const [currentStep, setCurrentStep] = useState<'loading' | 'summary' | 'users' | 'topUser' | 'complete'>('loading')
    const [visibleUserIndex, setVisibleUserIndex] = useState<number>(-1)
    const timeoutRefsRef = React.useRef<NodeJS.Timeout[]>([])

    // Listen for VERSION_RELEASED event
    useEffect(() => {
        const handleVersionReleased = async (event: Event) => {
            const customEvent = event as CustomEvent<VersionReleasedEventDetail>
            const { versionId, tag, galaxyId: eventGalaxyId } = customEvent.detail

            // Clear any existing timeouts
            timeoutRefsRef.current.forEach(timeout => clearTimeout(timeout))
            timeoutRefsRef.current = []

            // Reset all state first
            setResult(null)
            setUsers([])
            setVisibleUserIndex(-1)
            setHasTriggeredConfetti(false)
            setCurrentStep('loading')

            // Set new state
            setVersionTag(tag)
            setGalaxyId(eventGalaxyId)
            setIsOpen(true)

            try {
                // Call solarForgeByVersion
                const forgeResult = await solarForgeByVersion(versionId)
                setResult(forgeResult)

                // Fetch user data for each solar user
                const userPromises = forgeResult.users.map(async (solarUser: SolarUser) => {
                    const user = await getStarById(solarUser.id)
                    return user ? { ...user, earnedStars: solarUser.stars, roles: solarUser.roles } : null
                })

                const fetchedUsers = (await Promise.all(userPromises)).filter(
                    (u): u is User & { earnedStars: number; roles: string[] } => u !== null
                )

                setUsers(fetchedUsers)

                // Start animation sequence
                const timeout1 = setTimeout(() => {
                    setCurrentStep('users')
                    setVisibleUserIndex(0)
                }, 2000)
                timeoutRefsRef.current.push(timeout1)

                // Show users one by one
                fetchedUsers.forEach((_, index) => {
                    const timeout2 = setTimeout(() => {
                        setVisibleUserIndex(index)
                        if (index === fetchedUsers.length - 1) {
                            const timeout3 = setTimeout(() => {
                                setCurrentStep('topUser')
                                const timeout4 = setTimeout(() => {
                                    setCurrentStep('complete')
                                }, 2000)
                                timeoutRefsRef.current.push(timeout4)
                            }, 1000)
                            timeoutRefsRef.current.push(timeout3)
                        }
                    }, 1000 * (index + 1))
                    timeoutRefsRef.current.push(timeout2)
                })

                // Set summary step immediately
                setCurrentStep('summary')
            } catch (error) {
                console.error('Error in solar forge:', error)
                setIsOpen(false)
            }
        }

        window.addEventListener(ROADMAP_EVENT_TYPES.VERSION_RELEASED, handleVersionReleased as EventListener)

        return () => {
            window.removeEventListener(ROADMAP_EVENT_TYPES.VERSION_RELEASED, handleVersionReleased as EventListener)
            // Clear all timeouts on unmount
            timeoutRefsRef.current.forEach(timeout => clearTimeout(timeout))
            timeoutRefsRef.current = []
        }
    }, [])

    // Trigger confetti when dialog opens
    useEffect(() => {
        if (isOpen && !hasTriggeredConfetti) {
            setHasTriggeredConfetti(true)
            const duration = 3000
            const animationEnd = Date.now() + duration
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

            function randomInRange(min: number, max: number) {
                return Math.random() * (max - min) + min
            }

            const interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now()

                if (timeLeft <= 0) {
                    clearInterval(interval)
                    return
                }

                const particleCount = 50 * (timeLeft / duration)
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                })
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                })
            }, 250)
        }
    }, [isOpen, hasTriggeredConfetti])

    if (!isOpen) return null

    const topUser = users.length > 0 ? users[0] : null
    const linkUri = `/project?galaxy=${galaxyId}`

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm z-[100]"
                onClick={() => {
                    if (currentStep === 'complete') {
                        setIsOpen(false)
                    }
                }}
            />

            {/* Dialog */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] flex items-center justify-center w-full max-w-2xl px-4">
                <PageLikePanel title="Version Released!" titleCenter={true}>
                    <div className="space-y-6">
                        {/* Step 1: Summary - Resolved issues */}
                        {result && currentStep !== 'loading' && (
                            <div className="text-center space-y-4">
                                <div className="text-xl font-bold text-slate-700 dark:text-slate-300">
                                    Resolved{' '}
                                    <NumberFlow
                                        value={result.totalIssues}
                                        locales="en-US"
                                        format={{ useGrouping: false }}
                                        className="inline-block"
                                    />{' '}
                                    issues
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 mt-6">
                                    <div className="flex flex-col items-center">
                                        <div className="text-sm text-slate-500 dark:text-slate-400">Users</div>
                                        <NumberFlow
                                            value={users.length}
                                            locales="en-US"
                                            format={{ useGrouping: false }}
                                            className="text-xl font-semibold text-slate-700 dark:text-slate-300"
                                        />
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                            {getIcon({ iconType: 'sunshine', className: 'w-4 h-4' })}
                                            Sunshines
                                        </div>
                                        <NumberFlow
                                            value={result.totalSunshines}
                                            locales="en-US"
                                            format={{ useGrouping: true }}
                                            className="text-xl font-semibold text-amber-600 dark:text-amber-400"
                                        />
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                            {getIcon({ iconType: 'star', className: 'w-4 h-4' })}
                                            Stars
                                        </div>
                                        <NumberFlow
                                            value={result.totalStars}
                                            locales="en-US"
                                            format={{
                                                useGrouping: false,
                                                minimumFractionDigits: 1,
                                                maximumFractionDigits: 6,
                                            }}
                                            className="text-xl font-semibold text-yellow-600 dark:text-yellow-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Show users one by one */}
                        {result && users.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 text-center">
                                    Stars Distributed
                                </h3>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {users.map((user, index) => (
                                        <div
                                            key={user._id}
                                            className={cn(
                                                'flex items-center justify-between p-3 rounded-lg border transition-all duration-500',
                                                index <= visibleUserIndex
                                                    ? 'opacity-100 translate-x-0 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50'
                                                    : 'opacity-0 -translate-x-4 pointer-events-none'
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <MenuAvatar user={user} />
                                                <div>
                                                    <div className="font-medium text-slate-800 dark:text-slate-200">
                                                        {user.nickname || user.email?.split('@')[0] || 'Unknown'}
                                                    </div>
                                                    <div className="flex gap-1 mt-1">
                                                        {user.roles.map((role, roleIndex) => (
                                                            <span
                                                                key={roleIndex}
                                                                className={cn(
                                                                    'text-xs px-2 py-0.5 rounded',
                                                                    role === 'author' && 'bg-blue-500 text-white',
                                                                    role === 'contributor' && 'bg-purple-500 text-white',
                                                                    role === 'maintainer' && 'bg-green-500 text-white'
                                                                )}
                                                            >
                                                                {role}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getIcon({ iconType: 'star', className: 'w-5 h-5 text-yellow-500 dark:text-yellow-400' })}
                                                <NumberFlow
                                                    value={user.earnedStars}
                                                    locales="en-US"
                                                    format={{
                                                        useGrouping: false,
                                                        minimumFractionDigits: 1,
                                                        maximumFractionDigits: 6,
                                                    }}
                                                    className="text-lg font-semibold text-yellow-600 dark:text-yellow-400"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Highlight top user */}
                        {result && topUser && (
                            <div className="text-center space-y-4">
                                <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                                    Top Receiver
                                </div>
                                <div className="flex flex-col items-center p-6 rounded-lg border-2 border-yellow-400 dark:border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/20">
                                    <MenuAvatar user={topUser} />
                                    <div className="mt-4 font-bold text-xl text-slate-800 dark:text-slate-200">
                                        {topUser.nickname || topUser.email?.split('@')[0] || 'Unknown'}
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        {topUser.roles.map((role, index) => (
                                            <span
                                                key={index}
                                                className={cn(
                                                    'text-sm px-3 py-1 rounded font-semibold',
                                                    role === 'author' && 'bg-blue-500 text-white',
                                                    role === 'contributor' && 'bg-purple-500 text-white',
                                                    role === 'maintainer' && 'bg-green-500 text-white'
                                                )}
                                            >
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 mt-4">
                                        {getIcon({ iconType: 'star', className: 'w-6 h-6 text-yellow-500 dark:text-yellow-400' })}
                                        <NumberFlow
                                            value={topUser.earnedStars}
                                            locales="en-US"
                                            format={{
                                                useGrouping: false,
                                                minimumFractionDigits: 1,
                                                maximumFractionDigits: 6,
                                            }}
                                            className="text-2xl font-bold text-yellow-600 dark:text-yellow-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Action button */}
                        {result && currentStep === 'complete' && (
                            <div className="flex justify-center">
                                <Link uri={linkUri}>
                                    <Button variant="primary" size="lg">
                                        Put star in Galaxy
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Loading state */}
                        {(!result || currentStep === 'loading') && (
                            <div className="text-center py-8">
                                <div className="text-lg text-slate-600 dark:text-slate-400">
                                    {!result ? 'Processing solar forge...' : 'Loading results...'}
                                </div>
                                {versionTag && (
                                    <div className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                                        Version: {versionTag}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </PageLikePanel>
            </div>
        </>
    )
}

export default VersionSolarForge

