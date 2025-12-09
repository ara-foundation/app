import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import { getGalaxyById, getGalaxyByName } from '@/scripts/galaxy'
import type { Galaxy } from '@/types/galaxy'

export const server = {
    getGalaxy: defineAction({
        accept: 'json',
        input: z.object({
            galaxyId: z.string(),
        }),
        handler: async ({ galaxyId }): Promise<{ success: boolean; galaxy?: Galaxy; error?: string }> => {
            try {
                // Try to get by ID first
                let galaxy = await getGalaxyById(galaxyId)

                // If not found by ID, try by name
                if (!galaxy) {
                    galaxy = await getGalaxyByName(galaxyId)
                }

                if (!galaxy) {
                    return {
                        success: false,
                        error: 'Galaxy not found',
                    }
                }

                // Convert ObjectId to string for serialization
                const serializedGalaxy = {
                    ...galaxy,
                    _id: galaxy._id?.toString(),
                    maintainer: galaxy.maintainer?.toString(),
                }

                return {
                    success: true,
                    galaxy: serializedGalaxy as any,
                }
            } catch (error) {
                console.error('Error getting galaxy:', error)
                return {
                    success: false,
                    error: 'An error occurred while getting galaxy',
                }
            }
        },
    }),
}

