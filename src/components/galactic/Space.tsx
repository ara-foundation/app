import React, { useEffect, useRef, useState } from 'react'
import UserStar from './UserStar'

export interface UserStarData {
  x: number
  y: number
  src?: string
  alt?: string
  nickname: string
  sunshines?: number
  stars?: number
  role?: string
  funded?: number
  received?: number
  issuesClosed?: number
  issuesActive?: number
  uri?: string
  walletAddress?: string
  githubUrl?: string
  linkedinUrl?: string
}

interface SpaceProps {
  users: UserStarData[]
  className?: string
}

const Space: React.FC<SpaceProps> = ({ users, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [initialViewport, setInitialViewport] = useState({ width: 0, height: 0 })

  useEffect(() => {
    // Capture initial viewport size on mount
    if (initialViewport.width === 0 && initialViewport.height === 0) {
      setInitialViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
  }, [initialViewport])

  return (
    <div
      ref={containerRef}
      className={`absolute top-0 left-0 w-full h-full ${className} `}
      style={{
        // Positioned absolutely relative to the parent content container
        // Children use absolute positioning relative to this container's top-left (0,0)
        pointerEvents: 'none',
      }}
    >
      {users.map((user, index) => (
        <div key={`${user.nickname}-${index}`} style={{ pointerEvents: 'auto' }}>
          <UserStar
            leaderboardPosition={index + 1}
            x={user.x}
            y={user.y}
            src={user.src}
            alt={user.alt}
            nickname={user.nickname}
            sunshines={user.sunshines}
            stars={user.stars}
            role={user.role}
            funded={user.funded}
            received={user.received}
            issuesClosed={user.issuesClosed}
            issuesActive={user.issuesActive}
            uri={user.uri}
            walletAddress={user.walletAddress || '0x1027298987234987234987234987234987234987'}
            githubUrl={user.githubUrl || 'https://github.com/ara-foundation/cascadefund-frontend'}
            linkedinUrl={user.linkedinUrl || 'https://www.linkedin.com/in/ara-foundation/'}
          />
        </div>
      ))}
    </div>
  )
}

export default Space

