import { ObjectId } from 'mongodb';
import { getCollection, create } from './db'
import type { Galaxy } from '@/types/galaxy'

// Re-export types for backward compatibility
export type { Galaxy } from '@/types/galaxy'

// Internal model type (not exported)
interface GalaxyModel {
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
    blockchainId?: string;
    blockchainTx?: string;
}

// Serialization functions
function galaxyModelToGalaxy(model: GalaxyModel | null): Galaxy | null {
    if (!model) return null
    return {
        _id: model._id?.toString(),
        maintainer: model.maintainer.toString(),
        projectLink: model.projectLink.toString(),
        name: model.name,
        description: model.description,
        stars: model.stars,
        sunshines: model.sunshines,
        users: model.users,
        donationAmount: model.donationAmount,
        x: model.x,
        y: model.y,
        tags: model.tags,
        blockchainId: model.blockchainId,
        blockchainTx: model.blockchainTx,
    }
}

function galaxyToGalaxyModel(galaxy: Galaxy): GalaxyModel {
    const model: GalaxyModel = {
        maintainer: new ObjectId(galaxy.maintainer),
        projectLink: new ObjectId(galaxy.projectLink),
        name: galaxy.name,
        description: galaxy.description,
        stars: galaxy.stars,
        sunshines: galaxy.sunshines,
        users: galaxy.users,
        donationAmount: galaxy.donationAmount,
        x: galaxy.x,
        y: galaxy.y,
        tags: galaxy.tags,
        blockchainId: galaxy.blockchainId,
        blockchainTx: galaxy.blockchainTx,
    }
    if (galaxy._id) {
        model._id = new ObjectId(galaxy._id)
    }
    return model
}

/**
 * Get all galaxies
 */
export async function getAllGalaxies(): Promise<Galaxy[]> {
    try {
        const collection = await getCollection<GalaxyModel>('galaxies')
        const galaxies = await collection.find({}).toArray()
        return galaxies.map(galaxyModelToGalaxy).filter((g): g is Galaxy => g !== null)
    } catch (error) {
        console.error('Error getting all galaxies:', error)
        return []
    }
}

/**
 * Get galaxy by ID (using _id field)
 */
export async function getGalaxyById(id: string): Promise<Galaxy | null> {
    try {
        const collection = await getCollection<GalaxyModel>('galaxies')
        const objectId = new ObjectId(id)
        const result = await collection.findOne({ _id: objectId })
        return galaxyModelToGalaxy(result)
    } catch (error) {
        console.error('Error getting galaxy by id:', error)
        return null
    }
}

/**
 * Get galaxy by name
 */
export async function getGalaxyByName(name: string): Promise<Galaxy | null> {
    try {
        const collection = await getCollection<GalaxyModel>('galaxies')
        const result = await collection.findOne({ name })
        return galaxyModelToGalaxy(result)
    } catch (error) {
        console.error('Error getting galaxy by name:', error)
        return null
    }
}

/**
 * Create a new galaxy
 * @returns The created galaxy ID, or null if creation failed
 */
export async function createGalaxy(galaxy: Galaxy): Promise<string | null> {
    try {
        const galaxyModel = galaxyToGalaxyModel(galaxy)
        const collection = await getCollection<GalaxyModel>('galaxies')
        const result = await collection.insertOne(galaxyModel as any)
        if (!result.insertedId) {
            return null
        }
        return result.insertedId.toString()
    } catch (error) {
        console.error('Error creating galaxy:', error)
        return null
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

/**
 * Get galaxies by maintainer (user ID)
 */
export async function getGalaxiesByMaintainer(userId: string | ObjectId): Promise<Galaxy[]> {
    try {
        const collection = await getCollection<GalaxyModel>('galaxies')
        const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId
        const galaxies = await collection.find({ maintainer: objectId }).toArray()
        return galaxies.map(galaxyModelToGalaxy).filter((g): g is Galaxy => g !== null)
    } catch (error) {
        console.error('Error getting galaxies by maintainer:', error)
        return []
    }
}

