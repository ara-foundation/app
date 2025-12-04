import type { Meta, StoryObj } from '@storybook/react'
import IssueContentPanel from './IssuePanel'
import { Issue } from './types'
import { ActionProps } from '@/types/eventTypes'
import React from 'react'

// Mock issue data
const mockIssue: Issue = {
    id: 1,
    uri: '/data/issue/1',
    number: '#123',
    title: 'OAuth Integration with Third-party Services',
    description: 'We need to implement OAuth 2.0 integration with major third-party services (Google, Facebook, Twitter, GitHub) to streamline the user authentication process. Current implementation requires separate authentication flows for each service, creating inconsistent user experiences.',
    type: 'feature',
    storage: 'github',
    projectId: 'project-1',
    categoryId: 'category-1',
    author: {
        uri: '/profile/johndoe',
        children: 'John Doe',
        icon: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        rating: {
            ratingType: 'contributor',
            lvl: 5,
            maxLvl: 10,
            top: 12
        }
    },
    createdTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    stats: {
        upvote: {
            type: 'upvote',
            hint: 'Number of upvotes',
            filled: true,
            children: '42'
        },
        downvote: {
            type: 'downvote',
            hint: 'Number of downvotes',
            filled: false,
            children: '3'
        },
        chat: {
            type: 'chat',
            hint: 'Number of comments',
            filled: true,
            children: '18'
        },
        follower: {
            type: 'follower',
            hint: 'Number of followers',
            filled: true,
            children: '127'
        }
    }
}

const mockCascadefundIssue: Issue = {
    ...mockIssue,
    storage: 'arada-',
    number: '#456',
    title: 'Database Migration Strategy',
    description: 'We need to migrate our database from PostgreSQL 12 to PostgreSQL 15 to take advantage of new features and improve performance. The migration must be planned carefully to avoid downtime.',
    stats: {
        ...mockIssue.stats,
        'voting-power': {
            type: 'voting-power',
            hint: 'Voting power allocated',
            filled: true,
            children: '150'
        },
        money: {
            type: 'money',
            hint: 'Total funding',
            filled: true,
            children: '$2,500'
        }
    },
    vpAmount: 1000,
    currentVP: 150,
    topVP: 500,
    minVP: 50
}

const mockActions: ActionProps[] = [
    {
        children: 'View Details',
        uri: '/data/issue/1',
        variant: 'default'
    },
    {
        children: 'Edit',
        onClick: () => console.log('Edit clicked'),
        variant: 'secondary'
    }
]

const meta: Meta<typeof IssueContentPanel> = {
    title: 'Components/Issue/Issue Panel',
    component: IssueContentPanel,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: 'A comprehensive issue content panel with two-column layout. Left column displays issue badge with storage icon/number and action buttons (Like, Dislike, Fund, or VotePopover for rating issues). Right column shows editable title, description, technical requirements, author info, stats, and actions. Supports both GitHub and Cascadefund issues with different interaction modes.',
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        editable: {
            control: 'boolean',
            description: 'Whether the issue content is editable (for issue owners)',
        },
    },
}

export default meta
type Story = StoryObj<typeof IssueContentPanel>

// Default story with GitHub issue
export const Default: Story = {
    args: {
        ...mockIssue,
        editable: false,
    },
    parameters: {
        docs: {
            description: {
                story: 'Default view of the Issue Content Panel showing a GitHub issue. Displays issue badge on left, action buttons (Like, Dislike, Fund), title, description, technical requirements, author info, and stats in the footer.',
            },
        },
    },
}

// Story with Cascadefund issue (non-rating)
export const CascadefundIssue: Story = {
    args: {
        ...mockCascadefundIssue,
        stats: {
            ...mockCascadefundIssue.stats,
            'voting-power': undefined
        },
        editable: false,
    },
    parameters: {
        docs: {
            description: {
                story: 'Cascadefund issue that is not a rating issue. Shows "Non-Rating Issue" badge and standard action buttons in the left column.',
            },
        },
    },
}

// Story with rating issue (has VotePopover)
export const RatingIssue: Story = {
    args: {
        ...mockCascadefundIssue,
        editable: false,
    },
    parameters: {
        docs: {
            description: {
                story: 'Cascadefund rating issue with voting power. Shows "Rating Issue" badge and VotePopover component instead of Like/Dislike buttons. Displays voting power stats.',
            },
        },
    },
}

// Story with editable mode
export const Editable: Story = {
    args: {
        ...mockIssue,
        editable: true,
        onSave: (updates: { title?: string; description?: string; technicalRequirements?: string }) => {
            console.log('Issue saved:', updates)
        },
    },
    parameters: {
        docs: {
            description: {
                story: 'Issue Content Panel in editable mode. Title, description, and technical requirements can be edited. Click on any editable field to activate the editor. The EditableMenuPanel toolbar appears at the top when editing. Changes trigger the onSave callback.',
            },
        },
    },
}

// Story with editable rating issue
export const EditableRatingIssue: Story = {
    args: {
        ...mockCascadefundIssue,
        editable: true,
        onSave: (updates: { title?: string; description?: string; technicalRequirements?: string }) => {
            console.log('Issue saved:', updates)
        },
    },
    parameters: {
        docs: {
            description: {
                story: 'Editable rating issue. Shows both editable content fields and VotePopover for voting power management. Demonstrates how issue owners can edit content while managing voting power.',
            },
        },
    },
}

// Story with bug type
export const BugIssue: Story = {
    args: {
        ...mockIssue,
        type: 'bug',
        title: 'Critical Memory Leak in Database Connection',
        description: 'There is a memory leak occurring when database connections are not properly closed. This needs to be fixed immediately to prevent server instability.',
        editable: false,
    },
    parameters: {
        docs: {
            description: {
                story: 'Bug type issue displayed with danger variant badge. Shows how different issue types are color-coded.',
            },
        },
    },
}

// Story with actions
export const WithActions: Story = {
    args: {
        ...mockIssue,
        actions: mockActions,
        editable: false,
    },
    parameters: {
        docs: {
            description: {
                story: 'Issue with custom actions displayed in the footer. Actions are shown alongside stats in the PanelFooter.',
            },
        },
    },
}

// Story with minimal data
export const Minimal: Story = {
    args: {
        id: 2,
        uri: '/data/issue/2',
        number: '#789',
        title: 'Simple Issue',
        description: 'This is a simple issue with minimal information.',
        type: 'improvement',
        storage: 'github',
        projectId: 'project-2',
        categoryId: 'category-2',
        editable: false,
    },
    parameters: {
        docs: {
            description: {
                story: 'Issue with minimal data - no author, stats, or actions. Shows the panel structure with just basic information.',
            },
        },
    },
}

