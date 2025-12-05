import { ObjectId } from 'mongodb'
import { getCollection } from '../scripts/db'
import { getOrCreateUserByEmail } from '../scripts/user'
import { GalaxyModel } from '../scripts/galaxy'
import { getOrCreateProject, ProjectModel } from '../scripts/project'

// Initial galaxy data for demo setup
const initialGalaxies: Omit<GalaxyModel, '_id' | 'maintainer' | 'projectLink'>[] = [
    {
        name: 'Hyperpayment',
        description: 'A protocol and its implementation to transfer a resource between arbitrary amount parties. Used for example in Ara to distribute donations',
        stars: 0,
        sunshines: 0,
        users: 0,
        donationAmount: 0,
        x: 1300,
        y: 100,
        tags: ['Payment', 'Protocol', 'Blockchain', 'Solidity', 'P2P'],
    },
    {
        name: 'Reflect',
        description: 'A modern reflection library for TypeScript and JavaScript',
        stars: 0,
        sunshines: 0,
        users: 0,
        donationAmount: 0,
        x: 1200,
        y: 400,
        tags: ['TypeScript', 'JavaScript', 'Library', 'Reflection', 'Meta'],
    },
    {
        name: 'Ara App',
        description: 'The frontend application for Ara platform',
        stars: 0,
        sunshines: 0,
        users: 0,
        donationAmount: 0,
        x: 400,
        y: 200,
        tags: ['Frontend', 'React', 'Astro', 'Web3', 'Open Source'],
    },
    {
        name: 'Blockchain Verification Tool',
        description: 'An open-source tool for verifying software components on the blockchain',
        stars: 0,
        sunshines: 0,
        users: 0,
        donationAmount: 0,
        x: 1000,
        y: 600,
        tags: ['Blockchain', 'Verification', 'Security', 'Tool', 'Ethereum'],
    },
    {
        name: 'Galaxy Engine',
        description: 'A rendering engine for creating beautiful galaxy visualizations',
        stars: 0,
        sunshines: 0,
        users: 0,
        donationAmount: 0,
        x: 400,
        y: 500,
        tags: ['Graphics', 'WebGL', 'Visualization', '3D', 'Rendering'],
    },
]

/**
 * Setup demo galaxies - creates projects first, then links galaxies
 */
export async function setup(): Promise<void> {
    try {
        // Get or create maintainer user
        const maintainerId = await getOrCreateUserByEmail('milayter@gmail.com')
        console.log(`✅ Maintainer user ID: ${maintainerId}`)

        // Step 1: Create projects for each initial galaxy
        const projectIds: ObjectId[] = []
        const now = new Date()
        for (const galaxy of initialGalaxies) {
            const projectData: Omit<ProjectModel, '_id'> = {
                uri: `/project?galaxy=${galaxy.name.toLowerCase().replace(/\s+/g, '-')}`,
                forkLines: [],
                socialLinks: [
                    {
                        label: 'GitHub',
                        uri: `https://github.com/example/${galaxy.name.toLowerCase().replace(/\s+/g, '-')}`,
                        type: 'github'
                    },
                    {
                        label: 'Blockchain Explorer',
                        uri: `https://etherscan.io/address/0x${Math.random().toString(16).substring(2, 42)}`,
                        type: 'blockchain-explorer'
                    },
                    {
                        label: 'Documentation',
                        uri: `https://docs.example.com/${galaxy.name.toLowerCase().replace(/\s+/g, '-')}`,
                        type: 'documentation'
                    }
                ],
                createdAt: now,
                lastCommitId: undefined,
                lastCommitUpdateTime: undefined
            }

            const projectId = await getOrCreateProject(projectData)
            projectIds.push(projectId)
            console.log(`✅ Project created/linked for ${galaxy.name}: ${projectId}`)
        }

        // Step 2: Get galaxies collection
        const collection = await getCollection<GalaxyModel>('galaxies')
        const existingCount = await collection.countDocuments({})

        if (existingCount === 0) {
            // Create new galaxies with projectLink references
            const galaxiesToCreate: GalaxyModel[] = initialGalaxies.map((galaxy, index) => ({
                ...galaxy,
                maintainer: maintainerId,
                projectLink: projectIds[index],
            }))

            const insertResult = await collection.insertMany(galaxiesToCreate as any)
            console.log(`✅ Created ${insertResult.insertedCount} demo galaxies`)
        } else {
            // Update existing galaxies with projectLink if they don't have it
            const existingGalaxies = await collection.find({}).toArray()
            let updatedCount = 0

            for (let i = 0; i < existingGalaxies.length && i < initialGalaxies.length; i++) {
                const galaxy = existingGalaxies[i]
                if (!galaxy.projectLink) {
                    await collection.updateOne(
                        { _id: galaxy._id },
                        { $set: { projectLink: projectIds[i] } }
                    )
                    updatedCount++
                }
            }

            if (updatedCount > 0) {
                console.log(`✅ Updated ${updatedCount} existing galaxies with project links`)
            } else {
                console.log(`✅ Galaxies already exist and have project links (${existingCount} found)`)
            }
        }
    } catch (error) {
        console.error('Error setting up demo galaxies:', error)
        throw error
    }
}

