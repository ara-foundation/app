import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import FilterableList from './FilterableList'
import { FilterOption } from './FilterToggle'
import IssueLinkPanel4 from '@/components/issue/IssueLink'
import UserCard from '@/components/profile/panel/ProfileLinkPanel'
import DependencyCard from '@/components/maintainer/DepInfoPanel'
import { Issue } from '@/components/issue/types'
import { getIcon } from '@/components/icon'

// Types for stories
interface ProfileData {
    avatar: string
    name: string
    rating: number
    description: string
    highlightedInteraction: {
        avatar: string
        name: string
        rating: number
        comment: string
        time: string
    }
    stats: {
        date: string
        followers: number
        projects: number
    }
    isFollowing: boolean
}

interface DependencyData {
    name: string
    version: string
    rating: number | null
    status: 'registered' | 'not-on-platform'
    description: string
    links: {
        website: string
        github: string
    }
    followers: string
}

const meta: Meta<typeof FilterableList> = {
    title: 'Components/List/FilterableList',
    component: FilterableList,
    parameters: {
        layout: 'padded',
    },
    argTypes: {
        items: {
            control: false,
            description: 'Array of items to display',
        },
        itemComponent: {
            control: false,
            description: 'React component to render each item',
        },
        filters: {
            control: false,
            description: 'Filter options for FilterToggle',
        },
        onFilterChange: {
            action: 'filterChanged',
            description: 'Callback when filter or sort changes',
        },
        title: {
            control: 'text',
            description: 'Optional title to display above the list',
        },
        searchPlaceholder: {
            control: 'text',
            description: 'Placeholder text for search input',
        },
        hideSearchbar: {
            control: 'boolean',
            description: 'Hide the search bar',
        },
        showNumber: {
            control: 'boolean',
            description: 'Show number badge next to title (default: true)',
        },
        searchableFields: {
            control: false,
            description: 'Specific fields to search in (auto-detected if not provided)',
        },
        className: {
            control: 'text',
            description: 'Additional CSS classes',
        },
    },
}

export default meta
type Story = StoryObj<typeof FilterableList>

// Sample data for stories
const sampleIssues: Issue[] = [
    {
        uri: 'https://github.com/example/repo/issues/142',
        number: '#142',
        title: 'Improve blockchain verification performance',
        description: 'Transaction verification takes too long on large repositories',
        type: 'improvement',
        storage: 'github',
        author: {
            uri: '',
            children: '',
            icon: ''
        },
        projectId: '',
        categoryId: ''
    },
    {
        uri: 'https://github.com/example/repo/issues/156',
        number: '#156',
        title: 'Add support for Solana blockchain',
        description: 'Currently only supports Ethereum and Polygon networks',
        type: 'feature',
        storage: 'github',
        author: {
            uri: '',
            children: '',
            icon: ''
        },
        projectId: '',
        categoryId: ''
    },
    {
        uri: 'https://github.com/example/repo/issues/189',
        number: '#189',
        title: 'Fix dependency vulnerability in crypto module',
        description: 'Security issue identified in v2.3.1 of the crypto verification module',
        type: 'bug',
        storage: 'github',
        author: {
            uri: '',
            children: '',
            icon: ''
        },
        projectId: '',
        categoryId: ''
    },
    {
        uri: 'https://github.com/example/repo/issues/201',
        number: '#201',
        title: 'Implement batch processing for large SBOMs',
        description: 'Current implementation fails with memory errors on repositories with 1000+ dependencies',
        type: 'enhancement',
        storage: 'github',
        author: {
            uri: '',
            children: '',
            icon: ''
        },
        projectId: '',
        categoryId: ''
    },
    {
        uri: 'https://app.ara.foundation/issues/custom',
        number: 'Other',
        title: 'Custom issue or enhancement',
        description: 'Describe your own contribution',
        type: 'custom',
        storage: 'arada-',
        author: {
            uri: '',
            children: '',
            icon: ''
        },
        projectId: '',
        categoryId: ''
    }
]

