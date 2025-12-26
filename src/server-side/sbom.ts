import { ObjectId } from 'mongodb';
import { getCollection, create } from './db';
import type { SBOM } from '@/types/sbom';

interface SBOMModel extends Omit<SBOM, '_id' | 'projectId'> {
    _id?: ObjectId;
    projectId: ObjectId;
}

function sbomModelToSBOM(model: SBOMModel | null): SBOM | null {
    if (!model) return null;
    return {
        _id: model._id?.toString(),
        projectId: model.projectId.toString(),
        gitUrl: model.gitUrl,
        provider: model.provider,
        sbomData: model.sbomData,
        dependencies: model.dependencies,
        source: model.source,
        completeness: model.completeness,
        detectedAt: model.detectedAt,
    };
}

function sbomToSBOMModel(sbom: SBOM): SBOMModel {
    return {
        _id: sbom._id ? new ObjectId(sbom._id) : undefined,
        projectId: new ObjectId(sbom.projectId),
        gitUrl: sbom.gitUrl,
        provider: sbom.provider,
        sbomData: sbom.sbomData,
        dependencies: sbom.dependencies,
        source: sbom.source,
        completeness: sbom.completeness,
        detectedAt: sbom.detectedAt,
    };
}

/**
 * Create a new SBOM record
 */
export async function createSBOM(sbom: SBOM): Promise<boolean> {
    try {
        const sbomModel = sbomToSBOMModel(sbom);
        return await create<SBOMModel>('sboms', sbomModel);
    } catch (error) {
        console.error('Error creating SBOM:', error);
        return false;
    }
}

/**
 * Get SBOM by project ID
 */
export async function getSBOMByProjectId(projectId: string): Promise<SBOM | null> {
    try {
        const collection = await getCollection<SBOMModel>('sboms');
        const objectId = new ObjectId(projectId);
        const result = await collection.findOne({ projectId: objectId });
        return sbomModelToSBOM(result);
    } catch (error) {
        console.error('Error getting SBOM by project ID:', error);
        return null;
    }
}

/**
 * Get SBOM by Git URL
 */
export async function getSBOMByGitUrl(gitUrl: string): Promise<SBOM | null> {
    try {
        const collection = await getCollection<SBOMModel>('sboms');
        const result = await collection.findOne({ gitUrl });
        return sbomModelToSBOM(result);
    } catch (error) {
        console.error('Error getting SBOM by Git URL:', error);
        return null;
    }
}

