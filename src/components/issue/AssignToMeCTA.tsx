import React, { useState, useEffect } from 'react';
import Button from '@/components/custom-ui/Button';
import Tooltip from '@/components/custom-ui/Tooltip';
import MenuAvatar from '@/components/MenuAvatar';
import DemoAuthPanel from '@/components/demo/DemoAuthPanel';
import { getDemo } from '@/client-side/demo';
import { getStarById } from '@/client-side/star';
import { getIssueById, setContributor, unsetContributor } from '@/client-side/issue';
import { cn } from '@/lib/utils';
import { ISSUE_EVENT_TYPES } from '@/types/issue';
import type { Star } from '@/types/star';
import type { Issue } from '@/types/issue';

interface AssignToMeCTAProps {
    issueId: string;
}

const AssignToMeCTA: React.FC<AssignToMeCTAProps> = ({ issueId }) => {
    const [isMaintainer, setIsMaintainer] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [issue, setIssue] = useState<Issue | null>(null);
    const [contributorUser, setContributorUser] = useState<User | null>(null);
    const [isLoadingContributor, setIsLoadingContributor] = useState(false);

    // Fetch issue data
    useEffect(() => {
        const fetchIssue = async () => {
            const issueData = await getIssueById(issueId);
            if (issueData) {
                setIssue(issueData);
            }
        };
        fetchIssue();
    }, [issueId]);

    // Check if current user is maintainer
    useEffect(() => {
        const checkUserRole = async () => {
            const demo = getDemo();
            if (demo.email && demo.users && demo.role) {
                const user = demo.users.find(u => u.role === demo.role) || demo.users[0];
                if (user && user._id) {
                    const userData = await getStarById(user._id.toString());
                    if (userData) {
                        setCurrentUser(userData);
                        setIsMaintainer(userData.role === 'maintainer');
                    }
                }
            }
        };

        checkUserRole();
    }, []);

    // Fetch contributor user when issue.contributor changes
    useEffect(() => {
        if (issue?.contributor && typeof issue.contributor === 'string') {
            setIsLoadingContributor(true);
            getStarById(issue.contributor)
                .then((userData) => {
                    if (userData) {
                        setContributorUser(userData);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching contributor:', error);
                })
                .finally(() => {
                    setIsLoadingContributor(false);
                });
        } else {
            setContributorUser(null);
        }
    }, [issue?.contributor]);

    // Listen for issue-update events
    useEffect(() => {
        const handleIssueUpdate = (event: Event) => {
            const customEvent = event as CustomEvent<Issue>;
            if (customEvent.detail && customEvent.detail._id === issueId) {
                setIssue(customEvent.detail);
            }
        };

        window.addEventListener(ISSUE_EVENT_TYPES.ISSUE_UPDATE, handleIssueUpdate);
        return () => {
            window.removeEventListener(ISSUE_EVENT_TYPES.ISSUE_UPDATE, handleIssueUpdate);
        };
    }, [issueId]);

    const handleAssign = async () => {
        if (!currentUser || !currentUser._id) {
            alert('User not found');
            return;
        }

        const demo = getDemo();
        if (!demo.email) {
            alert('Please log in to assign contributor');
            return;
        }

        setIsLoading(true);
        try {
            const success = await setContributor({
                issueId,
                userId: currentUser._id.toString(),
                email: demo.email,
            });

            if (!success) {
                alert('Failed to assign contributor');
            }
        } catch (error) {
            console.error('Error assigning contributor:', error);
            alert('An error occurred while assigning contributor');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnsetContributor = async () => {
        const demo = getDemo();
        if (!demo.email) {
            alert('Please log in to unset contributor');
            return;
        }

        setIsLoading(true);
        try {
            const success = await unsetContributor({
                issueId,
                email: demo.email,
            });

            if (!success) {
                alert('Failed to unset contributor');
            }
        } catch (error) {
            console.error('Error unsetting contributor:', error);
            alert('An error occurred while unsetting contributor');
        } finally {
            setIsLoading(false);
        }
    };

    // Only show if user is maintainer
    if (!isMaintainer) {
        return null;
    }

    return (
        <DemoAuthPanel>
            <div className={cn(
                "fixed bottom-4 right-1/2 translate-x-1/2 z-40",
                "backdrop-blur-md bg-white/90 dark:bg-slate-900/90",
                "border border-slate-200/50 dark:border-slate-700/50",
                "rounded-lg shadow-lg",
                "transition-all duration-300",
                "hover:shadow-xl hover:scale-105"
            )}>
                {contributorUser ? (
                    <div className="flex items-center gap-2 px-4 py-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Contributor</span>
                        {isLoadingContributor ? (
                            <span className="text-xs text-gray-400">Loading...</span>
                        ) : (
                            <MenuAvatar
                                src={contributorUser.src}
                                className='w-6! h-6!'
                            />
                        )}
                        <Tooltip
                            openDelay={500}
                            content={
                                <div className="text-sm">
                                    Cancel the contributor
                                </div>
                            }
                        >
                            <button
                                onClick={handleUnsetContributor}
                                disabled={isLoading}
                                className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                                aria-label="Cancel the contributor"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </Tooltip>
                    </div>
                ) : (
                    <Button
                        variant="primary"
                        outline={true}
                        size="lg"
                        onClick={handleAssign}
                        disabled={isLoading}
                        className="px-6 py-3 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{isLoading ? 'Assigning...' : 'Assign To Me'}</span>
                    </Button>
                )}
            </div>
        </DemoAuthPanel>
    );
};

export default AssignToMeCTA;

