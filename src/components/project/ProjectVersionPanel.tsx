import React from 'react'
import PageLikePanel from '@/components/panel/PageLikePanel'
import Button from '../custom-ui/Button'
import AvatarList from '../AvatarList'
import { getIcon } from '../icon'
import PanelFooter from '../panel/PanelFooter'
import PanelStat from '../panel/PanelStat'
import TimeAgo from 'timeago-react'
import NumberFlow from '@number-flow/react'
import * as RadixSlider from '@radix-ui/react-slider'

export interface ProjectVersionProps {
  version: string
  date: number
  status: 'completed' | 'active' | 'planned'
  features: string[]
  completedIssues?: number
  totalIssues?: number
  authors: string[]
}

const ProjectVersionPanel: React.FC<ProjectVersionProps> = ({
  version,
  date,
  status,
  features,
  completedIssues,
  totalIssues,
  authors
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100/10 dark:bg-green-900/10 border-green-300 dark:border-green-500/10'
      case 'active': return 'bg-blue-100/10 dark:bg-blue-900/10 border-blue-300 dark:border-blue-500/10'
      case 'planned': return 'bg-purple-100/10 dark:bg-purple-900/10 border-purple-300 dark:border-purple-500/10'
      default: return 'bg-gray-100/10 dark:bg-gray-900/10 border-gray-300 dark:border-gray-500/10'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Archived'
      case 'active': return 'Mark as released'
      case 'planned': return 'Check'
      default: return 'Check'
    }
  }

  return (
    <PageLikePanel
      interactive={false}
      title={version}
      rightHeader={
        status !== 'completed' &&
        <Button variant='secondary' disabled={false}>
          {getStatusText(status)}
        </Button>
      }
      className={`w-full ${getStatusColor(status)} mb-4`}
    >
      <div className="flex items-center justify-between mb-2">
        {status === 'active' ? <AvatarList contributors={[]} /> :
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
            <span className="text-xs text-gray-600">{authors[0]}</span>
          </div>}
      </div>

      {completedIssues !== undefined && totalIssues !== undefined && (
        <div className="mb-3">
          {/* Slider Labels */}
          <div className="flex items-center mt-8 text-sm">
            <div
              style={{ "--my-padding-left": `10%` }}
              className={`flex flex-col items-center ml-[var(--my-padding-left)]`}>
              <span className="absolute -mt-4 text-gray-500 text-xs w-10 text-center">Completed</span>
              <NumberFlow
                value={completedIssues}
                locales="en-US"
                format={{ useGrouping: false }}
                className="font-semibold"
              />
            </div>
            <div style={{ "--my-padding-left": `50%` }}
              className={`flex flex-col items-center ml-[var(--my-padding-left)]`}>
              <span className="absolute -mt-4 text-gray-500 text-xs w-24 text-center">Total Amount</span>
              <NumberFlow
                value={totalIssues}
                locales="en-US"
                format={{ useGrouping: false }}
                className="font-semibold -ml-8"
              />
            </div>
          </div>

          {/* Slider */}
          <div className="mb-4">
            <RadixSlider.Root
              value={[completedIssues]}
              onValueChange={() => { }}
              max={totalIssues}
              min={0}
              step={1}
              className="relative flex h-5 w-full touch-none select-none items-center"
            >
              <RadixSlider.Track className="relative h-[3px] grow rounded-full bg-zinc-300 dark:bg-zinc-800">
                <RadixSlider.Range className="absolute h-full rounded-full bg-black dark:bg-white" />
                {/* Dashed line from original position when dragging */}
                {/* {hasChanged && (
                                            <div
                                                className="absolute h-full border-l-2 border-dashed border-gray-400 opacity-50"
                                                style={{ left: `${(originalVP / maxVP) * 100}%` }}
                                            />
                                        )} */}
              </RadixSlider.Track>
              <RadixSlider.Thumb className="relative hyperlink block h-5 w-5 rounded-[1rem] bg-white shadow-md ring ring-black/10">
                <NumberFlow
                  value={completedIssues}
                  locales="en-US"
                  format={{ useGrouping: false }}
                  className="absolute  left-1/2 -translate-x-1/2 text-xs text-gray-500 font-semibold"
                />
              </RadixSlider.Thumb>
            </RadixSlider.Root>
          </div>
        </div>
      )}

      <div className="mb-3">
        <h4 className="text-sm mb-1">
          {status === 'completed' ? 'Completed Issues:' : 'Planned Features:'}
        </h4>
        <ul className="space-y-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-300 rounded-sm flex items-center justify-center">
                {status === 'completed' && getIcon({ iconType: 'check', fill: 'currentColor' })}
              </div>
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <PanelFooter>
        <PanelStat
          iconType="clock"
          hint="Date of the version"
          fill={true}
        >
          {!date ? 'N/A' :
            <TimeAgo datetime={new Date(date * 1000)} />
          }
        </PanelStat>
        <PanelStat
          iconType="heart"
          hint="Likes of the version"
          fill={true}
        >
          15
        </PanelStat>
        <PanelStat
          iconType="energy"
          hint="Energy of the version"
          fill={true}
        >
          12
        </PanelStat>
        <PanelStat
          iconType={status === 'completed' ? 'star' : 'project'}
          hint="Stars of the version"
          fill={status === 'completed' ? true : false}
        >
          {status === 'completed' ? '1.2' : status}
        </PanelStat>
      </PanelFooter>

    </PageLikePanel>
  )
}

export default ProjectVersionPanel
