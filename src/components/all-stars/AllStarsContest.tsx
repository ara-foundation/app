import React, { useState, useEffect } from 'react';
import { getIcon } from '@/components/icon';
import Badge from '@/components/badge/Badge';
import Tooltip from '@/components/custom-ui/Tooltip';
import Link from '@/components/custom-ui/Link';

interface ContestData {
    title: string;
    description: string;
    goal: number;
    prize: string;
    endTime: Date | number;
    position: number;
    contestFromDate?: Date | number;
    contestToDate?: Date | number;
}

interface AllStarsContestProps {
    projectGoal?: number;
    currentStars?: number;
    contest?: ContestData;
    isEligible?: boolean;
    projectName?: string;
    projectUri?: string;
}

const AllStarsContest: React.FC<AllStarsContestProps> = ({
    projectGoal,
    currentStars = 0,
    contest,
    isEligible,
    projectName,
    projectUri,
}) => {
    // Determine eligibility if not provided
    const eligible = isEligible ?? (projectGoal !== undefined && currentStars >= projectGoal);

    // Countdown timer state
    const [timeRemaining, setTimeRemaining] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);

    // Calculate time remaining
    useEffect(() => {
        if (!contest?.endTime) {
            setTimeRemaining(null);
            return;
        }

        const updateTimer = () => {
            const endTime = typeof contest.endTime === 'number'
                ? new Date(contest.endTime)
                : contest.endTime;
            const now = new Date();
            const diff = endTime.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeRemaining({ days, hours, minutes, seconds });
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [contest?.endTime]);

    // Format countdown display
    const formatCountdown = () => {
        if (!timeRemaining) return '--:--:--';
        const { days, hours, minutes, seconds } = timeRemaining;
        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        }
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    // Format end time for tooltip
    const formatEndTime = () => {
        if (!contest?.endTime) return '';
        const endTime = typeof contest.endTime === 'number'
            ? new Date(contest.endTime)
            : contest.endTime;
        return endTime.toLocaleString();
    };

    if (!contest) {
        return null;
    }

    // Format date for display
    const formatDate = (date: Date | number | undefined): string => {
        if (!date) return '';
        const dateObj = typeof date === 'number' ? new Date(date) : date;
        return dateObj.toLocaleDateString();
    };

    // Format prize details
    const formatPrizeDetails = () => {
        if (contest.contestFromDate && contest.contestToDate) {
            return `5% of all donations between ${formatDate(contest.contestFromDate)} - ${formatDate(contest.contestToDate)} to random galaxy on top 100 leaderboard`;
        }
        return contest.prize;
    };

    return (
        <div className="flex items-center justify-center gap-3 px-4 py-2">
            {/* Trophy with animated twinkles */}
            <Tooltip
                content={
                    <div className="text-sm max-w-xs space-y-2">
                        <div className="font-semibold">{contest.title}</div>
                        <div>{contest.description}</div>
                        <div className="text-xs text-slate-300">
                            <div>Goal: {contest.goal} stars</div>
                            <div>Prize: {formatPrizeDetails()}</div>
                            <div>Position: #{contest.position}</div>
                        </div>
                    </div>
                }
            >
                <div className="relative mt-2">
                    {/* Twinkle animations */}
                    <div className="absolute inset-0">
                        <div className="trophy-twinkle-1 absolute top-0 left-1/2 w-1 h-1 bg-yellow-300 rounded-full opacity-0 animate-twinkle-1" />
                        <div className="trophy-twinkle-2 absolute top-1 right-0 w-1 h-1 bg-yellow-300 rounded-full opacity-0 animate-twinkle-2" />
                        <div className="trophy-twinkle-3 absolute bottom-0 left-0 w-1 h-1 bg-yellow-300 rounded-full opacity-0 animate-twinkle-3" />
                        <div className="trophy-twinkle-4 absolute bottom-1 right-1/2 w-1 h-1 bg-yellow-300 rounded-full opacity-0 animate-twinkle-4" />
                    </div>
                    {getIcon({ iconType: 'trophy', className: 'w-6 h-6 relative z-10' })}
                </div>
            </Tooltip>

            {/* Contest Position */}
            <Tooltip
                content={
                    <div className="text-sm max-w-xs space-y-2">
                        <div className="font-semibold">{contest.title}</div>
                        <div>{contest.description}</div>
                        <div className="text-xs text-slate-300">
                            <div>Goal: {contest.goal} stars</div>
                            <div>Prize: {formatPrizeDetails()}</div>
                            <div>Position: #{contest.position}</div>
                        </div>
                    </div>
                }
            >
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-2">
                    #{contest.position}
                </span>
            </Tooltip>

            {/* Eligibility Badge */}
            {eligible ? (
                <Badge
                    variant="green"
                    static={true}
                    className="flex items-center gap-1 mt-2"
                >
                    {getIcon({ iconType: 'check', className: 'w-3 h-3' })}
                    <span className="text-xs">Eligible</span>
                </Badge>
            ) : (
                <Tooltip
                    content={
                        <div className="text-sm max-w-xs">
                            <div>
                                To be eligible, you need at least {projectGoal || contest.goal} stars, as{' '}
                                {projectUri && projectName ? (
                                    <Link uri={projectUri} className="text-blue-400 hover:text-blue-300 underline">
                                        #{contest.position} {projectName}
                                    </Link>
                                ) : (
                                    <span>#{contest.position} {projectName || 'this project'}</span>
                                )}
                            </div>
                        </div>
                    }
                >
                    <Badge
                        variant="orange"
                        static={true}
                        className="flex items-center gap-1 mt-2"
                    >
                        <span className="text-xs">Not Eligible</span>
                    </Badge>
                </Tooltip>
            )}

            {/* Countdown Timer */}
            {timeRemaining && (
                <Tooltip
                    content={
                        <div className="text-sm">
                            {contest.title} ends at {formatEndTime()}
                        </div>
                    }
                >
                    <div className="flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300 mt-2">
                        {getIcon({ iconType: 'clock', className: 'w-4 h-4' })}
                        <span className="transition-all duration-300">{formatCountdown()}</span>
                    </div>
                </Tooltip>
            )}

            {/* CSS for twinkle animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
          @keyframes twinkle-1 {
            0%, 100% { opacity: 0; transform: scale(0) translate(0, 0); }
            50% { opacity: 1; transform: scale(1) translate(-5px, -5px); }
          }
          @keyframes twinkle-2 {
            0%, 100% { opacity: 0; transform: scale(0) translate(0, 0); }
            50% { opacity: 1; transform: scale(1) translate(5px, -5px); }
          }
          @keyframes twinkle-3 {
            0%, 100% { opacity: 0; transform: scale(0) translate(0, 0); }
            50% { opacity: 1; transform: scale(1) translate(-5px, 5px); }
          }
          @keyframes twinkle-4 {
            0%, 100% { opacity: 0; transform: scale(0) translate(0, 0); }
            50% { opacity: 1; transform: scale(1) translate(5px, 5px); }
          }
          .animate-twinkle-1 {
            animation: twinkle-1 2s ease-in-out infinite;
          }
          .animate-twinkle-2 {
            animation: twinkle-2 2s ease-in-out infinite 0.5s;
          }
          .animate-twinkle-3 {
            animation: twinkle-3 2s ease-in-out infinite 1s;
          }
          .animate-twinkle-4 {
            animation: twinkle-4 2s ease-in-out infinite 1.5s;
          }
        `
            }} />
        </div>
    );
};

export default AllStarsContest;

