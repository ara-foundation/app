import { actions } from 'astro:actions';
import type { Galaxy } from '@/types/galaxy';

/**
 * Get galaxy by ID or name (read-only, no event)
 */
export async function getGalaxy(galaxyId: string): Promise<Galaxy | null> {
    try {
        const result = await actions.getGalaxy({ galaxyId });
        if (result.data?.success && result.data.galaxy) {
            return result.data.galaxy;
        }
        return null;
    } catch (error) {
        console.error('Error getting galaxy:', error);
        return null;
    }
}

