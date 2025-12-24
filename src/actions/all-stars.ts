import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import { Wallet } from 'ethers'
import { getAllStarStats, checkSolarForgeByIssue, updateIssueStars, getGalaxySpace, getUserStar as getUserStarFromSpace, upsertSpaceUserStar, updateUserStarPosition as updateUserStarPositionDb, createSpaceTracer } from '@/server-side/all-stars'
import { getIssueById, updateIssueSolarForgeTxid } from '@/server-side/issue'
import { updateStarStars, getStarById } from '@/server-side/star'
import { getGalaxyById } from '@/server-side/galaxy'
import { getVersionById } from '@/server-side/roadmap'
import type { AllStarStats, SolarForgeByIssueResult, SolarForgeByVersionResult, SolarUser } from '@/types/all-stars'
import { solarForge } from '@/types/all-stars'
import { send } from '@ara-web/crypto-sockets'
import type { RequestSolarForge, ReplySolarForge, ReplyError, RequestSpaceCoord, ReplyTx } from '@ara-web/crypto-sockets'
import type { SerializedSolarForge, SerializedPosition } from '@ara-web/crypto-sockets'

// Shared function for solar forging an issue (used by both action and solarForgeByVersion)
async function solarForgeByIssue(issueId: string): Promise<SolarForgeByIssueResult> {
    try {
        // Check if already solar forged
        const alreadyForged = await checkSolarForgeByIssue(issueId)
        if (alreadyForged) {
            return {
                users: [],
                solarForgeId: '',
                error: 'duplicate',
            }
        }

        // Get issue
        const issue = await getIssueById(issueId)
        if (!issue) {
            return {
                users: [],
                solarForgeId: '',
                error: 'Issue not found',
            }
        }

        // Check if issue has sunshines
        if (!issue.sunshines || issue.sunshines <= 0) {
            return {
                users: [],
                solarForgeId: '',
                error: 'Issue has no sunshines',
            }
        }

        // Calculate stars
        const totalStars = solarForge(issue.sunshines)
        const starsPerRole = totalStars / 3

        // Get stakeholders: author, contributor, maintainer
        const stakeholders: Array<{ userId: string; role: string }> = []
        if (issue.author) {
            stakeholders.push({ userId: issue.author, role: 'author' })
        }
        if (issue.contributor) {
            stakeholders.push({ userId: issue.contributor, role: 'contributor' })
        }
        if (issue.maintainer) {
            stakeholders.push({ userId: issue.maintainer, role: 'maintainer' })
        }

        // Reduce duplicates: group by userId, collect roles
        const userMap = new Map<string, { roles: string[]; stars: number }>()
        for (const stakeholder of stakeholders) {
            const existing = userMap.get(stakeholder.userId)
            if (existing) {
                existing.roles.push(stakeholder.role)
                existing.stars += starsPerRole
            } else {
                userMap.set(stakeholder.userId, {
                    roles: [stakeholder.role],
                    stars: starsPerRole,
                })
            }
        }

        // Update issue: reset sunshines to 0, increment stars
        const issueUpdated = await updateIssueStars(issueId, totalStars, issue.sunshines)
        if (!issueUpdated) {
            return {
                users: [],
                solarForgeId: '',
                error: 'Failed to update issue',
            }
        }

        // Update users: increment stars for each stakeholder
        const solarUsers: SolarUser[] = []
        const userIds: string[] = []
        const userAddresses: string[] = []

        for (const [userId, data] of userMap.entries()) {
            const userUpdated = await updateStarStars(userId, data.stars)
            if (userUpdated) {
                const user = await getStarById(userId)
                if (!user) {
                    continue
                }

                // Derive Ethereum address from demoPrivateKey
                if (!user.demoPrivateKey) {
                    console.error(`User ${userId} missing demoPrivateKey, skipping blockchain solar forge`)
                    continue
                }

                try {
                    const wallet = new Wallet(user.demoPrivateKey)
                    const address = wallet.address
                    userAddresses.push(address)
                } catch (error) {
                    console.error(`Error deriving address for user ${userId}:`, error)
                    continue
                }

                if (issue.galaxy) {
                    await upsertSpaceUserStar({
                        galaxyId: issue.galaxy,
                        userId,
                        data: {
                            nickname: user.nickname,
                            src: user.src,
                            alt: user.alt,
                            stars: user.stars,
                            sunshines: user.sunshines,
                            role: user.role,
                            uri: user.uri,
                        },
                    })
                }
                solarUsers.push({
                    id: userId,
                    roles: data.roles,
                    stars: data.stars,
                })
                userIds.push(userId)
            }
        }

        // Check if we have addresses for all stakeholders
        if (userAddresses.length === 0) {
            return {
                users: [],
                solarForgeId: '',
                error: 'No valid user addresses found for blockchain solar forge',
            }
        }

        // Get galaxy to get blockchainId
        const galaxy = await getGalaxyById(issue.galaxy)
        if (!galaxy || !galaxy.blockchainId) {
            return {
                users: [],
                solarForgeId: '',
                error: 'Galaxy not found or missing blockchainId',
            }
        }

        // Create SerializedSolarForge for blockchain
        const serializedSolarForge: SerializedSolarForge = {
            _id: issueId,
            solarForgeType: 'issue',
            issueId: issueId,
            users: userAddresses,
            stars: totalStars,
        }

        // Call blockchain gateway solarForge
        try {
            const request: RequestSolarForge = {
                cmd: "solarForge",
                params: {
                    galaxyId: galaxy.blockchainId,
                    models: [serializedSolarForge],
                }
            }

            const reply = await send(request)

            if ('error' in reply) {
                const errorReply = reply as ReplyError
                console.error('Blockchain solar forge error:', errorReply.error)
                return {
                    users: [],
                    solarForgeId: '',
                    error: `Blockchain error: ${errorReply.error}`,
                }
            }

            const successReply = reply as ReplySolarForge
            const txHash = successReply.params.txHash

            // Update issue with solarForgeTxid
            const updated = await updateIssueSolarForgeTxid(issueId, txHash)
            if (!updated) {
                console.error('Failed to update issue with solarForgeTxid')
                // Still return success since blockchain transaction succeeded
            }

            return {
                users: solarUsers,
                solarForgeId: txHash,
            }
        } catch (error) {
            console.error('Error calling blockchain gateway for solar forge:', error)
            return {
                users: [],
                solarForgeId: '',
                error: `Failed to call blockchain gateway: ${error instanceof Error ? error.message : String(error)}`,
            }
        }

    } catch (error) {
        console.error('Error in solarForgeByIssue:', error)
        return {
            users: [],
            solarForgeId: '',
            error: 'An error occurred while solar forging issue',
        }
    }
}

