'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { HoleBackground } from '@/components/animate-ui/components/backgrounds/hole';
import { getIcon } from '@/components/icon';
import { actions } from 'astro:actions';
import { getDemo } from '@/demo-runtime-cookies/client-side';
import { ISSUE_EVENT_TYPES } from '@/types/issue';
import type { Issue } from '@/types/issue';
import { cn } from '@/lib/utils';
import Button from '@/components/custom-ui/Button';
import Tooltip from '@/components/custom-ui/Tooltip';
import DropTarget from '@/components/DropTarget';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface PatchedIssue extends Issue {
    originalListTitle?: string;
}

interface PatcherContainerProps {
}

const PatcherContainer: React.FC<PatcherContainerProps> = () => {
    const [patchedIssues, setPatchedIssues] = useState<PatchedIssue[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const [galaxyId, setGalaxyId] = useState<string>('');
    const [activeTabTitle, setActiveTabTitle] = useState<string>('shining');

    // Listen for patchable-issues-exist event
    useEffect(() => {
        const handleTabChanged = (event: Event) => {
            const customEvent = event as CustomEvent<{ title: string; galaxyId: string }>;
            setActiveTabTitle(customEvent.detail.title);
        };

        const handlePatchableIssuesExist = (event: Event) => {
            const customEvent = event as CustomEvent<{ exists: boolean; galaxyId: string; title: string }>;
            if (customEvent.detail.title !== activeTabTitle) {
                return;
            }
            setIsVisible(customEvent.detail.exists);
            if (galaxyId !== customEvent.detail.galaxyId) {
                setGalaxyId(customEvent.detail.galaxyId);
            }
        };

        window.addEventListener(ISSUE_EVENT_TYPES.ISSUES_TAB_CHANGED, handleTabChanged);
        window.addEventListener(ISSUE_EVENT_TYPES.PATCHABLE_ISSUES_EXIST, handlePatchableIssuesExist);
        return () => {
            window.removeEventListener(ISSUE_EVENT_TYPES.ISSUES_TAB_CHANGED, handleTabChanged);
            window.removeEventListener(ISSUE_EVENT_TYPES.PATCHABLE_ISSUES_EXIST, handlePatchableIssuesExist);
        };
    }, [activeTabTitle]);

    // Fetch patched issues on mount and when galaxyId changes
    useEffect(() => {
        if (!galaxyId) {
            return;
        }

        const fetchPatchedIssues = async () => {
            try {
                const result = await actions.getIssuesByGalaxy({ galaxyId });
                const allIssues = result.data?.issues || [];
                const patched = allIssues.filter(
                    issue => issue.listHistory?.includes('patcher')
                ) as PatchedIssue[];
                setPatchedIssues(patched);
            } catch (error) {
                console.error('Error fetching patched issues:', error);
            }
        };

        fetchPatchedIssues();

        // Listen for issue updates
        const handleIssueUpdate = () => {
            fetchPatchedIssues();
        };

        window.addEventListener(ISSUE_EVENT_TYPES.ISSUE_UPDATE, handleIssueUpdate);
        return () => {
            window.removeEventListener(ISSUE_EVENT_TYPES.ISSUE_UPDATE, handleIssueUpdate);
        };
    }, [galaxyId]);

    // Handle drop
    const handleDrop = useCallback(async (item: { id: string; title: string }) => {
        console.log('handleDrop>>>>', item);
        const demo = getDemo();
        if (!demo.email) {
            console.error('No email found in demo');
            return;
        }

        try {
            // Get the issue to get
            const issueResult = await actions.getIssueById({ issueId: item.id });
            const issue = issueResult.data?.data;

            if (!issue) {
                console.error('Issue not found');
                return;
            }

            // Patch the issue
            const result = await actions.patchIssue({
                issueId: item.id,
                email: demo.email,
            });

            if (result.data?.success) {
                // Add to local state
                const patchedIssue: PatchedIssue = {
                    ...issue,
                    originalListTitle: 'Unknown', // We'll need to track this better
                };
                setPatchedIssues(prev => {
                    // Check if already exists
                    if (prev.some(p => p._id === item.id)) {
                        return prev;
                    }
                    return [...prev, patchedIssue];
                });

                // Dispatch issue-update event
                window.dispatchEvent(new CustomEvent(ISSUE_EVENT_TYPES.ISSUE_UPDATE));
            }
        } catch (error) {
            console.error('Error patching issue:', error);
        }
    }, []);

    // Handle cancel (unpatch)
    const handleCancel = useCallback(async (issue: PatchedIssue) => {
        const demo = getDemo();
        if (!demo.email) {
            console.error('No email found in demo');
            return;
        }

        try {
            const result = await actions.unpatchIssue({
                issueId: issue._id!,
                email: demo.email,
            });

            if (result.data?.success) {
                // Remove from local state
                setPatchedIssues(prev => prev.filter(p => p._id !== issue._id));

                // Dispatch issue-unpatched event
                window.dispatchEvent(new CustomEvent(ISSUE_EVENT_TYPES.ISSUE_UNPATCHED, {
                    detail: {
                        issue,
                    },
                }));

                // Dispatch issue-update event
                window.dispatchEvent(new CustomEvent(ISSUE_EVENT_TYPES.ISSUE_UPDATE));
            }
        } catch (error) {
            console.error('Error unpatching issue:', error);
        }
    }, []);

    if (!isVisible) {
        console.warn('not visible');
        // return null;
    }

    const truncateTitle = (title: string, maxLength: number = 58) => {
        if (title.length <= maxLength) return title;
        return title.substring(0, maxLength) + '...';
    };


    return (
        <div
            className={cn(
                'fixed right-4 top-1/2 -translate-y-1/2 z-20 w-80',
                'pointer-events-auto'
            )}
        >
            <div className="relative h-full min-h-[400px]">
                <HoleBackground className="w-full h-[400px]">
                    {/* Floating "Patcher" label above the hole */}
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
                        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 shadow-2xl">
                            Patcher
                        </h2>
                        <Tooltip content="Issues with contributors and maintainers can be converted into patches here.">
                            {getIcon({ iconType: 'info', className: 'w-6 h-6 text-slate-600 dark:text-slate-300', fill: 'none' })}
                        </Tooltip>
                    </div>
                    <div className="absolute top-30 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center w-36 h-48 rounded-full shadow-lg overflow-hidden">
                        <DropTarget
                            id="patcher-drop"
                            accept={['patch']}
                            onDrop={handleDrop}
                            className="w-full h-full"
                            roundedClassName="rounded-full"
                            innerClassName="rounded-full"
                        />
                    </div>

                    {/* Patches list below the hole */}
                    <div className="absolute bottom-0 left-0 right-0 z-30 p-4 space-y-2 max-h-[200px] overflow-y-auto">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Patches
                        </div>
                        {patchedIssues.length === 0 ? (
                            <div className="text-sm text-slate-600 dark:text-slate-400 text-center py-4">
                                No patches yet. Drag patchable issues here.
                            </div>
                        ) : (
                            patchedIssues.map((issue) => (
                                <div
                                    key={issue._id}
                                    className="flex items-center justify-between gap-2 p-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700"
                                >
                                    <span className="text-xs text-slate-700 dark:text-slate-300 flex-1 truncate">
                                        {truncateTitle(issue.title)}
                                    </span>
                                    <Button
                                        variant="secondary"
                                        className="h-6 px-2 text-xs"
                                        onClick={() => handleCancel(issue)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </HoleBackground>
            </div>
        </div>
    );
};

interface PatcherPanelProps {
}

const PatcherPanel: React.FC<PatcherPanelProps> = ({ }) => {
    return (
        <DndProvider backend={HTML5Backend}>
            <PatcherContainer />
        </DndProvider>
    );
};

export default PatcherPanel;

