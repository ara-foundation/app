import type { AuthUserModel, AuthSessionModel, AuthAccountModel, AuthVerificationModel } from "@/server-side/auth";
import { MongoClient, Db } from 'mongodb';
import { readFileSync } from 'fs';
import { resolve, join } from 'path';

// Parse MONGODB_URI from .env file
function getMongoUriFromFile(filePath: string): string | undefined {
    try {
        const content = readFileSync(filePath, 'utf-8');
        for (const line of content.split('\n')) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const match = trimmed.match(/^MONGODB_URI=(.*)$/);
                if (match) {
                    let value = match[1].trim();
                    if ((value.startsWith('"') && value.endsWith('"')) ||
                        (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.slice(1, -1);
                    }
                    return value;
                }
            }
        }
    } catch (error) {
        return undefined;
    }
    return undefined;
}

// Load environment variables
function loadEnv() {
    const rootDir = resolve(process.cwd());
    const envFiles = ['.env', '.env.dev', '.env.local'];

    for (const envFile of envFiles) {
        const envPath = join(rootDir, envFile);
        const uri = getMongoUriFromFile(envPath);
        if (uri) {
            process.env.MONGODB_URI = uri;
            break;
        }
    }
}

/**
 * Setup better-auth MongoDB collections and indexes
 * Creates the following collections:
 * - user: User accounts
 * - session: User sessions
 * - account: OAuth/Provider accounts linked to users
 * - verification: Email verification tokens
 */
async function setupBetterAuth() {
    loadEnv();

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI environment variable is not set');
    }

    const client = new MongoClient(uri);
    const DB_NAME = 'Ara';

    try {
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db(DB_NAME);
        console.log(`📊 Using database: ${DB_NAME}\n`);

        // Create collections and indexes
        await createUserCollection(db);
        await createSessionCollection(db);
        await createAccountCollection(db);
        await createVerificationCollection(db);

        console.log('\n✅ Better-auth setup completed successfully!');
        console.log('\nCollections created:');
        console.log('  - user');
        console.log('  - session');
        console.log('  - account');
        console.log('  - verification');

    } catch (error) {
        console.error('❌ Error setting up better-auth:', error);
        throw error;
    } finally {
        await client.close();
        console.log('\n🔌 Database connection closed');
    }
}

/**
 * Create user collection with indexes
 */
async function createUserCollection(db: Db) {
    console.log('📦 Creating user collection...');
    const collection = db.collection<AuthUserModel>('user');

    // Create indexes
    const indexes = [
        { key: { email: 1 }, unique: true, name: 'email_unique' },
        { key: { id: 1 }, unique: true, name: 'id_unique' },
        { key: { username: 1 }, unique: true, name: 'username_unique' }, // Username plugin field
        { key: { emailVerified: 1 }, name: 'emailVerified_index' },
        { key: { createdAt: 1 }, name: 'createdAt_index' },
    ];

    for (const index of indexes) {
        try {
            await collection.createIndex(index.key, {
                unique: index.unique || false,
                name: index.name,
            });
            console.log(`   ✅ Created index: ${index.name}`);
        } catch (error: any) {
            if (error.code === 85) {
                // Index already exists with different options
                console.log(`   ⚠️  Index ${index.name} already exists`);
            } else if (error.code === 86) {
                // Index already exists
                console.log(`   ℹ️  Index ${index.name} already exists`);
            } else {
                console.error(`   ❌ Error creating index ${index.name}:`, error.message);
            }
        }
    }
}

/**
 * Create session collection with indexes (including TTL for expired sessions)
 */
