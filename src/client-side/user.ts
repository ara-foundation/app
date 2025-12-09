import { actions } from 'astro:actions';
import type { User } from '@/types/user';

/**
 * Get user by ID (read-only, no event)
 */
export async function getUserById(userId: string): Promise<User | null> {
    try {
        const result = await actions.getUserById({ userId });
        if (result.data?.success && result.data.data) {
            return result.data.data;
        }
        return null;
    } catch (error) {
        console.error('Error getting user by id:', error);
        return null;
    }
}

