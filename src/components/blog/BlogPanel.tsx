'use client'
import React, { useEffect, useState } from 'react'
import { BasePanel } from '@/components/panel'
import Badge from '@/components/badge/Badge'
import Link from '@/components/custom-ui/Link'
import MenuAvatar from '@/components/MenuAvatar'
import TimeAgo from 'timeago-react'
import type { Blog } from '@/types/blog'
import type { Star } from '@/types/star'
import { getStarById } from '@/client-side/star'
import { getIcon } from '@/components/icon'
import { cn } from '@/lib/utils'

interface BlogPanelProps extends Blog {
    onSave?: (updates: Partial<Blog>) => void
}

const BlogPanel: React.FC<BlogPanelProps> = (blog) => {
    const [blogData, setBlogData] = useState<Blog>(blog)
    const [authorUser, setAuthorUser] = useState<Star | null>(null)
    const [isLoadingAuthor, setIsLoadingAuthor] = useState(false)

    // Update blogData when blog prop changes
    useEffect(() => {
        setBlogData(blog)
    }, [blog._id, blog.title, blog.content, blog.author])

    // Fetch author user
    useEffect(() => {
        if (blogData.author) {
            setIsLoadingAuthor(true)
            getStarById(blogData.author)
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
    }, [blogData.author])

    // Render markdown content (simple version - can be enhanced with a markdown renderer)
    const renderMarkdown = (content: string) => {
        if (!content) return ''

        // Simple markdown rendering - convert to HTML
        // For production, consider using a proper markdown library
        let html = content
            // Code blocks first (before other processing)
            .replace(/```(\w+)?\n?([\s\S]*?)```/gim, (match, lang, code) => {
                return `<pre class="bg-slate-100 dark:bg-slate-800 p-4 rounded overflow-x-auto my-4"><code class="text-sm">${code.trim()}</code></pre>`
            })
            // Headers
            .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold mt-6 mb-3">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-8 mb-4">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mt-10 mb-5">$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>')
            // Italic (but not inside code)
            .replace(/(?<!`)\*([^*`]+)\*(?!`)/gim, '<em>$1</em>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>')
            // Inline code (after code blocks)
            .replace(/`([^`\n]+)`/gim, '<code class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
            // Line breaks - convert double newlines to paragraph breaks
            .split(/\n\n+/)
            .map(para => para.trim())
            .filter(para => para.length > 0)
            .map(para => {
                // Convert single newlines to <br> within paragraphs
                para = para.replace(/\n/g, '<br>')
                return `<p class="mb-4 leading-relaxed">${para}</p>`
            })
            .join('')

        return html || '<p>No content</p>'
    }

    return (
        <BasePanel className="max-w-4xl w-full mx-auto">
            <div className="space-y-6 p-6 md:p-8">
                {/* Header */}
                <div className="space-y-4 border-b border-slate-200 dark:border-slate-700 pb-6">
                    <div className="flex items-start justify-between gap-4">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 flex-1">
                            {blogData.title}
                        </h1>
                        <Badge
                            variant={blogData.draft ? 'warning' : 'success'}
                            static={true}
                        >
                            {blogData.draft ? 'Draft' : 'Published'}
                        </Badge>
                    </div>

                    {/* Description */}
                    {blogData.description && (
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            {blogData.description}
                        </p>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                        {blogData.tags && blogData.tags.map((tag, index) => (
                            <Badge
                                key={index}
                                variant={
                                    tag.toLowerCase() === 'bug' ? 'danger' :
                                        tag.toLowerCase() === 'feature' ? 'blue' :
                                            tag.toLowerCase() === 'improvement' ? 'success' :
                                                tag.toLowerCase() === 'enhancement' ? 'warning' :
                                                    'info'
                                }
                                static={true}
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>

                    {/* Author and Time */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                            {isLoadingAuthor ? (
                                <span className="text-sm">Loading...</span>
                            ) : (
                                <>
                                    <span className="text-sm">By</span>
                                    <MenuAvatar
                                        src={authorUser?.src}
                                        className="w-8 h-8"
                                    />
                                    <span className="text-sm font-medium">
                                        {authorUser?.nickname || authorUser?.email?.split('@')[0] || 'Unknown'}
                                    </span>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                            {blogData.createdTime && (
                                <div className="flex items-center gap-1">
                                    {getIcon({ iconType: 'clock', className: 'w-4 h-4' })}
                                    <TimeAgo datetime={blogData.createdTime * 1000} />
                                </div>
                            )}
                            {blogData.updatedTime && blogData.updatedTime !== blogData.createdTime && (
                                <div className="flex items-center gap-1">
                                    <span className="text-slate-400 dark:text-slate-500">
                                        Updated <TimeAgo datetime={blogData.updatedTime * 1000} />
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Project Links */}
                    {blogData.projects && blogData.projects.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 pt-2">
                            {getIcon({ iconType: 'project', className: 'w-4 h-4' })}
                            <span>Linked to {blogData.projects.length} {blogData.projects.length === 1 ? 'project' : 'projects'}</span>
                        </div>
                    )}

                    {/* Project Types */}
                    {blogData.projectTypes && blogData.projectTypes.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap pt-2">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Project Types:</span>
                            {blogData.projectTypes.map((type, index) => (
                                <Badge key={index} variant="purple" static={true}>
                                    {type}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div
                    className="prose prose-slate dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(blogData.content) }}
                />
            </div>
        </BasePanel>
    )
}

export default BlogPanel
