import { ObjectId } from 'mongodb'
import { getCollection } from '../scripts/db'
import { getOrCreateUserByEmail, getUserByEmail } from '../scripts/user'
import { GalaxyModel } from '../scripts/galaxy'
import { getOrCreateProject, ProjectModel } from '../scripts/project'
import { createIssue, IssueModel } from '../scripts/issue'

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

        // Step 3: Create demo issues for each galaxy
        const maintainerUser = await getUserByEmail('milayter@gmail.com');
        if (!maintainerUser || !maintainerUser._id) {
            console.error('Maintainer user not found, skipping issue creation');
            return;
        }

        const maintainerId = maintainerUser._id;
        const issuesCollection = await getCollection<IssueModel>('issues');
        const existingIssuesCount = await issuesCollection.countDocuments({});

        if (existingIssuesCount === 0) {
            // Create issues for each galaxy
            for (let i = 0; i < initialGalaxies.length && i < projectIds.length; i++) {
                const galaxy = initialGalaxies[i];
                const galaxyId = existingCount > 0 
                    ? (await collection.findOne({ name: galaxy.name }))?._id 
                    : (await collection.findOne({ projectLink: projectIds[i] }))?._id;

                if (!galaxyId) {
                    console.warn(`Galaxy not found for ${galaxy.name}, skipping issue creation`);
                    continue;
                }

                // Create 1-2 shining issues
                const shiningIssues: Omit<IssueModel, '_id'>[] = [
                    {
                        galaxy: galaxyId,
                        uri: `/data/issue/${galaxy.name.toLowerCase().replace(/\s+/g, '-')}-shining-1`,
                        number: `#${1000 + i * 2 + 1}`,
                        title: `Improve ${galaxy.name} performance`,
                        description: `This issue focuses on optimizing the performance of ${galaxy.name}. We need to reduce load times and improve overall responsiveness.`,
                        type: 'improvement',
                        storage: 'arada-',
                        maintainer: maintainerId,
                        projectId: projectIds[i].toString(),
                        categoryId: 'performance',
                        createdTime: new Date(),
                        sunshines: 150 + Math.floor(Math.random() * 100),
                        users: [
                            {
                                username: 'demo-user-1',
                                starshineAmount: 50,
                                transactionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
                            },
                            {
                                username: 'demo-user-2',
                                starshineAmount: 100,
                                transactionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
                            }
                        ]
                    }
                ];

                // Add second shining issue for some galaxies
                if (i < 3) {
                    shiningIssues.push({
                        galaxy: galaxyId,
                        uri: `/data/issue/${galaxy.name.toLowerCase().replace(/\s+/g, '-')}-shining-2`,
                        number: `#${1000 + i * 2 + 2}`,
                        title: `Add new feature to ${galaxy.name}`,
                        description: `This issue proposes adding a new feature that would enhance ${galaxy.name}'s capabilities.`,
                        type: 'feature',
                        storage: 'arada-',
                        maintainer: maintainerId,
                        projectId: projectIds[i].toString(),
                        categoryId: 'feature',
                        createdTime: new Date(),
                        sunshines: 200 + Math.floor(Math.random() * 150),
                        users: [
                            {
                                username: 'demo-user-3',
                                starshineAmount: 75,
                                transactionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
                            },
                            {
                                username: 'demo-user-4',
                                starshineAmount: 125,
                                transactionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
                            }
                        ]
                    });
                }

                // Create public-backlog issues (without sunshines)
                const publicBacklogIssues: Omit<IssueModel, '_id'>[] = [
                    {
                        galaxy: galaxyId,
                        uri: `/data/issue/${galaxy.name.toLowerCase().replace(/\s+/g, '-')}-backlog-1`,
                        number: `#${2000 + i * 2 + 1}`,
                        title: `Fix minor bug in ${galaxy.name}`,
                        description: `This is a minor bug that doesn't affect core functionality but should be addressed.`,
                        type: 'bug',
                        storage: 'arada-',
                        maintainer: maintainerId,
                        projectId: projectIds[i].toString(),
                        categoryId: 'bug',
                        createdTime: new Date(),
                        sunshines: 0,
                        users: [
                            {
                                username: 'demo-user-5',
                                starshineAmount: 0,
                                transactionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
                            }
                        ]
                    },
                    {
                        galaxy: galaxyId,
                        uri: `/data/issue/${galaxy.name.toLowerCase().replace(/\s+/g, '-')}-backlog-2`,
                        number: `#${2000 + i * 2 + 2}`,
                        title: `Documentation update for ${galaxy.name}`,
                        description: `Update the documentation to reflect recent changes and improvements.`,
                        type: 'wish',
                        storage: 'arada-',
                        maintainer: maintainerId,
                        projectId: projectIds[i].toString(),
                        categoryId: 'documentation',
                        createdTime: new Date(),
                        sunshines: 0,
                        users: [
                            {
                                username: 'demo-user-6',
                                starshineAmount: 0,
                                transactionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
                            }
                        ]
                    }
                ];

                // Create all issues
                const allIssues = [...shiningIssues, ...publicBacklogIssues];
                for (const issueData of allIssues) {
                    await createIssue(issueData as IssueModel);
                }

                console.log(`✅ Created ${allIssues.length} issues for ${galaxy.name} (${shiningIssues.length} shining, ${publicBacklogIssues.length} public backlog)`);
            }
        } else {
            console.log(`✅ Issues already exist (${existingIssuesCount} found)`)
        }
    } catch (error) {
        console.error('Error setting up demo galaxies:', error)
        throw error
    }
}

