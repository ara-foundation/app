import React, { useEffect, useRef, useState } from 'react'
import { DndProvider, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import UserStar from './UserStar'
import ProjectGalaxy from './ProjectGalaxy'
import { cn } from '@/lib/utils'
import { GalaxyModel } from '@/scripts/galaxy'

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
  tags?: string[]
  draggable?: boolean
}

interface SpaceProps {
  users: UserStarData[]
  className?: string
  projectGalaxies?: Array<{
    x: number
    y: number
    projectName: string
    projectId?: string
    galaxyData?: GalaxyModel
    tags?: string[]
    leaderboardPosition?: number
  }>
}

const SpaceContent: React.FC<SpaceProps> = ({ users: initialUsers, className = '', projectGalaxies }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [initialViewport, setInitialViewport] = useState({ width: 0, height: 0 })
  const [users, setUsers] = useState<UserStarData[]>(initialUsers)

  useEffect(() => {
    // Capture initial viewport size on mount
    if (initialViewport.width === 0 && initialViewport.height === 0) {
      setInitialViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
  }, [initialViewport])

  // Listen for new user star creation
  useEffect(() => {
    const handleUserStarCreated = (event: CustomEvent) => {
      const { userData } = event.detail as { userData: UserStarData }
      setUsers((prevUsers) => {
        // Check if user already exists (by nickname)
        const existingIndex = prevUsers.findIndex((u) => u.nickname === userData.nickname)
        if (existingIndex >= 0) {
          // Update existing user position
          const updated = [...prevUsers]
          updated[existingIndex] = userData
          return updated
        } else {
          // Add new user
          return [...prevUsers, userData]
        }
      })
    }

    window.addEventListener('user-star-created', handleUserStarCreated as EventListener)
    return () => {
      window.removeEventListener('user-star-created', handleUserStarCreated as EventListener)
    }
  }, [])

  // Listen for user star position updates (when dragging within Space)
  useEffect(() => {
    const handleUserStarMoved = (event: CustomEvent) => {
      const { nickname, x, y } = event.detail as { nickname: string; x: number; y: number }
      setUsers((prevUsers) => {
        const existingIndex = prevUsers.findIndex((u) => u.nickname === nickname)
        if (existingIndex >= 0) {
          // Update existing user position
          const updated = [...prevUsers]
          updated[existingIndex] = {
            ...updated[existingIndex],
            x,
            y,
          }
          return updated
        }
        return prevUsers
      })
    }

    window.addEventListener('user-star-moved', handleUserStarMoved as EventListener)
    return () => {
      window.removeEventListener('user-star-moved', handleUserStarMoved as EventListener)
    }
  }, [])

  // Update users when initialUsers prop changes
  useEffect(() => {
    setUsers(initialUsers)
  }, [initialUsers])

  // Make Space a drop target
  const [{ isOver, canDrop, isDraggingAny }, drop] = useDrop({
    accept: 'user-star',
    drop: (item: UserStarData, monitor) => {
      const container = document.querySelector('[data-galaxy-content]')
      if (!container) return null

      const containerRect = container.getBoundingClientRect()
      const clientOffset = monitor.getClientOffset()

      if (!clientOffset) return null

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

      // Calculate position relative to container, accounting for scale
      const x = (clientOffset.x - containerRect.left) / scale
      const y = (clientOffset.y - containerRect.top) / scale

      return { x, y }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      isDraggingAny: !!monitor.getItem(), // Check if any compatible item is being dragged
    }),
  })

  const isDragging = isDraggingAny || canDrop

  // Combine refs
  const combinedRef = (node: HTMLDivElement | null) => {
    containerRef.current = node
    drop(node)
  }

  return (
    <div
      ref={combinedRef}
      className={cn(
        "absolute top-0 left-0 w-full h-full",
        className,
        isDragging && "z-[9999]"
      )}
      style={{
        // Positioned absolutely relative to the parent content container
        // Children use absolute positioning relative to this container's top-left (0,0)
        pointerEvents: 'none',
        ...(isOver && { pointerEvents: 'auto' }),
      }}
    >
      {/* Background blur fog overlay when dragging */}
      {isDragging && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: 'rgba(100, 100, 100, 0.3)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: -1,
          }}
        />
      )}
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
            githubUrl={user.githubUrl || 'https://github.com/ara-foundation/app'}
            linkedinUrl={user.linkedinUrl || 'https://www.linkedin.com/in/ara-foundation/'}
            tags={user.tags}
            draggable={user.draggable}
            animationDelay={index * 0.5} // Orchestrate: stagger each star's animation by 0.5s
          />
        </div>
      ))}
      {projectGalaxies && projectGalaxies.map((galaxy, index) => (
        <div key={`galaxy-${galaxy.projectName}-${index}`} style={{ pointerEvents: 'auto' }}>
          <ProjectGalaxy
            x={galaxy.x}
            y={galaxy.y}
            projectName={galaxy.projectName}
            projectId={galaxy.projectId}
            galaxyData={galaxy.galaxyData}
            tags={galaxy.tags || galaxy.galaxyData?.tags}
            leaderboardPosition={galaxy.leaderboardPosition}
          />
        </div>
      ))}
    </div>
  )
}

const Space: React.FC<SpaceProps> = (props) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <SpaceContent {...props} />
    </DndProvider>
  )
}

export default Space

