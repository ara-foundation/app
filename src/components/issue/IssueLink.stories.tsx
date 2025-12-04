import type { Meta, StoryObj } from '@storybook/react'
import IssueLink from './IssueLink'
import { Issue, IssueType, IssueStorage, IssueStatType, IssueStat } from './types'
import Button from '../custom-ui/Button'
import VotePopover from './VotePopover'
import { ActionProps } from '@/types/eventTypes'

const meta: Meta<typeof IssueLink> = {
    title: 'Components/Issue/Issue Link',
    component: IssueLink,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: 'IssueLink displays an issue with its metadata, stats, and type badge. It shows the issue number, title, description, and optional statistics in a footer.'
            }
        }
    },
    argTypes: {
        uri: {
            control: 'text',
            description: 'The URI/link to the issue'
        },
        number: {
            control: 'text',
            description: 'The issue number'
        },
        title: {
            control: 'text',
            description: 'The issue title'
        },
        description: {
            control: 'text',
            description: 'The issue description'
        },
        type: {
            control: 'select',
            options: ['improvement', 'feature', 'bug', 'enhancement', 'custom'] as IssueType[],
            description: 'The type of issue'
        },
        storage: {
            control: 'select',
            options: ['github', 'arada-'] as IssueStorage[],
            description: 'The storage platform for the issue'
        },
        authorId: {
            control: 'text',
            description: 'The author ID'
        },
        projectId: {
            control: 'text',
            description: 'The project ID'
        },
        categoryId: {
            control: 'text',
            description: 'The category ID'
        },
        author: {
            control: 'object',
            description: 'The author information including name, avatar, and URI'
        },
        createdTime: {
            control: 'text',
            description: 'The creation time of the issue (ISO string)'
        },
        actions: {
            control: 'object',
            description: 'Action buttons to display on the left side of stats'
        }
    },
    tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

// Basic issue without stats
export const Default: Story = {
    args: {
        uri: 'https://github.com/user/repo/issues/123',
        number: '#123',
        title: 'Add dark mode support',
        description: 'Implement dark mode toggle for better user experience',
        type: 'feature',
        storage: 'github',
        projectId: 'proj456',
        categoryId: 'cat789'
    }
}

// Bug issue
export const BugIssue: Story = {
    args: {
        uri: 'https://github.com/user/repo/issues/456',
        number: '#456',
        title: 'Login button not working on mobile',
        description: 'Users cannot log in when using mobile devices due to button click not registering',
        type: 'bug',
        storage: 'github',
        projectId: 'proj456',
        categoryId: 'cat789'
    }
}

// Improvement issue
export const ImprovementIssue: Story = {
    args: {
        uri: 'https://github.com/user/repo/issues/789',
        number: '#789',
        title: 'Optimize database queries',
        description: 'Improve performance by optimizing slow database queries in the user dashboard',
        type: 'improvement',
        storage: 'github',
        projectId: 'proj456',
        categoryId: 'cat789'
    }
}

// Enhancement issue
export const EnhancementIssue: Story = {
    args: {
        uri: 'https://github.com/user/repo/issues/101',
        number: '#101',
        title: 'Add keyboard shortcuts',
        description: 'Implement keyboard shortcuts for common actions to improve productivity',
        type: 'enhancement',
        storage: 'github',
        projectId: 'proj456',
        categoryId: 'cat789'
    }
}

// Custom issue
export const CustomIssue: Story = {
    args: {
        uri: 'https://github.com/user/repo/issues/202',
        number: '#202',
        title: 'Research new technology stack',
        description: 'Investigate and evaluate new technologies for future implementation',
        type: 'custom',
        storage: 'github',
        projectId: 'proj456',
        categoryId: 'cat789'
    }
}

// Issue with stats
export const WithStats: Story = {
    args: {
        uri: 'https://github.com/user/repo/issues/303',
        number: '#303',
        title: 'Implement user authentication',
        description: 'Add secure user authentication with JWT tokens and password hashing',
        type: 'feature',
        storage: 'github',
        projectId: 'proj456',
        categoryId: 'cat789',
        stats: {
            upvote: {
                type: 'upvote',
                hint: 'Upvotes received',
                filled: true,
                children: '24'
            },
            chat: {
                type: 'chat',
                hint: 'Comments',
                filled: false,
                children: '8'
            },
            money: {
                type: 'money',
                hint: 'Funding received',
                filled: true,
                children: '$1,250'
            },
            follower: {
                type: 'follower',
                hint: 'Followers interested',
                filled: true,
                children: '12'
            }
        }
    }
}

