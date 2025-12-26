'use client'
import React, { useMemo } from 'react'
import UserGalaxy from '@/components/user/UserGalaxy'
import type { Galaxy } from '@/types/galaxy'

interface RandomSlotDistributorProps {
  items: Galaxy[]
  slots: string[]
  slotName: string
}

const RandomSlotDistributor: React.FC<RandomSlotDistributorProps> = ({
  items,
  slots,
  slotName,
}) => {
  // Randomly assign items to slots (using a seed based on item ID for consistency)
  const slotItems = useMemo(() => {
    const assignments: Record<string, Galaxy[]> = {}
    
    items.forEach((item, globalIndex) => {
      // Use item ID as seed for consistent assignment, or fallback to index
      const seed = item._id ? 
        item._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 
        globalIndex
      const randomSlot = slots[seed % slots.length]
      if (!assignments[randomSlot]) {
        assignments[randomSlot] = []
      }
      assignments[randomSlot].push(item)
    })
    
    return assignments[slotName] || []
  }, [items, slots, slotName])

  return (
    <>
      {slotItems.map((item, index) => (
        <UserGalaxy
          key={item._id?.toString() || index}
          galaxy={item}
          index={index}
          slotName={slotName}
        />
      ))}
    </>
  )
}

export default RandomSlotDistributor

