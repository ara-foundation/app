'use client'
import React, { useState, useEffect, useRef } from 'react'
import UserProfilePanel from './UserProfilePanel'
import BlogListPanel from '../blog/BlogListPanel'
import type { User } from '@/types/user'
import type { Galaxy } from '@/types/galaxy'
import type { Blog } from '@/types/blog'

interface UserProfileWithBlogsProps {
    user: User
    galaxies: Galaxy[]
    blogs: Blog[]
}

const UserProfileWithBlogs: React.FC<UserProfileWithBlogsProps> = ({ user, galaxies, blogs }) => {
    const [isMerged, setIsMerged] = useState(false)
    const profileRef = useRef<HTMLDivElement>(null)

    // Scroll detection for merging panels
    useEffect(() => {
        const handleScroll = () => {
            if (!profileRef.current) return

            const scrollY = window.scrollY || window.pageYOffset
            const profileHeight = profileRef.current.offsetHeight
            const threshold = profileHeight * 0.8

            const shouldMerge = scrollY > threshold
            if (shouldMerge !== isMerged) {
                setIsMerged(shouldMerge)
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll() // Initial check

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [isMerged])

    return (
        <div className="w-full">
            <div
                ref={profileRef}
                className={cn(
                    "transition-all duration-500",
                    isMerged ? "flex flex-row gap-8 max-w-7xl mx-auto items-start" : "flex flex-col"
                )}
            >
                <div className={cn(
                    "transition-all duration-500",
                    isMerged ? "w-1/2 flex-shrink-0" : "w-full"
                )}>
                    <UserProfilePanel
                        user={user}
                        galaxies={galaxies}
                    />
                </div>
                <div className={cn(
                    "transition-all duration-500",
                    isMerged ? "w-1/2 flex-shrink-0" : "w-full"
                )}>
                    <BlogListPanel
                        blogs={blogs}
                        authorId={user._id}
                        isMerged={isMerged}
                    />
                </div>
            </div>
        </div>
    )
}

function cn(...classes: (string | undefined | false)[]): string {
    return classes.filter(Boolean).join(' ')
}

export default UserProfileWithBlogs