// Cascadefund issue
export const AraIssue: Story = {
    args: {
        uri: '/arada-/issues/404',
        number: '#404',
        title: 'Create funding proposal system',
        description: 'Build a comprehensive system for creating and managing funding proposals',
        type: 'feature',
        storage: 'arada-',
        projectId: 'proj456',
        categoryId: 'cat789',
        stats: {
            votingPower: {
                type: 'voting-power',
                hint: 'Voting power',
                filled: true,
                children: '85%'
            },
            money: {
                type: 'money',
                hint: 'Budget allocated',
                filled: true,
                children: '$5,000'
            },
            persona: {
                type: 'persona',
                hint: 'Team members',
                filled: false,
                children: '3'
            }
        }
    }
}

// Issue with all stat types
export const AllStats: Story = {
    args: {
        uri: 'https://github.com/user/repo/issues/505',
        number: '#505',
        title: 'Comprehensive feature implementation',
        description: 'A major feature that includes multiple components and requires extensive testing',
        type: 'feature',
        storage: 'github',
        projectId: 'proj456',
        categoryId: 'cat789',
        stats: {
            upvote: {
                type: 'upvote',
                hint: 'Upvotes received',
                filled: true,
                children: '156'
            },
            downvote: {
                type: 'downvote',
                hint: 'Downvotes received',
                filled: false,
                children: '3'
            },
            chat: {
                type: 'chat',
                hint: 'Comments',
                filled: false,
                children: '42'
            },
            votingPower: {
                type: 'voting-power',
                hint: 'Voting power',
                filled: true,
                children: '92%'
            },
            follower: {
                type: 'follower',
                hint: 'Followers interested',
                filled: true,
                children: '89'
            },
            money: {
                type: 'money',
                hint: 'Funding received',
                filled: true,
                children: '$8,750'
            },
            persona: {
                type: 'persona',
                hint: 'Team members',
                filled: false,
                children: '5'
            }
        }
    }
}

// Long title and description
export const LongContent: Story = {
    args: {
        uri: 'https://github.com/user/repo/issues/606',
        number: '#606',
        title: 'Implement comprehensive user management system with role-based access control and audit logging',
        description: 'This is a very long description that explains the detailed requirements for implementing a comprehensive user management system that includes role-based access control, audit logging, user profile management, and integration with external authentication providers.',
        type: 'feature',
        storage: 'github',
        projectId: 'proj456',
        categoryId: 'cat789',
        stats: {
            upvote: {
                type: 'upvote',
                hint: 'Upvotes received',
                filled: true,
                children: '1.2K'
            },
            chat: {
                type: 'chat',
                hint: 'Comments',
                filled: false,
                children: '156'
            }
        }
    }
}

// High priority bug
export const HighPriorityBug: Story = {
    args: {
        uri: 'https://github.com/user/repo/issues/707',
        number: '#707',
        title: 'Critical security vulnerability in authentication',
        description: 'URGENT: Fix security vulnerability that allows unauthorized access to user accounts',
        type: 'bug',
        storage: 'github',
        projectId: 'proj456',
        categoryId: 'cat789',
        stats: {
            upvote: {
                type: 'upvote',
                hint: 'Upvotes received',
                filled: true,
                children: '89'
            },
            chat: {
                type: 'chat',
                hint: 'Comments',
                filled: false,
                children: '23'
            },
            money: {
                type: 'money',
                hint: 'Bounty offered',
                filled: true,
                children: '$2,500'
            }
        }
    }
}

// With author avatar
export const WithAuthorAvatar: Story = {
    args: {
        uri: 'https://github.com/user/repo/issues/201',
        number: '#201',
        title: 'Feature with author avatar',
        description: 'This issue demonstrates how the component displays when an author has an avatar',
        type: 'feature',
        storage: 'github',
        author: {
            uri: 'https://github.com/johndoe',
            name: 'John Doe',
            avatar: 'https://github.com/johndoe.png'
        },
        projectId: 'proj456',
        categoryId: 'cat789'
    }
}

// Author without avatar
export const AuthorWithoutAvatar: Story = {
    args: {
        uri: 'https://github.com/user/repo/issues/202',
        number: '#202',
        title: 'Feature without author avatar',
        description: 'This issue shows how the component handles missing avatar gracefully',
        type: 'feature',
        storage: 'github',
        author: {
            uri: 'https://github.com/janesmith',
            name: 'Jane Smith'
        },
        projectId: 'proj456',
        categoryId: 'cat789'
    }
}

