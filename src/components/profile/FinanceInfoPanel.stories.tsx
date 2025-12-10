import type { Meta, StoryObj } from '@storybook/react'
import FinanceInfoPanel from './FinanceInfoPanel'

const meta: Meta<typeof FinanceInfoPanel> = {
    title: 'Components/Profile/Panel/FinanceInfoPanel',
    component: FinanceInfoPanel,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: 'A financial status panel that displays balance information, cascading balance, total donated, and total received amounts. Shows financial engagement with the platform.',
            },
        },
    },
    argTypes: {
        balance: {
            control: 'number',
            description: 'Current user balance',
        },
        cascadingBalance: {
            control: 'number',
            description: 'Cascading balance amount',
        },
        totalDonated: {
            control: 'number',
            description: 'Total amount donated by the user',
        },
        totalReceived: {
            control: 'number',
            description: 'Total amount received by the user',
        },
    },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// Default story with typical financial data
export const Default: Story = {
    args: {
        balance: 1250,
        cascadingBalance: 3450,
        totalDonated: 4780,
        totalReceived: 3450,
    },
}

// High balance user
export const HighBalance: Story = {
    args: {
        balance: 15000,
        cascadingBalance: 25000,
        totalDonated: 35000,
        totalReceived: 28000,
    },
    parameters: {
        docs: {
            description: {
                story: 'Shows financial status for a user with high balance and significant donations.',
            },
        },
    },
}

// New user with minimal activity
export const NewUser: Story = {
    args: {
        balance: 50,
        cascadingBalance: 100,
        totalDonated: 25,
        totalReceived: 75,
    },
    parameters: {
        docs: {
            description: {
                story: 'Shows financial status for a new user with low balance and minimal donations.',
            },
        },
    },
}

// No activity
export const NoActivity: Story = {
    args: {
        balance: 0,
        cascadingBalance: 0,
        totalDonated: 0,
        totalReceived: 0,
    },
    parameters: {
        docs: {
            description: {
                story: 'Shows financial status for a user with no financial activity.',
            },
        },
    },
}

// Influencer with high donations
export const Influencer: Story = {
    args: {
        balance: 5000,
        cascadingBalance: 8000,
        totalDonated: 25000,
        totalReceived: 12000,
    },
    parameters: {
        docs: {
            description: {
                story: 'Shows financial status for an influencer with high donation amounts exceeding balance.',
            },
        },
    },
}

// Interactive playground
export const Playground: Story = {
    args: {
        balance: 2500,
        cascadingBalance: 4000,
        totalDonated: 6000,
        totalReceived: 3500,
    },
    parameters: {
        docs: {
            description: {
                story: 'Interactive playground to test different financial status scenarios.',
            },
        },
    },
}
