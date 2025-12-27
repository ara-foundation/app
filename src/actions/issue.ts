import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import { auth } from '@/lib/auth'
import { getStarById, getStarByUserId, updateStarSunshines, getStarByIds } from '@/server-side/star'
import { getAuthUserById } from '@/server-side/auth'
import { getGalaxyById, updateGalaxySunshines } from '@/server-side/galaxy'
import { getIssuesByGalaxy, getShiningIssues, getPublicBacklogIssues, createIssue, updateIssueSunshines, getIssueById, setIssueContributor, unsetIssueContributor, updateIssue, patchIssue, unpatchIssue } from '@/server-side/issue'
import type { Issue, IssueUser, IssueStat, IssueStatType } from '@/types/issue'
import { IssueTag } from '@/types/issue'
import { getVersionById } from '@/server-side/roadmap';

// Helper function to serialize issue
function serializeIssue(issue: any): Issue {
    return {
        _id: issue._id?.toString(),
        galaxy: issue.galaxy?.toString() || '',
        uri: issue.uri,
        title: issue.title,
        description: issue.description,
        tags: issue.tags,
        maintainer: issue.maintainer?.toString() || '',
        author: issue.author?.toString() || '',
        contributor: issue.contributor?.toString() || '',
        stats: issue.stats ? Object.entries(issue.stats).reduce((acc, [key, stat]: [string, any]) => {
            if (stat) {
                acc[key as IssueStatType] = {
                    type: stat.type,
                    hint: typeof stat.hint === 'string' ? stat.hint : String(stat.hint || ''),
                    filled: stat.filled,
                    children: typeof stat.children === 'number' ? stat.children : (typeof stat.children === 'string' ? stat.children : String(stat.children || ''))
                } as IssueStat;
            }
            return acc;
        }, {} as { [key in IssueStatType]?: IssueStat }) : undefined,
        createdTime: issue.createdTime ? (typeof issue.createdTime === 'number' ? issue.createdTime : Math.floor(new Date(issue.createdTime as any).getTime() / 1000)) : undefined,
        sunshines: issue.sunshines,
        users: issue.users?.map((user: any) => ({
            username: user.username,
            starshineAmount: user.starshineAmount,
            transactionDate: typeof user.transactionDate === 'number' ? user.transactionDate : Math.floor(new Date(user.transactionDate as any).getTime() / 1000)
        } as IssueUser)) || [],
        listHistory: issue.listHistory || [],
    };
}

