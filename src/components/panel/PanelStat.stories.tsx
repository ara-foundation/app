import type { Meta, StoryObj } from '@storybook/react'
import PanelStat from './PanelStat'
import { IconType } from '../icon'

const meta: Meta<typeof PanelStat> = {
    title: 'Components/Panel/Panel Stat',
    component: PanelStat,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'PanelStat is used to show stats in the footer with icon, text, and optional tooltip. It can be rendered as a link, button, or plain element.'
            }
        }
    },
    argTypes: {
        iconType: {
            control: 'select',
            options: [
                'github', 'analytics', 'money', 'email', 'info', 'likes', 'clock', 'heart',
                'vote-priority', 'energy', 'project', 'star', 'fork', 'settings', 'user',
                'chat', 'navigation', 'success', 'check', 'ara'
            ] as IconType[],
            description: 'The icon type to display'
        },
        iconClassName: {
            control: 'text',
            description: 'Additional CSS classes for the icon'
        },
        children: {
            control: 'text',
            description: 'The text content to display next to the icon'
        },
        fill: {
            control: 'boolean',
            description: 'Whether the icon should be filled'
        },
        hint: {
            control: 'text',
            description: 'Tooltip content that appears on hover'
        },
        href: {
            control: 'text',
            description: 'URL to link to (renders as Link component)'
        },
        asNewTab: {
            control: 'boolean',
            description: 'Whether to open link in new tab'
        },
        onClick: {
            action: 'clicked',
            description: 'Click handler (renders as Button component)'
        }
    },
    tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

// Basic stat with icon and text
export const Default: Story = {
    args: {
        iconType: 'heart',
        children: '1.2K',
        hint: 'Total followers',
        fill: false,
        onClick: undefined
    }
}

// Filled icon variant
export const Filled: Story = {
    args: {
        iconType: 'heart',
        children: '1.2K',
        hint: 'Total followers',
        fill: true,
        onClick: undefined
    }
}

// As a link
export const AsLink: Story = {
    args: {
        iconType: 'github',
        children: 'View Profile',
        hint: 'Click to view GitHub profile',
        href: 'https://github.com/username',
        asNewTab: true,
        onClick: undefined
    }
}

// As a button with click handler
export const AsButton: Story = {
    args: {
        iconType: 'settings',
        children: 'Settings',
        hint: 'Click to open settings',
        onClick: () => console.log('Settings clicked')
    }
}

// Money stat
export const MoneyStat: Story = {
    args: {
        iconType: 'money',
        children: '$2,500',
        hint: 'Total funding received',
        fill: true,
        onClick: undefined
    }
}

// Analytics stat
export const AnalyticsStat: Story = {
    args: {
        iconType: 'analytics',
        children: '15.3K',
        hint: 'Total views this month',
        fill: false,
        onClick: undefined
    }
}

// Project stat
export const ProjectStat: Story = {
    args: {
        iconType: 'project',
        children: '8',
        hint: 'Active projects',
        fill: true,
        onClick: undefined
    }
}

// Star rating stat
export const StarStat: Story = {
    args: {
        iconType: 'star',
        children: '4.8',
        hint: 'Average rating',
        fill: true,
        onClick: undefined
    }
}

// Chat stat
export const ChatStat: Story = {
    args: {
        iconType: 'chat',
        children: '42',
        hint: 'Comments received',
        fill: false,
        onClick: undefined
    }
}

// Energy stat
export const EnergyStat: Story = {
    args: {
        iconType: 'energy',
        children: '95%',
        hint: 'Activity level',
        fill: true,
        onClick: undefined
    }
}

// Custom icon styling
export const CustomIconStyling: Story = {
    args: {
        iconType: 'heart',
        children: '1.2K',
        hint: 'Total followers',
        fill: true,
        iconClassName: 'text-red-500',
        onClick: undefined
    }
}

// Multiple stats in a row
export const MultipleStats: Story = {
    render: () => (
        <div className="flex space-x-4">
            <PanelStat
                iconType="heart"
                children="1.2K"
                hint="Total followers"
                fill={true}
                onClick={undefined}
            />
            <PanelStat
                iconType="money"
                children="$2,500"
                hint="Total funding"
                fill={true}
                onClick={undefined}
            />
            <PanelStat
                iconType="project"
                children="8"
                hint="Active projects"
                fill={true}
                onClick={undefined}
            />
            <PanelStat
                iconType="star"
                children="4.8"
                hint="Average rating"
                fill={true}
                onClick={undefined}
            />
        </div>
    )
}

// Interactive example with different states
export const Interactive: Story = {
    args: {
        iconType: 'settings',
        children: 'Configure',
        hint: 'Click to configure settings',
        onClick: () => alert('Settings clicked!')
    }
}

// With long text content
export const LongText: Story = {
    args: {
        iconType: 'info',
        children: 'Very long description text that might wrap',
        hint: 'This is a longer tooltip description that explains what this stat represents in more detail',
        fill: false,
        onClick: undefined
    }
}

// Minimal stat without tooltip
export const Minimal: Story = {
    args: {
        iconType: 'check',
        children: '✓',
        hint: '',
        fill: true,
        onClick: undefined
    }
}
