import React, { useState, useEffect } from 'react'
import Tabs, { TabProps } from '../Tabs'
import IssueListPanel from '../issue/IssueListPanel'
import DropTarget from '../DropTarget'
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { getIcon } from '../icon';
import { getDemo } from '@/demo-runtime-cookies/client-side'
import { DEMO_EVENT_TYPES } from '@/demo-runtime-cookies/index'
import { actions } from 'astro:actions'
import type { User } from '@/types/user'

interface WorkPanelProps {
  galaxyId: string
}

const C: React.FC<WorkPanelProps> = ({ galaxyId }) => {
  const [, setCurrentUser] = useState<User | null>(null);
  const [isMaintainer, setIsMaintainer] = useState(false);

  // Check user role and listen for changes
  useEffect(() => {
    const checkUserRole = async () => {
      const demo = getDemo();
      if (demo.email && demo.users && demo.role) {
        const user = demo.users.find(u => u.role === demo.role) || demo.users[0];
        if (user && user._id) {
          const result = await actions.getUserById({ userId: user._id.toString() });
          if (result.data?.success && result.data.data) {
            setCurrentUser(result.data.data);
            setIsMaintainer(result.data.data.role === 'maintainer');
          }
        }
      }
    };

    checkUserRole();

    // Listen for role changes
    const handleRoleChange = () => {
      checkUserRole();
    };

    window.addEventListener(DEMO_EVENT_TYPES.ROLE_CHANGED, handleRoleChange);
    return () => {
      window.removeEventListener(DEMO_EVENT_TYPES.ROLE_CHANGED, handleRoleChange);
    };
  }, []);

  const tabs: TabProps[] = isMaintainer ? [
    {
      label: <><span className="text-amber-600 dark:text-amber-400 font-semibold">Shining issues</span></>,
      key: "shining",
      content: <DndProvider backend={HTML5Backend}>
        <IssueListPanel title={'Shining Issues'} draggable={true} galaxyId={galaxyId} />
      </DndProvider>,
      className: 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
    },
    {
      label: <>Public Backlog</>,
      key: "public",
      content: <DndProvider backend={HTML5Backend}>
        <IssueListPanel title={'Public Backlog'} draggable={true} galaxyId={galaxyId} />
      </DndProvider>
    },
    {
      label: <DndProvider backend={HTML5Backend}><DropTarget id="detailize-list" accept={["issue"]} onDrop={(e) => console.log(e)}>Interesting Issues</DropTarget></DndProvider>,
      key: "interesting",
      content: <DndProvider backend={HTML5Backend}>
        <IssueListPanel title={'Interesting Issues'} draggable={true} description="Interesting issues for the maintainer. It could mean anything, but basically its worth maintainer's attention" galaxyId={galaxyId} />
      </DndProvider>,
      className: ' p-0!',
    },
    {
      label: <DndProvider backend={HTML5Backend}><DropTarget id="hard-list" accept={["issue"]} onDrop={(e) => console.log(e)}>Boring Issues</DropTarget></DndProvider>,
      key: "boring",
      content: <DndProvider backend={HTML5Backend}>
        <IssueListPanel title={'Boring Issues'} draggable={true} description="Issues that are boring for the maintainer. It could be for any reason, but basically maintainer will not spend time on them." galaxyId={galaxyId} />
      </DndProvider>
    },
    {
      label: <DndProvider backend={HTML5Backend}><DropTarget id="closed-list" accept={["issue"]} onDrop={(e) => console.log(e)}><span className="flex items-center gap-1.5">{getIcon({ iconType: 'lock', className: 'w-4 h-4' })}Closed</span></DropTarget></DndProvider>,
      key: "closed",
      content: <IssueListPanel title={'Closed Issues'} galaxyId={galaxyId} />
    },
  ] : [
    {
      label: <><span className="text-amber-600 dark:text-amber-400 font-semibold">Shining issues</span></>,
      key: "shining",
      content: <IssueListPanel title={'Shining Issues'} draggable={false} galaxyId={galaxyId} />,
      className: 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
    },
    {
      label: <>Public Backlog</>,
      key: "public",
      content: <IssueListPanel title={'Public Backlog'} draggable={false} galaxyId={galaxyId} />
    },
    {
      label: <>Interesting Issues</>,
      key: "interesting",
      content: <IssueListPanel title={'Interesting Issues'} draggable={false} description="Interesting issues for the maintainer. It could mean anything, but basically its worth maintainer's attention" galaxyId={galaxyId} />
    },
    {
      label: <>Boring Issues</>,
      key: "boring",
      content: <IssueListPanel title={'Boring Issues'} draggable={false} description="Issues that are boring for the maintainer. It could be for any reason, but basically maintainer will not spend time on them." galaxyId={galaxyId} />
    },
    {
      label: <>Closed Issues</>,
      key: "closed",
      content: <IssueListPanel title={'Closed Issues'} galaxyId={galaxyId} />
    }
  ]

  return (
    <Tabs id="work" activeTab='shining' tabs={tabs} />
  )
}

export default C
