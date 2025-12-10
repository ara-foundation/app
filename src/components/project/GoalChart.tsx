import React from 'react';
import { getIcon } from '@/components/icon';
import NumberFlow from '@number-flow/react';
import InfoPanel from '../panel/InfoPanel';

interface GoalChartProps {
    totalStars?: number;
    totalSunshines?: number;
    goalStars?: number;
    goalDonations?: number;
    energyCount?: number;
    remainingStars?: number;
}

const GoalChart: React.FC<GoalChartProps> = ({
    totalStars,
    totalSunshines,
    goalStars = 100,
    goalDonations,
    energyCount = 0,
    remainingStars = 0,
}) => {
    // State for hover tracking
    const [hoveredSegment, setHoveredSegment] = React.useState<'stars' | 'sunshines' | 'remaining' | null>(null);
    const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });
    const chartContainerRef = React.useRef<HTMLDivElement>(null);

    // Calculate pie chart segments
    const sunshinesToStar = 360;
    const sunshinesValue = totalSunshines || 0;
    const starsValue = totalStars || 0;
    const shinesInStars = starsValue * sunshinesToStar;
    const currentStars = starsValue;
    const remainingSunshines = Math.max(0, sunshinesValue - shinesInStars);
    const sunshinesInStars = remainingSunshines / sunshinesToStar; // How many stars can be made from remaining sunshines
    const remainingStarsNeeded = Math.max(0, goalStars - currentStars - sunshinesInStars);

    // Calculate percentages (out of goalStars)
    const starsPercentage = goalStars > 0 ? (currentStars / goalStars) * 100 : 0;
    const sunshinesPercentage = goalStars > 0 ? (sunshinesInStars / goalStars) * 100 : 0;
    const remainingPercentage = Math.max(0, 100 - starsPercentage - sunshinesPercentage);

    // Calculate angles for pie segments (in degrees, starting from top)
    const starsAngle = (starsPercentage / 100) * 360;
    const sunshinesAngle = (sunshinesPercentage / 100) * 360;
    const remainingAngle = (remainingPercentage / 100) * 360;

    // Helper function to create pie slice path
    const createPieSlice = (startAngle: number, endAngle: number, radius: number, centerX: number, centerY: number) => {
        const start = (startAngle - 90) * (Math.PI / 180);
        const end = (endAngle - 90) * (Math.PI / 180);
        const x1 = centerX + radius * Math.cos(start);
        const y1 = centerY + radius * Math.sin(start);
        const x2 = centerX + radius * Math.cos(end);
        const y2 = centerY + radius * Math.sin(end);
        const largeArc = endAngle - startAngle > 180 ? 1 : 0;
        return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    };

    const chartSize = 200;
    const centerX = chartSize / 2;
    const centerY = chartSize / 2;
    const radius = chartSize / 2 - 10;

    // Generate unique ID for clipPath using React hook
    const clipPathId = React.useId().replace(/:/g, '-');

    return (
        <div className="w-full space-y-3 pt-2 border-t border-slate-200/30 dark:border-slate-700/30 relative">
            {/* Ownership Transition Display */}
            <div className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1">
                    {getIcon({ iconType: 'user', className: 'w-5 h-5 text-blue-600 dark:text-blue-400' })}
                    <span>Single Author</span>
                </div>
                {getIcon({ iconType: 'arrow-right', className: 'w-4 h-4 text-slate-500' })}
                <div className="flex items-center gap-1">
                    <div className="flex -space-x-1">
                        {getIcon({ iconType: 'user', className: 'w-5 h-5 text-blue-600 dark:text-blue-400' })}
                        {getIcon({ iconType: 'user', className: 'w-5 h-5 text-blue-600 dark:text-blue-400' })}
                        {getIcon({ iconType: 'user', className: 'w-5 h-5 text-blue-600 dark:text-blue-400' })}
                    </div>
                    <span>Multiple Owners</span>
                </div>
            </div>
            <div className="flex flex-row space-y-6">
                {/* 60% - Star Pie Chart Section */}
                <div className="flex-[0.6] flex flex-col items-center space-y-4 relative">
                    <div
                        ref={chartContainerRef}
                        style={{ width: chartSize, height: chartSize }}
                        onMouseLeave={() => setHoveredSegment(null)}
                    >
                        <svg
                            width={chartSize}
                            height={chartSize}
                            viewBox={`0 0 ${chartSize} ${chartSize}`}
                            className="transform -rotate-90"
                        >
                            <defs>
                                <clipPath id={clipPathId}>
                                    <path
                                        d={`M ${chartSize * 0.5} ${chartSize * 0.0} 
                                            L ${chartSize * 0.61} ${chartSize * 0.35} 
                                            L ${chartSize * 0.98} ${chartSize * 0.35} 
                                            L ${chartSize * 0.68} ${chartSize * 0.57} 
                                            L ${chartSize * 0.79} ${chartSize * 0.91} 
                                            L ${chartSize * 0.5} ${chartSize * 0.70} 
                                            L ${chartSize * 0.21} ${chartSize * 0.91} 
                                            L ${chartSize * 0.32} ${chartSize * 0.57} 
                                            L ${chartSize * 0.02} ${chartSize * 0.35} 
                                            L ${chartSize * 0.39} ${chartSize * 0.35} Z`}
                                    />
                                </clipPath>
                            </defs>

                            <g clipPath={`url(#${clipPathId})`}>
                                {/* Background circle */}
                                <circle
                                    cx={centerX}
                                    cy={centerY}
                                    r={radius}
                                    fill="#e5e7eb"
                                    stroke="#d1d5db"
                                    strokeWidth="2"
                                    className="dark:fill-slate-700 dark:stroke-slate-600"
                                />

                                {/* Stars segment (orange/gold) */}
                                {starsAngle > 0 && (
                                    <path
                                        d={createPieSlice(0, starsAngle, radius, centerX, centerY)}
                                        fill="#f97316"
                                        stroke={hoveredSegment === 'stars' ? '#f97316' : '#f59e0b'}
                                        strokeWidth={hoveredSegment === 'stars' ? '2' : '3'}
                                        className="fill-orange-500 dark:fill-orange-500/70 hover:fill-yellow-500/90 dark:hover:fill-yellow-500/70 cursor-pointer transition-all duration-200"
                                        style={{
                                            pointerEvents: 'all',
                                            opacity: hoveredSegment === 'stars' ? 0.8 : hoveredSegment ? 0.5 : 1,
                                            filter: hoveredSegment === 'stars' ? 'brightness(1.1)' : 'none',
                                            transform: hoveredSegment === 'stars' ? 'translateY(+12px)' : 'translateY(0)',
                                            transformOrigin: 'center',
                                        }}
                                        onMouseEnter={(e) => {
                                            setHoveredSegment('stars');
                                            if (chartContainerRef.current) {
                                                const containerRect = chartContainerRef.current.getBoundingClientRect();
                                                const pathRect = e.currentTarget.getBoundingClientRect();
                                                setTooltipPosition({
                                                    x: pathRect.left + pathRect.width / 2 - containerRect.left,
                                                    y: pathRect.top + pathRect.height / 2 - containerRect.top
                                                });
                                            }
                                        }}
                                    />
                                )}

                                {/* Sunshines segment (yellow) */}
                                {sunshinesAngle > 0 && (
                                    <path
                                        d={createPieSlice(starsAngle, starsAngle + sunshinesAngle, radius, centerX, centerY)}
                                        fill="#eab308"
                                        stroke={hoveredSegment === 'sunshines' ? '#f97316' : '#f59e0b'}
                                        strokeWidth={hoveredSegment === 'sunshines' ? '3' : '2'}
                                        className="dark:fill-yellow-500 cursor-pointer transition-all duration-200"
                                        style={{
                                            pointerEvents: 'all',
                                            opacity: hoveredSegment === 'sunshines' ? 0.8 : hoveredSegment ? 0.5 : 1,
                                            filter: hoveredSegment === 'sunshines' ? 'brightness(1.1)' : 'none',
                                            transform: hoveredSegment === 'sunshines' ? 'translateY(-4px)' : 'translateY(0)',
                                            transformOrigin: 'center',
                                        }}
                                        onMouseEnter={(e) => {
                                            setHoveredSegment('sunshines');
                                            if (chartContainerRef.current) {
                                                const containerRect = chartContainerRef.current.getBoundingClientRect();
                                                const pathRect = e.currentTarget.getBoundingClientRect();
                                                setTooltipPosition({
                                                    x: pathRect.left + pathRect.width / 2 - containerRect.left,
                                                    y: pathRect.top + pathRect.height / 2 - containerRect.top
                                                });
                                            }
                                        }}
                                    />
                                )}

                                {/* Remaining segment (gray) */}
                                {remainingAngle > 0 && (
                                    <path
                                        d={createPieSlice(starsAngle + sunshinesAngle, 360, radius, centerX, centerY)}
                                        fill="#9ca3af"
                                        stroke={hoveredSegment === 'remaining' ? '#6b7280' : '#4b5563'}
                                        strokeWidth={hoveredSegment === 'remaining' ? '3' : '2'}
                                        className="dark:fill-slate-600 cursor-pointer transition-all duration-200"
                                        opacity={hoveredSegment === 'remaining' ? 0.5 : 0.3}
                                        style={{
                                            pointerEvents: 'all',
                                            filter: hoveredSegment === 'remaining' ? 'brightness(1.1)' : 'none',
                                            transform: hoveredSegment === 'remaining' ? 'translateY(-4px)' : 'translateY(0)',
                                            transformOrigin: 'center',
                                        }}
                                        onMouseEnter={(e) => {
                                            setHoveredSegment('remaining');
                                            if (chartContainerRef.current) {
                                                const containerRect = chartContainerRef.current.getBoundingClientRect();
                                                const pathRect = e.currentTarget.getBoundingClientRect();
                                                setTooltipPosition({
                                                    x: pathRect.left + pathRect.width / 2 - containerRect.left,
                                                    y: pathRect.top + pathRect.height / 2 - containerRect.top
                                                });
                                            }
                                        }}
                                    />
                                )}
                            </g>
                        </svg>
                    </div>
                    {/* Tooltip overlay */}
                    {hoveredSegment && (
                        <div
                            className="absolute z-50 pointer-events-none"
                            style={{
                                left: `${tooltipPosition.x}px`,
                                top: `${tooltipPosition.y - 30}px`,
                                transform: 'translate(-50%, -100%)',
                                marginTop: '-8px'
                            }}
                        >
                            <div className="bg-black/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
                                {hoveredSegment === 'stars' && (
                                    <div className="flex items-center gap-2 text-sm">
                                        {getIcon({ iconType: 'star', className: 'w-4 h-4 text-orange-500' })}
                                        <div>
                                            <div className="font-semibold text-white">Stars</div>
                                            <div className="text-xs text-slate-300">
                                                <NumberFlow
                                                    value={currentStars}
                                                    locales="en-US"
                                                    format={{ style: 'decimal', maximumFractionDigits: 2 }}
                                                />
                                                {' '}stars ({starsPercentage.toFixed(1)}%)
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {hoveredSegment === 'sunshines' && (
                                    <div className="flex items-center gap-2 text-sm">
                                        {getIcon({ iconType: 'sunshine', className: 'w-4 h-4 text-yellow-500' })}
                                        <div>
                                            <div className="font-semibold text-white">Sunshines to Stars</div>
                                            <div className="text-xs text-slate-300">
                                                <NumberFlow
                                                    value={sunshinesInStars}
                                                    locales="en-US"
                                                    format={{ style: 'decimal', maximumFractionDigits: 2 }}
                                                />
                                                {' '}potential stars ({sunshinesPercentage.toFixed(1)}%)
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {hoveredSegment === 'remaining' && (
                                    <div className="flex items-center gap-2 text-sm">
                                        {getIcon({ iconType: 'star', className: 'w-4 h-4 text-slate-400' })}
                                        <div>
                                            <div className="font-semibold text-white">Remaining Stars to obtain</div>
                                            <div className="text-sm text-slate-300 p-1 w-48 ">
                                                <NumberFlow
                                                    value={remainingStarsNeeded}
                                                    locales="en-US"
                                                    format={{ style: 'decimal', maximumFractionDigits: 2 }}
                                                />
                                                {' '}stars ({remainingPercentage.toFixed(1)}%) left to obtain community control
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 40% - Stats Section */}
                <div className="flex-[0.4] w-full space-y-3 -mt-4 flex items-center relative">
                    <InfoPanel className="absolute top-15 left-0 flex flex-col px-4 py-2 space-y-4 rounded-lg bg-white/5 dark:bg-slate-900/5 border border-slate-200/20 dark:border-slate-700/20">
                        <h3 className="text-sm font-semibold text-slate-800/80 dark:text-slate-300/70 -ml-2">
                            Total Stats
                        </h3>
                        {/* Energy */}
                        <div className="flex gap-2">
                            {getIcon({ iconType: 'energy', className: 'w-5 h-5 text-purple-500' })}
                            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                {energyCount}%
                            </span>
                        </div>

                        {/* Donations Needed */}
                        {goalDonations !== undefined && (
                            <div className="flex gap-2">
                                <span className="text-sm text-slate-600 dark:text-slate-400">{getIcon({ iconType: 'money', className: 'w-5 h-5 text-green-500 dark:text-green-500/70' })}</span>
                                <NumberFlow
                                    value={goalDonations}
                                    locales="en-US"
                                    format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
                                    className="text-sm font-semibold text-green-800 dark:text-green-400/70"
                                />
                            </div>
                        )}

                        {/* Stars Needed */}
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1">
                                {getIcon({ iconType: 'multiple-users', className: 'w-5 h-5 text-blue-500 dark:text-blue-400/70' })}
                                {getIcon({ iconType: 'star', className: 'w-5 h-5 text-yellow-500 dark:text-yellow-400/80' })}
                            </span>
                            <NumberFlow
                                value={remainingStars}
                                locales="en-US"
                                format={{ style: 'decimal', maximumFractionDigits: 2 }}
                                className="text-sm text-teal-800 dark:text-teal-400/70 "
                            />
                        </div>
                    </InfoPanel>
                </div>
            </div>
        </div>
    );
};

export default GoalChart;

