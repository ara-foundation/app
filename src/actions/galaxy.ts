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
import { createGalaxy, getGalaxyById } from '@/server-side/galaxy';
import { getStarByUserId } from '@/server-side/star';
import { getCollection } from '@/server-side/db';
import { send } from '@ara-web/crypto-sockets';
import type { RequestAddGalaxy, ReplyGalaxyCreation, ReplyError } from '@ara-web/crypto-sockets';
import type { Project } from '@/types/project';
import type { Galaxy } from '@/types/galaxy';
import { RepositoryAnalysis } from '@/types/git-repository';
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


                const projectData: Omit<Project, '_id'> = {
                    forkLines: [],
                    socialLinks,
                    createdAt: now,
                    lastCommitId: metadata.lastCommitId,
                    lastCommitUpdateTime: metadata.lastCommitTimestamp,
                    license: license.license, // Extract license string from LicenseInfo object
                    totalCommits: metadata.totalCommits,
                    branchName: metadata.defaultBranch, // Store default branch name
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
};
