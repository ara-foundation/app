import { ISSUE_EVENT_TYPES, Issue, IssueTabKey } from '@/types/issue'
import { actions } from 'astro:actions';

/**
 * Emit issue-update event to notify components of issue changes
 */
export function emitIssueUpdate(data?: Issue): void {
    window.dispatchEvent(new CustomEvent(ISSUE_EVENT_TYPES.ISSUE_UPDATE, {
        detail: data,
    }))
}


export async function getIssues(galaxyId: string, tabType: IssueTabKey): Promise<Issue[]> {
    // Actions return serialized Issue data directly
    let fetchedIssues: Issue[] = [];

    if (tabType === IssueTabKey.SHINING) {
        const result = await actions.getShiningIssues({ galaxyId });
        fetchedIssues = result.data?.data || [];
    } else if (tabType === IssueTabKey.PUBLIC) {
        const result = await actions.getPublicBacklogIssues({ galaxyId });
        fetchedIssues = result.data?.data || [];
    } else {
        // For INTERESTING, BORING, and CLOSED tabs, pass tabKey to filter by listHistory
        const result = await actions.getIssuesByGalaxy({ galaxyId, tabKey: tabType });
        fetchedIssues = result.data?.issues || [];
    }

    return fetchedIssues;
}