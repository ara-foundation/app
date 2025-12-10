import React from 'react'
import { ProfileLink } from '@/components/profile/user'
import ProfileRating from '@/components/rating/ProfileRating'

export interface AvatarListProps {
  contributors: ProfileLink[]
  showLastRating?: boolean
  maxVisible?: number
}

const AvatarList: React.FC<AvatarListProps> = ({
  contributors,
  showLastRating = false,
  maxVisible = 4
}) => {
  const visibleContributors = contributors.slice(0, maxVisible)
  const remainingCount = contributors.length - maxVisible
  const lastContributor = contributors[contributors.length - 1]

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center -space-x-2">
        {visibleContributors.map((contributor, index) => (
          <img
            key={contributor.uri}
            src={contributor.avatar}
            alt={contributor.name}
            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
            referrerPolicy="no-referrer"
          />
        ))}
        {remainingCount > 0 && (
          <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700">
            +{remainingCount}
          </div>
        )}
      </div>
      {showLastRating && lastContributor?.rating && (
        <ProfileRating {...lastContributor.rating} />
      )}
    </div>
  )
}

export default AvatarList
