import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import { getUserById, getUserByEmail } from '@/server-side/user'
import type { User } from '@/types/user'

export const server = {
    getUserById: defineAction({
        input: z.object({
            userId: z.string(),
        }),
        handler: async ({ userId }): Promise<{ success: boolean; data?: User; error?: string }> => {
            try {
                const user = await getUserById(userId);
                if (user) {
                    return {
                        success: true,
                        data: user,
                    };
                }
                return {
                    success: false,
                    error: 'User not found',
                };
            } catch (error) {
                console.error('Error getting user by id:', error);
                return {
                    success: false,
                    error: 'An error occurred while getting user',
                };
            }
        },
    }),
    getUserByEmail: defineAction({
        input: z.object({
            email: z.string(),
        }),
        handler: async ({ email }): Promise<{ success: boolean; data?: User; error?: string }> => {
            try {
                const user = await getUserByEmail(email)
                if (user) {
                    return {
                        success: true,
                        data: user,
                    }
                }
                return {
                    success: false,
                    error: 'User not found',
                }
            } catch (error) {
                console.error('Error getting user by email:', error)
                return {
                    success: false,
                    error: 'An error occurred while getting user',
                }
            }
        },
    }),
}

