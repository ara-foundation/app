import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import { getStarById, getStarByUserId, updateStarSunshines, createStarByUserId } from '@/server-side/star'
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
    getStarByUserId: defineAction({
        input: z.object({
            userId: z.string(),
        }),
        handler: async ({ userId }): Promise<{ success: boolean; data?: Star; error?: string }> => {
            try {
                const star = await getStarByUserId(userId)
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
                console.error('Error getting star by userId:', error)
                return {
                    success: false,
                    error: 'An error occurred while getting star',
                }
            }
        },
    }),
    createStarByUserId: defineAction({
        input: z.object({
            userId: z.string(),
        }),
        handler: async ({ userId }): Promise<{ success: boolean; starId?: string; error?: string }> => {
            try {
                const starId = await createStarByUserId(userId)
                return {
                    success: true,
                    starId,
                }
            } catch (error) {
                console.error('Error creating star by userId:', error)
                return {
                    success: false,
                    error: 'An error occurred while creating star',
                }
            }
        },
    }),
    updateStarSunshines: defineAction({
        input: z.object({
            starId: z.string(),
            amount: z.number(),
        }),
        handler: async ({ starId, amount }): Promise<{ success: boolean; error?: string }> => {
            try {
                const updated = await updateStarSunshines(starId, amount)
                if (updated) {
                    return {
                        success: true,
                    }
                }
                return {
                    success: false,
                    error: 'Failed to update star sunshines',
                }
            } catch (error) {
                console.error('Error updating star sunshines:', error)
                return {
                    success: false,
                    error: 'An error occurred while updating star sunshines',
                }
            }
        },
    }),
}

