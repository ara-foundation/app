import React from 'react'
import type { TabProps } from '@/components/Tabs'
import WorkStylePanel from './WorkStyleContent'
// import ProjectTimeAllocation from './ProjectTimeAllocationPanel'
import Tabs from '@/components/Tabs'
import { BasePanel } from '@/components/panel'

const Panel: React.FC = () => {
  const activeTabeKey = "workStyle";

  const tabs: TabProps[] = [
    {
      label: 'Availability & Work Style',
      key: "workStyle",
      content: <WorkStylePanel />,
    },
    // {
    //   label: 'Project Time Allocation',
    //   key: "projectTimeAllocation",
    //   content: <ProjectTimeAllocation />,
    // }
  ]

  return (
    <BasePanel>
      <WorkStylePanel />
    </BasePanel>
    // <Tabs id="profile-metrics" tabs={tabs} activeTab={activeTabeKey} />
  )
}

export default Panel
