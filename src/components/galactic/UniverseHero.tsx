import React from 'react';
import BlurText from '@/components/BlurText';
import { getIcon } from '@/components/icon';
import NumberFlow from '@number-flow/react';

interface UniverseHeroProps {
    totalGalaxies: number;
    totalStars: number;
    totalUsers: number;
}

const UniverseHero: React.FC<UniverseHeroProps> = ({
    totalGalaxies,
    totalStars,
    totalUsers,
}) => {
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
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-slate-900/10 backdrop-blur-sm border border-slate-200/20 dark:border-slate-700/20">
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

                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-slate-900/10 backdrop-blur-sm border border-slate-200/20 dark:border-slate-700/20">
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

                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-slate-900/10 backdrop-blur-sm border border-slate-200/20 dark:border-slate-700/20">
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