// With created time
export const WithCreatedTime: Story = {
    args: {
        uri: 'https://github.com/user/repo/issues/203',
        number: '#203',
        title: 'Feature with creation time',
        description: 'This issue shows how the component displays creation time',
        type: 'feature',
        storage: 'github',
        createdTime: '2024-01-15T10:30:00Z',
        projectId: 'proj456',
        categoryId: 'cat789'
    }
}

// With author and created time
export const WithAuthorAndTime: Story = {
    args: {
        uri: 'https://github.com/user/repo/issues/204',
        number: '#204',
        title: 'Feature with author and creation time',
        description: 'This issue demonstrates both author avatar and creation time together',
        type: 'feature',
        storage: 'github',
        author: {
            uri: 'https://github.com/alexchen',
            name: 'Alex Chen',
            avatar: 'https://github.com/alexchen.png'
        },
        createdTime: '2024-01-20T14:45:00Z',
        projectId: 'proj456',
        categoryId: 'cat789',
        stats: {
            upvote: {
                type: 'upvote',
                hint: 'Upvotes received',
                filled: true,
                children: '42'
            },
            chat: {
                type: 'chat',
                hint: 'Comments',
                filled: false,
                children: '15'
            }
        }
    }
}

// Author showcase - different author scenarios
export const AuthorShowcase: Story = {
    render: () => (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold mb-2">With Author Avatar</h3>
                <IssueLink
                    uri="https://github.com/user/repo/issues/101"
                    number="#101"
                    title="Feature with author avatar"
                    description="This issue shows how the author avatar appears in the component"
                    type="feature"
                    storage="github"
                    author={{
                        uri: 'https://github.com/johndoe',
                        name: 'John Doe',
                        avatar: 'https://github.com/johndoe.png'
                    }}
                    projectId="proj456"
                    categoryId="cat789"
                />
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">Author Without Avatar</h3>
                <IssueLink
                    uri="https://github.com/user/repo/issues/102"
                    number="#102"
                    title="Feature without author avatar"
                    description="This issue shows how the component handles missing avatar"
                    type="feature"
                    storage="github"
                    author={{
                        uri: 'https://github.com/janesmith',
                        name: 'Jane Smith'
                    }}
                    projectId="proj456"
                    categoryId="cat789"
                />
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">No Author</h3>
                <IssueLink
                    uri="https://github.com/user/repo/issues/103"
                    number="#103"
                    title="Feature without author"
                    description="This issue shows how the component looks when no author is provided"
                    type="feature"
                    storage="github"
                    projectId="proj456"
                    categoryId="cat789"
                />
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">Cascadefund Author</h3>
                <IssueLink
                    uri="/arada-/issues/104"
                    number="#104"
                    title="Cascadefund issue with author"
                    description="This shows a Cascadefund issue with author information"
                    type="improvement"
                    storage="arada-"
                    author={{
                        uri: 'https://github.com/cascadefunduser',
                        name: 'Cascade User',
                        avatar: 'https://github.com/cascadefunduser.png'
                    }}
                    projectId="proj456"
                    categoryId="cat789"
                    stats={{
                        'voting-power': {
                            type: 'voting-power',
                            hint: 'Voting power',
                            filled: true,
                            children: '95%'
                        },
                        money: {
                            type: 'money',
                            hint: 'Budget allocated',
                            filled: true,
                            children: '$10,000'
                        }
                    }}
                />
            </div>
        </div>
    )
}

// Issue with actions only
export const WithActions: Story = {
    args: {
        uri: 'https://github.com/user/repo/issues/801',
        number: '#801',
        title: 'Feature with action buttons',
        description: 'This issue demonstrates action buttons on the left side',
        type: 'feature',
        storage: 'github',
        projectId: 'proj456',
        categoryId: 'cat789',
        actions: [
            {
                variant: 'success',
                children: 'Like',
                onClick: () => console.log('Liked')
            },
            {
                variant: 'danger',
                children: 'Dislike',
                onClick: () => console.log('Disliked')
            },
            {
                variant: 'primary',
                children: 'Turn to Rating Issue',
                onClick: () => console.log('Turn to Rating')
            }
        ] as ActionProps[]
    }
}

