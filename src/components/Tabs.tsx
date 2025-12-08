import React, { useEffect, useState } from 'react'
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from '@/components/animate-ui/primitives/animate/tabs';

export type TabProps = {
  label: string | React.ReactNode,
  href?: string,
  key: string,
  content: React.ReactNode
  className?: string
}

interface Props {
  activeTab: string
  tabs: TabProps[]
  onTabChange?: (tab: string) => void
}

const C: React.FC<Props> = ({ activeTab: initialTab, tabs, onTabChange }) => {
  const [activeTab, setTab] = useState<string>(initialTab);
  const baseClassName = "flex-1 rounded-md hover:bg-accent/50 rounded-b-none hover:border-b-2 hover:border-blue-500 hover:shadow-md backdrop-blur-sm"

  useEffect(() => {
    onTabChange?.(activeTab)
  }, [activeTab])

  return (
    <Tabs
      onValueChange={setTab}
      value={activeTab as any} className="relative mb-6 bg-blue-100 dark:bg-transparent text-slate-600 dark:text-slate-400 py-1 backdrop-blur-sm">
      <TabsHighlight className="">
        <TabsList className="h-10 inline-flex p-0 w-full backdrop-blur-sm bg-white/50 dark:bg-slate-900/50">
          {tabs.map((tab) =>
            <TabsHighlightItem key={tab.key} value={tab.key} className={baseClassName + (activeTab === tab.key ? ' bg-white dark:bg-slate-700 shadow-none shadow-b-none' : 'bg-blue-200/50 dark:bg-slate-800/50 border-b-2 border-blue-200/50 dark:border-slate-700/50')}>
              <TabsTrigger
                value={tab.key}
                className={"hyperlink h-full leading-0 w-full text-sm text-blue-500 dark:text-blue-300 cursor-pointer " + (tab.className || '')}
              >
                {tab.label}
              </TabsTrigger>
            </TabsHighlightItem>
          )}
        </TabsList>
      </TabsHighlight>
      <TabsContents
        className="bg-gray-50 dark:bg-slate-800/70 p-0 h-80 m-0 rounded-b-xl"
      >
        {tabs.map((tab) =>
          <TabsContent value={tab.key} className="space-y-4">
            {tab.content}
          </TabsContent>
        )}
      </TabsContents>
    </Tabs>
  )
}

export default C
