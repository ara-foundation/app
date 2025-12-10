import React, { useState, useMemo, useEffect, memo, useRef, useCallback } from 'react'
import PageLikePanel from '@/components/panel/PageLikePanel'
import Button from '../custom-ui/Button'
import Tooltip from '../custom-ui/Tooltip'
import { getIcon } from '../icon'
import PanelFooter from '../panel/PanelFooter'
import PanelStat from '../panel/PanelStat'
import NumberFlow from '@number-flow/react'
import * as RadixSlider from '@radix-ui/react-slider'
import { Checkbox, CheckboxIndicator } from '@/components/animate-ui/primitives/radix/checkbox'
import ByAuthor from '../ByAuthor'
import { ProfileLink } from '../../types/user'
import LoadingSpinner from '../LoadingSpinner'
import DropTarget from '../DropTarget'
import type { Version, Patch } from '@/types/roadmap'
import type { User } from '@/types/user'
import type { Issue } from '@/types/issue'
import MenuAvatar from '../MenuAvatar'
import { DndProvider, useDrag } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { getDemo } from '@/client-side/demo'
import { type DemoRoleChangeEvent, DEMO_EVENT_TYPES } from '@/types/demo'
import { getIssueById, updateIssue } from '@/client-side/issue'
import { getUserById } from '@/client-side/user'
import { updatePatches, markPatchTested, removePatch, updateVersionStatus, revertPatch, completePatch, releaseVersion } from '@/client-side/roadmap'
import { PATCH_EVENT_TYPES, PATCH_KEYWORD } from '@/types/patch'
import { cn, truncateStr } from '@/lib/utils'

type VersionStatus = 'complete' | 'testing' | 'release' | 'archived'

const normalizeStatus = (incoming: string): VersionStatus => {
  if (incoming === 'completed') return 'archived'
  if (incoming === 'active' || incoming === 'planned') return 'complete'
  if (incoming === 'testing' || incoming === 'release' || incoming === 'archived') return incoming
  return 'complete'
}

