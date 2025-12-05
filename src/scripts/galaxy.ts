import { ObjectId } from 'mongodb';
import { getCollection, create } from './db'

export interface GalaxyModel {
    _id?: ObjectId
    maintainer: ObjectId
    projectLink: ObjectId; // Required reference to ProjectModel
    name: string;
    description: string;
    stars: number;
    sunshines: number;
    users: number;
    donationAmount: number;
    x: number;
    y: number;
    tags?: string[];
}

/**
 * Get all galaxies
 */
export async function getAllGalaxies(): Promise<GalaxyModel[]> {
    try {
        const collection = await getCollection<GalaxyModel>('galaxies')
        const galaxies = await collection.find({}).toArray()
        return galaxies
    } catch (error) {
        console.error('Error getting all galaxies:', error)
        return []
    }
}

/**
 * Get galaxy by ID (using _id field)
 */
export async function getGalaxyById(id: string): Promise<GalaxyModel | null> {
    try {
        const collection = await getCollection<GalaxyModel>('galaxies')
        const objectId = new ObjectId(id)
        const result = await collection.findOne({ _id: objectId })
        return result
    } catch (error) {
        console.error('Error getting galaxy by id:', error)
        return null
    }
}

/**
 * Get galaxy by name
 */
export async function getGalaxyByName(name: string): Promise<GalaxyModel | null> {
    try {
        const collection = await getCollection<GalaxyModel>('galaxies')
        const result = await collection.findOne({ name })
        return result
    } catch (error) {
        console.error('Error getting galaxy by name:', error)
        return null
    }
}

/**
 * Create a new galaxy
 */
export async function createGalaxy(galaxy: GalaxyModel): Promise<boolean> {
    try {
        return await create<GalaxyModel>('galaxies', galaxy)
    } catch (error) {
        console.error('Error creating galaxy:', error)
        return false
    }
}

/**
 * Update galaxy sunshines by incrementing the amount
 */
export async function updateGalaxySunshines(galaxyId: string | ObjectId, amount: number): Promise<boolean> {
    try {
        const collection = await getCollection<GalaxyModel>('galaxies')
        const objectId = typeof galaxyId === 'string' ? new ObjectId(galaxyId) : galaxyId
        const result = await collection.updateOne(
            { _id: objectId },
            { $inc: { sunshines: amount } }
        )
        return result.modifiedCount > 0
    } catch (error) {
        console.error('Error updating galaxy sunshines:', error)
        return false
    }
}

