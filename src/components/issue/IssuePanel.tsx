'use client'
import React, { useEffect, useState } from 'react'
import { Editor } from '@tiptap/react'
import { BasePanel } from '@/components/panel'
import Badge from '@/components/badge/Badge'
import Link from '@/components/custom-ui/Link'
import Button from '@/components/custom-ui/Button'
import Editable from '@/components/custom-ui/Editable'
import EditableMenuPanel from '@/components/custom-ui/EditableMenuPanel'
import Tooltip from '@/components/custom-ui/Tooltip'
import { getIcon, IconType } from '@/components/icon'
import type { Issue } from '@/types/issue'
import { getIssueStatIcon } from './utils'
import { ActionProps } from '@/types/eventTypes'
import PanelFooter from '@/components/panel/PanelFooter'
import PanelStat from '@/components/panel/PanelStat'
import PanelAction from '@/components/panel/PanelAction'
import MenuAvatar from '@/components/MenuAvatar'
import TimeAgo from 'timeago-react'
import YourBadge from '../badge/YourBadge'
import EditableBadge from '../badge/EditableBadge'
import { actions as astroActions } from 'astro:actions'
import type { Star } from '@/types/star'
import { getDemo } from '@/client-side/demo'
import { getStarById } from '@/client-side/star'
import { ISSUE_EVENT_TYPES } from '@/types/issue'
import { TheaterIcon } from 'lucide-react'

interface IssueContentPanelProps extends Issue {
  actions?: ActionProps[]
  onSave?: (updates: { title?: string; description?: string; technicalRequirements?: string }) => void
}

