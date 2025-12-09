import { actions } from 'astro:actions';
import type { Version, Patch } from '@/types/roadmap';

/**
 * Get versions by galaxy ID
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
 * Update patches for a version
 */
export async function updatePatches(versionId: string, patches: Patch[]): Promise<boolean> {
    try {
        const result = await actions.updatePatches({ versionId, patches });
        return result.data?.success || false;
    } catch (error) {
        console.error('Error updating patches:', error);
        return false;
    }
}

