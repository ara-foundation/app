/**
 * Better-Auth User Type
 * Represents a user account in the authentication system
 * Based on better-auth schema with username plugin
 */
export interface AuthUser {
    id: string // Unique user identifier (primary key)
    email: string // User email address (unique, indexed)
    emailVerified: boolean // Whether the email has been verified (indexed)
    username?: string // Username (from username plugin, unique, indexed)
    displayUsername?: string // Display username
    name?: string // User's display name
    image?: string // User's profile image URL
    createdAt: Date // Account creation timestamp (indexed)
    updatedAt?: Date // Last update timestamp
}

/**
 * Better-Auth Session Type
 * Represents an active user session
 */
export interface AuthSession {
    id: string // Unique session identifier
    sessionToken: string // Session token (unique)
    userId: string // Reference to AuthUser id
    expiresAt: Date // Session expiration timestamp
    ipAddress?: string // IP address of the session
    userAgent?: string // User agent string
}

/**
 * Better-Auth Account Type
 * Represents an OAuth/Provider account linked to a user
 */
export interface AuthAccount {
    id: string // Unique account identifier
    userId: string // Reference to AuthUser id
    providerId: string // OAuth provider ID (e.g., 'github', 'google')
    accountId: string // Provider's account ID
    accessToken?: string // OAuth access token
    refreshToken?: string // OAuth refresh token
    expiresAt?: Date // Token expiration timestamp
    scope?: string // OAuth scope
    tokenType?: string // Token type (e.g., 'Bearer')
}

/**
 * Better-Auth Verification Type
 * Represents email verification tokens
 */
export interface AuthVerification {
    id: string // Unique verification identifier
    identifier: string // Email or phone number to verify
    token: string // Verification token (unique)
    expiresAt: Date // Token expiration timestamp (TTL index)
    type: 'email' | 'phone' // Verification type
}
