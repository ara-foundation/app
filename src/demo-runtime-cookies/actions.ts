import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import { getDemoByEmail, createDemo, updateDemoStep } from '@/demo-runtime-cookies/server-side'
import { UserModel, Roles, emailToNickname, createUsers, getUserByIds, getUserById, updateUserSunshines } from '@/scripts/user'
import { getGalaxyById, getGalaxyByName, updateGalaxySunshines, GalaxyModel } from '@/scripts/galaxy'
import { processPayment } from '@/scripts/payment-gateway'
import { getIssuesByGalaxy, getShiningIssues, getPublicBacklogIssues, IssueModel } from '@/scripts/issue'

/**
 * Generate a random user with profile picture from DiceBear
 */
function generateRandomUser(role: Roles, index: number): UserModel {
    const randomSeed = `${role}-${index}-${Date.now()}-${Math.random()}`
    const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${randomSeed}&size=256`

    // Generate random names for demo
    const names = [
        'Alex Johnson',
        'Sam Taylor',
        'Jordan Smith',
        'Casey Brown',
        'Morgan Davis',
        'Riley Wilson',
        'Avery Martinez',
        'Quinn Anderson',
        'Sage Thompson',
        'River Garcia'
    ]

    const randomName = names[Math.floor(Math.random() * names.length)]

    // Generate random stats
    const sunshines = Math.floor(Math.random() * 50000) + 10000
    const stars = Math.random() * 100 + 10

    return {
        src: avatarUrl,
        alt: `${role} avatar`,
        uri: '/profile?nickname=' + randomName.replace(' ', '-').toLowerCase(),
        nickname: randomName.replace(' ', '-').toLowerCase(),
        sunshines,
        stars: Math.round(stars * 100) / 100,
        role: role as Roles,
        balance: 0,
    }
}

/**
 * Create three demo users with different roles
 */
async function generateDemoUsers(email: string): Promise<UserModel[]> {
    const users = [{
        email,
        role: 'user',
        nickname: emailToNickname(email),
        src: `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}&size=256`,
        alt: 'Donator avatar',
        uri: '/profile?email=' + emailToNickname(email),
    } as UserModel,
    generateRandomUser('maintainer', 1) as UserModel,
    generateRandomUser('contributor', 2) as UserModel
    ]
    const createdIds = await createUsers(users)
    return createdIds.map((id, index) => ({
        ...users[index],
        _id: id,
    }))

}

export const server = {
    start: defineAction({
        accept: 'form',
        input: z.object({
            email: z.string().email(),
        }),
        handler: async ({ email }): Promise<{ success: boolean; users?: UserModel[]; error?: string }> => {
            try {
                // Check if demo exists
                const existingDemo = await getDemoByEmail(email)

                if (existingDemo) {
                    // Return existing users
                    const users = await getUserByIds(existingDemo.users)
                    // Convert ObjectId to string for serialization
                    const serializedUsers = users.map(user => ({
                        ...user,
                        _id: user._id?.toString(),
                    }))
                    return {
                        success: true,
                        users: serializedUsers,
                    }
                }

                // Create new demo with three users
                const users = await generateDemoUsers(email)
                const created = await createDemo(email, users.map(user => user._id))

                if (!created) {
                    return {
                        success: false,
                        error: 'Failed to create a new demo',
                    }
                }

                // Convert ObjectId to string for serialization
                const serializedUsers = users.map(user => ({
                    ...user,
                    _id: user._id?.toString(),
                }))

                return {
                    success: true,
                    users: serializedUsers,
                }
            } catch (error) {
                console.error('Error in demo start action:', error)
                return {
                    success: false,
                    error: 'An error occurred while starting a new demo',
                }
            }
        },
    }),
    getDemoStep: defineAction({
        accept: 'json',
        input: z.object({
            email: z.string().email(),
        }),
        handler: async ({ email }): Promise<{ success: boolean; step?: number; error?: string }> => {
            try {
                const demo = await getDemoByEmail(email)
                if (!demo) {
                    return {
                        success: false,
                        error: 'Demo not found',
                    }
                }
                return {
                    success: true,
                    step: demo.step,
                }
            } catch (error) {
                console.error('Error getting demo step:', error)
                return {
                    success: false,
                    error: 'An error occurred while getting demo step',
                }
            }
        },
    }),
    getGalaxy: defineAction({
        accept: 'json',
        input: z.object({
            galaxyId: z.string(),
        }),
        handler: async ({ galaxyId }): Promise<{ success: boolean; galaxy?: GalaxyModel; error?: string }> => {
            try {
                // Try to get by ID first
                let galaxy = await getGalaxyById(galaxyId)

                // If not found by ID, try by name
                if (!galaxy) {
                    galaxy = await getGalaxyByName(galaxyId)
                }

                if (!galaxy) {
                    return {
                        success: false,
                        error: 'Galaxy not found',
                    }
                }

                // Convert ObjectId to string for serialization
                const serializedGalaxy = {
                    ...galaxy,
                    _id: galaxy._id?.toString(),
                    maintainer: galaxy.maintainer?.toString(),
                }

                return {
                    success: true,
                    galaxy: serializedGalaxy as any,
                }
            } catch (error) {
                console.error('Error getting galaxy:', error)
                return {
                    success: false,
                    error: 'An error occurred while getting galaxy',
                }
            }
        },
    }),
    obtainSunshines: defineAction({
        accept: 'json',
        input: z.object({
            galaxyId: z.string(),
            userId: z.string(),
            email: z.string().email(),
        }),
        handler: async ({ galaxyId, userId, email }): Promise<{ success: boolean; sunshines?: number; totalSunshines?: number; error?: string }> => {
            try {
                // Get demo and validate step
                const demo = await getDemoByEmail(email)
                if (!demo) {
                    return {
                        success: false,
                        error: 'Demo not found',
                    }
                }

                // Validate step is 0, undefined, or null (obtain-sunshines-step-index)
                if (demo.step !== undefined && demo.step !== null && demo.step !== 0) {
                    return {
                        success: false,
                        error: 'Invalid step. Can only obtain sunshines at step 0',
                    }
                }

                // Get galaxy
                let galaxy = await getGalaxyById(galaxyId)
                if (!galaxy) {
                    return {
                        success: false,
                        error: 'Galaxy not found',
                    }
                }

                // Get user
                const user = await getUserById(userId)
                if (!user) {
                    return {
                        success: false,
                        error: 'User not found',
                    }
                }

                // Process payment ($50)
                const donationAmount = 50;
                const paymentResult = await processPayment(donationAmount, 'USD')
                if (!paymentResult.success) {
                    return {
                        success: false,
                        error: 'Payment processing failed',
                    }
                }

                // Convert $50 to sunshines
                const sunshinesAmount = donationAmount * 1.8

                // Update user sunshines
                const userUpdated = await updateUserSunshines(userId, sunshinesAmount)
                if (!userUpdated) {
                    return {
                        success: false,
                        error: 'Failed to update user sunshines',
                    }
                }

                // Update galaxy sunshines
                const galaxyIdObj = galaxy._id || galaxyId
                const galaxyUpdated = await updateGalaxySunshines(galaxyIdObj, sunshinesAmount)
                if (!galaxyUpdated) {
                    return {
                        success: false,
                        error: 'Failed to update galaxy sunshines',
                    }
                }

                // Increment demo step (set to 1)
                const stepUpdated = await updateDemoStep(email, 1)
                if (!stepUpdated) {
                    return {
                        success: false,
                        error: 'Failed to update demo step',
                    }
                }

                // Calculate total sunshines
                const currentSunshines = user.sunshines || 0
                const totalSunshines = currentSunshines + sunshinesAmount

                return {
                    success: true,
                    sunshines: sunshinesAmount,
                    totalSunshines,
                }
            } catch (error) {
                console.error('Error in obtain sunshines action:', error)
                return {
                    success: false,
                    error: 'An error occurred while obtaining sunshines',
                }
            }
        },
    }),
    getIssuesByGalaxy: defineAction({
        input: z.object({
            galaxyId: z.string(),
        }),
        handler: async ({ galaxyId }): Promise<{ success: boolean; issues?: IssueModel[]; error?: string }> => {
            try {
                const issues = await getIssuesByGalaxy(galaxyId);
                return {
                    success: true,
                    issues,
                };
            } catch (error) {
                console.error('Error getting issues by galaxy:', error);
                return {
                    success: false,
                    error: 'An error occurred while getting issues',
                };
            }
        },
    }),
    getShiningIssues: defineAction({
        input: z.object({
            galaxyId: z.string(),
        }),
        handler: async ({ galaxyId }): Promise<{ success: boolean; data?: IssueModel[]; error?: string }> => {
            try {
                const issues = await getShiningIssues(galaxyId);
                return {
                    success: true,
                    data: issues,
                };
            } catch (error) {
                console.error('Error getting shining issues:', error);
                return {
                    success: false,
                    error: 'An error occurred while getting shining issues',
                };
            }
        },
    }),
    getPublicBacklogIssues: defineAction({
        input: z.object({
            galaxyId: z.string(),
        }),
        handler: async ({ galaxyId }): Promise<{ success: boolean; data?: IssueModel[]; error?: string }> => {
            try {
                const issues = await getPublicBacklogIssues(galaxyId);
                return {
                    success: true,
                    data: issues,
                };
            } catch (error) {
                console.error('Error getting public backlog issues:', error);
                return {
                    success: false,
                    error: 'An error occurred while getting public backlog issues',
                };
            }
        },
    }),
    getUserById: defineAction({
        input: z.object({
            userId: z.string(),
        }),
        handler: async ({ userId }): Promise<{ success: boolean; data?: UserModel; error?: string }> => {
            try {
                const user = await getUserById(userId);
                if (user) {
                    return {
                        success: true,
                        data: user,
                    };
                }
                return {
                    success: false,
                    error: 'User not found',
                };
            } catch (error) {
                console.error('Error getting user by id:', error);
                return {
                    success: false,
                    error: 'An error occurred while getting user',
                };
            }
        },
    }),
}

