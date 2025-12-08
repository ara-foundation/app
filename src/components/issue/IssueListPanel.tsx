import React, { useEffect, useLayoutEffect, useMemo, useState, useCallback, useRef } from 'react'
import FilterableList from '@/components/list/FilterableList'
import IssueLink from '@/components/issue/IssueLink'
import BasePanel from '@/components/panel/Panel'
import type { Issue } from '@/types/issue'
import { IssueTag, ISSUE_EVENT_TYPES, IssueTabKey, ISSUE_TAB_TITLES, isPatchable } from '@/types/issue'
import DraggableIssueLink from './DraggableIssueLink'
import { FilterOption } from '@/components/list/FilterToggle'
import { getIcon } from '../icon'
import type { ActionProps } from '@/types/eventTypes'
import { getIssues } from './client-side'
import { PATCH_KEYWORD } from '@/types/patch'

interface Props {
  tabType: IssueTabKey
  filterable?: boolean
  draggable?: boolean
  description?: string
  galaxyId: string
}

const IssueListPanel: React.FC<Props> = ({ tabType, draggable = false, filterable: filerable = false, description, galaxyId }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [activeTab, setActiveTab] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const activeTabRef = useRef(false);
  const hasReceivedEventRef = useRef(false);

  // Fetch issues based on tabType
  const fetchIssues = useCallback(async () => {
    if (!activeTabRef.current) {
      return;
    }

    try {
      setIsLoading(true);
      // Actions return serialized Issue data directly
      const fetchedIssues: Issue[] = await getIssues(galaxyId, tabType);

      // Exclude issues that are already in the patcher list
      const visibleIssues = fetchedIssues.filter(
        issue => !(issue.listHistory || []).includes(PATCH_KEYWORD)
      );

      setIssues(visibleIssues);

    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setIsLoading(false);
    }
  }, [tabType, galaxyId]);

  // Listen for tab changes and fetch only when this tab is active
  useLayoutEffect(() => {
    hasReceivedEventRef.current = false;

    const handleTabChanged = (event: Event) => {
      hasReceivedEventRef.current = true;
      const customEvent = event as CustomEvent<{ tabType: IssueTabKey; galaxyId: string }>;
      const isThisTabActive = customEvent.detail.tabType === tabType && customEvent.detail.galaxyId === galaxyId;
      activeTabRef.current = isThisTabActive;
      setActiveTab(isThisTabActive);
    };

    const refetchIssues = () => {
      if (activeTabRef.current) {
        fetchIssues();
      }
    };

    const handleIssueUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<Issue>;
      const updatedIssue = customEvent.detail;

      if (!updatedIssue || !activeTabRef.current) {
        return;
      }

      // Check if the issue's listHistory no longer contains the current tabType
      const issueListHistory = updatedIssue.listHistory || [];
      const shouldBeInThisList = issueListHistory.includes(tabType);

      // For SHINING and PUBLIC tabs, they don't use listHistory, so we don't remove them
      if (tabType === IssueTabKey.SHINING || tabType === IssueTabKey.PUBLIC) {
        refetchIssues();
        return;
      }

      // If the issue should not be in this list, remove it immediately
      if (!shouldBeInThisList) {
        setIssues(prevIssues => prevIssues.filter(issue => issue._id !== updatedIssue._id));
      } else {
        // If it should be in this list, update it in place or refetch
        setIssues(prevIssues => {
          const index = prevIssues.findIndex(issue => issue._id === updatedIssue._id);
          if (index >= 0) {
            // Update the issue in place
            const newIssues = [...prevIssues];
            newIssues[index] = updatedIssue;
            return newIssues;
          } else {
            // Issue is new to this list, refetch to get it
            refetchIssues();
            return prevIssues;
          }
        });
      }
    };

    // Set up listeners synchronously before paint
    window.addEventListener(ISSUE_EVENT_TYPES.ISSUES_TAB_CHANGED, handleTabChanged);
    window.addEventListener(ISSUE_EVENT_TYPES.ISSUE_CREATED, refetchIssues);
    window.addEventListener(ISSUE_EVENT_TYPES.ISSUE_UNPATCHED, refetchIssues);
    window.addEventListener(ISSUE_EVENT_TYPES.ISSUE_UPDATE, handleIssueUpdate);

    // Check if this is the initial active tab (SHINING is the default)
    // Use requestAnimationFrame to check after current frame, allowing event to fire first
    if (tabType === IssueTabKey.SHINING) {
      requestAnimationFrame(() => {
        if (!hasReceivedEventRef.current) {
          activeTabRef.current = true;
          setActiveTab(true);
        }
      });
    }

    // Also set a timeout as a fallback
    const timeoutId = setTimeout(() => {
      if (!hasReceivedEventRef.current && tabType === IssueTabKey.SHINING) {
        activeTabRef.current = true;
        setActiveTab(true);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener(ISSUE_EVENT_TYPES.ISSUES_TAB_CHANGED, handleTabChanged);
      window.removeEventListener(ISSUE_EVENT_TYPES.ISSUE_CREATED, refetchIssues);
      window.removeEventListener(ISSUE_EVENT_TYPES.ISSUE_UNPATCHED, refetchIssues);
      window.removeEventListener(ISSUE_EVENT_TYPES.ISSUE_UPDATE, handleIssueUpdate);
    };
  }, [tabType, galaxyId, fetchIssues]);

  // Fetch when tab becomes active
  useEffect(() => {
    if (activeTab) {
      fetchIssues();
    } else {
      setIssues([]);
      setIsLoading(false);
    }
  }, [activeTab, fetchIssues]);

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

  const decoratedIssues = useMemo(() => {
    return issues.map(issue => {
      return {
        ...issue,
        draggable: draggable,
        patchable: isPatchable(issue),
      };
    });
  }, [draggable, issues]);

  const ItemComponent: React.FC<Issue & { actions?: ActionProps[]; patchable?: boolean; draggable?: boolean }> = (itemProps) => {
    if (itemProps.patchable || draggable) {
      return <DraggableIssueLink {...itemProps} patchable={itemProps.patchable} draggable={true} />
    }
    return <IssueLink {...itemProps} />
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
          {ISSUE_TAB_TITLES[tabType]}
        </h2>
      </div>

      {/* Issues information moved under title */}
      <div className="mb-4 space-y-2">
        {draggable && <p className='text-md text-gray-600 dark:text-gray-500 flex items-center gap-2'>
          {getIcon('info')} Issues are draggable. Your dragging will highlight the drop targets.
        </p>}
        {!draggable && tabType === IssueTabKey.CLOSED && <p className='text-md mb-2 text-gray-600 dark:text-gray-500 flex items-center gap-2'>
          {getIcon('lock')} Issues are closed and will never be back.
        </p>}
        {!draggable && tabType !== IssueTabKey.CLOSED && <p className='text-md mb-2 text-gray-600 dark:text-gray-500 flex items-center gap-2'>
          {getIcon('user')} Maintainer can move them.
        </p>}
        {description && <p className='text-md text-gray-600 dark:text-gray-500'>
          {description}
        </p>}
      </div>

      {/* FilterableList without title prop since we're showing it above */}
      <FilterableList
        className='mt-2'
        items={decoratedIssues}
        itemComponent={ItemComponent as any}
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

export default IssueListPanel
