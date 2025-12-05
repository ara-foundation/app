import React from 'react'
import BasePanel from '@/components/panel/Panel'
import { Issue } from '@/scripts/issue'

interface IssueCardProps {
  issue: Issue
  isSelected: boolean
  onSelect: () => void
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, isSelected, onSelect }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'improvement':
        return 'bg-blue-100 text-blue-800'
      case 'feature':
        return 'bg-green-100 text-green-800'
      case 'bug':
        return 'bg-red-100 text-red-800'
      case 'enhancement':
        return 'bg-purple-100 text-purple-800'
      case 'custom':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <BasePanel
      className={`border rounded-lg p-4 cursor-pointer transition-colors ${isSelected
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 hover:border-gray-300'
        }`}
      onClick={onSelect}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-gray-900 mr-2">
              {issue.number}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(issue.type)}`}>
              {issue.type}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            {issue.title}
          </h3>
          <p className="text-sm text-gray-600">
            {issue.description}
          </p>
        </div>
      </div>
    </BasePanel>
  )
}

export default IssueCard
