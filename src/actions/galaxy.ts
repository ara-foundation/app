import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { ObjectId } from 'mongodb';
import { Wallet } from 'ethers';
import {
    detectGitProvider,
    normalizeGitUrl,
    fetchRepositoryMetadata,
    detectLicense,
    discoverProjectLinks,
    buildDependencyTree,
    checkDuplicateRepository,
} from '@/server-side/git-repository';
import { generateGalaxy } from '@/server-side/ai';
import { getProjectById } from '@/server-side/project';
import { createGalaxy, getGalaxyById, updateGalaxyPosition } from '@/server-side/galaxy';
import { getStarByUserId } from '@/server-side/star';
import { createGalaxyPositionTracer, getGalaxyPositionHistory } from '@/server-side/all-stars';
import { getCollection } from '@/server-side/db';
import { send } from '@ara-web/crypto-sockets';
import type { RequestAddGalaxy, ReplyGalaxyCreation, ReplyError } from '@ara-web/crypto-sockets';
import type { Project } from '@/types/project';
import type { Galaxy } from '@/types/galaxy';
import { LicenseInfo, RepositoryAnalysis } from '@/types/git-repository';
import { getOrCreateProject } from '@/server-side/project';
import { mockRepositoryAnalysis } from '@/types/mock-data';

