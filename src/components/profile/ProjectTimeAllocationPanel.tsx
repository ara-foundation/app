import React from 'react'
import PageLikePanel from '@/components/panel/PageLikePanel'
import Badge from '@/components/badge/Badge'
import Button from '@/components/custom-ui/Button'

const Sidebar: React.FC = () => {
  return (
    <PageLikePanel interactive={false} title="Project Time Allocation" bg='green-50' rightHeader={[<Button variant="ghost" size="sm">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
      </svg>
    </Button>]}>
      <div className="relative w-48 h-48 mx-auto mb-4">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="8"
            strokeDasharray="125.6" strokeDashoffset="62.8" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="8"
            strokeDasharray="125.6" strokeDashoffset="31.4" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#6b7280" strokeWidth="8"
            strokeDasharray="125.6" strokeDashoffset="94.2" />
        </svg>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
            <span>UI Framework (45%)</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Data Processing API (30%)</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span>Documentation Portal (15%)</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Other projects (10%)</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-medium mb-3">Top 3 projects of the user:</h4>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="blue">Maintaining</Badge>
          <Badge variant="yellow">Contributor</Badge>
          <Badge variant="purple">Influencer</Badge>
        </div>
      </div>
    </PageLikePanel>
  )
}

export default Sidebar
