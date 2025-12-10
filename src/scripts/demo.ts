import { ObjectId } from 'mongodb'
import { getCollection, create } from '@/scripts/db'
import { DemoModel } from '../types/demo'


/**
 * Get demo by email
 */
export async function getDemoByEmail(email: string): Promise<DemoModel | null> {
    try {
        const collection = await getCollection<DemoModel>('demo')
        const result = await collection.findOne({ email })
        return result
    } catch (error) {
        console.error('Error getting demo by email:', error)
        return null
    }
}

/**
 * Create new demo entry
 */
export async function createDemo(email: string, users: ObjectId[]): Promise<boolean> {
    try {
        const demo: DemoModel = {
            email,
            created: Date.now(),
            users,
        }
        return await create<DemoModel>('demo', demo)
    } catch (error) {
        console.error('Error creating demo:', error)
        return false
    }
}

/**
 * Update demo step
 */
export async function updateDemoStep(email: string, step: number): Promise<boolean> {
    try {
        const collection = await getCollection<DemoModel>('demo')
        const result = await collection.updateOne(
            { email },
            { $set: { step } }
        )
        return result.modifiedCount > 0
    } catch (error) {
        console.error('Error updating demo step:', error)
        return false
    }
}


