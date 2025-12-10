import type { Meta, StoryObj } from '@storybook/react'
import ProjectCard from './ProjectLink'
import { UserStarData } from '@/components/all-stars/Space'

const meta: Meta<typeof ProjectCard> = {
    title: 'Components/Project/Project Link',
    component: ProjectCard,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: 'A comprehensive project information panel displaying project details, statistics, and collaboration data.',
            },
        },
    },
    argTypes: {
        title: {
            control: 'text',
            description: 'The project title',
        },
        isInfluencer: {
            control: 'boolean',
            description: 'Whether the current user is an influencer for this project',
        },
        rating: {
            control: 'object',
            description: 'Project rating object with rating and pointsLeft',
        },
        forks: {
            control: { type: 'number', min: 0 },
            description: 'Number of forks',
        },
        likes: {
            control: { type: 'number', min: 0 },
            description: 'Number of likes',
        },
        isFollowing: {
            control: 'boolean',
            description: 'Whether the user is following this project',
        },
        followers: {
            control: { type: 'number', min: 0 },
            description: 'Number of followers',
        },
        originalProject: {
            control: 'text',
            description: 'Original project name',
        },
        originalProjectUrl: {
            control: 'text',
            description: 'URL to the original project',
        },
        issue: {
            control: 'text',
            description: 'Issue description',
        },
        description: {
            control: 'text',
            description: 'Project description',
        },
        license: {
            control: 'text',
            description: 'Project license',
        },
        balance: {
            control: { type: 'number', min: 0 },
            description: 'Project balance',
        },
        cascadeBalance: {
            control: { type: 'number', min: 0 },
            description: 'Cascade balance',
        },
        totalAmount: {
            control: { type: 'number', min: 0 },
            description: 'Total amount',
        },
        duration: {
            control: 'text',
            description: 'Project duration',
        },
        lastActivity: {
            control: { type: 'number', min: 0 },
            description: 'Last activity timestamp',
        },
        totalCommits: {
            control: { type: 'number', min: 0 },
            description: 'Total number of commits',
        },
        commitsPerDay: {
            control: 'text',
            description: 'Average commits per day',
        },
        openIssues: {
            control: { type: 'number', min: 0 },
            description: 'Number of open issues',
        },
        closedIssues: {
            control: { type: 'number', min: 0 },
            description: 'Number of closed issues',
        },
        avgResponseTime: {
            control: 'text',
            description: 'Average response time',
        },
        createdTime: {
            control: { type: 'number', min: 0 },
            description: 'Project creation timestamp',
        },
        author: {
            control: 'object',
            description: 'Project author information',
        },
        stars: {
            control: 'object',
            description: 'List of project user stars',
        },
        actions: {
            control: 'object',
            description: 'Available actions for the project',
        },
    },
}

export default meta
type Story = StoryObj<typeof ProjectCard>

// Default story with realistic data
export const Default: Story = {
    args: {
        title: 'React TypeScript Starter',
        isInfluencer: false,
        rating: {
            rating: 6,
            pointsLeft: 650
        },
        forks: 128,
        likes: 342,
        isFollowing: false,
        followers: 45,
        originalProject: 'facebook/react',
        originalProjectUrl: 'https://github.com/facebook/react',
        issue: '#1234 - Add TypeScript support',
        description: 'A modern React starter template with TypeScript, Tailwind CSS, and Vite. Perfect for building scalable web applications with best practices built-in.',
        license: 'MIT License',
        balance: 2450,
        cascadeBalance: 1200,
        totalAmount: 3650,
        duration: '6 months',
        lastActivity: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
        totalCommits: 1247,
        commitsPerDay: '2.3',
        openIssues: 12,
        closedIssues: 89,
        avgResponseTime: '2.5 days',
        createdTime: Date.now() - 3 * 365 * 24 * 60 * 60 * 1000, // 3 years ago
        author: {
            uri: '/profile/john-doe',
            children: 'John Doe',
            icon: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
            rating: {
                ratingType: 'maintainer',
                lvl: 8,
                maxLvl: 10,
                top: 15
            }
        },
        stars: [
            {
                x: 200,
                y: 150,
                nickname: 'Jane Smith',
                src: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
                alt: 'Jane Smith Avatar',
                stars: 3.0,
                sunshines: 72,
                role: 'Influencer',
                funded: 25000,
                received: 18000,
                issuesClosed: 22,
                issuesActive: 4,
                uri: '/profile/jane-smith'
            },
            {
                x: 450,
                y: 300,
                nickname: 'Mike Johnson',
                src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
                alt: 'Mike Johnson Avatar',
                stars: 2.0,
                sunshines: 48,
                role: 'Contributor',
                funded: 15000,
                received: 10000,
                issuesClosed: 15,
                issuesActive: 2,
                uri: '/profile/mike-johnson'
            },
        ] as UserStarData[],
        actions: [
            {
                variant: 'primary',
                uri: '/work/project-123',
                children: 'View Work',
                icon: 'work'
            },
            {
                variant: 'secondary',
                uri: '/cascade/project-123',
                children: 'Cascade Work',
                icon: 'cascade'
            }
        ]
    },
}

