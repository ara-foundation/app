import React from 'react'
import Link from '@/components/custom-ui/Link'
import Tooltip from './custom-ui/Tooltip'
import NumberFlow from '@number-flow/react'
import { getIcon } from './icon'
import { Roles, type User } from '@/types/user'
import { cn } from '@/lib/utils'

interface MenuAvatarProps {
  src?: string
  alt?: string
  className?: string
  imgClassName?: string
  uri?: string
  nickname?: string
  sunshines?: number
  stars?: number
  role?: Roles
  user?: User // Accept User object as alternative to individual props
}

const MenuAvatar: React.FC<MenuAvatarProps> = ({
  src,
  alt,
  className,
  imgClassName = '',
  uri = '/data/profile',
  nickname = 'Ahmetson',
  sunshines,
  stars,
  role,
  user
}) => {
  // Use user object if provided, otherwise fall back to individual props
  const finalSrc = user?.src || src
  const finalAlt = user?.alt || alt
  const finalUri = user?.uri || uri
  const finalNickname = user?.nickname || nickname
  const finalSunshines = user?.sunshines ?? sunshines
  const finalStars = user?.stars ?? stars
  const finalRole = user?.role || role
  const defaultSrc = 'https://api.backdropbuild.com/storage/v1/object/public/avatars/9nFM8HasgS.jpeg'
  const defaultAlt = 'Avatar'
  const profileUri = finalNickname ? `${finalUri}?nickname=${finalNickname}` : finalUri

  const tooltipContent = (
    <div className="text-sm space-y-2">
      <div className="flex items-center gap-2">
        <img
          src={finalSrc || defaultSrc}
          alt={finalAlt || defaultAlt}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <div className="flex items-center gap-1">
            <span className="font-medium">{finalNickname}</span>
            {finalRole && (
              <span className={cn(
                "text-xs text-white px-1.5 py-0.5 rounded",
                finalRole === 'maintainer' && 'bg-blue-500',
                finalRole === 'user' && 'bg-green-500',
                finalRole === 'contributor' && 'bg-purple-500'
              )}>
                {finalRole.charAt(0).toUpperCase() + finalRole.slice(1)}
              </span>
            )}
          </div>
          {(finalSunshines !== undefined || finalStars !== undefined) && (
            <div className="flex items-center gap-2 mt-1">
              {finalSunshines !== undefined && (
                <div className="flex items-center gap-1">
                  {getIcon({ iconType: 'sunshine', className: 'w-4 h-4' })}
                  <NumberFlow
                    value={finalSunshines}
                    locales="en-US"
                    format={{ style: 'decimal', maximumFractionDigits: 0 }}
                    className="text-xs"
                  />
                </div>
              )}
              {finalStars !== undefined && (
                <div className="flex items-center gap-1">
                  {getIcon({ iconType: 'star', className: 'w-4 h-4' })}
                  <NumberFlow
                    value={finalStars}
                    locales="en-US"
                    format={{ style: 'decimal', maximumFractionDigits: 2 }}
                    className="text-xs"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <Tooltip content={tooltipContent}>
      <Link uri={profileUri} className={`hover:bg-teal-300 bg-blue-200 dark:bg-blue-400 rounded-full h-8 w-8 flex items-center justify-center overflow-hidden ${className}`}>
        <img
          src={finalSrc || defaultSrc}
          alt={finalAlt || defaultAlt}
          width={32}
          height={32}
          className={`w-full h-full rounded-full object-cover ${imgClassName}`}
          style={{ minWidth: '28px', minHeight: '28px' }}
        />
      </Link>
    </Tooltip>

  )
}

export default MenuAvatar
