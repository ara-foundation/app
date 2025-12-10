import React, { useState, useEffect, useRef } from 'react';
import BlurText from '@/components/BlurText';
import { getIcon } from '@/components/icon';
import NumberFlow from '@number-flow/react';
import Tooltip from '@/components/custom-ui/Tooltip';
import { actions } from 'astro:actions';
import { type AllStarStats } from '@/types/all-stars';

/**
 * Custom hook to fetch and poll all star stats every 10 seconds
 */
function useAllStarStats(): AllStarStats {
    const [stats, setStats] = useState<AllStarStats>({
        totalGalaxies: 0,
        totalStars: 0,
        totalUsers: 0,
        totalSunshines: 0,
    });
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Initial fetch
        const fetchStats = async () => {
            try {
                const formData = new FormData();
                const result = await actions.allStarStats(formData);

                if (result.error) {
                    console.error('Error fetching all star stats:', result.error);
                    return;
                }

                if (result.data) {
                    setStats((prevStats) => {
                        // Deep comparison to check if stats changed
                        const hasChanged =
                            prevStats.totalGalaxies !== result.data.totalGalaxies ||
                            prevStats.totalStars !== result.data.totalStars ||
                            prevStats.totalUsers !== result.data.totalUsers ||
                            prevStats.totalSunshines !== result.data.totalSunshines;

                        if (hasChanged) {
                            return result.data;
                        }
                        return prevStats;
                    });
                }
            } catch (error) {
                console.error('Error fetching all star stats:', error);
            }
        };

        // Fetch immediately
        fetchStats();

        // Set up polling every 10 seconds
        intervalRef.current = setInterval(fetchStats, 10000);

        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return stats;
}

const UniverseHero: React.FC = () => {
    const stats = useAllStarStats();
    const { totalGalaxies, totalStars, totalUsers, totalSunshines = 0 } = stats;

    // Calculate funds amount from sunshines
    const fundsAmount = totalSunshines / 1.80;
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 px-4">
            {/* Ara Title with Blur Text Animation */}
            <div className="w-full max-w-4xl relative">
                {getIcon({ iconType: 'ara', className: 'w-26 h-26 text-blue-500 absolute top-0 left-1/2 -translate-x-48' })}
                <BlurText
                    text="Ara"
                    className="text-6xl md:text-7xl lg:text-8xl font-bold text-slate-800 dark:text-slate-200 justify-center "
                    animateBy="words"
                    direction="top"
                    delay={100}
                />
            </div>

            {/* Universe Stats */}
            <div className="flex items-center justify-center gap-8 flex-wrap">
                <Tooltip content="open-source projects total amount">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-slate-900/10 backdrop-blur-sm border border-slate-200/20 dark:border-slate-700/20 cursor-help">
                        {getIcon({ iconType: 'project', className: 'w-5 h-5 text-blue-500' })}
                        <div className="flex flex-col items-start">
                            <span className="text-xs text-slate-600 dark:text-slate-400">Galaxies</span>
                            <NumberFlow
                                value={totalGalaxies}
                                locales="en-US"
                                format={{ style: 'decimal', maximumFractionDigits: 0 }}
                                className="text-lg font-semibold text-slate-800 dark:text-slate-200"
                            />
                        </div>
                    </div>
                </Tooltip>

                <Tooltip content="collaboration rewards">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-slate-900/10 backdrop-blur-sm border border-slate-200/20 dark:border-slate-700/20 cursor-help">
                        {getIcon({ iconType: 'star', className: 'w-5 h-5 text-yellow-500' })}
                        <div className="flex flex-col items-start">
                            <span className="text-xs text-slate-600 dark:text-slate-400">Stars</span>
                            <NumberFlow
                                value={totalStars}
                                locales="en-US"
                                format={{ style: 'decimal', maximumFractionDigits: 2 }}
                                className="text-lg font-semibold text-slate-800 dark:text-slate-200"
                            />
                        </div>
                    </div>
                </Tooltip>

                <Tooltip content="demo users (who created 3 demo)">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-slate-900/10 backdrop-blur-sm border border-slate-200/20 dark:border-slate-700/20 cursor-help">
                        {getIcon({ iconType: 'user', className: 'w-5 h-5 text-blue-500' })}
                        <div className="flex flex-col items-start">
                            <span className="text-xs text-slate-600 dark:text-slate-400">Users</span>
                            <NumberFlow
                                value={totalUsers}
                                locales="en-US"
                                format={{ style: 'decimal', maximumFractionDigits: 0 }}
                                className="text-lg font-semibold text-slate-800 dark:text-slate-200"
                            />
                        </div>
                    </div>
                </Tooltip>

                <Tooltip
                    content={
                        <div className="text-sm">
                            Total amount of funds (about{' '}
                            <NumberFlow
                                value={fundsAmount}
                                locales="en-US"
                                format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 2 }}
                                className="inline font-semibold"
                            />
                            )
                        </div>
                    }
                >
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-slate-900/10 backdrop-blur-sm border border-slate-200/20 dark:border-slate-700/20 cursor-help">
                        {getIcon({ iconType: 'sunshine', className: 'w-5 h-5 text-yellow-400' })}
                        <div className="flex flex-col items-start">
                            <span className="text-xs text-slate-600 dark:text-slate-400">Sunshines</span>
                            <NumberFlow
                                value={totalSunshines}
                                locales="en-US"
                                format={{ style: 'decimal', maximumFractionDigits: 0 }}
                                className="text-lg font-semibold text-slate-800 dark:text-slate-200"
                            />
                        </div>
                    </div>
                </Tooltip>
            </div>

            <div className="w-full max-w-4xl">
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                    This is the All Stars. <br />
                    The galactic universe of the open-source projects.<br />
                    Donate, collaborate, and become the owner of the project.
                </p>
            </div>
        </div>
    );
};

export default UniverseHero;

