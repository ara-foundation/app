import React, { useState, useMemo, useEffect, memo, useRef } from 'react'
import PageLikePanel from '@/components/panel/PageLikePanel'
import Button from '../custom-ui/Button'
import Tooltip from '../custom-ui/Tooltip'
import Link from '../custom-ui/Link'
import { getIcon } from '../icon'
import PanelFooter from '../panel/PanelFooter'
import PanelStat from '../panel/PanelStat'
import NumberFlow from '@number-flow/react'
import * as RadixSlider from '@radix-ui/react-slider'
import { Checkbox, CheckboxIndicator } from '@/components/animate-ui/primitives/radix/checkbox'
import ByAuthor from '../ByAuthor'
import { ProfileLink } from '../profile/types'
import LoadingSpinner from '../LoadingSpinner'
import DropTarget from '../DropTarget'
import type { Version, Patch } from '@/types/roadmap'
import type { User } from '@/types/user'
import { actions } from 'astro:actions'
import { DndProvider, useDrag } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { getDemo } from '@/demo-runtime-cookies/client-side'
import { emitIssueUpdate } from '@/components/issue/client-side'
import { updatePatches } from './client-side'
import { PATCH_EVENT_TYPES, PATCH_KEYWORD } from '@/types/patch'
import { cn, truncateStr } from '@/lib/utils'

