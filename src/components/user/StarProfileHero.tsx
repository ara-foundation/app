'use client'
import React from 'react'
import BlurText from '@/components/BlurText'
import { getIcon } from '@/components/icon'
import NumberFlow from '@number-flow/react'
import BlogListPanel from '@/components/blog/BlogListPanel'
import type { Star } from '@/types/star'
import type { Galaxy } from '@/types/galaxy'
import type { Blog } from '@/types/blog'
import type { AuthUser } from '@/types/auth'

interface StarProfileHeroProps {
  user: Star
  galaxies: Galaxy[]
  blogs: Blog[]
  authUser?: AuthUser | null
}

// 5-pointed star clip-path polygon
const starClipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'

const StarProfileHero: React.FC<StarProfileHeroProps> = ({ user, galaxies, blogs, authUser }) => {
  const defaultSrc = 'https://api.backdropbuild.com/storage/v1/object/public/avatars/9nFM8HasgS.jpeg'
  const displayName = authUser?.name || authUser?.username || authUser?.email?.split('@')[0] || 'Unknown User'
  const displayImage = authUser?.image || defaultSrc

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-12 px-4 relative w-full max-w-6xl mx-auto">
      {/* Star Avatar and Name Section */}
      <div className="w-full space-y-6">
        {/* Star Avatar */}
        <div className="flex justify-center">
          <div
            className="relative w-32 h-32 md:w-40 md:h-40 transition-transform hover:scale-105 duration-300"
            style={{
              clipPath: starClipPath,
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
              filter: 'drop-shadow(0 20px 40px rgba(251, 191, 36, 0.5))',
            }}
          >
            {/* Glowing effect layers */}
            <div
              className="absolute inset-0 opacity-40 animate-pulse"
              style={{
                clipPath: starClipPath,
                background: 'radial-gradient(circle, rgba(251, 191, 36, 0.8) 0%, transparent 70%)',
              }}
            />

            {/* Avatar inside star */}
            <div
              className="absolute inset-2 flex items-center justify-center overflow-hidden rounded-sm"
              style={{
                clipPath: starClipPath,
              }}
            >
              <img
                src={displayImage}
                alt={displayName || 'Star avatar'}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Name as Title */}
        <div className="w-full">
          <BlurText
            text={displayName}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-800 dark:text-slate-200 justify-center"
            animateBy="words"
            direction="top"
            delay={100}
          />
        </div>

        {/* Minimal Stats */}
        <div className="flex items-center justify-center gap-8 py-4">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              {getIcon({ iconType: 'sunshine', className: 'w-5 h-5 text-yellow-500 dark:text-yellow-400' })}
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sunshines</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              <NumberFlow
                value={user.sunshines || 0}
                locales="en-US"
                format={{ style: 'decimal', maximumFractionDigits: 0 }}
              />
            </div>
          </div>

          <div className="w-px h-12 bg-slate-300 dark:bg-slate-600" />

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              {getIcon({ iconType: 'star', className: 'w-5 h-5 text-blue-500 dark:text-blue-400' })}
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Stars</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              <NumberFlow
                value={user.stars || 0}
                locales="en-US"
                format={{ style: 'decimal', maximumFractionDigits: 2 }}
              />
            </div>
          </div>

          {galaxies.length > 0 && (
            <>
              <div className="w-px h-12 bg-slate-300 dark:bg-slate-600" />
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  {getIcon({ iconType: 'project', className: 'w-5 h-5 text-slate-600 dark:text-slate-400' })}
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Galaxies</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {galaxies.length}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Thoughts (Blogs) Section */}
      <div className="w-full mt-16">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            Thoughts
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {blogs.length === 0 ? 'No thoughts shared yet' : `${blogs.length} ${blogs.length === 1 ? 'thought' : 'thoughts'}`}
          </p>
        </div>
        <BlogListPanel blogs={blogs} authorId={user._id} />
      </div>
    </div>
  )
}

export default StarProfileHero

