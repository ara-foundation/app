import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import InfoPanel from '@/components/panel/InfoPanel';
import { getIcon } from '@/components/icon';
import { cn } from '@/lib/utils';

interface LandingVideoPanelProps {
    youtubeUrl?: string;
}

/**
 * Extracts YouTube video ID from various URL formats
 * Supports:
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - VIDEO_ID (direct ID)
 */
const extractYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;

    // If it's already just an ID (no slashes or special chars), return it
    if (!url.includes('/') && !url.includes('?') && !url.includes('&')) {
        return url;
    }

    // Match youtu.be format
    const youtuBeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (youtuBeMatch) {
        return youtuBeMatch[1];
    }

    // Match youtube.com/watch?v= format
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch) {
        return watchMatch[1];
    }

    return null;
};

const LandingVideoPanel: React.FC<LandingVideoPanelProps> = ({
    youtubeUrl = 'https://youtu.be/suOaUQmMSGo?si=cbKjF74oBUmCbKQF',
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const videoId = useMemo(() => {
        return extractYouTubeVideoId(youtubeUrl);
    }, [youtubeUrl]);

    const embedUrl = useMemo(() => {
        if (!videoId) return null;
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&playsinline=1`;
    }, [videoId]);

    if (!videoId || !embedUrl) {
        return null;
    }

    return (
        <motion.div
            data-landing-video-panel
            className={cn(
                'absolute top-[20vh] right-8 z-40',
                'w-full max-w-sm',
                'hidden md:block' // Hide on mobile
            )}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <InfoPanel
                className={cn(
                    'backdrop-blur-md bg-white/30 dark:bg-slate-900/30',
                    'border border-slate-200/40 dark:border-slate-700/40',
                    'rounded-3xl p-6',
                    'transition-all duration-300',
                    'hover:bg-white/40 dark:hover:bg-slate-900/40',
                    'hover:border-slate-300/60 dark:hover:border-slate-600/60',
                    'hover:shadow-2xl hover:shadow-blue-500/30',
                    'shadow-lg shadow-blue-500/10',
                    // Pulse animation when hovered
                    isHovered && 'animate-pulse-subtle'
                )}
            >
                <div className="flex flex-col space-y-4">
                    {/* Introduction Text */}
                    <div className="text-center space-y-2">
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                            First, check out our{' '}
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                2-minute walkthrough
                            </span>
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            Watch the demo video below to see Ara in action
                        </p>
                    </div>

                    {/* Video Container with Glow Effect */}
                    <motion.div
                        className={cn(
                            'relative rounded-xl overflow-hidden',
                            'bg-slate-900/50 dark:bg-slate-800/50',
                            'border border-slate-300/20 dark:border-slate-600/20',
                            'transition-all duration-300',
                            isHovered
                                ? 'shadow-[0_0_20px_rgba(59,130,246,0.4),0_0_40px_rgba(168,85,247,0.2)]'
                                : 'shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                        )}
                    >
                        {/* Glow overlay on hover */}
                        {isHovered && (
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 pointer-events-none rounded-xl"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            />
                        )}

                        {/* YouTube iframe */}
                        <div className="relative aspect-video w-full">
                            <iframe
                                src={embedUrl}
                                title="Ara Demo Video"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full rounded-xl"
                                style={{ border: 'none' }}
                            />
                        </div>
                    </motion.div>

                    {/* Call to Action Text */}
                    <div className="text-center space-y-2 pt-2">
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                            Ready to try it out?
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            Visit the Demo Page to explore Ara yourself
                        </p>
                    </div>

                    {/* Visit Demo Page Button */}
                    <motion.a
                        href="/all-stars"
                        className={cn(
                            'w-full flex items-center justify-center gap-2',
                            'px-6 py-3 rounded-lg font-semibold',
                            'bg-gradient-to-r from-blue-600 to-indigo-600',
                            'dark:from-blue-500 dark:to-indigo-500',
                            'text-white',
                            'hover:from-blue-700 hover:to-indigo-700',
                            'dark:hover:from-blue-600 dark:hover:to-indigo-600',
                            'transition-all duration-300',
                            'shadow-lg shadow-blue-500/30',
                            'hover:shadow-xl hover:shadow-blue-500/50',
                            'border border-blue-400/30 dark:border-blue-300/30',
                            'relative overflow-hidden',
                            // Shimmer effect
                            'before:absolute before:inset-0 before:-translate-x-full',
                            'before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
                            'hover:before:translate-x-full before:transition-transform before:duration-700'
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <motion.span
                            className="relative z-10 flex items-center gap-2"
                            animate={isHovered ? { x: [0, 2, 0] } : {}}
                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                        >
                            {getIcon({ iconType: 'star', className: 'w-5 h-5' })}
                            <span>Visit Demo Page</span>
                            <motion.span
                                animate={isHovered ? { x: [0, 4, 0] } : {}}
                                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                            >
                                →
                            </motion.span>
                        </motion.span>
                    </motion.a>
                </div>
            </InfoPanel>
        </motion.div>
    );
};

export default LandingVideoPanel;

