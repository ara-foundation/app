import { MongoClient, Db, ObjectId } from 'mongodb';
import { readFileSync, readdirSync } from 'fs';
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

// Simple YAML frontmatter parser
function parseFrontmatter(content: string): { frontmatter: Record<string, any>, body: string } {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
        return { frontmatter: {}, body: content };
    }

    const frontmatterText = match[1];
    const body = match[2];
    const frontmatter: Record<string, any> = {};

    // Simple YAML parser for key-value pairs
    for (const line of frontmatterText.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const colonIndex = trimmed.indexOf(':');
        if (colonIndex === -1) continue;

        const key = trimmed.substring(0, colonIndex).trim();
        let value: any = trimmed.substring(colonIndex + 1).trim();

        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        // Parse arrays
        if (value.startsWith('[') && value.endsWith(']')) {
            const arrayContent = value.slice(1, -1);
            value = arrayContent.split(',').map(item => {
                const trimmed = item.trim();
                if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
                    (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
                    return trimmed.slice(1, -1);
                }
                return trimmed;
            });
        }

        // Parse booleans
        if (value === 'true') value = true;
        if (value === 'false') value = false;

        // Parse dates
        if (key === 'date' && typeof value === 'string') {
            try {
                value = new Date(value);
            } catch (e) {
                // Keep as string if parsing fails
            }
        }

        frontmatter[key] = value;
    }

    return { frontmatter, body };
}

async function migrateBlogs() {
    loadEnv();

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('❌ MONGODB_URI not found in environment variables');
        process.exit(1);
    }

    const client = new MongoClient(mongoUri);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db('Ara');
        const blogsCollection = db.collection('blogs');
        const usersCollection = db.collection('users');

        // Find maintainer user by email or username
        const maintainer = await usersCollection.findOne({
            $or: [
                { email: 'milayter@gmail.com' },
                { nickname: 'ahmetson' }
            ]
        });

        if (!maintainer || !maintainer._id) {
            console.error('❌ Maintainer user not found (email: milayter@gmail.com or username: ahmetson)');
            process.exit(1);
        }

        console.log(`✅ Found maintainer: ${maintainer.nickname || maintainer.email} (${maintainer._id})`);

        // Read blog files from ara-v2
        const blogDir = '/home/medet/ara-v2/src/content/blog';
        const blogFiles = readdirSync(blogDir).filter(file =>
            file.endsWith('.md') && file !== '-index.md'
        );

        console.log(`📝 Found ${blogFiles.length} blog files to migrate`);

        let migrated = 0;
        let skipped = 0;

        for (const file of blogFiles) {
            const filePath = join(blogDir, file);
            const content = readFileSync(filePath, 'utf-8');
            const { frontmatter, body } = parseFrontmatter(content);

            // Check if blog already exists (by title and author)
            const existing = await blogsCollection.findOne({
                title: frontmatter.title,
                author: maintainer._id
            });

            if (existing) {
                console.log(`⏭️  Skipping "${frontmatter.title}" (already exists)`);
                skipped++;
                continue;
            }

            // Parse date
            let createdTime: Date | undefined;
            if (frontmatter.date) {
                createdTime = frontmatter.date instanceof Date
                    ? frontmatter.date
                    : new Date(frontmatter.date);
            } else {
                createdTime = new Date(); // Use current date if not provided
            }

            // Create blog document
            const blogDoc = {
                author: maintainer._id,
                title: frontmatter.title || 'Untitled',
                content: body.trim(),
                description: frontmatter.description || frontmatter.meta_title || undefined,
                tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : (frontmatter.tags ? [frontmatter.tags] : []),
                projects: [], // No projects linked initially
                projectTypes: [], // No project types initially
                createdTime,
                updatedTime: undefined,
                draft: frontmatter.draft === true,
            };

            await blogsCollection.insertOne(blogDoc);
            console.log(`✅ Migrated: "${frontmatter.title}"`);
            migrated++;
        }

        console.log(`\n✨ Migration complete!`);
        console.log(`   Migrated: ${migrated}`);
        console.log(`   Skipped: ${skipped}`);

    } catch (error) {
        console.error('❌ Error during migration:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run migration
migrateBlogs().catch(console.error);
