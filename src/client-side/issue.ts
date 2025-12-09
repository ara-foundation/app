import { ISSUE_EVENT_TYPES, Issue, IssueTabKey, IssueTag } from '@/types/issue'
import { actions } from 'astro:actions';

/**
 * Emit issue-update event to notify components of issue changes
 */
export function emitIssueUpdate(data?: Issue): void {
    window.dispatchEvent(new CustomEvent(ISSUE_EVENT_TYPES.ISSUE_UPDATE, {
        detail: data,
    }))
}

/**
 * Emit issue-created event
 */
function emitIssueCreated(data?: Issue): void {
    window.dispatchEvent(new CustomEvent(ISSUE_EVENT_TYPES.ISSUE_CREATED, {
        detail: data,
    }))
}

/**
 * Emit issue-unpatched event
 */
function emitIssueUnpatched(): void {
    window.dispatchEvent(new CustomEvent(ISSUE_EVENT_TYPES.ISSUE_UNPATCHED))
}

/**
 * Get issues by galaxy and tab type
 */
export async function getIssues(galaxyId: string, tabType?: IssueTabKey): Promise<Issue[]> {
    let fetchedIssues: Issue[] = [];

    if (tabType === IssueTabKey.SHINING) {
        const result = await actions.getShiningIssues({ galaxyId });
        fetchedIssues = result.data?.data || [];
    } else if (tabType === IssueTabKey.PUBLIC) {
        const result = await actions.getPublicBacklogIssues({ galaxyId });
        fetchedIssues = result.data?.data || [];
    } else {
        const result = await actions.getIssuesByGalaxy({ galaxyId, tabKey: tabType });
        fetchedIssues = result.data?.issues || [];
    }

    return fetchedIssues;
}

/**
 * Get issue by ID (read-only, no event)
 */
export async function getIssueById(issueId: string): Promise<Issue | null> {
    try {
        const result = await actions.getIssueById({ issueId });
        if (result.data?.success && result.data.data) {
            return result.data.data;
        }
        return null;
    } catch (error) {
        console.error('Error getting issue by id:', error);
        return null;
    }
}

/**
 * Create issue and broadcast ISSUE_CREATED event
 */
export async function createIssue(params: {
    galaxyId: string;
    userId: string;
    email: string;
    title: string;
    description: string;
    tags: IssueTag[];
    sunshines: number;
}): Promise<Issue | null> {
    try {
        const result = await actions.createIssue(params);
        if (result.data?.success) {
            // Fetch the created issue to get its ID
            // We need to find it by querying issues
            const issues = await getIssues(params.galaxyId, IssueTabKey.SHINING);
            const createdIssue = issues.find(issue =>
                issue.title === params.title &&
                issue.author === params.userId
            ) || issues[issues.length - 1]; // Fallback to last issue if not found

            if (createdIssue) {
                emitIssueCreated(createdIssue);
                return createdIssue;
            }
        }
        return null;
    } catch (error) {
        console.error('Error creating issue:', error);
        return null;
    }
}

/**
 * Update issue and broadcast ISSUE_UPDATE event
 */
export async function updateIssue(params: {
    issueId: string;
    email: string;
    listHistory?: string[];
}): Promise<boolean> {
    try {
        const result = await actions.updateIssue(params);
        if (result.data?.success) {
            // Fetch the updated issue
            const updatedIssue = await getIssueById(params.issueId);
            if (updatedIssue) {
                emitIssueUpdate(updatedIssue);
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating issue:', error);
        return false;
    }
}

/**
 * Patch issue and broadcast ISSUE_UPDATE event
 */
export async function patchIssue(params: {
    issueId: string;
    email: string;
}): Promise<boolean> {
    try {
        const result = await actions.patchIssue(params);
        if (result.data?.success) {
            // Fetch the updated issue
            const updatedIssue = await getIssueById(params.issueId);
            if (updatedIssue) {
                emitIssueUpdate(updatedIssue);
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error patching issue:', error);
        return false;
    }
}

/**
 * Unpatch issue and broadcast ISSUE_UNPATCHED event
 */
export async function unpatchIssue(params: {
    issueId: string;
    email: string;
}): Promise<boolean> {
    try {
        const result = await actions.unpatchIssue(params);
        if (result.data?.success) {
            emitIssueUnpatched();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error unpatching issue:', error);
        return false;
    }
}

/**
 * Update issue sunshines and broadcast ISSUE_UPDATE event
 */
export async function updateIssueSunshines(params: {
    issueId: string;
    userId: string;
    email: string;
    sunshinesToAdd: number;
}): Promise<boolean> {
    try {
        const result = await actions.updateIssueSunshines(params);
        if (result.data?.success) {
            // Fetch the updated issue
            const updatedIssue = await getIssueById(params.issueId);
            if (updatedIssue) {
                emitIssueUpdate(updatedIssue);
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating issue sunshines:', error);
        return false;
    }
}

/**
 * Set contributor and broadcast ISSUE_UPDATE event
 */
export async function setContributor(params: {
    issueId: string;
    userId: string;
    email: string;
}): Promise<boolean> {
    try {
        const result = await actions.setContributor(params);
        if (result.data?.success) {
            // Fetch the updated issue
            const updatedIssue = await getIssueById(params.issueId);
            if (updatedIssue) {
                emitIssueUpdate(updatedIssue);
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error setting contributor:', error);
        return false;
    }
}

/**
 * Unset contributor and broadcast ISSUE_UPDATE event
 */
export async function unsetContributor(params: {
    issueId: string;
    email: string;
}): Promise<boolean> {
    try {
        const result = await actions.unsetContributor(params);
        if (result.data?.success) {
            // Fetch the updated issue
            const updatedIssue = await getIssueById(params.issueId);
            if (updatedIssue) {
                emitIssueUpdate(updatedIssue);
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error unsetting contributor:', error);
        return false;
    }
}

