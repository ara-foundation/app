import { defineAction } from 'astro:actions'
import { getAllStarStats, type AllStarStats } from '@/scripts/all-stars'

export const server = {
    allStarStats: defineAction({
        accept: 'form',
        handler: async (): Promise<AllStarStats> => {
            try {
                const stats = await getAllStarStats()
                return stats
            } catch (error) {
                console.error('Error in allStarStats action:', error)
                // Return default values on error
                return {
                    totalGalaxies: 0,
                    totalStars: 0,
                    totalUsers: 0,
                    totalSunshines: 0,
                }
            }
        },
    }),
}

