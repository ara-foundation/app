import { MongoClient, ObjectId } from 'mongodb';
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

async function showBlogs() {
    loadEnv();

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('❌ MONGODB_URI not found in environment variables');
        process.exit(1);
    }

    const client = new MongoClient(mongoUri);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB\n');

        const db = client.db('Ara');
        const blogsCollection = db.collection('blogs');
        const usersCollection = db.collection('users');

        // Get all blogs
        const blogs = await blogsCollection.find({}).sort({ createdTime: -1 }).toArray();

        console.log(`📚 Found ${blogs.length} blog(s) in database:\n`);

        for (const blog of blogs) {
            // Get author info
            const author = await usersCollection.findOne({ _id: blog.author });
            const authorName = author?.nickname || author?.email || 'Unknown';

            console.log('─'.repeat(80));
            console.log(`📝 Title: ${blog.title}`);
            console.log(`   ID: ${blog._id}`);
            console.log(`   Author: ${authorName} (${blog.author})`);
            console.log(`   Description: ${blog.description || 'N/A'}`);
            console.log(`   Tags: ${blog.tags?.join(', ') || 'None'}`);
            console.log(`   Projects: ${blog.projects?.length || 0} linked`);
            console.log(`   Project Types: ${blog.projectTypes?.join(', ') || 'None'}`);
            console.log(`   Draft: ${blog.draft ? 'Yes' : 'No'}`);
            console.log(`   Created: ${blog.createdTime?.toISOString() || 'N/A'}`);
            console.log(`   Updated: ${blog.updatedTime?.toISOString() || 'N/A'}`);
            console.log(`   Content Length: ${blog.content?.length || 0} characters`);
            console.log(`   Content Preview: ${(blog.content || '').substring(0, 100)}...`);
            console.log('');
        }

        console.log('─'.repeat(80));
        console.log(`\n✨ Total: ${blogs.length} blog(s)`);

    } catch (error) {
        console.error('❌ Error showing blogs:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run
showBlogs().catch(console.error);
