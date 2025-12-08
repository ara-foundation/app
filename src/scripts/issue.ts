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
    listHistory?: string[]; // Track issue location history (e.g., ['patcher'])
    stats?: {
        [key in IssueStatType]?: IssueStatServer;
    };
    createdTime?: Date;
    sunshines: number; // Cached sum of users sunshines
    users: IssueUserServer[]; // Array of users with their contributions
    author?: ObjectId; // Reference to UserModel who created the issue
    contributor?: ObjectId; // Reference to UserModel assigned as contributor
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
        listHistory: model.listHistory,
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
        contributor: model.contributor?.toString(),
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
        listHistory: issue.listHistory,
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
        contributor: issue.contributor ? new ObjectId(issue.contributor) : undefined,
    }
}

/**
 * Get issues by galaxy ID
 * @param galaxyId - The galaxy ID
 * @param tabKey - Optional tab key to filter issues by listHistory
 */
export async function getIssuesByGalaxy(galaxyId: string | ObjectId, tabKey?: string): Promise<Issue[]> {
    try {
        const collection = await getCollection<IssueModel>('issues');
        const objectId = typeof galaxyId === 'string' ? new ObjectId(galaxyId) : galaxyId;

        // Build query based on whether tabKey is provided
        const query: any = { galaxy: objectId };
        if (tabKey) {
            query.listHistory = { $in: [tabKey] };
        }

        const result = await collection.find(query).toArray();
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

/**
 * Update issue sunshines and add/update user contribution
 */
export async function updateIssueSunshines(
    issueId: string | ObjectId,
    userId: string | ObjectId,
    username: string,
    sunshinesToAdd: number
): Promise<boolean> {
    try {
        const collection = await getCollection<IssueModel>('issues');
        const issueObjectId = typeof issueId === 'string' ? new ObjectId(issueId) : issueId;
        const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;

        // Get current issue
        const issue = await collection.findOne({ _id: issueObjectId });
        if (!issue) {
            return false;
        }

        // Find existing user contribution
        const existingUserIndex = issue.users.findIndex(
            (u) => u.username === username
        );

        const newSunshines = issue.sunshines + sunshinesToAdd;
        const transactionDate = new Date();

        if (existingUserIndex >= 0) {
            // Update existing user contribution
            const updatedUsers = [...issue.users];
            updatedUsers[existingUserIndex] = {
                username,
                starshineAmount: updatedUsers[existingUserIndex].starshineAmount + sunshinesToAdd,
                transactionDate,
            };

            const result = await collection.updateOne(
                { _id: issueObjectId },
                {
                    $set: {
                        sunshines: newSunshines,
                        users: updatedUsers,
                    },
                }
            );
            return result.modifiedCount > 0;
        } else {
            // Add new user contribution
            const newUser: IssueUserServer = {
                username,
                starshineAmount: sunshinesToAdd,
                transactionDate,
            };

            const result = await collection.updateOne(
                { _id: issueObjectId },
                {
                    $set: { sunshines: newSunshines },
                    $push: { users: newUser },
                }
            );
            return result.modifiedCount > 0;
        }
    } catch (error) {
        console.error('Error updating issue sunshines:', error);
        return false;
    }
}

/**
 * Set contributor for an issue and add user to users array if not present
 */
export async function setIssueContributor(
    issueId: string | ObjectId,
    userId: string | ObjectId,
    username: string
): Promise<boolean> {
    try {
        const collection = await getCollection<IssueModel>('issues');
        const issueObjectId = typeof issueId === 'string' ? new ObjectId(issueId) : issueId;
        const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;

        // Get current issue
        const issue = await collection.findOne({ _id: issueObjectId });
        if (!issue) {
            return false;
        }

        // Check if user is already in users array
        const existingUserIndex = issue.users.findIndex(
            (u) => u.username === username
        );

        const updateOps: any = {
            $set: {
                contributor: userObjectId,
            },
        };

        // If user is not in users array, add them with 0 sunshines
        if (existingUserIndex < 0) {
            const newUser: IssueUserServer = {
                username,
                starshineAmount: 0,
                transactionDate: new Date(),
            };
            updateOps.$push = { users: newUser };
        }

        const result = await collection.updateOne(
            { _id: issueObjectId },
            updateOps
        );
        return result.modifiedCount > 0;
    } catch (error) {
        console.error('Error setting issue contributor:', error);
        return false;
    }
}

/**
 * Unset contributor for an issue
 */
export async function unsetIssueContributor(
    issueId: string | ObjectId
): Promise<boolean> {
    try {
        const collection = await getCollection<IssueModel>('issues');
        const issueObjectId = typeof issueId === 'string' ? new ObjectId(issueId) : issueId;

        const result = await collection.updateOne(
            { _id: issueObjectId },
            {
                $unset: {
                    contributor: '',
                },
            }
        );
        return result.modifiedCount > 0;
    } catch (error) {
        console.error('Error unsetting issue contributor:', error);
        return false;
    }
}

/**
 * Update issue fields listHistory
 */
export async function updateIssue(
    issueId: string | ObjectId,
    updates: { listHistory?: string[] }
): Promise<boolean> {
    try {
        const collection = await getCollection<IssueModel>('issues');
        const issueObjectId = typeof issueId === 'string' ? new ObjectId(issueId) : issueId;

        const updateOps: any = {};
        if (updates.listHistory !== undefined) {
            updateOps.listHistory = updates.listHistory;
        }

        if (Object.keys(updateOps).length === 0) {
            return false;
        }

        const result = await collection.updateOne(
            { _id: issueObjectId },
            { $set: updateOps }
        );
        return result.modifiedCount > 0;
    } catch (error) {
        console.error('Error updating issue:', error);
        return false;
    }
}

/**
 * Patch an issue: remove add 'patcher' to listHistory
 */
export async function patchIssue(
    issueId: string | ObjectId,
): Promise<boolean> {
    try {
        const collection = await getCollection<IssueModel>('issues');
        const issueObjectId = typeof issueId === 'string' ? new ObjectId(issueId) : issueId;

        // Get current issue to preserve existing listHistory
        const issue = await collection.findOne({ _id: issueObjectId });
        if (!issue) {
            return false;
        }

        const currentListHistory = issue.listHistory || [];
        const updatedListHistory = currentListHistory.includes('patcher')
            ? currentListHistory
            : [...currentListHistory, 'patcher'];

        // Build update operations
        const updateOps: any = {
            listHistory: updatedListHistory,
        };

        const result = await collection.updateOne(
            { _id: issueObjectId },
            { $set: updateOps }
        );
        return result.acknowledged;
    } catch (error) {
        console.error('Error patching issue:', error);
        return false;
    }
}

/**
 * Unpatch an issue: remove 'patcher' from listHistory
 */
export async function unpatchIssue(
    issueId: string | ObjectId,
): Promise<boolean> {
    try {
        const collection = await getCollection<IssueModel>('issues');
        const issueObjectId = typeof issueId === 'string' ? new ObjectId(issueId) : issueId;

        // Get current issue
        const issue = await collection.findOne({ _id: issueObjectId });
        if (!issue) {
            return false;
        }

        const currentListHistory = issue.listHistory || [];
        const updatedListHistory = currentListHistory.filter(item => item !== 'patcher');

        const updateOps: any = {
            listHistory: updatedListHistory,
        };

        const result = await collection.updateOne(
            { _id: issueObjectId },
            { $set: updateOps }
        );
        return result.modifiedCount > 0;
    } catch (error) {
        console.error('Error unpatching issue:', error);
        return false;
    }
}

