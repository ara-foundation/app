import React from 'react'
import BasePanel from '@/components/panel/Panel'
import VersionPanel from './VersionPanel'
import type { Version } from '@/types/roadmap'

export interface RoadmapProps {
  versions: Version[]
}

export const RoadmapPanel: React.FC<RoadmapProps> = ({ versions }) => {
  return (
    <BasePanel className="space-y-6 p-0! border-none! min-h-[50vh]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {versions.map((version) =>
          <VersionPanel key={version._id} {...version} />
        )}
      </div>
    </BasePanel>
  )
}

export default RoadmapPanel