const ProjectVersionPanel: React.FC<Version> = ({
  tag,
  createdTime,
  status: initialStatus,
  patches,
  maintainer,
  galaxy,
  _id: versionId
}) => {
  const [status, setStatus] = useState<VersionStatus>(normalizeStatus(initialStatus))
  const [loading, setLoading] = useState<boolean>(false)
  const [patchesList, setPatchesList] = useState<Patch[]>(patches)
  const [revertingIssueId, setRevertingIssueId] = useState<string | null>(null)
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null)
  const [maintainerUser, setMaintainerUser] = useState<User | null>(null)
  const [isLoadingMaintainer, setIsLoadingMaintainer] = useState<boolean>(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [demoRole, setDemoRole] = useState<string | null>(null)
  const [totalSunshines, setTotalSunshines] = useState<number>(0)
  const [isLoadingSunshines, setIsLoadingSunshines] = useState<boolean>(false)
  const [isDraggingFromThisPanel, setIsDraggingFromThisPanel] = useState<boolean>(false)
  const draggingPatchesCountRef = useRef<number>(0)

  // Fetch maintainer user data from maintainer ID
  useEffect(() => {
    if (maintainer && typeof maintainer === 'string') {
      setIsLoadingMaintainer(true)
      getUserById(maintainer)
        .then((userData) => {
          if (userData) {
            setMaintainerUser(userData)
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
          getIssueById(patch.id)
        )
        const results = await Promise.all(issuePromises)
        const total = results.reduce((sum, issue) => {
          if (issue) {
            return sum + (issue.sunshines || 0)
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

  // Resolve current demo user & role
  const updateCurrentUser = useCallback(() => {
    const demo = getDemo()
    if (!demo) return
    if (demo.role) {
      setDemoRole(demo.role)
    }
    const selected = demo.users?.find(u => u.role === demo.role) || demo.users?.[0]
    if (selected?._id) {
      getUserById(selected._id.toString())
        .then((userData) => {
          if (userData) {
            setCurrentUser(userData)
          }
        })
        .catch((error: unknown) => {
          console.error('Error fetching current user:', error)
        })
    } else {
      setCurrentUser(null)
    }
  }, [])

  useEffect(() => {
    updateCurrentUser()
  }, [updateCurrentUser])

  // Listen for role change events
  useEffect(() => {
    const handleRoleChange = (event: Event) => {
      const customEvent = event as CustomEvent<DemoRoleChangeEvent>
      const newRole = customEvent.detail.role
      if (newRole) {
        setDemoRole(newRole)
        updateCurrentUser()
      }
    }

    window.addEventListener(DEMO_EVENT_TYPES.ROLE_CHANGED, handleRoleChange as EventListener)

    return () => {
      window.removeEventListener(DEMO_EVENT_TYPES.ROLE_CHANGED, handleRoleChange as EventListener)
    }
  }, [updateCurrentUser])

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
  const completedIssues = useMemo(() => patchesList.filter(patch => patch.completed).length, [patchesList])
  const testedIssues = useMemo(() => patchesList.filter(patch => patch.tested).length, [patchesList])
  const totalIssues = useMemo(() => patchesList.length, [patchesList])

  // Calculate stars from sunshines (divide by 180)
  const stars = useMemo(() => {
    return totalSunshines > 0 ? totalSunshines / 180 : 0
  }, [totalSunshines])

  const getStatusColor = (status: VersionStatus) => {
    switch (status) {
      case 'complete': return 'bg-blue-100/10 dark:bg-blue-900/20 border-blue-300 dark:border-blue-500/30'
      case 'testing': return 'bg-amber-100/10 dark:bg-amber-900/20 border-amber-300 dark:border-amber-500/30'
      case 'release': return 'bg-teal-100/10 dark:bg-teal-900/20 border-teal-300 dark:border-teal-500/30'
      case 'archived': return 'bg-green-100/10 dark:bg-green-900/20 border-green-300 dark:border-green-500/30'
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

  const currentUserId = currentUser?._id?.toString()
  const maintainerId = typeof maintainer === 'string' ? maintainer : maintainerUser?._id?.toString()
  const isMaintainer = useMemo(
    () => demoRole === 'maintainer' || (currentUserId && maintainerId && currentUserId === maintainerId),
    [demoRole, currentUserId, maintainerId]
  )

  const getStatusText = (status: VersionStatus, readyForRelease: boolean) => {
    switch (status) {
      case 'complete': return 'Move to testing'
      case 'testing': return readyForRelease ? 'Ready to release' : 'Testing in progress'
      case 'release': return 'Release'
      case 'archived': return 'Archived'
      default: return 'Check'
    }
  }

  const hasPatches = totalIssues > 0
  const allCompleted = hasPatches ? completedIssues === totalIssues : false
  const allTested = hasPatches ? testedIssues === totalIssues : false
  const readyForTesting = allCompleted
  const readyForRelease = allTested
  const progressLabel = status === 'complete' ? 'Completed' : 'Tested'
  const progressValue = status === 'complete' ? completedIssues : testedIssues

  const maintainerTooltip = maintainerUser ? (
    <div className="text-sm flex items-center gap-2">
      <span>Maintainer</span>
      <MenuAvatar user={maintainerUser} />
      <span>is reviewing the patches.</span>
    </div>
  ) : 'Maintainer controls this action.'

  const statusButtonTooltip: React.ReactNode | undefined = (() => {
    if (status === 'archived') return 'Version is archived'
    if (status === 'complete') {
      if (!hasPatches) return 'No patches found. Add patches first'
      if (!readyForTesting) return 'All patches must be completed before testing'
      if (!isMaintainer) return maintainerTooltip
    }
    if (status === 'testing') {
      if (!isMaintainer) return maintainerTooltip
      if (!readyForRelease) return 'Mark every patch as tested to proceed'
    }
    if (status === 'release' && !isMaintainer) return maintainerTooltip
    return undefined
  })()

  const isStatusButtonDisabled =
    loading ||
    status === 'archived' ||
    (status === 'complete' && (!isMaintainer || !readyForTesting)) ||
    (status === 'testing' && (!isMaintainer || !readyForRelease)) ||
    (status === 'release' && !isMaintainer)

  const persistStatus = useCallback(async (nextStatus: VersionStatus) => {
    if (!versionId) return false
    setLoading(true)
    try {
      const success = await updateVersionStatus({ versionId, status: nextStatus })
      if (success) {
        setStatus(nextStatus)
        return true
      }
      console.error('Error updating status')
      return false
    } catch (error) {
      console.error('Error calling API:', error)
      return false
    } finally {
      setLoading(false)
    }
  }, [versionId])

  const handleStatusUpdate = async () => {
    if (loading || !versionId) return
    if (status === 'archived') return

    if (status === 'complete') {
      if (!isMaintainer || !readyForTesting) return
      await persistStatus('testing')
      return
    }

    if (status === 'testing') {
      if (!isMaintainer || !readyForRelease) return
      await persistStatus('release')
      return
    }

    if (status === 'release') {
      if (!isMaintainer || !versionId) return
      await releaseVersion({
        versionId,
        tag,
        galaxyId: galaxy,
      })
      return
    }
  }

  useEffect(() => {
    if (status === 'testing' && readyForRelease && !loading && isMaintainer) {
      persistStatus('release')
    }
  }, [status, readyForRelease, loading, isMaintainer, persistStatus])

  const handleRevertPatch = async (issueId: string) => {
    if (revertingIssueId) return

    setRevertingIssueId(issueId)
    try {
      const success = await revertPatch({
        galaxyId: galaxy,
        versionTag: tag,
        issueId
      })

      if (success) {
        // Remove patch from list
        setPatchesList(prevPatches => prevPatches.filter(patch => patch.id !== issueId))
        // Show notification
        setNotificationMessage('Issue was added to the Issue page.')
        setTimeout(() => setNotificationMessage(null), 3000)
      } else {
        console.error('Error reverting patch')
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
      const issue = await getIssueById(item.id);
      if (!issue) {
        alert('Internal error: issue not found');
        return;
      }
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
      const updateSuccess = await updateIssue({
        issueId: item.id,
        email: demo.email,
        listHistory: newListHistory,
      });

      if (!updateSuccess) {
        console.error('Failed to update issue');
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
        tested: false,
        sunshines: item.sunshines,
      };
      updatedPatches.push(newPatch);

      // Update patches in database first
      await updatePatches(versionId, updatedPatches);

      // If patch was moved from another version, remove it from that version
      if (fromVersionId) {
        await removePatch({
          patchId: item.id,
          versionId: fromVersionId,
        });
      }

      // Update local state
      setPatchesList(updatedPatches);

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
    const [patchCompleted, setPatchCompleted] = useState<boolean>(patch.completed || false)
    const [issue, setIssue] = useState<Issue | null>(null)
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [contributorUser, setContributorUser] = useState<User | null>(null)
    const [maintainerUser, setMaintainerUser] = useState<User | null>(null)
    const [isLoadingIssue, setIsLoadingIssue] = useState<boolean>(false)
    const [isToggling, setIsToggling] = useState<boolean>(false)

    const [{ opacity, isDragging }, drag] = useDrag(
      () => ({
        type: 'patch',
        item: { id: patch.id, title: patch.title, sunshines: patch.sunshines, versionId: versionId || '', completed: patchCompleted },
        collect: (monitor) => ({
          opacity: monitor.isDragging() ? 0.4 : 1,
          isDragging: monitor.isDragging(),
        }),
      }),
      [patch.id, patch.title, patch.sunshines, versionId, patchCompleted],
    );

    // Sync patchCompleted with patch.completed prop
    useEffect(() => {
      setPatchCompleted(patch.completed || false)
    }, [patch.completed])

    // Fetch issue data
    useEffect(() => {
      setIsLoadingIssue(true)
      getIssueById(patch.id)
        .then((issueData) => {
          if (issueData) {
            setIssue(issueData)
          }
        })
        .catch((error: unknown) => {
          console.error('Error fetching issue:', error)
        })
        .finally(() => {
          setIsLoadingIssue(false)
        })
    }, [patch.id])

    // Fetch current demo user
    useEffect(() => {
      const demo = getDemo()
      if (demo.email && demo.users && demo.role) {
        const user = demo.users.find(u => u.role === demo.role) || demo.users[0]
        if (user && user._id) {
          getUserById(user._id.toString())
            .then((userData) => {
              if (userData) {
                setCurrentUser(userData)
              }
            })
            .catch((error: unknown) => {
              console.error('Error fetching current user:', error)
            })
        }
      }
    }, [])

    // Fetch contributor user
    useEffect(() => {
      if (issue?.contributor && typeof issue.contributor === 'string') {
        getUserById(issue.contributor)
          .then((userData) => {
            if (userData) {
              setContributorUser(userData)
            }
          })
          .catch((error: unknown) => {
            console.error('Error fetching contributor:', error)
          })
      } else {
        setContributorUser(null)
      }
    }, [issue?.contributor])

    // Fetch maintainer user (from issue)
    useEffect(() => {
      if (issue?.maintainer && typeof issue.maintainer === 'string') {
        getUserById(issue.maintainer)
          .then((userData) => {
            if (userData) {
              setMaintainerUser(userData)
            }
          })
          .catch((error: unknown) => {
            console.error('Error fetching maintainer:', error)
          })
      } else {
        setMaintainerUser(null)
      }
    }, [issue?.maintainer])

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

    const togglePatchCompletion = async () => {
      if (isToggling || !versionId) return

      setIsToggling(true)
      try {
        const newCompleted = !patchCompleted
        const success = await completePatch({
          versionId,
          patchId: patch.id,
          complete: newCompleted,
        })

        if (success) {
          setPatchCompleted(newCompleted)
          // Update patchesList to keep it in sync
          setPatchesList(prevPatches =>
            prevPatches.map(p =>
              p.id === patch.id ? { ...p, completed: newCompleted } : p
            )
          )
        } else {
          console.error('Error toggling patch completion')
        }
      } catch (error) {
        console.error('Error calling completePatch:', error)
      } finally {
        setIsToggling(false)
      }
    }

    // Determine permissions
    const isContributor = currentUser && issue?.contributor && currentUser._id === issue.contributor
    const isMaintainer = currentUser && issue?.maintainer && currentUser._id === issue.maintainer

    // Checkbox disabled logic
    const isCheckboxDisabled = !(
      (patchCompleted && (isMaintainer || isContributor)) ||
      (!patchCompleted && isContributor)
    )

    // Tooltip content logic
    const getTooltipContent = () => {
      if (isLoadingIssue) {
        return <div className="text-sm">Loading...</div>
      }

      if (!issue) {
        return <div className="text-sm">Issue not found</div>
      }

      if (issue.contributor === currentUser?._id && !patchCompleted) {
        return <div className="text-sm">You are a contributor. Mark as completed.</div>
      }

      if (issue.contributor !== currentUser?._id && !patchCompleted) {
        return (
          <div className="text-sm flex items-center gap-2">
            <span>contributor</span>
            {contributorUser && <MenuAvatar user={contributorUser} />}
            <span>is working on this issue :)</span>
          </div>
        )
      }

      if (patchCompleted && (issue.maintainer === currentUser?._id || issue.contributor === currentUser?._id)) {
        return <div className="text-sm">Unmark if the issue isn't solved</div>
      }

      if (patchCompleted && issue.maintainer !== currentUser?._id && issue.contributor !== currentUser?._id) {
        return (
          <div className="text-sm flex items-center gap-2">
            <span>contributor</span>
            {contributorUser && <MenuAvatar user={contributorUser} />}
            <span>worked.</span>
            <span>maintainer</span>
            {maintainerUser && <MenuAvatar user={maintainerUser} />}
            <span>reviewed.</span>
          </div>
        )
      }

      return <div className="text-sm">Patch completion status</div>
    }

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
        <Tooltip content={getTooltipContent()}>
          <Checkbox
            checked={patchCompleted}
            disabled={isCheckboxDisabled || status !== 'complete' || isToggling}
            onCheckedChange={togglePatchCompletion}
            className="w-4 h-4 rounded-sm border-2 border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-600 data-[state=checked]:bg-slate-600 dark:data-[state=checked]:bg-slate-400 data-[state=checked]:border-slate-600 dark:data-[state=checked]:border-slate-400 flex items-center justify-center"
          >
            <CheckboxIndicator className="w-3 h-3 text-white dark:text-slate-700" />
          </Checkbox>
        </Tooltip>
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

  const MinimalTestablePatch: React.FC<{ patch: Patch }> = memo(({ patch }) => {
    const [isTested, setIsTested] = useState<boolean>(!!patch.tested)
    const [issue, setIssue] = useState<Issue | null>(null)
    const [authorUser, setAuthorUser] = useState<User | null>(null)
    const [isLoadingIssue, setIsLoadingIssue] = useState<boolean>(false)
    const [isToggling, setIsToggling] = useState<boolean>(false)

    useEffect(() => {
      setIsLoadingIssue(true)
      getIssueById(patch.id)
        .then((issueData) => {
          if (issueData) {
            setIssue(issueData)
          }
        })
        .catch((error: unknown) => {
          console.error('Error fetching issue:', error)
        })
        .finally(() => setIsLoadingIssue(false))
    }, [patch.id])

    useEffect(() => {
      if (issue?.author && typeof issue.author === 'string') {
        getUserById(issue.author)
          .then((userData) => {
            if (userData) {
              setAuthorUser(userData)
            }
          })
          .catch((error: unknown) => console.error('Error fetching author:', error))
      }
    }, [issue?.author])

    const isAuthor = currentUserId && issue?.author && currentUserId === issue.author

    const toggleTested = async () => {
      if (isToggling || status !== 'testing' || !isAuthor || !versionId) return
      setIsToggling(true)
      const next = !isTested
      try {
        const ok = await markPatchTested(versionId, patch.id, next)
        if (ok) {
          setIsTested(next)
          setPatchesList(prev =>
            prev.map(p => p.id === patch.id ? { ...p, tested: next } : p)
          )
        }
      } catch (error) {
        console.error('Error marking tested:', error)
      } finally {
        setIsToggling(false)
      }
    }

    const getTooltipContent = () => {
      if (isLoadingIssue) return <div className="text-sm">Loading...</div>
      if (!issue) return <div className="text-sm">Issue not found</div>
      if (!isAuthor) {
        return (
          <div className="text-sm flex items-center gap-2">
            <span>Only author</span>
            {authorUser && <MenuAvatar user={authorUser} />}
            <span>can mark tested</span>
          </div>
        )
      }
      if (isAuthor && !isTested) return <div className="text-sm">Confirm this patch is tested</div>
      if (isAuthor && isTested) return <div className="text-sm">Unmark if testing failed</div>
      return <div className="text-sm">Testing status</div>
    }

    return (
      <div
        className={cn(
          'border-1 border-amber-300/80 dark:border-amber-400/70 bg-amber-50/50 dark:bg-amber-900/20',
          'transition-colors p-2 border-dashed rounded-md',
          'flex items-center justify-between gap-2'
        )}
      >
        <Tooltip content={getTooltipContent()}>
          <Checkbox
            checked={isTested}
            disabled={!isAuthor || isToggling || status !== 'testing'}
            onCheckedChange={toggleTested}
            className="w-4 h-4 rounded-sm border-2 border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-600 data-[state=checked]:bg-teal-600 dark:data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-600 dark:data-[state=checked]:border-teal-400 flex items-center justify-center"
          >
            <CheckboxIndicator className="w-3 h-3 text-white dark:text-slate-700" />
          </Checkbox>
        </Tooltip>
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
    )
  })
  MinimalTestablePatch.displayName = 'MinimalTestablePatch'

  const MinimalStaticPatch: React.FC<{ patch: Patch }> = memo(({ patch }) => {
    const badgeText = patch.tested ? 'Tested' : patch.completed ? 'Completed' : 'Pending'
    const badgeColor = patch.tested
      ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200'
      : patch.completed
        ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'

    return (
      <div
        className={cn(
          'cursor-not-allowed border border-dashed rounded-md p-2',
          'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-600/70',
          'flex items-center justify-between gap-2'
        )}
      >
        <span className="text-xs font-medium uppercase tracking-wide">
          <span className={cn('px-2 py-0.5 rounded-sm font-semibold', badgeColor)}>{badgeText}</span>
        </span>
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
    )
  })
  MinimalStaticPatch.displayName = 'MinimalStaticPatch'

  return (
    <PageLikePanel
      interactive={false}
      title={tag}
      rightHeader={
        status !== 'archived' && (() => {
          const button = (
            <Button
              variant={status === 'release' && !isStatusButtonDisabled ? 'primary' : 'secondary'}
              disabled={isStatusButtonDisabled}
              onClick={handleStatusUpdate}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner />
                </div>
              ) : (
                getStatusText(status, readyForRelease)
              )}
            </Button>
          )

          return statusButtonTooltip ? (
            <Tooltip content={statusButtonTooltip}>
              {button}
            </Tooltip>
          ) : button
        })()
      }
      className={`w-full ${getStatusColor(status)} mb-4`}
    >
      {status !== 'archived' && (
        <div className="w-full p-2">
          {/* Slider Labels */}
          <div className="flex items-center justify-between">
            <div
              className="flex flex-row items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 text-sm">{progressLabel}</span>
              <NumberFlow
                value={progressValue}
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
              value={[progressValue]}
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
                  value={progressValue}
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
        {status === 'complete' ? (
          <>
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
            <DndProvider key={`${versionId}-draggable`} backend={HTML5Backend}>
              <ul className="space-y-2 min-h-[100px] mb-2">
                {patchesList.map((patch) => (
                  <li key={patch.id} >
                    <MinimalDraggablePatch patch={patch} />
                  </li>
                ))}
              </ul>
            </DndProvider>
          </>
        ) : status === 'testing' ? (
          <ul className="space-y-2 min-h-[100px] mb-2">
            {patchesList.map((patch) => (
              <li key={patch.id}>
                <MinimalTestablePatch patch={patch} />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-2 min-h-[100px] mb-2">
            {patchesList.map((patch) => (
              <li key={patch.id}>
                <MinimalStaticPatch patch={patch} />
              </li>
            ))}
          </ul>
        )}


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
          iconType={status === 'archived' ? 'star' : 'star'}
          hint="Stars calculated from sunshines (sunshines / 180)"
          fill={status === 'archived'}
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
          iconType={status === 'archived' ? 'star' : 'project'}
          hint="Version status"
          fill={status === 'archived'}
        >
          {status === 'archived' ? 'Archived' : status}
        </PanelStat>
      </PanelFooter>

    </PageLikePanel>
  )
}

export default ProjectVersionPanel
