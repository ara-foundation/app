import React from 'react'
import Link from '../custom-ui/Link'
import { getIcon, IconType } from '../icon'
import type { Issue } from '@/scripts/issue'
import { getIssueStatIcon } from './utils'
import Badge from '../badge/Badge'
import PanelFooter from '../panel/PanelFooter'
import PanelStat from '../panel/PanelStat'
import MenuAvatar from '../MenuAvatar'
import TimeAgo from 'timeago-react';
import Button from '../custom-ui/Button'
import { ActionProps } from '@/types/eventTypes'
import PanelAction from '../panel/PanelAction'
import VotePopover from './VotePopover'
import ProfileRating from '../rating/ProfileRating'
import AvatarList from '../AvatarList'


const IssueLinkPanel4: React.FC<Issue & { actions?: ActionProps[] }> = (issue) => {
  // Determine if issue is shining (has sunshines > 0)
  const isShining = issue.sunshines !== undefined && issue.sunshines > 0;

  // Check if this is a rating issue (has voting power > 0) - legacy support
  const votingPower = issue.stats?.['voting-power']?.children
  const isRatingIssue = issue.storage === 'arada-' && votingPower && Number(votingPower) > 0

  // Handle VP change from VotePopover
  const handleVPChange = (newVP: number) => {
    console.log(`VP changed for issue ${issue.id}: ${newVP}`)
    // Here you would typically update the issue's VP in your state management
  }

  const nonRatingActions = <>
    <Button onClick={() => console.log('Liked')} variant="secondary" size="sm" className="h-7 px-2 text-xs">
      {getIcon({ iconType: 'likes', className: 'w-3 h-3 mr-1' })}
      Like
    </Button>
    <Button variant="secondary" size="sm" className="h-7 px-2 text-xs">
      {getIcon({ iconType: 'likes', className: 'w-3 h-3 mr-1' })}
      Dislike
    </Button>
    <Button variant="primary" size="sm" className="h-7 px-2 text-xs">
      {getIcon({ iconType: 'vote-priority', className: 'w-3 h-3 mr-1' })}
      Turn To Voting Power
    </Button>
  </>

  // Legacy VP support - only show if old VP properties exist
  const ratingActions = isRatingIssue && issue.vpAmount && issue.currentVP !== undefined && issue.topVP !== undefined && issue.minVP !== undefined ? (
    <VotePopover
      vpAmount={issue.vpAmount}
      currentVP={issue.currentVP}
      topVP={issue.topVP}
      minVP={issue.minVP}
      onApply={handleVPChange}
    />
  ) : null

  const defaultActionClassName = ' py-0 px-1 h-6 text-sm'
  if (Array.isArray(issue.actions) && issue.actions.length > 0) {
    issue.actions.map((action, i) => {
      issue.actions![i].className = action.className ? action.className + defaultActionClassName : defaultActionClassName
    })
  }

  return (
    <div className='flex flex-row gap-1 items-start w-full'>
      {/* Issue storage and number */}
      <div className="flex items-center space-x-3 mt-0.5">
        <Link uri={issue.uri} asNewTab={issue.storage !== 'arada-'}>
          <Badge variant='info' static={true}>
            <div className="flex items-center space-x-1">
              {getIcon(issue.storage as IconType || 'ara')}
              <span className="text-xs font-medium">{issue.number}</span>
            </div>
          </Badge>
        </Link>
      </div>

      <div className='w-full'>
        {/* Issue title and description */}
        <div className='flex justify-between items-center mb-1 ml-0.5'>
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-slate-700 dark:text-slate-300/80">{issue.title}</span>
            {/* Shining badge - based on sunshines */}
            {issue.sunshines !== undefined && (
              <Badge variant={isShining ? 'success' : 'gray'} static={true}>
                {isShining ? 'Shining' : 'Public Backlog'}
              </Badge>
            )}
            {/* Legacy voting power badge for arada- storage (if no sunshines) */}
            {issue.sunshines === undefined && issue.storage === 'arada-' && (
              <Badge variant={isRatingIssue ? 'success' : 'gray'} static={true}>
                {isRatingIssue ? 'Rating Issue' : 'Non-Rating Issue'}
              </Badge>
            )}
          </div>
          <Badge variant={issue.type === 'bug' ? 'danger' : issue.type === 'feature' ? 'blue' : issue.type === 'improvement' ? 'success' : issue.type === 'enhancement' ? 'warning' : 'info'} static={true}>
            {issue.type}
          </Badge>
        </div>
        <p className="text-base text-slate-600 dark:text-slate-400">{issue.description}</p>

        {/* Issue author and created time */}
        {(issue.author || issue.createdTime) &&
          <div className="flex justify-end items-center space-x-1 text-slate-500 dark:text-slate-900 gap-1 text-xs">
            {issue.author && <>
              By {Array.isArray(issue.author) ? (
                <AvatarList contributors={issue.author} showLastRating={true} />
              ) : (
                <>
                  <MenuAvatar src={issue.author?.icon} uri={issue.author?.uri} className='w-7! h-7!' />
                  {issue.author.rating && <ProfileRating {...issue.author.rating} />}
                </>
              )}
            </>}
            {issue.createdTime &&
              <TimeAgo datetime={issue.createdTime} />
            }
          </div>
        }

        {/* Issue status and actions */}
        {(issue.stats || issue.actions || (issue.storage === 'arada-')) &&
          <PanelFooter className='flex flex-row justify-between items-center mt-2'>
            <div className="flex items-center gap-2">
              {issue.actions && <PanelAction className='' actions={issue.actions} />}
              {ratingActions}
            </div>
            {/* Display sunshines if available */}
            {issue.sunshines !== undefined && (
              <PanelStat
                triggerClassName='text-sm'
                iconType="money"
                hint="Total sunshines"
                fill={true}
              >
                {issue.sunshines}
              </PanelStat>
            )}
            {/* Display users count if available */}
            {issue.usersCount !== undefined && (
              <PanelStat
                triggerClassName='text-sm'
                iconType="user"
                hint="Contributors"
                fill={true}
              >
                {issue.usersCount}
              </PanelStat>
            )}
            {issue.stats && Object.values(issue.stats).map((stat) => (
              <PanelStat
                key={stat.type}
                triggerClassName='text-sm'
                iconType={getIssueStatIcon(stat.type)}
                hint={stat.hint}
                fill={stat.filled}
              >
                {stat.children}
              </PanelStat>
            ))
            }
          </PanelFooter>}
      </div>
    </div>
  )
}

export default IssueLinkPanel4
