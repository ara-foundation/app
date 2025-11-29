import React from 'react'
import PageLikePanel from '@/components/panel/PageLikePanel'
import Button from '../custom-ui/Button'
import Tooltip from '../custom-ui/Tooltip'
import { getIcon } from '../icon'
import PanelFooter from '../panel/PanelFooter'
import PanelStat from '../panel/PanelStat'
import TimeAgo from 'timeago-react'
import NumberFlow from '@number-flow/react'
import * as RadixSlider from '@radix-ui/react-slider'
import { Checkbox, CheckboxIndicator } from '@/components/animate-ui/primitives/radix/checkbox'
import ByAuthor from '../ByAuthor'
import { ProfileLink } from '../profile/types'

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
      case 'completed': return 'bg-green-100/10 dark:bg-green-900/20 border-green-300 dark:border-green-500/30'
      case 'active': return 'bg-blue-100/10 dark:bg-blue-900/20 border-blue-300 dark:border-blue-500/30'
      case 'planned': return 'bg-purple-100/10 dark:bg-purple-900/20 border-purple-300 dark:border-purple-500/30'
      default: return 'bg-slate-100/10 dark:bg-slate-900/20 border-slate-300 dark:border-slate-500/30'
    }
  }

  // Convert authors string array to ProfileLink format for ByAuthor component
  const authorProfile: ProfileLink | undefined = authors.length > 0 ? {
    uri: `/profile/${authors[0]}`,
    children: authors[0]
  } : undefined

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
      {completedIssues !== undefined && totalIssues !== undefined && (
        <div className="">
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
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center space-x-2">
              <Checkbox
                checked={status === 'completed'}
                disabled
                className="w-4 h-4 rounded-sm border-2 border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-600 data-[state=checked]:bg-slate-600 dark:data-[state=checked]:bg-slate-400 data-[state=checked]:border-slate-600 dark:data-[state=checked]:border-slate-400 flex items-center justify-center"
              >
                <CheckboxIndicator className="w-3 h-3 text-white dark:text-slate-700" />
              </Checkbox>
              <span className="text-sm text-slate-700 dark:text-slate-400">{feature}</span>
            </li>
          ))}
        </ul>
        {/* Author and date at bottom right */}
        <ByAuthor author={authorProfile} createdTime={date} />
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
