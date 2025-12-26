import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import { getVersionsByGalaxy, getVersionById, updateVersionStatus, revertPatch, createVersion, updatePatches, removePatch, completePatch, testPatch } from '@/server-side/roadmap'
import type { Version, Patch } from '@/types/roadmap'
import { getDemoByEmail } from '@/server-side/demo'
import { getStarByIds } from '@/server-side/star'

export const server = {
    getVersionsByGalaxy: defineAction({
        input: z.object({
            galaxyId: z.string(),
        }),
        handler: async ({ galaxyId }): Promise<{ success: boolean; versions?: Version[]; error?: string }> => {
            try {
                const versions = await getVersionsByGalaxy(galaxyId);
                return {
                    success: true,
                    versions,
                };
            } catch (error) {
                console.error('Error getting versions by galaxy:', error);
                return {
                    success: false,
                    error: 'An error occurred while getting versions',
                };
            }
        },
    }),
    getVersionById: defineAction({
        input: z.object({
            versionId: z.string(),
        }),
        handler: async ({ versionId }): Promise<{ success: boolean; version?: Version; error?: string }> => {
            try {
                const version = await getVersionById(versionId);
                if (!version) {
                    return {
                        success: false,
                        error: 'Version not found',
                    };
                }
                return {
                    success: true,
                    version,
                };
            } catch (error) {
                console.error('Error getting version by id:', error);
                return {
                    success: false,
                    error: 'An error occurred while getting version',
                };
            }
        },
    }),
    updateVersionStatus: defineAction({
        input: z.object({
            versionId: z.string(),
            status: z.enum(['complete', 'testing', 'release', 'archived']),
        }),
        handler: async ({ versionId, status }): Promise<{ success: boolean; error?: string }> => {
            try {
                const updated = await updateVersionStatus(versionId, status);
                if (!updated) {
                    return {
                        success: false,
                        error: 'Failed to update version status',
                    };
                }
                return {
                    success: true,
                };
            } catch (error) {
                console.error('Error updating version status:', error);
                return {
                    success: false,
                    error: 'An error occurred while updating version status',
                };
            }
        },
    }),
    revertPatch: defineAction({
        input: z.object({
            galaxyId: z.string(),
            versionTag: z.string(),
            issueId: z.string(),
        }),
        handler: async ({ galaxyId, versionTag, issueId }): Promise<{ success: boolean; error?: string }> => {
            try {
                const reverted = await revertPatch(galaxyId, versionTag, issueId);
                if (!reverted) {
                    return {
                        success: false,
                        error: 'Failed to revert patch',
                    };
                }
                return {
                    success: true,
                };
            } catch (error) {
                console.error('Error reverting patch:', error);
                return {
                    success: false,
                    error: 'An error occurred while reverting patch',
                };
            }
        },
    }),
    createVersion: defineAction({
        input: z.object({
            galaxyId: z.string(),
            tag: z.string(),
            email: z.string().email(),
        }),
        handler: async ({ galaxyId, tag, email }): Promise<{ success: boolean; version?: Version; error?: string }> => {
            try {
                // Get demo to find maintainer user
                const demo = await getDemoByEmail(email);
                if (!demo || !demo.users || demo.users.length === 0) {
                    return {
                        success: false,
                        error: 'Demo not found',
                    };
                }

                // Get all stars from demo
                const users = await getStarByIds(demo.users);
                if (!users || users.length === 0) {
                    return {
                        success: false,
                        error: 'Users not found',
                    };
                }

                // Find maintainer user
                const maintainerUser = users.find(u => u.userId === demo.users[0].toString());
                if (!maintainerUser || !maintainerUser._id) {
                    return {
                        success: false,
                        error: 'Maintainer user not found',
                    };
                }

                const newVersion: Version = {
                    galaxy: galaxyId,
                    tag: tag.trim(),
                    createdTime: Math.floor(Date.now() / 1000),
                    status: 'complete',
                    patches: [],
                    maintainer: maintainerUser._id.toString(),
                };

                const created = await createVersion(newVersion);
                if (!created) {
                    return {
                        success: false,
                        error: 'Failed to create version',
                    };
                }

                // Fetch the created version to return it
                const versions = await getVersionsByGalaxy(galaxyId);
                const createdVersion = versions.find(v => v.tag === tag.trim());

                return {
                    success: true,
                    version: createdVersion,
                };
            } catch (error) {
                console.error('Error creating version:', error);
                return {
                    success: false,
                    error: 'An error occurred while creating version',
                };
            }
        },
    }),
    updatePatches: defineAction({
        input: z.object({
            versionId: z.string(),
            patches: z.array(z.object({
                id: z.string(),
                completed: z.boolean(),
                tested: z.boolean().optional(),
                title: z.string(),
            })),
        }),
        handler: async ({ versionId, patches }): Promise<{ success: boolean; error?: string }> => {
            try {
                const updated = await updatePatches(versionId, patches);
                if (!updated) {
                    return {
                        success: false,
                        error: 'Failed to update patches',
                    };
                }
                return {
                    success: true,
                };
            } catch (error) {
                console.error('Error updating patches:', error);
                return {
                    success: false,
                    error: 'An error occurred while updating patches',
                };
            }
        },
    }),
    removePatch: defineAction({
        input: z.object({
            patchId: z.string(),
            versionId: z.string(),
        }),
        handler: async ({ patchId, versionId }): Promise<{ success: boolean; error?: string }> => {
            try {
                const removed = await removePatch(patchId, versionId);
                if (!removed) {
                    return {
                        success: false,
                        error: 'Failed to remove patch',
                    };
                }
                return {
                    success: true,
                };
            } catch (error) {
                console.error('Error removing patch:', error);
                return {
                    success: false,
                    error: 'An error occurred while removing patch',
                };
            }
        },
    }),
    completePatch: defineAction({
        input: z.object({
            versionId: z.string(),
            patchId: z.string(),
            complete: z.boolean(),
        }),
        handler: async ({ versionId, patchId, complete }): Promise<{ success: boolean; error?: string }> => {
            try {
                const updated = await completePatch(versionId, patchId, complete);
                if (!updated) {
                    return {
                        success: false,
                        error: 'Failed to update patch completion status',
                    };
                }
                return {
                    success: true,
                };
            } catch (error) {
                console.error('Error completing patch:', error);
                return {
                    success: false,
                    error: 'An error occurred while updating patch completion status',
                };
            }
        },
    }),
    testPatch: defineAction({
        input: z.object({
            versionId: z.string(),
            patchId: z.string(),
            tested: z.boolean(),
        }),
        handler: async ({ versionId, patchId, tested }): Promise<{ success: boolean; error?: string }> => {
            try {
                const updated = await testPatch(versionId, patchId, tested);
                if (!updated) {
                    return {
                        success: false,
                        error: 'Failed to update patch tested status',
                    };
                }
                return {
                    success: true,
                };
            } catch (error) {
                console.error('Error updating patch tested status:', error);
                return {
                    success: false,
                    error: 'An error occurred while updating patch tested status',
                };
            }
        },
    }),
}

