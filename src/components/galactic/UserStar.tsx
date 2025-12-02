import React from 'react'
import Link from '@/components/custom-ui/Link'
import Tooltip from '@/components/custom-ui/Tooltip'
import NumberFlow from '@number-flow/react'
import { getIcon } from '@/components/icon'

interface UserStarProps {
  x: number
  y: number
  src?: string
  alt?: string
  className?: string
  imgClassName?: string
  uri?: string
  nickname: string
  sunshines?: number
  stars?: number
  role?: string
  funded?: number
  received?: number
  issuesClosed?: number
  issuesActive?: number
  leaderboardPosition?: number
  walletAddress?: string
  githubUrl?: string
  linkedinUrl?: string
}

// 5-pointed star clip-path polygon
const starClipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'

const UserStar: React.FC<UserStarProps> = ({
  x,
  y,
  src,
  alt,
  className,
  imgClassName,
  uri = '/data/profile',
  nickname,
  sunshines,
  stars,
  role,
  funded,
  received,
  issuesClosed,
  issuesActive,
  leaderboardPosition,
  walletAddress,
  githubUrl,
  linkedinUrl,
}) => {
  const defaultSrc = 'https://api.backdropbuild.com/storage/v1/object/public/avatars/9nFM8HasgS.jpeg'
  const defaultAlt = 'Avatar'
  const profileUri = nickname ? `${uri}?nickname=${nickname}` : uri

  // Generate blockchain explorer URL (defaulting to Ethereum/Etherscan)
  const getExplorerUrl = (address: string) => {
    // Check if it's an Ethereum address (starts with 0x)
    if (address.startsWith('0x')) {
      return `https://etherscan.io/address/${address}`
    }
    // Default to Etherscan for now, can be extended for other chains
    return `https://etherscan.io/address/${address}`
  }

  // Calculate star level (1-10) from stars prop
  // If stars is already 1-10, use it directly; otherwise normalize from 0-5 range to 1-10
  // If stars is undefined, default to level 1
  const starLevel = stars !== undefined
    ? stars >= 1 && stars <= 10
      ? Math.round(stars)
      : Math.max(1, Math.min(10, Math.round((stars / 5) * 10) || 1))
    : 1

  // Determine special status
  const isMaintainer = role === 'Maintainer'
  const isFirstPlace = leaderboardPosition === 1
  const isSecondPlace = leaderboardPosition === 2
  const isThirdPlace = leaderboardPosition === 3

  // Calculate level-based styling values
  // Opacity: level 10 = 1.0, level 1 = 0.35
  // Maintainer and first place get full opacity
  const baseOpacity = 0.35 + ((starLevel - 1) / 9) * 0.65
  const opacity = isMaintainer || isFirstPlace ? 1.0 : baseOpacity

  // Blur: level 10 = 0px, level 1 = 12px (when not hovered)
  // Maintainer and first place get no blur
  const baseBlur = 12 - ((starLevel - 1) / 9) * 12
  const blurAmount = isMaintainer || isFirstPlace ? 0 : baseBlur

  // Size: level 10 = 48px, level 1 = 32px
  // Maintainer: 72px (extra large), First place: 64px (large), others: normal
  const baseSize = 32 + ((starLevel - 1) / 9) * 16
  const size = isMaintainer ? 72 : isFirstPlace ? 64 : baseSize

  // Color gradients based on position
  // Gold (default), Silver (2nd), Bronze (3rd)
  let glowGradient1: string
  let glowGradient2: string
  let glowGradient3: string

  if (isSecondPlace) {
    // Silver gradients
    glowGradient1 = 'radial-gradient(circle, rgba(192, 192, 192, 0.9) 0%, rgba(230, 230, 230, 0.5) 50%, transparent 100%)'
    glowGradient2 = 'radial-gradient(circle, rgba(220, 220, 220, 0.7) 0%, rgba(192, 192, 192, 0.4) 50%, transparent 100%)'
    glowGradient3 = 'radial-gradient(circle, rgba(200, 200, 200, 0.6) 0%, rgba(240, 240, 240, 0.3) 50%, transparent 100%)'
  } else if (isThirdPlace) {
    // Bronze/gold gradients
    glowGradient1 = 'radial-gradient(circle, rgba(205, 127, 50, 0.9) 0%, rgba(255, 200, 100, 0.5) 50%, transparent 100%)'
    glowGradient2 = 'radial-gradient(circle, rgba(255, 180, 80, 0.7) 0%, rgba(205, 127, 50, 0.4) 50%, transparent 100%)'
    glowGradient3 = 'radial-gradient(circle, rgba(220, 150, 70, 0.6) 0%, rgba(255, 220, 150, 0.3) 50%, transparent 100%)'
  } else {
    // Default gold gradients
    glowGradient1 = 'radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, rgba(255, 255, 0, 0.4) 50%, transparent 100%)'
    glowGradient2 = 'radial-gradient(circle, rgba(255, 255, 100, 0.6) 0%, rgba(255, 215, 0, 0.3) 50%, transparent 100%)'
    glowGradient3 = 'radial-gradient(circle, rgba(255, 200, 0, 0.5) 0%, rgba(255, 255, 150, 0.2) 50%, transparent 100%)'
  }

  const tooltipContent = (
    <div className="text-sm space-y-3">
      <div className="flex items-center gap-2">
        <div
          className="w-12 h-12 flex-shrink-0"
          style={{ clipPath: starClipPath }}
        >
          <img
            src={src || defaultSrc}
            alt={alt || defaultAlt}
            className="w-full h-full object-cover"
            style={{ clipPath: starClipPath }}
          />
        </div>
        <div>
          <div className="font-medium">{nickname}</div>
          {leaderboardPosition !== undefined && (
            <div className="text-xs text-slate-400 dark:text-slate-100 mt-0.5">
              Star Order: #{leaderboardPosition}
            </div>
          )}
          {(walletAddress || githubUrl || linkedinUrl) && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700">
              {walletAddress && (
                <Link
                  uri={getExplorerUrl(walletAddress)}
                  asNewTab={true}
                  className="text-[10px] text-blue-500 dark:text-blue-400 hover:text-teal-300 dark:hover:text-teal-200"
                >
                  {getIcon({ iconType: 'wallet', className: 'w-3 h-3', fill: 'currentColor' })}
                </Link>
              )}
              {githubUrl && (
                <>
                  {walletAddress && <span className="text-[10px] text-slate-500">•</span>}
                  <Link
                    uri={githubUrl}
                    asNewTab={true}
                    className="text-[10px] text-blue-500 dark:text-blue-400 hover:text-teal-300 dark:hover:text-teal-200"
                  >
                    {getIcon({ iconType: 'github', className: 'w-3 h-3', fill: 'currentColor' })}
                  </Link>
                </>
              )}
              {linkedinUrl && (
                <>
                  {(walletAddress || githubUrl) && <span className="text-[10px] text-slate-500">•</span>}
                  <Link
                    uri={linkedinUrl}
                    asNewTab={true}
                    className="text-[10px] text-blue-500 dark:text-blue-400 hover:text-teal-300 dark:hover:text-teal-200"
                  >
                    {getIcon({ iconType: 'linkedin', className: 'w-3 h-3', fill: 'currentColor' })}
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {(funded !== undefined || received !== undefined || issuesClosed !== undefined || issuesActive !== undefined) && (
        <div className="space-y-2 pt-2 border-t border-slate-700">
          {role && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400 dark:text-slate-500">Role:</span>
              <span className="text-xs font-medium">{role}</span>
            </div>
          )}
          {funded !== undefined && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400 dark:text-slate-500">Funded:</span>
              <NumberFlow
                value={funded}
                locales="en-US"
                format={{ style: 'decimal', maximumFractionDigits: 0 }}
                className="text-xs font-medium"
              />
            </div>
          )}
          {received !== undefined && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400 dark:text-slate-500">Received:</span>
              <NumberFlow
                value={received}
                locales="en-US"
                format={{ style: 'decimal', maximumFractionDigits: 0 }}
                className="text-xs font-medium"
              />
            </div>
          )}
          {issuesClosed !== undefined && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400 dark:text-slate-500">Issues Closed:</span>
              <NumberFlow
                value={issuesClosed}
                locales="en-US"
                format={{ style: 'decimal', maximumFractionDigits: 0 }}
                className="text-xs font-medium"
              />
            </div>
          )}
          {issuesActive !== undefined && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400 dark:text-slate-500">Issues Active:</span>
              <NumberFlow
                value={issuesActive}
                locales="en-US"
                format={{ style: 'decimal', maximumFractionDigits: 0 }}
                className="text-xs font-medium"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )

  const starId = `user-star-${nickname.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <>
      <style>{`
        @keyframes starPulse-${starId} {
          0%, 100% {
            opacity: ${opacity};
            transform: scale(1);
          }
          50% {
            opacity: ${Math.min(1, opacity + 0.2)};
            transform: scale(${isMaintainer ? '1.15' : '1.1'});
          }
        }
        
        ${isMaintainer ? `
        @keyframes maintainerGlow-${starId} {
          0%, 100% {
            filter: blur(${blurAmount}px) drop-shadow(0 0 20px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 40px rgba(255, 255, 0, 0.6));
          }
          50% {
            filter: blur(${blurAmount}px) drop-shadow(0 0 30px rgba(255, 215, 0, 1)) drop-shadow(0 0 60px rgba(255, 255, 0, 0.9));
          }
        }
        ` : ''}
        
        @keyframes starRotate-${starId} {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .star-glow-container-${starId} {
          position: relative;
          width: ${size}px;
          height: ${size}px;
          display: flex;
          align-items: center;
          justify-content: center;
          ${isMaintainer ? 'z-index: 100;' : isFirstPlace ? 'z-index: 50;' : ''}
        }
        
        .star-glow-${starId} {
          position: absolute;
          width: 100%;
          height: 100%;
          clip-path: ${starClipPath};
          background: ${glowGradient1};
          filter: blur(${blurAmount}px)${isMaintainer ? ' drop-shadow(0 0 20px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 40px rgba(255, 255, 0, 0.6))' : ''};
          opacity: ${opacity};
          animation: starPulse-${starId} ${isMaintainer ? '2s' : '3s'} ease-in-out infinite, starRotate-${starId} 20s linear infinite${isMaintainer ? `, maintainerGlow-${starId} 2s ease-in-out infinite` : ''};
          pointer-events: none;
          transition: filter 0.3s ease, opacity 0.3s ease;
        }
        
        .star-glow-container-${starId}:hover .star-glow-${starId} {
          filter: blur(0px)${isMaintainer ? ' drop-shadow(0 0 25px rgba(255, 215, 0, 1))' : ''};
          opacity: 1;
        }
        
        .star-glow-2-${starId} {
          animation-delay: -1s;
          background: ${glowGradient2};
          filter: blur(${blurAmount + 2}px)${isMaintainer ? ' drop-shadow(0 0 15px rgba(255, 255, 100, 0.6))' : ''};
          opacity: ${opacity * 0.75};
          transition: filter 0.3s ease, opacity 0.3s ease;
        }
        
        .star-glow-container-${starId}:hover .star-glow-2-${starId} {
          filter: blur(2px)${isMaintainer ? ' drop-shadow(0 0 20px rgba(255, 255, 100, 0.8))' : ''};
          opacity: 0.75;
        }
        
        .star-glow-3-${starId} {
          animation-delay: -2s;
          background: ${glowGradient3};
          filter: blur(${blurAmount + 4}px)${isMaintainer ? ' drop-shadow(0 0 10px rgba(255, 200, 0, 0.5))' : ''};
          opacity: ${opacity * 0.6};
          transition: filter 0.3s ease, opacity 0.3s ease;
        }
        
        .star-glow-container-${starId}:hover .star-glow-3-${starId} {
          filter: blur(4px)${isMaintainer ? ' drop-shadow(0 0 15px rgba(255, 200, 0, 0.7))' : ''};
          opacity: 0.6;
        }
        
        .star-avatar-${starId} {
          position: relative;
          z-index: 1;
          width: ${size}px;
          height: ${size}px;
          clip-path: ${starClipPath};
          overflow: hidden;
          opacity: ${opacity};
          transition: opacity 0.3s ease;
          ${isMaintainer ? 'box-shadow: 0 0 30px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 255, 0, 0.4);' : ''}
          ${isFirstPlace ? 'box-shadow: 0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 255, 0, 0.3);' : ''}
        }
        
        .star-glow-container-${starId}:hover .star-avatar-${starId} {
          opacity: 1;
          ${isMaintainer ? 'box-shadow: 0 0 40px rgba(255, 215, 0, 0.8), 0 0 80px rgba(255, 255, 0, 0.6);' : ''}
          ${isFirstPlace ? 'box-shadow: 0 0 30px rgba(255, 215, 0, 0.7), 0 0 60px rgba(255, 255, 0, 0.5);' : ''}
        }
        
        .star-avatar-${starId} img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>

      <div
        className={`absolute ${className || ''}`}
        style={{
          left: `${x}px`,
          top: `${y}px`,
          zIndex: isMaintainer ? 100 : isFirstPlace ? 50 : undefined
        }}
      >
        <Tooltip content={tooltipContent}>
          <Link uri={profileUri} >
            <div className="flex flex-col items-center gap-1">
              {/* Star container with glows and avatar */}
              <div className={`star-glow-container-${starId}`}>
                {/* Glowing layers that pulse and rotate */}
                <div className={`star-glow-${starId}`} />
                <div className={`star-glow-${starId} star-glow-2-${starId}`} />
                <div className={`star-glow-${starId} star-glow-3-${starId}`} />

                {/* Avatar inside the star */}
                <div className={`star-avatar-${starId} hover:opacity-80 transition-opacity p-3 border-2 border-red-500 hover:bg-teal-300 bg-blue-200 dark:bg-blue-400! dark:hover:bg-teal-300! dark:hover:blur-sm`}>
                  <img
                    src={src || defaultSrc}
                    alt={alt || defaultAlt}
                    className={imgClassName || ''}
                  />
                </div>
              </div>
            </div>
          </Link>
          {/* Stars and sunshines under the icon */}
          <div className="flex items-center gap-2">
            {stars !== undefined && (
              <div className="flex items-center gap-1">
                {getIcon({ iconType: 'star', className: 'w-3 h-3', fill: 'currentColor' })}
                <NumberFlow
                  value={stars}
                  locales="en-US"
                  format={{ style: 'decimal', maximumFractionDigits: 2 }}
                  className="text-[10px]"
                />
              </div>
            )}
            {sunshines !== undefined && (
              <div className="flex items-center gap-1">
                {getIcon({ iconType: 'sunshine', className: 'w-3 h-3' })}
                <NumberFlow
                  value={sunshines}
                  locales="en-US"
                  format={{ style: 'decimal', maximumFractionDigits: 0 }}
                  className="text-[10px]"
                />
              </div>
            )}
          </div>
        </Tooltip >
      </div >
    </>
  )
}

export default UserStar

