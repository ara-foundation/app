import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ControlPanel from '@/components/panel/ControlPanel';
import ElectricBorder from '@/components/ElectricBorder';
import { getIcon } from '@/components/icon';
import { cn } from '@/lib/utils';

interface LandingVideoMiniPanelProps {
    youtubeUrl?: string;
}

/**
 * Extracts YouTube video ID from various URL formats
 */
const extractYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;

    if (!url.includes('/') && !url.includes('?') && !url.includes('&')) {
        return url;
    }

    const youtuBeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (youtuBeMatch) {
        return youtuBeMatch[1];
    }

    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch) {
        return watchMatch[1];
    }

    return null;
};

const LandingVideoMiniPanel: React.FC<LandingVideoMiniPanelProps> = ({
    youtubeUrl = 'https://youtu.be/suOaUQmMSGo?si=cbKjF74oBUmCbKQF',
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isAtWhyAraOrBelow, setIsAtWhyAraOrBelow] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const videoId = useMemo(() => {
        return extractYouTubeVideoId(youtubeUrl);
    }, [youtubeUrl]);

    const embedUrl = useMemo(() => {
        if (!videoId) return null;
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&playsinline=1`;
    }, [videoId]);

    // Detect if we're at or past "Why Ara" section (for desktop)
    useEffect(() => {
        const checkDesktop = () => {
            setIsDesktop(window.innerWidth >= 768);
        };
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    useEffect(() => {
        // Only check on desktop
        if (typeof window === 'undefined' || !isDesktop) {
            setIsAtWhyAraOrBelow(false);
            return;
        }

        const checkInitialState = () => {
            const whyAraSection = document.querySelector('#why-ara-section');
            if (whyAraSection) {
                const rect = whyAraSection.getBoundingClientRect();
                setIsAtWhyAraOrBelow(rect.top <= window.innerHeight);
            }
        };

        const setupObserver = () => {
            const whyAraSection = document.querySelector('#why-ara-section');
            if (!whyAraSection) {
                setIsAtWhyAraOrBelow(false);
                return;
            }

            // Disconnect existing observer
            if (observerRef.current) {
                observerRef.current.disconnect();
            }

            // Create new observer
            observerRef.current = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        // If "Why Ara" section is at or above the viewport top, we're at or past it
                        setIsAtWhyAraOrBelow(entry.boundingClientRect.top <= window.innerHeight);
                    });
                },
                {
                    threshold: 0,
                    rootMargin: '0px',
                }
            );

            observerRef.current.observe(whyAraSection);
        };

        // Check initial state
        checkInitialState();

        // Setup observer
        setupObserver();

        // Retry after a short delay in case DOM isn't ready
        const timeoutId = setTimeout(() => {
            checkInitialState();
            setupObserver();
        }, 200);

        // Also check on scroll as a fallback
        const handleScroll = () => {
            const whyAraSection = document.querySelector('#why-ara-section');
            if (whyAraSection) {
                const rect = whyAraSection.getBoundingClientRect();
                setIsAtWhyAraOrBelow(rect.top <= window.innerHeight);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            clearTimeout(timeoutId);
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isDesktop]);

    if (!videoId || !embedUrl) {
        return null;
    }

    // On desktop: show when at "Why Ara" or below
    // On mobile: always show
    const shouldShow = isDesktop ? isAtWhyAraOrBelow : true;

    if (!shouldShow) {
        return null;
    }

    return (
        <div
            className="fixed bottom-22 right-8 z-50"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <AnimatePresence>
                {!isExpanded ? (
                    <motion.div
                        key="collapsed"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                    >
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="w-full"
                            type="button"
                        >
                            <ElectricBorder
                                color="#ef4444"
                                speed={1.5}
                                chaos={0.8}
                                thickness={2}
                                style={{ borderRadius: 4 }}
                                className="w-full"
                            >
                                <ControlPanel
                                    className={cn(
                                        'p-3 cursor-pointer transition-all duration-300',
                                        'hover:!backdrop-blur-lg',
                                        isHovered && 'bg-white/20 dark:bg-slate-900/20'
                                    )}
                                >
                                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                                        {getIcon({ iconType: 'youtube', className: 'w-4 h-4' })}
                                        <span className="text-xs font-mono">Demo</span>
                                    </div>
                                </ControlPanel>
                            </ElectricBorder>
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="expanded"
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="w-64"
                    >
                        <ControlPanel className="p-3 space-y-3">
                            {/* Title with YouTube icon */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                                    {getIcon({ iconType: 'youtube', className: 'w-4 h-4' })}
                                    <span className="text-xs font-mono">See quick walk through</span>
                                </div>
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                    aria-label="Close"
                                    type="button"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Video */}
                            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-900/50">
                                <iframe
                                    src={embedUrl}
                                    title="Ara Demo Video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    className="absolute inset-0 w-full h-full"
                                    style={{ border: 'none' }}
                                />
                            </div>

                            {/* Text and CTA */}
                            <div className="space-y-3">
                                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                    Try out demo yourself
                                </p>
                                <a
                                    href="/all-stars"
                                    className={cn(
                                        'block w-full',
                                        'px-4 py-3 rounded-lg font-semibold text-sm',
                                        'bg-gradient-to-r from-blue-600 to-indigo-600',
                                        'dark:from-blue-500 dark:to-indigo-500',
                                        'text-white',
                                        'hover:from-blue-700 hover:to-indigo-700',
                                        'dark:hover:from-blue-600 dark:hover:to-indigo-600',
                                        'transition-all duration-300',
                                        'shadow-lg shadow-blue-500/30',
                                        'hover:shadow-xl hover:shadow-blue-500/50',
                                        'border border-blue-400/30 dark:border-blue-300/30',
                                        'flex items-center justify-center gap-2',
                                        'relative overflow-hidden',
                                        // Shimmer effect
                                        'before:absolute before:inset-0 before:-translate-x-full',
                                        'before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
                                        'hover:before:translate-x-full before:transition-transform before:duration-700'
                                    )}
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        {getIcon({ iconType: 'star', className: 'w-4 h-4' })}
                                        <span>Try Demo Now</span>
                                        <span>→</span>
                                    </span>
                                </a>
                            </div>
                        </ControlPanel>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LandingVideoMiniPanel;

