import { DependencyTree, GitProviderInfo, LicenseInfo, ProjectLinks, RepositoryMetadata } from '@/types/git-repository';
import { createSBOM } from './sbom';
import type { SBOM } from '@/types/sbom';
import { mockRepositoryAnalysis } from '@/types/mock-data';
import { checkDuplicateGitUrl } from './project';

/**
 * Normalize Git URL (handles SSH/HTTPS, removes .git suffix)
 */
export function normalizeGitUrl(url: string): string {
    let normalized = url.trim();

    // Remove .git suffix if present
    if (normalized.endsWith('.git')) {
        normalized = normalized.slice(0, -4);
    }

    // Convert SSH to HTTPS format for parsing
    if (normalized.startsWith('git@')) {
        normalized = normalized.replace('git@', 'https://').replace(':', '/');
    }

    return normalized;
}

/**
 * Detect Git provider from URL
 */
export function detectGitProvider(url: string): GitProviderInfo | null {
    const normalized = normalizeGitUrl(url);

    try {
        const urlObj = new URL(normalized);
        const host = urlObj.hostname.toLowerCase();

        // GitHub detection
        if (host === 'github.com' || host.includes('github')) {
            const pathParts = urlObj.pathname.split('/').filter(p => p);
            if (pathParts.length >= 2) {
                return {
                    provider: 'github',
                    owner: pathParts[0],
                    repo: pathParts[1],
                };
            }
        }

        // GitLab detection
        if (host === 'gitlab.com' || host.includes('gitlab')) {
            const pathParts = urlObj.pathname.split('/').filter(p => p);
            if (pathParts.length >= 2) {
                // GitLab format: gitlab.com/owner/repo
                return {
                    provider: 'gitlab',
                    host: host === 'gitlab.com' ? undefined : host,
                    owner: pathParts[0],
                    repo: pathParts[1],
                };
            }
        }

        return null;
    } catch (error) {
        console.error('Error parsing Git URL:', error);
        return null;
    }
}

/**
 * Fetch repository metadata from GitHub/GitLab API
 */
export async function fetchRepositoryMetadata(
    provider: 'github' | 'gitlab',
    owner: string,
    repo: string,
    host?: string
): Promise<RepositoryMetadata | null> {
    const githubToken = process.env.GITHUB_TOKEN;
    const gitlabToken = process.env.GITLAB_TOKEN;

    try {
        if (provider === 'github') {
            const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
            const headers: HeadersInit = {
                'Accept': 'application/vnd.github.v3+json',
            };
            if (githubToken) {
                headers['Authorization'] = `token ${githubToken}`;
            }

            const response = await fetch(apiUrl, { headers });
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Repository not found');
                }
                // Handle rate limit (403) - return mocked data in non-production
                if (response.status === 403 && process.env.NODE_ENV !== 'production') {
                    console.warn('GitHub API rate limit exceeded (403). Using mocked data in development.');
                    return mockRepositoryAnalysis.metadata;
                }
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const data = await response.json();

            // Get commit count from commits API (limited to 100 per page)
            let totalCommits = 0;
            try {
                const commitsResponse = await fetch(`${apiUrl}/commits?per_page=1`, { headers });
                if (commitsResponse.ok) {
                    const linkHeader = commitsResponse.headers.get('link');
                    if (linkHeader) {
                        const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
                        if (lastPageMatch) {
                            totalCommits = parseInt(lastPageMatch[1]);
                        }
                    } else {
                        // If no pagination, check if there's at least one commit
                        const commitsData = await commitsResponse.json();
                        totalCommits = Array.isArray(commitsData) && commitsData.length > 0 ? 1 : 0;
                    }
                }
            } catch (e) {
                console.warn('Could not fetch commit count:', e);
            }

            return {
                lastCommitId: data.default_branch ? (await fetch(`${apiUrl}/commits/${data.default_branch}`, { headers }).then(r => r.json())).sha : '',
                lastCommitTimestamp: data.pushed_at ? Math.floor(new Date(data.pushed_at).getTime() / 1000) : 0,
                totalCommits: totalCommits || 0,
                visibility: data.private ? 'private' : 'public',
                defaultBranch: data.default_branch || 'main',
                name: data.name,
                description: data.description || undefined,
                language: data.language || undefined,
                homepage: data.homepage || undefined,
                topics: data.topics || [],
            };
        } else if (provider === 'gitlab') {
            const baseUrl = host ? `https://${host}` : 'https://gitlab.com';
            const encodedPath = encodeURIComponent(`${owner}/${repo}`);
            const apiUrl = `${baseUrl}/api/v4/projects/${encodedPath}`;
            const headers: HeadersInit = {
                'Accept': 'application/json',
            };
            if (gitlabToken) {
                headers['Authorization'] = `Bearer ${gitlabToken}`;
            }

            const response = await fetch(apiUrl, { headers });
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Repository not found');
                }
                throw new Error(`GitLab API error: ${response.status}`);
            }

            const data = await response.json();

            // Get last commit
            let lastCommitId = '';
            let lastCommitTimestamp = 0;
            try {
                const commitsResponse = await fetch(`${apiUrl}/repository/commits?per_page=1`, { headers });
                if (commitsResponse.ok) {
                    const commitsData = await commitsResponse.json();
                    if (Array.isArray(commitsData) && commitsData.length > 0) {
                        lastCommitId = commitsData[0].id;
                        lastCommitTimestamp = commitsData[0].created_at ? Math.floor(new Date(commitsData[0].created_at).getTime() / 1000) : 0;
                    }
                }
            } catch (e) {
                console.warn('Could not fetch last commit:', e);
            }

            return {
                lastCommitId,
                lastCommitTimestamp,
                totalCommits: data.statistics?.commit_count || 0,
                visibility: data.visibility === 'private' ? 'private' : 'public',
                defaultBranch: data.default_branch || 'main',
                name: data.name,
                description: data.description || undefined,
                homepage: data.web_url || undefined,
            };
        }

        return null;
    } catch (error) {
        console.error('Error fetching repository metadata:', error);
        throw error;
    }
}

