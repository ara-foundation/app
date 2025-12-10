import type { Meta, StoryObj } from '@storybook/react'
import DiscoveryPanel from './DiscoveryPanel'

const meta: Meta<typeof DiscoveryPanel> = {
    title: 'Components/Profile/Panel/DiscoveryPanel (Deprecated)',
    component: DiscoveryPanel,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: 'A tabbed panel component for discovering other users through top supporters and similar profiles. Features two tabs: Top Supporters and Similar Profiles.',
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

// Top Supporters tab active
export const TopSupportersActive: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'Shows the Top Supporters tab as the active tab, displaying users who have supported this profile.',
            },
        },
    },
}

// Similar Profiles tab active
export const SimilarProfilesActive: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'Shows the Similar Profiles tab as the active tab, displaying users with similar characteristics or interests.',
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
                story: 'Interactive playground to test the discovery interface with different user recommendations.',
            },
        },
    },
}
