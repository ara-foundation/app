'use client'
import React from 'react'
import Link from '@/components/custom-ui/Link'
import { FaGithub, FaLinkedin, FaTelegram } from 'react-icons/fa'
import { getIcon } from '@/components/icon'
import { BasePanel } from '@/components/panel'
import type { Star } from '@/types/star'
import type { Galaxy } from '@/types/galaxy'
import NumberFlow from '@number-flow/react'
import { cn } from '@/lib/utils'



interface ProfilePanelProps {
    user: Star
    galaxies: Galaxy[]
}

// 5-pointed star clip-path polygon
const starClipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'

const ProfilePanel: React.FC<ProfilePanelProps> = ({ user, galaxies }) => {
    const defaultSrc = 'https://api.backdropbuild.com/storage/v1/object/public/avatars/9nFM8HasgS.jpeg'
    const defaultAlt = 'Avatar'

    // Social links removed - no longer stored in Star model
    const socialLinks: Array<{ type: 'github' | 'linkedin' | 'telegram'; url: string }> = []

    const getSocialIcon = (type: 'github' | 'linkedin' | 'telegram') => {
        switch (type) {
            case 'github':
                return <FaGithub className="w-5 h-5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" />
            case 'linkedin':
                return <FaLinkedin className="w-5 h-5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" />
            case 'telegram':
                return <FaTelegram className="w-5 h-5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" />
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-10 px-4 py-8">
            {/* Large Star with User Avatar */}
            <div className="relative flex items-center justify-center mb-4">
                <div
                    className="relative w-48 h-48 md:w-64 md:h-64 transition-transform hover:scale-105 duration-300"
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
                        className="absolute inset-3 flex items-center justify-center overflow-hidden rounded-sm"
                        style={{
                            clipPath: starClipPath,
                        }}
                    >
                        <img
                            src={user.src || defaultSrc}
                            alt={defaultAlt || user.nickname || 'Star avatar'}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* User Information Panel */}
            <BasePanel className="max-w-2xl w-full shadow-lg">
                <div className="space-y-8 p-6 md:p-8">
                    {/* Name and Role */}
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                            {user.nickname || user.email?.split('@')[0] || 'Unknown User'}
                        </h1>
                        {user.role && (
                            <div className="inline-flex items-center">
                                <span
                                    className={cn(
                                        "text-xs md:text-sm font-semibold px-4 py-1.5 rounded-full shadow-sm",
                                        user.role === 'maintainer' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
                                        user.role === 'contributor' && 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
                                        user.role === 'user' && 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-800'
                                    )}
                                >
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Sunshines and Stars Display */}
                    <div className="flex items-center justify-center gap-12 py-6 border-t border-b border-slate-200 dark:border-slate-700/50">
                        <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center gap-2.5">
                                {getIcon({ iconType: 'sunshine', className: 'w-7 h-7 text-yellow-500 dark:text-yellow-400' })}
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Sunshines</span>
                            </div>
                            <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
                                <NumberFlow
                                    value={user.sunshines || 0}
                                    locales="en-US"
                                    format={{ style: 'decimal', maximumFractionDigits: 0 }}
                                />
                            </div>
                        </div>

                        <div className="w-px h-16 bg-slate-300 dark:bg-slate-600" />

                        <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center gap-2.5">
                                {getIcon({ iconType: 'star', className: 'w-7 h-7 text-blue-500 dark:text-blue-400' })}
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Stars</span>
                            </div>
                            <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
                                <NumberFlow
                                    value={user.stars || 0}
                                    locales="en-US"
                                    format={{ style: 'decimal', maximumFractionDigits: 2 }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    {socialLinks.length > 0 && (
                        <div className="flex items-center justify-center gap-6 pt-2">
                            {socialLinks.map((social) => (
                                <Link
                                    key={social.type}
                                    uri={social.url}
                                    asNewTab={true}
                                    className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-200 hover:scale-110 hover:shadow-md"
                                >
                                    {getSocialIcon(social.type)}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Galaxies Count */}
                    <div className="text-center pt-2">
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            {getIcon({ iconType: 'project', className: 'w-5 h-5 text-slate-600 dark:text-slate-400' })}
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Maintainer of <span className="font-bold text-slate-900 dark:text-slate-100">{galaxies.length}</span> {galaxies.length === 1 ? 'galaxy' : 'galaxies'}
                            </span>
                        </div>
                    </div>

                    {/* User Email */}
                    {user.email && (
                        <div className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2">
                            {user.email}
                        </div>
                    )}
                </div>
            </BasePanel>
        </div>
    )
}

export default ProfilePanel

