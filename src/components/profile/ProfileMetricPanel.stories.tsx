import type { Meta, StoryObj } from '@storybook/react'
import ProfileMetricPanel from './ProfileMetricPanel'

const meta: Meta<typeof ProfileMetricPanel> = {
    title: 'Components/Profile/Panel/ProfileMetricPanel',
    component: ProfileMetricPanel,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: 'A tabbed panel component that displays work style and project time allocation metrics. Features two tabs: Availability & Work Style, and Project Time Allocation.',
            },
        },
    },
    argTypes: {},
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// Default story - shows the component with default tab active
export const Default: Story = {
    args: {},
}

// WorkStyle tab active story
export const WorkStyleActive: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'Shows the WorkStyle tab as the active tab, displaying availability status and work methodology sliders.',
            },
        },
    },
}

// ProjectTimeAllocation tab active story
export const ProjectTimeAllocationActive: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'Shows the Project Time Allocation tab as the active tab, displaying project distribution charts and statistics.',
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
                story: 'Interactive playground to test the tabbed interface. Click between tabs to see different content.',
            },
        },
    },
}
