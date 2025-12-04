import React from 'react'
import PageLikePanel from '@/components/panel/PageLikePanel'

const VotingPowerSection: React.FC = () => {
  return (
    <PageLikePanel className="space-y-6" title='How to work with tasks?'>
      <ul className="text-sm text-gray-600 space-y-2">
        <li>• A task describes the quest mission. Quest missions are intended to reduce overwhelming information, and do the work in the quickest feedback way, which reduces the burnout.</li>
        <li>• Upon completing the task, you receive the rating points. The points increase the rating of the project. Rating is the measurement of the satisfaction and attraction you get from customers.</li>
      </ul>
      <div>
        <p className="text-xs text-gray-500">Learn how Ara works:</p>
        <a href="#" className="text-xs text-blue-600 hover:underline">How does progress system work?</a>
      </div>
    </PageLikePanel>
  )
}

export default VotingPowerSection
