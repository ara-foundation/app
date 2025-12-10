import React from 'react'
import Badge from '@/components/badge/Badge'
import InfoPair from '../InfoPair'
import BasePanel from '../panel/Panel'
import Followings from '../social-network/Followings'
import ProjectRating, { ProjectRatingProps } from '../rating/ProjectRating'
import PanelFooter from '../panel/PanelFooter'
import PanelStat from '../panel/PanelStat'
import Link from '../custom-ui/Link'
import { ProfileLink } from '../../types/user'
import MenuAvatar from '../MenuAvatar'
import TimeAgo from 'timeago-react'
import { ActionProps } from '@/types/eventTypes'
import PanelAction from '../panel/PanelAction'
import AvatarList from '../AvatarList'
import { Popover } from '@base-ui-components/react/popover'
import { getIcon } from '../icon'
import { UserStarData } from '../all-stars/Space'

export interface ProjectInfoProps {
  uri?: string
  title: string
  isInfluencer: boolean
  rating: ProjectRatingProps
  forks: number
  likes: number
  isFollowing: boolean
  originalProject: string
  originalProjectUrl: string
  followers: number
  issue: string
  description: string
  license: string
  balance: number
  version?: string
  cascadeBalance: number
  totalAmount: number
  duration: string
  lastActivity: number
  totalCommits: number
  commitsPerDay: string
  openIssues: number
  closedIssues: number
  avgResponseTime: string

  createdTime: number
  author: ProfileLink
  stars: UserStarData[]
  actions?: ActionProps[]  // Comes links to the work, and cascade work along with their badges
  projectGoal?: number  // Total stars needed to turn project into galaxy
}

const ProjectCard: React.FC<ProjectInfoProps> = ({
  uri,
  title,
  isInfluencer,
  rating,
  forks,
  version,
  likes,
  isFollowing,
  followers,
  originalProject,
  originalProjectUrl,
  issue,
  description,
  license,
  balance,
  cascadeBalance,
  totalAmount,
  duration,
  lastActivity,
  totalCommits,
  commitsPerDay,
  openIssues,
  closedIssues,
  avgResponseTime,
  createdTime,
  author,
  stars,
  actions
}) => {
  // Convert UserStarData to ProfileLink for AvatarList
  const influencers: ProfileLink[] = stars.map(star => ({
    uri: star.uri || '#',
    children: star.nickname,
    icon: star.src,
    avatar: star.src,
    name: star.nickname,
    rating: star.stars ? {
      ratingType: star.role === 'Maintainer' ? 'maintainer' : star.role === 'Influencer' ? 'influencer' : 'contributor',
      lvl: Math.floor(star.stars * 2),
      maxLvl: 10,
      top: 0
    } : undefined
  }))
  return (
    <Link uri={uri || '#'}>
      <BasePanel
        bg="bg-white/50 dark:bg-slate-900/50"
        className='mb-4 hover:bg-white dark:hover:bg-slate-900 hover:border-blue-500/20 transition-colors'
      >
        <div className="flex items-start space-x-4">
          <div className="absolute w-20 bottom-1 overflow-hidden">
            <Followings following={isFollowing} followers={followers} onActionClick={() => { }} />
          </div>

          <div className="ml-22 flex-1 w-full">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold text-slate-600 dark:text-slate-400 flex items-center space-x-1">
                {title}
                {isInfluencer && (
                  <Badge variant="info" className='mx-2 -mt-1.9'>Donator</Badge>
                )}
                {version && (
                  <Badge variant="info" className='mx-2 -mt-1.9'>{version}</Badge>
                )}
              </h1>

              <div className="flex text-right flex-col">
                <ProjectRating
                  {...rating}
                />
              </div>
            </div>

            <div className="text-md mb-4 text-slate-600 dark:text-slate-400">
              {description}
            </div>

            {/* Issue author and created time */}
            <div className="flex justify-end items-center space-x-1 text-slate-600 dark:text-slate-400 gap-1 text-xs">
              By <MenuAvatar src={author?.icon} uri={author?.uri} className='w-7! h-7!' />
              {createdTime &&
                <TimeAgo datetime={createdTime} />
              }
            </div>


            <PanelFooter className='flex flex-row justify-between items-center space-x-4 mt-2'>
              <div className="flex items-center gap-2">
                <PanelAction className='' actions={actions} />
              </div>
              <PanelStat iconType="project" hint={`License of this project.`} fill={true}>{license} Llicense</PanelStat>
              <PanelStat
                iconType="fork"
                hint={`How many forks this project has.`}
                fill={true}
              >
                {forks} Forks
              </PanelStat>
              <PanelStat
                iconType="heart"
                hint={`How many people has interest in this project`}
                fill={true}
              >
                {likes} Likes
              </PanelStat>

              <Popover.Root>
                <Popover.Trigger onClick={(e) => { e.stopPropagation(); e.preventDefault(); }} className="hyperlink flex items-center justify-center shadow-none">
                  <PanelStat
                    iconType="info"
                    hint={`Additional stats`}
                    fill={true} children={'More'}              >
                  </PanelStat>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Positioner sideOffset={8} side='bottom' className={'z-700!'}>
                    <Popover.Popup className="w-96 origin-[var(--transform-origin)] rounded-xs bg-[canvas] px-6 py-4 text-gray-900 shadow-sm shadow-gray-900 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0">
                      <Popover.Arrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
                        {getIcon('arrow')}
                      </Popover.Arrow>

                      <Popover.Title className="text-gray-500 font-medium text-md flex items-center flex-row p-1 mb-4">
                        Additional statistics
                      </Popover.Title>

                      <Popover.Description className="text-gray-600">
                        <div className="text-gray-600 text-sm mb-2 flex flex-row justify-start items-center gap-2">
                          <PanelStat iconType="fork" hint={`Fork of ${originalProject}`} fill={true}>Fork of <Link uri={originalProjectUrl} asNewTab={true}>{originalProject}</Link></PanelStat>
                          <PanelStat iconType="issue" hint={`Original project issue that this project addresses.`} fill={true}>{issue} Issue</PanelStat>
                        </div>
                        <InfoPair
                          title1="Balance"
                          value1={balance}
                          title2="Cascade Balance"
                          value2={cascadeBalance}
                          belowThresholdColor={10}
                          footer={`${totalAmount} / ${duration}`}
                        />

                        <InfoPair
                          title1="Online"
                          value1={lastActivity}
                          type1="time"
                          title2="Commits"
                          value2={totalCommits}
                          type2="number"
                          footer={`${commitsPerDay} commits / day`}
                        />

                        <InfoPair
                          title1="Issues"
                          value1={openIssues}
                          type1="number"
                          title2="Closed Issues"
                          value2={closedIssues}
                          type2="number"
                          footer={`avg. ${avgResponseTime}`}
                        />
                        <PanelFooter>
                          <PanelStat
                            iconType="info"
                            hint={`Project influencers`}
                            fill={true}
                          >
                            <AvatarList contributors={influencers} />
                          </PanelStat>
                        </PanelFooter>
                      </Popover.Description>
                    </Popover.Popup>
                  </Popover.Positioner>
                </Popover.Portal>
              </Popover.Root>

            </PanelFooter>
          </div>
        </div>
      </BasePanel>
    </Link>
  )
}

export default ProjectCard
