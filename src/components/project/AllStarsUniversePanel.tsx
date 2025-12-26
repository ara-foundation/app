import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Tooltip from '@/components/custom-ui/Tooltip';
import InfoPanel from '../panel/InfoPanel';
import Button from '@/components/custom-ui/Button';
import Link from '@/components/custom-ui/Link';
import { updateGalaxyCoordinates } from '@/client-side/galaxy';
import { getTransactionUrl } from '@/lib/utils';
import { actions } from 'astro:actions';
import type { GalaxyPositionTracer } from '@/types/all-stars';

interface AllStarsUniversePanelProps {
    galaxyId: string;
    galaxyX?: number;
    galaxyY?: number;
    universeBounds?: { minX: number; maxX: number; minY: number; maxY: number };
    maintainerId?: string;
    currentUserId?: string;
}

const AllStarsUniversePanel: React.FC<AllStarsUniversePanelProps> = ({
    galaxyId,
    galaxyX = 0,
    galaxyY = 0,
    universeBounds,
    maintainerId,
    currentUserId,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentX, setCurrentX] = useState(galaxyX);
    const [currentY, setCurrentY] = useState(galaxyY);
    const [positionHistory, setPositionHistory] = useState<GalaxyPositionTracer[]>([]);

    // Check if current user is the maintainer
    const isMaintainer = maintainerId && currentUserId && maintainerId === currentUserId;

    // Load position history on mount
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const result = await actions.getGalaxyPositionHistory({ galaxyId });
                if (result.data?.success && result.data.data) {
                    setPositionHistory(result.data.data);
                }
            } catch (error) {
                console.error('Error loading position history:', error);
            }
        };
        loadHistory();
    }, [galaxyId]);

    // Update local state when props change
    useEffect(() => {
        setCurrentX(galaxyX);
        setCurrentY(galaxyY);
    }, [galaxyX, galaxyY]);

    const handleSetRandomCoordinates = async () => {
        setIsLoading(true);
        try {
            const result = await updateGalaxyCoordinates(galaxyId);
            if (result.success) {
                setCurrentX(result.x);
                setCurrentY(result.y);
                // Reload position history
                try {
                    const historyResult = await actions.getGalaxyPositionHistory({ galaxyId });
                    if (historyResult.data?.success && historyResult.data.data) {
                        setPositionHistory(historyResult.data.data);
                    }
                } catch (error) {
                    console.error('Error reloading position history:', error);
                }
            } else {
                console.error('Failed to update coordinates:', result.error);
                // Could show error toast here
            }
        } catch (error) {
            console.error('Error updating coordinates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const isNotVisible = currentX === 0 && currentY === 0;
    const minX = universeBounds?.minX ?? 0;
    const maxX = universeBounds?.maxX ?? 0;
    const minY = universeBounds?.minY ?? 0;
    const maxY = universeBounds?.maxY ?? 0;

    // Calculate relative position for visualization
    const universeWidth = maxX - minX || 1;
    const universeHeight = maxY - minY || 1;
    const relativeX = universeWidth > 0 ? ((currentX - minX) / universeWidth) * 100 : 50;
    const relativeY = universeHeight > 0 ? ((currentY - minY) / universeHeight) * 100 : 50;

    return (
        <InfoPanel
            className={cn(
                'absolute bottom-4 md:bottom-auto md:top-[calc(20vh+60px)] left-24',
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
                {/* Title Section */}
                <div className="flex items-center justify-center flex-col">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        All Stars Universe
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Galaxy Coordination on the Ara All Stars Universe
                    </p>
                </div>

                {/* Coordinates Display */}
                <div className="w-full space-y-2">
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                        <span className="font-semibold">x:</span> {currentX}, <span className="font-semibold">y:</span> {currentY}
                    </div>
                    {universeBounds && (
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                            X: {minX} to {maxX}, Y: {minY} to {maxY}
                        </div>
                    )}
                </div>

                {/* Not Visible Message */}
                {isNotVisible && (
                    <div className="w-full px-4 py-3 rounded-lg bg-yellow-50/50 dark:bg-yellow-900/20 border border-yellow-200/50 dark:border-yellow-700/50">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                            Galaxy is not visible in Ara {' '}
                            <Link
                                uri="/all-stars"
                                className="text-yellow-600 dark:text-yellow-400 hover:underline font-semibold"
                            >
                                All Stars
                            </Link>{' '}
                            page.
                        </p>
                    </div>
                )}

                {/* Visual Coordinate Display */}
                {!isNotVisible && universeBounds && (
                    <div className="w-full">
                        <div className="relative w-full h-48 rounded-lg border-2 border-slate-300/50 dark:border-slate-600/50 bg-slate-50/30 dark:bg-slate-800/30 overflow-hidden">
                            {/* Universe bounds rectangle */}
                            <div className="absolute inset-0 border border-slate-400/30 dark:border-slate-500/30" />

                            {/* Galaxy position marker */}
                            <div
                                className="absolute w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 border-2 border-white dark:border-slate-900 shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                                style={{
                                    left: `${Math.max(0, Math.min(100, relativeX))}%`,
                                    top: `${Math.max(0, Math.min(100, relativeY))}%`,
                                }}
                            >
                                <div className="absolute inset-0 rounded-full bg-blue-400 dark:bg-blue-500 animate-ping opacity-75" />
                            </div>

                            {/* Position label */}
                            <div
                                className="absolute text-xs font-mono text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded shadow-sm transform -translate-x-1/2"
                                style={{
                                    left: `${Math.max(0, Math.min(100, relativeX))}%`,
                                    top: `${Math.max(0, Math.min(100, relativeY + 5))}%`,
                                }}
                            >
                                ({currentX}, {currentY})
                            </div>
                        </div>
                    </div>
                )}

                {/* Set Coordination Randomly Button */}
                {isMaintainer ? (
                    <Button
                        onClick={handleSetRandomCoordinates}
                        variant="primary"
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? 'Setting Coordinates...' : 'Set Galaxy Randomly'}
                    </Button>
                ) : (
                    <Tooltip content="Only Maintainer can call it, please sign in as the Galaxy Maintainer">
                        <div className="w-full">
                            <Button
                                variant="primary"
                                disabled={true}
                                className="w-full"
                            >
                                Set Galaxy Randomly
                            </Button>
                        </div>
                    </Tooltip>
                )}

                {/* Holographic Robot Icons for Position History */}
                {positionHistory.length > 0 && (
                    <div className="w-full">
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">Position History</div>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {positionHistory.map((tracer, index) => (
                                <Tooltip
                                    key={tracer._id || index}
                                    content={
                                        <div className="text-sm space-y-1">
                                            <div className="font-semibold">Position #{tracer.order}</div>
                                            <div>X: {tracer.x}, Y: {tracer.y}</div>
                                            {tracer.txId && (
                                                <div>
                                                    <Link
                                                        uri={getTransactionUrl(tracer.txId)}
                                                        asNewTab={true}
                                                        className="text-blue-400 hover:text-blue-300 underline"
                                                    >
                                                        View on Explorer
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    }
                                >
                                    <button
                                        type="button"
                                        className="relative w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-500 
                                                   flex items-center justify-center
                                                   shadow-lg hover:shadow-xl transition-shadow
                                                   border border-blue-400 dark:border-blue-300
                                                   cursor-pointer
                                                   animate-pulse"
                                        aria-label={`Position #${tracer.order}`}
                                        style={{
                                            boxShadow: '0 0 4px rgba(59, 130, 246, 0.5), 0 0 8px rgba(59, 130, 246, 0.3), 0 0 12px rgba(59, 130, 246, 0.2)',
                                        }}
                                    >
                                        {/* Robot Icon */}
                                        <svg
                                            className="w-2 h-2 text-white pointer-events-none"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                                            />
                                        </svg>
                                    </button>
                                </Tooltip>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </InfoPanel>
    );
};

export default AllStarsUniversePanel;

