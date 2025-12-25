import { Collection, ObjectId } from 'mongodb'
import { Wallet } from 'ethers'
import { getCollection } from '../server-side/db'
import { getOrCreateStarByEmail, getStarByEmail } from '../server-side/star'
import { createGalaxy, getAllGalaxies } from '../server-side/galaxy'
import { createProject, getProjectById } from '../server-side/project'
import type { Galaxy } from '../types/galaxy'
import type { Project } from '../types/project'
import { send } from '@ara-web/crypto-sockets'
import type { RequestAddGalaxy, ReplyGalaxyCreation, ReplyError } from '@ara-web/crypto-sockets'

// Internal model types for direct MongoDB operations
interface GalaxyModel {
    _id?: ObjectId
    maintainer: ObjectId
    projectLink: ObjectId
    name: string
    description: string
    stars: number
    sunshines: number
    users: number
    donationAmount: number
    x: number
    y: number
    tags?: string[]
}

// Initial galaxy data for demo setup
const initialGalaxies: Omit<Galaxy, '_id' | 'maintainer' | 'projectLink'>[] = [
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
 * Ensure all users have private keys
 */
async function ensureUsersHavePrivateKeys(): Promise<void> {
    try {
        const collection = await getCollection<any>('stars')
        const users = await collection.find({}).toArray()
        let updatedCount = 0

        for (const user of users) {
            if (!user.demoPrivateKey) {
                const wallet = Wallet.createRandom()
                await collection.updateOne(
                    { _id: user._id },
                    { $set: { demoPrivateKey: wallet.privateKey } }
                )
                updatedCount++
            }
        }

        if (updatedCount > 0) {
            console.log(`✅ Generated private keys for ${updatedCount} users`)
        } else {
            console.log(`✅ All users already have private keys`)
        }
    } catch (error) {
        console.error('Error ensuring users have private keys:', error)
        throw error
    }
}

/**
 * Setup demo galaxies - creates projects first, then links galaxies
 */
export async function setup(): Promise<void> {
    console.log('🔄 Setting up demo...')
    try {
        // Step 0: Ensure all users have private keys (must be done before creating galaxies)
        await ensureUsersHavePrivateKeys()

        // Get or create one maintainer of the projects.
        const maintainerId = await getOrCreateStarByEmail('milayter@gmail.com')
        console.log(`✅ Maintainer user ID: ${maintainerId}`)

        // Step 1: Create projects for each initial galaxy
        const projectIds: ObjectId[] = []
        const now = Math.floor(Date.now() / 1000)
        for (const galaxy of initialGalaxies) {
            const projectData: Omit<Project, '_id'> = {
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

            const projectIdString = await getOrCreateProject(projectData)
            const projectId = new ObjectId(projectIdString)
            projectIds.push(projectId)
            console.log(`✅ Project created/linked for ${galaxy.name}: ${projectIdString}`)
        }

        // Step 2: Get galaxies collection
        const collection = await getCollection<GalaxyModel>('galaxies')
        const existingCount = await collection.countDocuments({})

        if (existingCount === 0) {
            // Create new galaxies with projectLink references
            const galaxiesToCreate: Galaxy[] = initialGalaxies.map((galaxy, index) => ({
                ...galaxy,
                maintainer: maintainerId.toString(),
                projectLink: projectIds[index].toString(),
            }))

            // Create galaxies using the public API
            for (const galaxy of galaxiesToCreate) {
                await createGalaxy(galaxy)
            }
            console.log(`✅ Created ${galaxiesToCreate.length} demo galaxies`)
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
        console.log('🔄 Step 2 completed')

        // Step 3: Check and create galaxies on blockchain if needed
        await ensureGalaxiesOnBlockchain(collection)

        // // Step 4: Create demo issues for each galaxy
        // await setupIssues(projectIds, existingCount, collection)
    } catch (error) {
        console.error('Error setting up demo galaxies:', error)
        throw error
    }
}

/**
 * Ensure all galaxies exist on the blockchain
 */
async function ensureGalaxiesOnBlockchain(collection: Collection<GalaxyModel>): Promise<void> {
    console.log('Ensuring galaxies on blockchain...')
    console.log('🔄 Ensuring galaxies on blockchain...')
    try {
        const galaxies = await getAllGalaxies()
        const maintainerUser = await getStarByEmail('milayter@gmail.com')

        if (!maintainerUser || !maintainerUser._id || !maintainerUser.demoPrivateKey) {
            console.error('Maintainer user not found or missing private key, skipping blockchain setup')
            return
        }

        // Get maintainer wallet to derive address
        const maintainerWallet = new Wallet(maintainerUser.demoPrivateKey)
        const maintainerAddress = maintainerWallet.address

        let createdCount = 0
        for (const galaxy of galaxies) {
            // Skip if already has blockchainId
            if (galaxy.blockchainId) {
                continue
            }

            // Get project to extract GitHub URL
            const project = await getProjectById(galaxy.projectLink)
            if (!project) {
                console.warn(`Project not found for galaxy ${galaxy.name}, skipping blockchain creation`)
                continue
            }

            // Find GitHub link
            const githubLink = project.socialLinks?.find(link => link.type === 'github')
            const repoUrl = githubLink?.uri || `https://github.com/example/${galaxy.name.toLowerCase().replace(/\s+/g, '-')}`

            // Construct issues URL
            const issuesUrl = `https://app.ara.foundation/project/issues?galaxy=${galaxy._id}`

            // Generate random Ethereum account (20 bytes) and convert to 32-byte hex string
            const randomWallet = Wallet.createRandom()
            const address20Bytes = randomWallet.address // 0x + 40 hex chars = 20 bytes
            // Convert to 32-byte hex string (64 hex chars + 0x prefix)
            const galaxyId32Bytes = `0x${address20Bytes.slice(2).padStart(64, '0')}`

            // Prepare addGalaxy request
            const request: RequestAddGalaxy = {
                cmd: "addGalaxy",
                params: {
                    owner: maintainerAddress,
                    repoUrl: repoUrl,
                    issuesUrl: issuesUrl,
                    name: galaxy.name,
                    id: galaxyId32Bytes, // string, not number
                    minX: galaxy.x,
                    maxX: galaxy.x + 100, // Add appropriate range
                    minY: galaxy.y,
                    maxY: galaxy.y + 100, // Add appropriate range
                }
            }

            try {
                // Call blockchain gateway - ensure sequential processing
                const reply = await send(request)

                if ('error' in reply) {
                    const errorReply = reply as ReplyError
                    console.error(`Error creating galaxy ${galaxy.name} on blockchain:`, errorReply.error)
                    // Add small delay before next request to ensure socket is ready
                    await new Promise(resolve => setTimeout(resolve, 100))
                    continue
                }

                const successReply = reply as ReplyGalaxyCreation
                // Update galaxy in database with blockchainId and blockchainTx
                const galaxyObjectId = galaxy._id ? new ObjectId(galaxy._id) : null
                if (galaxyObjectId) {
                    await collection.updateOne(
                        { _id: galaxyObjectId },
                        {
                            $set: {
                                blockchainId: galaxyId32Bytes,
                                blockchainTx: successReply.params.txHash
                            }
                        }
                    )
                    console.log(`✅ Created galaxy ${galaxy.name} on blockchain: ${galaxyId32Bytes}, tx: ${successReply.params.txHash}`)
                    createdCount++
                }

                // Add small delay before next request to ensure socket is ready
                await new Promise(resolve => setTimeout(resolve, 100))
            } catch (error) {
                console.error(`Error calling blockchain gateway for galaxy ${galaxy.name}:`, error)
                // Add delay even on error to ensure socket is ready for next request
                await new Promise(resolve => setTimeout(resolve, 200))
                // Continue with other galaxies
            }
        }

        if (createdCount > 0) {
            console.log(`✅ Created ${createdCount} galaxies on blockchain`)
        } else {
            console.log(`✅ All galaxies already exist on blockchain`)
        }
    } catch (error) {
        console.error('Error ensuring galaxies on blockchain:', error)
        throw error
    }
}

