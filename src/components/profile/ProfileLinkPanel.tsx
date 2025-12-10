import React from 'react'
import Button from '@/components/custom-ui/Button'
import Badge from '@/components/badge/Badge'

interface HighlightedInteraction {
  avatar: string
  name: string
  rating: number
  comment: string
  time: string
}

interface UserStats {
  date: string
  followers: number
  projects: number
}

interface UserCardProps {
  avatar: string
  name: string
  rating: number
  description: string
  highlightedInteraction: HighlightedInteraction
  stats: UserStats
  isFollowing: boolean
  onFollowToggle?: () => void
}

const UserCard: React.FC<UserCardProps> = ({
  avatar,
  name,
  rating,
  description,
  highlightedInteraction,
  stats,
  isFollowing,
  onFollowToggle
}) => {
  return (
    <div className="bg-yellow-100 rounded-lg p-6 border border-yellow-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={avatar}
            alt={name}
            className="w-10 h-10 rounded-full"
            referrerPolicy="no-referrer"
          />
          <div>
            <h3 className="font-medium text-gray-900">{name}</h3>
            <Badge variant="yellow">{rating} rating</Badge>
          </div>
        </div>

        <Button
          variant={isFollowing ? 'secondary' : 'primary'}
          size="sm"
          onClick={onFollowToggle}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      </div>

      <p className="text-gray-700 text-sm mb-4">
        {description}
      </p>

      <div className="bg-green-100 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Highlighted Interaction</h4>
        <div className="flex items-start space-x-3">
          <img
            src={highlightedInteraction.avatar}
            alt={highlightedInteraction.name}
            className="w-8 h-8 rounded-full"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-sm text-gray-900">
                {highlightedInteraction.name}
              </span>
              <Badge variant="green" >
                {highlightedInteraction.rating}
              </Badge>
            </div>
            <p className="text-sm text-gray-700 mb-1">
              "{highlightedInteraction.comment}"
            </p>
            <p className="text-xs text-gray-500">
              {highlightedInteraction.time}
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-3 space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <span>{stats.date}</span>
        </div>

        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          <span>{stats.followers} followers</span>
        </div>

        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15.586 13H14a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-blue-600">{stats.projects} projects</span>
        </div>

        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          <Badge variant="blue">4</Badge>
        </div>
      </div>
    </div>
  )
}

export default UserCard
