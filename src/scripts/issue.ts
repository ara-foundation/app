import { ObjectId } from 'mongodb';
import { getCollection, create } from './db';
import type { IssueTag, IssueStatType, Issue, IssueStat, IssueUser } from '@/types/issue'

// Re-export types for backward compatibility
export { IssueTag, type IssueStatType, type Issue, type IssueStat, type IssueUser } from '@/types/issue'

// Server-side IssueStat (can use React.ReactNode for internal use)
interface IssueStatServer {
    type: IssueStatType;
    hint: React.ReactNode;
    filled?: boolean;
    children: React.ReactNode;
}

// Server-side IssueUser (uses Date for database operations)
interface IssueUserServer {
    username: string;
    starshineAmount: number;
    transactionDate: Date;
}

// Server-side IssueModel (uses ObjectId)
interface IssueModel {
    _id?: ObjectId;
    galaxy: ObjectId; // Reference to GalaxyModel
    uri: string;
    title: string;
    description: string;
    tags: IssueTag[];
    maintainer: ObjectId; // Reference to UserModel
    categoryId: string;
    stats?: {
        [key in IssueStatType]?: IssueStatServer;
    };
    createdTime?: Date;
    sunshines: number; // Cached sum of users sunshines
    users: IssueUserServer[]; // Array of users with their contributions
    author?: ObjectId; // Reference to UserModel who created the issue
}

// Serialization functions
function issueStatServerToIssueStat(stat: IssueStatServer | undefined): IssueStat | undefined {
    if (!stat) return undefined
    return {
        type: stat.type,
        hint: typeof stat.hint === 'string' ? stat.hint : String(stat.hint),
        filled: stat.filled,
        children: typeof stat.children === 'string' || typeof stat.children === 'number'
            ? stat.children
            : String(stat.children),
    }
}

function issueStatToIssueStatServer(stat: IssueStat | undefined): IssueStatServer | undefined {
    if (!stat) return undefined
    return {
        type: stat.type,
        hint: stat.hint,
        filled: stat.filled,
        children: stat.children,
    }
}

function issueUserServerToIssueUser(user: IssueUserServer): IssueUser {
    return {
        username: user.username,
        starshineAmount: user.starshineAmount,
        transactionDate: Math.floor(user.transactionDate.getTime() / 1000),
    }
}

function issueUserToIssueUserServer(user: IssueUser): IssueUserServer {
    return {
        username: user.username,
        starshineAmount: user.starshineAmount,
        transactionDate: new Date(user.transactionDate * 1000),
    }
}

function issueModelToIssue(model: IssueModel | null): Issue | null {
    if (!model) return null
    return {
        _id: model._id?.toString(),
        galaxy: model.galaxy.toString(),
        uri: model.uri,
        title: model.title,
        description: model.description,
        tags: model.tags,
        maintainer: model.maintainer.toString(),
        categoryId: model.categoryId,
        stats: model.stats ? Object.fromEntries(
            Object.entries(model.stats).map(([key, value]) => [
                key,
                issueStatServerToIssueStat(value)
            ]).filter(([_, value]) => value !== undefined)
        ) as { [key in IssueStatType]?: IssueStat } : undefined,
        createdTime: model.createdTime ? Math.floor(model.createdTime.getTime() / 1000) : undefined,
        sunshines: model.sunshines,
        users: model.users.map(issueUserServerToIssueUser),
        author: model.author?.toString(),
    }
}

function issueToIssueModel(issue: Issue): IssueModel {
    return {
        _id: issue._id ? new ObjectId(issue._id) : undefined,
        galaxy: new ObjectId(issue.galaxy),
        uri: issue.uri,
        title: issue.title,
        description: issue.description,
        tags: issue.tags,
        maintainer: new ObjectId(issue.maintainer),
        categoryId: issue.categoryId,
        stats: issue.stats ? Object.fromEntries(
            Object.entries(issue.stats).map(([key, value]) => [
                key,
                issueStatToIssueStatServer(value)
            ]).filter(([_, value]) => value !== undefined)
        ) as { [key in IssueStatType]?: IssueStatServer } : undefined,
        createdTime: issue.createdTime ? new Date(issue.createdTime * 1000) : undefined,
        sunshines: issue.sunshines,
        users: issue.users.map(issueUserToIssueUserServer),
        author: issue.author ? new ObjectId(issue.author) : undefined,
    }
}

/**
 * Get issues by galaxy ID
 */
export async function getIssuesByGalaxy(galaxyId: string | ObjectId): Promise<Issue[]> {
    try {
        const collection = await getCollection<IssueModel>('issues');
        const objectId = typeof galaxyId === 'string' ? new ObjectId(galaxyId) : galaxyId;
        const result = await collection.find({ galaxy: objectId }).toArray();
        return result.map(issueModelToIssue).filter((i): i is Issue => i !== null);
    } catch (error) {
        console.error('Error getting issues by galaxy:', error);
        return [];
    }
}

/**
 * Get issue by ID
 */
export async function getIssueById(id: string | ObjectId): Promise<Issue | null> {
    try {
        const collection = await getCollection<IssueModel>('issues');
        const objectId = typeof id === 'string' ? new ObjectId(id) : id;
        const result = await collection.findOne({ _id: objectId });
        return issueModelToIssue(result);
    } catch (error) {
        console.error('Error getting issue by id:', error);
        return null;
    }
}

/**
 * Create a new issue
 */
export async function createIssue(issue: Issue): Promise<boolean> {
    try {
        const issueModel = issueToIssueModel(issue);
        return await create<IssueModel>('issues', issueModel);
    } catch (error) {
        console.error('Error creating issue:', error);
        return false;
    }
}

/**
 * Get shining issues (issues with sunshines > 0)
 */
export async function getShiningIssues(galaxyId: string | ObjectId): Promise<Issue[]> {
    try {
        const collection = await getCollection<IssueModel>('issues');
        const objectId = typeof galaxyId === 'string' ? new ObjectId(galaxyId) : galaxyId;
        const result = await collection.find({
            galaxy: objectId,
            sunshines: { $gt: 0 }
        }).toArray();
        return result.map(issueModelToIssue).filter((i): i is Issue => i !== null);
    } catch (error) {
        console.error('Error getting shining issues:', error);
        return [];
    }
}

/**
 * Get public backlog issues (issues with sunshines === 0)
 */
export async function getPublicBacklogIssues(galaxyId: string | ObjectId): Promise<Issue[]> {
    try {
        const collection = await getCollection<IssueModel>('issues');
        const objectId = typeof galaxyId === 'string' ? new ObjectId(galaxyId) : galaxyId;
        const result = await collection.find({
            galaxy: objectId,
            sunshines: 0
        }).toArray();
        return result.map(issueModelToIssue).filter((i): i is Issue => i !== null);
    } catch (error) {
        console.error('Error getting public backlog issues:', error);
        return [];
    }
}

