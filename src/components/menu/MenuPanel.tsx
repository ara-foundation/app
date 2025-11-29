import React from 'react'
import PageLikePanel from '@/components/panel/PageLikePanel'
import MenuItem from './MenuItem';
import GradientText from '@/components/GradientText';
import Tooltip from '@/components/custom-ui/Tooltip';
import { getIcon } from '@/components/icon';
import Link from '@/components/custom-ui/Link';
import Galaxy from '../Galaxy';

type MenuName = 'ihistory' | 'iwork' | 'balance' | 'cbalance' | 'project' | 'marketing' | 'work' | 'cwork' | 'guide' | 'dependencies' | 'roadmap' | 'issues' | 'share-btn' | 'donations';

interface Props {
  title?: string
  activeMenuItem: MenuName
  focusMenuItem?: MenuName
  onlyCustomChildren?: boolean
  children?: any
  projectIcon?: string
  projectName?: string
  starCount?: number
}

const isOnlyInfluencerMenu = (activeMenuItem: MenuName): boolean => {
  return activeMenuItem === 'ihistory' || activeMenuItem === 'iwork';
}

const GalaxyObject: React.FC<{
  projectIcon?: string
  projectName?: string
  starCount?: number
  active?: boolean
  focus?: boolean
}> = ({ projectIcon, projectName = 'CascadeFund', starCount = 0, active, focus }) => {
  const isZeroStars = starCount === 0;
  const starColorClass = isZeroStars ? 'text-rose-500' : '';

  const projectIconElement = projectIcon ? (
    <img
      src={projectIcon}
      alt={`${projectName} icon`}
      className="w-12 h-12 object-contain"
    />
  ) : (
    <div className="w-12 h-12 flex items-center justify-center">
      {getIcon({ iconType: 'cascadefund', width: 'w-12', height: 'h-12' })}
    </div>
  );

  const starIcon = getIcon({
    iconType: 'star-filled',
    width: 'w-5',
    height: 'h-5',
    className: starColorClass
  });

  const tooltipStarIcon = getIcon({
    iconType: 'star-filled',
    width: 'w-4',
    height: 'h-4',
    className: `inline ${starColorClass}`
  });

  const tooltipContent = (
    <div className="flex items-center gap-1">
      View the '{projectName}' galaxy {tooltipStarIcon} {starCount}
    </div>
  );

  return (
    <Tooltip content={tooltipContent} openDelay={300}>
      <div className="w-full">
        <Link
          uri="/data/project"
          className={`flex flex-col items-center justify-center py-4 px-3 rounded-sm cursor-pointer transition-colors relative ${active
            ? 'bg-blue-100 dark:bg-blue-700'
            : 'hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          focus={focus}
        >
          <div className="absolute top-0 left-0 right-0 bottom-0">
            <Galaxy mouseRepulsion={false} autoCenterRepulsion={1} glowIntensity={0.2} density={0.1} rotationSpeed={0.01} />
          </div>

          <div className="flex flex-col items-center gap-2 relative">
            {projectIconElement}
            <GradientText
              colors={['#ffaa40', '#9c40ff', '#ffaa40']}
              animationSpeed={8}
              className="font-semibold text-lg text-center"
            >
              {projectName}
            </GradientText>
            <div className={`flex items-center gap-1 ${starColorClass}`}>
              {starIcon}
              <span className={`text-sm font-medium ${starColorClass}`}>
                {starCount}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </Tooltip>
  );
}

const maintainerMainItems = (
  activeMenuItem: MenuName,
  focusMenuItem?: MenuName,
  projectIcon?: string,
  projectName?: string,
  starCount?: number
): React.ReactNode[] => {
  return [
    <GalaxyObject
      key="galaxy"
      projectIcon={projectIcon}
      projectName={projectName}
      starCount={starCount}
      active={activeMenuItem === 'project'}
      focus={focusMenuItem === 'project'}
    />,
  ]
}
const influencerMainItems = (activeMenuItem: MenuName, focusMenuItem?: MenuName): React.ReactNode[] => {
  return [
    <MenuItem
      icon="influencer-history"
      label="Transaction History"
      uri="/influencer/history"
      active={activeMenuItem === 'ihistory'}
      focus={focusMenuItem === 'ihistory'}
    />
  ]
}

const maintainerCollabItems = (activeMenuItem: MenuName, focusMenuItem?: MenuName): React.ReactNode[] => {
  return [
    <MenuItem
      icon="info"
      label="Guide"
      uri="/project/guide"
      active={activeMenuItem === 'guide'}
      focus={focusMenuItem === 'guide'}
    />,
    <MenuItem
      icon="connection"
      label="Dependencies"
      uri="/project/dependencies"
      active={activeMenuItem === 'dependencies'}
      focus={focusMenuItem === 'dependencies'}
    />,
    <MenuItem
      icon="navigation"
      label="Roadmap"
      uri="/project/roadmap"
      active={activeMenuItem === 'roadmap'}
      focus={focusMenuItem === 'roadmap'}
    />,
    <MenuItem
      icon="issue"
      label="Issues"
      uri="/project/issues"
      active={activeMenuItem === 'issues'}
      focus={focusMenuItem === 'issues'}
    />,
    <MenuItem
      icon="arrow-right"
      label="Share Button"
      uri="/project/share-btn"
      active={activeMenuItem === 'share-btn'}
      focus={focusMenuItem === 'share-btn'}
    />,
    <MenuItem
      icon="money"
      label="Donations"
      uri="/project/donations"
      active={activeMenuItem === 'donations'}
      focus={focusMenuItem === 'donations'}
    />
  ]
}
const influencerCollabItems = (activeMenuItem: MenuName, focusMenuItem?: MenuName): React.ReactNode[] => {
  return [
    <MenuItem
      icon="influencer-work"
      label="Influencer Work"
      uri="/influencer/work"
      focus={focusMenuItem === 'iwork'}
      active={activeMenuItem === 'iwork'}
    />
  ]
}


const noChildren = <div className="text-center py-8 text-gray-500 dark:text-gray-400">
  <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-400" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.58L19 8l-9 9z" />
  </svg>
  <p className="text-sm">No menu items available</p>
  <p className="text-xs text-gray-400 mt-1">Add some items to get started</p>
</div>

const Panel: React.FC<Props> = ({
  activeMenuItem,
  focusMenuItem,
  title = 'Main Menu',
  onlyCustomChildren = false,
  children,
  projectIcon,
  projectName,
  starCount
}) => {
  const titleC = <div className='text-sm font-medium   text-gray-500'>{title}</div>

  return <PageLikePanel interactive={false} title={titleC} >
    <div className="p-1 z-10 w-full overflow-hidden justify-between">
      {onlyCustomChildren && !children ? noChildren : children}
      {!onlyCustomChildren && (!isOnlyInfluencerMenu(activeMenuItem) ? maintainerMainItems(activeMenuItem, focusMenuItem, projectIcon, projectName, starCount) : influencerMainItems(activeMenuItem, focusMenuItem))}
      {!onlyCustomChildren &&
        (<>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 mt-3">Collaboration Menu</h3>
          <div className="p-1 w-full overflow-hidden justify-between">
            {!isOnlyInfluencerMenu(activeMenuItem) ? maintainerCollabItems(activeMenuItem, focusMenuItem) : influencerCollabItems(activeMenuItem, focusMenuItem)}
          </div>
        </>)}
    </div>
  </PageLikePanel>
}


export default Panel
