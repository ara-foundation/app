export enum IssueTag {
    IMPROVEMENT = 'improvement',
    FEATURE = 'feature',
    BUG = 'bug',
    ENHANCEMENT = 'enhancement',
    WISH = 'wish',
    CUSTOM = 'custom'
}

export type IssueStatType = 'upvote' | 'downvote' | 'chat' | 'voting-power' | 'follower' | 'money' | 'persona';

// Client-safe version of IssueStat (serializable for Astro actions)
export interface IssueStat {
    type: IssueStatType;
    hint: string;
    filled?: boolean;
    children: string | number;
}

// Client-safe version of IssueUser (serializable for Astro actions)
export interface IssueUser {
    username: string;
    starshineAmount: number;
    transactionDate: number; // Unix timestamp
}

export interface Issue {
    _id?: string;
    galaxy: string;
    uri: string;
    title: string;
    description: string;
    tags: IssueTag[];
    maintainer: string;
    categoryId: string;
    stats?: {
        [key in IssueStatType]?: IssueStat;
    };
    createdTime?: number; // Unix timestamp
    sunshines: number;
    users: IssueUser[];
    author?: string; // ID of the user who created the issue
}

