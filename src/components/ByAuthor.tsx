import React from 'react'
import MenuAvatar from './MenuAvatar'
import AvatarList from './AvatarList'
import ProfileRating from './rating/ProfileRating'
import TimeAgo from 'timeago-react'
import { ProfileLink } from '@/types/star'

export interface ByAuthorProps {
  author?: ProfileLink | ProfileLink[]
  createdTime?: string | Date | number
  className?: string
}

const ByAuthor: React.FC<ByAuthorProps> = ({
  author,
  createdTime,
  className = ''
}) => {
  if (!author && !createdTime) return null

  // Convert createdTime to Date if it's a number (Unix timestamp)
  const dateTime = createdTime
    ? typeof createdTime === 'number'
      ? new Date(createdTime * 1000)
      : typeof createdTime === 'string'
        ? new Date(createdTime)
        : createdTime
    : null

  return (
    <div className={`flex justify-end items-center space-x-1 text-slate-600 dark:text-slate-400 gap-1 text-xs mb-2 ${className}`}>
      {author && (
        <>
          By {Array.isArray(author) ? (
            <AvatarList contributors={author} showLastRating={true} />
          ) : (
            <>
              <MenuAvatar src={author?.icon} uri={author?.uri} className='w-7! h-7!' />
              {author.rating && <ProfileRating {...author.rating} />}
            </>
          )}
        </>
      )}
      {dateTime && (
        <TimeAgo datetime={dateTime} />
      )}
    </div>
  )
}

export default ByAuthor

