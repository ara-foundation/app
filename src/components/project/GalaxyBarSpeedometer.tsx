import React from 'react';
import { cn } from '@/lib/utils';
import NumberFlow from '@number-flow/react';
import { getIcon } from '@/components/icon';
import Tooltip from '@/components/custom-ui/Tooltip';

// Simple label-value display component (matching RepositoryInfoPanel style)
const LabelValue: React.FC<{ label: React.ReactNode; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-1">
        <span className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5">{label}:</span>
        <span className="text-slate-800 dark:text-slate-200 font-mono font-semibold">{value}</span>
    </div>
);

interface GalaxyBarSpeedometerProps {
    sunshines?: number;
    stars?: number;
    hasStarOnPage?: boolean;
}

const GalaxyBarSpeedometer: React.FC<GalaxyBarSpeedometerProps> = ({
    sunshines = 0,
    stars = 0,
    hasStarOnPage = false,
}) => {
    return (
        <div className={cn(
            "w-48 h-24 p-3",
            "backdrop-blur-md bg-slate-900/40 dark:bg-slate-900/40",
            "border border-cyan-500/30 dark:border-cyan-400/30",
            "rounded-md",
            "relative overflow-hidden",
            "shadow-lg shadow-cyan-500/20"
        )}>
            {/* Neon glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-purple-500/8 to-pink-500/15 pointer-events-none" />

            {/* Title - Personal data */}
            <div className="relative z-10 mb-2">
                <h3 className={cn(
                    "text-xs font-mono font-bold uppercase tracking-wider",
                    "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400",
                    "drop-shadow-[0_0_4px_rgba(34,211,238,0.8)]"
                )}>
                    Personal data
                </h3>
            </div>

            {/* Horizontal Layout - Metrics and Status */}
            <div className="relative z-10 flex items-center justify-between gap-4">
                {/* Left: Metrics using LabelValue */}
                <div className="flex-1 space-y-1.5">
                    <Tooltip
                        content="How many sunshines you can spend"
                        openDelay={300}
                        tooltipClassName={cn(
                            "backdrop-blur-md",
                            "bg-slate-900/80 dark:bg-slate-900/80",
                            "border border-cyan-500/50 dark:border-cyan-400/50",
                            "text-cyan-100 dark:text-cyan-100",
                            "shadow-lg shadow-cyan-500/30",
                            "font-mono text-sm"
                        )}
                    >
                        <span className="flex items-center gap-1.5 text-purple-400 cursor-help">
                            {getIcon({ iconType: 'sunshine', className: 'w-4 h-4' })}
                            <NumberFlow
                                value={sunshines}
                                locales="en-US"
                                format={{ style: 'decimal', maximumFractionDigits: 4, useGrouping: false }}
                            />
                        </span>
                    </Tooltip>
                    <Tooltip
                        content="How many stars you have obtained so far"
                        openDelay={300}
                        tooltipClassName={cn(
                            "backdrop-blur-md",
                            "bg-slate-900/80 dark:bg-slate-900/80",
                            "border border-pink-500/50 dark:border-pink-400/50",
                            "text-pink-100 dark:text-pink-100",
                            "shadow-lg shadow-pink-500/30",
                            "font-mono text-sm"
                        )}
                    >
                        <span className="flex items-center gap-1.5 text-pink-400 cursor-help">
                            {getIcon({ iconType: 'star', className: 'w-4 h-4' })}
                            <NumberFlow
                                value={stars}
                                locales="en-US"
                                format={{ style: 'decimal', maximumFractionDigits: 4, useGrouping: false }}
                            />
                        </span>
                    </Tooltip>
                </div>

                {/* Right: Status Gauge - Star on Page Indicator */}
                <div className="flex flex-col items-center gap-1.5 px-3 border-l border-cyan-500/20">
                    <span className="text-[9px] text-slate-400 font-mono uppercase">Star on Page</span>
                    {/* Status LED */}
                    <div className="flex items-center gap-1.5">
                        <div className={cn(
                            "w-4 h-4 rounded-full",
                            "transition-all duration-300",
                            hasStarOnPage
                                ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1),0_0_16px_rgba(34,211,238,0.6),0_0_24px_rgba(34,211,238,0.3)] animate-pulse"
                                : "bg-slate-500/50"
                        )} />
                        <span className={cn(
                            "text-[10px] font-mono font-semibold uppercase",
                            hasStarOnPage ? "text-cyan-400" : "text-slate-500"
                        )}>
                            {hasStarOnPage ? "ON" : "OFF"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Subtle border glow */}
            <div className="absolute inset-0 border border-cyan-500/20 rounded-md pointer-events-none" />
        </div>
    );
};

export default GalaxyBarSpeedometer;

