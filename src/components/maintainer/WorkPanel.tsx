import React from 'react'
import Tabs, { TabProps } from '../Tabs'
import IssueListPanel from '../issue/IssueListPanel'
import DropTarget from '../DropTarget'
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { getIcon } from '../icon';

interface WorkPanelProps {
  galaxyId: string
}

const C: React.FC<WorkPanelProps> = ({ galaxyId }) => {
  const tabs: TabProps[] = [
    {
      label: <><span className="text-amber-600 dark:text-amber-400 font-semibold">Shining issues</span></>,
      key: "funded-issues",
      content: <DndProvider backend={HTML5Backend}>
        <IssueListPanel title={'Shining Issues'} draggable={true} galaxyId={galaxyId} />
      </DndProvider>,
      className: 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
    },
    {
      label: <>Public Backlog</>,
      key: "public-issues",
      content: <DndProvider backend={HTML5Backend}>
        <IssueListPanel title={'Public Backlog'} draggable={true} galaxyId={galaxyId} />
      </DndProvider>
    },
    {
      label: <DndProvider backend={HTML5Backend}><DropTarget id="detailize-list" accept={["issue"]} onDrop={(e) => console.log(e)}>Interesting Issues</DropTarget></DndProvider>,
      key: "detailize",
      content: <DndProvider backend={HTML5Backend}>
        <IssueListPanel title={'Interesting Issues'} draggable={true} description="Interesting issues for the maintainer. It could mean anything, but basically its worth maintainer's attention" galaxyId={galaxyId} />
      </DndProvider>,
      className: ' p-0!',
    },
    {
      label: <DndProvider backend={HTML5Backend}><DropTarget id="hard-list" accept={["issue"]} onDrop={(e) => console.log(e)}>Boring Issues</DropTarget></DndProvider>,
      key: "hard",
      content: <DndProvider backend={HTML5Backend}>
        <IssueListPanel title={'Boring Issues'} draggable={true} description="Issues that are boring for the maintainer. It could be for any reason, but basically maintainer will not spend time on them." galaxyId={galaxyId} />
      </DndProvider>
    },
    {
      label: <DndProvider backend={HTML5Backend}><DropTarget id="closed-list" accept={["issue"]} onDrop={(e) => console.log(e)}><span className="flex items-center gap-1.5">{getIcon({ iconType: 'lock', className: 'w-4 h-4' })}Closed</span></DropTarget></DndProvider>,
      key: "closed",
      content: <IssueListPanel title={'Closed Issues'} galaxyId={galaxyId} />
    },
  ]

  return (
    <Tabs id="work" activeTab='funded-issues' tabs={tabs} />
  )
}

export default C
