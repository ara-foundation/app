import type { Meta, StoryObj } from '@storybook/react'
import RecentActivityPanel from './RecentActivityPanel'

const meta: Meta<typeof RecentActivityPanel> = {
    title: 'Components/Profile/Panel/RecentActivityPanel (Deprecated)',
    component: RecentActivityPanel,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: 'A panel that displays recent user activity including completed tasks and highlighted interactions with other users.',
            },
        },
    },
    argTypes: {},
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// Default story with typical activity
export const Default: Story = {
    args: {},
}

// No activity state
export const NoActivity: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'Shows the panel when there is no recent activity to display.',
            },
        },
    },
}

// Multiple activities
export const MultipleActivities: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'Shows the panel with multiple recent activities and interactions.',
            },
        },
    },
}

// Long content with extensive activity
export const LongContent: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'Shows the panel with extensive activity history and multiple highlighted interactions.',
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
                story: 'Interactive playground to test the recent activity display with various activity types.',
            },
        },
    },
}
