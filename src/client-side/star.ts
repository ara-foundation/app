import { actions } from 'astro:actions';
import type { Star } from '@/types/star';

/**
 * Get star by ID (read-only, no event)
 */
export async function getStarById(starId: string): Promise<Star | null> {
    try {
        const result = await actions.getStarById({ starId });
        if (result.data?.success && result.data.data) {
            return result.data.data;
        }
        return null;
    } catch (error) {
        console.error('Error getting star by id:', error);
        return null;
    }
}

/**
 * Get star by userId (read-only, no event)
 */
export async function getStarByUserId(userId: string): Promise<Star | null> {
    try {
        const result = await actions.getStarByUserId({ userId });
        if (result.data?.success && result.data.data) {
            return result.data.data;
        }
        return null;
    } catch (error) {
        console.error('Error getting star by userId:', error);
        return null;
    }
}

/**
 * Create star by userId
 */
export async function createStarByUserId(userId: string): Promise<{ success: boolean; starId?: string; error?: string }> {
    try {
        const result = await actions.createStarByUserId({ userId });
        if (result.data?.success) {
            return {
                success: true,
                starId: result.data.starId,
            };
        }
        return {
            success: false,
            error: result.data?.error || 'Failed to create star',
        };
    } catch (error) {
        console.error('Error creating star by userId:', error);
        return {
            success: false,
            error: 'An error occurred while creating star',
        };
    }
}

/**
 * Update star sunshines by incrementing the amount
 */
export async function updateStarSunshines(starId: string, amount: number): Promise<{ success: boolean; error?: string }> {
    try {
        const result = await actions.updateStarSunshines({ starId, amount });
        if (result.data?.success) {
            return {
                success: true,
            };
        }
        return {
            success: false,
            error: result.data?.error || 'Failed to update star sunshines',
        };
    } catch (error) {
        console.error('Error updating star sunshines:', error);
        return {
            success: false,
            error: 'An error occurred while updating star sunshines',
        };
    }
}

