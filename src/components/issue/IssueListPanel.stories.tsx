import type { Meta, StoryObj } from '@storybook/react'
import IssueListPanel from './IssueListPanel'
import { Issue, IssueType, IssueStorage, IssueStatType } from './types'
import { RatingType } from '../rating/ProfileRating'
import React from 'react'
import FilterableList from '@/components/list/FilterableList'
import IssueLink from '@/components/issue/IssueLink'
import BasePanel from '@/components/panel/Panel'

const meta: Meta<typeof IssueListPanel> = {
    title: 'Components/Issue/Issue List Panel',
    component: IssueListPanel,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: 'IssueListPanel displays a list of issues using FilterableList component with IssueLink. It includes search capabilities and displays issue details with author ratings, follower counts, and message counts.'
            }
        }
    },
    argTypes: {
        // Since the component doesn't accept props, we'll document the internal structure
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'The default view of the Issue List Panel showing two sample issues with different types (Bug and Wish) using the new FilterableList and IssueLink components with ProfileRating display.'
            }
        }
    }
}


export const EmptyState: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'This story shows how the component would appear when there are no issues to display using FilterableList.'
            }
        }
    },
    decorators: [
        (_Story: any) => {
            const EmptyIssueListPanel2 = () => {
                return (
                    <BasePanel className="max-w-6xl mx-auto">
                        <FilterableList
                            items={[]}
                            itemComponent={IssueLink}
                            title={<h2 className="text-xl font-semibold">Issues</h2>}
                            searchPlaceholder="Search issues..."
                            searchableFields={['title', 'description']}
                        />
                    </BasePanel>
                )
            }
            return <EmptyIssueListPanel2 />
        }
    ]
}

