import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import { getStarById, getStarByEmail } from '@/server-side/star'
import type { Star } from '@/types/star'

export const server = {
    getStarById: defineAction({
        input: z.object({
            starId: z.string(),
        }),
        handler: async ({ starId }): Promise<{ success: boolean; data?: Star; error?: string }> => {
            try {
                const star = await getStarById(starId);
                if (star) {
                    return {
                        success: true,
                        data: star,
                    };
                }
                return {
                    success: false,
                    error: 'Star not found',
                };
            } catch (error) {
                console.error('Error getting star by id:', error);
                return {
                    success: false,
                    error: 'An error occurred while getting star',
                };
            }
        },
    }),
    getStarByEmail: defineAction({
        input: z.object({
            email: z.string(),
        }),
        handler: async ({ email }): Promise<{ success: boolean; data?: Star; error?: string }> => {
            try {
                const star = await getStarByEmail(email)
                if (star) {
                    return {
                        success: true,
                        data: star,
                    }
                }
                return {
                    success: false,
                    error: 'Star not found',
                }
            } catch (error) {
                console.error('Error getting star by email:', error)
                return {
                    success: false,
                    error: 'An error occurred while getting star',
                }
            }
        },
    }),
}

