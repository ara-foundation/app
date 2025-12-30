import React, { useState, useEffect } from 'react'
import Tabs, { TabProps } from '../Tabs'
import IssueListPanel from '../issue/IssueListPanel'
import DropTarget from '../DropTarget'
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { getIcon } from '../icon';
import { authClient } from '@/client-side/auth'
import { getStarByUserId } from '@/client-side/star'
import { updateIssue } from '@/client-side/issue'
import { actions } from 'astro:actions'
import type { Star } from '@/types/star'
import type { AuthUser } from '@/types/auth'
import { ISSUE_EVENT_TYPES, IssueTabKey } from '@/types/issue'

interface WorkPanelProps {
  galaxyId: string
}

const C: React.FC<WorkPanelProps> = ({ galaxyId }) => {
  const { data: session, isPending } = authClient.useSession();
  const [, setCurrentUser] = useState<Star | null>(null);
  const [isMaintainer, setIsMaintainer] = useState(false);
  const [activeTab, setActiveTab] = useState<IssueTabKey>(IssueTabKey.SHINING);

  // Check user role and maintainer status
  useEffect(() => {
    const checkUserRole = async () => {
      if (isPending) {
        return;
      }

      const user = session?.user as AuthUser | undefined;
      if (user?.id) {
        const userData = await getStarByUserId(user.id);
        if (userData && userData._id) {
          setCurrentUser(userData);

          // Check if user is maintainer by fetching issues and comparing maintainer field
          try {
            const result = await actions.getIssuesByGalaxy({ galaxyId });
            if (result.data?.success && result.data.issues && result.data.issues.length > 0) {
              // Check if user's star ID matches the maintainer field of any issue
              const userStarId = userData._id.toString();
              const isUserMaintainer = result.data.issues.some(issue =>
                issue.maintainer === userStarId
              );
              setIsMaintainer(isUserMaintainer);
            } else {
              // If no issues, we can't determine maintainer status, default to false
              setIsMaintainer(false);
            }
          } catch (error) {
            console.error('Error checking maintainer status:', error);
            setIsMaintainer(false);
          }
        } else {
          setCurrentUser(null);
          setIsMaintainer(false);
        }
      } else {
        setCurrentUser(null);
        setIsMaintainer(false);
      }
    };

    checkUserRole();
  }, [session, isPending, galaxyId]);

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
      const user = session?.user as AuthUser | undefined;
      if (!user?.email) {
        console.error('No authenticated user found');
        return;
      }

      // Update issue listHistory to only contain this list key
      const success = await updateIssue({
        issueId,
        email: user.email,
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
      content: <IssueListPanel tabType={IssueTabKey.CLOSED} draggable={false} galaxyId={galaxyId} />
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
