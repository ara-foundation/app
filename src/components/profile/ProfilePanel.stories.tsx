import type { Meta, StoryObj } from '@storybook/react'
import ProfilePanel from './ProfilePanel'
import { RatingType } from '../rating/ProfileRating'

const meta: Meta<typeof ProfilePanel> = {
    title: 'Components/Profile/Panel/ProfilePanel',
    component: ProfilePanel,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: 'A comprehensive profile information component that displays user details, ratings, social links, and interactive elements. Features avatar, voting power, followings, ratings panel, and social media links.',
            },
        },
    },
    argTypes: {
        selfProfile: {
            control: 'boolean',
            description: 'Whether this is the user\'s own profile',
        },
        name: {
            control: 'text',
            description: 'The user\'s display name',
        },
        description: {
            control: 'text',
            description: 'The user\'s bio/description',
        },
        subtitle: {
            control: 'text',
            description: 'Optional subtitle for the user',
        },
        avatar: {
            control: 'text',
            description: 'URL or path to the user\'s avatar image',
        },
        followers: {
            control: 'number',
            description: 'Number of followers',
        },
        following: {
            control: 'boolean',
            description: 'Whether the current user is following this profile',
        },
        myAccount: {
            control: 'boolean',
            description: 'Whether this is the current user\'s account',
        },
        totalVotingPower: {
            control: 'number',
            description: 'Total voting power of the user',
        },
        bonusPoints: {
            control: 'number',
            description: 'Bonus points earned by the user',
        },
        projectAmount: {
            control: 'number',
            description: 'Number of projects the user is involved in',
        },
        onActionClick: {
            action: 'action clicked',
            description: 'Function called when action buttons are clicked',
        },
    },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// Mock data for stories
const mockRatings = {
    influencer: {
        ratingType: 'influencer' as RatingType,
        lvl: 5,
        maxLvl: 10,
        top: 15
    },
    maintainer: {
        ratingType: 'maintainer' as RatingType,
        lvl: 8,
        maxLvl: 10,
        top: 7
    },
    contributor: {
        ratingType: 'contributor' as RatingType,
        lvl: 3,
        maxLvl: 10,
        top: 42
    },
    persona: {
        ratingType: 'persona' as RatingType,
        lvl: 6,
        maxLvl: 10,
        top: 23
    }
}

const mockSocialLinks = [
    { type: 'github' as const, url: 'https://github.com/username' },
    { type: 'linkedin' as const, url: 'https://linkedin.com/in/username' },
    { type: 'telegram' as const, url: 'https://t.me/username' }
]

// Default story
export const Default: Story = {
    args: {
        selfProfile: false,
        name: 'John Doe',
        description: 'Passionate developer with expertise in React, TypeScript, and modern web technologies. Love building scalable applications and contributing to open source projects.',
        subtitle: 'Senior Full Stack Developer',
        socialLinks: mockSocialLinks,
        avatar: '/api/placeholder/64/64',
        ratings: mockRatings,
        topRating: 'maintainer',
        followers: 1250,
        following: false,
        myAccount: false,
        totalVotingPower: 850,
        bonusPoints: 150,
        projectAmount: 12,
    },
}

// Self profile story
export const SelfProfile: Story = {
    args: {
        ...Default.args,
        selfProfile: true,
        myAccount: true,
        name: 'Your Profile',
        description: 'This is your own profile. You can edit your information and manage your settings here.',
    },
}

// Profile with minimal information
export const MinimalProfile: Story = {
    args: {
        selfProfile: false,
        name: 'Jane Smith',
        description: 'New to the platform',
        socialLinks: [],
        avatar: '/api/placeholder/64/64',
        ratings: {
            influencer: { ratingType: 'influencer', lvl: 1, maxLvl: 10, top: 999 },
            maintainer: { ratingType: 'maintainer', lvl: 1, maxLvl: 10, top: 999 },
            contributor: { ratingType: 'contributor', lvl: 1, maxLvl: 10, top: 999 },
            persona: { ratingType: 'persona', lvl: 1, maxLvl: 10, top: 999 }
        },
        topRating: 'influencer',
        followers: 0,
        following: false,
        myAccount: false,
        totalVotingPower: 0,
        bonusPoints: 0,
        projectAmount: 0,
    },
}

