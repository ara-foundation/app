import React, { useMemo } from 'react'
import Tooltip from '@/components/custom-ui/Tooltip'
import Link from '@/components/custom-ui/Link'
import { getIcon } from '@/components/icon'
import NumberFlow from '@number-flow/react'
import { GalaxyData } from '@/data/mock-data'

interface ProjectGalaxyProps {
  x: number
  y: number
  projectName: string
  projectId?: string
  galaxyData?: GalaxyData
  className?: string
}

const ProjectGalaxy: React.FC<ProjectGalaxyProps> = ({
  x,
  y,
  projectName,
  projectId,
  galaxyData,
  className,
}) => {
  const galaxyId = useMemo(() => `project-galaxy-${projectName.replace(/\s+/g, '-').toLowerCase()}`, [projectName])
  
  // Generate projectId from name if not provided
  const finalProjectId = projectId || projectName.toLowerCase().replace(/\s+/g, '-')
  const projectUrl = `/project?galaxy=${finalProjectId}`

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
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
          {projectName}
        </h3>
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
        
        .galaxy-spiral-container-${galaxyId} {
          position: relative;
          width: 96px;
          height: 96px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          animation: galaxyRotate-${galaxyId} 90s linear infinite;
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
            <div className="flex flex-col items-center gap-1 cursor-pointer">
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