// Issue with actions and stats
export const WithActionsAndStats: Story = {
    args: {
        uri: 'https://github.com/user/repo/issues/802',
        number: '#802',
        title: 'Feature with both actions and stats',
        description: 'This issue shows how actions and stats work together',
        type: 'feature',
        storage: 'github',
        projectId: 'proj456',
        categoryId: 'cat789',
        actions: [
            {
                variant: 'success',
                children: 'Like',
                onClick: () => console.log('Liked')
            },
            {
                variant: 'danger',
                children: 'Dislike',
                onClick: () => console.log('Disliked')
            },
            {
                variant: 'primary',
                children: 'Turn to Rating Issue',
                onClick: () => console.log('Turn to Rating')
            }
        ] as ActionProps[],
        stats: {
            upvote: {
                type: 'upvote',
                hint: 'Upvotes received',
                filled: true,
                children: '42'
            },
            chat: {
                type: 'chat',
                hint: 'Comments',
                filled: false,
                children: '15'
            },
            money: {
                type: 'money',
                hint: 'Funding received',
                filled: true,
                children: '$2,100'
            }
        }
    }
}

// Bug issue with actions
export const BugWithActions: Story = {
    args: {
        uri: 'https://github.com/user/repo/issues/803',
        number: '#803',
        title: 'Critical bug with action buttons',
        description: 'A critical bug that needs immediate attention with action options',
        type: 'bug',
        storage: 'github',
        projectId: 'proj456',
        categoryId: 'cat789',
        actions: [
            {
                variant: 'success',
                children: 'Confirm Bug',
                onClick: () => console.log('Confirmed')
            },
            {
                variant: 'danger',
                children: 'Reject',
                onClick: () => console.log('Rejected')
            },
            {
                variant: 'primary',
                children: 'Assign to me',
                onClick: () => console.log('Assign to me')
            }
        ] as ActionProps[],
        stats: {
            upvote: {
                type: 'upvote',
                hint: 'Upvotes received',
                filled: true,
                children: '89'
            },
            chat: {
                type: 'chat',
                hint: 'Comments',
                filled: false,
                children: '23'
            }
        }
    }
}

// Multiple issues in a list
export const MultipleIssues: Story = {
    render: () => (
        <div className="space-y-4">
            <IssueLink
                uri="https://github.com/user/repo/issues/101"
                number="#101"
                title="Add dark mode support"
                description="Implement dark mode toggle for better user experience"
                type="feature"
                storage="github"
                author={{
                    uri: 'https://github.com/user123',
                    name: 'John Doe',
                    avatar: 'https://github.com/user123.png'
                }}
                projectId="proj456"
                categoryId="cat789"
                stats={{
                    upvote: {
                        type: 'upvote',
                        hint: 'Upvotes received',
                        filled: true,
                        children: '24'
                    } as IssueStat,
                    chat: {
                        type: 'chat',
                        hint: 'Comments',
                        filled: false,
                        children: '8'
                    } as IssueStat,
                }}
            />
            <IssueLink
                uri="https://github.com/user/repo/issues/102"
                number="#102"
                title="Fix login button on mobile"
                description="Users cannot log in when using mobile devices"
                type="bug"
                storage="github"
                author={{
                    uri: 'https://github.com/user123',
                    name: 'John Doe',
                    avatar: 'https://github.com/user123.png'
                }}
                projectId="proj456"
                categoryId="cat789"
                stats={{
                    upvote: {
                        type: 'upvote',
                        hint: 'Upvotes received',
                        filled: true,
                        children: '12'
                    },
                    money: {
                        type: 'money',
                        hint: 'Bounty offered',
                        filled: true,
                        children: '$500'
                    }
                }}
            />
            <IssueLink
                uri="/arada-/issues/103"
                number="#103"
                title="Optimize database performance"
                description="Improve query performance for better user experience"
                type="improvement"
                storage="arada-"
                author={{
                    uri: 'https://github.com/user123',
                    name: 'John Doe',
                    avatar: 'https://github.com/user123.png'
                }}
                projectId="proj456"
                categoryId="cat789"
                stats={{
                    'voting-power': {
                        type: 'voting-power',
                        hint: 'Voting power',
                        filled: true,
                        children: '78%'
                    },
                    follower: {
                        type: 'follower',
                        hint: 'Followers interested',
                        filled: true,
                        children: '45'
                    }
                }}
            />
        </div>
    )
}