async function createSessionCollection(db: Db) {
    console.log('📦 Creating session collection...');
    const collection = db.collection<AuthSessionModel>('session');

    // First, try to drop the old sessionToken_unique index if it exists (to recreate it as sparse)
    try {
        await collection.dropIndex('sessionToken_unique');
        console.log('   🔄 Dropped old sessionToken_unique index (will recreate as sparse)');
    } catch (error: any) {
        if (error.codeName !== 'IndexNotFound') {
            console.log(`   ℹ️  Could not drop sessionToken_unique index: ${error.message}`);
        }
    }

    // Clean up any sessions with null sessionToken (they shouldn't exist but clean up just in case)
    try {
        const result = await collection.deleteMany({ sessionToken: null });
        if (result.deletedCount > 0) {
            console.log(`   🧹 Cleaned up ${result.deletedCount} sessions with null sessionToken`);
        }
    } catch (error: any) {
        console.log(`   ℹ️  Could not clean up null sessions: ${error.message}`);
    }

    // Create indexes
    const indexes = [
        { key: { sessionToken: 1 }, unique: true, sparse: true, name: 'sessionToken_unique' }, // Sparse index allows multiple nulls
        { key: { userId: 1 }, name: 'userId_index' },
        { key: { expiresAt: 1 }, name: 'expiresAt_index' },
        { key: { expiresAt: 1 }, name: 'expiresAt_ttl', expireAfterSeconds: 0 }, // TTL index
    ];

    for (const index of indexes) {
        try {
            if (index.name === 'expiresAt_ttl') {
                // TTL index - automatically deletes expired sessions
                await collection.createIndex(
                    { expiresAt: 1 },
                    { expireAfterSeconds: 0, name: 'expiresAt_ttl' }
                );
                console.log(`   ✅ Created TTL index: ${index.name}`);
            } else {
                await collection.createIndex(index.key, {
                    unique: index.unique || false,
                    sparse: index.sparse || false, // Sparse index allows multiple null values
                    name: index.name,
                });
                console.log(`   ✅ Created index: ${index.name}`);
            }
        } catch (error: any) {
            if (error.code === 85) {
                console.log(`   ⚠️  Index ${index.name} already exists`);
            } else if (error.code === 86) {
                console.log(`   ℹ️  Index ${index.name} already exists`);
            } else {
                console.error(`   ❌ Error creating index ${index.name}:`, error.message);
            }
        }
    }
}

/**
 * Create account collection with indexes
 */
async function createAccountCollection(db: Db) {
    console.log('📦 Creating account collection...');
    const collection = db.collection<AuthAccountModel>('account');

    // Create indexes
    const indexes = [
        { key: { providerId: 1, providerAccountId: 1 }, unique: true, name: 'provider_unique' },
        { key: { userId: 1 }, name: 'userId_index' },
        { key: { providerId: 1 }, name: 'providerId_index' },
    ];

    for (const index of indexes) {
        try {
            await collection.createIndex(index.key, {
                unique: index.unique || false,
                name: index.name,
            });
            console.log(`   ✅ Created index: ${index.name}`);
        } catch (error: any) {
            if (error.code === 85) {
                console.log(`   ⚠️  Index ${index.name} already exists`);
            } else if (error.code === 86) {
                console.log(`   ℹ️  Index ${index.name} already exists`);
            } else {
                console.error(`   ❌ Error creating index ${index.name}:`, error.message);
            }
        }
    }
}

/**
 * Create verification collection with indexes (including TTL for expired tokens)
 */
async function createVerificationCollection(db: Db) {
    console.log('📦 Creating verification collection...');
    const collection = db.collection<AuthVerificationModel>('verification');

    // Create indexes
    const indexes = [
        { key: { identifier: 1, token: 1 }, unique: true, name: 'identifier_token_unique' },
        { key: { token: 1 }, unique: true, name: 'token_unique' },
        { key: { identifier: 1 }, name: 'identifier_index' },
        { key: { expiresAt: 1 }, name: 'expiresAt_ttl', expireAfterSeconds: 0 }, // TTL index
    ];

    for (const index of indexes) {
        try {
            if (index.name === 'expiresAt_ttl') {
                // TTL index - automatically deletes expired verification tokens
                await collection.createIndex(
                    { expiresAt: 1 },
                    { expireAfterSeconds: 0, name: 'expiresAt_ttl' }
                );
                console.log(`   ✅ Created TTL index: ${index.name}`);
            } else {
                await collection.createIndex(index.key, {
                    unique: index.unique || false,
                    name: index.name,
                });
                console.log(`   ✅ Created index: ${index.name}`);
            }
        } catch (error: any) {
            if (error.code === 85) {
                console.log(`   ⚠️  Index ${index.name} already exists`);
            } else if (error.code === 86) {
                console.log(`   ℹ️  Index ${index.name} already exists`);
            } else {
                console.error(`   ❌ Error creating index ${index.name}:`, error.message);
            }
        }
    }
}



/**
 * Setup demo galaxies - creates projects first, then links galaxies
 */
export async function setup(): Promise<void> {
    console.log('🔄 Setting up demo...')
    try {
        // Step 1: Setup better-auth collections and indexes
        console.log('🔐 Setting up better-auth...')
        await setupBetterAuth()
        console.log('✅ Better-auth setup completed\n')
    } catch (error) {
        console.error('Error setting up demo galaxies:', error)
        throw error
    }
}


