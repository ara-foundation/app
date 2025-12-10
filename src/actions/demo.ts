import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import { ObjectId } from 'mongodb'
import { getDemoByEmail, createDemo, updateDemoStep } from '@/scripts/demo'
import { emailToNickname, createUsers, getUserByIds, getUserById, updateUserSunshines } from '@/scripts/user'
import { getGalaxyById, updateGalaxySunshines } from '@/scripts/galaxy'
import { processPayment } from '@/scripts/payment-gateway'
import type { User, Roles } from '@/types/user'

/**
 * Generate a random user with profile picture from DiceBear
 */
function generateRandomUser(role: Roles, index: number): User {
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
async function generateDemoUsers(email: string): Promise<User[]> {
    const users = [{
        email,
        role: 'user',
        nickname: emailToNickname(email),
        src: `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}&size=256`,
        alt: 'Donator avatar',
        uri: '/profile?email=' + emailToNickname(email),
    } as User,
    generateRandomUser('maintainer', 1) as User,
    generateRandomUser('contributor', 2) as User
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
        handler: async ({ email }): Promise<{ success: boolean; users?: User[]; error?: string }> => {
            try {
                // Check if demo exists
                const existingDemo = await getDemoByEmail(email)

                if (existingDemo) {
                    // Return existing users
                    const users = await getUserByIds(existingDemo.users)
                    // Convert ObjectId to string for serialization
                    return {
                        success: true,
                        users: users,
                    }
                }

                // Create new demo with three users
                const users = await generateDemoUsers(email)
                const created = await createDemo(email, users.map(user => new ObjectId(user._id!)))

                if (!created) {
                    return {
                        success: false,
                        error: 'Failed to create a new demo',
                    }
                }

                return {
                    success: true,
                    users: users,
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
    obtainSunshines: defineAction({
        accept: 'json',
        input: z.object({
            galaxyId: z.string(),
            userId: z.string(),
            email: z.string().email(),
        }),
        handler: async ({ galaxyId, userId, email }): Promise<{ success: boolean; sunshines?: number; totalSunshines?: number; error?: string }> => {
            try {
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
}

