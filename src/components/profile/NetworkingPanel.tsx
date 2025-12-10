import React from 'react'
import BasePanel from '@/components/panel/Panel'

const Sidebar: React.FC = () => {
  return (
    <BasePanel className="bg-green-50">
      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img
              src="https://dummyimage.com/32x32/4A90E2/ffffff?text=SJ"
              alt="Sarah Johnson"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="font-medium text-sm">Sarah Johnson</div>
            <div className="text-xs text-gray-500">220 rating</div>
          </div>
        </div>
        <span className="text-green-600 font-medium">+$88</span>
      </div>

      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img
              src="https://dummyimage.com/32x32/4A90E2/ffffff?text=DR"
              alt="David Rodriguez"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="font-medium text-sm">David Rodriguez</div>
            <div className="text-xs text-gray-500">220 rating</div>
          </div>
        </div>
        <span className="text-green-600 font-medium">+$88</span>
      </div>
    </BasePanel>
  )
}

export default Sidebar
