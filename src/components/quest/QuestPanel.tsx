import React, { useEffect, useState } from 'react'
import ProjectRating from '@/components/rating/ProjectRating'
import PageLikePanel from '@/components/panel/PageLikePanel'
import Badge from '@/components/badge/Badge'
import TaskItem from './TaskItem'
import { bgClassNames, GridStyle } from '@/types/eventTypes'
import Tooltip from '../custom-ui/Tooltip'
import Button from '../custom-ui/Button'
import { useHotkeys } from 'react-hotkeys-hook';
import Kbd from '../custom-ui/Kbd'
import List from '../list/List'
import useSelectableList from '../list/useSelectableList'


interface Props {
  title?: string
}

interface TaskProps {
  title: string
  points: number
  time: string
  isHighlighted?: boolean
  id?: string
}

const defaultLabel = "selects a task";

const TasksSection: React.FC<Props> = ({ title = 'My Tasks' }) => {
  const [tasks, setTasks] = useState<TaskProps[]>([
    { title: "Complete project proposal", points: 50, time: "10:00 AM" },
    { title: "Review client feedback", points: 50, time: "11:30 AM" },
    { title: "Team meeting", points: 50, time: "1:00 PM" },
    { title: "Update documentation", points: 50, time: "3:00 PM" },
    { title: "Send weekly report", points: 50, time: "5:00 PM" }
  ].map((task, i) => ({ ...task, id: `${i + 1}` }))
  ); // Add id to each task

  const { selectedItem: selectedTaskId, setSelectedItem: setSelectedTaskId } = useSelectableList()
  const [label, setLabel] = useState(defaultLabel)
  const [completedTaskId, setCompletedTaskId] = useState<string | undefined>();
  const [hide, setHided] = useState(false);

  useEffect(() => {
    setLabel(selectedTaskId === undefined ? defaultLabel : 'Clear')
  }, [selectedTaskId])

  useEffect(() => {
    if (tasks.length === 0) {
      setTimeout(() => {
        setHided(true);
      }, 3000)
    }
  }, [tasks])

  const selectFirstTask = () => {
    const firstTaskId = tasks[0].id;
    setSelectedTaskId(firstTaskId!);
  }
  const deselectTask = (id: string = selectedTaskId.valueOf() as string) => {
    setSelectedTaskId(id);
  }

  const onTaskClick = (id: string) => {
    if (selectedTaskId.has(id)) {
      deselectTask(id);
    } else {
      setSelectedTaskId(id);
    }
  }

  const playTask = () => {
    setCompletedTaskId(selectedTaskId.valueOf() as string)
    setTimeout(() => {
      const nextTaskId = getNextTaskId();
      for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === selectedTaskId.valueOf() as string) {
          delete itemRefs[tasks[i].id!];
          delete tasks[i];
        }
      }

      setTasks(tasks.filter(task => task !== undefined));

      setSelectedTaskId(nextTaskId!);
    }, 1500)
  }

  const getNextTaskId = (): string | undefined => {
    if (selectedTaskId) {
      const currentIndex = tasks.findIndex(task => task.id === selectedTaskId.valueOf() as string);
      const nextIndex = (currentIndex + 1) % tasks.length;
      const nextTaskId = tasks[nextIndex].id;
      return nextTaskId;
    }
  }

  const selectNextTask = () => {
    if (selectedTaskId.valueOf() as string) {
      const currentIndex = tasks.findIndex(task => task.id === selectedTaskId.valueOf() as string);
      const nextIndex = (currentIndex + 1) % tasks.length;
      const nextTaskId = tasks[nextIndex].id;
      setSelectedTaskId(nextTaskId!);
    }
  }
  const selectPreviousTask = () => {
    if (selectedTaskId) {
      const currentIndex = tasks.findIndex(task => task.id === selectedTaskId.valueOf() as string);
      const previousIndex = (currentIndex - 1 + tasks.length) % tasks.length;
      const previousTaskId = tasks[previousIndex].id;
      setSelectedTaskId(previousTaskId!);
    }
  }

  useHotkeys('enter', () => {
    if (selectedTaskId) playTask();
    else selectFirstTask();
  });
  useHotkeys('left', selectPreviousTask);
  useHotkeys('esc', () => deselectTask(selectedTaskId.valueOf() as string)); // Select/Deselect the first task
  useHotkeys('right', selectNextTask);

  const itemRefs: { [key: string]: any } = {};

  const actions = (
    <div className='mb-3 h-6 flex space-x-4 justify-between'>
      <Tooltip
        content={
          <div className="text-sm">
            {selectedTaskId ? 'Press Esc to deselect the task.' : 'Press Enter to select the first task.'}
          </div>
        }
      >
        <Button
          onClick={selectedTaskId ? () => deselectTask(selectedTaskId.valueOf() as string) : selectFirstTask}
          variant={selectedTaskId ? 'default' : 'secondary'}
          outline={true}
          className='flex justify-center items-center space-x-1 m-0 p-1!'>
          <div className='flex items-center space-x-1 px-2'>
            <Kbd className='mt-0.5 '>
              {selectedTaskId ? 'Esc' : 'Enter'}
            </Kbd>
            <div className=''>{label}</div>
          </div>
        </Button>
      </Tooltip>

      {selectedTaskId &&
        <Tooltip
          content={
            <div className="text-sm">
              Press Enter to start the quest system.
              Guides and notifications, and Auto UI will guide you through the process.
              Minimum effort.
            </div>
          }
        >
          <Button onClick={playTask} variant={'primary'} className='flex flex-center items-center space-x-1 m-0 p-1!'>
            <div className='flex items-center space-x-1 px-2'>
              <Kbd className='mt-0.5'>Enter</Kbd>
              <div>Complete</div>
            </div>
          </Button>
        </Tooltip>
      }

      {selectedTaskId &&
        <Tooltip
          content={
            <div className="text-sm">
              Press on ◀︎   ▶︎ arrow buttons to select previous or next task.
              <br />
              Pressing on the button will select the next task.
            </div>
          }
        >
          <Button onClick={selectNextTask} outline={true} variant={'secondary'} className='flex flex-center items-center space-x-1 m-0 p-1!'>
            <div className='flex items-center space-x-1 px-2'>
              <Kbd className='mt-0.5'>◀︎    ▶︎</Kbd>
              <div>Change Task</div>
            </div>
          </Button>
        </Tooltip>
      }
    </div>
  )

  return (
    tasks.length > 0 ?
      <PageLikePanel actions={actions} onHover={(hovered) => { }} title={
        <div className='flex items-center space-x-2 gap-1'>{title}
          <Badge variant='red'>{tasks.length}</Badge>
          <Badge variant='info'>Server is not connected</Badge>
        </div>
      }
        subtitle={
          <p className="text-sm text-gray-500 dark:text-gray-400 font-normal text-left">
            The project management works are automatically converted into the tasks.
          </p>
        }
      >
        <List contentHeight="h-48" className={`${bgClassNames.listContent}`}>
          {tasks.map((task) =>
            <TaskItem {...task} ref={(el: any) => (itemRefs[task.id!] = el)} onClick={onTaskClick} completedId={completedTaskId} selectedId={selectedTaskId.valueOf() as string} />,
          )}
        </List>

      </PageLikePanel> : hide ? null : <PageLikePanel className={`${GridStyle.panel.margin!.bottom}`} title={
        <div>Tasks are completed<Badge variant='info'>{tasks.length}</Badge>
        </div>}
      >
        <div className={`p-4 space-y-3 lg:max-h-[30vh] overflow-y-auto`}>
          Come back in a few days later. No tasks to do.
        </div>
      </PageLikePanel>
  )
}

export default TasksSection
