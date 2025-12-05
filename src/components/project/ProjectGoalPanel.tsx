import React from 'react';
import { getIcon } from '@/components/icon';
import NumberFlow from '@number-flow/react';
import { UserStarData } from '@/components/cosmos/Space';
import { cn } from '@/lib/utils';
import Tooltip from '@/components/custom-ui/Tooltip';
import GoalChart from './GoalChart';
import InfoPanel from '../panel/InfoPanel';

interface ProjectGoalPanelProps {
    stars?: UserStarData[]; // For user count
    totalStars?: number; // Total stars count
    totalSunshines?: number; // Total sunshines
    goalStars?: number; // Stars needed for community control
    goalDonations?: number; // Donations needed (in parentheses)
    projectName?: string; // Project name
    projectGoal?: number; // Total stars needed to turn project into galaxy
}

const ProjectGoalPanel: React.FC<ProjectGoalPanelProps> = ({
    stars = [],
    totalStars,
    totalSunshines,
    goalStars = 100,
    goalDonations,
    projectName,
    projectGoal,
}) => {
    // Calculate energy percentage (same logic as ProjectLandingHero)
    const sunshinesToStar = 360;
    const sunshinesValue = totalSunshines || 0;
    const starsValue = totalStars || 0;
    const shinesInStars = starsValue * sunshinesToStar;
    const energyPercentage = sunshinesValue > 0 ? ((shinesInStars / sunshinesValue) * 100) : 0;

    // Calculate stats
    const userCount = stars.length;
    const starsCount = totalStars || 0;
    const sunshinesCount = totalSunshines || 0;
    const energyCount = Math.round(energyPercentage);

    // Use projectGoal if provided, otherwise fall back to goalStars
    const effectiveGoalStars = projectGoal ?? goalStars;

    // Calculate remaining stars needed
    const remainingStars = Math.max(0, effectiveGoalStars - (starsCount || 0));

    return (
        <InfoPanel
            className={cn(
                'absolute bottom-4 md:bottom-auto md:top-[calc(20vh+60px)] right-24 ',
                // Base styles
                'w-full max-w-sm mx-auto',
                'backdrop-blur-md bg-white/10 dark:bg-slate-900/10',
                'border border-slate-200/30 dark:border-slate-700/30',
                'rounded-3xl p-8',
                'transition-all duration-300',
                'hover:bg-white/20 dark:hover:bg-slate-900/20',
                'hover:border-slate-300/50 dark:hover:border-slate-600/50',
                'hover:shadow-xl hover:shadow-blue-500/20',
                // Responsive positioning
                'self-start md:self-auto'
            )}

        >
            <div className="flex flex-col items-center space-y-6 text-center">
                <div className="flex items-center justify-center flex-col">
                    {/* Large Star Icon */}
                    <div className="flex items-center justify-center">
                        {getIcon({ iconType: 'star', className: 'w-16 h-16 text-yellow-500/80 dark:text-yellow-400/70' })}
                        {getIcon({ iconType: 'star', className: 'w-20 h-20 text-yellow-500 dark:text-yellow-400/80' })}
                        {getIcon({ iconType: 'star', className: 'w-16 h-16 text-yellow-500/80 dark:text-yellow-400/70' })}
                    </div>
                    {/* Title Section */}
                    <div className="flex items-center justify-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                            '{projectName}' Galaxy
                        </h3>
                        <Tooltip
                            content={
                                <div className="text-sm max-w-xs">
                                    <p>Stars represent your contribution and commitment to the project. Earn stars by contributing, and they give you voting power when the project transitions to star user's ownership.</p>
                                </div>
                            }
                        >
                            {getIcon({ iconType: 'info', className: 'w-4 h-4' })}
                        </Tooltip>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="w-full space-y-3 flex items-center justify-between px-4 py-2 rounded-lg bg-white/5 dark:bg-slate-900/5 border border-slate-200/20 dark:border-slate-700/20">
                    <div className="flex items-center gap-2">
                        {getIcon({ iconType: 'user', className: 'w-5 h-5 text-blue-500' })}
                        <NumberFlow
                            value={userCount}
                            locales="en-US"
                            format={{ style: 'decimal', maximumFractionDigits: 0 }}
                            className="text-sm font-semibold text-slate-800 dark:text-slate-200"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {getIcon({ iconType: 'star', className: 'w-6 h-6 text-yellow-500 dark:text-yellow-500/70 mt-1.5', fill: 'currentColor' })}
                        <NumberFlow
                            value={starsCount}
                            locales="en-US"
                            format={{ style: 'decimal', maximumFractionDigits: 2 }}
                            className="text-sm font-semibold text-slate-800 dark:text-slate-400"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {getIcon({ iconType: 'sunshine', className: 'w-6 h-6 text-orange-500 dark:text-orange-500/70 mt-1.5', fill: 'currentColor' })}
                        <NumberFlow
                            value={sunshinesCount}
                            locales="en-US"
                            format={{ style: 'decimal', maximumFractionDigits: 0 }}
                            className="text-sm font-semibold text-slate-800 dark:text-slate-400"
                        />
                    </div>
                </div>

                {/* Goal Section */}
                <GoalChart
                    totalStars={totalStars}
                    totalSunshines={totalSunshines}
                    goalStars={effectiveGoalStars}
                    goalDonations={goalDonations}
                    energyCount={energyCount}
                    remainingStars={remainingStars}
                />
            </div >
        </InfoPanel >
    );
};

export default ProjectGoalPanel;

