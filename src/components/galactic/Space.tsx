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
      className={`fixed top-0 left-0 w-full h-full ${className}`}
      style={{
        // Use initial viewport as reference point
        // The container itself is fixed to viewport, but children use absolute positioning
        // relative to this container's top-left (0,0)
        pointerEvents: 'none',
      }}
    >
      {users.map((user, index) => (
        <div key={`${user.nickname}-${index}`} style={{ pointerEvents: 'auto' }}>
          <UserStar
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
          />
        </div>
      ))}
    </div>
  )
}

export default Space

