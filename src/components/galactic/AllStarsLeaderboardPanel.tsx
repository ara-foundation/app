import React from 'react';
import { getIcon } from '@/components/icon';
import NumberFlow from '@number-flow/react';
import { cn } from '@/lib/utils';
import Tooltip from '@/components/custom-ui/Tooltip';
import InfoPanel from '../panel/InfoPanel';

interface AllStarsLeaderboardPanelProps {
    prizePool?: number;
    contestFromDate?: Date;
    contestToDate?: Date;
    contestDescription?: string;
    leaderboardPosition?: number;
}

const AllStarsLeaderboardPanel: React.FC<AllStarsLeaderboardPanelProps> = ({
    prizePool = 125000,
    contestFromDate,
    contestToDate,
    contestDescription,
    leaderboardPosition = 5,
}) => {
    const formatDate = (date: Date | undefined): string => {
        if (!date) return '';
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const description = contestDescription || 
        `5% of the funds from ${contestFromDate ? formatDate(contestFromDate) : '1st december'} to ${contestToDate ? formatDate(contestToDate) : '1st january'}. The funds is given to the 1/100 of the top star gained galaxy. It includes all users, contributors and maintainers receiving equivalent to their earned stars`;

    return (
        <InfoPanel
            className={cn(
                'absolute bottom-4 md:bottom-auto md:top-[calc(20vh+60px)] right-24',
                'w-full max-w-sm mx-auto',
                'backdrop-blur-md bg-white/10 dark:bg-slate-900/10',
                'border border-slate-200/30 dark:border-slate-700/30',
                'rounded-3xl p-8',
                'transition-all duration-300',
                'hover:bg-white/20 dark:hover:bg-slate-900/20',
                'hover:border-slate-300/50 dark:hover:border-slate-600/50',
                'hover:shadow-xl hover:shadow-blue-500/20',
                'self-start md:self-auto'
            )}
        >
            <div className="flex flex-col items-center space-y-6 text-center">
                <div className="flex items-center justify-center flex-col">
                    {/* Large Trophy Icon */}
                    <div className="flex items-center justify-center">
                        {getIcon({ iconType: 'trophy', className: 'w-16 h-16 text-yellow-500/80 dark:text-yellow-400/70' })}
                        {getIcon({ iconType: 'trophy', className: 'w-20 h-20 text-yellow-500 dark:text-yellow-400/80' })}
                        {getIcon({ iconType: 'trophy', className: 'w-16 h-16 text-yellow-500/80 dark:text-yellow-400/70' })}
                    </div>
                    {/* Title Section */}
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                            Universe Contest
                        </h3>
                        <Tooltip
                            content={
                                <div className="text-sm max-w-xs">
                                    <p>{description}</p>
                                </div>
                            }
                        >
                            {getIcon({ iconType: 'info', className: 'w-4 h-4' })}
                        </Tooltip>
                    </div>
                </div>

                {/* Prize Pool Section */}
                <div className="w-full space-y-3 flex flex-col items-center px-4 py-4 rounded-lg bg-white/5 dark:bg-slate-900/5 border border-slate-200/20 dark:border-slate-700/20">
                    <div className="text-xs text-slate-600 dark:text-slate-400">Prize Pool</div>
                    <div className="flex items-center gap-2">
                        {getIcon({ iconType: 'money', className: 'w-6 h-6 text-green-500 dark:text-green-500/70' })}
                        <NumberFlow
                            value={prizePool}
                            locales="en-US"
                            format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
                            className="text-2xl font-bold text-green-600 dark:text-green-400"
                        />
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                        Pool is increasing
                    </div>
                </div>

                {/* Contest Description */}
                <div className="w-full px-4 py-3 rounded-lg bg-white/5 dark:bg-slate-900/5 border border-slate-200/20 dark:border-slate-700/20">
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Leaderboard Position */}
                {leaderboardPosition && (
                    <div className="w-full px-4 py-2 rounded-lg bg-white/5 dark:bg-slate-900/5 border border-slate-200/20 dark:border-slate-700/20">
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Current Position:</span>
                            <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                #{leaderboardPosition}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </InfoPanel>
    );
};

export default AllStarsLeaderboardPanel;