const sampleProfiles: ProfileData[] = [
    {
        avatar: "https://dummyimage.com/40x40/f59e0b/ffffff?text=S",
        name: "Serkan Balguliyev",
        rating: 220,
        description: "The dashboard layout breaks on iPad and other tablet devices in landscape orientation. Elements overlap and some controls become inaccessible.",
        highlightedInteraction: {
            avatar: "https://dummyimage.com/32x32/10b981/ffffff?text=S",
            name: "Sarah Johnson",
            rating: 244,
            comment: "David your code is really good.",
            time: "Today at 9:22 AM"
        },
        stats: {
            date: "Oct 5, 2023",
            followers: 5,
            projects: 2
        },
        isFollowing: false
    },
    {
        avatar: "https://dummyimage.com/40x40/3b82f6/ffffff?text=A",
        name: "Alex Chen",
        rating: 180,
        description: "Experienced full-stack developer with expertise in React and Node.js. Passionate about clean code and user experience.",
        highlightedInteraction: {
            avatar: "https://dummyimage.com/32x32/ef4444/ffffff?text=M",
            name: "Mike Wilson",
            rating: 195,
            comment: "Great contribution to the project!",
            time: "Yesterday at 2:15 PM"
        },
        stats: {
            date: "Nov 12, 2023",
            followers: 12,
            projects: 4
        },
        isFollowing: true
    },
    {
        avatar: "https://dummyimage.com/40x40/10b981/ffffff?text=E",
        name: "Emma Rodriguez",
        rating: 310,
        description: "UI/UX designer and frontend developer. Specializes in creating accessible and responsive web applications.",
        highlightedInteraction: {
            avatar: "https://dummyimage.com/32x32/8b5cf6/ffffff?text=L",
            name: "Lisa Park",
            rating: 280,
            comment: "Love your design approach!",
            time: "2 days ago"
        },
        stats: {
            date: "Dec 1, 2023",
            followers: 8,
            projects: 3
        },
        isFollowing: false
    }
]

const sampleDependencies: DependencyData[] = [
    {
        name: "TailwindCSS",
        version: "v3.3",
        rating: 71.5,
        status: "registered",
        description: "A utility-first CSS framework for rapidly building custom user interfaces. You Don't Have To Worry About Specificity...",
        links: {
            website: "#",
            github: "#"
        },
        followers: "4.2M"
    },
    {
        name: "React",
        version: "v18.2.0",
        rating: null,
        status: "not-on-platform",
        description: "Description is not available...",
        links: {
            website: "#",
            github: "#"
        },
        followers: "4.2M"
    },
    {
        name: "Vue.js",
        version: "v3.4.0",
        rating: 68.2,
        status: "registered",
        description: "A progressive JavaScript framework for building user interfaces. Vue is designed from the ground up to be incrementally adoptable.",
        links: {
            website: "#",
            github: "#"
        },
        followers: "2.1M"
    },
    {
        name: "Angular",
        version: "v17.0.0",
        rating: 45.8,
        status: "registered",
        description: "A platform and framework for building single-page client applications using HTML and TypeScript.",
        links: {
            website: "#",
            github: "#"
        },
        followers: "1.8M"
    }
]

// Filter configurations
const issueFilters: FilterOption[] = [
    {
        id: 'all',
        label: 'All',
        sortIds: [
            { id: 'priority', label: 'Priority' },
            { id: 'date', label: 'Date' },
            { id: 'rating', label: 'Rating' },
        ],
    },
    {
        id: 'bug',
        label: 'Bug',
        className: 'data-[state=on]:bg-red-500 data-[state=on]:text-white',
        sortIds: [
            { id: 'severity', label: 'Severity' },
            { id: 'date', label: 'Date' },
        ],
    },
    {
        id: 'feature',
        label: 'Feature',
        className: 'data-[state=on]:bg-blue-500 data-[state=on]:text-white',
        sortIds: [
            { id: 'complexity', label: 'Complexity' },
            { id: 'date', label: 'Date' },
        ],
    },
    {
        id: 'improvement',
        label: 'Improvement',
        className: 'data-[state=on]:bg-green-500 data-[state=on]:text-white',
        sortIds: [
            { id: 'impact', label: 'Impact' },
            { id: 'date', label: 'Date' },
        ],
    },
]

