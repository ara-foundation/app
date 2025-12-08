'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'motion/react';
import { useDrag } from 'react-dnd';
import { ReversedHoleBackground } from '@/components/animate-ui/components/backgrounds/reversed-hole';
import { getIcon } from '@/components/icon';
import { actions } from 'astro:actions';
import { PATCH_KEYWORD } from '@/types/patch';
import type { Issue } from '@/types/issue';
import { cn } from '@/lib/utils';
import Tooltip from '@/components/custom-ui/Tooltip';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import NumberFlow from '@number-flow/react';

interface PatcherPanelProps {
    galaxyId: string;
}

const PatcherPanel: React.FC<PatcherPanelProps> = ({ galaxyId }) => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchIssues = useCallback(async () => {
        if (!galaxyId) {
            return;
        }

        try {
            setIsLoading(true);
            const result = await actions.getIssuesByGalaxy({
                galaxyId,
                tabKey: PATCH_KEYWORD
            });

            if (result.data?.issues) {
                // Filter issues that have 'patcher' in listHistory
                const patchedIssues = result.data.issues.filter(
                    issue => issue.listHistory?.includes(PATCH_KEYWORD)
                );
                setIssues(patchedIssues);
            }
        } catch (error) {
            console.error('Error fetching patched issues:', error);
        } finally {
            setIsLoading(false);
        }
    }, [galaxyId]);

    useEffect(() => {
        fetchIssues();
    }, [fetchIssues]);

    const truncateTitle = (title: string, maxLength: number = 58) => {
        if (title.length <= maxLength) return title;
        return title.substring(0, maxLength) + '...';
    };

    // Minimal draggable issue component
    const MinimalDraggableIssue: React.FC<{ issue: Issue }> = memo(({ issue }) => {
        const [{ opacity }, drag] = useDrag(
            () => ({
                type: 'patch',
                item: { id: issue._id, title: issue.title },
                collect: (monitor) => ({
                    opacity: monitor.isDragging() ? 0.4 : 1,
                }),
            }),
            [issue._id, issue.title],
        );

        return (
            <div
                ref={drag as any}
                data-testid={issue._id}
                style={{ opacity }}
                className={cn(
                    'cursor-move border-1 border-amber-300/80 hover:border-amber-400',
                    'dark:border-amber-400/70 dark:hover:border-amber-300/90',
                    'bg-amber-50/50 dark:bg-amber-900/20',
                    'transition-colors p-2 border-dashed rounded-md',
                    'flex items-center justify-between gap-2'
                )}
            >
                <span className="text-sm text-slate-700 dark:text-slate-300 flex-1 truncate">
                    {truncateTitle(issue.title)}
                </span>
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    {getIcon({ iconType: 'sunshine', className: 'w-4 h-4', fill: 'currentColor' })}
                    <span className="text-xs font-semibold">
                        <NumberFlow
                            value={issue.sunshines || 0}
                            locales="en-US"
                            format={{ useGrouping: false }}
                        />
                    </span>
                </div>
            </div>
        );
    });
    MinimalDraggableIssue.displayName = 'MinimalDraggableIssue';

    return (
        <DndProvider backend={HTML5Backend}>
            <motion.div
                className={cn(
                    'fixed right-4 top-1/2 -translate-y-1/2 z-20 w-80',
                    'pointer-events-auto',
                    'visible'
                )}
            >
                <div className="relative h-full min-h-[400px]">
                    <ReversedHoleBackground className="w-full h-[400px]">
                        {/* Floating "Patcher" label above the hole */}
                        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
                            <h2 className="w-[300px] text-center text-2xl font-semibold text-slate-700 dark:text-slate-200 shadow-2xl">
                                Patcher
                            </h2>
                            <Tooltip content="Issues with 'patcher' in listHistory can be dragged to roadmap patches.">
                                {getIcon({ iconType: 'info', className: 'w-6 h-6 text-slate-600 dark:text-slate-300', fill: 'none' })}
                            </Tooltip>
                        </div>

                        {/* Issues list below the hole */}
                        <div className="absolute bottom-0 left-0 right-0 z-30 p-4 space-y-2 max-h-[200px] overflow-x-hidden overflow-y-auto">
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Patchable Issues
                            </div>
                            {isLoading ? (
                                <div className="text-sm text-slate-600 dark:text-slate-400 text-center py-4">
                                    Loading...
                                </div>
                            ) : issues.length === 0 ? (
                                <div className="text-sm text-slate-600 dark:text-slate-400 text-center py-4">
                                    No patchable issues found.
                                </div>
                            ) : (
                                issues.map((issue) => (
                                    <MinimalDraggableIssue key={issue._id} issue={issue} />
                                ))
                            )}
                        </div>
                    </ReversedHoleBackground>
                </div>
            </motion.div>
        </DndProvider>
    );
};

export default PatcherPanel;

