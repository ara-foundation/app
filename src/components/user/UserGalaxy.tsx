'use client'
import React, { useMemo } from 'react'
import ProjectGalaxy from '@/components/all-stars/ProjectGalaxy'
import type { Galaxy } from '@/types/galaxy'

interface UserGalaxyProps {
  galaxy: Galaxy
  index: number
  slotName?: string
}

const UserGalaxy: React.FC<UserGalaxyProps> = ({ galaxy, index, slotName }) => {
  const galaxyId = galaxy._id?.toString() || ''
  
  // Generate random x, y coordinates within the slot area
  // Slot area is roughly 300-400px wide, so we'll use that range
  const { x, y } = useMemo(() => {
    // Use galaxy ID as seed for consistent positioning
    const seed = galaxyId ? 
      galaxyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 
      index
    
    // Generate pseudo-random but consistent values
    const randomX = (seed * 9301 + 49297) % 233280 / 233280
    const randomY = ((seed * 9301 + 49297) * 9301 + 49297) % 233280 / 233280
    
    // Map to slot area bounds (0-350px for x, 0-200px for y with spacing)
    const slotX = randomX * 350
    const slotY = (randomY * 200) + (index * 150) // Add spacing between galaxies
    
    return { x: slotX, y: slotY }
  }, [galaxyId, index])
  
  return (
    <div className="mb-8 relative" style={{ minHeight: '120px' }}>
      <ProjectGalaxy
        x={x}
        y={y}
        projectName={galaxy.name}
        projectId={galaxyId}
        galaxyData={galaxy}
        tags={galaxy.tags}
        leaderboardPosition={index + 1}
        className="relative"
      />
    </div>
  )
}

export default UserGalaxy

