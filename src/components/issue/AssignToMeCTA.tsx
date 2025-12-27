import React, { useState, useEffect } from 'react';
import Button from '@/components/custom-ui/Button';
import Tooltip from '@/components/custom-ui/Tooltip';
import AuthStar from '@/components/auth/AuthStar';
import LoginRequireForPanel from '@/components/auth/login-require-for-panel';
import { authClient, getAuthUserById } from '@/client-side/auth';
import { getStarById, getStarByUserId } from '@/client-side/star';
import { getIssueById, setContributor, unsetContributor } from '@/client-side/issue';
import { cn } from '@/lib/utils';
import { ISSUE_EVENT_TYPES } from '@/types/issue';
import type { Star } from '@/types/star';
import type { Issue } from '@/types/issue';
import type { AuthUser } from '@/types/auth';

interface AssignToMeCTAProps {
    issueId: string;
}

const AssignToMeCTA: React.FC<AssignToMeCTAProps> = ({ issueId }) => {
    const { data: session, isPending } = authClient.useSession();
    const [isMaintainer, setIsMaintainer] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<Star | null>(null);
    const [issue, setIssue] = useState<Issue | null>(null);
    const [contributorUser, setContributorUser] = useState<Star | null>(null);
    const [contributorAuthUser, setContributorAuthUser] = useState<AuthUser | null>(null);
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
            if (isPending) {
                return;
            }

            const user = session?.user as AuthUser | undefined;
            if (user?.id && issue) {
                const userData = await getStarByUserId(user.id);
                if (userData && userData._id) {
                    setCurrentUser(userData);
                    // Check if user's star ID matches the issue's maintainer
                    const userStarId = userData._id.toString();
                    setIsMaintainer(issue.maintainer === userStarId);
                } else {
                    setCurrentUser(null);
                    setIsMaintainer(false);
                }
            } else {
                setCurrentUser(null);
                setIsMaintainer(false);
            }
        };

        checkUserRole();
    }, [session, isPending, issue]);

    // Fetch contributor user when issue.contributor changes
    useEffect(() => {
        if (issue?.contributor && typeof issue.contributor === 'string') {
            setIsLoadingContributor(true);
            getStarById(issue.contributor)
                .then(async (userData) => {
                    if (userData) {
                        setContributorUser(userData);
                        // Fetch auth user for image/nickname
                        if (userData.userId) {
                            const authUser = await getAuthUserById(userData.userId);
                            if (authUser) {
                                setContributorAuthUser(authUser);
                            }
                        }
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
            setContributorAuthUser(null);
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
        const user = session?.user as AuthUser | undefined;
        if (!user?.id) {
            alert('Please log in to assign contributor');
            return;
        }

        if (!currentUser || !currentUser._id) {
            alert('User not found');
            return;
        }

        setIsLoading(true);
        try {
            const success = await setContributor({
                issueId,
                userId: currentUser._id.toString(),
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
        const user = session?.user as AuthUser | undefined;
        if (!user?.id) {
            alert('Please log in to unset contributor');
            return;
        }

        setIsLoading(true);
        try {
            const success = await unsetContributor({
                issueId,
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
        <LoginRequireForPanel>
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
                            <AuthStar
                                src={contributorAuthUser?.image}
                                nickname={contributorAuthUser?.name || contributorAuthUser?.username || contributorAuthUser?.email?.split('@')[0] || 'Unknown'}
                                star={contributorUser}
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
        </LoginRequireForPanel>
    );
};

export default AssignToMeCTA;

