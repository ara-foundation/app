import { ObjectId } from 'mongodb';
import { getCollection, create } from './db'

export interface ForkLine {
    from: ObjectId; // Source project ID
    via: ObjectId[]; // Array of issue IDs
    to: ObjectId; // Target project ID
}

export interface SocialLink {
    label: string;
    uri: string;
    type?: 'github' | 'blockchain-explorer' | 'documentation' | 'project' | string;
}

export interface ProjectModel {
    _id?: ObjectId;
    uri: string;
    forkLines: ForkLine[];
    socialLinks: SocialLink[];
    createdAt?: Date;
    lastCommitId?: string;
    lastCommitUpdateTime?: Date;
    license?: string;
    totalCommits?: number;
}

/**
 * Get project by ID
 */
export async function getProjectById(id: string | ObjectId): Promise<ProjectModel | null> {
    try {
        const collection = await getCollection<ProjectModel>('projects')
        const objectId = typeof id === 'string' ? new ObjectId(id) : id
        const result = await collection.findOne({ _id: objectId })
        return result
    } catch (error) {
        console.error('Error getting project by id:', error)
        return null
    }
}

/**
 * Get project by URI
 */
export async function getProjectByUri(uri: string): Promise<ProjectModel | null> {
    try {
        const collection = await getCollection<ProjectModel>('projects')
        const result = await collection.findOne({ uri })
        return result
    } catch (error) {
        console.error('Error getting project by uri:', error)
        return null
    }
}

/**
 * Create a new project
 */
export async function createProject(project: ProjectModel): Promise<boolean> {
    try {
        return await create<ProjectModel>('projects', project)
    } catch (error) {
        console.error('Error creating project:', error)
        return false
    }
}

/**
 * Get or create a project - returns the project ID
 */
export async function getOrCreateProject(projectData: Omit<ProjectModel, '_id'>): Promise<ObjectId> {
    try {
        const collection = await getCollection<ProjectModel>('projects')

        // Try to find existing project by URI
        const existing = await collection.findOne({ uri: projectData.uri })
        if (existing && existing._id) {
            return existing._id
        }

        // Create new project
        const result = await collection.insertOne(projectData as any)
        if (result.insertedId) {
            return result.insertedId
        }

        throw new Error('Failed to create project')
    } catch (error) {
        console.error('Error getting or creating project:', error)
        throw error
    }
}

// Legacy type for backward compatibility
export type ProjectInfo = {
    id: string
    name: string
    repository: string
    forkId?: string
}