import React, { useMemo } from 'react'
import Tooltip from '@/components/custom-ui/Tooltip'
import Link from '@/components/custom-ui/Link'
import { getIcon } from '@/components/icon'
import NumberFlow from '@number-flow/react'
import { GalaxyModel } from '@/scripts/galaxy'

interface ProjectGalaxyProps {
  x: number
  y: number
  projectName: string
  projectId?: string
  galaxyData?: GalaxyModel
  tags?: string[]
  leaderboardPosition?: number
  className?: string
}

const ProjectGalaxy: React.FC<ProjectGalaxyProps> = ({
  x,
  y,
  projectName,
  projectId,
  galaxyData,
  tags,
  leaderboardPosition,
  className,
}) => {
  const galaxyId = useMemo(() => `project-galaxy-${projectName.replace(/\s+/g, '-').toLowerCase()}`, [projectName])

  // Generate projectId from name if not provided
  const finalProjectId = projectId || projectName.toLowerCase().replace(/\s+/g, '-')
  const projectUrl = `/project?galaxy=${finalProjectId}`

  // Galaxy size (96px diameter, 48px radius)
  const galaxySize = 96
  const galaxyRadius = 48
  const tagsEllipseRadius = galaxyRadius + 30 // 30px beyond galaxy edge

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

  // Create spiral path data for SVG
  const createSpiralPath = (startAngle: number, turns: number = 2.5) => {
    const points: string[] = []
    const center = 48 // Half of 96px
    const steps = 100

    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const angle = startAngle + (t * turns * Math.PI * 2)
      const radius = center * (0.1 + t * 0.9) // Start from 10% to 100% of radius
      const x = center + Math.cos(angle) * radius
      const y = center + Math.sin(angle) * radius
      points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`)
    }

    return points.join(' ')
  }

  // Create tooltip content
  const tooltipContent = galaxyData ? (
    <div className="text-sm space-y-3 max-w-xs">
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
          {projectName}
        </h3>
        {leaderboardPosition !== undefined && (
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Leaderboard: #{leaderboardPosition} galaxy
          </div>
        )}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
          {galaxyData.description}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1">
          {getIcon({ iconType: 'star', className: 'w-4 h-4 text-yellow-500' })}
          <NumberFlow
            value={galaxyData.stars}
            locales="en-US"
            format={{ style: 'decimal', maximumFractionDigits: 1 }}
            className="text-xs font-medium"
          />
        </div>
        <div className="flex items-center gap-1">
          {getIcon({ iconType: 'sunshine', className: 'w-4 h-4 text-orange-500' })}
          <NumberFlow
            value={galaxyData.sunshines}
            locales="en-US"
            format={{ style: 'decimal', maximumFractionDigits: 0 }}
            className="text-xs font-medium"
          />
        </div>
        <div className="flex items-center gap-1">
          {getIcon({ iconType: 'user', className: 'w-4 h-4 text-blue-500' })}
          <NumberFlow
            value={galaxyData.users}
            locales="en-US"
            format={{ style: 'decimal', maximumFractionDigits: 0 }}
            className="text-xs font-medium"
          />
        </div>
      </div>

      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          View the galaxy page. Join it.
        </p>
      </div>
    </div>
  ) : (
    <div className="text-sm">
      <p className="font-medium">{projectName}</p>
      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
        View the galaxy page. Join it.
      </p>
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes galaxyRotate-${galaxyId} {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes galaxyPulse-${galaxyId} {
          0%, 100% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }
        
        .galaxy-spiral-container-${galaxyId} {
          position: relative;
          width: 96px;
          height: 96px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          animation: galaxyRotate-${galaxyId} 90s linear infinite;
          transition: transform 0.3s ease;
        }
        
        .galaxy-wrapper-${galaxyId}:hover .galaxy-spiral-container-${galaxyId} {
          animation: galaxyRotate-${galaxyId} 90s linear infinite, galaxyPulse-${galaxyId} 2s ease-in-out infinite;
        }
        
        .galaxy-core-${galaxyId} {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 1) 0%,
            rgba(255, 255, 200, 0.9) 30%,
            rgba(255, 200, 100, 0.7) 60%,
            transparent 100%
          );
          box-shadow: 
            0 0 20px rgba(255, 255, 255, 0.8),
            0 0 40px rgba(255, 255, 200, 0.6),
            0 0 60px rgba(255, 200, 100, 0.4);
          z-index: 3;
        }
        
        .galaxy-spiral-arm-${galaxyId} {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0.7;
        }
        
        .galaxy-spiral-arm-${galaxyId} path {
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          transition: stroke 0.3s ease, opacity 0.3s ease;
        }
        
        .galaxy-spiral-arm-1-${galaxyId} path {
          stroke: url(#spiralGradient1-${galaxyId});
        }
        
        .galaxy-spiral-arm-2-${galaxyId} path {
          stroke: url(#spiralGradient2-${galaxyId});
        }
        
        .galaxy-spiral-arm-3-${galaxyId} path {
          stroke: url(#spiralGradient3-${galaxyId});
        }
        
        .galaxy-wrapper-${galaxyId}:hover .galaxy-spiral-arm-1-${galaxyId} path {
          stroke: url(#spiralGradientHover1-${galaxyId});
          opacity: 1;
        }
        
        .galaxy-wrapper-${galaxyId}:hover .galaxy-spiral-arm-2-${galaxyId} path {
          stroke: url(#spiralGradientHover2-${galaxyId});
          opacity: 1;
        }
        
        .galaxy-wrapper-${galaxyId}:hover .galaxy-spiral-arm-3-${galaxyId} path {
          stroke: url(#spiralGradientHover3-${galaxyId});
          opacity: 1;
        }
        
        .galaxy-name-${galaxyId} {
          position: relative;
          z-index: 11;
          text-align: center;
          margin-top: 4px;
          font-size: 10px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.95);
          text-shadow: 
            2px 2px 4px rgba(0, 0, 0, 0.8),
            0 0 8px rgba(0, 0, 0, 0.6),
            0 0 12px rgba(0, 0, 0, 0.4);
          pointer-events: none;
        }
        
        ${validTags.length > 0 ? `
        .tags-ellipse-${galaxyId} {
          position: absolute;
          top: 50%;
          left: 50%;
          width: ${tagsEllipseRadius * 2}px;
          height: ${tagsEllipseRadius * 2}px;
          margin-top: -${tagsEllipseRadius}px;
          margin-left: -${tagsEllipseRadius}px;
          pointer-events: none;
        }
        
        .tags-ellipse-ring-${galaxyId} {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 1px solid;
          border-color: rgba(192, 192, 192, 0.1);
          border-radius: 50%;
          opacity: 0.2;
          animation: tagsEllipseRotate-${galaxyId} 30s linear infinite;
        }
        
        @keyframes tagsEllipseRotate-${galaxyId} {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        ` : ''}
        
        ${badgePositions.map((badge, index) => `
        .tag-badge-${galaxyId}-${index} {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          animation: badgeRotate-${galaxyId}-${index} ${badge.rotationSpeed}s linear infinite;
          animation-delay: ${index * 0.2}s;
          pointer-events: auto;
          z-index: 10;
        }
        
        .tag-badge-content-${galaxyId}-${index} {
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
          animation: badgeContentCounterRotate-${galaxyId}-${index} ${badge.rotationSpeed}s linear infinite;
          animation-delay: ${index * 0.2}s;
        }
        
        .tag-badge-content-${galaxyId}-${index}:hover {
          opacity: 0.9;
          transform: translate(-50%, -50%) scale(1.1);
        }
        
        @keyframes badgeRotate-${galaxyId}-${index} {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes badgeContentCounterRotate-${galaxyId}-${index} {
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
        className={`absolute ${className || ''}`}
        style={{
          left: `${x}px`,
          top: `${y}px`,
        }}
      >
        <Tooltip content={tooltipContent}>
          <Link uri={projectUrl}>
            <div className={`flex flex-col items-center gap-1 cursor-pointer relative galaxy-wrapper-${galaxyId}`}>
              {/* Galaxy spiral container */}
              <div className={`galaxy-spiral-container-${galaxyId}`}>
                {/* SVG for spiral arms */}
                <svg
                  width="96"
                  height="96"
                  viewBox="0 0 96 96"
                  className="absolute inset-0"
                  style={{ overflow: 'visible' }}
                >
                  <defs>
                    {/* Default gradients */}
                    <linearGradient id={`spiralGradient1-${galaxyId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
                      <stop offset="30%" stopColor="rgba(255, 200, 100, 0.6)" />
                      <stop offset="60%" stopColor="rgba(200, 150, 255, 0.4)" />
                      <stop offset="100%" stopColor="rgba(100, 50, 200, 0.2)" />
                    </linearGradient>
                    <linearGradient id={`spiralGradient2-${galaxyId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(255, 255, 200, 0.8)" />
                      <stop offset="30%" stopColor="rgba(255, 180, 80, 0.5)" />
                      <stop offset="60%" stopColor="rgba(180, 120, 255, 0.3)" />
                      <stop offset="100%" stopColor="rgba(90, 40, 180, 0.15)" />
                    </linearGradient>
                    <linearGradient id={`spiralGradient3-${galaxyId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(255, 255, 150, 0.7)" />
                      <stop offset="30%" stopColor="rgba(255, 160, 60, 0.4)" />
                      <stop offset="60%" stopColor="rgba(160, 100, 255, 0.25)" />
                      <stop offset="100%" stopColor="rgba(80, 30, 160, 0.1)" />
                    </linearGradient>

                    {/* Hover gradients (brighter, more vibrant) */}
                    <linearGradient id={`spiralGradientHover1-${galaxyId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(255, 255, 255, 1)" />
                      <stop offset="30%" stopColor="rgba(255, 220, 120, 0.9)" />
                      <stop offset="60%" stopColor="rgba(220, 170, 255, 0.7)" />
                      <stop offset="100%" stopColor="rgba(120, 70, 220, 0.4)" />
                    </linearGradient>
                    <linearGradient id={`spiralGradientHover2-${galaxyId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(255, 255, 220, 1)" />
                      <stop offset="30%" stopColor="rgba(255, 200, 100, 0.8)" />
                      <stop offset="60%" stopColor="rgba(200, 140, 255, 0.6)" />
                      <stop offset="100%" stopColor="rgba(110, 60, 200, 0.3)" />
                    </linearGradient>
                    <linearGradient id={`spiralGradientHover3-${galaxyId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(255, 255, 180, 0.95)" />
                      <stop offset="30%" stopColor="rgba(255, 180, 80, 0.7)" />
                      <stop offset="60%" stopColor="rgba(180, 120, 255, 0.5)" />
                      <stop offset="100%" stopColor="rgba(100, 50, 200, 0.25)" />
                    </linearGradient>
                  </defs>

                  {/* Three spiral arms with different starting angles */}
                  <g className={`galaxy-spiral-arm-${galaxyId} galaxy-spiral-arm-1-${galaxyId}`}>
                    <path d={createSpiralPath(0, 2.5)} />
                  </g>
                  <g className={`galaxy-spiral-arm-${galaxyId} galaxy-spiral-arm-2-${galaxyId}`}>
                    <path d={createSpiralPath((Math.PI * 2) / 3, 2.5)} />
                  </g>
                  <g className={`galaxy-spiral-arm-${galaxyId} galaxy-spiral-arm-3-${galaxyId}`}>
                    <path d={createSpiralPath((Math.PI * 4) / 3, 2.5)} />
                  </g>
                </svg>

                {/* Bright core */}
                <div className={`galaxy-core-${galaxyId}`} />
              </div>

              {/* Tags ellipse (transparent, outermost) */}
              {validTags.length > 0 && (
                <div className={`tags-ellipse-${galaxyId}`}>
                  <div className={`tags-ellipse-ring-${galaxyId}`} />
                </div>
              )}

              {/* Tag badges */}
              {badgePositions.map((badge, index) => (
                <div
                  key={`${badge.tag}-${index}`}
                  className={`tag-badge-${galaxyId}-${index}`}
                >
                  <Tooltip content={badge.tag}>
                    <div className={`tag-badge-content-${galaxyId}-${index}`}>
                      {getIcon({ iconType: 'star', className: 'w-3 h-3', fill: 'currentColor' })}
                      <span className="text-[10px] font-medium">{badge.tag}</span>
                    </div>
                  </Tooltip>
                </div>
              ))}

              {/* Project name with black shadow */}
              <div className={`galaxy-name-${galaxyId}`}>
                {projectName}
              </div>
            </div>
          </Link>
        </Tooltip>
      </div>
    </>
  )
}

export default ProjectGalaxy
