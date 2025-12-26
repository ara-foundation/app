import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import { ObjectId } from 'mongodb'
import { Wallet } from 'ethers'
import { getDemoByEmail, createDemo, updateDemoStep } from '@/server-side/demo'
import { createStars, getStarByIds, getStarById, updateStarSunshines } from '@/server-side/star'
import { getGalaxyById, updateGalaxySunshines } from '@/server-side/galaxy'
import { processPayment } from '@/server-side/crypto-sockets'
import type { Star, Roles } from '@/types/star'

/**
 * Generate a random star for demo purposes
 */
function generateRandomStar(role: Roles, index: number): Star {
    return {
        sunshines: 0,
        stars: 0,
        role: role as Roles,
        balance: 0,
    }
}

/**
 * Create three demo users with different roles
 */
async function generateDemoStars(email: string): Promise<Star[]> {
    // Generate private keys for each star
    const wallet1 = Wallet.createRandom()
    const wallet2 = Wallet.createRandom()
    const wallet3 = Wallet.createRandom()

    const stars = [{
        role: 'user',
        demoPrivateKey: wallet1.privateKey,
    } as Star,
    {
        ...generateRandomStar('maintainer', 1),
        demoPrivateKey: wallet2.privateKey,
    } as Star,
    {
        ...generateRandomStar('contributor', 2),
        demoPrivateKey: wallet3.privateKey,
    } as Star
    ]
    const createdIds = await createStars(stars)
    return createdIds.map((id, index) => ({
        ...stars[index],
        _id: id,
    }))

}

export const server = {
    start: defineAction({
        accept: 'json',
        input: z.object({
            email: z.string().email(),
        }),
        handler: async ({ email }): Promise<{ success: boolean; users?: Star[]; error?: string }> => {
            try {
                // Check if demo exists
                const existingDemo = await getDemoByEmail(email)

                if (existingDemo) {
                    // Return existing stars
                    const stars = await getStarByIds(existingDemo.users)
                    // Convert ObjectId to string for serialization
                    return {
                        success: true,
                        users: stars,
                    }
                }

                // Create new demo with three stars
                const stars = await generateDemoStars(email)
                const created = await createDemo(email, stars.map(star => new ObjectId(star._id!)))

                if (!created) {
                    return {
                        success: false,
                        error: 'Failed to create a new demo',
                    }
                }

                return {
                    success: true,
                    users: stars,
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
            memo: z.string().optional(),
        }),
        handler: async ({ galaxyId, userId, email, memo }): Promise<{ success: boolean; sunshines?: number; totalSunshines?: number; error?: string }> => {
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
                        error: 'Can not obtain sunshines, galaxy id invalid',
                    }
                }

                // Get star
                const star = await getStarById(userId)
                if (!star) {
                    return {
                        success: false,
                        error: 'Can not obtain sunshines, user id invalid',
                    }
                }

                // Process payment ($50)
                const donationAmount = 50;
                const paymentResult = await processPayment(donationAmount, userId, galaxyId, 'USD', memo)
                if (!paymentResult.success) {
                    return {
                        success: false,
                        error: paymentResult.error || 'Can not obtain sunshines, payment processing failed',
                    }
                }

                // Convert $50 to sunshines
                const sunshinesAmount = donationAmount * 1.8

                // Update star sunshines
                const starUpdated = await updateStarSunshines(userId, sunshinesAmount)
                if (!starUpdated) {
                    return {
                        success: false,
                        error: 'Can not obtain sunshines, failed to update star sunshines',
                    }
                }

                // Update galaxy sunshines
                const galaxyIdObj = galaxy._id || galaxyId
                const galaxyUpdated = await updateGalaxySunshines(galaxyIdObj, sunshinesAmount)
                if (!galaxyUpdated) {
                    return {
                        success: false,
                        error: 'Can not obtain sunshines, failed to update galaxy sunshines',
                    }
                }

                // Increment demo step (set to 1)
                const stepUpdated = await updateDemoStep(email, 1)
                if (!stepUpdated) {
                    return {
                        success: false,
                        error: 'Can not obtain sunshines, failed to update demo step',
                    }
                }

                // Calculate total sunshines
                const currentSunshines = star.sunshines || 0
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
                    error: 'Can not obtain sunshines, an error occurred: ' + (error instanceof Error ? error.message : 'Unknown error'),
                }
            }
        },
    }),
    incrementDemoStep: defineAction({
        accept: 'json',
        input: z.object({
            email: z.string().email(),
            expectedStep: z.number(),
        }),
        handler: async ({ email, expectedStep }): Promise<{ success: boolean; step?: number; error?: string }> => {
            try {
                const demo = await getDemoByEmail(email)
                if (!demo) {
                    return {
                        success: false,
                        error: 'Demo not found',
                    }
                }

                const currentStep = demo.step ?? 0

                // Validate current step matches expected step
                if (currentStep !== expectedStep) {
                    return {
                        success: false,
                        error: `Invalid step. Expected step ${expectedStep}, but current step is ${currentStep}`,
                    }
                }

                // Check if already completed (last step is 8)
                if (currentStep > 8) {
                    return {
                        success: false,
                        error: 'Already completed the demo. Enjoy',
                    }
                }

                // Increment step
                const newStep = currentStep + 1
                const stepUpdated = await updateDemoStep(email, newStep)
                if (!stepUpdated) {
                    return {
                        success: false,
                        error: 'Failed to update demo step',
                    }
                }

                return {
                    success: true,
                    step: newStep,
                }
            } catch (error) {
                console.error('Error incrementing demo step:', error)
                return {
                    success: false,
                    error: 'An error occurred while incrementing demo step',
                }
            }
        },
    }),
}

