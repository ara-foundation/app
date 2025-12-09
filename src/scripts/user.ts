import { ObjectId } from 'mongodb'
import { getCollection } from './db'
import type { Roles, User } from '@/types/user'

// Re-export types for backward compatibility
export type { Roles, User } from '@/types/user'

// Internal model type (not exported)
interface UserModel {
    _id?: ObjectId
    email?: string
    src?: string
    alt?: string
    uri?: string
    nickname?: string
    sunshines?: number
    stars?: number
    role?: Roles
    balance?: number
}

// Serialization functions
function userModelToUser(model: UserModel | null): User | null {
    if (!model) return null
    return {
        _id: model._id?.toString(),
        email: model.email,
        src: model.src,
        alt: model.alt,
        uri: model.uri,
        nickname: model.nickname,
        sunshines: model.sunshines,
        stars: model.stars,
        role: model.role,
        balance: model.balance,
    }
}

function userToUserModel(user: User): UserModel {
    return {
        _id: user._id ? new ObjectId(user._id) : undefined,
        email: user.email,
        src: user.src,
        alt: user.alt,
        uri: user.uri,
        nickname: user.nickname,
        sunshines: user.sunshines,
        stars: user.stars,
        role: user.role,
        balance: user.balance,
    }
}

export const emailToNickname = (email: string): string => {
    return email.split('@')[0]
}
/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
    try {
        const collection = await getCollection<UserModel>('users')
        const result = await collection.findOne({ email })
        return userModelToUser(result)
    } catch (error) {
        console.error('Error getting user by email:', error)
        return null
    }
}

/**
 * Get user by ID
 */
export async function getUserById(id: string | ObjectId): Promise<User | null> {
    try {
        const collection = await getCollection<UserModel>('users')
        const objectId = typeof id === 'string' ? new ObjectId(id) : id
        const result = await collection.findOne({ _id: objectId })
        return userModelToUser(result)
    } catch (error) {
        console.error('Error getting user by id:', error)
        return null
    }
}

/**
 * Get multiple users by IDs
 */
export async function getUserByIds(ids: ObjectId[] | string[]): Promise<User[]> {
    try {
        if (ids.length === 0) {
            return []
        }
        const collection = await getCollection<UserModel>('users')
        const objectIds = ids.map(id => typeof id === 'string' ? new ObjectId(id) : id)
        const result = await collection.find({ _id: { $in: objectIds } }).toArray()
        return result.map(userModelToUser).filter((u): u is User => u !== null)
    } catch (error) {
        console.error('Error getting users by ids:', error)
        return []
    }
}

/**
 * Create a new user
 */
export async function createUser(user: User): Promise<string> {
    try {
        const collection = await getCollection<UserModel>('users')
        const userModel = userToUserModel(user)
        const result = await collection.insertOne(userModel as any)
        return result.insertedId.toString()
    } catch (error) {
        console.error('Error creating user:', error)
        throw error
    }
}

/**
 * Create multiple users in bulk
 */
export async function createUsers(users: User[]): Promise<string[]> {
    try {
        if (users.length === 0) {
            return []
        }
        const collection = await getCollection<UserModel>('users')
        const userModels = users.map(userToUserModel)
        const result = await collection.insertMany(userModels as any)
        return Object.values(result.insertedIds).map(id => id.toString())
    } catch (error) {
        console.error('Error creating users:', error)
        throw error
    }
}

/**
 * Get or create user by email (returns user ID as string)
 */
export async function getOrCreateUserByEmail(email: string): Promise<string> {
    try {
        // Try to get existing user
        const existingUser = await getUserByEmail(email)
        if (existingUser && existingUser._id) {
            return existingUser._id
        }

        // Create new user if doesn't exist
        const newUser: User = {
            email,
            role: 'maintainer',
            nickname: emailToNickname(email),
        }
        const insertedId = await createUser(newUser)
        return insertedId
    } catch (error) {
        console.error('Error getting or creating user by email:', error)
        throw error
    }
}

/**
 * Update user sunshines by incrementing the amount
 */
export async function updateUserSunshines(userId: string | ObjectId, amount: number): Promise<boolean> {
    try {
        const collection = await getCollection<UserModel>('users')
        const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId

        // First check if user exists
        const user = await collection.findOne({ _id: objectId })
        if (!user) {
            console.error('User not found for sunshines update:', objectId.toString())
            return false
        }

        // If sunshines field doesn't exist, set it first, then increment
        if (user.sunshines === undefined || user.sunshines === null) {
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
        console.error('Error updating user sunshines:', error)
        return false
    }
}

