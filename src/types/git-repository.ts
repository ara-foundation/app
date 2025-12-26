export interface GitProviderInfo {
    provider: 'github' | 'gitlab';
    host?: string; // For self-hosted instances
    owner: string;
    repo: string;
}

export interface RepositoryMetadata {
    lastCommitId: string;
    lastCommitTimestamp: number; // Unix timestamp
    totalCommits: number;
    visibility: 'public' | 'private';
    defaultBranch: string;
    name?: string;
    description?: string;
    language?: string;
    homepage?: string;
    topics?: string[];
}

export interface LicenseInfo {
    license: string | undefined;
    confidence: number;
    source: string;
}

export interface ProjectLinks {
    homepage?: string;
    documentation?: string;
    packageLinks?: string[];
}

export interface DependencyTree {
    dependencies: Array<any>;
    source: string;
    completeness: 'full' | 'partial' | 'direct-only';
}


export interface RepositoryAnalysis extends GitProviderInfo {
    gitUrl: string,
    metadata: RepositoryMetadata,
    license: LicenseInfo, // undefined if not found
    projectLinks: ProjectLinks,
    dependencyTree: DependencyTree,
}