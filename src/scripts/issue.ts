import { ObjectId } from 'mongodb';
import { getCollection, create } from './db';
import type { IconType } from '@/components/icon';
import type { ProfileLink } from '@/components/profile/types';

// Issue type definitions (client-safe, no MongoDB imports in type definitions)
export type IssueType = 'improvement' | 'feature' | 'bug' | 'enhancement' | 'wish' | 'custom';
export type IssuePriority = 'low' | 'medium' | 'high';
export type IssueStorage = 'github' | 'arada-';
export type IssueStatType = 'upvote' | 'downvote' | 'chat' | 'voting-power' | 'follower' | 'money' | 'persona';

export interface IssueStat {
    type: IssueStatType;
    hint: React.ReactNode;
    filled?: boolean;
    children: React.ReactNode;
}

export interface Issue {
    id?: number;
    uri: string;
    number?: string;
    title: string;
    description: string;
    type: IssueType;
    storage?: IssueStorage;
    author?: ProfileLink | ProfileLink[];
    projectId: string;
    categoryId: string;
    stats?: {
        [key in IssueStatType]?: IssueStat;
    };
    createdTime?: string;
    // VP properties for voting (deprecated, kept for backward compatibility)
    vpAmount?: number;
    currentVP?: number;
    topVP?: number;
    minVP?: number;
    // New properties from IssueModel
    sunshines?: number;
    usersCount?: number;
}

// Client-safe version of IssueModel (uses string instead of ObjectId)
export interface IssueModelClient {
    _id?: string;
    galaxy: string;
    uri: string;
    number?: string;
    title: string;
    description: string;
    type: IssueType;
    storage?: IssueStorage;
    maintainer: string;
    projectId: string;
    categoryId: string;
    stats?: {
        [key in IssueStatType]?: IssueStat;
    };
    createdTime?: Date | string;
    sunshines: number;
    users: IssueUser[];
}

// getIssueStatIcon moved to @/components/issue/utils.ts for client-side compatibility

export interface IssueUser {
    username: string;
    starshineAmount: number;
    transactionDate: Date;
}

// Server-side IssueModel (uses ObjectId)
export interface IssueModel {
    _id?: ObjectId;
    galaxy: ObjectId; // Reference to GalaxyModel
    uri: string;
    number?: string;
    title: string;
    description: string;
    type: IssueType;
    storage?: IssueStorage;
    maintainer: ObjectId; // Like GalaxyModel, not ProfileLink
    projectId: string;
    categoryId: string;
    stats?: {
        [key in IssueStatType]?: IssueStat;
    };
    createdTime?: Date;
    sunshines: number; // Cached sum of users sunshines
    users: IssueUser[]; // Array of users with their contributions
}

/**
 * Get issues by galaxy ID
 */
export async function getIssuesByGalaxy(galaxyId: string | ObjectId): Promise<IssueModel[]> {
    try {
        const collection = await getCollection<IssueModel>('issues');
        const objectId = typeof galaxyId === 'string' ? new ObjectId(galaxyId) : galaxyId;
        const result = await collection.find({ galaxy: objectId }).toArray();
        return result;
    } catch (error) {
        console.error('Error getting issues by galaxy:', error);
        return [];
    }
}

/**
 * Get issue by ID
 */
export async function getIssueById(id: string | ObjectId): Promise<IssueModel | null> {
    try {
        const collection = await getCollection<IssueModel>('issues');
        const objectId = typeof id === 'string' ? new ObjectId(id) : id;
        const result = await collection.findOne({ _id: objectId });
        return result;
    } catch (error) {
        console.error('Error getting issue by id:', error);
        return null;
    }
}

/**
 * Create a new issue
 */
export async function createIssue(issue: IssueModel): Promise<boolean> {
    try {
        return await create<IssueModel>('issues', issue);
    } catch (error) {
        console.error('Error creating issue:', error);
        return false;
    }
}

/**
 * Get shining issues (issues with sunshines > 0)
 */
export async function getShiningIssues(galaxyId: string | ObjectId): Promise<IssueModel[]> {
    try {
        const collection = await getCollection<IssueModel>('issues');
        const objectId = typeof galaxyId === 'string' ? new ObjectId(galaxyId) : galaxyId;
        const result = await collection.find({
            galaxy: objectId,
            sunshines: { $gt: 0 }
        }).toArray();
        return result;
    } catch (error) {
        console.error('Error getting shining issues:', error);
        return [];
    }
}

/**
 * Get public backlog issues (issues with sunshines === 0)
 */
export async function getPublicBacklogIssues(galaxyId: string | ObjectId): Promise<IssueModel[]> {
    try {
        const collection = await getCollection<IssueModel>('issues');
        const objectId = typeof galaxyId === 'string' ? new ObjectId(galaxyId) : galaxyId;
        const result = await collection.find({
            galaxy: objectId,
            sunshines: 0
        }).toArray();
        return result;
    } catch (error) {
        console.error('Error getting public backlog issues:', error);
        return [];
    }
}

