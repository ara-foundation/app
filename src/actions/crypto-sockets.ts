import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import { getDonationsByGalaxyId } from '@/server-side/blockchain-gateway'
import type { Donation } from '@/types/blockchain-gateway'

export const server = {
    getDonationsByGalaxyId: defineAction({
        input: z.object({
            galaxyId: z.string(),
        }),
        handler: async ({ galaxyId }): Promise<{ success: boolean; data?: Donation[]; error?: string }> => {
            try {
                const donations = await getDonationsByGalaxyId(galaxyId);
                return {
                    success: true,
                    data: donations,
                };
            } catch (error) {
                console.error('Error getting donations by galaxy id:', error);
                return {
                    success: false,
                    error: 'An error occurred while getting donations',
                };
            }
        },
    }),
}