const IssueContentPanel: React.FC<IssueContentPanelProps> = ({
  actions: actionsProp,
  onSave,
  ...issue
}) => {
  // State for issue data (to update on events)
  const [issueData, setIssueData] = useState<Issue>(issue)

  // Update issueData when issue prop changes
  useEffect(() => {
    setIssueData(issue)
  }, [issue._id, issue.contributor, issue.author, issue.maintainer, issue.title, issue.description])

  // Derive properties from Issue
  const issueNumber = issueData._id ? `#${issueData._id.slice(-6)}` : '#0'
  const primaryTag = issueData.tags && issueData.tags.length > 0 ? issueData.tags[0] : undefined
  const issueType = primaryTag || 'improvement'

  // Check if this is a shining issue (has sunshines > 0)
  const isShiningIssue = issueData.sunshines > 0

  // State for author star data
  const [authorUser, setAuthorUser] = useState<Star | null>(null)
  const [isLoadingAuthor, setIsLoadingAuthor] = useState(false)

  // State for contributor star data
  const [contributorUser, setContributorUser] = useState<Star | null>(null)
  const [isLoadingContributor, setIsLoadingContributor] = useState(false)

  // State for maintainer star data
  const [maintainerUser, setMaintainerUser] = useState<Star | null>(null)
  const [isLoadingMaintainer, setIsLoadingMaintainer] = useState(false)

  // State for current star
  const [currentUser, setCurrentUser] = useState<Star | null>(null)

  // Fetch author user data from issue.author (string ID)
  useEffect(() => {
    if (issueData.author && typeof issueData.author === 'string') {
      setIsLoadingAuthor(true)
      astroActions.getStarById({ starId: issueData.author })
        .then((result: { data?: { success?: boolean; data?: Star; error?: string } }) => {
          if (result.data?.success && result.data.data) {
            setAuthorUser(result.data.data)
          }
        })
        .catch((error: unknown) => {
          console.error('Error fetching author:', error)
        })
        .finally(() => {
          setIsLoadingAuthor(false)
        })
    } else {
      setAuthorUser(null)
    }
  }, [issueData.author])

  // Fetch contributor user data from issue.contributor (string ID)
  useEffect(() => {
    if (issueData.contributor && typeof issueData.contributor === 'string') {
      setIsLoadingContributor(true)
      astroActions.getStarById({ starId: issueData.contributor })
        .then((result: { data?: { success?: boolean; data?: Star; error?: string } }) => {
          if (result.data?.success && result.data.data) {
            setContributorUser(result.data.data)
          }
        })
        .catch((error: unknown) => {
          console.error('Error fetching contributor:', error)
        })
        .finally(() => {
          setIsLoadingContributor(false)
        })
    } else {
      setContributorUser(null)
    }
  }, [issueData.contributor])

  // Fetch maintainer user data from issue.maintainer (string ID)
  useEffect(() => {
    if (issueData.maintainer && typeof issueData.maintainer === 'string') {
      setIsLoadingMaintainer(true)
      astroActions.getStarById({ starId: issueData.maintainer })
        .then((result: { data?: { success?: boolean; data?: Star; error?: string } }) => {
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
  }, [issueData.maintainer])

  // Fetch current user from demo
  useEffect(() => {
    const demo = getDemo()
    if (demo.email && demo.users && demo.role) {
      const user = demo.users.find(u => u.role === demo.role) || demo.users[0]
      if (user && user._id) {
        getStarById(user._id.toString())
          .then((userData) => {
            if (userData) {
              setCurrentUser(userData)
            }
          })
          .catch((error) => {
            console.error('Error fetching current user:', error)
          })
      }
    }
  }, [])

  // Listen for issue-update events
  useEffect(() => {
    const handleIssueUpdate = async (event: Event) => {
      const customEvent = event as CustomEvent<Issue>
      setIssueData(customEvent.detail)
    }

    window.addEventListener(ISSUE_EVENT_TYPES.ISSUE_UPDATE, handleIssueUpdate)
    return () => {
      window.removeEventListener(ISSUE_EVENT_TYPES.ISSUE_UPDATE, handleIssueUpdate)
    }
  }, [issueData._id])

  // Check if current user is author or maintainer
  const isAuthor = currentUser && issueData.author && currentUser._id === issueData.author
  const isMaintainer = currentUser?.role === 'maintainer'
  const canEdit = isAuthor || isMaintainer

  // State management for editable content
  const [value, setValue] = useState<Record<string, any>>({
    title: issueData.title,
    description: issueData.description,
    technicalRequirements: '<p>Implement unified OAuth client library</p><p>Create consistent token storage mechanism</p><p>Design user permission management interface</p><p>Develop automated token refresh process</p><p>Ensure GDPR compliance for all data transfers</p>'
  })

  // Update value when issueData changes
  useEffect(() => {
    setValue({
      title: issueData.title,
      description: issueData.description,
      technicalRequirements: value.technicalRequirements, // Keep existing technical requirements
    })
  }, [issueData.title, issueData.description])
  const [saving, setSaving] = useState(false)
  const [showEditBar, setShowEditBar] = useState(false)
  const [editor, setEditor] = useState<Editor | null>(null)

  // Imitating a save operation
  useEffect(() => {
    if (saving) {
      setTimeout(() => {
        setSaving(false)
      }, 2000)
    }
  }, [saving])

  // Handle edit action
  const handleEdit = () => {
    alert('Heyya!')
  }

  // Event props for editable components
  const eventProps = {
    onActivate: () => {
      setShowEditBar(!showEditBar)
    },
    onCancel: () => {
      setShowEditBar(false)
    },
    onBlur: (id: string, e: Editor | null) => {
      if (e !== null) {
        const newContent = e.getHTML()
        if (value[id] !== newContent) {
          const updates: Record<string, any> = { ...value }
          updates[id] = newContent
          setValue(updates)
          setSaving(true)
          if (onSave) {
            onSave({
              title: id === 'title' ? e.getText() : undefined,
              description: id === 'description' ? e.getText() : undefined,
              technicalRequirements: id === 'technicalRequirements' ? newContent : undefined
            })
          }
        }
      }
    },
    onFocus: (id: string, nameEditor: Editor | null) => {
      setEditor(nameEditor)
    },
  }

  // Non-shining actions
  const nonShiningActions = (
    <div className="flex flex-col space-y-2 w-full">
      <Button onClick={() => console.log('Liked')} variant="secondary" size="sm" className="h-7 px-2 text-xs w-full">
        {getIcon({ iconType: 'likes', className: 'w-3 h-3 mr-0.5' })}
        Like
      </Button>
      <Button variant="secondary" size="sm" className="h-7 px-2 text-xs w-full">
        {getIcon({ iconType: 'likes', className: 'w-3 h-3 mr-0.5' })}
        Dislike
      </Button>
      <Button variant="primary" size="sm" className="h-7 px-2 text-xs w-full">
        {getIcon({ iconType: 'vote-priority', className: 'w-3 h-3 mr-0.5' })}
        Fund
      </Button>
    </div>
  )

  // Prepare actions with default className
  const defaultActionClassName = ' py-0 px-1 h-6 text-sm'
  const preparedActions = actionsProp ? actionsProp.map((action) => ({
    ...action,
    className: action.className ? action.className + defaultActionClassName : defaultActionClassName
  })) : []

  // Add edit action if user is author or maintainer
  const editAction: ActionProps | null = canEdit ? {
    icon: 'settings',
    children: getIcon({ iconType: 'settings', className: 'w-4 h-4' }),
    onClick: handleEdit,
    className: defaultActionClassName
  } : null

  return (
    <BasePanel className={`${saving && 'cursor-progress'}`}>
      {showEditBar && editor !== null &&
        <EditableMenuPanel
          editor={editor}
          className='fixed top-0 left-0 right-0 h-28 z-999'
        />
      }
      <div className="flex items-start space-x-4">
        {/* Left column: Issue badge and actions */}
        <div className="w-16 overflow-hidden flex flex-col space-y-2 items-center">
          <Link uri={issueData.uri} asNewTab={false}>
            <Badge variant='info' static={true}>
              <div className="flex items-center space-x-1">
                {getIcon('cascadefund' as IconType)}
                <span className="text-xs font-medium">{issueNumber}</span>
              </div>
            </Badge>
          </Link>
          {!isShiningIssue && nonShiningActions}
        </div>

        {/* Right column: Editable content */}
        <div className="flex-1 w-full">
          {/* Title with badges */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-1">
              <Tooltip
                openDelay={2000}
                content={
                  <div className="text-sm">
                    {canEdit ? 'Title is editable for issue owners.' : 'Issue title'}
                  </div>
                }
              >
                <h1 className="text-xl font-bold text-gray-500 dark:text-slate-100 flex space-x-1 items-center gap-1">
                  {canEdit ? (
                    <Editable
                      id="title"
                      content={value['title'] || 'No title'}
                      editable={!saving}
                      limit={100}
                      className='mt-0.5'
                      {...eventProps}
                    />
                  ) : (
                    <div className='mt-1'>{value['title'] || 'No title'}</div>
                  )}
                  {canEdit ? <YourBadge saving={saving} label='issue' /> : <Badge variant='gray' static={true}>Not editable</Badge>}
                  {canEdit && <EditableBadge showEditBar={showEditBar} setShowEditBar={setShowEditBar} />}
                </h1>
              </Tooltip>
              {/* Smithing stamp icon - shows if issue has been solar forged */}
              {issueData.solarForgeTxid && (
                <Tooltip
                  content={
                    <div className="text-sm">
                      View the Solar Forge by this issue on the blockchain explorer
                    </div>
                  }
                >
                  <a
                    href={`https://sepolia.basescan.org/tx/${issueData.solarForgeTxid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <TheaterIcon className="w-4 h-4" />
                  </a>
                </Tooltip>
              )}
              {/* Shining badge */}
              <Badge variant={isShiningIssue ? 'success' : 'gray'} static={true}>
                {isShiningIssue ? 'Shining' : 'Public Backlog'}
              </Badge>
            </div>
            <Badge
              variant={
                issueType === 'bug' ? 'danger' :
                  issueType === 'feature' ? 'blue' :
                    issueType === 'improvement' ? 'success' :
                      issueType === 'enhancement' ? 'warning' : 'info'
              }
              static={true}
            >
              {issueType}
            </Badge>
          </div>

          {/* Description */}
          <div className="text-slate-700 dark:text-slate-200 text-md mb-4 prose max-w-none">
            <Tooltip
              openDelay={2000}
              content={
                <div className="text-sm">
                  {canEdit ? 'Description is editable for issue owners.' : 'Issue description'}
                </div>
              }
            >
              {canEdit ? (
                <Editable
                  id="description"
                  content={value['description'] || 'No description'}
                  editable={!saving}
                  limit={500}
                  {...eventProps}
                />
              ) : (
                <p>{value['description'] || 'No description'}</p>
              )}
            </Tooltip>
          </div>

          {/* Technical Requirements */}
          <div className="mb-4 text-slate-600 dark:text-slate-400 text-sm">
            <h3 className="text-lg text-slate-700 dark:text-slate-300">Technical Requirements</h3>
            <Tooltip
              openDelay={2000}
              content={
                <div className="text-sm">
                  {canEdit ? 'Technical requirements are editable for issue owners.' : 'Technical requirements'}
                </div>
              }
            >
              {canEdit ? (
                <Editable
                  id="technicalRequirements"
                  content={value['technicalRequirements']}
                  editable={!saving}
                  limit={1000}
                  {...eventProps}
                />
              ) : (
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: value['technicalRequirements'] }} />
              )}
            </Tooltip>
          </div>

          {/* Author, Contributor, Maintainer and created time */}
          {(contributorUser || maintainerUser || authorUser || issueData.createdTime) && (
            <div className={`flex items-center space-x-1 text-gray-500 gap-1 text-xs mb-2 ${contributorUser ? 'justify-between' : 'justify-end'}`}>
              {contributorUser && maintainerUser && (
                <>
                  <div className="flex items-center gap-1">
                    <span>Contributor</span>
                    {isLoadingContributor ? (
                      <span className="text-xs text-gray-400">Loading...</span>
                    ) : (
                      <MenuAvatar
                        src={contributorUser.src}
                        className='w-7! h-7!'
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Maintainer</span>
                    {isLoadingMaintainer ? (
                      <span className="text-xs text-gray-400">Loading...</span>
                    ) : (
                      <MenuAvatar
                        src={maintainerUser.src}
                        uri={maintainerUser.uri}
                        className='w-7! h-7!'
                      />
                    )}
                  </div>
                </>
              )}
              {authorUser && (
                <>
                  <div className="flex items-center gap-1">
                    <span>By</span>
                    {isLoadingAuthor ? (
                      <span className="text-xs text-gray-400">Loading...</span>
                    ) : (
                      <MenuAvatar
                        src={authorUser.src}
                        className='w-7! h-7!'
                      />
                    )}
                    {issueData.createdTime && (
                      <TimeAgo datetime={typeof issueData.createdTime === 'number' ? issueData.createdTime * 1000 : issueData.createdTime} />
                    )}
                  </div>
                </>
              )}

            </div>
          )}

          {/* Footer with actions and stats */}
          {(issueData.stats || preparedActions.length > 0 || editAction || issueData.solarForgeTxid || (isShiningIssue && issueData.sunshines > 0)) && (
            <PanelFooter className='flex flex-row justify-between items-center mt-2'>
              <div className="flex items-center gap-2">
                {preparedActions.length > 0 && <PanelAction className='' actions={preparedActions} />}
                {editAction && (
                  <Tooltip
                    openDelay={500}
                    content={
                      <div className="text-sm">
                        Edit the issue
                      </div>
                    }
                  >
                    <Button
                      onClick={editAction.onClick}
                      className={editAction.className}
                      variant={editAction.variant}
                    >
                      {editAction.children}
                    </Button>
                  </Tooltip>
                )}
                {/* Solar forge button/link */}
                {issueData.solarForgeTxid ? (
                  <Tooltip
                    content={
                      <div className="text-sm">
                        View solar forge transaction on blockchain explorer
                      </div>
                    }
                  >
                    <a
                      href={`https://sepolia.basescan.org/tx/${issueData.solarForgeTxid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <TheaterIcon className="w-4 h-4" />
                      <span>Solar Forge</span>
                    </a>
                  </Tooltip>
                ) : isShiningIssue && issueData.sunshines > 0 ? (
                  <Tooltip
                    content={
                      <div className="text-sm">
                        Solar forge this issue to convert sunshines to stars
                      </div>
                    }
                  >
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      <TheaterIcon className="w-4 h-4 inline mr-1" />
                      Solar Forge
                    </span>
                  </Tooltip>
                ) : null}
              </div>
              {issueData.stats && Object.values(issueData.stats).map((stat, index) => (
                <PanelStat
                  key={index.toString()}
                  triggerClassName='text-sm'
                  iconType={getIssueStatIcon(stat.type)}
                  hint={stat.hint}
                  fill={stat.filled}
                >
                  {stat.children}
                </PanelStat>
              ))}
            </PanelFooter>
          )}
        </div>
      </div>
    </BasePanel>
  )
}

export default IssueContentPanel
