import React, { useState, useEffect, useRef, useCallback } from 'react';
import ScrollStack, { ScrollStackItem } from '@/components/ScrollStack';
import Button from '@/components/custom-ui/Button';
import Badge from '@/components/badge/Badge';
import { getDemo } from '@/client-side/demo';
import { createBlog } from '@/client-side/blog';
import { getUserById } from '@/client-side/user';
import { cn } from '@/lib/utils';

interface CreateBlogFormProps {
    authorId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

// Common project types
const PROJECT_TYPES = [
    'open-source',
    'web3',
    'blockchain',
    'frontend',
    'backend',
    'fullstack',
    'mobile',
    'desktop',
    'library',
    'framework',
    'tool',
    'other'
];

const CreateBlogForm: React.FC<CreateBlogFormProps> = ({ authorId, onSuccess, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [projects, setProjects] = useState<string[]>([]);
    const [projectInput, setProjectInput] = useState('');
    const [projectTypes, setProjectTypes] = useState<string[]>([]);
    const [draft, setDraft] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const titleInputRef = useRef<HTMLInputElement>(null);

    const addTag = () => {
        const trimmed = tagInput.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const addProject = () => {
        const trimmed = projectInput.trim();
        if (trimmed && !projects.includes(trimmed)) {
            setProjects([...projects, trimmed]);
            setProjectInput('');
        }
    };

    const removeProject = (projectId: string) => {
        setProjects(projects.filter(p => p !== projectId));
    };

    const toggleProjectType = (type: string) => {
        setProjectTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    // Scroll to next card
    const scrollToNextCard = useCallback(() => {
        if (cardRefs.current.length === 0 || !scrollContainerRef.current) return;

        const nextIndex = Math.min(currentCardIndex + 1, cardRefs.current.length - 1);
        const nextCard = cardRefs.current[nextIndex];

        if (nextCard && scrollContainerRef.current) {
            const container = scrollContainerRef.current.querySelector('.scroll-stack-inner') as HTMLElement;
            if (container) {
                const cardTop = nextCard.offsetTop - container.offsetTop;
                container.scrollTo({
                    top: cardTop - 100,
                    behavior: 'smooth'
                });
                setCurrentCardIndex(nextIndex);
            }
        }
    }, [currentCardIndex]);

    // Handle keyboard events
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLTextAreaElement && e.key === 'Enter' && e.shiftKey) {
                return;
            }

            if (e.key === 'Enter' || e.key === 'Tab') {
                if (e.key === 'Tab' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
                    e.preventDefault();
                }

                if (e.key === 'Enter' && (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
                    e.preventDefault();
                    scrollToNextCard();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [scrollToNextCard]);

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim() || tags.length === 0) {
            alert('Please fill in all required fields (title, content, and at least one tag)');
            return;
        }

        setIsLoading(true);
        try {
            const demo = getDemo();
            if (!demo.email || !demo.users) {
                alert('Please log in to create a blog post');
                setIsLoading(false);
                return;
            }

            const currentUser = demo.users.find(u => u.role === 'user') || demo.users[0];
            if (!currentUser || !currentUser._id) {
                alert('User not found');
                setIsLoading(false);
                return;
            }

            if (currentUser._id.toString() !== authorId) {
                alert('You can only create blog posts for your own account');
                setIsLoading(false);
                return;
            }

            const createdBlog = await createBlog({
                userId: currentUser._id.toString(),
                email: demo.email,
                title: title.trim(),
                content: content.trim(),
                description: description.trim() || undefined,
                tags,
                projects: projects.length > 0 ? projects : undefined,
                projectTypes: projectTypes.length > 0 ? projectTypes : undefined,
                draft,
            });

            if (createdBlog) {
                onSuccess?.();
            } else {
                alert('Failed to create blog post');
            }
        } catch (error) {
            console.error('Error creating blog:', error);
            alert('An error occurred while creating the blog post');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 pointer-events-none">
            {/* Close button */}
            {onCancel && (
                <button
                    onClick={onCancel}
                    className="fixed top-16 right-16 z-50 pointer-events-auto w-10 h-10 rounded-sm bg-white/90 dark:bg-slate-950/95 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 shadow-lg flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-all hover:scale-110"
                >
                    ✕
                </button>
            )}

            {/* ScrollStack Form */}
            <div
                ref={scrollContainerRef}
                className="absolute bottom-0 left-0 right-0 h-[80vh] pointer-events-auto"
            >
                <ScrollStack useWindowScroll={false} className="h-full">
                    {/* Card 1: Title */}
                    <ScrollStackItem
                        itemClassName="bg-white/5 dark:bg-slate-900/10 backdrop-blur-md border border-white/10 dark:border-slate-700/20 transition-all duration-300"
                    >
                        <div
                            ref={(el) => { cardRefs.current[0] = el; }}
                            className="space-y-4"
                        >
                            <label className="block text-lg font-semibold text-slate-700 dark:text-slate-300">
                                Blog Title *
                            </label>
                            <input
                                ref={titleInputRef}
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        scrollToNextCard();
                                    }
                                }}
                                placeholder="Enter a clear, descriptive title..."
                                className="w-full text-lg px-3 py-2 border border-gray-300/50 dark:border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/30 dark:bg-slate-900/40 backdrop-blur-md"
                            />
                        </div>
                    </ScrollStackItem>

                    {/* Card 2: Description */}
                    <ScrollStackItem
                        itemClassName="bg-white/5 dark:bg-slate-900/10 backdrop-blur-md border border-white/10 dark:border-slate-700/20 transition-all duration-300"
                    >
                        <div
                            ref={(el) => { cardRefs.current[1] = el; }}
                            className="space-y-4"
                        >
                            <label className="block text-lg font-semibold text-slate-700 dark:text-slate-300">
                                Description (Optional)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="A brief description of your blog post..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300/50 dark:border-slate-700/50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/30 dark:bg-slate-900/40 backdrop-blur-md resize-none"
                            />
                        </div>
                    </ScrollStackItem>

                    {/* Card 3: Content */}
                    <ScrollStackItem
                        itemClassName="bg-white/5 dark:bg-slate-900/10 backdrop-blur-md border border-white/10 dark:border-slate-700/20 transition-all duration-300"
                    >
                        <div
                            ref={(el) => { cardRefs.current[2] = el; }}
                            className="space-y-4"
                        >
                            <label className="block text-lg font-semibold text-slate-700 dark:text-slate-300">
                                Content * (Markdown supported)
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your blog post content in Markdown..."
                                rows={10}
                                className="w-full px-3 py-2 border border-gray-300/50 dark:border-slate-700/50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/30 dark:bg-slate-900/40 backdrop-blur-md resize-none font-mono text-sm"
                            />
                        </div>
                    </ScrollStackItem>

                    {/* Card 4: Tags */}
                    <ScrollStackItem
                        itemClassName="bg-white/5 dark:bg-slate-900/10 backdrop-blur-md border border-white/10 dark:border-slate-700/20 transition-all duration-300"
                    >
                        <div
                            ref={(el) => { cardRefs.current[3] = el; }}
                            className="space-y-4"
                        >
                            <label className="block text-lg font-semibold text-slate-700 dark:text-slate-300">
                                Tags * (At least one required)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addTag();
                                        }
                                    }}
                                    placeholder="Enter a tag and press Enter..."
                                    className="flex-1 px-3 py-2 border border-gray-300/50 dark:border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/30 dark:bg-slate-900/40 backdrop-blur-md"
                                />
                                <Button onClick={addTag} variant="secondary" size="md">
                                    Add
                                </Button>
                            </div>
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <Badge key={tag} variant="info" className="cursor-pointer" onClick={() => removeTag(tag)}>
                                            {tag} ×
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollStackItem>

                    {/* Card 5: Projects */}
                    <ScrollStackItem
                        itemClassName="bg-white/5 dark:bg-slate-900/10 backdrop-blur-md border border-white/10 dark:border-slate-700/20 transition-all duration-300"
                    >
                        <div
                            ref={(el) => { cardRefs.current[4] = el; }}
                            className="space-y-4"
                        >
                            <label className="block text-lg font-semibold text-slate-700 dark:text-slate-300">
                                Linked Projects (Optional) - Galaxy IDs
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={projectInput}
                                    onChange={(e) => setProjectInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addProject();
                                        }
                                    }}
                                    placeholder="Enter a galaxy/project ID..."
                                    className="flex-1 px-3 py-2 border border-gray-300/50 dark:border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/30 dark:bg-slate-900/40 backdrop-blur-md"
                                />
                                <Button onClick={addProject} variant="secondary" size="md">
                                    Add
                                </Button>
                            </div>
                            {projects.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {projects.map((projectId) => (
                                        <Badge key={projectId} variant="gray" className="cursor-pointer" onClick={() => removeProject(projectId)}>
                                            {projectId} ×
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollStackItem>

                    {/* Card 6: Project Types */}
                    <ScrollStackItem
                        itemClassName="bg-white/5 dark:bg-slate-900/10 backdrop-blur-md border border-white/10 dark:border-slate-700/20 transition-all duration-300"
                    >
                        <div
                            ref={(el) => { cardRefs.current[5] = el; }}
                            className="space-y-4"
                        >
                            <label className="block text-lg font-semibold text-slate-700 dark:text-slate-300">
                                Project Types (Optional)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {PROJECT_TYPES.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => toggleProjectType(type)}
                                        className={cn(
                                            "px-4 py-2 rounded-lg transition-all backdrop-blur-sm",
                                            projectTypes.includes(type)
                                                ? "bg-purple-500/90 text-white"
                                                : "bg-slate-200/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-300/90 dark:hover:bg-slate-700/90"
                                        )}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </ScrollStackItem>

                    {/* Card 7: Draft Toggle */}
                    <ScrollStackItem
                        itemClassName="bg-white/5 dark:bg-slate-900/10 backdrop-blur-md border border-white/10 dark:border-slate-700/20 transition-all duration-300"
                    >
                        <div
                            ref={(el) => { cardRefs.current[7] = el; }}
                            className="space-y-4"
                        >
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={draft}
                                    onChange={(e) => setDraft(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                                    Save as Draft
                                </span>
                            </label>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Draft posts are only visible to you
                            </p>
                        </div>
                    </ScrollStackItem>

                    {/* Submit Button Card */}
                    <ScrollStackItem
                        itemClassName="bg-white/5 dark:bg-slate-900/10 backdrop-blur-md border border-white/10 dark:border-slate-700/20 transition-all duration-300"
                    >
                        <div
                            ref={(el) => { cardRefs.current[7] = el; }}
                            className="flex flex-col items-center gap-4"
                        >
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleSubmit}
                                disabled={isLoading || !title.trim() || !content.trim() || tags.length === 0}
                                className="w-full max-w-md backdrop-blur-sm"
                            >
                                {isLoading ? 'Creating Blog Post...' : draft ? 'Save as Draft' : 'Publish Blog Post'}
                            </Button>
                            {onCancel && (
                                <Button
                                    variant="secondary"
                                    size="md"
                                    onClick={onCancel}
                                    disabled={isLoading}
                                    className="backdrop-blur-sm"
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </ScrollStackItem>
                </ScrollStack>
            </div>
        </div>
    );
};

export default CreateBlogForm;