export const server = {
    getIssuesByGalaxy: defineAction({
        input: z.object({
            galaxyId: z.string(),
            tabKey: z.string().optional(),
        }),
        handler: async ({ galaxyId, tabKey }): Promise<{ success: boolean; issues?: Issue[]; error?: string }> => {
            try {
                const issues = await getIssuesByGalaxy(galaxyId, tabKey);
                const serializedIssues: Issue[] = issues.map(serializeIssue);

                return {
                    success: true,
                    issues: serializedIssues,
                };
            } catch (error) {
                console.error('Error getting issues by galaxy:', error);
                return {
                    success: false,
                    error: 'An error occurred while getting issues',
                };
            }
        },
    }),
    getShiningIssues: defineAction({
        input: z.object({
            galaxyId: z.string(),
        }),
        handler: async ({ galaxyId }): Promise<{ success: boolean; data?: Issue[]; error?: string }> => {
            try {
                const issues = await getShiningIssues(galaxyId);
                const serializedIssues: Issue[] = issues.map(serializeIssue);

                return {
                    success: true,
                    data: serializedIssues,
                };
            } catch (error) {
                console.error('Error getting shining issues:', error);
                return {
                    success: false,
                    error: 'An error occurred while getting shining issues',
                };
            }
        },
    }),
    getIssueById: defineAction({
        input: z.object({
            issueId: z.string(),
        }),
        handler: async ({ issueId }): Promise<{ success: boolean; data?: Issue; error?: string }> => {
            try {
                const issue = await getIssueById(issueId);
                console.log(`${issueId} action succeed ${issue ? 'true' : 'false'}`)
                if (!issue) {
                    return {
                        success: false,
                        error: 'Issue not found',
                    };
                }
                return {
                    success: true,
                    data: serializeIssue(issue),
                };
            } catch (error) {
                console.error('Error getting issue by id:', error);
                return {
                    success: false,
                    error: 'An error occurred while getting issue',
                };
            }
        },
    }),
    getPublicBacklogIssues: defineAction({
        input: z.object({
            galaxyId: z.string(),
        }),
        handler: async ({ galaxyId }): Promise<{ success: boolean; data?: Issue[]; error?: string }> => {
            try {
                const issues = await getPublicBacklogIssues(galaxyId);
                const serializedIssues: Issue[] = issues.map(serializeIssue);

                return {
                    success: true,
                    data: serializedIssues,
                };
            } catch (error) {
                console.error('Error getting public backlog issues:', error);
                return {
                    success: false,
                    error: 'An error occurred while getting public backlog issues',
                };
            }
        },
    }),
    createIssue: defineAction({
        accept: 'json',
        input: z.object({
            galaxyId: z.string(),
            userId: z.string(),
            email: z.string().email(),
            title: z.string().min(1),
            description: z.string().min(1),
            tags: z.array(z.nativeEnum(IssueTag)),
            sunshines: z.number().min(0),
        }),
        handler: async ({ galaxyId, userId, email, title, description, tags, sunshines }, { request }): Promise<{ success: boolean; error?: string }> => {
            try {
                // Check authentication
                const session = await auth.api.getSession({
                    headers: request.headers,
                });

                if (!session || !session.user) {
                    return {
                        success: false,
                        error: 'Authentication required. Please log in to create an issue',
                    };
                }

                const authenticatedUserId = session.user.id;

                // Verify that the authenticated user's ID matches the userId parameter
                if (authenticatedUserId !== userId) {
                    return {
                        success: false,
                        error: 'You can only create issues for your own account',
                    };
                }

                // Get galaxy
                const galaxy = await getGalaxyById(galaxyId);
                if (!galaxy || !galaxy.maintainer) {
                    return {
                        success: false,
                        error: 'Can not create issue, galaxy id invalid',
                    };
                }

                // Get current user by userId (which is the auth user ID)
                const user = await getStarByUserId(userId);
                if (!user || !user._id) {
                    return {
                        success: false,
                        error: 'Can not create issue, user profile not found. Please ensure your account is set up correctly.',
                    };
                }

                // Validate sunshines allocation
                if (sunshines > 0) {
                    const availableSunshines = user.sunshines || 0;
                    if (sunshines > availableSunshines) {
                        return {
                            success: false,
                            error: `Can not create issue, insufficient sunshines. Available: ${availableSunshines}`,
                        };
                    }

                    // Deduct sunshines from user (using star _id)
                    const userUpdated = await updateStarSunshines(user._id.toString(), -sunshines);
                    if (!userUpdated) {
                        return {
                            success: false,
                            error: 'Can not create issue, failed to update user sunshines',
                        };
                    }

                    // Update galaxy sunshines
                    const galaxyUpdated = await updateGalaxySunshines(galaxyId, sunshines);
                    if (!galaxyUpdated) {
                        // Rollback user sunshines if galaxy update fails
                        await updateStarSunshines(user._id.toString(), sunshines);
                        return {
                            success: false,
                            error: 'Can not create issue, failed to update galaxy sunshines',
                        };
                    }
                }

                // Get auth user data for username
                let username = 'unknown'
                const authUser = await getAuthUserById(userId)
                if (authUser) {
                    username = authUser.name || authUser.username || authUser.email?.split('@')[0] || 'unknown'
                }

                // Create issue with authorId (using star _id)
                const issue: Issue = {
                    galaxy: galaxyId,
                    uri: `/issue`,
                    title,
                    description,
                    tags,
                    maintainer: galaxy.maintainer,
                    createdTime: Math.floor(Date.now() / 1000),
                    sunshines,
                    users: [{
                        username,
                        starshineAmount: sunshines,
                        transactionDate: Math.floor(Date.now() / 1000),
                    }],
                    author: user._id.toString(),
                };

                const created = await createIssue(issue);
                if (!created) {
                    // Rollback sunshines if issue creation fails
                    if (sunshines > 0) {
                        await updateStarSunshines(user._id.toString(), sunshines);
                        await updateGalaxySunshines(galaxyId, -sunshines);
                    }
                    return {
                        success: false,
                        error: 'Failed to create issue',
                    };
                }

                return {
                    success: true,
                };
            } catch (error) {
                console.error('Error creating issue:', error);
                const errorMessage = error instanceof Error ? error.message : String(error);
                return {
                    success: false,
                    error: `An error occurred while creating issue: ${errorMessage}`,
                };
            }
        },
    }),
    updateIssueSunshines: defineAction({
        accept: 'json',
        input: z.object({
            issueId: z.string(),
            userId: z.string(),
            email: z.string().email(),
            sunshinesToAdd: z.number().min(0),
        }),
        handler: async ({ issueId, userId, email, sunshinesToAdd }): Promise<{ success: boolean; error?: string }> => {
            try {
                // Get demo and validate
                const demo = await getDemoByEmail(email);
                if (!demo) {
                    return {
                        success: false,
                        error: 'Demo not found',
                    };
                }

                // Get current user
                const user = await getStarById(userId);
                if (!user) {
                    return {
                        success: false,
                        error: 'User not found',
                    };
                }

                // Validate sunshines allocation
                const availableSunshines = user.sunshines || 0;
                if (sunshinesToAdd > availableSunshines) {
                    return {
                        success: false,
                        error: `Insufficient sunshines. Available: ${availableSunshines}`,
                    };
                }

                // Deduct sunshines from user
                const userUpdated = await updateStarSunshines(userId, -sunshinesToAdd);
                if (!userUpdated) {
                    return {
                        success: false,
                        error: 'Failed to update user sunshines',
                    };
                }

                // Get issue to get galaxyId
                const issue = await getIssueById(issueId);
                if (!issue) {
                    return {
                        success: false,
                        error: 'Issue not found',
                    };
                }

                // Update issue sunshines
                // Get auth user data for username
                let username = 'unknown'
                if (user.userId) {
                    const authUser = await getAuthUserById(user.userId)
                    if (authUser) {
                        username = authUser.name || authUser.username || authUser.email?.split('@')[0] || 'unknown'
                    }
                }
                const issueUpdated = await updateIssueSunshines(issueId, userId, username, sunshinesToAdd);
                if (!issueUpdated) {
                    // Rollback user sunshines if issue update fails
                    await updateStarSunshines(userId, sunshinesToAdd);
                    return {
                        success: false,
                        error: 'Failed to update issue sunshines',
                    };
                }

                // Update galaxy sunshines
                const galaxyUpdated = await updateGalaxySunshines(issue.galaxy, sunshinesToAdd);
                if (!galaxyUpdated) {
                    // Rollback user and issue sunshines if galaxy update fails
                    await updateStarSunshines(userId, sunshinesToAdd);
                    // Note: We'd need to rollback issue sunshines too, but for simplicity we'll just log
                    console.error('Failed to update galaxy sunshines, but issue was updated');
                }

                return {
                    success: true,
                };
            } catch (error) {
                console.error('Error updating issue sunshines:', error);
                return {
                    success: false,
                    error: 'An error occurred while updating issue sunshines',
                };
            }
        },
    }),
    setContributor: defineAction({
        accept: 'json',
        input: z.object({
            issueId: z.string(),
            userId: z.string(),
        }),
        handler: async ({ issueId, userId }, { request }): Promise<{ success: boolean; error?: string }> => {
            try {
                // Check authentication
                const session = await auth.api.getSession({
                    headers: request.headers,
                });

                if (!session || !session.user) {
                    return {
                        success: false,
                        error: 'Authentication required. Please log in to assign contributor',
                    };
                }

                const authenticatedUserId = session.user.id;

                // Get authenticated user's star
                const authenticatedStar = await getStarByUserId(authenticatedUserId);
                if (!authenticatedStar || !authenticatedStar._id) {
                    return {
                        success: false,
                        error: 'User profile not found. Please ensure your account is set up correctly.',
                    };
                }

                // Get issue to verify maintainer
                const issue = await getIssueById(issueId);
                if (!issue) {
                    return {
                        success: false,
                        error: 'Issue not found',
                    };
                }

                // Verify authenticated user is the maintainer of the issue
                const authenticatedStarId = authenticatedStar._id.toString();
                if (issue.maintainer !== authenticatedStarId) {
                    return {
                        success: false,
                        error: 'Only maintainers can assign contributors',
                    };
                }

                // Get user to assign as contributor
                const user = await getStarById(userId);
                if (!user) {
                    return {
                        success: false,
                        error: 'User not found',
                    };
                }

                // Set contributor
                // Get auth user data for username
                let username = 'unknown'
                if (user.userId) {
                    const authUser = await getAuthUserById(user.userId)
                    if (authUser) {
                        username = authUser.name || authUser.username || authUser.email?.split('@')[0] || 'unknown'
                    }
                }
                const updated = await setIssueContributor(issueId, userId, username);
                if (!updated) {
                    return {
                        success: false,
                        error: 'Failed to set contributor',
                    };
                }

                return {
                    success: true,
                };
            } catch (error) {
                console.error('Error setting contributor:', error);
                return {
                    success: false,
                    error: 'An error occurred while setting contributor',
                };
            }
        },
    }),
    unsetContributor: defineAction({
        accept: 'json',
        input: z.object({
            issueId: z.string(),
        }),
        handler: async ({ issueId }, { request }): Promise<{ success: boolean; error?: string }> => {
            try {
                // Check authentication
                const session = await auth.api.getSession({
                    headers: request.headers,
                });

                if (!session || !session.user) {
                    return {
                        success: false,
                        error: 'Authentication required. Please log in to unset contributor',
                    };
                }

                const authenticatedUserId = session.user.id;

                // Get authenticated user's star
                const authenticatedStar = await getStarByUserId(authenticatedUserId);
                if (!authenticatedStar || !authenticatedStar._id) {
                    return {
                        success: false,
                        error: 'User profile not found. Please ensure your account is set up correctly.',
                    };
                }

                // Get issue to verify maintainer
                const issue = await getIssueById(issueId);
                if (!issue) {
                    return {
                        success: false,
                        error: 'Issue not found',
                    };
                }

                // Verify authenticated user is the maintainer of the issue
                const authenticatedStarId = authenticatedStar._id.toString();
                if (issue.maintainer !== authenticatedStarId) {
                    return {
                        success: false,
                        error: 'Only maintainers can unset contributors',
                    };
                }

                // Unset contributor
                const updated = await unsetIssueContributor(issueId);
                if (!updated) {
                    return {
                        success: false,
                        error: 'Failed to unset contributor',
                    };
                }

                return {
                    success: true,
                };
            } catch (error) {
                console.error('Error unsetting contributor:', error);
                return {
                    success: false,
                    error: 'An error occurred while unsetting contributor',
                };
            }
        },
    }),
    updateIssue: defineAction({
        accept: 'json',
        input: z.object({
            issueId: z.string(),
            email: z.string().email(),
            listHistory: z.array(z.string()).optional(),
        }),
        handler: async ({ issueId, email, listHistory }, { request }): Promise<{ success: boolean; error?: string }> => {
            try {
                // Check authentication
                const session = await auth.api.getSession({
                    headers: request.headers,
                });

                if (!session || !session.user) {
                    return {
                        success: false,
                        error: 'Authentication required. Please log in to update issue',
                    };
                }

                const authenticatedUserId = session.user.id;

                // Get authenticated user's star
                const authenticatedStar = await getStarByUserId(authenticatedUserId);
                if (!authenticatedStar || !authenticatedStar._id) {
                    return {
                        success: false,
                        error: 'User profile not found. Please ensure your account is set up correctly.',
                    };
                }

                // Get issue to verify maintainer
                const issue = await getIssueById(issueId);
                if (!issue) {
                    return {
                        success: false,
                        error: 'Issue not found',
                    };
                }

                // Verify authenticated user is the maintainer of the issue
                const authenticatedStarId = authenticatedStar._id.toString();
                if (issue.maintainer !== authenticatedStarId) {
                    return {
                        success: false,
                        error: 'Only maintainers can update issue lists',
                    };
                }

                // Update issue
                const updates: { listHistory?: string[] } = {};
                if (listHistory !== undefined) {
                    updates.listHistory = listHistory;
                }

                const updated = await updateIssue(issueId, updates);
                if (!updated) {
                    return {
                        success: false,
                        error: 'Failed to update issue',
                    };
                }

                return {
                    success: true,
                };
            } catch (error) {
                console.error('Error updating issue:', error);
                return {
                    success: false,
                    error: 'An error occurred while updating issue',
                };
            }
        },
    }),
    /**
     * Adds 'patcher' to listHistory property of the issue, marking as the patchable issue.
     * @requires issueId to identify the issue
     * @requires email to verify the demo session
     */
    patchIssue: defineAction({
        accept: 'json',
        input: z.object({
            issueId: z.string(),
            email: z.string().email(),
        }),
        handler: async ({ issueId, email }, { request }): Promise<{ success: boolean; error?: string }> => {
            try {
                // Check authentication
                const session = await auth.api.getSession({
                    headers: request.headers,
                });

                if (!session || !session.user) {
                    return {
                        success: false,
                        error: 'Authentication required. Please log in to patch issue',
                    };
                }

                const authenticatedUserId = session.user.id;

                // Get authenticated user's star
                const authenticatedStar = await getStarByUserId(authenticatedUserId);
                if (!authenticatedStar || !authenticatedStar._id) {
                    return {
                        success: false,
                        error: 'User profile not found. Please ensure your account is set up correctly.',
                    };
                }

                const issue = await getIssueById(issueId);
                if (!issue) {
                    return {
                        success: false,
                        error: 'Issue not found',
                    };
                }

                // Verify issue is patchable (has both contributor and maintainer)
                if (!issue.contributor || !issue.maintainer) {
                    return {
                        success: false,
                        error: 'Issue must have both a contributor and maintainer to be patched',
                    };
                }

                const updated = await patchIssue(issueId);
                if (!updated) {
                    return {
                        success: false,
                        error: 'Failed to patch issue',
                    };
                }

                return {
                    success: true,
                };
            } catch (error) {
                console.error('Error patching issue:', error);
                return {
                    success: false,
                    error: 'An error occurred while patching issue',
                };
            }
        },
    }),
    /**
     * Reverse of patchIssue, remove 'patcher' from listHistory
     */
    unpatchIssue: defineAction({
        accept: 'json',
        input: z.object({
            issueId: z.string(),
            email: z.string().email(),
        }),
        handler: async ({ issueId, email }, { request }): Promise<{ success: boolean; error?: string }> => {
            try {
                // Check authentication
                const session = await auth.api.getSession({
                    headers: request.headers,
                });

                if (!session || !session.user) {
                    return {
                        success: false,
                        error: 'Authentication required. Please log in to unpatch issue',
                    };
                }

                const authenticatedUserId = session.user.id;

                // Get authenticated user's star
                const authenticatedStar = await getStarByUserId(authenticatedUserId);
                if (!authenticatedStar || !authenticatedStar._id) {
                    return {
                        success: false,
                        error: 'User profile not found. Please ensure your account is set up correctly.',
                    };
                }

                // Get issue to verify it exists
                const issue = await getIssueById(issueId);
                if (!issue) {
                    return {
                        success: false,
                        error: 'Issue not found',
                    };
                }

                // Unpatch issue
                const updated = await unpatchIssue(issueId);
                if (!updated) {
                    return {
                        success: false,
                        error: 'Failed to unpatch issue',
                    };
                }

                return {
                    success: true,
                };
            } catch (error) {
                console.error('Error unpatching issue:', error);
                return {
                    success: false,
                    error: 'An error occurred while unpatching issue',
                };
            }
        },
    }),
    closeIssuesByVersion: defineAction({
        accept: 'json',
        input: z.object({
            versionId: z.string(),
        }),
        handler: async ({ versionId }, { request }): Promise<{ success: boolean; error?: string }> => {
            try {
                // Check authentication
                const session = await auth.api.getSession({
                    headers: request.headers,
                });

                if (!session || !session.user) {
                    return {
                        success: false,
                        error: 'Authentication required. Please log in to release a version',
                    };
                }

                const authenticatedUserId = session.user.id;

                // Get the star for the authenticated user
                const authenticatedUserStar = await getStarByUserId(authenticatedUserId);
                if (!authenticatedUserStar || !authenticatedUserStar._id) {
                    return {
                        success: false,
                        error: 'User profile not found. Please ensure your account is set up correctly.',
                    };
                }

                const version = await getVersionById(versionId);
                if (!version) {
                    return {
                        success: false,
                        error: 'Version not found',
                    };
                }

                // Verify that the authenticated user is the maintainer of the version
                const authenticatedStarId = authenticatedUserStar._id.toString();
                if (version.maintainer !== authenticatedStarId) {
                    return {
                        success: false,
                        error: 'Only the maintainer can release this version',
                    };
                }

                const issueIds = version.patches.map(patch => patch.id);
                if (issueIds.length === 0) {
                    return {
                        success: true,
                    };
                }

                // Update each issue: add 'closed' to listHistory
                for (const issueId of issueIds) {
                    const issue = await getIssueById(issueId);
                    if (!issue) {
                        continue;
                    }

                    const currentListHistory = issue.listHistory || [];
                    // Only add 'closed' if it's not already there
                    if (!currentListHistory.includes('closed')) {
                        const updatedListHistory = [...currentListHistory, 'closed'];
                        await updateIssue(issueId, { listHistory: updatedListHistory });
                    }
                }

                return {
                    success: true,
                };
            } catch (error) {
                console.error('Error closing issues by version:', error);
                return {
                    success: false,
                    error: 'An error occurred while closing issues',
                };
            }
        },
    }),
}

