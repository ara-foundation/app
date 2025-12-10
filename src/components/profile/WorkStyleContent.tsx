import React from 'react'
import PageLikePanel from '@/components/panel/PageLikePanel'
import Slider from '@/components/Slider'
import { getIcon } from '@/components/icon'
import Badge from '@/components/badge/Badge'
import { WorkStyleProps } from '@/components/profile/user'

const WorkStyleSection: React.FC<WorkStyleProps> = ({
  availabilityStatus = '',
  directness = 50,
  verbal = 50,
  approach = 50,
  ideas = 50,
  faceToFace = 50,
  bigPicture = 50,
  workEthics = 50,
  research = 50,
  teamwork = 50,
  creativity = 50,
}) => {
  // Determine badge variant based on availability status
  const getBadgeVariant = (status: string) => {
    if (status.toLowerCase().includes('not available')) return 'danger'
    if (status.toLowerCase().includes('fully available')) return 'green'
    return 'yellow' // default for partially available or other statuses
  }

  const badgeVariant = availabilityStatus ? getBadgeVariant(availabilityStatus) : 'yellow'
  return (
    <PageLikePanel interactive={false} title="Availability & Work Style" actions={[]} bg='green-50'>
      {/* <p className='text-rose-600 dark:text-rose-400'>
        <p className='text-lg w-full gap-1 flex items-center'>{getIcon('clock')} Feature is on the roadmap.</p>
        Ara tracks the way how a person interacts in the platform
        and tries to draw the portrait. Interact with the people
        whose communication style is matching your preferences
        or use it as the hint how to reach out to the person.
      </p> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-medium mb-4">Availability Status</h4>
          <div className="space-y-4">
            <div className="flex justify-start items-center space-x-2">
              <Badge variant={badgeVariant as any} active={true}><span className="invisible">1</span></Badge>
              <span className="text-sm">{availabilityStatus || 'Partially Available'}</span>
            </div>
          </div>

          <div className="mt-6">
            <h5 className="font-medium mb-4">Communication Style</h5>
            <div className="space-y-3">
              <Slider label="Direct" leftLabel="Direct" rightLabel="Thinking style" value={directness} />
              <Slider label="Verbal" leftLabel="Verbal" rightLabel="Gently discussing" value={verbal} />
              <Slider label="Approach" leftLabel="Approach" rightLabel="Cautious" value={approach} />
              <Slider label="Ideas" leftLabel="Ideas" rightLabel="Encouraging" value={ideas} />
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-4">Work Methodology</h4>
          <div className="space-y-3">
            <Slider label="Less face-to-face" leftLabel="Less face-to-face" rightLabel="Technology Preference" value={faceToFace} />
            <Slider label="Big Picture" leftLabel="Big Picture" rightLabel="Task Performance" value={bigPicture} />
            <Slider label="Don't rush me" leftLabel="Don't rush me" rightLabel="Work ethics" value={workEthics} />
          </div>

          <div className="mt-6">
            <h5 className="font-medium mb-4">Collaboration Style</h5>
            <div className="space-y-3">
              <Slider label="Research first" leftLabel="Research first" rightLabel="Proactive" value={research} />
              <Slider label="Prefer alone" leftLabel="Prefer alone" rightLabel="Brainstorming with people" value={teamwork} />
              <Slider label="Creative" leftLabel="Creative" rightLabel="Structured" value={creativity} />
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-6">
        Estimated by Ara based on communication analysis
      </p>
    </PageLikePanel>
  )
}

export default WorkStyleSection
