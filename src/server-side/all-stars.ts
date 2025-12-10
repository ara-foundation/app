import { ObjectId } from 'mongodb'
import { getCollection } from './db'
import { getAllGalaxies } from './galaxy'
import type { AllStarStats, SolarForgeModel, UserStar } from '@/types/all-stars'
import type { UserModel } from './user'

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

interface UserStarModel extends Omit<UserStar, '_id' | 'createdTime' | 'updatedTime'> {
    _id?: ObjectId
    createdTime?: number
    updatedTime?: number
}

async function getSpaceCollection() {
    return getCollection<UserStarModel>('space')
}

function userStarModelToUserStar(model: UserStarModel): UserStar {
    return {
        ...model,
        _id: model._id?.toString(),
    }
}

function userStarToModel(star: UserStar): UserStarModel {
    const { _id, ...rest } = star
    return {
        ...rest,
        _id: _id ? new ObjectId(_id) : undefined,
    }
}

export async function getGalaxySpace(galaxyId: string): Promise<UserStar[]> {
    const collection = await getSpaceCollection()
    const stars = await collection.find({ galaxyId }).toArray()
    return stars.map(userStarModelToUserStar)
}

export async function getUserStar(galaxyId: string, userId: string): Promise<UserStar | null> {
    const collection = await getSpaceCollection()
    const existing = await collection.findOne({ galaxyId, userId })
    if (existing) {
        return userStarModelToUserStar(existing)
    }

    // const { getUserById } = await import('./user')
    // const user = await getUserById(userId)
    // const now = Math.floor(Date.now() / 1000)
    // const placeholder: UserStarModel = {
    //     galaxyId,
    //     userId,
    //     nickname: user?.nickname || userId,
    //     src: user?.src,
    //     alt: user?.alt,
    //     stars: user?.stars,
    //     sunshines: user?.sunshines,
    //     role: user?.role,
    //     uri: user?.uri,
    //     createdTime: now,
    //     updatedTime: now,
    // }

    // await collection.insertOne(placeholder as any)
    return null
}

export async function upsertSpaceUserStar(params: {
    galaxyId: string
    userId: string
    data?: Partial<UserStar>
}): Promise<UserStar> {
    const { galaxyId, userId, data } = params
    const collection = await getSpaceCollection()
    const existing = await collection.findOne({ galaxyId, userId })
    const now = Math.floor(Date.now() / 1000)

    if (existing?._id) {
        const { _id: _ignore, ...restData } = data || {}
        const updated: UserStarModel = {
            ...existing,
            ...restData,
            _id: existing._id,
            updatedTime: now,
        }
        await collection.updateOne({ _id: existing._id }, { $set: { ...restData, updatedTime: now } })
        return userStarModelToUserStar(updated)
    }

    const { getUserById } = await import('./user')
    const user = await getUserById(userId)
    const base: UserStarModel = {
        galaxyId,
        userId,
        nickname: data?.nickname || user?.nickname || userId,
        src: data?.src ?? user?.src,
        alt: data?.alt ?? user?.alt,
        stars: data?.stars ?? user?.stars,
        sunshines: data?.sunshines ?? user?.sunshines,
        role: data?.role ?? user?.role,
        uri: data?.uri ?? user?.uri,
        createdTime: now,
        updatedTime: now,
        // x and y intentionally omitted on first create if not provided
    }

    const result = await collection.insertOne(base as any)
    return userStarModelToUserStar({ ...base, _id: result.insertedId })
}

export async function updateUserStarPosition(params: { galaxyId: string; userId: string; x: number; y: number }): Promise<boolean> {
    const { galaxyId, userId, x, y } = params
    const collection = await getSpaceCollection()
    const result = await collection.updateOne(
        { galaxyId, userId },
        { $set: { x, y, updatedTime: Math.floor(Date.now() / 1000) } }
    )
    return result.matchedCount > 0
}

/**
 * Check if an issue has already been solar forged
 */
export async function checkSolarForgeByIssue(issueId: string | ObjectId): Promise<boolean> {
    try {
        const collection = await getCollection<SolarForgeModel>('solarForges')
        const issueIdStr = typeof issueId === 'string' ? issueId : issueId.toString()
        const result = await collection.findOne({
            solarForgeType: 'issue',
            issueId: issueIdStr,
        })
        return result !== null
    } catch (error) {
        console.error('Error checking solar forge by issue:', error)
        return false
    }
}

/**
 * Create a solar forge tracker entry
 */
export async function createSolarForge(solarForge: SolarForgeModel): Promise<string> {
    try {
        const collection = await getCollection<SolarForgeModel>('solarForges')
        const solarForgeModel = {
            ...solarForge,
            issueId: solarForge.issueId,
            createdTime: solarForge.createdTime || Math.floor(Date.now() / 1000),
        }
        const result = await collection.insertOne(solarForgeModel as any)
        return result.insertedId.toString()
    } catch (error) {
        console.error('Error creating solar forge:', error)
        throw error
    }
}

/**
 * Update issue: reset sunshines to 0 and increment stars
 */
export async function updateIssueStars(
    issueId: string | ObjectId,
    stars: number,
    sunshines: number
): Promise<boolean> {
    try {
        const { getCollection: getIssueCollection } = await import('./db')
        const collection = await getIssueCollection<any>('issues')
        const objectId = typeof issueId === 'string' ? new ObjectId(issueId) : issueId

        // Get current issue to check if stars field exists
        const issue = await collection.findOne({ _id: objectId })
        if (!issue) {
            return false
        }

        const updateOps: any = {
            $set: {
                sunshines: 0,
            },
        }

        // If stars field doesn't exist, set it; otherwise increment it
        if (issue.stars === undefined || issue.stars === null) {
            updateOps.$set.stars = stars
        } else {
            updateOps.$inc = {
                stars: stars,
            }
        }

        const result = await collection.updateOne(
            { _id: objectId },
            updateOps
        )
        return result.modifiedCount > 0
    } catch (error) {
        console.error('Error updating issue stars:', error)
        return false
    }
}

