import type { Meta, StoryObj } from '@storybook/react'
import WorkStylePanel from './WorkStyleContent'

const meta: Meta<typeof WorkStylePanel> = {
    title: 'Components/Profile/Panel/WorkStyleContent',
    component: WorkStylePanel,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: 'A panel that displays work style preferences including availability status, communication style, work methodology, and collaboration preferences through interactive sliders.',
            },
        },
    },
    argTypes: {},
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// Default story with typical work style
export const Default: Story = {
    args: {},
}

// Fully available status
export const FullyAvailable: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'Shows work style when user is fully available for new projects and collaborations.',
            },
        },
    },
}

// Not available status
export const NotAvailable: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'Shows work style when user is not available for new projects.',
            },
        },
    },
}

// Extreme values on sliders
export const ExtremeValues: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'Shows work style with extreme values on communication and collaboration sliders.',
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
                story: 'Interactive playground to test different work style configurations and slider values.',
            },
        },
    },
}
