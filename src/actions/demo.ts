import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import { getDemoByEmail, createDemo } from '@/scripts/demo'
import { UserModel, Roles } from '@/scripts/user'

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
function createDemoUsers(): UserModel[] {
    return [
        generateRandomUser('maintainer', 0),
        generateRandomUser('user', 1),
        generateRandomUser('contributor', 2),
    ]
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
                    return {
                        success: true,
                        users: existingDemo.users,
                    }
                }

                // Create new demo with three users
                const users = createDemoUsers()
                const created = await createDemo(email, users)

                if (!created) {
                    return {
                        success: false,
                        error: 'Failed to create demo',
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
                    error: 'An error occurred while starting the demo',
                }
            }
        },
    }),
}

