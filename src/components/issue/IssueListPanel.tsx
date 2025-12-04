import React from 'react'
import FilterableList from '@/components/list/FilterableList'
import IssueLink from '@/components/issue/IssueLink'
import BasePanel from '@/components/panel/Panel'
import { Issue } from '@/components/issue/types'
import DraggableIssueLink from './DraggableIssueLink'
import { FilterOption } from '@/components/list/FilterToggle'
import { getIcon } from '../icon'

interface Props {
  title?: string
  filterable?: boolean
  draggable?: boolean
  description?: string
}

const ContentArea: React.FC<Props> = ({ title = 'Issues', draggable = false, filterable: filerable = false, description }) => {
  // Create filters based on IssueType
  const filters: FilterOption[] = [
    {
      id: 'all',
      label: 'All',
      sortIds: [
        { id: 'priority', label: 'Priority' },
        { id: 'date', label: 'Date' },
        { id: 'title', label: 'Title' }
      ]
    },
    {
      id: 'bug',
      label: 'Bug',
      sortIds: [
        { id: 'priority', label: 'Priority' },
        { id: 'date', label: 'Date' },
        { id: 'title', label: 'Title' }
      ]
    },
    {
      id: 'feature',
      label: 'Feature',
      sortIds: [
        { id: 'priority', label: 'Priority' },
        { id: 'date', label: 'Date' },
        { id: 'title', label: 'Title' }
      ]
    },
    {
      id: 'improvement',
      label: 'Improvement',
      sortIds: [
        { id: 'priority', label: 'Priority' },
        { id: 'date', label: 'Date' },
        { id: 'title', label: 'Title' }
      ]
    },
    {
      id: 'enhancement',
      label: 'Enhancement',
      sortIds: [
        { id: 'priority', label: 'Priority' },
        { id: 'date', label: 'Date' },
        { id: 'title', label: 'Title' }
      ]
    },
    {
      id: 'wish',
      label: 'Wish',
      sortIds: [
        { id: 'priority', label: 'Priority' },
        { id: 'date', label: 'Date' },
        { id: 'title', label: 'Title' }
      ]
    },
    {
      id: 'custom',
      label: 'Custom',
      sortIds: [
        { id: 'priority', label: 'Priority' },
        { id: 'date', label: 'Date' },
        { id: 'title', label: 'Title' }
      ]
    }
  ]

  // Handle filter changes
  const handleFilterChange = (filterId: string, sortId: string) => {
    console.log('Filter changed:', { filterId, sortId })
  }

  const issues: Issue[] = [
    {
      id: 1,
      uri: '/issues/1',
      number: '#1234',
      title: "Fix responsive layout on tablet devices",
      description: "The dashboard layout breaks on iPad and other tablet devices in landscape orientation. Elements overlap and some controls become inaccessible.",
      type: 'bug',
      storage: 'arada-',
      author: {
        uri: '/profile/serkan',
        name: 'Serkan Bulgurcu',
        avatar: 'https://dummyimage.com/32x32/4FC3F7/ffffff?text=S',
        rating: {
          ratingType: 'maintainer',
          lvl: 3,
          maxLvl: 5,
          top: 10
        }
      },
      projectId: 'project-1',
      categoryId: 'category-1',
      createdTime: '2023-10-05T00:00:00Z',
      stats: {
        'follower': {
          type: 'follower',
          hint: 'Followers',
          children: 5
        },
        'chat': {
          type: 'chat',
          hint: 'Messages',
          children: 5
        }
      }
    },
    {
      id: 2,
      uri: '/issues/2',
      number: '#1235',
      title: "Data export feature crashes with large datasets",
      description: "When attempting to export data sets larger than 10,000 records, the application crashes. We need to implement pagination or streaming.",
      type: 'wish',
      storage: 'arada-',
      author: {
        uri: '/profile/serkan',
        name: 'Serkan Bulgurcu',
        avatar: 'https://dummyimage.com/32x32/4FC3F7/ffffff?text=S',
        rating: {
          ratingType: 'maintainer',
          lvl: 4,
          maxLvl: 5,
          top: 5
        }
      },
      projectId: 'project-1',
      categoryId: 'category-1',
      createdTime: '2023-10-05T00:00:00Z',
      stats: {
        'follower': {
          type: 'follower',
          hint: 'Followers',
          children: 5
        },
        'chat': {
          type: 'chat',
          hint: 'Messages',
          children: 5
        }
      }
    }
  ]

  return (
    <BasePanel className="max-w-6xl mx-auto">
      {draggable && <p className='text-md text-gray-600 dark:text-gray-500 flex items-center gap-2'>
        {getIcon('info')} Issues are draggable. Your dragging will highlight the drop targets.
      </p>}
      {!draggable && <p className='text-md mb-2 text-gray-600 dark:text-gray-500 flex items-center gap-2'>
        {getIcon('lock')} Issues are closed and will never be back.
      </p>}
      {description && <p className='text-md text-gray-600 dark:text-gray-500'>
        {description}
      </p>}
      <FilterableList
        className='mt-2'
        items={issues}
        itemComponent={draggable ? DraggableIssueLink : IssueLink}
        title={title}
        titleCenter={true}
        searchPlaceholder="Search issues..."
        searchableFields={['title', 'description']}
        filters={filerable ? filters : undefined}
        onFilterChange={handleFilterChange}
      />
    </BasePanel>
  )
}

export default ContentArea