// Actions showcase - different action scenarios
export const ActionsShowcase: Story = {
    render: () => (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold mb-2">Basic Actions (Like, Dislike, Turn to Rating)</h3>
                <IssueLink
                    uri="https://github.com/user/repo/issues/901"
                    number="#901"
                    title="Feature with basic actions"
                    description="This issue shows the basic action buttons: Like, Dislike, and Turn to Rating Issue"
                    type="feature"
                    storage="github"
                    projectId="proj456"
                    categoryId="cat789"
                    actions={[
                        {
                            variant: 'success',
                            children: 'Like',
                            onClick: () => console.log('Liked')
                        },
                        {
                            variant: 'danger',
                            children: 'Dislike',
                            onClick: () => console.log('Disliked')
                        },
                        {
                            variant: 'primary',
                            children: 'Turn to Rating Issue',
                            onClick: () => console.log('Turn to Rating')
                        }
                    ] as ActionProps[]}
                />
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">Actions with Stats</h3>
                <IssueLink
                    uri="https://github.com/user/repo/issues/902"
                    number="#902"
                    title="Feature with actions and stats"
                    description="This issue demonstrates how actions and stats work together on the same line"
                    type="feature"
                    storage="github"
                    projectId="proj456"
                    categoryId="cat789"
                    actions={[
                        {
                            variant: 'success',
                            children: 'Like',
                            onClick: () => console.log('Liked')
                        },
                        {
                            variant: 'danger',
                            children: 'Dislike',
                            onClick: () => console.log('Disliked')
                        },
                        {
                            variant: 'primary',
                            children: 'Turn to Rating Issue',
                            onClick: () => console.log('Turn to Rating')
                        }
                    ] as ActionProps[]}
                    stats={{
                        upvote: {
                            type: 'upvote',
                            hint: 'Upvotes received',
                            filled: true,
                            children: '67'
                        },
                        chat: {
                            type: 'chat',
                            hint: 'Comments',
                            filled: false,
                            children: '12'
                        },
                        money: {
                            type: 'money',
                            hint: 'Funding received',
                            filled: true,
                            children: '$3,200'
                        }
                    }}
                />
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">Bug Issue Actions</h3>
                <IssueLink
                    uri="https://github.com/user/repo/issues/903"
                    number="#903"
                    title="Critical bug with specialized actions"
                    description="This bug issue shows context-specific action buttons"
                    type="bug"
                    storage="github"
                    projectId="proj456"
                    categoryId="cat789"
                    actions={[
                        {
                            variant: 'success',
                            children: 'Confirm Bug',
                            onClick: () => console.log('Confirmed')
                        },
                        {
                            variant: 'danger',
                            children: 'Reject',
                            onClick: () => console.log('Rejected')
                        },
                        {
                            variant: 'primary',
                            children: 'Assign to me',
                            onClick: () => console.log('Assign to me')
                        }
                    ] as ActionProps[]}
                    stats={{
                        upvote: {
                            type: 'upvote',
                            hint: 'Upvotes received',
                            filled: true,
                            children: '34'
                        },
                        chat: {
                            type: 'chat',
                            hint: 'Comments',
                            filled: false,
                            children: '8'
                        }
                    }}
                />
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">Cascadefund Issue with Actions</h3>
                <IssueLink
                    uri="/arada-/issues/904"
                    number="#904"
                    title="Cascadefund issue with actions"
                    description="This shows a Cascadefund issue with action buttons"
                    type="improvement"
                    storage="arada-"
                    projectId="proj456"
                    categoryId="cat789"
                    actions={[
                        {
                            variant: 'success',
                            children: 'Vote Yes',
                            onClick: () => console.log('Vote Yes')
                        },
                        {
                            variant: 'danger',
                            children: 'Vote No',
                            onClick: () => console.log('Vote No')
                        },
                        {
                            variant: 'primary',
                            children: 'Propose Solution',
                            onClick: () => console.log('Propose Solution')
                        }
                    ] as ActionProps[]}
                    stats={{
                        'voting-power': {
                            type: 'voting-power',
                            hint: 'Voting power',
                            filled: true,
                            children: '92%'
                        },
                        money: {
                            type: 'money',
                            hint: 'Budget allocated',
                            filled: true,
                            children: '$15,000'
                        },
                        follower: {
                            type: 'follower',
                            hint: 'Followers interested',
                            filled: true,
                            children: '156'
                        }
                    }}
                />
            </div>
        </div>
    )
}

