import React, { useEffect, useRef } from 'react';
import { getIcon } from '@/components/icon';
import NumberFlow from '@number-flow/react';
import Tooltip from '@/components/custom-ui/Tooltip';
import Link from '@/components/custom-ui/Link';
import { GalaxyModel } from '@/scripts/galaxy';

interface GalaxyViewProps {
    galaxy: GalaxyModel;
}

const GalaxyView: React.FC<GalaxyViewProps> = ({ galaxy }) => {
    const spiralRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Create animated spiral effect
        if (spiralRef.current) {
            const spiral = spiralRef.current;
            const stars = spiral.querySelectorAll('.spiral-star');
            
            stars.forEach((star, index) => {
                const angle = (index * 30) * (Math.PI / 180);
                const radius = 80 + (index * 15);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                const starEl = star as HTMLElement;
                starEl.style.left = `calc(50% + ${x}px)`;
                starEl.style.top = `calc(50% + ${y}px)`;
                starEl.style.animationDelay = `${index * 0.1}s`;
            });
        }
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 px-4">
            {/* Animated Spiral Container */}
            <div 
                ref={spiralRef}
                className="relative w-96 h-96 flex items-center justify-center"
            >
                {/* Spiral Stars Animation */}
                <div className="absolute inset-0">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="spiral-star absolute w-2 h-2 bg-yellow-400 rounded-full opacity-70"
                            style={{
                                transform: 'translate(-50%, -50%)',
                                transformOrigin: 'center',
                            }}
                        />
                    ))}
                </div>

                {/* Center Content */}
                <div className="relative z-10 flex flex-col items-center space-y-4">
                    <Tooltip content={galaxy.description}>
                        <Link 
                            uri={`/project?galaxy=${galaxy.id}`}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 dark:text-slate-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                        >
                            {galaxy.name}
                        </Link>
                    </Tooltip>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-6 flex-wrap mt-4">
                        <div className="flex items-center gap-2">
                            {getIcon({ iconType: 'star', className: 'w-5 h-5 text-yellow-500' })}
                            <div className="flex flex-col items-start">
                                <span className="text-xs text-slate-600 dark:text-slate-400">Stars</span>
                                <NumberFlow
                                    value={galaxy.stars}
                                    locales="en-US"
                                    format={{ style: 'decimal', maximumFractionDigits: 2 }}
                                    className="text-lg font-semibold text-slate-800 dark:text-slate-200"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {getIcon({ iconType: 'sunshine', className: 'w-5 h-5 text-orange-500' })}
                            <div className="flex flex-col items-start">
                                <span className="text-xs text-slate-600 dark:text-slate-400">Sunshines</span>
                                <NumberFlow
                                    value={galaxy.sunshines}
                                    locales="en-US"
                                    format={{ style: 'decimal', maximumFractionDigits: 0 }}
                                    className="text-lg font-semibold text-slate-800 dark:text-slate-200"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {getIcon({ iconType: 'user', className: 'w-5 h-5 text-blue-500' })}
                            <div className="flex flex-col items-start">
                                <span className="text-xs text-slate-600 dark:text-slate-400">Users</span>
                                <NumberFlow
                                    value={galaxy.users}
                                    locales="en-US"
                                    format={{ style: 'decimal', maximumFractionDigits: 0 }}
                                    className="text-lg font-semibold text-slate-800 dark:text-slate-200"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes spiral-rotate {
                        from {
                            transform: translate(-50%, -50%) rotate(0deg);
                        }
                        to {
                            transform: translate(-50%, -50%) rotate(360deg);
                        }
                    }
                    @keyframes star-pulse {
                        0%, 100% {
                            opacity: 0.5;
                            transform: translate(-50%, -50%) scale(1);
                        }
                        50% {
                            opacity: 1;
                            transform: translate(-50%, -50%) scale(1.5);
                        }
                    }
                    .spiral-star {
                        animation: spiral-rotate 20s linear infinite, star-pulse 2s ease-in-out infinite;
                    }
                `
            }} />
        </div>
    );
};

export default GalaxyView;

