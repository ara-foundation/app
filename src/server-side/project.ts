import { ObjectId } from 'mongodb';
import { getCollection, create } from './db'
import type { ForkLine, Project } from '@/types/project'

interface ForkLineModel extends Omit<ForkLine, 'from' | 'via' | 'to'> {
    from: ObjectId; // Source project ID
    via: ObjectId[]; // Array of issue IDs
    to: ObjectId; // Target project ID
}

interface ProjectModel extends Omit<Project, '_id' | 'forkLines'> {
    _id?: ObjectId;
    forkLines: ForkLineModel[];
}

// Serialization functions
function projectModelToProject(model: ProjectModel | null): Project | null {
    if (!model) return null
    return {
        _id: model._id?.toString(),
        forkLines: model.forkLines.map(fl => ({
            from: fl.from.toString(),
            via: fl.via.map(v => v.toString()),
            to: fl.to.toString(),
        })),
        socialLinks: model.socialLinks,
        createdAt: model.createdAt,
        lastCommitId: model.lastCommitId,
        lastCommitUpdateTime: model.lastCommitUpdateTime,
        license: model.license,
        totalCommits: model.totalCommits,
        branchName: model.branchName,
    }
}

function projectToProjectModel(project: Project): ProjectModel {
    return {
        _id: project._id ? new ObjectId(project._id) : undefined,
        forkLines: project.forkLines.map(fl => ({
            from: new ObjectId(fl.from),
            via: fl.via.map(v => new ObjectId(v)),
            to: new ObjectId(fl.to),
        })),
        socialLinks: project.socialLinks,
        createdAt: project.createdAt,
        lastCommitId: project.lastCommitId,
        lastCommitUpdateTime: project.lastCommitUpdateTime,
        license: project.license,
        totalCommits: project.totalCommits,
        branchName: project.branchName,
    }
}

/**
 * Get project by ID
 */
export async function getProjectById(id: string | ObjectId): Promise<Project | null> {
    try {
        const collection = await getCollection<ProjectModel>('projects')
        const objectId = typeof id === 'string' ? new ObjectId(id) : id
        const result = await collection.findOne({ _id: objectId })
        return projectModelToProject(result)
    } catch (error) {
        console.error('Error getting project by id:', error)
        return null
    }
}

/**
 * Normalize Git URL for comparison (shared utility)
 */
function normalizeGitUrlForComparison(gitUrl: string): string {
    let normalizedUrl = gitUrl.trim()
    // Remove .git suffix
    if (normalizedUrl.endsWith('.git')) {
        normalizedUrl = normalizedUrl.slice(0, -4)
    }
    // Convert SSH to HTTPS format
    if (normalizedUrl.startsWith('git@')) {
        normalizedUrl = normalizedUrl.replace('git@', 'https://').replace(':', '/')
    }
    // Remove trailing slash
    normalizedUrl = normalizedUrl.replace(/\/$/, '')
    return normalizedUrl
}

/**
 * Check if a project with the given Git URL already exists in socialLinks
 */
export async function checkDuplicateGitUrl(gitUrl: string): Promise<boolean> {
    try {
        const collection = await getCollection<ProjectModel>('projects')
        const normalizedUrl = normalizeGitUrlForComparison(gitUrl)

        // Check if any project has this URL in socialLinks (case-insensitive, exact match preferred)
        // First try exact match
        const exactMatch = await collection.findOne({
            'socialLinks.uri': normalizedUrl
        })
        if (exactMatch) return true

        // Also check case-insensitive match
        const caseInsensitiveMatch = await collection.findOne({
            'socialLinks.uri': { $regex: `^${normalizedUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
        })
        return caseInsensitiveMatch !== null
    } catch (error) {
        console.error('Error checking duplicate Git URL:', error)
        return false
    }
}

/**
 * Create indexes on socialLinks for quick lookup
 */
export async function createProjectIndexes(): Promise<void> {
    try {
        const collection = await getCollection<ProjectModel>('projects')

        // Create index on socialLinks.uri for fast duplicate checking
        await collection.createIndex({ 'socialLinks.uri': 1 })

        // Create index on socialLinks.type for filtering
        await collection.createIndex({ 'socialLinks.type': 1 })

        console.log('✅ Created indexes on projects collection')
    } catch (error) {
        console.error('Error creating project indexes:', error)
    }
}

/**
 * Get or create a project (returns project ID as string)
 * Checks for duplicates by matching socialLinks URIs
 */
export async function getOrCreateProject(project: Omit<Project, '_id'>): Promise<string> {
    try {
        const collection = await getCollection<ProjectModel>('projects')

        // Check if project already exists by matching socialLinks
        // Find GitHub or GitLab link
        const gitLink = project.socialLinks.find(link => link.type === 'github' || link.type === 'gitlab')
        if (gitLink) {
            // Normalize the URL for comparison
            const normalizedUrl = normalizeGitUrlForComparison(gitLink.uri)

            // Try exact match first
            let existing = await collection.findOne({
                'socialLinks.uri': normalizedUrl
            })

            // If not found, try case-insensitive match
            if (!existing) {
                existing = await collection.findOne({
                    'socialLinks.uri': { $regex: `^${normalizedUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
                })
            }

            // Also try with original URL (in case it wasn't normalized in DB)
            if (!existing) {
                existing = await collection.findOne({
                    'socialLinks.uri': gitLink.uri
                })
            }

            if (existing && existing._id) {
                return existing._id.toString()
            }
        }

        // Create new project
        const projectModel = projectToProjectModel(project as Project)
        const result = await collection.insertOne(projectModel as any)
        return result.insertedId.toString()
    } catch (error) {
        console.error('Error getting or creating project:', error)
        throw error
    }
}

/**
 * Create a new project
 */
export async function createProject(project: Project): Promise<boolean> {
    try {
        // Check for duplicate Git URL before creating
        const gitLink = project.socialLinks.find(link =>
            link.type === 'github' || link.type === 'gitlab'
        )
        if (gitLink) {
            const isDuplicate = await checkDuplicateGitUrl(gitLink.uri)
            if (isDuplicate) {
                console.error('Project with this Git URL already exists:', gitLink.uri)
                return false
            }
        }

        const projectModel = projectToProjectModel(project)
        return await create<ProjectModel>('projects', projectModel)
    } catch (error) {
        console.error('Error creating project:', error)
        return false
    }
}
