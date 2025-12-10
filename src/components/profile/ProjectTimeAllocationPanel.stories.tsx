import type { Meta, StoryObj } from '@storybook/react'
import ProjectTimeAllocationPanel from './ProjectTimeAllocationPanel'

const meta: Meta<typeof ProjectTimeAllocationPanel> = {
    title: 'Components/Profile/Panel/ProjectTimeAllocationPanel (Deprecated)',
    component: ProjectTimeAllocationPanel,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: 'A panel that displays project time allocation through pie charts and project distribution statistics. Shows percentage breakdowns and top projects.',
            },
        },
    },
    argTypes: {},
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// Default story with typical project distribution
export const Default: Story = {
    args: {},
}

// Two projects only
export const TwoProjects: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'Shows time allocation between just two projects with a simple distribution.',
            },
        },
    },
}

// Many projects with complex distribution
export const ManyProjects: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'Shows time allocation across many projects with detailed breakdown and statistics.',
            },
        },
    },
}

// Single project focus
export const SingleProject: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'Shows time allocation focused on a single project with 100% allocation.',
            },
        },
    },
}

// No projects
export const NoProjects: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'Shows the panel when no project time allocation data is available.',
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
                story: 'Interactive playground to test different project time allocation scenarios.',
            },
        },
    },
}
