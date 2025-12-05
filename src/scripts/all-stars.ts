import { getCollection } from './db'
import { getAllGalaxies } from './galaxy'
import { UserModel } from './user'

export interface AllStarStats {
    totalGalaxies: number;
    totalStars: number;
    totalUsers: number;
    totalSunshines?: number;
}

/**
 * Get all star statistics by aggregating data from galaxies and users
 */
export async function getAllStarStats(): Promise<AllStarStats> {
    try {
        // Get all galaxies
        const galaxies = await getAllGalaxies()

        // Calculate totals from galaxies
        const totalGalaxies = galaxies.length
        const totalStars = galaxies.reduce((sum, galaxy) => sum + (galaxy.stars || 0), 0)
        const totalSunshines = galaxies.reduce((sum, galaxy) => sum + (galaxy.sunshines || 0), 0)

        // Count distinct users from users collection
        const usersCollection = await getCollection<UserModel>('users')
        const totalUsers = await usersCollection.countDocuments({})

        return {
            totalGalaxies,
            totalStars,
            totalUsers,
            totalSunshines,
        }
    } catch (error) {
        console.error('Error getting all star stats:', error)
        // Return default values on error
        return {
            totalGalaxies: 0,
            totalStars: 0,
            totalUsers: 0,
            totalSunshines: 0,
        }
    }
}

