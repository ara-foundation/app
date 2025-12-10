import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import * as RadixSlider from '@radix-ui/react-slider';
import { getIcon } from '@/components/icon';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import NumberFlow from '@number-flow/react';
import { UserStar as UserStarData, SPACE_EVENT_TYPES } from '@/types/all-stars';
import DraggableUserStar from '@/components/all-stars/DraggableUserStar';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { getDemo, incrementDemoStep } from '@/client-side/demo';

interface PlaceCtaPanelProps {
    userData: UserStarData | null;
}

const PlaceCtaPanel: React.FC<PlaceCtaPanelProps> = ({ userData }) => {
    const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
    const [isStarPlaced, setIsStarPlaced] = useState(!!(userData?.x !== undefined && userData?.y !== undefined));
    const [countdown, setCountdown] = useState(3);
    const [isVisible, setIsVisible] = useState(true);
    const [showCountdown, setShowCountdown] = useState(false);

    const triggerConfetti = () => {
        if (hasTriggeredConfetti) return; // Prevent multiple triggers

        setHasTriggeredConfetti(true);
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                clearInterval(interval);
                setHasTriggeredConfetti(false); // Allow triggering again after animation ends
                return;
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    };

    useEffect(() => {
        if (!userData || !userData.userId) return;
        const handleMoved = async (event: Event) => {
            const detail = (event as CustomEvent).detail as { userId?: string };
            if (detail?.userId === userData.userId) {
                const demo = getDemo();
                if (demo.email) {
                    await incrementDemoStep({ email: demo.email, expectedStep: 8 });
                }
                setIsStarPlaced(true);
                setShowCountdown(true);
                triggerConfetti();
            }
        };

        window.addEventListener(SPACE_EVENT_TYPES.USER_STAR_MOVED, handleMoved);
        return () => window.removeEventListener(SPACE_EVENT_TYPES.USER_STAR_MOVED, handleMoved);
    }, [userData]);

    // Countdown effect
    useEffect(() => {
        if (!showCountdown) return;

        const interval = setInterval(() => {
            setCountdown((prev) => {
                const newValue = prev - 0.1;
                if (newValue <= 0) {
                    clearInterval(interval);
                    // Hide after fade animation completes
                    setTimeout(() => setIsVisible(false), 300);
                    return 0;
                }
                return newValue;
            });
        }, 100); // Update every 100ms for smooth animation

        return () => clearInterval(interval);
    }, [showCountdown]);

    if (!userData) {
        return (
            <div className="mt-12 text-center text-slate-700 dark:text-slate-200">
                You didn't obtain any stars yet - consider collaborating on this project first.
            </div>
        );
    }

    if (userData.x !== undefined && userData.y !== undefined) {
        return null;
    }

    if (!isVisible) return null;

    return (
        <motion.div
            className={cn(
                "relative w-full max-w-2xl mx-auto mt-12",
                "backdrop-blur-md bg-white/20 dark:bg-slate-900/20",
                "border border-slate-200/30 dark:border-slate-700/30",
                "rounded-lg p-8",
                "overflow-hidden"
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
                opacity: showCountdown ? 1 - (3 - countdown) / 3 : 1,
                scale: 1
            }}
            transition={{ duration: 0.3 }}
        >
            {/* Twinkling stars around the panel */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-twinkle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${1 + Math.random() * 2}s`,
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-6">
                {!isStarPlaced ? (
                    <>
                        {/* Title */}
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 text-center">
                            Add your star on the page! ✨
                        </h3>

                        {/* Large animated star with number */}
                        <div className="flex items-center justify-center gap-2">
                            <DndProvider backend={HTML5Backend}>
                                <DraggableUserStar
                                    userData={userData}
                                />
                            </DndProvider>
                            <NumberFlow
                                value={userData.stars!}
                                locales="en-US"
                                className="text-4xl font-bold text-slate-500 dark:text-yellow-500/70 -mt-2"
                                format={{ style: 'decimal', maximumFractionDigits: 6, minimumFractionDigits: 2 }}
                            />
                        </div>

                        {/* Message */}
                        <p className="text-lg text-center text-slate-700 dark:text-slate-300 mt-4">
                            <span className="text-base">Drag and drop your star to the page.</span>
                        </p>
                    </>
                ) : (
                    <>
                        {/* Success Message */}
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 text-center">
                            You placed your star, congratulations. Share the project.
                        </h3>
                        <div className="flex items-center justify-center mb-4">
                            {getIcon({ iconType: 'star', className: 'w-16 h-16 text-yellow-500 dark:text-yellow-500/90', fill: 'currentColor' })}
                        </div>

                        {/* Countdown Slider */}
                        {showCountdown && (
                            <div className="w-full space-y-2">
                                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                                    <span>Closing in...</span>
                                    <span className="font-semibold">{Math.ceil(countdown)}s</span>
                                </div>
                                <RadixSlider.Root
                                    value={[countdown]}
                                    max={3}
                                    min={0}
                                    step={0.1}
                                    disabled
                                    className="relative flex h-5 w-full touch-none select-none items-center"
                                >
                                    <RadixSlider.Track className="relative h-2 grow rounded-full bg-slate-200 dark:bg-slate-700">
                                        <RadixSlider.Range className="absolute h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-100" />
                                    </RadixSlider.Track>
                                    <RadixSlider.Thumb className="relative block h-5 w-5 rounded-full bg-yellow-400 dark:bg-yellow-500 shadow-md ring-2 ring-yellow-300 dark:ring-yellow-600 transition-all" />
                                </RadixSlider.Root>
                            </div>
                        )}
                    </>
                )}

            </div>

            {/* Twinkle animation styles */}
            <style>{`
        @keyframes twinkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
      `}</style>
        </motion.div>
    );
};

export default PlaceCtaPanel;