export const WithMultipleAuthors: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'This story demonstrates issues with multiple authors using AvatarList component. Shows both single author and multiple author scenarios.'
            }
        }
    },
    decorators: [
        (_Story: any) => {
            const MockIssueListPanel2 = () => {

                const issues = [
                    {
                        id: 1,
                        uri: '/issues/1',
                        number: '#1234',
                        title: "Fix responsive layout on tablet devices",
                        description: "The dashboard layout breaks on iPad and other tablet devices in landscape orientation. Elements overlap and some controls become inaccessible.",
                        type: 'bug' as IssueType,
                        storage: 'arada-' as IssueStorage,
                        author: {
                            uri: '/profile/serkan',
                            name: 'Serkan Bulgurcu',
                            avatar: 'https://dummyimage.com/32x32/4FC3F7/ffffff?text=S',
                            rating: { ratingType: 'maintainer' as RatingType, lvl: 3, maxLvl: 5, top: 10 }
                        },
                        projectId: 'project-1',
                        categoryId: 'category-1',
                        createdTime: '2023-10-05T00:00:00Z',
                        stats: {
                            'follower': { type: 'follower' as IssueStatType, hint: 'Followers', children: 5 },
                            'chat': { type: 'chat' as IssueStatType, hint: 'Messages', children: 5 }
                        }
                    },
                    {
                        id: 2,
                        uri: '/issues/2',
                        number: '#1235',
                        title: "Data export feature crashes with large datasets",
                        description: "When attempting to export data sets larger than 10,000 records, the application crashes. We need to implement pagination or streaming.",
                        type: 'wish' as IssueType,
                        storage: 'arada-' as IssueStorage,
                        author: [
                            {
                                uri: '/profile/alex',
                                name: 'Alex Johnson',
                                avatar: 'https://dummyimage.com/32x32/FF6B6B/ffffff?text=A',
                                rating: { ratingType: 'contributor' as RatingType, lvl: 5, maxLvl: 5, top: 3 }
                            },
                            {
                                uri: '/profile/maria',
                                name: 'Maria Garcia',
                                avatar: 'https://dummyimage.com/32x32/4ECDC4/ffffff?text=M',
                                rating: { ratingType: 'maintainer' as RatingType, lvl: 2, maxLvl: 5, top: 25 }
                            },
                            {
                                uri: '/profile/david',
                                name: 'David Chen',
                                avatar: 'https://dummyimage.com/32x32/45B7D1/ffffff?text=D',
                                rating: { ratingType: 'influencer' as RatingType, lvl: 4, maxLvl: 5, top: 8 }
                            }
                        ],
                        projectId: 'project-1',
                        categoryId: 'category-1',
                        createdTime: '2023-10-05T00:00:00Z',
                        stats: {
                            'follower': { type: 'follower' as IssueStatType, hint: 'Followers', children: 12 },
                            'chat': { type: 'chat' as IssueStatType, hint: 'Messages', children: 8 }
                        }
                    },
                    {
                        id: 3,
                        uri: '/issues/3',
                        number: '#1236',
                        title: "Implement dark mode theme",
                        description: "Users have requested a dark mode option for better accessibility and reduced eye strain during night usage.",
                        type: 'feature' as IssueType,
                        storage: 'arada-' as IssueStorage,
                        author: [
                            {
                                uri: '/profile/sarah',
                                name: 'Sarah Wilson',
                                avatar: 'https://dummyimage.com/32x32/9B59B6/ffffff?text=S',
                                rating: { ratingType: 'contributor' as RatingType, lvl: 3, maxLvl: 5, top: 15 }
                            },
                            {
                                uri: '/profile/john',
                                name: 'John Smith',
                                avatar: 'https://dummyimage.com/32x32/3498DB/ffffff?text=J',
                                rating: { ratingType: 'maintainer' as RatingType, lvl: 4, maxLvl: 5, top: 7 }
                            },
                            {
                                uri: '/profile/emma',
                                name: 'Emma Davis',
                                avatar: 'https://dummyimage.com/32x32/E67E22/ffffff?text=E',
                                rating: { ratingType: 'influencer' as RatingType, lvl: 5, maxLvl: 5, top: 2 }
                            },
                            {
                                uri: '/profile/mike',
                                name: 'Mike Brown',
                                avatar: 'https://dummyimage.com/32x32/1ABC9C/ffffff?text=M',
                                rating: { ratingType: 'contributor' as RatingType, lvl: 2, maxLvl: 5, top: 30 }
                            },
                            {
                                uri: '/profile/lisa',
                                name: 'Lisa Anderson',
                                avatar: 'https://dummyimage.com/32x32/E74C3C/ffffff?text=L',
                                rating: { ratingType: 'maintainer' as RatingType, lvl: 3, maxLvl: 5, top: 12 }
                            }
                        ],
                        projectId: 'project-1',
                        categoryId: 'category-1',
                        createdTime: '2023-10-04T00:00:00Z',
                        stats: {
                            'follower': { type: 'follower' as IssueStatType, hint: 'Followers', children: 18 },
                            'chat': { type: 'chat' as IssueStatType, hint: 'Messages', children: 12 }
                        }
                    }
                ]

                return (
                    <BasePanel className="max-w-6xl mx-auto">
                        <FilterableList
                            items={issues}
                            itemComponent={IssueLink}
                            title={<h2 className="text-xl font-semibold">Issues</h2>}
                            searchPlaceholder="Search issues..."
                            searchableFields={['title', 'description']}
                        />
                    </BasePanel>
                )
            }
            return <MockIssueListPanel2 />
        }
    ]
}

export const LoadingState: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'This story demonstrates a loading state while issues are being fetched. Shows skeleton loading items.'
            }
        }
    },
    decorators: [
        (_Story: any) => {
            const LoadingIssueListPanel2 = () => {

                // Create skeleton loading items
                const skeletonIssues = [1, 2, 3].map(i => ({
                    id: i,
                    uri: '',
                    number: '',
                    title: '',
                    description: '',
                    type: 'bug' as const,
                    storage: 'arada-' as const,
                    projectId: '',
                    categoryId: '',
                    createdTime: ''
                }))

                return (
                    <BasePanel className="max-w-6xl mx-auto">
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold mb-2">Issues</h2>
                            <div className="h-10 bg-gray-200 rounded animate-pulse mb-4"></div>
                        </div>
                        <div className="space-y-4">
                            {skeletonIssues.map(i => (
                                <div key={i.id} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                                    <div className="flex items-start gap-3">
                                        <div className="h-6 w-16 bg-gray-200 rounded"></div>
                                        <div className="flex-1 space-y-3">
                                            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                            <div className="flex justify-end gap-2">
                                                <div className="h-7 w-7 bg-gray-200 rounded-full"></div>
                                                <div className="h-6 w-24 bg-gray-200 rounded"></div>
                                                <div className="h-4 w-16 bg-gray-200 rounded"></div>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t">
                                                <div className="flex gap-4">
                                                    <div className="h-4 w-12 bg-gray-200 rounded"></div>
                                                    <div className="h-4 w-12 bg-gray-200 rounded"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </BasePanel>
                )
            }
            return <LoadingIssueListPanel2 />
        }
    ]
}
