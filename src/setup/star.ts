import { MongoClient, Db } from 'mongodb';
import type { StarModel } from '@/server-side/star';
import dotenv from 'dotenv';
dotenv.config();

function loadEnv() {
    if (typeof process === 'undefined' || !process.env) {
        return;
    }

    // Load environment variables if needed
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not set');
    }
}

/**
 * Setup stars MongoDB collection and indexes
 * Creates the following:
 * - stars: Star records with unique userId index
 */
export async function setup(): Promise<void> {
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

        // Create stars collection and indexes
        await createStarsCollection(db);

        console.log('\n✅ Stars collection setup completed successfully!');
        console.log('\nCollection created:');
        console.log('  - stars');

    } catch (error) {
        console.error('❌ Error setting up stars collection:', error);
        throw error;
    } finally {
        await client.close();
        console.log('\n🔌 Database connection closed');
    }
}

/**
 * Create stars collection with indexes
 */
async function createStarsCollection(db: Db) {
    console.log('📦 Creating stars collection...');
    const collection = db.collection<StarModel>('stars');

    // Create indexes
    const indexes = [
        { key: { userId: 1 }, unique: true, name: 'userId_unique' },
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
                console.log(`   ⚠️  Index ${index.name} already exists with different options`);
            } else if (error.code === 86) {
                // Index already exists
                console.log(`   ℹ️  Index ${index.name} already exists`);
            } else {
                console.error(`   ❌ Error creating index ${index.name}:`, error.message);
            }
        }
    }
}

