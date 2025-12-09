import { ObjectId } from 'mongodb';
import { getCollection, create } from './db';
import type { Patch, Version } from '@/types/roadmap'

// Re-export types for backward compatibility
export { type Patch, type Version } from '@/types/roadmap'

// Server-side PatchModel
interface PatchModel {
    issueId: ObjectId; // Reference to IssueModel
    completed: boolean;
    title: string;
}

// Server-side VersionModel (uses ObjectId)
interface VersionModel {
    _id?: ObjectId;
    galaxy: ObjectId; // Reference to GalaxyModel
    tag: string;
    createdTime: Date;
    status: 'completed' | 'active' | 'planned';
    patches: PatchModel[];
    maintainer: ObjectId; // Reference to UserModel
}

// Serialization functions
function patchModelToPatch(model: PatchModel): Patch {
    return {
        id: model.issueId.toString(),
        completed: model.completed,
        title: model.title,
    }
}

function patchToPatchModel(patch: Patch): PatchModel {
    return {
        issueId: new ObjectId(patch.id),
        completed: patch.completed,
        title: patch.title,
    }
}

function versionModelToVersion(model: VersionModel | null): Version | null {
    if (!model) return null
    return {
        _id: model._id?.toString(),
        galaxy: model.galaxy.toString(),
        tag: model.tag,
        createdTime: Math.floor(model.createdTime.getTime() / 1000),
        status: model.status,
        patches: model.patches.map(patchModelToPatch),
        maintainer: model.maintainer.toString(),
    }
}

function versionToVersionModel(version: Version): VersionModel {
    return {
        _id: version._id ? new ObjectId(version._id) : undefined,
        galaxy: new ObjectId(version.galaxy),
        tag: version.tag,
        createdTime: new Date(version.createdTime * 1000),
        status: version.status,
        patches: version.patches.map(patchToPatchModel),
        maintainer: new ObjectId(version.maintainer),
    }
}

/**
 * Get versions by galaxy ID
 */
export async function getVersionsByGalaxy(galaxyId: string | ObjectId): Promise<Version[]> {
    try {
        const collection = await getCollection<VersionModel>('versions');
        const objectId = typeof galaxyId === 'string' ? new ObjectId(galaxyId) : galaxyId;
        const result = await collection.find({ galaxy: objectId }).toArray();
        return result.map(versionModelToVersion).filter((v): v is Version => v !== null);
    } catch (error) {
        console.error('Error getting versions by galaxy:', error);
        return [];
    }
}

/**
 * Get version by ID
 */
export async function getVersionById(versionId: string | ObjectId): Promise<Version | null> {
    try {
        const collection = await getCollection<VersionModel>('versions');
        const objectId = typeof versionId === 'string' ? new ObjectId(versionId) : versionId;
        const result = await collection.findOne({ _id: objectId });
        return versionModelToVersion(result);
    } catch (error) {
        console.error('Error getting version by id:', error);
        return null;
    }
}

/**
 * Create a new version
 */
export async function createVersion(version: Version): Promise<boolean> {
    try {
        const versionModel = versionToVersionModel(version);
        return await create<VersionModel>('versions', versionModel);
    } catch (error) {
        console.error('Error creating version:', error);
        return false;
    }
}

/**
 * Update version status
 */
export async function updateVersionStatus(
    versionId: string | ObjectId,
    status: 'completed' | 'active' | 'planned'
): Promise<boolean> {
    try {
        const collection = await getCollection<VersionModel>('versions');
        const objectId = typeof versionId === 'string' ? new ObjectId(versionId) : versionId;

        const result = await collection.updateOne(
            { _id: objectId },
            {
                $set: {
                    status,
                },
            }
        );
        return result.modifiedCount > 0;
    } catch (error) {
        console.error('Error updating version status:', error);
        return false;
    }
}

/**
 * Revert a patch (remove patch from version)
 */
export async function revertPatch(
    galaxyId: string | ObjectId,
    versionTag: string,
    issueId: string | ObjectId
): Promise<boolean> {
    try {
        const collection = await getCollection<VersionModel>('versions');
        const galaxyObjectId = typeof galaxyId === 'string' ? new ObjectId(galaxyId) : galaxyId;
        const issueObjectId = typeof issueId === 'string' ? new ObjectId(issueId) : issueId;

        // Get the version
        const version = await collection.findOne({
            galaxy: galaxyObjectId,
            tag: versionTag,
        });

        if (!version) {
            return false;
        }

        // Remove the patch from patches array
        const updatedPatches = version.patches.filter(
            patch => !patch.issueId.equals(issueObjectId)
        );

        const result = await collection.updateOne(
            { _id: version._id },
            {
                $set: {
                    patches: updatedPatches,
                },
            }
        );
        return result.modifiedCount > 0;
    } catch (error) {
        console.error('Error reverting patch:', error);
        return false;
    }
}

/**
 * Update patches array for a version
 */
export async function updatePatches(
    versionId: string | ObjectId,
    patches: Patch[]
): Promise<boolean> {
    try {
        const collection = await getCollection<VersionModel>('versions');
        const objectId = typeof versionId === 'string' ? new ObjectId(versionId) : versionId;

        const patchModels = patches.map(patchToPatchModel);

        const result = await collection.updateOne(
            { _id: objectId },
            {
                $set: {
                    patches: patchModels,
                },
            }
        );
        return result.modifiedCount > 0;
    } catch (error) {
        console.error('Error updating patches:', error);
        return false;
    }
}

/**
 * Remove a patch from a version by patchId
 */
export async function removePatch(
    patchId: string | ObjectId,
    versionId: string | ObjectId
): Promise<boolean> {
    try {
        const collection = await getCollection<VersionModel>('versions');
        const versionObjectId = typeof versionId === 'string' ? new ObjectId(versionId) : versionId;
        const patchObjectId = typeof patchId === 'string' ? new ObjectId(patchId) : patchId;

        // Find version and remove patch in one operation
        const result = await collection.updateOne(
            { _id: versionObjectId },
            {
                $pull: {
                    patches: { issueId: patchObjectId },
                },
            }
        );
        return result.modifiedCount > 0;
    } catch (error) {
        console.error('Error removing patch:', error);
        return false;
    }
}

