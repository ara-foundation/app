import React from 'react'
import InfoPanel from '@/components/panel/InfoPanel'
import Badge from '@/components/badge/Badge'

const Sidebar: React.FC = () => {
  return (
    <InfoPanel title="Recent Activity" >
      <div className="flex items-start space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
        <div className="text-sm">
          <span className="text-blue-600">Completed task "Fix responsive layout" in UI Framework</span>
          <div className="text-gray-500 text-xs mt-1">Average visit: Once in a week</div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-medium mb-3 flex items-center">
          <span className="text-yellow-500 mr-2">★</span>
          Highlighted Interaction
        </h4>
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <img
              src="https://dummyimage.com/32x32/4A90E2/ffffff?text=SJ"
              alt="Sarah Johnson"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm">Sarah Johnson</span>
              <Badge variant="success" static={true} >220 rating</Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">@David your code is really good!</p>
            <p className="text-xs text-gray-500 mt-1">Today at 8:22 AM</p>
          </div>
        </div>
      </div>
    </InfoPanel>
  )
}

export default Sidebar
