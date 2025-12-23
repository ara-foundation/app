'use client'
import React, { useState, useEffect } from 'react'
import Link from '../custom-ui/Link'
import { getIcon } from '../icon'
import type { Blog } from '@/types/blog'
import Badge from '../badge/Badge'
import PanelFooter from '../panel/PanelFooter'
import MenuAvatar from '../MenuAvatar'
import TimeAgo from 'timeago-react'
import type { User } from '@/types/user'
import { getUserById } from '@/client-side/user'
import { BasePanel } from '../panel'
import { cn } from '@/lib/utils'

interface BlogCardProps extends Blog {
    className?: string
}

const BlogCard: React.FC<BlogCardProps> = (blog) => {
    const [authorUser, setAuthorUser] = useState<User | null>(null)
    const [isLoadingAuthor, setIsLoadingAuthor] = useState(false)

    // Fetch author user
    useEffect(() => {
        if (blog.author) {
            setIsLoadingAuthor(true)
            getUserById(blog.author)
                .then((userData) => {
                    if (userData) {
                        setAuthorUser(userData)
                    }
                })
                .catch((error) => {
                    console.error('Error fetching author:', error)
                })
                .finally(() => {
                    setIsLoadingAuthor(false)
                })
        }
    }, [blog.author])

    // Get primary tag (first tag)
    const primaryTag = blog.tags && blog.tags.length > 0 ? blog.tags[0] : undefined
    const otherTags = blog.tags && blog.tags.length > 1 ? blog.tags.slice(1) : []

    // Truncate description for card view
    const truncatedDescription = blog.description
        ? (blog.description.length > 150 ? blog.description.substring(0, 150) + '...' : blog.description)
        : (blog.content.length > 150 ? blog.content.substring(0, 150) + '...' : blog.content)

    return (
        <Link uri={`/blog?id=${blog._id}`} asNewTab={false}>
            <BasePanel
                bg="bg-white/50 dark:bg-slate-900/50"
                className={cn(
                    'mb-4 hover:bg-white dark:hover:bg-slate-900 hover:border-blue-500/20 transition-colors',
                    blog.className
                )}
            >
                <div className="flex flex-col space-y-3 p-4">
                    {/* Title and Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 flex-1">
                            {blog.title}
                        </h2>
                        <div className="flex items-center gap-2">
                            {/* Draft/Published badge (from Version cards) */}
                            <Badge
                                variant={blog.draft ? 'warning' : 'success'}
                                static={true}
                            >
                                {blog.draft ? 'Draft' : 'Published'}
                            </Badge>
                        </div>
                    </div>

                    {/* Description (from Project cards) */}
                    {truncatedDescription && (
                        <p className="text-base text-slate-600 dark:text-slate-400 line-clamp-2">
                            {truncatedDescription}
                        </p>
                    )}

                    {/* Tags (from Issue cards) */}
                    {blog.tags && blog.tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            {primaryTag && (
                                <Badge
                                    variant={
                                        primaryTag.toLowerCase() === 'bug' ? 'danger' :
                                            primaryTag.toLowerCase() === 'feature' ? 'blue' :
                                                primaryTag.toLowerCase() === 'improvement' ? 'success' :
                                                    primaryTag.toLowerCase() === 'enhancement' ? 'warning' :
                                                        'info'
                                    }
                                    static={true}
                                >
                                    {primaryTag}
                                </Badge>
                            )}
                            {otherTags.map((tag, index) => (
                                <Badge key={index} variant="info" static={true}>
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Project Links (if any) */}
                    {blog.projects && blog.projects.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            {getIcon({ iconType: 'project', className: 'w-4 h-4' })}
                            <span>Linked to {blog.projects.length} {blog.projects.length === 1 ? 'project' : 'projects'}</span>
                        </div>
                    )}

                    {/* Author and Time (from Issue cards) */}
                    <PanelFooter className="flex flex-row justify-between items-center mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-400 gap-1 text-xs">
                            {isLoadingAuthor ? (
                                <span>Loading...</span>
                            ) : (
                                <>
                                    <span>By</span>
                                    <MenuAvatar
                                        src={authorUser?.src}
                                        uri={authorUser?.uri}
                                        className="w-6 h-6"
                                    />
                                    <span>{authorUser?.nickname || authorUser?.email?.split('@')[0] || 'Unknown'}</span>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            {blog.createdTime && (
                                <TimeAgo datetime={blog.createdTime * 1000} />
                            )}
                            {blog.updatedTime && blog.updatedTime !== blog.createdTime && (
                                <span className="text-slate-400 dark:text-slate-500">
                                    (updated <TimeAgo datetime={blog.updatedTime * 1000} />)
                                </span>
                            )}
                        </div>
                    </PanelFooter>
                </div>
            </BasePanel>
        </Link>
    )
}

export default BlogCard
