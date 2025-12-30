import React, { memo } from 'react'
import { useDrag } from 'react-dnd'
import IssueLink from './IssueLink'
import { ActionProps } from '@/types/eventTypes'
import { Issue } from '@/types/issue'

type DraggableIssueProps = Issue & { actions?: ActionProps[]; patchable?: boolean; draggable?: boolean }

const IssueCard: React.FC<DraggableIssueProps> = memo((props) => {
  const dragType = props.patchable ? 'patch' : 'issue';

  // Only use drag if draggable prop is explicitly true
  // This component should only be rendered when inside a DndProvider
  const [{ opacity }, drag] = useDrag(
    () => ({
      type: dragType,
      item: { id: props._id, title: props.title },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.4 : 1,
      }),
    }),
    [props._id, props.title, dragType],
  )

  const borderClasses = props.patchable
    ? 'border-amber-300/80 hover:border-amber-400 dark:border-amber-400/70 dark:hover:border-amber-300/90'
    : 'border-blue-100/50 hover:border-blue-200 dark:border-blue-500/50 dark:hover:border-blue-500/90'

  const backgroundClasses = props.patchable
    ? 'bg-amber-50/50 dark:bg-amber-900/20'
    : 'bg-transparent'

  return (
    <div
      ref={drag as any}
      data-testid={props._id}
      style={{ opacity }}
      className={`cursor-move! border-1 ${borderClasses} ${backgroundClasses} transition-colors p-2 border-dashed rounded-md`}
    >
      <IssueLink {...props} draggable={true} />
    </div>
  )
})

export default IssueCard
