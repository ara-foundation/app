import React, { useState, useMemo, useEffect } from 'react'
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
          actions.getIssueById({ issueId: patch.issueId })
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
        setPatchesList(prevPatches => prevPatches.filter(patch => patch.issueId !== issueId))
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
          <h4 className="text-sm mb-2 font-medium text-slate-700 dark:text-slate-400 flex items-center gap-1.5 cursor-help">
            {getIcon({ iconType: 'info', className: 'w-4 h-4 text-slate-500 dark:text-slate-400' })}
            Patches
          </h4>
        </Tooltip>
        <DropTarget
          id={`patches-drop-${versionId || 'unknown'}`}
          accept={['patch']}
          onDrop={() => {
            alert('heyya!');
          }}
          className="min-h-[100px]"
        >
          <ul className="space-y-2">
            {patchesList.map((patch) => {
              const patchTooltipContent = (
                <div className="text-sm space-y-3">
                  <Link
                    uri={`/data/issue?id=${patch.issueId}`}
                    className="text-blue-400 hover:text-blue-300 dark:text-blue-500 dark:hover:text-blue-400 text-xs underline"
                  >
                    Click to see more about this issue
                  </Link>
                </div>
              )

              return (
                <li key={patch.issueId} className="flex items-center space-x-2">
                  <Checkbox
                    checked={patch.completed || status === 'completed'}
                    disabled
                    className="w-4 h-4 rounded-sm border-2 border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-600 data-[state=checked]:bg-slate-600 dark:data-[state=checked]:bg-slate-400 data-[state=checked]:border-slate-600 dark:data-[state=checked]:border-slate-400 flex items-center justify-center"
                  >
                    <CheckboxIndicator className="w-3 h-3 text-white dark:text-slate-700" />
                  </Checkbox>
                  <Tooltip content={patchTooltipContent}>
                    <Link
                      uri={`/data/issue?id=${patch.issueId}`}
                      className="text-sm text-slate-700 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                    >
                      {patch.title}
                    </Link>
                  </Tooltip>
                  {!patch.completed && status !== 'completed' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={revertingIssueId === patch.issueId}
                      onClick={() => handleRevertPatch(patch.issueId)}
                      className="ml-auto"
                    >
                      {revertingIssueId === patch.issueId ? (
                        <LoadingSpinner />
                      ) : (
                        getIcon({ iconType: 'revert', className: 'w-4 h-4' })
                      )}
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        </DropTarget>
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
