import React, { useMemo, useState, useRef, useCallback } from 'react'
import Link from '@/components/custom-ui/Link'
import Tooltip from '@/components/custom-ui/Tooltip'
import NumberFlow from '@number-flow/react'
import { getIcon } from '@/components/icon'
import { SPACE_EVENT_TYPES } from '@/types/all-stars'

interface UserStarProps {
  x: number
  y: number
  src?: string
  alt?: string
  className?: string
  imgClassName?: string
  uri?: string
  userId?: string
  nickname: string
  email?: string
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
  tags?: string[] // User interests, technologies, keywords (max 5)
  animationDelay?: number // Delay for orchestrated animations (in seconds)
  draggable?: boolean // Whether this star can be dragged
  disableTooltip?: boolean // Whether to disable tooltip
  disableEllipses?: boolean // Whether to disable ellipses and tag badges
}

// 5-pointed star clip-path polygon
const starClipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'

const UserStar: React.FC<UserStarProps> = ({
  x,
  y,
  userId,
  src,
  alt,
  className,
  imgClassName,
  uri = '/user',
  nickname,
  email,
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
  tags = ["Maintainer", "Django", "Solidity", "p2p"],
  animationDelay = 0,
  draggable = false,
  disableTooltip = false,
  disableEllipses = false,
}) => {
  const defaultSrc = 'https://api.backdropbuild.com/storage/v1/object/public/avatars/9nFM8HasgS.jpeg'
  const defaultAlt = 'Avatar'
  const profileUri = `${uri}?email=${email}`

  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const [dragPosition, setDragPosition] = useState({ x, y })
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const starElementRef = useRef<HTMLDivElement>(null)

  // Memoize expensive calculations
  const { starLevel, isMaintainer, isFirstPlace, isSecondPlace, isThirdPlace, opacity, blurAmount, size } = useMemo(() => {
    // Calculate star level (1-10) from stars prop
    const level = stars !== undefined
      ? stars >= 1 && stars <= 10
        ? Math.round(stars)
        : Math.max(1, Math.min(10, Math.round((stars / 5) * 10) || 1))
      : 1

    // Determine special status
    const maintainer = role === 'Maintainer'
    const firstPlace = leaderboardPosition === 1
    const secondPlace = leaderboardPosition === 2
    const thirdPlace = leaderboardPosition === 3

    // Calculate level-based styling values
    const baseOpacity = 0.35 + ((level - 1) / 9) * 0.65
    const finalOpacity = maintainer || firstPlace ? 1.0 : baseOpacity

    const baseBlur = 12 - ((level - 1) / 9) * 12
    const finalBlur = maintainer || firstPlace ? 0 : baseBlur

    const baseSize = 32 + ((level - 1) / 9) * 16
    const finalSize = maintainer ? 72 : firstPlace ? 64 : baseSize

    return {
      starLevel: level,
      isMaintainer: maintainer,
      isFirstPlace: firstPlace,
      isSecondPlace: secondPlace,
      isThirdPlace: thirdPlace,
      opacity: finalOpacity,
      blurAmount: finalBlur,
      size: finalSize,
    }
  }, [stars, role, leaderboardPosition])

  // Memoize glow gradients
  const { glowGradient1, glowGradient2, glowGradient3 } = useMemo(() => {
    if (isSecondPlace) {
      return {
        glowGradient1: 'radial-gradient(circle, rgba(192, 192, 192, 0.9) 0%, rgba(230, 230, 230, 0.5) 50%, transparent 100%)',
        glowGradient2: 'radial-gradient(circle, rgba(220, 220, 220, 0.7) 0%, rgba(192, 192, 192, 0.4) 50%, transparent 100%)',
        glowGradient3: 'radial-gradient(circle, rgba(200, 200, 200, 0.6) 0%, rgba(240, 240, 240, 0.3) 50%, transparent 100%)',
      }
    } else if (isThirdPlace) {
      return {
        glowGradient1: 'radial-gradient(circle, rgba(205, 127, 50, 0.9) 0%, rgba(255, 200, 100, 0.5) 50%, transparent 100%)',
        glowGradient2: 'radial-gradient(circle, rgba(255, 180, 80, 0.7) 0%, rgba(205, 127, 50, 0.4) 50%, transparent 100%)',
        glowGradient3: 'radial-gradient(circle, rgba(220, 150, 70, 0.6) 0%, rgba(255, 220, 150, 0.3) 50%, transparent 100%)',
      }
    } else {
      return {
        glowGradient1: 'radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, rgba(255, 255, 0, 0.4) 50%, transparent 100%)',
        glowGradient2: 'radial-gradient(circle, rgba(255, 255, 100, 0.6) 0%, rgba(255, 215, 0, 0.3) 50%, transparent 100%)',
        glowGradient3: 'radial-gradient(circle, rgba(255, 200, 0, 0.5) 0%, rgba(255, 255, 150, 0.2) 50%, transparent 100%)',
      }
    }
  }, [isSecondPlace, isThirdPlace])

  // Drag handlers
  const handleDragStart = useCallback((e: React.DragEvent) => {
    if (!draggable) return
    setIsDragging(true)
    const rect = starElementRef.current?.getBoundingClientRect()
    if (rect) {
      dragOffsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', '') // Required for Firefox
  }, [draggable])

  const handleDrag = useCallback((e: React.DragEvent) => {
    if (!draggable || !isDragging) return
    e.preventDefault()

    const container = document.querySelector('#galaxy-space')
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    // Get the transform scale from computed style
    const computedStyle = window.getComputedStyle(container)
    const transform = computedStyle.transform
    let scale = 1
    if (transform && transform !== 'none') {
      const matrix = transform.match(/matrix\(([^)]+)\)/)
      if (matrix) {
        const values = matrix[1].split(',')
        scale = parseFloat(values[0]) || 1
      }
    }

    // Account for scale when calculating position
    const newX = (e.clientX - containerRect.left - dragOffsetRef.current.x) / scale
    const newY = (e.clientY - containerRect.top - dragOffsetRef.current.y) / scale

    setDragPosition({ x: newX, y: newY })
  }, [draggable, isDragging])

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    if (!draggable) return
    setIsDragging(false)

    const container = document.querySelector('#galaxy-space')
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    // Get the transform scale from computed style
    const computedStyle = window.getComputedStyle(container)
    const transform = computedStyle.transform
    let scale = 1
    if (transform && transform !== 'none') {
      const matrix = transform.match(/matrix\(([^)]+)\)/)
      if (matrix) {
        const values = matrix[1].split(',')
        scale = parseFloat(values[0]) || 1
      }
    }

    // Account for scale when calculating final position
    const finalX = (e.clientX - containerRect.left - dragOffsetRef.current.x) / scale
    const finalY = (e.clientY - containerRect.top - dragOffsetRef.current.y) / scale

    // Dispatch event to update star position
    const event = new CustomEvent(SPACE_EVENT_TYPES.USER_STAR_MOVED, {
      detail: {
        userId,
        nickname,
        x: finalX,
        y: finalY,
      },
    })
    window.dispatchEvent(event)

    setDragPosition({ x: finalX, y: finalY })
  }, [draggable, nickname])

  // Update position when x or y prop changes (but not during drag)
  React.useEffect(() => {
    if (!isDragging) {
      setDragPosition({ x, y })
    }
  }, [x, y, isDragging])

  // Tooltip content based on draggable state
  const tooltipContent = draggable ? (
    <div className="text-sm">
      <p className="font-medium">Drag and drop around the page to move the location</p>
    </div>
  ) : (
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
          {(stars !== undefined || sunshines !== undefined) && (
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-700">
              {stars !== undefined && (
                <div className="flex items-center gap-1">
                  {getIcon({ iconType: 'star', className: 'w-3 h-3 text-yellow-500', fill: 'currentColor' })}
                  <NumberFlow
                    value={stars}
                    locales="en-US"
                    format={{ style: 'decimal', maximumFractionDigits: 2 }}
                    className="text-xs font-medium"
                  />
                </div>
              )}
              {sunshines !== undefined && (
                <div className="flex items-center gap-1">
                  {getIcon({ iconType: 'sunshine', className: 'w-3 h-3 text-orange-500' })}
                  <NumberFlow
                    value={sunshines}
                    locales="en-US"
                    format={{ style: 'decimal', maximumFractionDigits: 0 }}
                    className="text-xs font-medium"
                  />
                </div>
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

  const starId = useMemo(() => `user-star-${nickname.replace(/\s+/g, '-').toLowerCase()}`, [nickname])

  // Memoize ellipse calculations
  const { ellipses, tagsEllipseRadius, tagsEllipseRotationDuration } = useMemo(() => {
    const totalSunshines = sunshines || 0
    const fullEllipseCount = Math.floor(totalSunshines / 100)
    const remainingSunshines = totalSunshines % 100

    const fullEllipses = Array.from({ length: fullEllipseCount }, (_, i) => ({
      id: i,
      radius: size / 2 + 15 + (i * 20),
      rotationDuration: 20 + (i * 5),
      isPartial: false,
      partialOpacity: 1,
    }))

    const partialOpacity = remainingSunshines > 0 ? Math.min(1.0, (remainingSunshines / 100) * 2) : 0
    const ellipseList = remainingSunshines > 0
      ? [
        ...fullEllipses,
        {
          id: fullEllipseCount,
          radius: size / 2 + 15 + (fullEllipseCount * 20),
          rotationDuration: 20 + (fullEllipseCount * 5),
          isPartial: true,
          partialOpacity: partialOpacity,
        }
      ]
      : fullEllipses

    const maxEllipseRadius = ellipseList.length > 0
      ? Math.max(...ellipseList.map(e => e.radius))
      : size / 2
    const tagsRadius = maxEllipseRadius + 25

    return {
      ellipses: ellipseList,
      tagsEllipseRadius: tagsRadius,
      tagsEllipseRotationDuration: 30,
    }
  }, [sunshines, size])

  // Memoize badge positions
  const { validTags, badgePositions } = useMemo(() => {
    const warmMutedColors = [
      'rgba(255, 183, 127, 0.1)',
      'rgba(255, 159, 100, 0.1)',
      'rgba(255, 182, 193, 0.1)',
      'rgba(255, 160, 180, 0.1)',
      'rgba(245, 222, 179, 0.1)',
      'rgba(238, 203, 173, 0.1)',
      'rgba(255, 127, 80, 0.1)',
      'rgba(250, 128, 114, 0.1)',
      'rgba(255, 218, 185, 0.1)',
      'rgba(255, 192, 203, 0.1)',
    ]

    const valid = tags ? tags.slice(0, 5) : []
    const positions = valid.map((tag, index) => {
      const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const angle = (hash % 360) + (index * 72)
      const normalizedAngle = angle % 360
      const colorIndex = hash % warmMutedColors.length
      return {
        tag,
        angle: normalizedAngle,
        x: tagsEllipseRadius * Math.cos((normalizedAngle - 90) * (Math.PI / 180)),
        y: tagsEllipseRadius * Math.sin((normalizedAngle - 90) * (Math.PI / 180)),
        rotationSpeed: 15 + (index * 5),
        color: warmMutedColors[colorIndex],
      }
    })

    return { validTags: valid, badgePositions: positions }
  }, [tags, tagsEllipseRadius])

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
        
        ${ellipses.map((ellipse) => `
        .ellipse-orbit-${starId}-${ellipse.id} {
          position: absolute;
          top: 50%;
          left: 50%;
          width: ${ellipse.radius * 2}px;
          height: ${ellipse.radius * 2}px;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        
        .ellipse-ring-${starId}-${ellipse.id} {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 1.5px transparent;
          border-image: linear-gradient(135deg, rgba(192, 192, 192, ${ellipse.isPartial ? 0.2 * ellipse.partialOpacity : 0.4}), rgba(173, 216, 230, ${ellipse.isPartial ? 0.2 * ellipse.partialOpacity : 0.4}), rgba(192, 192, 192, ${ellipse.isPartial ? 0.2 * ellipse.partialOpacity : 0.4})) 1;
          border-radius: 50%;
          box-shadow: 
            0 0 10px rgba(192, 192, 192, ${ellipse.isPartial ? 0.15 * ellipse.partialOpacity : 0.3}),
            0 0 20px rgba(173, 216, 230, ${ellipse.isPartial ? 0.1 * ellipse.partialOpacity : 0.2}),
            inset 0 0 10px rgba(192, 192, 192, ${ellipse.isPartial ? 0.1 * ellipse.partialOpacity : 0.2}),
            inset 0 0 20px rgba(173, 216, 230, ${ellipse.isPartial ? 0.05 * ellipse.partialOpacity : 0.1});
          opacity: ${ellipse.isPartial ? 0.5 * ellipse.partialOpacity : 0.5};
          animation: orbitRotate-${starId}-${ellipse.id} ${ellipse.rotationDuration}s linear infinite${ellipse.isPartial ? `, ellipsePulse-${starId}-${ellipse.id} 2s ease-in-out infinite` : ''};
        }
        
        .ellipse-beam-wrapper-${starId}-${ellipse.id} {
          position: absolute;
          top: 50%;
          left: 50%;
          width: ${ellipse.radius * 2}px;
          height: ${ellipse.radius * 2}px;
          transform: translate(-50%, -50%);
          animation: beamOrbit-${starId}-${ellipse.id} ${ellipse.rotationDuration}s linear infinite;
        }
        
        .ellipse-beam-${starId}-${ellipse.id} {
          position: absolute;
          top: 0;
          left: 50%;
          width: 6px;
          height: 6px;
          margin-left: -3px;
          margin-top: -3px;
          background: radial-gradient(circle, rgba(192, 192, 192, ${ellipse.isPartial ? 0.8 * ellipse.partialOpacity : 0.8}) 0%, rgba(173, 216, 230, ${ellipse.isPartial ? 0.6 * ellipse.partialOpacity : 0.6}) 50%, transparent 100%);
          border-radius: 50%;
          box-shadow: 
            0 0 8px rgba(192, 192, 192, ${ellipse.isPartial ? 0.8 * ellipse.partialOpacity : 0.8}),
            0 0 16px rgba(173, 216, 230, ${ellipse.isPartial ? 0.6 * ellipse.partialOpacity : 0.6});
          animation: beamPulse-${starId}-${ellipse.id} 2s ease-in-out infinite;
          opacity: ${ellipse.isPartial ? ellipse.partialOpacity : 1};
        }
        
        @keyframes orbitRotate-${starId}-${ellipse.id} {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        
        @keyframes beamOrbit-${starId}-${ellipse.id} {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        
        @keyframes beamPulse-${starId}-${ellipse.id} {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.3);
            opacity: 1;
          }
        }
        
        ${ellipse.isPartial ? `
        @keyframes ellipsePulse-${starId}-${ellipse.id} {
          0%, 100% {
            opacity: ${0.5 * ellipse.partialOpacity};
            transform: scale(1);
          }
          50% {
            opacity: ${0.7 * ellipse.partialOpacity};
            transform: scale(1.05);
          }
        }
        ` : ''}
        `).join('')}
        
        ${validTags.length > 0 ? `
        .tags-ellipse-${starId} {
          position: absolute;
          top: 50%;
          left: 50%;
          width: ${tagsEllipseRadius * 2}px;
          height: ${tagsEllipseRadius * 2}px;
          margin-top: -${tagsEllipseRadius}px;
          margin-left: -${tagsEllipseRadius}px;
          pointer-events: none;
        }
        
        .tags-ellipse-ring-${starId} {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 1px solid;
          border-color: rgba(192, 192, 192, 0.1);
          border-radius: 50%;
          opacity: 0.2;
          animation: tagsEllipseRotate-${starId} ${tagsEllipseRotationDuration}s linear infinite;
          animation-delay: ${animationDelay}s;
        }
        
        @keyframes tagsEllipseRotate-${starId} {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        ` : ''}
        
        ${badgePositions.map((badge, index) => `
        .tag-badge-${starId}-${index} {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          animation: badgeRotate-${starId}-${index} ${badge.rotationSpeed}s linear infinite;
          animation-delay: ${animationDelay + (index * 0.2)}s;
          pointer-events: auto;
          z-index: 10;
        }
        
        .tag-badge-content-${starId}-${index} {
          position: absolute;
          top: ${badge.y}px;
          left: ${badge.x}px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          width: auto;
          min-width: 24px;
          height: 24px;
          padding: 4px 8px;
          border-radius: 50%;
          background: ${badge.color};
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          opacity: 0.6;
          transition: opacity 0.3s ease, transform 0.3s ease;
          cursor: pointer;
          transform: translate(-50%, -50%);
          animation: badgeContentCounterRotate-${starId}-${index} ${badge.rotationSpeed}s linear infinite;
          animation-delay: ${animationDelay + (index * 0.2)}s;
        }
        
        .tag-badge-content-${starId}-${index}:hover {
          opacity: 0.9;
          transform: translate(-50%, -50%) scale(1.1);
        }
        
        @keyframes badgeRotate-${starId}-${index} {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes badgeContentCounterRotate-${starId}-${index} {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(-360deg);
          }
        }
        `).join('')}
      `}</style>

      <div
        ref={starElementRef}
        className={`absolute ${className || ''} ${draggable ? 'cursor-move' : ''} ${isDragging ? 'opacity-50 z-[1000]' : ''}`}
        style={{
          left: `${isDragging ? dragPosition.x : x}px`,
          top: `${isDragging ? dragPosition.y : y}px`,
          zIndex: isDragging ? 1000 : (isMaintainer ? 100 : isFirstPlace ? 50 : undefined),
          willChange: draggable ? 'transform' : undefined,
        }}
        draggable={draggable}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      >
        {disableTooltip ? (
          <>
            {draggable ? (
              <div className="flex flex-col items-center gap-1">
                {/* Star container with glows and avatar */}
                <div className={`star-glow-container-${starId} `}>
                  {/* Tags ellipse (transparent, outermost) */}
                  {!disableEllipses && validTags.length > 0 && (
                    <div className={`tags-ellipse-${starId}`}>
                      <div className={`tags-ellipse-ring-${starId}`} />
                    </div>
                  )}

                  {/* Orbital ellipses */}
                  {!disableEllipses && ellipses.map((ellipse) => (
                    <div key={ellipse.id} className={`ellipse-orbit-${starId}-${ellipse.id} `}>
                      {/* Ellipse ring */}
                      <div className={`ellipse-ring-${starId}-${ellipse.id} `} />
                      {/* Rotating beam wrapper */}
                      <div className={`ellipse-beam-wrapper-${starId}-${ellipse.id}`}>
                        <div className={`ellipse-beam-${starId}-${ellipse.id} `} />
                      </div>
                    </div>
                  ))}

                  {/* Tag badges */}
                  {!disableEllipses && badgePositions.map((badge, index) => (
                    <div
                      key={`${badge.tag}-${index}`}
                      className={`tag-badge-${starId}-${index}`}
                    >
                      <Tooltip content={badge.tag}>
                        <div className={`tag-badge-content-${starId}-${index}`}>
                          {getIcon({ iconType: 'star', className: 'w-3 h-3', fill: 'currentColor' })}
                          <span className="text-[10px] font-medium">{badge.tag}</span>
                        </div>
                      </Tooltip>
                    </div>
                  ))}

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
            ) : (
              <Link uri={profileUri}>
                <div className="flex flex-col items-center gap-1">
                  {/* Star container with glows and avatar */}
                  <div className={`star-glow-container-${starId} `}>
                    {/* Tags ellipse (transparent, outermost) */}
                    {!disableEllipses && validTags.length > 0 && (
                      <div className={`tags-ellipse-${starId}`}>
                        <div className={`tags-ellipse-ring-${starId}`} />
                      </div>
                    )}

                    {/* Orbital ellipses */}
                    {!disableEllipses && ellipses.map((ellipse) => (
                      <div key={ellipse.id} className={`ellipse-orbit-${starId}-${ellipse.id} `}>
                        {/* Ellipse ring */}
                        <div className={`ellipse-ring-${starId}-${ellipse.id} `} />
                        {/* Rotating beam wrapper */}
                        <div className={`ellipse-beam-wrapper-${starId}-${ellipse.id}`}>
                          <div className={`ellipse-beam-${starId}-${ellipse.id} `} />
                        </div>
                      </div>
                    ))}

                    {/* Tag badges */}
                    {!disableEllipses && badgePositions.map((badge, index) => (
                      <div
                        key={`${badge.tag}-${index}`}
                        className={`tag-badge-${starId}-${index}`}
                      >
                        <Tooltip content={badge.tag}>
                          <div className={`tag-badge-content-${starId}-${index}`}>
                            {getIcon({ iconType: 'star', className: 'w-3 h-3', fill: 'currentColor' })}
                            <span className="text-[10px] font-medium">{badge.tag}</span>
                          </div>
                        </Tooltip>
                      </div>
                    ))}

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
            )}
            {/* User name under the icon */}
            <div className="text-center mt-1">
              <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">{nickname}</span>
            </div>
          </>
        ) : (
          <Tooltip content={tooltipContent}>
            {draggable ? (
              <div className="flex flex-col items-center gap-1">
                {/* Star container with glows and avatar */}
                <div className={`star-glow-container-${starId} `}>
                  {/* Tags ellipse (transparent, outermost) */}
                  {!disableEllipses && validTags.length > 0 && (
                    <div className={`tags-ellipse-${starId}`}>
                      <div className={`tags-ellipse-ring-${starId}`} />
                    </div>
                  )}

                  {/* Orbital ellipses */}
                  {!disableEllipses && ellipses.map((ellipse) => (
                    <div key={ellipse.id} className={`ellipse-orbit-${starId}-${ellipse.id} `}>
                      {/* Ellipse ring */}
                      <div className={`ellipse-ring-${starId}-${ellipse.id} `} />
                      {/* Rotating beam wrapper */}
                      <div className={`ellipse-beam-wrapper-${starId}-${ellipse.id}`}>
                        <div className={`ellipse-beam-${starId}-${ellipse.id} `} />
                      </div>
                    </div>
                  ))}

                  {/* Tag badges */}
                  {!disableEllipses && badgePositions.map((badge, index) => (
                    <div
                      key={`${badge.tag}-${index}`}
                      className={`tag-badge-${starId}-${index}`}
                    >
                      <Tooltip content={badge.tag}>
                        <div className={`tag-badge-content-${starId}-${index}`}>
                          {getIcon({ iconType: 'star', className: 'w-3 h-3', fill: 'currentColor' })}
                          <span className="text-[10px] font-medium">{badge.tag}</span>
                        </div>
                      </Tooltip>
                    </div>
                  ))}

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
            ) : (
              <Link uri={profileUri}>
                <div className="flex flex-col items-center gap-1">
                  {/* Star container with glows and avatar */}
                  <div className={`star-glow-container-${starId} `}>
                    {/* Tags ellipse (transparent, outermost) */}
                    {!disableEllipses && validTags.length > 0 && (
                      <div className={`tags-ellipse-${starId}`}>
                        <div className={`tags-ellipse-ring-${starId}`} />
                      </div>
                    )}

                    {/* Orbital ellipses */}
                    {!disableEllipses && ellipses.map((ellipse) => (
                      <div key={ellipse.id} className={`ellipse-orbit-${starId}-${ellipse.id} `}>
                        {/* Ellipse ring */}
                        <div className={`ellipse-ring-${starId}-${ellipse.id} `} />
                        {/* Rotating beam wrapper */}
                        <div className={`ellipse-beam-wrapper-${starId}-${ellipse.id}`}>
                          <div className={`ellipse-beam-${starId}-${ellipse.id} `} />
                        </div>
                      </div>
                    ))}

                    {/* Tag badges */}
                    {!disableEllipses && badgePositions.map((badge, index) => (
                      <div
                        key={`${badge.tag}-${index}`}
                        className={`tag-badge-${starId}-${index}`}
                      >
                        <Tooltip content={badge.tag}>
                          <div className={`tag-badge-content-${starId}-${index}`}>
                            {getIcon({ iconType: 'star', className: 'w-3 h-3', fill: 'currentColor' })}
                            <span className="text-[10px] font-medium">{badge.tag}</span>
                          </div>
                        </Tooltip>
                      </div>
                    ))}

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
            )}
            {/* User name under the icon */}
            <div className="text-center mt-1">
              <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">{nickname}</span>
            </div>
          </Tooltip>
        )}
      </div >
    </>
  )
}

export default UserStar

