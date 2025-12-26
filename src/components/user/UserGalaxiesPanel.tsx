'use client'
import React from 'react'
import { BasePanel } from '@/components/panel'
import Link from '@/components/custom-ui/Link'
import Tooltip from '@/components/custom-ui/Tooltip'
import NumberFlow from '@number-flow/react'
import { getIcon } from '@/components/icon'
import Badge from '@/components/badge/Badge'
import type { Galaxy } from '@/types/galaxy'

interface UserGalaxiesPanelProps {
  galaxies: Galaxy[]
}

const UserGalaxiesPanel: React.FC<UserGalaxiesPanelProps> = ({ galaxies }) => {
  if (galaxies.length === 0) {
    return (
      <BasePanel>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            {getIcon({ iconType: 'project', className: 'w-5 h-5 text-slate-600 dark:text-slate-400' })}
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              My Galaxies
            </h2>
            <Badge variant="gray" static={true}>0</Badge>
          </div>
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <p className="text-sm">No galaxies yet</p>
            <p className="text-xs mt-1">You haven't created any galaxies</p>
          </div>
        </div>
      </BasePanel>
    )
  }

  return (
    <BasePanel>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          {getIcon({ iconType: 'project', className: 'w-5 h-5 text-slate-600 dark:text-slate-400' })}
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            My Galaxies
          </h2>
          <Badge variant="gray" static={true}>{galaxies.length}</Badge>
        </div>

        <div className="space-y-3">
          {galaxies.map((galaxy) => {
            const galaxyId = galaxy._id?.toString() || ''
            return (
              <div
                key={galaxyId}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Tooltip content={`View '${galaxy.name}' galaxy`}>
                      <Link
                        uri={`/project?galaxy=${galaxyId}`}
                        className="block"
                      >
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {galaxy.name}
                        </h3>
                      </Link>
                    </Tooltip>
                    {galaxy.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                        {galaxy.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        {getIcon({ iconType: 'star', className: 'w-4 h-4 text-blue-500 dark:text-blue-400' })}
                        <span className="text-slate-700 dark:text-slate-300">
                          <NumberFlow
                            value={galaxy.stars || 0}
                            locales="en-US"
                            format={{ style: 'decimal', maximumFractionDigits: 2 }}
                          />
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {getIcon({ iconType: 'sunshine', className: 'w-4 h-4 text-yellow-500 dark:text-yellow-400' })}
                        <span className="text-slate-700 dark:text-slate-300">
                          <NumberFlow
                            value={galaxy.sunshines || 0}
                            locales="en-US"
                            format={{ style: 'decimal', maximumFractionDigits: 0 }}
                          />
                        </span>
                      </div>
                      {galaxy.users && (
                        <div className="flex items-center gap-1.5">
                          {getIcon({ iconType: 'user', className: 'w-4 h-4 text-slate-600 dark:text-slate-400' })}
                          <span className="text-slate-700 dark:text-slate-300">
                            {galaxy.users}
                          </span>
                        </div>
                      )}
                    </div>
                    {galaxy.tags && galaxy.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {galaxy.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {galaxy.tags.length > 3 && (
                          <span className="px-2 py-0.5 text-xs text-slate-500 dark:text-slate-400">
                            +{galaxy.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </BasePanel>
  )
}

export default UserGalaxiesPanel

