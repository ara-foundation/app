import { ObjectId } from 'mongodb';
import { getCollection, create } from './db';
import type { Blog } from '@/types/blog';

// Server-side BlogModel (uses ObjectId)
export interface BlogModel {
    _id?: ObjectId;
    author: ObjectId; // Reference to StarModel
    title: string;
    content: string; // Markdown content
    description?: string; // Meta description
    tags: string[]; // Blog tags
    projects: ObjectId[]; // References to GalaxyModel
    projectTypes?: string[]; // Types of projects (e.g., "open-source", "web3")
    createdTime?: Date;
    updatedTime?: Date;
    draft: boolean;
}

// Serialization functions
function blogModelToBlog(model: BlogModel | null): Blog | null {
    if (!model) return null;
    return {
        _id: model._id?.toString(),
        author: model.author?.toString() || '',
        title: model.title,
        content: model.content,
        description: model.description,
        tags: model.tags || [],
        projects: model.projects?.map(p => p.toString()) || [],
        projectTypes: model.projectTypes || [],
        createdTime: model.createdTime ? Math.floor(model.createdTime.getTime() / 1000) : undefined,
        updatedTime: model.updatedTime ? Math.floor(model.updatedTime.getTime() / 1000) : undefined,
        draft: model.draft ?? false,
    };
}

function blogToBlogModel(blog: Blog): BlogModel {
    return {
        _id: blog._id ? new ObjectId(blog._id) : undefined,
        author: new ObjectId(blog.author),
        title: blog.title,
        content: blog.content,
        description: blog.description,
        tags: blog.tags || [],
        projects: blog.projects?.map(p => new ObjectId(p)) || [],
        projectTypes: blog.projectTypes || [],
        createdTime: blog.createdTime ? new Date(blog.createdTime * 1000) : undefined,
        updatedTime: blog.updatedTime ? new Date(blog.updatedTime * 1000) : undefined,
        draft: blog.draft ?? false,
    };
}

/**
 * Get blog by ID
 */
export async function getBlogById(id: string | ObjectId): Promise<Blog | null> {
    try {
        const collection = await getCollection<BlogModel>('blogs');
        const objectId = typeof id === 'string' ? new ObjectId(id) : id;
        const result = await collection.findOne({ _id: objectId });
        return blogModelToBlog(result);
    } catch (error) {
        console.error('Error getting blog by id:', error);
        return null;
    }
}

/**
 * Get all blogs by author
 */
export async function getBlogsByAuthor(authorId: string | ObjectId): Promise<Blog[]> {
    try {
        const collection = await getCollection<BlogModel>('blogs');
        const objectId = typeof authorId === 'string' ? new ObjectId(authorId) : authorId;
        const results = await collection.find({ author: objectId }).sort({ createdTime: -1 }).toArray();
        return results.map(blogModelToBlog).filter((blog): blog is Blog => blog !== null);
    } catch (error) {
        console.error('Error getting blogs by author:', error);
        return [];
    }
}

/**
 * Get all published blogs (non-draft)
 */
export async function getAllBlogs(): Promise<Blog[]> {
    try {
        const collection = await getCollection<BlogModel>('blogs');
        const results = await collection
            .find({ draft: false })
            .sort({ createdTime: -1 })
            .toArray();
        return results.map(blogModelToBlog).filter((blog): blog is Blog => blog !== null);
    } catch (error) {
        console.error('Error getting all blogs:', error);
        return [];
    }
}

/**
 * Create a new blog
 */
export async function createBlog(blog: Blog): Promise<boolean> {
    try {
        const blogModel = blogToBlogModel(blog);
        // Set createdTime if not provided
        if (!blogModel.createdTime) {
            blogModel.createdTime = new Date();
        }
        return await create<BlogModel>('blogs', blogModel);
    } catch (error) {
        console.error('Error creating blog:', error);
        return false;
    }
}

/**
 * Update a blog
 */
export async function updateBlog(blogId: string | ObjectId, updates: Partial<Blog>): Promise<boolean> {
    try {
        const collection = await getCollection<BlogModel>('blogs');
        const objectId = typeof blogId === 'string' ? new ObjectId(blogId) : blogId;

        const updateDoc: any = {};
        if (updates.title !== undefined) updateDoc.title = updates.title;
        if (updates.content !== undefined) updateDoc.content = updates.content;
        if (updates.description !== undefined) updateDoc.description = updates.description;
        if (updates.tags !== undefined) updateDoc.tags = updates.tags;
        if (updates.projects !== undefined) {
            updateDoc.projects = updates.projects.map(p => new ObjectId(p));
        }
        if (updates.projectTypes !== undefined) updateDoc.projectTypes = updates.projectTypes;
        if (updates.draft !== undefined) updateDoc.draft = updates.draft;

        // Always update updatedTime
        updateDoc.updatedTime = new Date();

        const result = await collection.updateOne(
            { _id: objectId },
            { $set: updateDoc }
        );

        return result.modifiedCount > 0;
    } catch (error) {
        console.error('Error updating blog:', error);
        return false;
    }
}
