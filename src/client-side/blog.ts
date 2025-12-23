import { actions } from 'astro:actions'
import type { Blog } from '@/types/blog'
import { BLOG_EVENT_TYPES } from '@/types/blog'

/**
 * Emit blog created event
 */
function emitBlogCreated(data?: Blog): void {
    const event = new CustomEvent(BLOG_EVENT_TYPES.BLOG_CREATED, {
        detail: data,
    })
    window.dispatchEvent(event)
}

/**
 * Emit blog update event
 */
function emitBlogUpdate(data?: Blog): void {
    const event = new CustomEvent(BLOG_EVENT_TYPES.BLOG_UPDATE, {
        detail: data,
    })
    window.dispatchEvent(event)
}

/**
 * Get blog by ID
 */
export async function getBlogById(id: string): Promise<Blog | null> {
    try {
        const result = await actions.getBlog({ blogId: id })
        if (result.data?.success && result.data.blog) {
            return result.data.blog
        }
        return null
    } catch (error) {
        console.error('Error getting blog:', error)
        return null
    }
}

/**
 * Get all blogs by author
 */
export async function getBlogsByAuthor(authorId: string): Promise<Blog[]> {
    try {
        const result = await actions.getBlogsByAuthor({ authorId })
        if (result.data?.success && result.data.blogs) {
            return result.data.blogs
        }
        return []
    } catch (error) {
        console.error('Error getting blogs by author:', error)
        return []
    }
}

/**
 * Get all published blogs
 */
export async function getAllBlogs(): Promise<Blog[]> {
    try {
        const result = await actions.getAllBlogs({})
        if (result.data?.success && result.data.blogs) {
            return result.data.blogs
        }
        return []
    } catch (error) {
        console.error('Error getting all blogs:', error)
        return []
    }
}

/**
 * Create blog and broadcast BLOG_CREATED event
 */
export async function createBlog(params: {
    userId: string
    email: string
    title: string
    content: string
    description?: string
    tags: string[]
    projects?: string[]
    projectTypes?: string[]
    draft?: boolean
}): Promise<Blog | null> {
    try {
        const result = await actions.createBlog(params)
        if (result.data?.success) {
            // Fetch the created blog to get its full data
            if (result.data.blogId) {
                const createdBlog = await getBlogById(result.data.blogId)
                if (createdBlog) {
                    emitBlogCreated(createdBlog)
                    return createdBlog
                }
            }
            // Fallback: fetch all blogs and find the most recent one
            const blogs = await getBlogsByAuthor(params.userId)
            const createdBlog = blogs.find(blog =>
                blog.title === params.title &&
                blog.author === params.userId
            ) || blogs[0] // Fallback to first blog if not found

            if (createdBlog) {
                emitBlogCreated(createdBlog)
                return createdBlog
            }
        }
        return null
    } catch (error) {
        console.error('Error creating blog:', error)
        return null
    }
}
