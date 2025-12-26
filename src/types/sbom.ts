export interface SBOM {
    _id?: string;
    projectId: string; // Reference to Project
    gitUrl: string;
    provider: 'github' | 'gitlab';
    sbomData: object; // Raw SBOM data from API
    dependencies: Array<any>; // Parsed dependencies
    source: string; // e.g., 'github-sbom-api', 'gitlab-manifest'
    completeness: 'full' | 'partial' | 'direct-only';
    detectedAt: number; // Unix timestamp
}