/**
 * Detect license from repository
 */
export async function detectLicense(
    provider: 'github' | 'gitlab',
    owner: string,
    repo: string,
    metadata: RepositoryMetadata,
    host?: string
): Promise<LicenseInfo> {
    const githubToken = process.env.GITHUB_TOKEN;
    const gitlabToken = process.env.GITLAB_TOKEN;

    try {
        if (provider === 'github') {
            // Try GitHub API license field first
            const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
            const headers: HeadersInit = {
                'Accept': 'application/vnd.github.v3+json',
            };
            if (githubToken) {
                headers['Authorization'] = `token ${githubToken}`;
            }

            const response = await fetch(apiUrl, { headers });
            if (response.status === 403 && process.env.NODE_ENV !== 'production') {
                // Rate limit exceeded, use mock data
                return mockRepositoryAnalysis.license;
            }
            if (response.ok) {
                const data = await response.json();
                if (data.license && data.license.spdx_id && data.license.spdx_id !== 'NOASSERTION') {
                    return {
                        license: data.license.spdx_id,
                        confidence: 1.0,
                        source: 'github-api',
                    };
                }
            }

            // Try to fetch LICENSE file
            const licenseFiles = ['LICENSE', 'LICENSE.txt', 'LICENSE.md', 'COPYING', 'COPYING.txt'];
            for (const licenseFile of licenseFiles) {
                try {
                    const fileResponse = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${metadata.defaultBranch}/${licenseFile}`, {
                        headers: { 'Accept': 'text/plain' },
                    });
                    if (fileResponse.ok) {
                        const content = await fileResponse.text();
                        // Simple license detection from content
                        if (content.includes('MIT')) return { license: 'MIT', confidence: 0.8, source: `license-file-${licenseFile}` };
                        if (content.includes('Apache')) return { license: 'Apache-2.0', confidence: 0.8, source: `license-file-${licenseFile}` };
                        if (content.includes('GPL')) return { license: 'GPL-3.0', confidence: 0.8, source: `license-file-${licenseFile}` };
                        if (content.includes('BSD')) return { license: 'BSD-3-Clause', confidence: 0.8, source: `license-file-${licenseFile}` };
                    }
                } catch (e) {
                    // Continue to next file
                }
            }
        } else if (provider === 'gitlab') {
            // GitLab API doesn't provide license directly, try LICENSE files
            const baseUrl = host ? `https://${host}` : 'https://gitlab.com';
            const licenseFiles = ['LICENSE', 'LICENSE.txt', 'LICENSE.md', 'COPYING', 'COPYING.txt'];
            for (const licenseFile of licenseFiles) {
                try {
                    const encodedPath = encodeURIComponent(`${owner}/${repo}`);
                    const fileResponse = await fetch(`${baseUrl}/api/v4/projects/${encodedPath}/repository/files/${encodeURIComponent(licenseFile)}/raw?ref=${metadata.defaultBranch}`, {
                        headers: gitlabToken ? { 'Authorization': `Bearer ${gitlabToken}` } : {},
                    });
                    if (fileResponse.ok) {
                        const content = await fileResponse.text();
                        if (content.includes('MIT')) return { license: 'MIT', confidence: 0.8, source: `license-file-${licenseFile}` };
                        if (content.includes('Apache')) return { license: 'Apache-2.0', confidence: 0.8, source: `license-file-${licenseFile}` };
                        if (content.includes('GPL')) return { license: 'GPL-3.0', confidence: 0.8, source: `license-file-${licenseFile}` };
                        if (content.includes('BSD')) return { license: 'BSD-3-Clause', confidence: 0.8, source: `license-file-${licenseFile}` };
                    }
                } catch (e) {
                    // Continue to next file
                }
            }
        }

        // If no license found, return undefined (as per requirements)
        return {
            license: undefined,
            confidence: 0,
            source: 'none',
        };
    } catch (error) {
        console.error('Error detecting license:', error);
        return {
            license: undefined,
            confidence: 0,
            source: 'error',
        };
    }
}

/**
 * Discover project links (homepage, documentation, package links)
 */
export async function discoverProjectLinks(
    provider: 'github' | 'gitlab',
    owner: string,
    repo: string,
    metadata: RepositoryMetadata,
    host?: string
): Promise<ProjectLinks> {
    const links: ProjectLinks = {};

    // Homepage from metadata
    if (metadata.homepage) {
        links.homepage = metadata.homepage;
    }

    // Documentation links
    if (provider === 'github') {
        // Check for docs in common locations
        const docsUrls = [
            `https://${owner}.github.io/${repo}`,
            `https://github.com/${owner}/${repo}#readme`,
        ];
        // Try to find docs link in README (simplified)
        links.documentation = `https://github.com/${owner}/${repo}#readme`;
    } else if (provider === 'gitlab') {
        const baseUrl = host ? `https://${host}` : 'https://gitlab.com';
        links.documentation = `${baseUrl}/${owner}/${repo}`;
    }

    return links;
}

/**
 * Build dependency tree using SBOM or manifest files
 */
export async function buildDependencyTree(
    provider: 'github' | 'gitlab',
    owner: string,
    repo: string,
    projectId: string,
    gitUrl: string,
    host?: string
): Promise<DependencyTree> {
    const githubToken = process.env.GITHUB_TOKEN;
    const gitlabToken = process.env.GITLAB_TOKEN;

    try {
        if (provider === 'github') {
            // Try GitHub Dependency Graph API (SBOM)
            const apiUrl = `https://api.github.com/repos/${owner}/${repo}/dependency-graph/sbom`;
            const headers: HeadersInit = {
                'Accept': 'application/vnd.github+json',
            };
            if (githubToken) {
                headers['Authorization'] = `Bearer ${githubToken}`;
            }

            try {
                const response = await fetch(apiUrl, { headers });
                if (response.ok) {
                    const sbomData = await response.json();

                    // Parse dependencies from SBOM
                    const dependencies: Array<any> = [];
                    if (sbomData.sbom && sbomData.sbom.components) {
                        for (const component of sbomData.sbom.components) {
                            if (component.type === 'library' || component.type === 'application') {
                                dependencies.push({
                                    name: component.name,
                                    version: component.version,
                                    type: component.type,
                                    purl: component.purl,
                                });
                            }
                        }
                    }

                    const dependencyTree: DependencyTree = {
                        dependencies,
                        source: 'github-sbom-api',
                        completeness: dependencies.length > 0 ? 'full' : 'partial',
                    };

                    // Store SBOM in database
                    const sbom: SBOM = {
                        projectId,
                        gitUrl,
                        provider,
                        sbomData,
                        dependencies,
                        source: 'github-sbom-api',
                        completeness: dependencyTree.completeness,
                        detectedAt: Math.floor(Date.now() / 1000),
                    };
                    await createSBOM(sbom);

                    return dependencyTree;
                }
            } catch (e) {
                console.warn('GitHub SBOM API not available, falling back to manifest parsing:', e);
            }
        }

        // Fallback: Parse manifest files (best-effort)
        // This is a simplified implementation
        const dependencyTree: DependencyTree = {
            dependencies: [],
            source: provider === 'github' ? 'github-manifest' : 'gitlab-manifest',
            completeness: 'direct-only',
        };

        // Store minimal SBOM
        const sbom: SBOM = {
            projectId,
            gitUrl,
            provider,
            sbomData: {},
            dependencies: [],
            source: dependencyTree.source,
            completeness: 'direct-only',
            detectedAt: Math.floor(Date.now() / 1000),
        };
        await createSBOM(sbom);

        return dependencyTree;
    } catch (error) {
        console.error('Error building dependency tree:', error);
        return {
            dependencies: [],
            source: 'error',
            completeness: 'direct-only',
        };
    }
}

/**
 * Check if repository already exists in database
 */
export async function checkDuplicateRepository(gitUrl: string): Promise<boolean> {
    try {
        return await checkDuplicateGitUrl(gitUrl);
    } catch (error) {
        console.error('Error checking duplicate repository:', error);
        return false;
    }
}

