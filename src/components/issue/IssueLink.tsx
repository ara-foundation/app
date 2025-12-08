import React, { useState, useEffect } from 'react'
import Link from '../custom-ui/Link'
import { getIcon } from '../icon'
import type { Issue } from '@/types/issue'
import { getIssueStatIcon } from './utils'
import Badge from '../badge/Badge'
import PanelFooter from '../panel/PanelFooter'
import PanelStat from '../panel/PanelStat'
import MenuAvatar from '../MenuAvatar'
import TimeAgo from 'timeago-react';
import { ActionProps } from '@/types/eventTypes'
import PanelAction from '../panel/PanelAction'
import ProfileRating from '../rating/ProfileRating'
import { actions } from 'astro:actions'
import type { User } from '@/types/user'
import { Spinner } from '@/components/ui/shadcn-io/spinner'

const IssueLinkPanel4: React.FC<Issue & { actions?: ActionProps[] }> = (issue) => {
  const [authorUser, setAuthorUser] = useState<User | null>(null);
  const [isLoadingAuthor, setIsLoadingAuthor] = useState(false);

  // Determine if issue is shining (has sunshines > 0)
  const isShining = issue.sunshines > 0;

  // Get issue number from _id
  const issueNumber = issue._id ? `#${issue._id.slice(-6)}` : '#0';

  // Get primary tag (first tag)
  const primaryTag = issue.tags && issue.tags.length > 0 ? issue.tags[0] : undefined;

  // Fetch author user by authorId
  useEffect(() => {
    if (issue.author && typeof issue.author === 'string') {
      setIsLoadingAuthor(true);
      actions.getUserById({ userId: issue.author })
        .then((result) => {
          if (result.data?.success && result.data.data) {
            setAuthorUser(result.data.data);
          }
        })
        .catch((error) => {
          console.error('Error fetching author:', error);
        })
        .finally(() => {
          setIsLoadingAuthor(false);
        });
    }
  }, [issue.author]);

  return (
    <div className='flex flex-row gap-1 items-start w-full'>
      {/* Issue storage and number */}
      <div className="flex items-center space-x-3 mt-0.5">
        <Link uri={issue.uri} asNewTab={false}>
          <Badge variant='info' static={true}>
            <div className="flex items-center space-x-1">
              {getIcon('ara')}
              <span className="text-xs font-medium">{issueNumber}</span>
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
            <Badge variant={isShining ? 'success' : 'gray'} static={true}>
              {isShining ? 'Shining' : 'Public Backlog'}
            </Badge>
          </div>
          {primaryTag && (
            <Badge variant={
              primaryTag === 'bug' ? 'danger' :
                primaryTag === 'feature' ? 'blue' :
                  primaryTag === 'improvement' ? 'success' :
                    primaryTag === 'enhancement' ? 'warning' :
                      'info'
            } static={true}>
              {primaryTag}
            </Badge>
          )}
        </div>
        <p className="text-base text-slate-600 dark:text-slate-400">{issue.description}</p>

        {/* Issue author and created time */}
        {(issue.author || issue.createdTime) &&
          <div className="flex justify-end items-center space-x-1 text-slate-600 dark:text-slate-400 gap-1 text-xs">
            {issue.author && (
              <>
                By {isLoadingAuthor ? (
                  <div className="w-7 h-7 flex items-center justify-center">
                    <Spinner className='w-7 h-7' variant='ellipsis' />
                  </div>
                ) : authorUser ? (
                  <MenuAvatar user={authorUser} className='w-7! h-7!' />
                ) : null}
              </>
            )}
            {issue.createdTime &&
              <TimeAgo datetime={issue.createdTime * 1000} />
            }
          </div>
        }

        {/* Issue status and actions */}
        {(issue.stats || issue.actions || issue.sunshines >= 0) &&
          <PanelFooter className='flex flex-row justify-between items-center mt-2'>
            <div className="flex items-center gap-2">
              {issue.actions && <PanelAction className='' actions={issue.actions} />}
            </div>
            {/* Display sunshines */}
            {issue.sunshines >= 0 && (
              <PanelStat
                triggerClassName='text-sm'
                iconType="sunshine"
                hint="Total sunshines"
                fill={true}
              >
                {issue.sunshines}
              </PanelStat>
            )}
            {/* Display users count if available */}
            {issue.users && issue.users.length > 0 && (
              <PanelStat
                triggerClassName='text-sm'
                iconType="user"
                hint="Contributors"
                fill={true}
              >
                {issue.users.length}
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
