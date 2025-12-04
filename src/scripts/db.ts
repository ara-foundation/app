import { MongoClient, Db, Collection, Filter, OptionalUnlessRequiredId } from 'mongodb'

interface WishlistModel {
    _id?: any
    email: string
    time: number
}

let client: MongoClient | null = null
let db: Db | null = null
let isConnected = false
let dbInitialized = false

const DB_NAME = 'Ara'

async function getClient(): Promise<MongoClient> {
    if (!client) {
        const uri = import.meta.env.MONGODB_URI
        if (!uri) {
            throw new Error('MONGODB_URI environment variable is not set')
        }
        client = new MongoClient(uri)
        await client.connect()
        isConnected = true
        console.log('✅ Database connected successfully')
    }
    return client
}

async function getDb(): Promise<Db> {
    if (!db) {
        const mongoClient = await getClient()
        db = mongoClient.db(DB_NAME)

        // Check if database exists
        try {
            const adminDb = mongoClient.db('admin').admin()
            const databases = await adminDb.listDatabases()
            const dbExists = databases.databases.some((d: { name: string }) => d.name === DB_NAME)

            if (!dbExists) {
                // Create database by creating a collection (MongoDB creates DB implicitly)
                // We'll create a dummy collection to ensure the database exists
                const tempCollection = db.collection('_init')
                await tempCollection.insertOne({ _init: true, createdAt: new Date() })
                await tempCollection.deleteOne({ _init: true })
                console.log(`✅ Database '${DB_NAME}' created`)
                dbInitialized = true
            } else {
                console.log(`✅ Database '${DB_NAME}' already exists`)
                dbInitialized = false
            }
        } catch (error) {
            // If we can't check, assume it doesn't exist and create it
            console.log(`⚠️  Could not check database existence, creating '${DB_NAME}'...`)
            const tempCollection = db.collection('_init')
            await tempCollection.insertOne({ _init: true, createdAt: new Date() })
            await tempCollection.deleteOne({ _init: true })
            console.log(`✅ Database '${DB_NAME}' created`)
            dbInitialized = true
        }

        console.log(`📊 Database name: ${DB_NAME}`)
        console.log(`🔌 Connection status: ${isConnected ? 'Connected' : 'Disconnected'}`)
        console.log(`🆕 Database was created: ${dbInitialized ? 'Yes' : 'No (already existed)'}`)
    }
    return db
}

/**
 * Get a collection for custom queries.
 * Checkout the [Node MongoDB Docs](https://mongodb.github.io/node-mongodb-native/6.10/classes/Collection.html) 
 * for using the collection.
 * @param collectionName 
 * @returns 
 */
export async function getCollection<ModelType extends object>(collectionName: string): Promise<Collection<ModelType>> {
    const database = await getDb()
    return database.collection<ModelType>(collectionName)
}

/**
 * Check if a document exists in the collection
 * @param collectionName 
 * @param filter 
 * @returns 
 */
export async function exists<ModelType extends object>(collectionName: string, filter: Filter<ModelType>): Promise<boolean> {
    try {
        const collection = await getCollection<ModelType>(collectionName)
        const result = await collection.findOne(filter)
        return result !== null
    } catch (error) {
        console.error('Error checking if document exists:', error)
        return false
    }
}

/**
 * Create a new document in the collection
 * @param collectionName 
 * @param document 
 * @returns 
 */
export async function create<ModelType extends object>(collectionName: string, document: ModelType): Promise<boolean> {
    try {
        const collection = await getCollection<ModelType>(collectionName)
        await collection.insertOne(document as OptionalUnlessRequiredId<ModelType>)
        return true
    } catch (error) {
        console.error('Error creating document:', error)
        return false
    }
}

