import type { Meta, StoryObj } from '@storybook/react'
import NetworkingPanel from './NetworkingPanel'

const meta: Meta<typeof NetworkingPanel> = {
    title: 'Components/Profile/Panel/NetworkingPanel (Deprecated)',
    component: NetworkingPanel,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: 'A networking panel that displays a list of users with their avatars, names, ratings, and earnings. Used for showing top supporters or similar profiles.',
            },
        },
    },
    argTypes: {},
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// Default story with typical networking data
export const Default: Story = {
    args: {},
}

// Empty state
export const Empty: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'Shows the networking panel when there are no users to display.',
            },
        },
    },
}

// Single user
export const SingleUser: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'Shows the networking panel with a single user entry.',
            },
        },
    },
}

// Many users
export const ManyUsers: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'Shows the networking panel with multiple users and their earnings.',
            },
        },
    },
}

// Interactive playground
export const Playground: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'Interactive playground to test the networking panel with different user configurations.',
            },
        },
    },
}
