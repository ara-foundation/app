import React from 'react'
import type { TabProps } from '@/components/Tabs'
import Tabs from '@/components/Tabs'
import BasePanel from '@/components/panel/Panel'
import NetworkingPanel from './NetworkingPanel'

const Panel: React.FC = () => {
  const activeTabeKey = "topSupporters";

  const tabs: TabProps[] = [
    {
      label: 'Top Supporters',
      key: "topSupporters",
      content: <NetworkingPanel />,
    },
    {
      label: 'Similar Profiles',
      key: "similarProfiles",
      content: <NetworkingPanel />,
    }
  ]

  return (
    <BasePanel>
      <Tabs id="discover-profiles" tabs={tabs} activeTab={activeTabeKey} />
    </BasePanel>
  )
}

export default Panel
