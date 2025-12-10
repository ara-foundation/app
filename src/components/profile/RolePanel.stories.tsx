import type { Meta, StoryObj } from '@storybook/react'
import RolePanel from './RolePanel'

const meta: Meta<typeof RolePanel> = {
    title: 'Components/Profile/Panel/RolePanel',
    component: RolePanel,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: 'A role card component that displays user roles with avatar backgrounds, descriptions, and action buttons. Used to showcase different role types in the platform.',
            },
        },
    },
    argTypes: {
        id: {
            control: 'text',
            description: 'Unique identifier for the role card',
        },
        title: {
            control: 'text',
            description: 'Role title displayed on the card',
        },
        description: {
            control: 'text',
            description: 'Role description text',
        },
        buttonText: {
            control: 'text',
            description: 'Text displayed on the action button',
        },
        buttonVariant: {
            control: 'select',
            options: ['primary', 'secondary'],
            description: 'Button style variant',
        },
        avatar: {
            control: 'text',
            description: 'Avatar image URL for the card background',
        },
        iconBgColor: {
            control: 'text',
            description: 'Background color class for the icon',
        },
        href: {
            control: 'text',
            description: 'Link URL for the action button',
        },
    },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// Mock data for different role types
const mockMaintainerRole = {
    id: 'maintainer',
    title: 'Maintainer',
    description: 'Lead and maintain open source projects',
    buttonText: 'Become Maintainer',
    buttonVariant: 'primary' as const,
    avatar: 'https://dummyimage.com/200x200/3B82F6/ffffff?text=M',
    iconBgColor: 'bg-blue-500',
    href: '/roles/maintainer',
}

const mockContributorRole = {
    id: 'contributor',
    title: 'Contributor',
    description: 'Contribute to existing projects',
    buttonText: 'Start Contributing',
    buttonVariant: 'secondary' as const,
    avatar: 'https://dummyimage.com/200x200/10B981/ffffff?text=C',
    iconBgColor: 'bg-green-500',
    href: '/roles/contributor',
}

const mockInfluencerRole = {
    id: 'influencer',
    title: 'Influencer',
    description: 'Influence the community and projects',
    buttonText: 'Become Influencer',
    buttonVariant: 'primary' as const,
    avatar: 'https://dummyimage.com/200x200/8B5CF6/ffffff?text=I',
    iconBgColor: 'bg-purple-500',
    href: '/roles/influencer',
}

// Default story
export const Default: Story = {
    args: mockMaintainerRole,
}

// Maintainer role
export const Maintainer: Story = {
    args: mockMaintainerRole,
    parameters: {
        docs: {
            description: {
                story: 'Shows a maintainer role card with blue styling and primary action button.',
            },
        },
    },
}

// Contributor role
export const Contributor: Story = {
    args: mockContributorRole,
    parameters: {
        docs: {
            description: {
                story: 'Shows a contributor role card with green styling and secondary action button.',
            },
        },
    },
}

// Influencer role
export const Influencer: Story = {
    args: mockInfluencerRole,
    parameters: {
        docs: {
            description: {
                story: 'Shows an influencer role card with purple styling and primary action button.',
            },
        },
    },
}

// Custom role
export const CustomRole: Story = {
    args: {
        id: 'custom',
        title: 'Custom Role',
        description: 'A custom role with specific requirements and responsibilities',
        buttonText: 'Apply Now',
        buttonVariant: 'primary' as const,
        avatar: 'https://dummyimage.com/200x200/F59E0B/ffffff?text=CR',
        iconBgColor: 'bg-yellow-500',
        href: '/roles/custom',
    },
    parameters: {
        docs: {
            description: {
                story: 'Shows a custom role card with unique styling and requirements.',
            },
        },
    },
}

// Interactive playground
export const Playground: Story = {
    args: mockMaintainerRole,
    parameters: {
        docs: {
            description: {
                story: 'Interactive playground to test different role card configurations.',
            },
        },
    },
}
