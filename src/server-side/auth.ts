import { ObjectId } from 'mongodb'
import type { AuthUser, AuthSession, AuthAccount, AuthVerification } from '@/types/auth'
import { getDb } from './db'

/**
 * Better-Auth User Model (MongoDB)
 * Server-side model with ObjectId for database operations
 */
export interface AuthUserModel extends Omit<AuthUser, 'id'> {
    _id?: ObjectId // MongoDB document ID
    id: string // Unique user identifier (unique index)
}

/**
 * Better-Auth Session Model (MongoDB)
 * Server-side model with ObjectId
 */
export interface AuthSessionModel extends Omit<AuthSession, 'id'> {
    _id?: ObjectId // MongoDB document ID
    id: string // Unique session identifier
}

/**
 * Better-Auth Account Model (MongoDB)
 * Server-side model with ObjectId
 */
export interface AuthAccountModel extends Omit<AuthAccount, 'id'> {
    _id?: ObjectId // MongoDB document ID
    id: string // Unique account identifier
}

/**
 * Better-Auth Verification Model (MongoDB)
 * Server-side model with ObjectId
 */
export interface AuthVerificationModel extends Omit<AuthVerification, 'id'> {
    _id?: ObjectId // MongoDB document ID
    id: string // Unique verification identifier
}

// Serialization functions
function authUserModelToAuthUser(model: AuthUserModel | null): AuthUser | null {
    if (!model) return null
    return {
        id: model.id,
        email: model.email,
        emailVerified: model.emailVerified,
        username: model.username,
        displayUsername: model.displayUsername,
        name: model.name,
        image: model.image,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
    }
}

function authUserToAuthUserModel(user: AuthUser): Omit<AuthUserModel, '_id'> {
    return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        username: user.username,
        displayUsername: user.displayUsername,
        name: user.name,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }
}

function authSessionModelToAuthSession(model: AuthSessionModel | null): AuthSession | null {
    if (!model) return null
    return {
        id: model.id,
        sessionToken: model.sessionToken,
        userId: model.userId,
        expiresAt: model.expiresAt,
        ipAddress: model.ipAddress,
        userAgent: model.userAgent,
    }
}

function authSessionToAuthSessionModel(session: AuthSession): Omit<AuthSessionModel, '_id'> {
    return {
        id: session.id,
        sessionToken: session.sessionToken,
        userId: session.userId,
        expiresAt: session.expiresAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
    }
}

function authAccountModelToAuthAccount(model: AuthAccountModel | null): AuthAccount | null {
    if (!model) return null
    return {
        id: model.id,
        userId: model.userId,
        providerId: model.providerId,
        providerAccountId: model.providerAccountId,
        accessToken: model.accessToken,
        refreshToken: model.refreshToken,
        expiresAt: model.expiresAt,
        scope: model.scope,
        tokenType: model.tokenType,
    }
}

function authAccountToAuthAccountModel(account: AuthAccount): Omit<AuthAccountModel, '_id'> {
    return {
        id: account.id,
        userId: account.userId,
        providerId: account.providerId,
        providerAccountId: account.providerAccountId,
        accessToken: account.accessToken,
        refreshToken: account.refreshToken,
        expiresAt: account.expiresAt,
        scope: account.scope,
        tokenType: account.tokenType,
    }
}

function authVerificationModelToAuthVerification(model: AuthVerificationModel | null): AuthVerification | null {
    if (!model) return null
    return {
        id: model.id,
        identifier: model.identifier,
        token: model.token,
        expiresAt: model.expiresAt,
        type: model.type,
    }
}

function authVerificationToAuthVerificationModel(verification: AuthVerification): Omit<AuthVerificationModel, '_id'> {
    return {
        id: verification.id,
        identifier: verification.identifier,
        token: verification.token,
        expiresAt: verification.expiresAt,
        type: verification.type,
    }
}

/**
 * Get auth user by ID
 */
export async function getAuthUserById(userId: string): Promise<AuthUser | null> {
    try {
        const db = await getDb()
        const collection = db.collection<AuthUserModel>('user')

        const user = await collection.findOne({ id: userId })
        return authUserModelToAuthUser(user)
    } catch (error) {
        console.error('Error getting auth user by id:', error)
        return null
    }
}

/**
 * Get auth user by email
 */
export async function getAuthUserByEmail(email: string): Promise<AuthUser | null> {
    try {
        const db = await getDb()
        const collection = db.collection<AuthUserModel>('user')

        const user = await collection.findOne({ email })
        return authUserModelToAuthUser(user)
    } catch (error) {
        console.error('Error getting auth user by email:', error)
        return null
    }
}

/**
 * Get accounts by user ID
 */
export async function getAccountsByUserId(userId: string): Promise<AuthAccount[]> {
    const db = await getDb()
    const collection = db.collection<AuthAccountModel>('account')

    const accounts = await collection.find({ userId }).toArray()
    return accounts.map(account => authAccountModelToAuthAccount(account)!).filter(Boolean)
}

export {
    authUserModelToAuthUser,
    authUserToAuthUserModel,
    authSessionModelToAuthSession,
    authSessionToAuthSessionModel,
    authAccountModelToAuthAccount,
    authAccountToAuthAccountModel,
    authVerificationModelToAuthVerification,
    authVerificationToAuthVerificationModel,
}
