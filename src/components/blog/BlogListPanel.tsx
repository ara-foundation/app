'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { BasePanel } from '../panel'
import BlogCard from './BlogCard'
import type { Blog } from '@/types/blog'
import { BLOG_EVENT_TYPES } from '@/types/blog'
import { Spinner } from '@/components/ui/shadcn-io/spinner'

interface BlogListPanelProps {
    blogs: Blog[]
    authorId?: string
    isMerged?: boolean
    className?: string
}

const BlogListPanel: React.FC<BlogListPanelProps> = ({
    blogs: initialBlogs,
    authorId,
    isMerged = false,
    className
}) => {
    const [blogs, setBlogs] = useState<Blog[]>(initialBlogs)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedTag, setSelectedTag] = useState<string | null>(null)

    // Get all unique tags from blogs
    const allTags = useMemo(() => {
        const tags = new Set<string>()
        blogs.forEach(blog => {
            blog.tags?.forEach(tag => tags.add(tag))
        })
        return Array.from(tags).sort()
    }, [blogs])

    // Filter blogs based on selected tag
    const filteredBlogs = useMemo(() => {
        return blogs.filter(blog => {
            if (selectedTag && !blog.tags?.includes(selectedTag)) return false
            return true
        })
    }, [blogs, selectedTag])

    // Listen for blog creation/update events
    useEffect(() => {
        const handleBlogCreated = () => {
            // Refetch blogs when a new one is created
            setIsLoading(true)
            // The parent component should handle refetching
            // For now, we'll just trigger a re-render
            setTimeout(() => setIsLoading(false), 500)
        }

        window.addEventListener(BLOG_EVENT_TYPES.BLOG_CREATED, handleBlogCreated)
        window.addEventListener(BLOG_EVENT_TYPES.BLOG_UPDATE, handleBlogCreated)

        return () => {
            window.removeEventListener(BLOG_EVENT_TYPES.BLOG_CREATED, handleBlogCreated)
            window.removeEventListener(BLOG_EVENT_TYPES.BLOG_UPDATE, handleBlogCreated)
        }
    }, [])

    // Update blogs when initialBlogs changes
    useEffect(() => {
        setBlogs(initialBlogs)
    }, [initialBlogs])

    if (isLoading) {
        return (
            <BasePanel className={className}>
                <div className="flex items-center justify-center p-8">
                    <Spinner />
                </div>
            </BasePanel>
        )
    }

    if (filteredBlogs.length === 0) {
        return (
            <BasePanel className={className}>
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
                        {blogs.length === 0 ? 'No blog posts yet' : 'No blogs match the selected filters'}
                    </p>
                    {blogs.length === 0 && (
                        <p className="text-sm text-slate-500 dark:text-slate-500">
                            Create your first blog post to get started!
                        </p>
                    )}
                </div>
            </BasePanel>
        )
    }

    return (
        <div className={className}>
            {/* Filter Section */}
            {allTags.length > 0 && (
                <BasePanel className="mb-4 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filters:</span>
                        <button
                            onClick={() => setSelectedTag(null)}
                            className={`px-3 py-1 text-xs rounded-full transition-colors ${selectedTag === null
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                                }`}
                        >
                            All Tags
                        </button>
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${selectedTag === tag
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </BasePanel>
            )}

            {/* Blog Cards Grid */}
            <div className={`grid grid-cols-1 ${isMerged ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
                {filteredBlogs.map(blog => (
                    <BlogCard key={blog._id} {...blog} />
                ))}
            </div>
        </div>
    )
}

export default BlogListPanel