// High-rated profile
export const HighRatedProfile: Story = {
    args: {
        selfProfile: false,
        name: 'Alex Johnson',
        description: 'Top contributor and maintainer with extensive experience in blockchain development, smart contracts, and decentralized applications. Leading multiple high-impact projects.',
        subtitle: 'Blockchain Expert & Open Source Maintainer',
        socialLinks: [
            { type: 'github', url: 'https://github.com/alexjohnson' },
            { type: 'linkedin', url: 'https://linkedin.com/in/alexjohnson' }
        ],
        avatar: '/api/placeholder/64/64',
        ratings: {
            influencer: { ratingType: 'influencer', lvl: 10, maxLvl: 10, top: 2 },
            maintainer: { ratingType: 'maintainer', lvl: 10, maxLvl: 10, top: 1 },
            contributor: { ratingType: 'contributor', lvl: 9, maxLvl: 10, top: 5 },
            persona: { ratingType: 'persona', lvl: 8, maxLvl: 10, top: 12 }
        },
        topRating: 'maintainer',
        followers: 15420,
        following: true,
        myAccount: false,
        totalVotingPower: 2500,
        bonusPoints: 500,
        projectAmount: 45,
    },
}

// Profile with many social links
export const SocialMediaHeavy: Story = {
    args: {
        ...Default.args,
        name: 'Social Media Influencer',
        description: 'Active on all major social platforms. Follow me for the latest updates on technology, development tips, and industry insights.',
        socialLinks: [
            { type: 'github', url: 'https://github.com/socialuser' },
            { type: 'linkedin', url: 'https://linkedin.com/in/socialuser' },
            { type: 'telegram', url: 'https://t.me/socialuser' },
            { type: 'github', url: 'https://github.com/socialuser2' },
            { type: 'linkedin', url: 'https://linkedin.com/in/socialuser2' }
        ],
        followers: 5000,
        projectAmount: 8,
    },
}

// Profile with long description
export const LongDescription: Story = {
    args: {
        ...Default.args,
        name: 'Detailed Developer',
        description: 'Experienced software engineer with over 10 years of experience in full-stack development. Specialized in React, Node.js, Python, and cloud technologies. Passionate about clean code, test-driven development, and mentoring junior developers. Active contributor to open source projects and speaker at tech conferences. Always eager to learn new technologies and share knowledge with the community. Currently working on innovative blockchain solutions and exploring the intersection of AI and web development.',
        subtitle: 'Senior Software Engineer & Tech Speaker',
        followers: 3200,
        projectAmount: 25,
    },
}

// Profile with no social links
export const NoSocialLinks: Story = {
    args: {
        ...Default.args,
        name: 'Private Developer',
        description: 'Focused on development work without much social media presence.',
        socialLinks: [],
        followers: 150,
        projectAmount: 3,
    },
}

// Profile with single social link
export const SingleSocialLink: Story = {
    args: {
        ...Default.args,
        name: 'GitHub Only',
        description: 'Developer who primarily uses GitHub for professional networking.',
        socialLinks: [
            { type: 'github', url: 'https://github.com/githubonly' }
        ],
        followers: 800,
        projectAmount: 15,
    },
}

// Profile with different rating types as top
export const TopInfluencer: Story = {
    args: {
        ...Default.args,
        name: 'Community Influencer',
        description: 'Well-known figure in the developer community with significant influence.',
        ratings: {
            influencer: { ratingType: 'influencer', lvl: 9, maxLvl: 10, top: 3 },
            maintainer: { ratingType: 'maintainer', lvl: 5, maxLvl: 10, top: 50 },
            contributor: { ratingType: 'contributor', lvl: 7, maxLvl: 10, top: 25 },
            persona: { ratingType: 'persona', lvl: 6, maxLvl: 10, top: 40 }
        },
        topRating: 'influencer',
        followers: 8500,
        projectAmount: 20,
    },
}

export const TopContributor: Story = {
    args: {
        ...Default.args,
        name: 'Active Contributor',
        description: 'Dedicated contributor to multiple open source projects.',
        ratings: {
            influencer: { ratingType: 'influencer', lvl: 4, maxLvl: 10, top: 100 },
            maintainer: { ratingType: 'maintainer', lvl: 6, maxLvl: 10, top: 30 },
            contributor: { ratingType: 'contributor', lvl: 9, maxLvl: 10, top: 8 },
            persona: { ratingType: 'persona', lvl: 5, maxLvl: 10, top: 60 }
        },
        topRating: 'contributor',
        followers: 2100,
        projectAmount: 18,
    },
}

// Interactive playground
export const Playground: Story = {
    args: {
        selfProfile: false,
        name: 'Custom Profile',
        description: 'Customize this profile using the controls below.',
        subtitle: 'Custom Subtitle',
        socialLinks: mockSocialLinks,
        avatar: '/api/placeholder/64/64',
        ratings: mockRatings,
        topRating: 'maintainer',
        followers: 1000,
        following: false,
        myAccount: false,
        totalVotingPower: 500,
        bonusPoints: 100,
        projectAmount: 10,
    },
    parameters: {
        docs: {
            description: {
                story: 'Interactive playground to test different profile configurations. Use the controls below to modify the profile properties.',
            },
        },
    },
}

