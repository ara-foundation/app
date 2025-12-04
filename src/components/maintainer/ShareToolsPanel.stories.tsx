import type { Meta, StoryObj } from '@storybook/react'
import ShareTools from './ShareToolsPanel'
import InfoPanel from '@/components/panel/InfoPanel'
import PageLikePanel from '@/components/panel/PageLikePanel'
import { ActionProps } from '@/types/eventTypes'
import { IconType } from '@/components/icon'

// Helper function to map emoji icons to IconType values
const mapEmojiToIconType = (emoji: string): IconType => {
    const emojiMap: Record<string, IconType> = {
        '🎯': 'project',
        '📋': 'new-file',
        '📄': 'new-file',
        '👥': 'contributor',
        '💰': 'money'
    }
    return emojiMap[emoji] || 'info'
}

const meta: Meta<typeof ShareTools> = {
    title: 'Components/Maintainer/Share Tools Panel',
    component: ShareTools,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: 'A panel displaying various marketing and sharing tools for project maintainers. Includes tools for onboarding users, GitHub issue templates, README badges, contributor outreach, and donation links. Each tool card shows an icon, title, description, and optionally a link or button.',
            },
        },
    },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ShareTools>

// Default story showing the complete ShareTools panel
export const Default: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Default view of the Share Tools panel showing all available marketing tools including goal description, GitHub issue templates, README badges, contributor outreach, and donation links.',
            },
        },
    },
}

// Individual card stories
export const GoalCard: Story = {
    render: () => (
        <PageLikePanel title="Share Tools" className="w-80 bg-gray-50 p-4">
            <InfoPanel
                icon={mapEmojiToIconType('🎯')}
                title="Goal: Onboard Users & Contributors"
                className="mb-4"
            >
                This marketing tool is not only about when people know about it. The link to your page reviews, tell to people about your project, and configuration goes on Ara.
            </InfoPanel>
        </PageLikePanel>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Goal card showing the purpose and description of the marketing tools panel using InfoPanel.',
            },
        },
    },
}

export const CardWithButton: Story = {
    render: () => (
        <PageLikePanel title="Share Tools" className="w-80 bg-gray-50 p-4">
            <InfoPanel
                icon={mapEmojiToIconType('📋')}
                title="GitHub Issue for Users"
                className="mb-4"
                actions={[
                    {
                        children: '📋',
                        variant: 'default'
                    } as ActionProps
                ]}
            >
                The 'Issues and support moved to Ara' Description: Hey, my time is scarce, for providing the best support, I moved to Ara where I will help them. Sign up.
            </InfoPanel>
        </PageLikePanel>
    ),
    parameters: {
        docs: {
            description: {
                story: 'InfoPanel with a button action. Shows how InfoPanel renders with action buttons.',
            },
        },
    },
}

export const CardWithLink: Story = {
    render: () => (
        <PageLikePanel title="Share Tools" className="w-80 bg-gray-50 p-4">
            <InfoPanel
                icon={mapEmojiToIconType('📄')}
                title="Share Button for README"
                className="mb-4"
                actions={[
                    {
                        children: '📋',
                        variant: 'default'
                    } as ActionProps
                ]}
            >
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded mb-2 font-mono">
                    [Ara](https://badge.app.ara.foundation/project/)
                </div>
            </InfoPanel>
        </PageLikePanel>
    ),
    parameters: {
        docs: {
            description: {
                story: 'InfoPanel with a link displayed in a code-style box in the content area and a button action.',
            },
        },
    },
}

export const CardWithBothLinkAndButton: Story = {
    render: () => (
        <PageLikePanel title="Share Tools" className="w-80 bg-gray-50 p-4">
            <InfoPanel
                icon={mapEmojiToIconType('💰')}
                title="Donation Link"
                className="mb-4"
                actions={[
                    {
                        children: '📋',
                        uri: 'https://app.ara.foundation/donate/reflect',
                        variant: 'default'
                    } as ActionProps
                ]}
            >
                Support us and influence the project on Ara.
            </InfoPanel>
        </PageLikePanel>
    ),
    parameters: {
        docs: {
            description: {
                story: 'InfoPanel with both a link (via action uri) and button text. Demonstrates how InfoPanel can display multiple interactive elements.',
            },
        },
    },
}

export const MinimalCard: Story = {
    render: () => (
        <PageLikePanel title="Share Tools" className="w-80 bg-gray-50 p-4">
            <InfoPanel
                icon={mapEmojiToIconType('🎯')}
                title="Simple Tool"
                className="mb-4"
            >
                A minimal card with just icon, title, and description.
            </InfoPanel>
        </PageLikePanel>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Minimal InfoPanel with only icon, title, and description - no actions.',
            },
        },
    },
}

