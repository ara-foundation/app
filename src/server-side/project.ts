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
 * Create a new project
 */
export async function createProject(project: Project): Promise<boolean> {
    try {
        const projectModel = projectToProjectModel(project)
        return await create<ProjectModel>('projects', projectModel)
    } catch (error) {
        console.error('Error creating project:', error)
        return false
    }
}