export const server = {
    allStarStats: defineAction({
        accept: 'json',
        input: z.object({}),
        handler: async (): Promise<AllStarStats> => {
            try {
                const stats = await getAllStarStats()
                return stats
            } catch (error) {
                console.error('Error in allStarStats action:', error)
                // Return default values on error
                return {
                    totalGalaxies: 0,
                    totalStars: 0,
                    totalUsers: 0,
                    totalSunshines: 0,
                }
            }
        },
    }),
    getGalaxySpace: defineAction({
        accept: 'json',
        input: z.object({
            galaxyId: z.string(),
        }),
        handler: async ({ galaxyId }) => {
            const space = await getGalaxySpace(galaxyId)
            return { space }
        },
    }),
    getUserStar: defineAction({
        accept: 'json',
        input: z.object({
            galaxyId: z.string(),
            userId: z.string(),
        }),
        handler: async ({ galaxyId, userId }) => {
            const userStar = await getUserStarFromSpace(galaxyId, userId)
            return { userStar }
        },
    }),
    updateUserStarPosition: defineAction({
        accept: 'json',
        input: z.object({
            galaxyId: z.string(),
            userId: z.string(),
            x: z.number(),
            y: z.number(),
        }),
        handler: async ({ galaxyId, userId, x, y }) => {
            try {
                // Get user to derive Ethereum address
                const user = await getStarById(userId)
                if (!user) {
                    console.error(`User ${userId} not found`)
                    return { success: false }
                }

                if (!user.demoPrivateKey) {
                    console.error(`User ${userId} missing demoPrivateKey, cannot update blockchain position`)
                    return { success: false }
                }

                // Derive Ethereum address from demoPrivateKey
                let userAddress: string
                try {
                    const wallet = new Wallet(user.demoPrivateKey)
                    userAddress = wallet.address
                } catch (error) {
                    console.error(`Error deriving address for user ${userId}:`, error)
                    return { success: false }
                }

                // Get galaxy to get blockchainId
                const galaxy = await getGalaxyById(galaxyId)
                if (!galaxy || !galaxy.blockchainId) {
                    console.error(`Galaxy ${galaxyId} not found or missing blockchainId`)
                    return { success: false }
                }

                // Call blockchain gateway spaceCoord
                try {
                    const position: SerializedPosition = {
                        userId: userAddress,
                        x: x,
                        y: y,
                    }

                    const request: RequestSpaceCoord = {
                        cmd: "spaceCoord",
                        params: {
                            galaxyId: galaxy.blockchainId,
                            position: position,
                        }
                    }

                    const reply = await send(request)

                    if ('error' in reply) {
                        const errorReply = reply as ReplyError
                        console.error('Blockchain spaceCoord error:', errorReply.error)
                        return { success: false }
                    }

                    const successReply = reply as ReplyTx
                    const txId = successReply.params.tx
                    // Blockchain transaction succeeded, now update database
                    const success = await updateUserStarPositionDb({ galaxyId, userId, x, y })
                    if (success) {
                        // Create space-tracer record
                        try {
                            await createSpaceTracer({ galaxyId, userId, x, y, txId })
                        } catch (error) {
                            console.error('Error creating space tracer:', error)
                            // Don't fail the whole operation if tracer creation fails
                        }
                    }
                    return { success }
                } catch (error) {
                    console.error('Error calling blockchain gateway for spaceCoord:', error)
                    return { success: false }
                }
            } catch (error) {
                console.error('Error in updateUserStarPosition:', error)
                return { success: false }
            }
        },
    }),
    // solarForgeByIssue: defineAction({
    //     accept: 'json',
    //     input: z.object({
    //         issueId: z.string(),
    //     }),
    //     handler: async ({ issueId }): Promise<SolarForgeByIssueResult> => {
    //         try {
    //             const alreadyForged = await checkSolarForgeByIssue(issueId)
    //             if (alreadyForged) {
    //                 return {
    //                     users: [],
    //                     solarForgeId: '',
    //                     error: 'duplicate',
    //                 }
    //             }

    //             // Get issue
    //             const issue = await getIssueById(issueId)
    //             if (!issue) {
    //                 return {
    //                     users: [],
    //                     solarForgeId: '',
    //                     error: 'Issue not found',
    //                 }
    //             }

    //             // Check if issue has sunshines
    //             if (!issue.sunshines || issue.sunshines <= 0) {
    //                 return {
    //                     users: [],
    //                     solarForgeId: '',
    //                     error: 'Issue has no sunshines',
    //                 }
    //             }

    //             // Calculate stars
    //             const totalStars = solarForge(issue.sunshines)
    //             const starsPerRole = totalStars / 3

    //             // Get stakeholders: author, contributor, maintainer
    //             const stakeholders: Array<{ userId: string; role: string }> = []
    //             if (issue.author) {
    //                 stakeholders.push({ userId: issue.author, role: 'author' })
    //             }
    //             if (issue.contributor) {
    //                 stakeholders.push({ userId: issue.contributor, role: 'contributor' })
    //             }
    //             if (issue.maintainer) {
    //                 stakeholders.push({ userId: issue.maintainer, role: 'maintainer' })
    //             }

    //             // Reduce duplicates: group by userId, collect roles
    //             const userMap = new Map<string, { roles: string[]; stars: number }>()
    //             for (const stakeholder of stakeholders) {
    //                 const existing = userMap.get(stakeholder.userId)
    //                 if (existing) {
    //                     existing.roles.push(stakeholder.role)
    //                     existing.stars += starsPerRole
    //                 } else {
    //                     userMap.set(stakeholder.userId, {
    //                         roles: [stakeholder.role],
    //                         stars: starsPerRole,
    //                     })
    //                 }
    //             }

    //             // Update issue: reset sunshines to 0, increment stars
    //             const issueUpdated = await updateIssueStars(issueId, totalStars, issue.sunshines)
    //             if (!issueUpdated) {
    //                 return {
    //                     users: [],
    //                     solarForgeId: '',
    //                     error: 'Failed to update issue',
    //                 }
    //             }

    //             // Update users: increment stars for each stakeholder
    //             const solarUsers: SolarUser[] = []
    //             const userIds: string[] = []
    //             for (const [userId, data] of userMap.entries()) {
    //                 const userUpdated = await updateStarStars(userId, data.stars)
    //                 if (userUpdated) {
    //                     solarUsers.push({
    //                         id: userId,
    //                         roles: data.roles,
    //                         stars: data.stars,
    //                     })
    //                     userIds.push(userId)
    //                 }
    //             }

    //             // Create solar forge tracker entry
    //             const solarForgeId = await createSolarForge({
    //                 solarForgeType: 'issue',
    //                 issueId: issueId,
    //                 users: userIds,
    //                 sunshines: issue.sunshines,
    //                 createdTime: Math.floor(Date.now() / 1000),
    //             })

    //             // Broadcast ISSUE_UPDATE event (client-side will handle this)
    //             // Note: Events are typically broadcast on client-side, but we can emit here for server-side awareness
    //             // The client-side will fetch updated issue and broadcast

    //             // Broadcast USER_UPDATE events for each updated user
    //             for (const userId of userIds) {
    //                 const user = await getStarById(userId)
    //                 if (user) {
    //                     // Note: Events are typically handled client-side
    //                     // The client will listen and update accordingly
    //                 }
    //             }

    //             return {
    //                 users: solarUsers,
    //                 solarForgeId,
    //             }
    //         } catch (error) {
    //             console.error('Error in solarForgeByIssue:', error)
    //             return {
    //                 users: [],
    //                 solarForgeId: '',
    //                 error: 'An error occurred while solar forging issue',
    //             }
    //         }
    //     },
    // }),
    solarForgeByVersion: defineAction({
        accept: 'json',
        input: z.object({
            versionId: z.string(),
        }),
        handler: async ({ versionId }): Promise<SolarForgeByVersionResult> => {
            try {
                // Get version
                const version = await getVersionById(versionId)
                if (!version) {
                    return {
                        users: [],
                        totalIssues: 0,
                        totalSunshines: 0,
                        totalStars: 0,
                    }
                }

                // Get all issues from patches
                const issueIds = version.patches.map(patch => patch.id)
                if (issueIds.length === 0) {
                    return {
                        users: [],
                        totalIssues: 0,
                        totalSunshines: 0,
                        totalStars: 0,
                    }
                }

                // Call solarForgeByIssue for each issue
                const allSolarUsers = new Map<string, SolarUser>()
                let totalSunshines = 0
                let totalStars = 0
                let processedIssues = 0

                for (let i = 0; i < issueIds.length; i++) {
                    const issueId = issueIds[i]

                    // Get issue to check sunshines BEFORE calling solarForgeByIssue
                    // (because solarForgeByIssue will reset sunshines to 0)
                    const issue = await getIssueById(issueId)
                    if (!issue) {
                        continue
                    }

                    const issueSunshines = issue.sunshines || 0
                    if (issueSunshines <= 0) {
                        continue
                    }

                    // Calculate stars from original sunshines (before they're reset)
                    const issueStars = solarForge(issueSunshines)

                    // Call solarForgeByIssue internal function (this will handle duplicate check internally)
                    const result = await solarForgeByIssue(issueId)
                    if (result.error && result.error !== 'duplicate') {
                        // Skip issues with errors (except duplicates which are expected)
                        continue
                    }

                    if (result.error === 'duplicate') {
                        // Still count stats for duplicates
                        processedIssues++
                        totalSunshines += issueSunshines
                        totalStars += issueStars
                        continue
                    }

                    if (result.users.length > 0) {
                        processedIssues++
                        totalSunshines += issueSunshines
                        totalStars += issueStars

                        // Aggregate solar users: merge by userId, sum stars, combine roles
                        for (const solarUser of result.users) {
                            const existing = allSolarUsers.get(solarUser.id)
                            if (existing) {
                                // Merge roles (avoid duplicates)
                                const combinedRoles = [...new Set([...existing.roles, ...solarUser.roles])]
                                existing.roles = combinedRoles
                                existing.stars += solarUser.stars
                            } else {
                                allSolarUsers.set(solarUser.id, {
                                    id: solarUser.id,
                                    roles: [...solarUser.roles],
                                    stars: solarUser.stars,
                                })
                            }
                        }
                    }
                }

                // Convert map to array and sort by stars descending
                const aggregatedUsers = Array.from(allSolarUsers.values()).sort((a, b) => b.stars - a.stars)

                return {
                    users: aggregatedUsers,
                    totalIssues: processedIssues,
                    totalSunshines,
                    totalStars,
                }
            } catch (error) {
                console.error('Error in solarForgeByVersion:', error)
                return {
                    users: [],
                    totalIssues: 0,
                    totalSunshines: 0,
                    totalStars: 0,
                }
            }
        },
    }),
}