export const server = {
    /**
     * Analyze Git repository (validate, detect provider, fetch metadata, detect license, discover links, build dependency tree)
     */
    analyzeGitRepository: defineAction({
        input: z.object({
            gitUrl: z.string().min(1),
            userId: z.string(),
        }),
        handler: async ({ gitUrl, userId }): Promise<{ success: boolean; data?: RepositoryAnalysis; error?: string }> => {
            try {
                // Normalize URL
                const normalizedUrl = normalizeGitUrl(gitUrl);

                // Check for duplicates
                const isDuplicate = await checkDuplicateRepository(normalizedUrl);
                if (isDuplicate) {
                    return {
                        success: false,
                        error: 'This repository has already been added',
                    };
                }

                // Detect provider
                const providerInfo = detectGitProvider(normalizedUrl);
                if (!providerInfo) {
                    return {
                        success: false,
                        error: 'Invalid or unsupported Git URL. Only GitHub and GitLab are supported.',
                    };
                }

                // Fetch repository metadata
                let metadata = await fetchRepositoryMetadata(
                    providerInfo.provider,
                    providerInfo.owner,
                    providerInfo.repo,
                    providerInfo.host
                );

                // If metadata is null and we're in non-production, return full mocked data
                if (!metadata && process.env.NODE_ENV !== 'production') {
                    console.warn('GitHub API rate limit exceeded (403). Using mocked repository data in development.');
                    return {
                        success: true,
                        data: {
                            ...mockRepositoryAnalysis,
                            gitUrl: normalizedUrl,
                            provider: providerInfo.provider,
                            owner: providerInfo.owner,
                            repo: providerInfo.repo,
                            host: providerInfo.host,
                        },
                    };
                }

                if (!metadata) {
                    return {
                        success: false,
                        error: 'Failed to fetch repository metadata. Please ensure the repository is public and accessible.',
                    };
                }

                // Check if repository is public
                if (metadata.visibility !== 'public') {
                    return {
                        success: false,
                        error: 'Only public repositories are supported in Phase 1.',
                    };
                }

                // Detect license
                const licenseInfo = await detectLicense(
                    providerInfo.provider,
                    providerInfo.owner,
                    providerInfo.repo,
                    metadata,
                    providerInfo.host
                );

                // Discover project links
                const projectLinks = await discoverProjectLinks(
                    providerInfo.provider,
                    providerInfo.owner,
                    providerInfo.repo,
                    metadata,
                    providerInfo.host
                );

                // Build dependency tree (will create SBOM record)
                // Note: projectId will be created later, so we'll skip SBOM storage here
                // and do it after project creation
                const dependencyTree = {
                    dependencies: [],
                    source: 'pending',
                    completeness: 'direct-only' as const,
                };

                return {
                    success: true,
                    data: {
                        gitUrl: normalizedUrl,
                        metadata,
                        license: licenseInfo, // undefined if not found
                        projectLinks,
                        dependencyTree,
                        ...providerInfo,
                    },
                };
            } catch (error) {
                console.error('Error analyzing Git repository:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Failed to analyze repository',
                };
            }
        },
    }),

    /**
     * Create galaxy from Git repository
     */
    createGalaxyFromGit: defineAction({
        input: z.object({
            gitUrl: z.string(),
            provider: z.enum(['github', 'gitlab']),
            owner: z.string(),
            repo: z.string(),
            host: z.string().optional(),
            metadata: z.object({
                lastCommitId: z.string(),
                lastCommitTimestamp: z.number(),
                totalCommits: z.number(),
                visibility: z.enum(['public', 'private']),
                defaultBranch: z.string(),
                name: z.string().optional(),
                description: z.string().optional(),
                language: z.string().optional(),
                homepage: z.string().optional(),
                topics: z.array(z.string()).optional(),
            }),
            license: z.object({
                license: z.string().optional(),
                confidence: z.number(),
                source: z.string(),
            }),
            projectLinks: z.object({
                homepage: z.string().optional(),
                documentation: z.string().optional(),
                packageLinks: z.array(z.string()).optional(),
            }),
            dependencyTree: z.object({
                dependencies: z.array(z.any()),
                source: z.string(),
                completeness: z.enum(['full', 'partial', 'direct-only']),
            }),
            userId: z.string(),
            readmeContent: z.string().optional(),
        }),
        handler: async ({ gitUrl, provider, owner, repo, host, metadata, license, projectLinks, dependencyTree, userId, readmeContent }): Promise<{ success: boolean; data?: Galaxy; error?: string }> => {
            try {
                // Get user/star
                const star = await getStarByUserId(userId);
                if (!star || !star._id) {
                    return {
                        success: false,
                        error: 'User not found',
                    };
                }

                // Create project first
                const now = Math.floor(Date.now() / 1000);
                const socialLinks: Project['socialLinks'] = [
                    {
                        label: provider === 'github' ? 'GitHub' : 'GitLab',
                        uri: gitUrl,
                        type: provider,
                    },
                    ...(projectLinks.homepage ? [{
                        label: 'Homepage',
                        uri: projectLinks.homepage,
                        type: 'project' as const,
                    }] : []),
                    ...(projectLinks.documentation ? [{
                        label: 'Documentation',
                        uri: projectLinks.documentation,
                        type: 'documentation' as const,
                    }] : []),
                ];


                // Fetch README content and URL if not provided
                let readmeContentToStore = readmeContent || '';
                let readmeUrlToStore: string | undefined = undefined;
                let readmeUpdateTimeToStore: number | undefined = undefined;

                if (!readmeContent) {
                    // Fetch README if not provided
                    const { fetchReadmeContent } = await import('@/lib/git-repository');
                    const readmeResult = await fetchReadmeContent({
                        gitUrl,
                        provider,
                        owner,
                        repo,
                        host,
                        metadata,
                        license: license as LicenseInfo,
                        projectLinks,
                        dependencyTree,
                    });
                    readmeContentToStore = readmeResult.content || '';
                    readmeUrlToStore = readmeResult.url || undefined;
                } else {
                    // If readmeContent is provided, construct the URL
                    if (provider === 'github') {
                        readmeUrlToStore = `https://raw.githubusercontent.com/${owner}/${repo}/${metadata.defaultBranch}/README.md`;
                    } else if (provider === 'gitlab') {
                        const baseUrl = host ? `https://${host}` : 'https://gitlab.com';
                        const encodedPath = encodeURIComponent(`${owner}/${repo}`);
                        readmeUrlToStore = `${baseUrl}/api/v4/projects/${encodedPath}/repository/files/README.md/raw?ref=${metadata.defaultBranch}`;
                    }
                }

                if (readmeContentToStore) {
                    readmeUpdateTimeToStore = now;
                }

                const projectData: Omit<Project, '_id'> = {
                    forkLines: [],
                    socialLinks,
                    createdAt: now,
                    lastCommitId: metadata.lastCommitId,
                    lastCommitUpdateTime: metadata.lastCommitTimestamp,
                    license: license.license, // Extract license string from LicenseInfo object
                    totalCommits: metadata.totalCommits,
                    branchName: metadata.defaultBranch, // Store default branch name
                    readmeContent: readmeContentToStore || undefined,
                    readmeUpdateTime: readmeUpdateTimeToStore,
                    readmeUrl: readmeUrlToStore,
                };

                // This will return existing project ID if duplicate, or create new one
                const projectId = await getOrCreateProject(projectData);

                // Build dependency tree now that we have projectId
                // This will store SBOM in the separate sboms collection
                await buildDependencyTree(
                    provider,
                    owner,
                    repo,
                    projectId,
                    gitUrl,
                    host
                );

                // Generate galaxy with AI
                const readme = readmeContent || metadata.description || '';
                const generatedGalaxy = await generateGalaxy({
                    readmeContent: readme,
                    projectMetadata: {
                        name: metadata.name || repo,
                        repo,
                        language: metadata.language,
                        description: metadata.description,
                    },
                    gitUrl,
                });


                // Create galaxy
                const galaxyData: Galaxy = {
                    maintainer: star._id.toString(),
                    projectLink: projectId,
                    name: generatedGalaxy.name,
                    description: generatedGalaxy.description,
                    stars: 0,
                    sunshines: 0,
                    users: 0,
                    donationAmount: 0,
                    x: 0,
                    y: 0,
                    tags: generatedGalaxy.tags,
                };

                const galaxyId = await createGalaxy(galaxyData);
                if (!galaxyId) {
                    return {
                        success: false,
                        error: 'Failed to create galaxy',
                    };
                }
                galaxyData._id = galaxyId;

                return {
                    success: true,
                    data: galaxyData,
                };
            } catch (error) {
                console.error('Error creating galaxy from Git:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Failed to create galaxy',
                };
            }
        },
    }),

    /**
     * Create blockchain transaction for galaxy
     */
    createGalaxyBlockchainTransaction: defineAction({
        input: z.object({
            galaxyId: z.string(),
            userId: z.string(),
        }),
        handler: async ({ galaxyId, userId }) => {
            try {
                // Get user/star
                const star = await getStarByUserId(userId);
                if (!star || !star._id || !star.demoPrivateKey) {
                    return {
                        success: false,
                        error: 'Can not create blockchain transaction, user id invalid or missing private key',
                    };
                }

                // Get galaxy
                const galaxy = await getGalaxyById(galaxyId);
                if (!galaxy) {
                    return {
                        success: false,
                        error: 'Can not create blockchain transaction, galaxy id invalid: "' + galaxyId + '"',
                    };
                }

                // Check if already has blockchain ID
                if (galaxy.blockchainId) {
                    return {
                        success: true,
                        data: {
                            blockchainId: galaxy.blockchainId,
                            blockchainTx: galaxy.blockchainTx,
                        },
                    };
                }

                // Get project
                const project = await getProjectById(galaxy.projectLink);
                if (!project) {
                    return {
                        success: false,
                        error: 'Can not create blockchain transaction, project not found',
                    };
                }

                // Get maintainer wallet
                const maintainerWallet = new Wallet(star.demoPrivateKey);
                const maintainerAddress = maintainerWallet.address;

                // Generate random Ethereum account (20 bytes) and convert to 32-byte hex string
                const randomWallet = Wallet.createRandom();
                const address20Bytes = randomWallet.address;
                const galaxyId32Bytes = `0x${address20Bytes.slice(2).padStart(64, '0')}`;

                // Get repo URL from socialLinks
                const repoUrl = project.socialLinks?.find(link =>
                    link.type === 'github' || link.type === 'gitlab'
                )?.uri || '';

                // Construct issues URL
                const issuesUrl = `https://app.ara.foundation/project/issues?galaxy=${galaxyId}`;

                // Prepare addGalaxy request
                const request: RequestAddGalaxy = {
                    cmd: 'addGalaxy',
                    params: {
                        owner: maintainerAddress,
                        repoUrl: repoUrl,
                        issuesUrl: issuesUrl,
                        name: galaxy.name,
                        id: galaxyId32Bytes,
                        minX: galaxy.x,
                        maxX: galaxy.x + 100,
                        minY: galaxy.y,
                        maxY: galaxy.y + 100,
                    },
                };

                // Call blockchain gateway
                const reply = await send(request);

                if ('error' in reply) {
                    const errorReply = reply as ReplyError;
                    return {
                        success: false,
                        error: `Crypto-sockets error while creating blockchain transaction: ${errorReply.error}`,
                    };
                }

                const successReply = reply as ReplyGalaxyCreation;

                // Update galaxy in database
                const collection = await getCollection<any>('galaxies');
                await collection.updateOne(
                    { _id: new ObjectId(galaxyId) },
                    {
                        $set: {
                            blockchainId: galaxyId32Bytes,
                            blockchainTx: successReply.params.txHash,
                        },
                    }
                );

                return {
                    success: true,
                    data: {
                        blockchainId: galaxyId32Bytes,
                        blockchainTx: successReply.params.txHash,
                    },
                };
            } catch (error) {
                console.error('Error creating blockchain transaction:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Failed to create blockchain transaction',
                };
            }
        },
    }),

    /**
     * Update project README content
     */
    updateProjectReadme: defineAction({
        input: z.object({
            projectId: z.string(),
            userId: z.string(),
        }),
        handler: async ({ projectId, userId }): Promise<{ success: boolean; data?: Project; error?: string }> => {
            try {
                // Get project
                const project = await getProjectById(projectId);
                if (!project) {
                    return {
                        success: false,
                        error: 'Project not found',
                    };
                }

                // Get galaxy to verify maintainer
                const collection = await getCollection('galaxies');
                const galaxy = await collection.findOne({ projectLink: new ObjectId(projectId) });
                if (!galaxy) {
                    return {
                        success: false,
                        error: 'Galaxy not found for this project',
                    };
                }

                // Get user/star
                const star = await getStarByUserId(userId);
                if (!star || !star._id) {
                    return {
                        success: false,
                        error: 'User not found',
                    };
                }

                // Verify user is the maintainer
                console.log('update project readme, todo verify user is the maintainer');
                // if (galaxy.maintainer.toString() !== star._id.toString()) {
                //     return {
                //         success: false,
                //         error: 'Only the maintainer can update the README',
                //     };
                // }

                // Find GitHub or GitLab link to fetch README
                const gitLink = project.socialLinks.find(link => link.type === 'github' || link.type === 'gitlab');
                if (!gitLink) {
                    return {
                        success: false,
                        error: 'No Git repository link found for this project',
                    };
                }

                // Parse Git URL to get provider, owner, repo
                const gitUrl = gitLink.uri;
                const provider = gitLink.type as 'github' | 'gitlab';
                let owner = '';
                let repo = '';
                let host: string | undefined = undefined;

                if (provider === 'github') {
                    const match = gitUrl.match(/github\.com[\/:]([^\/]+)\/([^\/\.]+)/);
                    if (match) {
                        owner = match[1];
                        repo = match[2].replace(/\.git$/, '');
                    }
                } else if (provider === 'gitlab') {
                    const urlObj = new URL(gitUrl);
                    host = urlObj.hostname;
                    const match = gitUrl.match(/gitlab\.com[\/:]([^\/]+)\/([^\/\.]+)/) ||
                        gitUrl.match(/\/([^\/]+)\/([^\/\.]+)\.git/);
                    if (match) {
                        owner = match[1];
                        repo = match[2].replace(/\.git$/, '');
                    }
                }

                if (!owner || !repo) {
                    return {
                        success: false,
                        error: 'Could not parse Git repository information',
                    };
                }

                // Fetch repository metadata to get default branch
                const metadata = await fetchRepositoryMetadata(provider, owner, repo, host);
                if (!metadata) {
                    return {
                        success: false,
                        error: 'Could not fetch repository metadata',
                    };
                }

                // Fetch README content
                const { fetchReadmeContent } = await import('@/lib/git-repository');
                const readmeResult = await fetchReadmeContent({
                    gitUrl,
                    provider,
                    owner,
                    repo,
                    host,
                    metadata: {
                        lastCommitId: metadata.lastCommitId,
                        lastCommitTimestamp: metadata.lastCommitTimestamp,
                        totalCommits: metadata.totalCommits,
                        visibility: metadata.visibility,
                        defaultBranch: metadata.defaultBranch,
                        name: metadata.name,
                        description: metadata.description,
                        language: metadata.language,
                        homepage: metadata.homepage,
                        topics: metadata.topics,
                    },
                    license: { license: project.license, confidence: 1, source: 'database' },
                    projectLinks: {
                        homepage: project.socialLinks.find(l => l.type === 'project')?.uri,
                        documentation: project.socialLinks.find(l => l.type === 'documentation')?.uri,
                    },
                    dependencyTree: { dependencies: [], source: '', completeness: 'direct-only' },
                });

                // Update project with new README data
                const now = Math.floor(Date.now() / 1000);
                const projectCollection = await getCollection('projects');
                await projectCollection.updateOne(
                    { _id: new ObjectId(projectId) },
                    {
                        $set: {
                            readmeContent: readmeResult.content || undefined,
                            readmeUpdateTime: readmeResult.content ? now : undefined,
                            readmeUrl: readmeResult.url || undefined,
                        },
                    }
                );

                // Fetch updated project
                const updatedProject = await getProjectById(projectId);
                if (!updatedProject) {
                    return {
                        success: false,
                        error: 'Failed to fetch updated project',
                    };
                }

                return {
                    success: true,
                    data: updatedProject,
                };
            } catch (error) {
                console.error('Error updating project README:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Failed to update README',
                };
            }
        },
    }),

    /**
     * Update galaxy coordinates (x, y) in the universe
     */
    updateGalaxyCoordinates: defineAction({
        input: z.object({
            galaxyId: z.string(),
            userId: z.string(),
            x: z.number().optional(),
            y: z.number().optional(),
        }),
        handler: async ({ galaxyId, userId, x, y }): Promise<{ success: boolean; txId?: string; order: number; x: number; y: number; error?: string }> => {
            try {
                // Authenticate user
                if (!userId) {
                    return {
                        success: false,
                        x: 0,
                        y: 0,
                        order: 0,
                        error: 'User not authenticated',
                    };
                }

                // Get user's star
                const userStar = await getStarByUserId(userId);
                if (!userStar || !userStar._id) {
                    return {
                        success: false,
                        x: 0,
                        y: 0,
                        order: 0,
                        error: 'User not found',
                    };
                }

                // Get galaxy
                const galaxy = await getGalaxyById(galaxyId);
                if (!galaxy) {
                    return {
                        success: false,
                        x: 0,
                        y: 0,
                        order: 0,
                        error: 'Galaxy not found',
                    };
                }

                // Verify user is the maintainer
                if (galaxy.maintainer !== userStar._id.toString()) {
                    return {
                        success: false,
                        x: 0,
                        y: 0,
                        order: 0,
                        error: 'Only the maintainer can update galaxy coordinates',
                    };
                }

                // Generate random coordinates if not provided
                let newX = x;
                let newY = y;
                if (newX === undefined || newY === undefined) {
                    // Generate random coordinates within reasonable bounds
                    // Using a range of -10000 to 10000 for now
                    newX = Math.floor(Math.random() * 20000) - 10000;
                    newY = Math.floor(Math.random() * 20000) - 10000;
                }

                // Get position history to determine next order number
                const history = await getGalaxyPositionHistory(galaxyId);
                const nextOrder = history.length > 0 ? Math.max(...history.map(h => h.order)) + 1 : 1;

                // Update database
                const updated = await updateGalaxyPosition(galaxyId, newX, newY);
                if (!updated) {
                    return {
                        success: false,
                        x: newX,
                        y: newY,
                        order: nextOrder,
                        error: 'Failed to update galaxy position in database',
                    };
                }

                // Try to call blockchain if galaxy has blockchainId
                let txId: string | undefined;
                if (galaxy.blockchainId) {
                    try {
                        // For now, we'll use database-only updates
                        // TODO: Implement blockchain call when available
                        // Similar to updateUserStarPosition but for galaxy coordinates
                        console.log(`Galaxy ${galaxyId} has blockchainId ${galaxy.blockchainId}, but blockchain update not yet implemented for galaxy coordinates`);
                    } catch (error) {
                        console.error('Error calling blockchain for galaxy coordinates:', error);
                        // Continue with database update even if blockchain fails
                    }
                }

                // Create position tracer record
                try {
                    await createGalaxyPositionTracer({
                        galaxyId,
                        x: newX,
                        y: newY,
                        txId,
                        order: nextOrder,
                    });
                } catch (error) {
                    console.error('Error creating galaxy position tracer:', error);
                    // Don't fail the whole operation if tracer creation fails
                }

                return {
                    success: true,
                    txId,
                    order: nextOrder,
                    x: newX,
                    y: newY,
                };
            } catch (error) {
                console.error('Error updating galaxy coordinates:', error);
                return {
                    success: false,
                    x: 0,
                    y: 0,
                    order: 0,
                    error: error instanceof Error ? error.message : 'Failed to update galaxy coordinates',
                };
            }
        },
    }),
};
