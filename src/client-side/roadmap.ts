import { actions } from 'astro:actions';
import type { Version, Patch, VersionReleasedEventDetail } from '@/types/roadmap';
import { ROADMAP_EVENT_TYPES } from '@/types/roadmap';
import { PATCH_EVENT_TYPES } from '@/types/patch';
import { getDemo, incrementDemoStep } from './demo';

/**
 * Get versions by galaxy ID (read-only, no event)
 */
export async function getVersions(galaxyId: string): Promise<Version[]> {
    try {
        const result = await actions.getVersionsByGalaxy({ galaxyId });
        return result.data?.versions || [];
    } catch (error) {
        console.error('Error fetching versions:', error);
        return [];
    }
}

/**
 * Get version by ID (read-only, no event)
 */
export async function getVersionById(versionId: string): Promise<Version | null> {
    try {
        const result = await actions.getVersionById({ versionId });
        if (result.data?.success && result.data.version) {
            return result.data.version;
        }
        return null;
    } catch (error) {
        console.error('Error fetching version:', error);
        return null;
    }
}

/**
 * Create version and broadcast version created event
 */
export async function createVersion(params: {
    galaxyId: string;
    tag: string;
    email: string;
}): Promise<Version | null> {
    try {
        const result = await actions.createVersion(params);
        if (result.data?.success && result.data.version) {
            // Broadcast version created event (if needed in the future)
            // Step 3: Create Version
            await incrementDemoStep({ email: params.email, expectedStep: 3 });
            return result.data.version;
        }
        return null;
    } catch (error) {
        console.error('Error creating version:', error);
        return null;
    }
}

/**
 * Update version status and broadcast version status change event
 */
export async function updateVersionStatus(params: {
    versionId: string;
    status: 'complete' | 'testing' | 'release' | 'archived';
}): Promise<boolean> {
    try {
        const result = await actions.updateVersionStatus(params);
        if (result.data?.success) {
            // Broadcast version status change event (if needed in the future)
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating version status:', error);
        return false;
    }
}

/**
 * Update patches and broadcast PATCH_UPDATE or PATCH_CREATED event
 */
export async function updatePatches(versionId: string, patches: Patch[]): Promise<boolean> {
    try {
        const result = await actions.updatePatches({ versionId, patches });
        if (result.data?.success) {
            // Broadcast patch update event
            // Note: The component calling this should determine which specific event to emit
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating patches:', error);
        return false;
    }
}

/**
 * Remove patch and broadcast PATCH_REMOVED event
 */
export async function removePatch(params: {
    patchId: string;
    versionId: string;
}): Promise<boolean> {
    try {
        const result = await actions.removePatch(params);
        if (result.data?.success) {
            // Broadcast PATCH_REMOVED event
            window.dispatchEvent(new CustomEvent(PATCH_EVENT_TYPES.PATCH_REMOVED, {
                detail: {
                    patchId: params.patchId,
                    versionId: params.versionId,
                },
            }));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error removing patch:', error);
        return false;
    }
}

/**
 * Complete patch and broadcast patch update event
 */
export async function completePatch(params: {
    versionId: string;
    patchId: string;
    complete: boolean;
}): Promise<boolean> {
    try {
        const result = await actions.completePatch(params);
        if (result.data?.success) {
            // Broadcast patch update event
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error completing patch:', error);
        return false;
    }
}

/**
 * Test patch and broadcast patch update event
 */
export async function testPatch(params: {
    versionId: string;
    patchId: string;
    tested: boolean;
}): Promise<boolean> {
    try {
        const result = await actions.testPatch(params);
        if (result.data?.success) {
            // Broadcast patch update event
            // Step 6: Test Completed - when tested is true
            if (params.tested) {
                const demo = getDemo();
                if (demo.email) {
                    await incrementDemoStep({ email: demo.email, expectedStep: 6 });
                }
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error testing patch:', error);
        return false;
    }
}

/**
 * Mark a patch as tested (alias for testPatch)
 */
export async function markPatchTested(versionId: string, patchId: string, tested: boolean): Promise<boolean> {
    return testPatch({ versionId, patchId, tested });
}

/**
 * Revert patch and broadcast patch revert event
 */
export async function revertPatch(params: {
    galaxyId: string;
    versionTag: string;
    issueId: string;
}): Promise<boolean> {
    try {
        const result = await actions.revertPatch(params);
        if (result.data?.success) {
            // Broadcast patch revert event
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error reverting patch:', error);
        return false;
    }
}

/**
 * Release version: close issues, update status to archived, and broadcast VERSION_RELEASED event
 */
export async function releaseVersion(params: {
    versionId: string;
    tag: string;
    galaxyId: string;
}): Promise<boolean> {
    try {
        const demo = getDemo();
        if (!demo.email) {
            console.error('No demo email found');
            return false;
        }

        const closeResult = await actions.closeIssuesByVersion({
            versionId: params.versionId,
            email: demo.email,
        });
        if (!closeResult.data?.success) {
            console.error('Failed to close issues');
            return false;
        }

        const statusResult = await updateVersionStatus({
            versionId: params.versionId,
            status: 'archived',
        });
        if (!statusResult) {
            console.error('Failed to update version status');
            return false;
        }

        const eventDetail: VersionReleasedEventDetail = {
            versionId: params.versionId,
            tag: params.tag,
            galaxyId: params.galaxyId,
        };
        window.dispatchEvent(new CustomEvent(ROADMAP_EVENT_TYPES.VERSION_RELEASED, {
            detail: eventDetail,
        }));

        return true;
    } catch (error) {
        console.error('Error releasing version:', error);
        return false;
    }
}