// Story with user as influencer
export const AsInfluencer: Story = {
    args: {
        ...Default.args,
        isInfluencer: true,
        isFollowing: true,
    },
}

// Story with high engagement
export const HighEngagement: Story = {
    args: {
        ...Default.args,
        title: 'Vue.js Ecosystem',
        rating: {
            rating: 8,
            pointsLeft: 150
        },
        forks: 1250,
        likes: 2100,
        followers: 1200,
        totalCommits: 5420,
        commitsPerDay: '8.7',
        openIssues: 3,
        closedIssues: 456,
        avgResponseTime: '4 hours',
        createdTime: Date.now() - 7 * 365 * 24 * 60 * 60 * 1000, // 7 years ago
        author: {
            uri: '/profile/evan-you',
            children: 'Evan You',
            icon: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
            rating: {
                ratingType: 'maintainer',
                lvl: 10,
                maxLvl: 10,
                top: 1
            }
        },
        stars: [
            {
                x: 200,
                y: 150,
                nickname: 'Vue Contributor 1',
                src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
                alt: 'Vue Contributor 1 Avatar',
                stars: 4.0,
                sunshines: 96,
                role: 'Influencer',
                funded: 60000,
                received: 50000,
                issuesClosed: 40,
                issuesActive: 10,
                uri: '/profile/vue-contributor-1'
            },
            {
                x: 450,
                y: 300,
                nickname: 'Vue Contributor 2',
                src: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
                alt: 'Vue Contributor 2 Avatar',
                stars: 3.5,
                sunshines: 84,
                role: 'Influencer',
                funded: 50000,
                received: 40000,
                issuesClosed: 35,
                issuesActive: 8,
                uri: '/profile/vue-contributor-2'
            },
            {
                x: 700,
                y: 200,
                nickname: 'Vue Contributor 3',
                src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
                alt: 'Vue Contributor 3 Avatar',
                stars: 3.0,
                sunshines: 72,
                role: 'Contributor',
                funded: 30000,
                received: 22000,
                issuesClosed: 30,
                issuesActive: 6,
                uri: '/profile/vue-contributor-3'
            },
            {
                x: 100,
                y: 400,
                nickname: 'Vue Contributor 4',
                src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
                alt: 'Vue Contributor 4 Avatar',
                stars: 2.5,
                sunshines: 60,
                role: 'Contributor',
                funded: 20000,
                received: 15000,
                issuesClosed: 20,
                issuesActive: 4,
                uri: '/profile/vue-contributor-4'
            },
            {
                x: 850,
                y: 500,
                nickname: 'Vue Contributor 5',
                src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face',
                alt: 'Vue Contributor 5 Avatar',
                stars: 2.0,
                sunshines: 48,
                role: 'Contributor',
                funded: 15000,
                received: 10000,
                issuesClosed: 15,
                issuesActive: 2,
                uri: '/profile/vue-contributor-5'
            },
        ] as UserStarData[],
    },
}

