export interface Blog {
    _id?: string;
    author: string; // User ID
    title: string;
    content: string; // Markdown content
    description?: string; // Meta description
    tags: string[]; // Blog tags
    projects: string[]; // Galaxy IDs
    projectTypes?: string[]; // Types of projects (e.g., "open-source", "web3")
    createdTime?: number; // Unix timestamp
    updatedTime?: number; // Unix timestamp
    draft: boolean;
}

export const BLOG_EVENT_TYPES = {
    BLOG_CREATED: 'blog-created',
    BLOG_UPDATE: 'blog-update',
} as const
