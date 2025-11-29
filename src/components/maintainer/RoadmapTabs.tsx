import React from 'react'
import Tabs, { TabProps } from '../Tabs'
import Badge from '../badge/Badge'
import { ProjectVersionProps } from '../project/ProjectVersionPanel';
import RoadmapPanel from './RoadmapPanel'
import { Popover } from '@base-ui-components/react/popover';


const RoadmapTabs: React.FC = () => {
  const notificationBanner = <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
    <div className="flex items-center space-x-2 mb-2">
      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
      <span className="text-sm font-medium text-green-800">Marked as complete!</span>
    </div>
    <p className="text-xs text-green-700">
      Wow! Informed 5 people who were waiting for this release.
    </p>
  </div>

  const archive: ProjectVersionProps[] = [
    {
      version: "v2.4.0",
      authors: ["ahmetson"],
      date: Date.now() - 2 * 365 * 24 * 60 * 60 * 1000, // 2 years ago
      status: "completed",
      features: [
        "Discovered authentication system",
        "New dashboard experience",
        "Performance optimizations"
      ],
      completedIssues: 3,
      totalIssues: 3
    }
  ]
  const versions: ProjectVersionProps[] = [{
    version: "v2.5.0",
    authors: ["ahmetson"],
    date: Date.now() - 1 * 365 * 24 * 60 * 60 * 1000, // 1 year ago
    status: "active",
    features: [
      "Dark mode implementation",
      "Tablet responsive layout fixes",
      "Google Calendar integration"
    ],
    completedIssues: 1,
    totalIssues: 3
  }, {
    version: "v2.6.0",
    date: Date.now() - 2 * 365 * 24 * 60 * 60 * 1000, // 2 years ago
    authors: ["ahmetson"],
    status: "planned",
    features: [
      "Advanced filtering options",
      "API rate limit improvements"
    ],
    completedIssues: 0,
    totalIssues: 2
  }]

  const actions = [
    {
      className: "",
      variant: "secondary",
      children: "New version",
      popoverContent: "Form to add another version"
    }
  ]

  const tabs: TabProps[] = [
    {
      label: <div className=''>Roadmap <Badge variant='gray'>{versions.length}</Badge></div>,
      key: "roadmap",
      content: <RoadmapPanel actions={actions} versions={versions} />
    },
    {
      label: <div className=''>Archive <Badge variant='gray'>{archive.length}</Badge></div>,
      key: "archive",
      content: <RoadmapPanel versions={archive} />
    },
  ]

  return (
    <Tabs id="versions" activeTab='roadmap' tabs={tabs} />
  )
}

export default RoadmapTabs