// Story with low activity
export const LowActivity: Story = {
    args: {
        ...Default.args,
        title: 'Legacy PHP Library',
        rating: {
            rating: 2,
            pointsLeft: 800
        },
        forks: 5,
        likes: 12,
        followers: 3,
        totalCommits: 45,
        commitsPerDay: '0.1',
        openIssues: 23,
        closedIssues: 8,
        avgResponseTime: '2 weeks',
        createdTime: Date.now() - 1 * 365 * 24 * 60 * 60 * 1000, // 1 year ago
        author: {
            uri: '/profile/unknown',
            children: 'Unknown',
            icon: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
            rating: {
                ratingType: 'maintainer',
                lvl: 2,
                maxLvl: 10,
                top: 100
            }
        },
        stars: [] as UserStarData[],
    },
}

// Story with many collaborators
export const ManyCollaborators: Story = {
    args: {
        ...Default.args,
        title: 'Open Source Database',
        rating: {
            rating: 7,
            pointsLeft: 300
        },
        forks: 500,
        likes: 1200,
        followers: 800,
        totalCommits: 3500,
        commitsPerDay: '5.2',
        openIssues: 15,
        closedIssues: 200,
        avgResponseTime: '1 day',
        author: {
            uri: '/profile/alice-johnson',
            children: 'Alice Johnson',
            icon: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
            rating: {
                ratingType: 'maintainer',
                lvl: 9,
                maxLvl: 10,
                top: 8
            }
        },
        stars: [
            {
                x: 200,
                y: 150,
                nickname: 'Bob Smith',
                src: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
                alt: 'Bob Smith Avatar',
                stars: 3.5,
                sunshines: 84,
                role: 'Contributor',
                funded: 35000,
                received: 28000,
                issuesClosed: 28,
                issuesActive: 7,
                uri: '/profile/bob-smith'
            },
            {
                x: 450,
                y: 300,
                nickname: 'Carol Davis',
                src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
                alt: 'Carol Davis Avatar',
                stars: 3.0,
                sunshines: 72,
                role: 'Contributor',
                funded: 30000,
                received: 24000,
                issuesClosed: 24,
                issuesActive: 6,
                uri: '/profile/carol-davis'
            },
            {
                x: 700,
                y: 200,
                nickname: 'David Wilson',
                src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
                alt: 'David Wilson Avatar',
                stars: 2.5,
                sunshines: 60,
                role: 'Contributor',
                funded: 25000,
                received: 20000,
                issuesClosed: 20,
                issuesActive: 5,
                uri: '/profile/david-wilson'
            },
            {
                x: 100,
                y: 400,
                nickname: 'Eva Brown',
                src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face',
                alt: 'Eva Brown Avatar',
                stars: 2.0,
                sunshines: 48,
                role: 'Contributor',
                funded: 20000,
                received: 15000,
                issuesClosed: 16,
                issuesActive: 4,
                uri: '/profile/eva-brown'
            },
        ] as UserStarData[],
    },
}

// Story with minimal data
export const Minimal: Story = {
    args: {
        title: 'Simple Project',
        isInfluencer: false,
        rating: {
            rating: 0,
            pointsLeft: 1000
        },
        forks: 0,
        likes: 0,
        isFollowing: false,
        followers: 0,
        originalProject: 'original/repo',
        originalProjectUrl: 'https://github.com/original/repo',
        issue: '#1 - Initial issue',
        description: 'A simple project description.',
        license: 'MIT',
        balance: 0,
        cascadeBalance: 0,
        totalAmount: 0,
        duration: '1 month',
        lastActivity: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
        totalCommits: 1,
        commitsPerDay: '0.1',
        openIssues: 0,
        closedIssues: 0,
        avgResponseTime: 'N/A',
        createdTime: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
        author: {
            uri: '/profile/new-developer',
            children: 'New Developer',
            icon: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
            rating: {
                ratingType: 'maintainer',
                lvl: 1,
                maxLvl: 10,
                top: 500
            }
        },
        stars: [] as UserStarData[],
        actions: [
            {
                variant: 'primary',
                uri: '/work/project-minimal',
                children: 'View Work',
                icon: 'work'
            }
        ]
    },
}