const profileFilters: FilterOption[] = [
    {
        id: 'all',
        label: 'All',
        sortIds: [
            { id: 'rating', label: 'Rating' },
            { id: 'name', label: 'Name' },
            { id: 'date', label: 'Date' },
        ],
    },
    {
        id: 'maintainer',
        label: 'Maintainer',
        className: 'data-[state=on]:bg-green-500 data-[state=on]:text-white',
        sortIds: [
            { id: 'rating', label: 'Rating' },
            { id: 'activity', label: 'Activity' },
        ],
    },
    {
        id: 'influencer',
        label: 'Influencer',
        className: 'data-[state=on]:bg-purple-500 data-[state=on]:text-white',
        sortIds: [
            { id: 'followers', label: 'Followers' },
            { id: 'rating', label: 'Rating' },
        ],
    },
    {
        id: 'contributor',
        label: 'Contributor',
        className: 'data-[state=on]:bg-orange-500 data-[state=on]:text-white',
        sortIds: [
            { id: 'contributions', label: 'Contributions' },
            { id: 'rating', label: 'Rating' },
        ],
    },
]

const dependencyFilters: FilterOption[] = [
    {
        id: 'all',
        label: 'All',
        sortIds: [
            { id: 'rating', label: 'Rating' },
            { id: 'name', label: 'Name' },
            { id: 'followers', label: 'Followers' },
        ],
    },
    {
        id: 'registered',
        label: 'On platform',
        className: 'data-[state=on]:bg-green-500 data-[state=on]:text-white',
        sortIds: [
            { id: 'rating', label: 'Rating' },
            { id: 'name', label: 'Name' },
        ],
    },
    {
        id: 'not-on-platform',
        label: 'Not on platform',
        className: 'data-[state=on]:bg-red-500 data-[state=on]:text-white',
        sortIds: [
            { id: 'name', label: 'Name' },
            { id: 'followers', label: 'Followers' },
        ],
    },
    {
        id: 'following',
        label: 'Following',
        className: 'data-[state=on]:bg-blue-500 data-[state=on]:text-white',
        sortIds: [
            { id: 'recent', label: 'Recent Activity' },
            { id: 'rating', label: 'Rating' },
        ],
    },
]

// Story 1: Fork Issues Example
export const ForkIssues: Story = {
    render: () => (
        <FilterableList
            items={sampleIssues}
            itemComponent={IssueLinkPanel4}
            filters={issueFilters}
            title={
                <div className='inline-flex items-center gap-1'>
                    {getIcon('github')} Repository Issues
                </div>
            }
            searchPlaceholder="Search for issues in the original repository..."
            searchableFields={['title', 'description']}
            showNumber={true}
        />
    ),
    parameters: {
        docs: {
            description: {
                story: 'Fork Issues example based on ForkLinkingPanel. Shows issues with filtering by type and search functionality.',
            },
        },
    },
}

// Story 2: Profile List Example
export const ProfileList: Story = {
    render: () => (
        <FilterableList
            items={sampleProfiles}
            itemComponent={UserCard}
            filters={profileFilters}
            title="Community Members"
            searchPlaceholder="Search profiles..."
            searchableFields={['name', 'description']}
        />
    ),
    parameters: {
        docs: {
            description: {
                story: 'Profile List example based on ProfileListPanel. Shows user profiles with filtering by role and search functionality.',
            },
        },
    },
}

// Story 3: Dependency List Example
export const DependencyList: Story = {
    render: () => (
        <FilterableList
            items={sampleDependencies}
            itemComponent={DependencyCard}
            filters={dependencyFilters}
            title="Project Dependencies"
            searchPlaceholder="Search Dependencies..."
            searchableFields={['name', 'description']}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        />
    ),
    parameters: {
        docs: {
            description: {
                story: 'Dependency List example based on ProjectList. Shows dependencies with filtering by platform status and search functionality.',
            },
        },
    },
}

// Story 4: Minimal Example
export const Minimal: Story = {
    render: () => (
        <FilterableList
            items={sampleIssues.slice(0, 3)}
            itemComponent={IssueLinkPanel4}
            title="Simple Issue List"
        />
    ),
    parameters: {
        docs: {
            description: {
                story: 'Minimal example with just title and items. No filters or search functionality.',
            },
        },
    },
}

