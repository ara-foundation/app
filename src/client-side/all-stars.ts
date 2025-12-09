import { actions } from 'astro:actions';
import type { AllStarStats } from '@/types/all-stars';

/**
 * Get all star stats (read-only, no event)
 */
export async function getAllStarStats(): Promise<AllStarStats> {
    try {
        const result = await actions.allStarStats();
        return result;
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

