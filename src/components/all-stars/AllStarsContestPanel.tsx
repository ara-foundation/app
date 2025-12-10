import React, { useState, useEffect } from 'react';
import { getIcon } from '@/components/icon';
import NumberFlow from '@number-flow/react';
import { cn } from '@/lib/utils';
import Tooltip from '@/components/custom-ui/Tooltip';
import InfoPanel from '../panel/InfoPanel';
import TimeAgo from 'timeago-react';
import { useTimer } from 'react-timer-hook';
import Badge from '../badge/Badge';

interface AllStarsLeaderboardPanelProps {
    prizePool?: number;
    contestFromDate?: Date;
    contestToDate?: Date;
    contestDescription?: string;
    winProbability?: number; // Probability percentage (0-100)
}

const AllStarsLeaderboardPanel: React.FC<AllStarsLeaderboardPanelProps> = ({
    prizePool = 125000,
    contestFromDate,
    contestToDate,
    contestDescription,
    winProbability = 1.5, // Default probability percentage
}) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    // Use timer hook for countdown to contest end date
    const {
        days,
        hours,
        minutes,
        seconds,
        isRunning,
    } = useTimer({
        expiryTimestamp: contestToDate || new Date(),
        autoStart: true,
        onExpire: () => console.warn('Contest ended'),
    });

    // Update current time every second for progress calculation
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatDate = (date: Date | undefined): string => {
        if (!date) return '';
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const formatDateTime = (date: Date | undefined): string => {
        if (!date) return '';
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate progress percentage
    const getProgress = (): number => {
        if (!contestFromDate || !contestToDate) return 0;
        const now = currentTime.getTime();
        const start = contestFromDate.getTime();
        const end = contestToDate.getTime();
        const total = end - start;
        const elapsed = now - start;

        if (elapsed < 0) return 0;
        if (elapsed > total) return 100;
        return (elapsed / total) * 100;
    };

    const progress = getProgress();
    const isEnded = contestToDate && currentTime > contestToDate;
    const isNotStarted = contestFromDate && currentTime < contestFromDate;

    const description = contestDescription ||
        `5% of the funds from ${contestFromDate ? formatDate(contestFromDate) : '1st december'} to ${contestToDate ? formatDate(contestToDate) : '1st january'}. The funds is given to the 1/100 of the top star gained galaxy. It includes all users, contributors and maintainers receiving equivalent to their earned stars`;

    const eligibilityTooltip = (
        <div className="text-sm space-y-2 max-w-xs">
            <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Open-source projects that obtained stars within the contest period.</li>
                <li>Stars are given to the solved issues and merged pull requests.</li>
                <li>But the issues must be with the sunshines that users get after donating to the project.</li>
                <li>Winner is randomly picked at the end of the contest, from the top 100 galaxies by obtained stars.</li>
            </ul>
        </div>
    );

    const howToEarnRewardTooltip = (
        <div className="text-sm space-y-3 max-w-xs">
            <div>
                <p className="font-semibold mb-2">If you have an open-source project:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>For maintainers: Add your repository, create galaxy and begin collaboration.</li>
                </ul>
            </div>
            <div>
                <p className="font-semibold mb-2">For everybody:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>You can also get the reward.</li>
                    <li>Find the galaxy, by donating to the open-source project, obtain sunshines, then with the collaboration turn them into stars.</li>
                </ul>
            </div>
        </div>
    );

    const winProbabilityTooltip = (
        <div className="text-sm max-w-xs">
            <p>Calculated probability for you to win the contest if you join the project with 10 stars.</p>
        </div>
    );

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
                            Open-source Galaxy Contest 1
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
                    <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">Prize Pool <Badge variant="info">Demo</Badge></div>
                    <div className="flex items-center gap-2">
                        {getIcon({ iconType: 'money', className: 'w-6 h-6 text-green-500 dark:text-green-500/70' })}
                        <NumberFlow
                            value={prizePool}
                            locales="en-US"
                            format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
                            className="text-2xl font-bold text-green-600 dark:text-green-400"
                        />
                    </div>
                </div>

                {/* Timeline Section */}
                <div className="w-full space-y-3 px-4 py-4 rounded-lg bg-white/5 dark:bg-slate-900/5 border border-slate-200/20 dark:border-slate-700/20">
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">Timeline</div>

                    {/* Progress Slider */}
                    <div className="w-full space-y-2">
                        {/* Start and End Times */}
                        <div className="flex items-center justify-between text-xs">
                            {contestFromDate ? (
                                <div className="text-slate-700 dark:text-slate-300">
                                    <TimeAgo datetime={contestFromDate} live={false} />
                                </div>
                            ) : (
                                <span className="text-slate-500 dark:text-slate-400">N/A</span>
                            )}
                            {contestToDate ? (
                                <div className="text-slate-700 dark:text-slate-300 font-mono">
                                    {isRunning ? (
                                        <span>
                                            {days > 0 && `${days}d `}
                                            {String(hours).padStart(2, '0')}:
                                            {String(minutes).padStart(2, '0')}:
                                            {String(seconds).padStart(2, '0')}
                                        </span>
                                    ) : (
                                        <span>Ended</span>
                                    )}
                                </div>
                            ) : (
                                <span className="text-slate-500 dark:text-slate-400">N/A</span>
                            )}
                        </div>

                        <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-out"
                                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400">Progress</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                                {Math.round(progress)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Eligibility Section */}
                <div className="w-full px-4 py-3 rounded-lg bg-white/5 dark:bg-slate-900/5 border border-slate-200/20 dark:border-slate-700/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                                Eligibility
                            </span>
                            <Tooltip content={eligibilityTooltip}>
                                {getIcon({ iconType: 'info', className: 'w-4 h-4 text-slate-500 dark:text-slate-400' })}
                            </Tooltip>
                        </div>
                        <Tooltip content={winProbabilityTooltip}>
                            <div className="flex items-center gap-1 cursor-pointer">
                                <span className="text-base">🍀</span>
                                <span className="text-base">😊</span>
                                <NumberFlow
                                    value={winProbability / 100}
                                    locales="en-US"
                                    format={{ style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                                    className="text-xs font-medium text-slate-700 dark:text-slate-300"
                                />
                            </div>
                        </Tooltip>
                    </div>
                </div>

                {/* How to Earn Reward Section */}
                <div className="w-full px-4 py-3 rounded-lg bg-white/5 dark:bg-slate-900/5 border border-slate-200/20 dark:border-slate-700/20">
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                            Anyone can join the contest
                        </span>
                        <Tooltip content={howToEarnRewardTooltip}>
                            {getIcon({ iconType: 'info', className: 'w-4 h-4 text-slate-500 dark:text-slate-400' })}
                        </Tooltip>
                    </div>
                </div>
            </div>
        </InfoPanel>
    );
};

export default AllStarsLeaderboardPanel;
