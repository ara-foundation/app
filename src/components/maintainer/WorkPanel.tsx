import React, { useState, useEffect } from 'react'
import Tabs, { TabProps } from '../Tabs'
import IssueListPanel from '../issue/IssueListPanel'
import DropTarget from '../DropTarget'
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { getIcon } from '../icon';
import { getDemo } from '@/client-side/demo'
import { DEMO_EVENT_TYPES } from '@/types/demo'
import { getStarById } from '@/client-side/star'
import { updateIssue } from '@/client-side/issue'
import type { Star } from '@/types/star'
import { ISSUE_EVENT_TYPES, IssueTabKey } from '@/types/issue'

interface WorkPanelProps {
  galaxyId: string
}

const C: React.FC<WorkPanelProps> = ({ galaxyId }) => {
  const [, setCurrentUser] = useState<Star | null>(null);
  const [isMaintainer, setIsMaintainer] = useState(false);
  const [activeTab, setActiveTab] = useState<IssueTabKey>(IssueTabKey.SHINING);

  // Check user role and listen for changes
  useEffect(() => {
    const checkUserRole = async () => {
      const demo = getDemo();
      if (demo.email && demo.users && demo.role) {
        const user = demo.users.find(u => u.role === demo.role) || demo.users[0];
        if (user && user._id) {
          const userData = await getStarById(user._id.toString());
          if (userData) {
            setCurrentUser(userData);
            setIsMaintainer(userData.role === 'maintainer');
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

  useEffect(() => {
    // Use a small delay to ensure all listeners are set up before dispatching
    // This is especially important for PatcherPanel which might mount after WorkPanel
    const timeoutId = setTimeout(() => {
      dispatchTabChanged(activeTab);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [activeTab]);

  const dispatchTabChanged = (tabType: IssueTabKey) => {
    window.dispatchEvent(new CustomEvent(ISSUE_EVENT_TYPES.ISSUES_TAB_CHANGED, {
      detail: { tabType, galaxyId },
    }));
  }

  const changeIssueList = async (issueId: string, listKey: IssueTabKey) => {
    try {
      const demo = getDemo();
      if (!demo.email) {
        console.error('No demo email found');
        return;
      }

      // Update issue listHistory to only contain this list key
      const success = await updateIssue({
        issueId,
        email: demo.email,
        listHistory: [listKey],
      });

      if (!success) {
        console.error('Failed to update issue');
        return;
      }
    } catch (error) {
      console.error('Error changing issue list:', error);
    }
  }

  const tabs: TabProps[] = isMaintainer ? [
    {
      label: <><span className="text-amber-600 dark:text-amber-400 font-semibold">Shining issues</span></>,
      key: IssueTabKey.SHINING,
      content: <DndProvider backend={HTML5Backend}>
        <IssueListPanel tabType={IssueTabKey.SHINING} draggable={true} galaxyId={galaxyId} />
      </DndProvider>,
      className: 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
    },
    {
      label: <>Public Backlog</>,
      key: IssueTabKey.PUBLIC,
      content: <DndProvider backend={HTML5Backend}>
        <IssueListPanel tabType={IssueTabKey.PUBLIC} draggable={true} galaxyId={galaxyId} />
      </DndProvider>
    },
    {
      label: <DndProvider backend={HTML5Backend}><DropTarget id={IssueTabKey.INTERESTING} accept={["issue", "patch"]} onDrop={(item) => changeIssueList(item.id, IssueTabKey.INTERESTING)}>Interesting Issues</DropTarget></DndProvider>,
      key: IssueTabKey.INTERESTING,
      content: <DndProvider backend={HTML5Backend}>
        <IssueListPanel tabType={IssueTabKey.INTERESTING} draggable={true} description="Interesting issues for the maintainer. It could mean anything, but basically its worth maintainer's attention" galaxyId={galaxyId} />
      </DndProvider>,
      className: ' p-0!',
    },
    {
      label: <DndProvider backend={HTML5Backend}><DropTarget id={IssueTabKey.BORING} accept={["issue", "patch"]} onDrop={(item) => changeIssueList(item.id, IssueTabKey.BORING)}>Boring Issues</DropTarget></DndProvider>,
      key: IssueTabKey.BORING,
      content: <DndProvider backend={HTML5Backend}>
        <IssueListPanel tabType={IssueTabKey.BORING} draggable={true} description="Issues that are boring for the maintainer. It could be for any reason, but basically maintainer will not spend time on them." galaxyId={galaxyId} />
      </DndProvider>
    },
    {
      label: <DndProvider backend={HTML5Backend}><DropTarget id={IssueTabKey.CLOSED} accept={["issue", "patch"]} onDrop={(item) => changeIssueList(item.id, IssueTabKey.CLOSED)}><span className="flex items-center gap-1.5">{getIcon({ iconType: 'lock', className: 'w-4 h-4' })}Closed</span></DropTarget></DndProvider>,
      key: IssueTabKey.CLOSED,
      content: <IssueListPanel tabType={IssueTabKey.CLOSED} galaxyId={galaxyId} />
    },
  ] : [
    {
      label: <><span className="text-amber-600 dark:text-amber-400 font-semibold">Shining issues</span></>,
      key: IssueTabKey.SHINING,
      content: <IssueListPanel tabType={IssueTabKey.SHINING} draggable={false} galaxyId={galaxyId} />,
      className: 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
    },
    {
      label: <>Public Backlog</>,
      key: IssueTabKey.PUBLIC,
      content: <IssueListPanel tabType={IssueTabKey.PUBLIC} draggable={false} galaxyId={galaxyId} />
    },
    {
      label: <>Interesting Issues</>,
      key: IssueTabKey.INTERESTING,
      content: <IssueListPanel tabType={IssueTabKey.INTERESTING} draggable={false} description="Interesting issues for the maintainer. It could mean anything, but basically its worth maintainer's attention" galaxyId={galaxyId} />
    },
    {
      label: <>Boring Issues</>,
      key: IssueTabKey.BORING,
      content: <IssueListPanel tabType={IssueTabKey.BORING} draggable={false} description="Issues that are boring for the maintainer. It could be for any reason, but basically maintainer will not spend time on them." galaxyId={galaxyId} />
    },
    {
      label: <>Closed Issues</>,
      key: IssueTabKey.CLOSED,
      content: <IssueListPanel tabType={IssueTabKey.CLOSED} galaxyId={galaxyId} />
    }
  ]

  return (
    <Tabs
      onTabChange={(newTab => {
        setActiveTab(newTab as IssueTabKey);
      })}
      activeTab={activeTab}
      tabs={tabs}
    />
  )
}

export default C
