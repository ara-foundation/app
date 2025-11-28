import type { Meta, StoryObj } from '@storybook/react'
import DonationsPanel from './DonationsPanel'

const meta: Meta<typeof DonationsPanel> = {
    title: 'Components/Maintainer/DonationsPanel',
    component: DonationsPanel,
    tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof DonationsPanel>

export const Default: Story = {}

