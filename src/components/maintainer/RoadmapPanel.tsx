import React from 'react'
import BasePanel from '@/components/panel/Panel'
import { ActionProps } from '@/types/eventTypes'
import Link from '../custom-ui/Link'
import Button from '../custom-ui/Button'
import DropTarget from '../DropTarget'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import ProjectVersionPanel, { ProjectVersionProps } from '../project/ProjectVersionPanel';
import List from '../list/List'
import { Popover } from '@base-ui-components/react/popover'
import { getIcon } from '../icon'

export interface RoadmapProps {
  actions?: ActionProps[]
  versions: ProjectVersionProps[]
}

export const RoadmapPanel: React.FC<RoadmapProps> = ({ actions, versions }) => {
  return (
    <BasePanel className="space-y-6 p-0! border-none!">
      <List>
        {versions.map((version) =>
          version.status === 'completed' ? <ProjectVersionPanel key={version.version} {...version} /> :
            <DndProvider key={version.version} backend={HTML5Backend}><DropTarget id={version.version} accept={["issue"]} onDrop={(e) => console.log(e)}>
              <ProjectVersionPanel
                {...version}
              />
            </DropTarget>
            </DndProvider>)}
      </List>
      <div className='flex justify-center mt-4'>
        {actions && actions.map(
          (action) => (
            action.uri ?
              <Link uri={action.uri!} className={`inline-flex items-center font-bold py-2 px-4 rounded transition-colors ${action.className || ""}`} >{action.children}</Link>
              :
              action.onClick ?
                <Button variant={action.variant} onClick={action.onClick} className={action.className || ""} >{action.children}</Button>
                :
                <Popover.Root>
                  <Popover.Trigger className="pb-4">
                    <Button variant={action.variant} className={action.className || ""} >{getIcon('arrow')} {action.children}</Button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Positioner sideOffset={8} side='bottom' className={'z-700!'}>
                      <Popover.Popup className="w-96 origin-[var(--transform-origin)] rounded-xs bg-[canvas] px-6 py-4 text-gray-900 shadow-sm shadow-gray-900 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0">
                        <Popover.Arrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
                          {getIcon('arrow')}
                        </Popover.Arrow>
                        <Popover.Title className="text-gray-500 font-medium text-md flex items-center flex-row p-1 mb-4">
                          {action.children}
                        </Popover.Title>
                        <Popover.Description className="text-gray-600">
                          {action.popoverContent}
                        </Popover.Description>
                      </Popover.Popup>
                    </Popover.Positioner>
                  </Popover.Portal>
                </Popover.Root>
          )
        )}
      </div>
    </BasePanel>
  )
}

export default RoadmapPanel
