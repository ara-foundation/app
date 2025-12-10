import React, { useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import type { DropTargetMonitor } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import UserStar from './UserStar'
import ProjectGalaxy from './ProjectGalaxy'
import DropTarget from '../DropTarget'
import { cn } from '@/lib/utils'
import type { Galaxy } from '@/types/galaxy'
import { SPACE_EVENT_TYPES, type UserStar as SpaceUserStar } from '@/types/all-stars'
import { updateUserStarPosition } from '@/client-side/all-stars'

interface SpaceProps {
  users: SpaceUserStar[]
  className?: string
  galaxyId?: string
  projectGalaxies?: Array<{
    x: number
    y: number
    projectName: string
    projectId?: string
    galaxyData?: Galaxy
    tags?: string[]
    leaderboardPosition?: number
  }>
}

const SpaceContent: React.FC<SpaceProps> = ({ users: initialUsers, className = '', projectGalaxies, galaxyId }) => {
  const [initialViewport, setInitialViewport] = useState({ width: 0, height: 0 })
  const [users, setUsers] = useState<SpaceUserStar[]>(initialUsers)
  const [isDragging, setIsDragging] = useState(false)

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
      const { userData } = event.detail as { userData: SpaceUserStar }
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

    window.addEventListener(SPACE_EVENT_TYPES.USER_STAR_CREATED, handleUserStarCreated as EventListener)
    return () => {
      window.removeEventListener(SPACE_EVENT_TYPES.USER_STAR_CREATED, handleUserStarCreated as EventListener)
    }
  }, [])

  // Listen for user star position updates (when dragging within Space)
  useEffect(() => {
    const handleUserStarMoved = (event: CustomEvent) => {
      const { userId, nickname, x, y } = event.detail as { userId?: string; nickname?: string; x: number; y: number }
      const matchKey = userId || nickname
      if (!matchKey) return
      setUsers((prevUsers) => {
        const existingIndex = prevUsers.findIndex((u) => (userId ? u.userId === userId : u.nickname === nickname))
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
      if (galaxyId && userId) {
        updateUserStarPosition({ galaxyId, userId, x, y }).catch((err) =>
          console.error('Failed to persist user star position', err)
        )
      }
    }

    window.addEventListener(SPACE_EVENT_TYPES.USER_STAR_MOVED, handleUserStarMoved as EventListener)
    return () => {
      window.removeEventListener(SPACE_EVENT_TYPES.USER_STAR_MOVED, handleUserStarMoved as EventListener)
    }
  }, [])

  // Update users when initialUsers prop changes
  useEffect(() => {
    setUsers(initialUsers)
  }, [initialUsers])

  const handleDrop = (item: SpaceUserStar, monitor: DropTargetMonitor) => {
    const container = document.querySelector('#galaxy-space')
    if (!container) return null

    const containerRect = container.getBoundingClientRect()
    const clientOffset = monitor.getClientOffset()

    if (!clientOffset) return null

    const computedStyle = window.getComputedStyle(container as Element)
    const transform = computedStyle.transform
    let scale = 1
    if (transform && transform !== 'none') {
      const matrix = transform.match(/matrix\(([^)]+)\)/)
      if (matrix) {
        const values = matrix[1].split(',')
        scale = parseFloat(values[0]) || 1
      }
    }

    const x = (clientOffset.x - containerRect.left) / scale
    const y = (clientOffset.y - containerRect.top) / scale

    const payload: SpaceUserStar = {
      ...item,
      x,
      y,
      draggable: item.draggable ?? true,
    }

    setUsers((prev) => {
      const index = prev.findIndex((u) => u.nickname === payload.nickname)
      const exists = index >= 0
      const next = exists
        ? (() => {
          const updated = [...prev]
          updated[index] = { ...updated[index], ...payload }
          return updated
        })()
        : [...prev, payload]

      const eventType = exists ? SPACE_EVENT_TYPES.USER_STAR_MOVED : SPACE_EVENT_TYPES.USER_STAR_CREATED
      window.dispatchEvent(
        new CustomEvent(eventType, {
          detail: exists ? { userId: item.userId, nickname: item.nickname, x, y } : { userData: payload, x, y },
        })
      )

      return next
    })

    return { x, y }
  }

  return (
    <DropTarget
      id="galaxy-space"
      accept={['user-star']}
      onDrop={handleDrop}
      className={cn(
        "absolute top-0 left-0 w-full h-full border-none",
        className,
        isDragging && "z-[9999]",
        !isDragging && "pointer-events-none"
      )}
      innerClassName="w-full h-full"
      roundedClassName="rounded-none"
      onStateChange={({ isOver, canDrop }) => setIsDragging(isOver || canDrop)}
    >
      {users
        .filter((user) => user.x !== undefined && user.y !== undefined)
        .map((user, index) => (
          <div key={`${user.nickname}-${index}`} style={{ pointerEvents: 'auto' }}>
            <UserStar
              leaderboardPosition={index + 1}
              x={user.x || 0}
              y={user.y || 0}
              userId={user.userId}
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
    </DropTarget>
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

