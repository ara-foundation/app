import type { Meta, StoryObj } from '@storybook/react'
import ProfileLinkPanel from './ProfileLinkPanel'

const meta: Meta<typeof ProfileLinkPanel> = {
    title: 'Components/Profile/Panel/ProfileLinkPanel (Deprecated)',
    component: ProfileLinkPanel,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: 'A user card component that displays user information, stats, highlighted interactions, and follow functionality. Used for networking and user discovery.',
            },
        },
    },
    argTypes: {
        avatar: {
            control: 'text',
            description: 'User avatar image URL',
        },
        name: {
            control: 'text',
            description: 'User display name',
        },
        rating: {
            control: 'number',
            description: 'User rating score',
        },
        description: {
            control: 'text',
            description: 'User description or bio',
        },
        isFollowing: {
            control: 'boolean',
            description: 'Whether the current user is following this profile',
        },
        onFollowToggle: {
            action: 'follow toggled',
            description: 'Function called when follow button is clicked',
        },
    },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// Mock data for different user scenarios
const mockHighlightedInteraction = {
    avatar: 'https://dummyimage.com/32x32/4A90E2/ffffff?text=SJ',
    name: 'Sarah Johnson',
    rating: 220,
    comment: '@David your code is really good!',
    time: 'Today at 8:22 AM',
}

const mockUserStats = {
    date: 'Joined 2 months ago',
    followers: 1250,
    projects: 12,
}

// Default story
export const Default: Story = {
    args: {
        avatar: 'https://dummyimage.com/64x64/4A90E2/ffffff?text=JD',
        name: 'John Doe',
        rating: 185,
        description: 'Passionate developer with expertise in React, TypeScript, and modern web technologies.',
        highlightedInteraction: mockHighlightedInteraction,
        stats: mockUserStats,
        isFollowing: false,
        onFollowToggle: () => console.log('Follow toggled'),
    },
}

// Following state
export const Following: Story = {
    args: {
        ...Default.args,
        isFollowing: true,
        name: 'Sarah Wilson',
        rating: 320,
        description: 'Senior full-stack developer and open source contributor.',
    },
    parameters: {
        docs: {
            description: {
                story: 'Shows a user card where the current user is already following this profile.',
            },
        },
    },
}

// Not following state
export const NotFollowing: Story = {
    args: {
        ...Default.args,
        isFollowing: false,
        name: 'Alex Chen',
        rating: 95,
        description: 'New to the platform, eager to contribute to open source projects.',
    },
    parameters: {
        docs: {
            description: {
                story: 'Shows a user card where the current user is not following this profile.',
            },
        },
    },
}

// High activity user
export const HighActivity: Story = {
    args: {
        ...Default.args,
        name: 'Maria Rodriguez',
        rating: 450,
        description: 'Top contributor with extensive experience in blockchain development and smart contracts.',
        highlightedInteraction: {
            ...mockHighlightedInteraction,
            name: 'Tech Lead',
            rating: 380,
            comment: 'Excellent work on the smart contract implementation!',
        },
        stats: {
            date: 'Joined 1 year ago',
            followers: 5200,
            projects: 35,
        },
    },
    parameters: {
        docs: {
            description: {
                story: 'Shows a highly active user with high ratings and many projects.',
            },
        },
    },
}

// Low activity user
export const LowActivity: Story = {
    args: {
        ...Default.args,
        name: 'New User',
        rating: 15,
        description: 'Just getting started with open source development.',
        highlightedInteraction: {
            ...mockHighlightedInteraction,
            name: 'Mentor',
            rating: 120,
            comment: 'Welcome to the community!',
        },
        stats: {
            date: 'Joined 1 week ago',
            followers: 5,
            projects: 1,
        },
    },
    parameters: {
        docs: {
            description: {
                story: 'Shows a new user with minimal activity and low ratings.',
            },
        },
    },
}

// No interactions
export const NoInteractions: Story = {
    args: {
        ...Default.args,
        name: 'Private Developer',
        rating: 75,
        description: 'Focused developer with minimal social interactions.',
        highlightedInteraction: {
            avatar: 'https://dummyimage.com/32x32/6B7280/ffffff?text=--',
            name: 'No recent interactions',
            rating: 0,
            comment: 'No highlighted interactions available',
            time: 'N/A',
        },
        stats: {
            date: 'Joined 3 months ago',
            followers: 25,
            projects: 3,
        },
    },
    parameters: {
        docs: {
            description: {
                story: 'Shows a user with no recent interactions or social activity.',
            },
        },
    },
}

// Interactive playground
export const Playground: Story = {
    args: {
        avatar: 'https://dummyimage.com/64x64/8B5CF6/ffffff?text=PU',
        name: 'Playground User',
        rating: 200,
        description: 'Customize this user profile using the controls below.',
        highlightedInteraction: mockHighlightedInteraction,
        stats: mockUserStats,
        isFollowing: false,
        onFollowToggle: () => console.log('Follow toggled'),
    },
    parameters: {
        docs: {
            description: {
                story: 'Interactive playground to test different user card configurations.',
            },
        },
    },
}
