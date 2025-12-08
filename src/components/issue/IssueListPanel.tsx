import React, { useEffect, useState } from 'react'
import FilterableList from '@/components/list/FilterableList'
import IssueLink from '@/components/issue/IssueLink'
import BasePanel from '@/components/panel/Panel'
import type { Issue } from '@/types/issue'
import { IssueTag } from '@/types/issue'
import DraggableIssueLink from './DraggableIssueLink'
import { FilterOption } from '@/components/list/FilterToggle'
import { getIcon } from '../icon'
import { actions } from 'astro:actions'

interface Props {
  title?: string
  filterable?: boolean
  draggable?: boolean
  description?: string
  galaxyId?: string
}

const ContentArea: React.FC<Props> = ({ title = 'Issues', draggable = false, filterable: filerable = false, description, galaxyId }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch issues based on title
  useEffect(() => {
    const fetchIssues = async () => {
      if (!galaxyId) {
        setIsLoading(false);
        return;
      }

      try {
        // Actions return serialized Issue data directly
        let fetchedIssues: Issue[] = [];

        if (title === 'Shining Issues') {
          const result = await actions.getShiningIssues({ galaxyId });
          console.log('shining issues result', result);
          fetchedIssues = result.data?.data || [];
        } else if (title === 'Public Backlog') {
          const result = await actions.getPublicBacklogIssues({ galaxyId });
          fetchedIssues = result.data?.data || [];
        } else {
          // For other tabs, fetch all issues (can be filtered later)
          const result = await actions.getIssuesByGalaxy({ galaxyId });
          fetchedIssues = result.data?.issues || [];
        }

        setIssues(fetchedIssues);
      } catch (error) {
        console.error('Error fetching issues:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssues();

    // Listen for issue creation events to refresh
    const handleIssueCreated = () => {
      fetchIssues();
    };

    window.addEventListener('issue-created', handleIssueCreated);
    return () => {
      window.removeEventListener('issue-created', handleIssueCreated);
    };
  }, [galaxyId, title]);

  // Create filters based on IssueTag
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
      id: IssueTag.BUG,
      label: 'Bug',
      sortIds: [
        { id: 'priority', label: 'Priority' },
        { id: 'date', label: 'Date' },
        { id: 'title', label: 'Title' }
      ]
    },
    {
      id: IssueTag.FEATURE,
      label: 'Feature',
      sortIds: [
        { id: 'priority', label: 'Priority' },
        { id: 'date', label: 'Date' },
        { id: 'title', label: 'Title' }
      ]
    },
    {
      id: IssueTag.IMPROVEMENT,
      label: 'Improvement',
      sortIds: [
        { id: 'priority', label: 'Priority' },
        { id: 'date', label: 'Date' },
        { id: 'title', label: 'Title' }
      ]
    },
    {
      id: IssueTag.ENHANCEMENT,
      label: 'Enhancement',
      sortIds: [
        { id: 'priority', label: 'Priority' },
        { id: 'date', label: 'Date' },
        { id: 'title', label: 'Title' }
      ]
    },
    {
      id: IssueTag.WISH,
      label: 'Wish',
      sortIds: [
        { id: 'priority', label: 'Priority' },
        { id: 'date', label: 'Date' },
        { id: 'title', label: 'Title' }
      ]
    },
    {
      id: IssueTag.CUSTOM,
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

  if (isLoading) {
    return (
      <BasePanel className="max-w-6xl mx-auto max-h-[150vh] overflow-y-auto">
        <div className="text-center py-8">
          <p className="text-slate-600 dark:text-slate-400">Loading issues...</p>
        </div>
      </BasePanel>
    );
  }

  return (
    <BasePanel className="max-w-6xl mx-auto max-h-[150vh] min-h-[50vh] overflow-y-auto">
      {/* Title with shadow and bigger size */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 text-center drop-shadow-lg">
          {title}
        </h2>
      </div>

      {/* Issues information moved under title */}
      <div className="mb-4 space-y-2">
        {draggable && <p className='text-md text-gray-600 dark:text-gray-500 flex items-center gap-2'>
          {getIcon('info')} Issues are draggable. Your dragging will highlight the drop targets.
        </p>}
        {!draggable && <p className='text-md mb-2 text-gray-600 dark:text-gray-500 flex items-center gap-2'>
          {getIcon('lock')} Issues are closed and will never be back.
        </p>}
        {description && <p className='text-md text-gray-600 dark:text-gray-500'>
          {description}
        </p>}
      </div>

      {/* FilterableList without title prop since we're showing it above */}
      <FilterableList
        className='mt-2'
        items={issues}
        itemComponent={draggable ? DraggableIssueLink : IssueLink}
        title={undefined}
        titleCenter={false}
        searchPlaceholder="Search issues..."
        searchableFields={['title', 'description']}
        filters={filerable ? filters : undefined}
        onFilterChange={handleFilterChange}
      />
    </BasePanel>
  )
}

export default ContentArea
