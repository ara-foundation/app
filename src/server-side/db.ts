import { MongoClient, Db, Collection, Filter, OptionalUnlessRequiredId } from 'mongodb'

let client: MongoClient | null = null
let db: Db | null = null
let isConnected = false

const DB_NAME = 'Ara'

export async function getClient(): Promise<MongoClient> {
    if (!client) {
        const uri = import.meta.env.MONGODB_URI
        if (!uri) {
            throw new Error('MONGODB_URI environment variable is not set');
        }
        client = new MongoClient(uri);
        await client.connect();
        isConnected = true;
        return client;
    }
    return client;
}

export async function getDb(): Promise<Db> {
    if (!db) {
        const mongoClient = await getClient();
        db = mongoClient.db(DB_NAME)

        console.log(`📊 Database name: ${DB_NAME}`)
        console.log(`🔌 Connection status: ${isConnected ? 'Connected' : 'Disconnected'}`)
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
    const database = await getDb();
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

