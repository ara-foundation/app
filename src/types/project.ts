export interface ForkLine {
    from: string; // Source project ID
    via: string[]; // Array of issue IDs
    to: string; // Target project ID
}

export interface SocialLink {
    label: string;
    uri: string;
    type?: 'github' | 'gitlab' | 'blockchain-explorer' | 'documentation' | 'project' | string;
}

export interface Project {
    _id?: string;
    forkLines: ForkLine[];
    socialLinks: SocialLink[];
    createdAt?: number; // Unix timestamp
    lastCommitId?: string;
    lastCommitUpdateTime?: number; // Unix timestamp
    license?: string;
    totalCommits?: number;
    branchName?: string; // Default branch name from Git repository
}

// Legacy type for backward compatibility
export type ProjectInfo = {
    id: string
    name: string
    repository: string
    forkId?: string
}

