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
import type { User } from '@/types/user'
import { Spinner } from '@/components/ui/shadcn-io/spinner'
import SunshinesPopover from './SunshinesPopover'
import { getDemo } from '@/client-side/demo'
import { updateIssueSunshines } from '@/client-side/issue'
import { getUserById } from '@/client-side/user'
import Tooltip from '../custom-ui/Tooltip'

interface IssueLinkProps extends Issue {
  actions?: ActionProps[];
  draggable?: boolean;
  patchable?: boolean;
  versionTag?: string;
  versionStatus?: 'complete' | 'testing' | 'release' | 'archived';
  patchCompleted?: boolean;
  patchTested?: boolean;
}

const IssueLinkPanel4: React.FC<IssueLinkProps> = (issue) => {
  const [authorUser, setAuthorUser] = useState<User | null>(null);
  const [isLoadingAuthor, setIsLoadingAuthor] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [availableSunshines, setAvailableSunshines] = useState(0);
  const [, setIsUpdating] = useState(false);

  // Determine if issue is shining (has sunshines > 0)
  const isShining = issue.sunshines > 0;
  const isPatchable = Boolean(issue.patchable) && !issue.versionTag; // Hide patchable if version info is present
  const hasVersionInfo = Boolean(issue.versionTag);

  // Get primary tag (first tag)
  const primaryTag = issue.tags && issue.tags.length > 0 ? issue.tags[0] : undefined;

  // Fetch author user by authorId
  useEffect(() => {
    if (issue.author && typeof issue.author === 'string') {
      setIsLoadingAuthor(true);
      getUserById(issue.author)
        .then((userData) => {
          if (userData) {
            setAuthorUser(userData);
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

  // Fetch current user and available sunshines (for non-draggable mode)
  useEffect(() => {
    if (!issue.draggable) {
      const demo = getDemo();
      if (demo.email && demo.users && demo.role) {
        const user = demo.users.find(u => u.role === demo.role) || demo.users[0];
        if (user && user._id) {
          getUserById(user._id.toString())
            .then((userData) => {
              if (userData) {
                setCurrentUser(userData);
                setAvailableSunshines(userData.sunshines || 0);
              }
            })
            .catch((error) => {
              console.error('Error fetching current user:', error);
            });
        }
      }
    }
  }, [issue.draggable]);

  // Handle sunshines update
  const handleSunshinesUpdate = async (newSunshines: number) => {
    if (!currentUser || !issue._id || !issue.galaxy) return;

    const sunshinesToAdd = newSunshines - issue.sunshines;
    if (sunshinesToAdd <= 0) return;

    setIsUpdating(true);
    try {
      const demo = getDemo();
      if (!demo.email) {
        alert('Please log in to add sunshines');
        return;
      }

      const success = await updateIssueSunshines({
        issueId: issue._id,
        userId: currentUser._id!.toString(),
        email: demo.email,
        sunshinesToAdd,
      });

      if (success) {
        // Also update available sunshines
        if (currentUser._id) {
          const updatedUser = await getUserById(currentUser._id.toString());
          if (updatedUser) {
            setAvailableSunshines(updatedUser.sunshines || 0);
          }
        }
      } else {
        alert('Failed to update sunshines');
      }
    } catch (error) {
      console.error('Error updating sunshines:', error);
      alert('An error occurred while updating sunshines');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className='flex flex-row gap-1 items-start w-full'>
      {/* Issue storage and number */}
      <div className="flex items-center space-x-3 mt-0.5">

        <Tooltip
          content={
            <div className="text-sm flex gap-1">
              Got to see the  {getIcon({ iconType: 'arrow-right', className: 'w-4 h-4 mt-0.5' })}
              <p className='flex-1 bg-slate-100/20 rounded-sm'>
                {issue.title}
              </p>
              {getIcon({ iconType: 'arrow-left', className: 'w-4 h-4 mt-0.5' })}
              issue page
            </div>
          }
        >
          <Link uri={`/issue?id=${issue._id!}&galaxy=${issue.galaxy}`} asNewTab={false}>
            <Badge variant='info' static={true}>
              <div className="flex items-center space-x-1">
                {getIcon('ara')}
                <span className="text-xs font-medium underline">...</span>
              </div>
            </Badge>
          </Link>
        </Tooltip>
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
            {hasVersionInfo ? (
              <Tooltip
                content={
                  <div className="text-sm flex flex-col gap-2 p-2 max-w-xs">
                    <div>
                      Issue is patched. Patch completed {String(issue.patchCompleted)}, patch reviewed: '{issue.patchTested ? 'tested' : 'not tested'}'. Its on the roadmap. In the <span className="font-semibold">{issue.versionTag}</span> version. Version next status: <span className="font-semibold">{issue.versionStatus}</span>
                    </div>
                  </div>
                }
              >
                <div className="flex items-center gap-2">
                  <Badge variant='info' static={true}>
                    {issue.versionTag}
                  </Badge>
                  <Badge
                    variant={
                      issue.versionStatus === 'complete' ? 'blue' :
                        issue.versionStatus === 'testing' ? 'warning' :
                          issue.versionStatus === 'release' ? 'teal' :
                            issue.versionStatus === 'archived' ? 'green' :
                              'gray'
                    }
                    static={true}
                  >
                    {issue.versionStatus}
                  </Badge>
                </div>
              </Tooltip>
            ) : isPatchable && (
              <Tooltip
                content={
                  <div className="text-sm max-w-xs leading-snug">
                    This issue is patchable. Drag and drop into Patching hole.
                  </div>
                }
              >
                <Badge
                  variant='orange'
                  static={true}
                  className="cursor-pointer select-none shadow-sm"
                >
                  <span className="flex items-center gap-1">
                    Patchable {getIcon('info')}
                  </span>
                </Badge>
              </Tooltip>
            )}
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
            {/* Display sunshines - clickable when not draggable */}
            {issue.sunshines >= 0 && (
              !issue.draggable && currentUser ? (
                <SunshinesPopover
                  availableSunshines={availableSunshines}
                  currentSunshines={issue.sunshines}
                  issueId={issue._id || ''}
                  galaxyId={issue.galaxy}
                  userId={currentUser._id!.toString()}
                  onApply={handleSunshinesUpdate}
                />
              ) : (
                <PanelStat
                  triggerClassName='text-sm cursor-pointer hover:opacity-80 transition-opacity'
                  iconType="sunshine"
                  hint={
                    <div className="text-sm space-y-3">
                      <div className="font-semibold">Total sunshines: {issue.sunshines}</div>
                      <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-4xl">
                          {getIcon({ iconType: 'star', className: 'w-10 h-10 text-yellow-400 dark:text-yellow-500', fill: 'currentColor' })}
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{Math.floor(issue.sunshines / 360)}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Potential Stars</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">({issue.sunshines} ÷ 360)</div>
                        </div>
                      </div>
                    </div>
                  }
                  fill={true}
                >
                  {issue.sunshines}
                </PanelStat>
              )
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