// Story 5: No Title, Just List
export const NoTitle: Story = {
    render: () => (
        <FilterableList
            items={sampleProfiles}
            itemComponent={UserCard}
            filters={profileFilters}
            searchPlaceholder="Search users..."
        />
    ),
    parameters: {
        docs: {
            description: {
                story: 'Example without title, showing just filters, search, and list content.',
            },
        },
    },
}

// Story 6: Search Only
export const SearchOnly: Story = {
    render: () => (
        <FilterableList
            items={sampleDependencies}
            itemComponent={DependencyCard}
            searchPlaceholder="Search dependencies..."
            searchableFields={['name', 'description']}
        />
    ),
    parameters: {
        docs: {
            description: {
                story: 'Search-only example with no filters, demonstrating search functionality across dependency data.',
            },
        },
    },
}

// Story 7: Custom Search Fields
export const CustomSearchFields: Story = {
    render: () => (
        <FilterableList
            items={sampleIssues}
            itemComponent={IssueLinkPanel4}
            searchPlaceholder="Search by title only..."
            searchableFields={['title']} // Only search in title, not description
        />
    ),
    parameters: {
        docs: {
            description: {
                story: 'Example with custom search fields, only searching in the title field.',
            },
        },
    },
}

// Story 8: Hidden Search Bar
export const HiddenSearchBar: Story = {
    render: () => (
        <FilterableList
            items={sampleProfiles}
            itemComponent={UserCard}
            filters={profileFilters}
            title="Profiles (No Search)"
            hideSearchbar={true}
        />
    ),
    parameters: {
        docs: {
            description: {
                story: 'Example with hidden search bar, showing only filters and list content.',
            },
        },
    },
}

// Story 9: Empty State
export const EmptyState: Story = {
    render: () => (
        <FilterableList
            items={[]}
            itemComponent={IssueLinkPanel4}
            title="No Issues Found"
            searchPlaceholder="Search issues..."
        />
    ),
    parameters: {
        docs: {
            description: {
                story: 'Example with empty items array to demonstrate empty state handling.',
            },
        },
    },
}

// Story 10: Default Items Title
export const DefaultItemsTitle: Story = {
    render: () => (
        <FilterableList
            items={sampleIssues}
            itemComponent={IssueLinkPanel4}
            showNumber={true}
            searchPlaceholder="Search issues..."
        />
    ),
    parameters: {
        docs: {
            description: {
                story: 'Example showing default "Items" title with number badge when no title is provided but showNumber is true.',
            },
        },
    },
}

// Story 11: No Number Badge
export const NoNumberBadge: Story = {
    render: () => (
        <FilterableList
            items={sampleProfiles}
            itemComponent={UserCard}
            title="Community Members"
            showNumber={false}
            searchPlaceholder="Search profiles..."
        />
    ),
    parameters: {
        docs: {
            description: {
                story: 'Example with title but no number badge (showNumber=false).',
            },
        },
    },
}


// Story 13: Interactive Example
export const Interactive: Story = {
    render: () => {
        const [currentFilter, setCurrentFilter] = useState<string>('')
        const [currentSort, setCurrentSort] = useState<string>('')

        const handleFilterChange = (filterId: string, sortId: string) => {
            setCurrentFilter(filterId)
            setCurrentSort(sortId)
        }

        return (
            <div className="space-y-4">
                <FilterableList
                    items={sampleIssues}
                    itemComponent={IssueLinkPanel4}
                    filters={issueFilters}
                    onFilterChange={handleFilterChange}
                    title="Interactive FilterableList"
                    searchPlaceholder="Search issues..."
                />
                <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Current Selection</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                        <div>Filter: <span className="font-medium">{currentFilter || 'None'}</span></div>
                        <div>Sort: <span className="font-medium">{currentSort || 'None'}</span></div>
                    </div>
                </div>
            </div>
        )
    },
    parameters: {
        docs: {
            description: {
                story: 'Interactive example showing filter and sort state changes with callback handling.',
            },
        },
    },
}
