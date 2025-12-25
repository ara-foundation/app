import { ObjectId } from 'mongodb'
import { Wallet } from 'ethers'
import { getCollection } from './db'
import type { Star } from '@/types/star'

export interface StarModel extends Omit<Star, '_id'> {
    _id?: ObjectId
}

// Serialization functions
function starModelToStar(model: StarModel | null): Star | null {
    if (!model) return null
    return {
        _id: model._id?.toString(),
        sunshines: model.sunshines,
        stars: model.stars,
        balance: model.balance,
        demoPrivateKey: model.demoPrivateKey,
        userId: model.userId,
    }
}

function starToStarModel(star: Star): StarModel {
    return {
        _id: star._id ? new ObjectId(star._id) : undefined,
        sunshines: star.sunshines,
        stars: star.stars,
        balance: star.balance,
        demoPrivateKey: star.demoPrivateKey,
        userId: star.userId,
    }
}

/**
 * Get star by userId
 */
export async function getStarByUserId(userId: string): Promise<Star | null> {
    try {
        const collection = await getCollection<StarModel>('stars')
        const result = await collection.findOne({ userId })
        return starModelToStar(result)
    } catch (error) {
        console.error('Error getting star by userId:', error)
        return null
    }
}


/**
 * Get star by ID
 */
export async function getStarById(id: string | ObjectId): Promise<Star | null> {
    try {
        const collection = await getCollection<StarModel>('stars')
        const objectId = typeof id === 'string' ? new ObjectId(id) : id
        const result = await collection.findOne({ _id: objectId })
        return starModelToStar(result)
    } catch (error) {
        console.error('Error getting star by id:', error)
        return null
    }
}

/**
 * Get multiple stars by IDs
 */
export async function getStarByIds(ids: ObjectId[] | string[]): Promise<Star[]> {
    try {
        if (ids.length === 0) {
            return []
        }
        const collection = await getCollection<StarModel>('stars')
        const objectIds = ids.map(id => typeof id === 'string' ? new ObjectId(id) : id)
        const result = await collection.find({ _id: { $in: objectIds } }).toArray()
        return result.map(starModelToStar).filter((s): s is Star => s !== null)
    } catch (error) {
        console.error('Error getting stars by ids:', error)
        return []
    }
}

/**
 * Create a new star
 */
export async function createStar(star: Star): Promise<string> {
    try {
        const collection = await getCollection<StarModel>('stars')
        const starModel = starToStarModel(star)
        const result = await collection.insertOne(starModel as any)
        return result.insertedId.toString()
    } catch (error) {
        console.error('Error creating star:', error)
        throw error
    }
}

/**
 * Create multiple stars in bulk
 */
export async function createStars(stars: Star[]): Promise<string[]> {
    try {
        if (stars.length === 0) {
            return []
        }
        const collection = await getCollection<StarModel>('stars')
        const starModels = stars.map(starToStarModel)
        const result = await collection.insertMany(starModels as any)
        return Object.values(result.insertedIds).map(id => id.toString())
    } catch (error) {
        console.error('Error creating stars:', error)
        throw error
    }
}

/**
 * Get or create star by userId (returns star ID as string)
 */
export async function createStarByUserId(userId: string): Promise<string> {
    try {
        // Create new star if doesn't exist
        const wallet = Wallet.createRandom()
        const newStar: Star = {
            sunshines: 100,
            stars: 0,
            balance: 0,
            demoPrivateKey: wallet.privateKey,
            userId: userId,
        }
        const insertedId = await createStar(newStar)
        return insertedId
    } catch (error) {
        console.error('Error getting or creating star by userId:', error)
        throw error
    }
}

/**
 * Update star sunshines by incrementing the amount
 */
export async function updateStarSunshines(starId: string | ObjectId, amount: number): Promise<boolean> {
    try {
        const collection = await getCollection<StarModel>('stars')
        const objectId = typeof starId === 'string' ? new ObjectId(starId) : starId

        // First check if star exists
        const star = await collection.findOne({ _id: objectId })
        if (!star) {
            console.error('Star not found for sunshines update:', objectId.toString())
            return false
        }

        // If sunshines field doesn't exist, set it first, then increment
        if (star.sunshines === undefined || star.sunshines === null) {
            const setResult = await collection.updateOne(
                { _id: objectId },
                { $set: { sunshines: 0 } }
            )
            if (setResult.matchedCount === 0) {
                return false
            }
        }

        // Now increment sunshines
        const result = await collection.updateOne(
            { _id: objectId },
            { $inc: { sunshines: amount } }
        )

        // Return true if document was matched (the operation succeeded)
        return result.matchedCount > 0
    } catch (error) {
        console.error('Error updating star sunshines:', error)
        return false
    }
}

/**
 * Update star stars by incrementing the amount
 */
export async function updateStarStars(starId: string | ObjectId, amount: number): Promise<boolean> {
    try {
        const collection = await getCollection<StarModel>('stars')
        const objectId = typeof starId === 'string' ? new ObjectId(starId) : starId

        // First check if star exists
        const star = await collection.findOne({ _id: objectId })
        if (!star) {
            console.error('Star not found for stars update:', objectId.toString())
            return false
        }

        // If stars field doesn't exist, set it first, then increment
        if (star.stars === undefined || star.stars === null) {
            const setResult = await collection.updateOne(
                { _id: objectId },
                { $set: { stars: 0 } }
            )
            if (setResult.matchedCount === 0) {
                return false
            }
        }

        // Now increment stars
        const result = await collection.updateOne(
            { _id: objectId },
            { $inc: { stars: amount } }
        )

        // Return true if document was matched (the operation succeeded)
        return result.matchedCount > 0
    } catch (error) {
        console.error('Error updating star stars:', error)
        return false
    }
}

