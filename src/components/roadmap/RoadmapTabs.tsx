import React, { useState, useEffect, useCallback } from 'react'
import Tabs, { TabProps } from '../Tabs'
import Badge from '../badge/Badge'
import type { Version } from '@/types/roadmap'
import RoadmapPanel from './RoadmapPanel'
import { getVersions } from '@/client-side/roadmap'

interface RoadmapTabsProps {
  galaxyId: string
}

const RoadmapTabs: React.FC<RoadmapTabsProps> = ({ galaxyId }) => {
  const [allVersions, setAllVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVersions = useCallback(async () => {
    try {
      setLoading(true)
      const versions = await getVersions(galaxyId)
      setAllVersions(versions)
    } catch (error) {
      console.error('Error fetching versions:', error)
    } finally {
      setLoading(false)
    }
  }, [galaxyId])

  useEffect(() => {
    if (galaxyId) {
      fetchVersions()
    }
  }, [galaxyId, fetchVersions])

  // Listen for version-created event
  useEffect(() => {
    const handleVersionCreated = () => {
      fetchVersions()
    }

    window.addEventListener('version-created', handleVersionCreated)
    return () => {
      window.removeEventListener('version-created', handleVersionCreated)
    }
  }, [fetchVersions])

  const versions = allVersions.filter(v => v.status !== 'archived')
  const archive = allVersions.filter(v => v.status === 'archived')

  if (loading) {
    return <div className="text-center py-8">Loading roadmap...</div>
  }

  const tabs: TabProps[] = [
    {
      label: <div className=''>Roadmap <Badge variant='gray'>{versions.length}</Badge></div>,
      key: "roadmap",
      content: <RoadmapPanel versions={versions} />
    },
    {
      label: <div className=''>Archive <Badge variant='gray'>{archive.length}</Badge></div>,
      key: "archive",
      content: <RoadmapPanel versions={archive} />
    },
  ]

  return (
    <Tabs activeTab='roadmap' tabs={tabs} />
  )
}

export default RoadmapTabs
