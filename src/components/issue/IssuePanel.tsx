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
import type { Issue } from '@/scripts/issue'
import { getIssueStatIcon } from './utils'
import { ActionProps } from '@/types/eventTypes'
import PanelFooter from '@/components/panel/PanelFooter'
import PanelStat from '@/components/panel/PanelStat'
import PanelAction from '@/components/panel/PanelAction'
import VotePopover from './VotePopover'
import MenuAvatar from '@/components/MenuAvatar'
import ProfileRating from '@/components/rating/ProfileRating'
import AvatarList from '@/components/AvatarList'
import TimeAgo from 'timeago-react'
import YourBadge from '../badge/YourBadge'
import EditableBadge from '../badge/EditableBadge'

interface IssueContentPanelProps extends Issue {
  actions?: ActionProps[]
  editable?: boolean
  onSave?: (updates: { title?: string; description?: string; technicalRequirements?: string }) => void
}

const IssueContentPanel: React.FC<IssueContentPanelProps> = ({
  actions,
  editable = false,
  onSave,
  ...issue
}) => {
  // Check if this is a rating issue (has voting power > 0)
  const votingPower = issue.stats?.['voting-power']?.children
  const isRatingIssue = issue.storage === 'arada-' && votingPower && Number(votingPower) > 0

  // State management for editable content
  const [value, setValue] = useState<Record<string, any>>({
    title: issue.title,
    description: issue.description,
    technicalRequirements: '<p>Implement unified OAuth client library</p><p>Create consistent token storage mechanism</p><p>Design user permission management interface</p><p>Develop automated token refresh process</p><p>Ensure GDPR compliance for all data transfers</p>'
  })
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

  // Handle VP change from VotePopover
  const handleVPChange = (newVP: number) => {
    console.log(`VP changed for issue ${issue.id}: ${newVP}`)
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

  // Non-rating actions
  const nonRatingActions = (
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

  // Rating actions
  const ratingActions = isRatingIssue && issue.vpAmount && issue.currentVP !== undefined && issue.topVP !== undefined && issue.minVP !== undefined ? (
    <VotePopover
      vpAmount={issue.vpAmount}
      currentVP={issue.currentVP}
      topVP={issue.topVP}
      minVP={issue.minVP}
      issueTitle={issue.title}
      onApply={handleVPChange}
    />
  ) : null

  // Prepare actions with default className
  const defaultActionClassName = ' py-0 px-1 h-6 text-sm'
  const preparedActions = actions ? actions.map((action) => ({
    ...action,
    className: action.className ? action.className + defaultActionClassName : defaultActionClassName
  })) : []

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
          <Link uri={issue.uri} asNewTab={issue.storage !== 'arada-'}>
            <Badge variant='info' static={true}>
              <div className="flex items-center space-x-1">
                {getIcon(issue.storage as IconType || 'github')}
                <span className="text-xs font-medium">{issue.number}</span>
              </div>
            </Badge>
          </Link>
          {!isRatingIssue && nonRatingActions}
          {ratingActions}
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
                    {editable ? 'Title is editable for issue owners.' : 'Issue title'}
                  </div>
                }
              >
                <h1 className="text-xl font-bold text-gray-500 dark:text-slate-100 flex space-x-1 items-center gap-1">
                  {editable ? (
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
                  {editable ? <YourBadge saving={saving} label='issue' /> : <Badge variant='gray' static={true}>Not editable</Badge>}
                  {editable && <EditableBadge showEditBar={showEditBar} setShowEditBar={setShowEditBar} />}
                </h1>
              </Tooltip>
              {/* Voting power badge for arada- storage */}
              {issue.storage === 'arada-' && (
                <Badge variant={isRatingIssue ? 'success' : 'gray'} static={true}>
                  {isRatingIssue ? 'Rating Issue' : 'Non-Rating Issue'}
                </Badge>
              )}
            </div>
            <Badge
              variant={
                issue.type === 'bug' ? 'danger' :
                  issue.type === 'feature' ? 'blue' :
                    issue.type === 'improvement' ? 'success' :
                      issue.type === 'enhancement' ? 'warning' : 'info'
              }
              static={true}
            >
              {issue.type}
            </Badge>
          </div>

          {/* Description */}
          <div className="text-slate-700 dark:text-slate-200 text-md mb-4 prose max-w-none">
            <Tooltip
              openDelay={2000}
              content={
                <div className="text-sm">
                  {editable ? 'Description is editable for issue owners.' : 'Issue description'}
                </div>
              }
            >
              {editable ? (
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
          <div className="mb-4 text-slate-700">
            <h3 className="text-lg ">Technical Requirements:</h3>
            <Tooltip
              openDelay={2000}
              content={
                <div className="text-sm">
                  {editable ? 'Technical requirements are editable for issue owners.' : 'Technical requirements'}
                </div>
              }
            >
              {editable ? (
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

          {/* Author and created time */}
          {(issue.author || issue.createdTime) && (
            <div className="flex justify-end items-center space-x-1 text-gray-500 gap-1 text-xs mb-2">
              {issue.author && (
                <>
                  By {Array.isArray(issue.author) ? (
                    <AvatarList contributors={issue.author} showLastRating={true} />
                  ) : (
                    <>
                      <MenuAvatar src={issue.author?.icon} uri={issue.author?.uri} className='w-7! h-7!' />
                      {issue.author.rating && <ProfileRating {...issue.author.rating} />}
                    </>
                  )}
                </>
              )}
              {issue.createdTime && (
                <TimeAgo datetime={issue.createdTime} />
              )}
            </div>
          )}

          {/* Footer with actions and stats */}
          {(issue.stats || preparedActions.length > 0 || (issue.storage === 'arada-')) && (
            <PanelFooter className='flex flex-row justify-between items-center mt-2'>
              <div className="flex items-center gap-2">
                {preparedActions.length > 0 && <PanelAction className='' actions={preparedActions} />}
              </div>
              {issue.stats && Object.values(issue.stats).map((stat, index) => (
                <PanelStat
                  key={index}
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
