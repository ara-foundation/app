import { MongoClient } from 'mongodb';
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
    const envFiles = ['.env', '.env.dev', '.env.local', '.env.production'];

    for (const envFile of envFiles) {
        const envPath = join(rootDir, envFile);
        const uri = getMongoUriFromFile(envPath);
        if (uri) {
            process.env.MONGODB_URI = uri;
            console.log(`✅ Loaded MONGODB_URI from ${envFile}`);
            break;
        }
    }
}

async function fixAuthIndexes() {
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

        const collection = db.collection('user');

        // Step 1: Clean up users with null or missing id
        console.log('🧹 Cleaning up users with null or missing id...');
        try {
            const result = await collection.deleteMany({
                $or: [
                    { id: null },
                    { id: { $exists: false } }
                ]
            });
            console.log(`   ✅ Cleaned up ${result.deletedCount} users with null or missing id`);
        } catch (error: any) {
            console.error(`   ❌ Error cleaning up null id users:`, error.message);
        }

        // Step 2: Drop existing indexes
        console.log('\n🔄 Dropping existing indexes...');
        const indexesToDrop = ['id_unique', 'username_unique'];
        for (const indexName of indexesToDrop) {
            try {
                await collection.dropIndex(indexName);
                console.log(`   ✅ Dropped index: ${indexName}`);
            } catch (error: any) {
                if (error.codeName === 'IndexNotFound') {
                    console.log(`   ℹ️  Index ${indexName} does not exist`);
                } else {
                    console.error(`   ❌ Error dropping index ${indexName}:`, error.message);
                }
            }
        }

        // Step 3: Recreate indexes as sparse
        console.log('\n📦 Creating sparse indexes...');
        
        // Create id_unique as sparse
        try {
            await collection.createIndex(
                { id: 1 },
                { unique: true, sparse: true, name: 'id_unique' }
            );
            console.log('   ✅ Created index: id_unique (sparse)');
        } catch (error: any) {
            console.error(`   ❌ Error creating id_unique index:`, error.message);
        }

        // Create username_unique as sparse
        try {
            await collection.createIndex(
                { username: 1 },
                { unique: true, sparse: true, name: 'username_unique' }
            );
            console.log('   ✅ Created index: username_unique (sparse)');
        } catch (error: any) {
            console.error(`   ❌ Error creating username_unique index:`, error.message);
        }

        // Step 4: Fix account collection indexes
        console.log('\n📦 Fixing account collection indexes...');
        const accountCollection = db.collection('account');

        // Clean up accounts with null accountId
        try {
            const result = await accountCollection.deleteMany({ 
                accountId: null as any
            });
            if (result.deletedCount > 0) {
                console.log(`   🧹 Cleaned up ${result.deletedCount} accounts with null accountId`);
            }
        } catch (error: any) {
            console.log(`   ℹ️  Could not clean up null accountId accounts: ${error.message}`);
        }

        // Drop existing provider_unique index
        try {
            await accountCollection.dropIndex('provider_unique');
            console.log('   🔄 Dropped old provider_unique index (will recreate as sparse)');
        } catch (error: any) {
            if (error.codeName === 'IndexNotFound') {
                console.log('   ℹ️  Index provider_unique does not exist');
            } else {
                console.error(`   ❌ Error dropping provider_unique index:`, error.message);
            }
        }

        // Recreate provider_unique as sparse
        try {
            await accountCollection.createIndex(
                { providerId: 1, accountId: 1 },
                { unique: true, sparse: true, name: 'provider_unique' }
            );
            console.log('   ✅ Created index: provider_unique (sparse)');
        } catch (error: any) {
            console.error(`   ❌ Error creating provider_unique index:`, error.message);
        }

        console.log('\n✅ Auth indexes fixed successfully!');

    } catch (error) {
        console.error('❌ Error fixing auth indexes:', error);
        throw error;
    } finally {
        await client.close();
        console.log('\n🔌 Database connection closed');
    }
}

// Run the fix
fixAuthIndexes()
    .then(() => {
        console.log('\n✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });

