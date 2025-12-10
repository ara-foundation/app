import type { Meta, StoryObj } from '@storybook/react'
import ProjectListPanel from './ProjectListPanel'
import type { ProjectInfoProps } from './ProjectLink'
import { UserStar as UserStarData } from '@/types/all-stars'

const meta: Meta<typeof ProjectListPanel> = {
    title: 'Components/Project/ProjectListPanel',
    component: ProjectListPanel,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: 'A comprehensive project list panel that displays projects with search and filtering capabilities using FilterableList. Features project cards with detailed information including ratings, statistics, and collaboration data.',
            },
        },
    },
    argTypes: {
        projects: {
            control: { type: 'object' },
            description: 'Array of project data to display in the list',
        },
    },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// Mock data for projects
const mockProjects: ProjectInfoProps[] = [
    {
        title: 'React Dashboard',
        isInfluencer: true,
        rating: {
            sunshines: 2880,
            stars: 8.0
        },
        forks: 124,
        likes: 89,
        isFollowing: true,
        followers: 45,
        originalProject: 'facebook/react',
        originalProjectUrl: 'https://github.com/facebook/react',
        issue: '#1234 - Dashboard Enhancement',
        description: 'A modern React dashboard with TypeScript, Tailwind CSS, and real-time data visualization capabilities.',
        license: 'MIT License',
        balance: 2450,
        cascadeBalance: 1200,
        totalAmount: 3650,
        duration: '6 months',
        lastActivity: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
        totalCommits: 1234,
        commitsPerDay: '12.5',
        openIssues: 8,
        closedIssues: 156,
        avgResponseTime: '2.3 hours',
        createdTime: Date.now() - 2 * 365 * 24 * 60 * 60 * 1000, // 2 years ago
        author: {
            uri: '/profile/john-doe',
            children: 'John Doe',
            icon: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
            rating: {
                ratingType: 'maintainer',
                lvl: 9,
                maxLvl: 10,
                top: 5
            }
        },
        stars: [
            {
                x: 200,
                y: 150,
                nickname: 'Jane Smith',
                src: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
                alt: 'Jane Smith Avatar',
                stars: 3.5,
                sunshines: 84,
                role: 'Influencer',
                funded: 30000,
                received: 20000,
                issuesClosed: 25,
                issuesActive: 5,
                uri: '/profile/jane-smith'
            },
            {
                x: 450,
                y: 300,
                nickname: 'Mike Johnson',
                src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
                alt: 'Mike Johnson Avatar',
                stars: 3.0,
                sunshines: 72,
                role: 'Contributor',
                funded: 20000,
                received: 15000,
                issuesClosed: 20,
                issuesActive: 3,
                uri: '/profile/mike-johnson'
            },
        ] as UserStarData[],
        actions: [
            {
                variant: 'primary',
                uri: '/work/react-dashboard',
                children: 'View Work',
                icon: 'work'
            },
            {
                variant: 'secondary',
                uri: '/cascade/react-dashboard',
                children: 'Cascade Work',
                icon: 'work'
            }
        ]
    },
    {
        title: 'Vue.js E-commerce',
        isInfluencer: false,
        rating: {
            sunshines: 2160,
            stars: 6.0
        },
        forks: 67,
        likes: 45,
        isFollowing: false,
        followers: 23,
        originalProject: 'vuejs/vue',
        originalProjectUrl: 'https://github.com/vuejs/vue',
        issue: '#567 - E-commerce Integration',
        description: 'Full-stack e-commerce solution built with Vue.js, Node.js, and MongoDB. Features include user authentication, payment processing, and inventory management.',
        license: 'Apache 2.0',
        balance: 1890,
        cascadeBalance: 950,
        totalAmount: 2840,
        duration: '4 months',
        lastActivity: Date.now() - 7 * 24 * 60 * 60 * 1000, // 1 week ago
        totalCommits: 892,
        commitsPerDay: '8.2',
        openIssues: 12,
        closedIssues: 89,
        avgResponseTime: '4.1 hours',
        createdTime: Date.now() - 1 * 365 * 24 * 60 * 60 * 1000, // 1 year ago
        author: {
            uri: '/profile/sarah-wilson',
            children: 'Sarah Wilson',
            icon: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
            rating: {
                ratingType: 'maintainer',
                lvl: 7,
                maxLvl: 10,
                top: 18
            }
        },
        stars: [
            {
                x: 300,
                y: 200,
                nickname: 'Tom Brown',
                src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face',
                alt: 'Tom Brown Avatar',
                stars: 2.5,
                sunshines: 60,
                role: 'Contributor',
                funded: 15000,
                received: 10000,
                issuesClosed: 15,
                issuesActive: 2,
                uri: '/profile/tom-brown'
            },
        ] as UserStarData[],
        actions: [
            {
                variant: 'primary',
                uri: '/work/vue-ecommerce',
                children: 'View Work',
                icon: 'work'
            }
        ]
    },
    {
        title: 'Node.js API Gateway',
        isInfluencer: true,
        rating: {
            sunshines: 3240,
            stars: 9.0
        },
        forks: 203,
        likes: 156,
        isFollowing: true,
        followers: 89,
        originalProject: 'expressjs/express',
        originalProjectUrl: 'https://github.com/expressjs/express',
        issue: '#890 - API Gateway Implementation',
        description: 'High-performance API gateway built with Node.js and Express. Includes rate limiting, authentication, load balancing, and comprehensive monitoring.',
        license: 'GPL-3.0',
        balance: 3200,
        cascadeBalance: 1800,
        totalAmount: 5000,
        duration: '8 months',
        lastActivity: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
        totalCommits: 2156,
        commitsPerDay: '15.8',
        openIssues: 5,
        closedIssues: 234,
        avgResponseTime: '1.2 hours',
        createdTime: Date.now() - 3 * 365 * 24 * 60 * 60 * 1000, // 3 years ago
        author: {
            uri: '/profile/alex-chen',
            children: 'Alex Chen',
            icon: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
            rating: {
                ratingType: 'maintainer',
                lvl: 10,
                maxLvl: 10,
                top: 2
            }
        },
        stars: [
            {
                x: 200,
                y: 150,
                nickname: 'Maria Garcia',
                src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
                alt: 'Maria Garcia Avatar',
                stars: 4.0,
                sunshines: 96,
                role: 'Influencer',
                funded: 50000,
                received: 40000,
                issuesClosed: 35,
                issuesActive: 8,
                uri: '/profile/maria-garcia'
            },
            {
                x: 450,
                y: 300,
                nickname: 'David Lee',
                src: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
                alt: 'David Lee Avatar',
                stars: 3.0,
                sunshines: 72,
                role: 'Contributor',
                funded: 25000,
                received: 18000,
                issuesClosed: 24,
                issuesActive: 4,
                uri: '/profile/david-lee'
            },
            {
                x: 700,
                y: 200,
                nickname: 'Emma Wilson',
                src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
                alt: 'Emma Wilson Avatar',
                stars: 2.5,
                sunshines: 60,
                role: 'Contributor',
                funded: 18000,
                received: 12000,
                issuesClosed: 18,
                issuesActive: 3,
                uri: '/profile/emma-wilson'
            },
        ] as UserStarData[],
        actions: [
            {
                variant: 'primary',
                uri: '/work/node-api-gateway',
                children: 'View Work',
                icon: 'work'
            },
            {
                variant: 'secondary',
                uri: '/cascade/node-api-gateway',
                children: 'Cascade Work',
                icon: 'work'
            }
        ]
    },
]

// Default story with mock data
export const Default: Story = {
    args: {
        projects: mockProjects,
    },
    parameters: {
        docs: {
            description: {
                story: 'Default project list panel with sample projects. Shows the complete interface including search, filter tabs, and project cards using FilterableList.',
            },
        },
    },
}

// Empty state
export const EmptyState: Story = {
    args: {
        projects: [],
    },
    parameters: {
        docs: {
            description: {
                story: 'Empty state when no projects are available. The panel still shows the search and filter interface using FilterableList.',
            },
        },
    },
}

// Single project
export const SingleProject: Story = {
    args: {
        projects: [mockProjects[0]],
    },
    parameters: {
        docs: {
            description: {
                story: 'Project list panel with a single project using FilterableList. Useful for testing the layout with minimal content.',
            },
        },
    },
}

// Many projects (stress test)
export const ManyProjects: Story = {
    args: {
        projects: [
            ...mockProjects,
            ...mockProjects.map((project, index) => ({
                ...project,
                title: `${project.title} ${index + 2}`,
                rating: {
                    sunshines: Math.max(360, project.rating.sunshines - (index * 360)),
                    stars: Math.max(1.0, project.rating.stars - (index * 1.0))
                },
                forks: project.forks + (index * 10),
                likes: project.likes + (index * 5),
            })),
        ],
    },
    parameters: {
        docs: {
            description: {
                story: 'Project list panel with many projects to test scrolling and performance using FilterableList. Shows how the component handles larger datasets.',
            },
        },
    },
}

// Projects with different states
export const MixedStates: Story = {
    args: {
        projects: [
            mockProjects[0], // Influencer, following
            {
                ...mockProjects[1],
                isInfluencer: true,
                isFollowing: true,
            },
            {
                ...mockProjects[2],
                rating: {
                    sunshines: 720,
                    stars: 2.0
                }, // Low rating
                openIssues: 45, // Many open issues
                avgResponseTime: '2 days', // Slow response
            },
        ],
    },
    parameters: {
        docs: {
            description: {
                story: 'Project list with mixed states including influencer projects, different ratings, and various issue counts using FilterableList.',
            },
        },
    },
}

// High-rated projects
export const HighRatedProjects: Story = {
    args: {
        projects: mockProjects.map(project => ({
            ...project,
            rating: {
                sunshines: (8 + Math.floor(Math.random() * 2)) * 360, // 8-10 stars worth of sunshines
                stars: 8 + Math.floor(Math.random() * 2) // 8-10 stars
            },
            forks: project.forks + Math.floor(Math.random() * 100),
            likes: project.likes + Math.floor(Math.random() * 50),
        })),
    },
    parameters: {
        docs: {
            description: {
                story: 'Project list featuring high-rated projects with excellent metrics using FilterableList. Shows the best-case scenario for project display.',
            },
        },
    },
}

// Projects with issues
export const ProjectsWithIssues: Story = {
    args: {
        projects: mockProjects.map(project => ({
            ...project,
            openIssues: Math.floor(Math.random() * 50) + 10, // 10-60 open issues
            avgResponseTime: `${Math.floor(Math.random() * 48) + 1} hours`, // 1-48 hours
        })),
    },
    parameters: {
        docs: {
            description: {
                story: 'Project list showing projects with various issue counts and response times using FilterableList. Useful for testing how the component displays projects that need attention.',
            },
        },
    },
}

// Interactive playground
export const Playground: Story = {
    args: {
        projects: mockProjects,
    },
    parameters: {
        docs: {
            description: {
                story: 'Interactive playground to test different project configurations using FilterableList. Use the controls below to modify the project data.',
            },
        },
    },
}
