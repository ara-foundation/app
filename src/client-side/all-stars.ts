import { actions } from 'astro:actions';
import type { AllStarStats, SolarForgeByIssueResult, SolarForgeByVersionResult, UserStar } from '@/types/all-stars';
import { ISSUE_EVENT_TYPES } from '@/types/issue';
import { USER_EVENT_TYPES } from '@/types/user';
import { getIssueById } from './issue';
import { getUserById } from './user';

/**
 * Get all star stats (read-only, no event)
 */
export async function getAllStarStats(): Promise<AllStarStats> {
    try {
        const result = await actions.allStarStats({});
        if (result.data) {
            return result.data;
        }
        // Return default values on error
        return {
            totalGalaxies: 0,
            totalStars: 0,
            totalUsers: 0,
            totalSunshines: 0,
        };
    } catch (error) {
        console.error('Error getting all star stats:', error);
        // Return default values on error
        return {
            totalGalaxies: 0,
            totalStars: 0,
            totalUsers: 0,
            totalSunshines: 0,
        };
    }
}

export async function getGalaxySpace(galaxyId: string): Promise<UserStar[]> {
    try {
        const result = await actions.getGalaxySpace({ galaxyId });
        return result.data?.space || [];
    } catch (error) {
        console.error('Error getting galaxy space:', error);
        return [];
    }
}

export async function getUserStar(galaxyId: string, userId: string): Promise<UserStar | null> {
    try {
        const result = await actions.getUserStar({ galaxyId, userId });
        if (result.data && 'userStar' in result.data) {
            return result.data.userStar as UserStar | null;
        }
        return null;
    } catch (error) {
        console.error('Error getting user star:', error);
        return null;
    }
}

export async function updateUserStarPosition(params: { galaxyId: string; userId: string; x: number; y: number }): Promise<boolean> {
    try {
        const result = await actions.updateUserStarPosition(params);
        return Boolean(result.data?.success);
    } catch (error) {
        console.error('Error updating user star position:', error);
        return false;
    }
}

// /**
//  * Solar forge by issue: convert sunshines to stars and distribute to stakeholders
//  */
// export async function solarForgeByIssue(issueId: string): Promise<SolarForgeByIssueResult> {
//     try {
//         const result = await actions.solarForgeByIssue({ issueId });

//         if (!result.data) {
//             return {
//                 users: [],
//                 solarForgeId: '',
//                 error: result.error?.message || 'An error occurred while solar forging issue',
//             };
//         }

//         // Broadcast ISSUE_UPDATE event with updated issue
//         if (!result.data.error || result.data.error === 'duplicate') {
//             const issue = await getIssueById(issueId);
//             if (issue) {
//                 window.dispatchEvent(new CustomEvent(ISSUE_EVENT_TYPES.ISSUE_UPDATE, {
//                     detail: issue,
//                 }));
//             }
//         }

//         // Broadcast USER_UPDATE events for each updated user
//         if (result.data.users && result.data.users.length > 0) {
//             for (const solarUser of result.data.users) {
//                 const user = await getUserById(solarUser.id);
//                 if (user) {
//                     window.dispatchEvent(new CustomEvent(USER_EVENT_TYPES.USER_UPDATE, {
//                         detail: { user },
//                     }));
//                 }
//             }
//         }

//         return result.data;
//     } catch (error) {
//         console.error('Error in solarForgeByIssue:', error);
//         return {
//             users: [],
//             solarForgeId: '',
//             error: 'An error occurred while solar forging issue',
//         };
//     }
// }

/**
 * Solar forge by version: process all issues in a version and aggregate results
 */
export async function solarForgeByVersion(versionId: string): Promise<SolarForgeByVersionResult> {
    try {
        const result = await actions.solarForgeByVersion({ versionId });
        if (result.data) {
            return result.data;
        }
        return {
            users: [],
            totalIssues: 0,
            totalSunshines: 0,
            totalStars: 0,
        };
    } catch (error) {
        console.error('Error in solarForgeByVersion:', error);
        return {
            users: [],
            totalIssues: 0,
            totalSunshines: 0,
            totalStars: 0,
        };
    }
}