const ProjectVersionPanel: React.FC<Version> = ({
  tag,
  createdTime,
  status: initialStatus,
  patches,
  maintainer,
  galaxy,
  _id: versionId
}) => {
  const [status, setStatus] = useState<'completed' | 'active' | 'planned'>(initialStatus)
  const [loading, setLoading] = useState<boolean>(false)
  const [patchesList, setPatchesList] = useState<Patch[]>(patches)
  const [revertingIssueId, setRevertingIssueId] = useState<string | null>(null)
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null)
  const [maintainerUser, setMaintainerUser] = useState<User | null>(null)
  const [isLoadingMaintainer, setIsLoadingMaintainer] = useState<boolean>(false)
  const [totalSunshines, setTotalSunshines] = useState<number>(0)
  const [isLoadingSunshines, setIsLoadingSunshines] = useState<boolean>(false)
  const [isDraggingFromThisPanel, setIsDraggingFromThisPanel] = useState<boolean>(false)
  const draggingPatchesCountRef = useRef<number>(0)

  // Fetch maintainer user data from maintainer ID
  useEffect(() => {
    if (maintainer && typeof maintainer === 'string') {
      setIsLoadingMaintainer(true)
      actions.getUserById({ userId: maintainer })
        .then((result: { data?: { success?: boolean; data?: User; error?: string } }) => {
          if (result.data?.success && result.data.data) {
            setMaintainerUser(result.data.data)
          }
        })
        .catch((error: unknown) => {
          console.error('Error fetching maintainer:', error)
        })
        .finally(() => {
          setIsLoadingMaintainer(false)
        })
    } else {
      setMaintainerUser(null)
    }
  }, [maintainer])

  // Fetch sunshines from patches if patches is not empty
  useEffect(() => {
    if (patchesList.length === 0) {
      setTotalSunshines(0)
      return
    }

    setIsLoadingSunshines(true)
    const fetchSunshines = async () => {
      try {
        const issuePromises = patchesList.map(patch =>
          actions.getIssueById({ issueId: patch.id })
        )
        const results = await Promise.all(issuePromises)
        const total = results.reduce((sum, result) => {
          if (result.data?.success && result.data.data) {
            return sum + (result.data.data.sunshines || 0)
          }
          return sum
        }, 0)
        setTotalSunshines(total)
      } catch (error) {
        console.error('Error fetching sunshines from patches:', error)
      } finally {
        setIsLoadingSunshines(false)
      }
    }

    fetchSunshines()
  }, [patchesList])

  // Listen for PATCH_UPDATE and PATCH_REMOVED events
  useEffect(() => {
    if (!versionId) return;

    const handlePatchUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<import('@/types/patch').PatchUpdateEventDetail>;
      const { fromVersionId, toVersionId, patch } = customEvent.detail;

      // Only handle if this component is not the source of the update
      // (i.e., if toVersionId matches, we already updated our state, so skip)
      if (fromVersionId === versionId && toVersionId !== versionId) {
        // Remove patch from UI and patches array (client-side only)
        setPatchesList(prevPatches => prevPatches.filter(p => p.id !== patch.id));
      } else if (toVersionId === versionId && fromVersionId !== versionId) {
        // Add patch to UI and patches array (only if coming from another version)
        setPatchesList(prevPatches => {
          // Check if already exists
          if (prevPatches.some(p => p.id === patch.id)) {
            return prevPatches;
          }
          return [...prevPatches, patch];
        });
      }
    };

    const handlePatchRemoved = (event: Event) => {
      const customEvent = event as CustomEvent<import('@/types/patch').PatchRemovedEventDetail>;
      const { versionId: eventVersionId, patch } = customEvent.detail;

      if (eventVersionId === versionId) {
        // Remove patch from UI and patches array (client-side only)
        setPatchesList(prevPatches => prevPatches.filter(p => p.id !== patch.id));
      }
    };

    window.addEventListener(PATCH_EVENT_TYPES.PATCH_UPDATE, handlePatchUpdate);
    window.addEventListener(PATCH_EVENT_TYPES.PATCH_REMOVED, handlePatchRemoved);

    return () => {
      window.removeEventListener(PATCH_EVENT_TYPES.PATCH_UPDATE, handlePatchUpdate);
      window.removeEventListener(PATCH_EVENT_TYPES.PATCH_REMOVED, handlePatchRemoved);
    };
  }, [versionId])

  // Calculate completedIssues and totalIssues dynamically from patches
  const completedIssues = useMemo(() => {
    return patchesList.filter(patch => patch.completed).length
  }, [patchesList])

  const totalIssues = useMemo(() => {
    return patchesList.length
  }, [patchesList])

  // Calculate stars from sunshines (divide by 180)
  const stars = useMemo(() => {
    return totalSunshines > 0 ? totalSunshines / 180 : 0
  }, [totalSunshines])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100/10 dark:bg-green-900/20 border-green-300 dark:border-green-500/30'
      case 'active': return 'bg-blue-100/10 dark:bg-blue-900/20 border-blue-300 dark:border-blue-500/30'
      case 'planned': return 'bg-purple-100/10 dark:bg-purple-900/20 border-purple-300 dark:border-purple-500/30'
      default: return 'bg-slate-100/10 dark:bg-slate-900/20 border-slate-300 dark:border-slate-500/30'
    }
  }

  // Convert maintainer user to ProfileLink format for ByAuthor component
  const authorProfile: ProfileLink | undefined = useMemo(() => {
    if (!maintainerUser) return undefined

    return {
      uri: maintainerUser.uri || `/profile/${maintainerUser._id}`,
      children: maintainerUser.nickname || maintainerUser.email?.split('@')[0] || 'Unknown',
      icon: maintainerUser.src,
    }
  }, [maintainerUser])

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Archived'
      case 'active': return 'Mark as released'
      case 'planned': return 'Check'
      default: return 'Check'
    }
  }

  const handleStatusUpdate = async () => {
    if (loading || status === 'completed' || !versionId) return

    setLoading(true)
    try {
      const result = await actions.updateVersionStatus({
        versionId,
        status: status === 'active' ? 'completed' : status === 'planned' ? 'active' : status,
      })

      if (result.data?.success) {
        const newStatus = status === 'active' ? 'completed' : status === 'planned' ? 'active' : status
        setStatus(newStatus)
      } else {
        console.error('Error updating status:', result.data?.error)
      }
    } catch (error) {
      console.error('Error calling API:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRevertPatch = async (issueId: string) => {
    if (revertingIssueId) return

    setRevertingIssueId(issueId)
    try {
      const result = await actions.revertPatch({
        galaxyId: galaxy,
        versionTag: tag,
        issueId
      })

      if (result.data?.success) {
        // Remove patch from list
        setPatchesList(prevPatches => prevPatches.filter(patch => patch.id !== issueId))
        // Show notification
        setNotificationMessage('Issue was added to the Issue page.')
        setTimeout(() => setNotificationMessage(null), 3000)
      } else {
        console.error('Error reverting patch:', result.data?.error)
        alert('Failed to revert patch. Please try again.')
      }
    } catch (error) {
      console.error('Error calling API:', error)
      alert('Failed to revert patch. Please try again.')
    } finally {
      setRevertingIssueId(null)
    }
  }

  const changePatchList = async (item: { id: string; title: string, sunshines?: number }, versionId: string, completed: boolean = false) => {
    try {
      const demo = getDemo();
      if (!demo.email) {
        console.error('No demo email found');
        return;
      }

      // Get issue
      const issueResult = await actions.getIssueById({ issueId: item.id });
      if (!issueResult.data?.success || !issueResult.data.data) {
        alert('Internal error: issue not found');
        return;
      }

      const issue = issueResult.data.data;
      const originalListHistory = issue.listHistory || [];
      const hadPatcher = originalListHistory.includes(PATCH_KEYWORD);

      // Extract fromVersionId before filtering (for PATCH_UPDATE event)
      const versionPrefix = originalListHistory.find((key: string) => key.startsWith('version-'));
      const fromVersionId = versionPrefix ? versionPrefix.replace('version-', '') : '';

      // Filter listHistory: remove 'patcher' if present, remove all 'version-*' prefixed items
      const filteredListHistory = originalListHistory.filter(
        (key: string) => key !== PATCH_KEYWORD && !key.startsWith('version-')
      );

      // Add version-<versionId> to listHistory
      const newListHistory = [...filteredListHistory, `version-${versionId}`];

      // Update issue
      const updateResult = await actions.updateIssue({
        issueId: item.id,
        email: demo.email,
        listHistory: newListHistory,
      });

      if (!updateResult.data?.success) {
        console.error('Failed to update issue:', updateResult.data?.error);
        return;
      }

      // Update patches array: remove existing patch with matching issueId, add new patch
      // Calculate updated patches (we'll update state after DB update to ensure consistency)
      const currentPatches = patchesList; // This might be stale, but we'll update from DB if needed
      const updatedPatches = currentPatches.filter(patch => patch.id !== item.id);
      const newPatch: Patch = {
        id: item.id,
        title: item.title,
        completed: completed,
      };
      updatedPatches.push(newPatch);

      // Update patches in database first
      await updatePatches(versionId, updatedPatches);

      // If patch was moved from another version, remove it from that version
      if (fromVersionId) {
        await actions.removePatch({
          patchId: item.id,
          versionId: fromVersionId,
        });
      }

      // Update local state
      setPatchesList(updatedPatches);

      // Fetch the updated issue and broadcast issue update
      const updatedIssueResult = await actions.getIssueById({ issueId: item.id });
      if (updatedIssueResult.data?.success && updatedIssueResult.data.data) {
        emitIssueUpdate(updatedIssueResult.data.data);
      }

      // Broadcast patch event
      if (hadPatcher) {
        // If listHistory had 'patcher', broadcast PATCH_CREATED
        window.dispatchEvent(new CustomEvent(PATCH_EVENT_TYPES.PATCH_CREATED, {
          detail: {
            patch: newPatch,
            versionId: versionId,
          },
        }));
      } else if (fromVersionId) {
        // If it had 'version-*', broadcast PATCH_UPDATE
        window.dispatchEvent(new CustomEvent(PATCH_EVENT_TYPES.PATCH_UPDATE, {
          detail: {
            fromVersionId: fromVersionId,
            toVersionId: versionId,
            patch: newPatch,
          },
        }));
      }
    } catch (error) {
      console.error('Error changing patch list:', error);
    }
  }

  // Minimal draggable patch component
  const MinimalDraggablePatch: React.FC<{ patch: Patch }> = memo(({ patch }) => {
    const [{ opacity, isDragging }, drag] = useDrag(
      () => ({
        type: 'patch',
        item: { id: patch.id, title: patch.title, sunshines: patch.sunshines, versionId: versionId || '' },
        collect: (monitor) => ({
          opacity: monitor.isDragging() ? 0.4 : 1,
          isDragging: monitor.isDragging(),
        }),
      }),
      [patch.id, patch.title, patch.sunshines, versionId],
    );

    // Track when dragging starts/ends to disable DropTarget in parent
    useEffect(() => {
      if (isDragging) {
        draggingPatchesCountRef.current += 1;
        setIsDraggingFromThisPanel(true);
      } else {
        draggingPatchesCountRef.current = Math.max(0, draggingPatchesCountRef.current - 1);
        if (draggingPatchesCountRef.current === 0) {
          setIsDraggingFromThisPanel(false);
        }
      }
    }, [isDragging]);

    return (
      <div
        ref={drag as any}
        data-testid={patch.id}
        style={{ opacity }}
        className={cn(
          'cursor-move border-1 border-amber-300/80 hover:border-amber-400',
          'dark:border-amber-400/70 dark:hover:border-amber-300/90',
          'bg-amber-50/50 dark:bg-amber-900/20',
          'transition-colors p-2 border-dashed rounded-md',
          'flex items-center justify-between gap-2',
        )}
      >
        <Checkbox
          checked={patch.completed || status === 'completed'}
          disabled
          className="w-4 h-4 rounded-sm border-2 border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-600 data-[state=checked]:bg-slate-600 dark:data-[state=checked]:bg-slate-400 data-[state=checked]:border-slate-600 dark:data-[state=checked]:border-slate-400 flex items-center justify-center"
        >
          <CheckboxIndicator className="w-3 h-3 text-white dark:text-slate-700" />
        </Checkbox>
        <span className="text-sm text-slate-700 dark:text-slate-300 flex-1 truncate">
          {truncateStr(patch.title)}
        </span>
        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
          {getIcon({ iconType: 'sunshine', className: 'w-4 h-4', fill: 'currentColor' })}
          <span className="text-xs font-semibold">
            <NumberFlow
              value={patch.sunshines || 0}
              locales="en-US"
              format={{ useGrouping: false }}
            />
          </span>
        </div>
      </div>
    );
  });
  MinimalDraggablePatch.displayName = 'MinimalDraggablePatch';

  return (
    <PageLikePanel
      interactive={false}
      title={tag}
      rightHeader={
        status !== 'completed' &&
        <Button variant='secondary' disabled={loading} onClick={handleStatusUpdate}>
          {loading ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner />
            </div>
          ) : (
            getStatusText(status)
          )}
        </Button>
      }
      className={`w-full ${getStatusColor(status)} mb-4`}
    >
      {status !== 'completed' && (
        <div className="w-full p-2">
          {/* Slider Labels */}
          <div className="flex items-center justify-between">
            <div
              className="flex flex-row items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 text-sm">Completed</span>
              <NumberFlow
                value={completedIssues}
                locales="en-US"
                format={{ useGrouping: false }}
                className="font-semibold text-slate-700 dark:text-slate-400 text-sm mb-0.2"
              />
            </div>
            <div
              className="flex flex-row items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 text-sm">Total Amount</span>
              <NumberFlow
                value={totalIssues}
                locales="en-US"
                format={{ useGrouping: false }}
                className="font-semibold text-slate-700 dark:text-slate-400 text-sm mb-0.2"
              />
            </div>
          </div>

          {/* Slider */}
          <div className="my-2">
            <RadixSlider.Root
              value={[completedIssues]}
              onValueChange={() => { }}
              max={totalIssues}
              min={0}
              step={1}
              className="relative flex h-5 w-full touch-none select-none items-center"
            >
              <RadixSlider.Track className="relative h-2 grow rounded-full bg-slate-200 dark:bg-slate-700 transition-colors">
                <RadixSlider.Range className="absolute h-full rounded-full bg-slate-600 dark:bg-teal-400/50 transition-all duration-300 ease-out" />
              </RadixSlider.Track>
              <RadixSlider.Thumb className="relative block h-5 w-5 rounded-full bg-gray-100/50 dark:bg-slate-400/80 shadow-md ring-2 ring-slate-400/20 dark:ring-slate-500/30 hover:ring-slate-500/40 dark:hover:ring-slate-400/50 transition-all focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400">
                <NumberFlow
                  value={completedIssues}
                  locales="en-US"
                  format={{ useGrouping: false }}
                  className="absolute left-1/2 -translate-x-1/2 text-xs text-slate-600 dark:text-slate-700 font-semibold"
                />
              </RadixSlider.Thumb>
            </RadixSlider.Root>
          </div>
        </div>
      )}

      <div className="my-6">
        <Tooltip content="Patches are the issues with the contributor and common agreement.">
          <DndProvider key={versionId} backend={HTML5Backend}>
            <DropTarget
              id={`version-${versionId || 'unknown'}`}
              accept={['patch', 'issue']}
              onDrop={(item: { id: string; title: string; completed?: boolean, sunshines?: number }) => {
                if (!versionId) return;
                const completed = item.completed !== undefined ? item.completed : false;
                changePatchList(item, versionId, completed);
              }}
              disabled={isDraggingFromThisPanel}
            >
              <h4 className="text-sm mb-2 font-medium text-slate-700 dark:text-slate-400 flex items-center gap-1.5 cursor-help">
                {getIcon({ iconType: 'info', className: 'w-4 h-4 text-slate-500 dark:text-slate-400' })}
                Patches
              </h4>
            </DropTarget>
          </DndProvider>
        </Tooltip>

        <DndProvider key={versionId} backend={HTML5Backend}>
          <ul className="space-y-2 min-h-[100px] mb-2">
            {patchesList.map((patch) => (
              <li key={patch.id} >
                <MinimalDraggablePatch patch={patch} />
              </li>
            ))}
          </ul>
        </DndProvider>


        {notificationMessage && (
          <div className="mt-4 p-3 bg-green-50/10 border border-green-200 dark:border-green-700 rounded-xs text-green-700 dark:text-green-400 text-sm">
            {notificationMessage}
          </div>
        )}
        {/* Author and date at bottom right */}
        <ByAuthor author={authorProfile} createdTime={createdTime} />
      </div>

      <PanelFooter>
        <PanelStat
          iconType="sunshine"
          hint="Total sunshines from all patches"
          fill={true}
        >
          {isLoadingSunshines ? (
            <LoadingSpinner />
          ) : (
            <NumberFlow
              value={totalSunshines}
              locales="en-US"
              format={{ useGrouping: true }}
            />
          )}
        </PanelStat>
        <PanelStat
          iconType={status === 'completed' ? 'star' : 'star'}
          hint="Stars calculated from sunshines (sunshines / 180)"
          fill={status === 'completed' ? true : false}
        >
          {isLoadingSunshines ? (
            <LoadingSpinner />
          ) : (
            <NumberFlow
              value={stars}
              locales="en-US"
              format={{
                useGrouping: false,
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
              }}
            />
          )}
        </PanelStat>
        <PanelStat
          iconType={status === 'completed' ? 'star' : 'project'}
          hint="Version status"
          fill={status === 'completed' ? true : false}
        >
          {status === 'completed' ? 'Archived' : status}
        </PanelStat>
      </PanelFooter>

    </PageLikePanel>
  )
}

export default ProjectVersionPanel
