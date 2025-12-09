import React, { useState, useEffect, useRef, useCallback } from 'react';
import ScrollStack, { ScrollStackItem } from '@/components/ScrollStack';
import Button from '@/components/custom-ui/Button';
import Badge from '@/components/badge/Badge';
import * as RadixSlider from '@radix-ui/react-slider';
import { IssueTag } from '@/types/issue';
import { getDemo } from '@/client-side/demo';
import { createIssue } from '@/client-side/issue';
import { getUserById } from '@/client-side/user';
import NumberFlow from '@number-flow/react';
import { cn } from '@/lib/utils';

interface CreateIssueFormProps {
    galaxyId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const CreateIssueForm: React.FC<CreateIssueFormProps> = ({ galaxyId, onSuccess, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTags, setSelectedTags] = useState<IssueTag[]>([]);
    const [sunshines, setSunshines] = useState(0);
    const [availableSunshines, setAvailableSunshines] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSunshines, setIsLoadingSunshines] = useState(true);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const titleInputRef = useRef<HTMLInputElement>(null);

    // Fetch user sunshines
    useEffect(() => {
        const fetchUserSunshines = async () => {
            try {
                const demo = getDemo();
                if (demo.email && demo.users) {
                    const currentUser = demo.users.find(u => u.role === 'user') || demo.users[0];
                    if (currentUser && currentUser._id) {
                        const user = await getUserById(currentUser._id.toString());
                        if (user) {
                            setAvailableSunshines(user.sunshines || 0);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching user sunshines:', error);
            } finally {
                setIsLoadingSunshines(false);
            }
        };

        fetchUserSunshines();
    }, []);

    const toggleTag = (tag: IssueTag) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
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
            // Don't handle if user is typing in textarea (Shift+Enter for new line)
            if (e.target instanceof HTMLTextAreaElement && e.key === 'Enter' && e.shiftKey) {
                return;
            }

            if (e.key === 'Enter' || e.key === 'Tab') {
                // Prevent default tab behavior when not in input
                if (e.key === 'Tab' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
                    e.preventDefault();
                }

                // If Enter is pressed in input/textarea, move to next card
                if (e.key === 'Enter' && (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
                    e.preventDefault();
                    scrollToNextCard();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [scrollToNextCard]);

    // Track scroll position to determine card opacity
    useEffect(() => {
        const container = scrollContainerRef.current?.querySelector('.scroll-stack-inner') as HTMLElement;
        if (!container) return;

        const handleScroll = () => {
        };

        // Use requestAnimationFrame for smooth updates
        let rafId: number;
        const rafHandleScroll = () => {
            handleScroll();
            rafId = requestAnimationFrame(rafHandleScroll);
        };

        container.addEventListener('scroll', () => {
            if (!rafId) {
                rafId = requestAnimationFrame(rafHandleScroll);
            }
        });

        handleScroll(); // Initial call

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            container.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim() || selectedTags.length === 0) {
            alert('Please fill in all required fields (title, description, and at least one tag)');
            return;
        }

        setIsLoading(true);
        try {
            const demo = getDemo();
            if (!demo.email || !demo.users) {
                alert('Please log in to create an issue');
                setIsLoading(false);
                return;
            }

            const currentUser = demo.users.find(u => u.role === 'user') || demo.users[0];
            if (!currentUser || !currentUser._id) {
                alert('User not found');
                setIsLoading(false);
                return;
            }

            const createdIssue = await createIssue({
                galaxyId,
                userId: currentUser._id.toString(),
                email: demo.email,
                title: title.trim(),
                description: description.trim(),
                tags: selectedTags,
                sunshines,
            });

            if (createdIssue) {
                onSuccess?.();
            } else {
                alert('Failed to create issue');
            }
        } catch (error) {
            console.error('Error creating issue:', error);
            alert('An error occurred while creating the issue');
        } finally {
            setIsLoading(false);
        }
    };

    const tagOptions = [
        { value: IssueTag.BUG, label: 'Bug' },
        { value: IssueTag.FEATURE, label: 'Feature' },
        { value: IssueTag.IMPROVEMENT, label: 'Improvement' },
        { value: IssueTag.ENHANCEMENT, label: 'Enhancement' },
        { value: IssueTag.WISH, label: 'Wish' },
        { value: IssueTag.CUSTOM, label: 'Custom' },
    ];

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

            {/* ScrollStack Form - Sticky to footer */}
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
                                Issue Title *
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
                                Description *
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        scrollToNextCard();
                                    }
                                }}
                                placeholder="Describe the issue in detail..."
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300/50 dark:border-slate-700/50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cascade-blue focus:border-cascade-blue bg-white/30 dark:bg-slate-900/40 backdrop-blur-md resize-none"
                            />
                        </div>
                    </ScrollStackItem>

                    {/* Card 3: Tags */}
                    <ScrollStackItem
                        itemClassName="bg-white/5 dark:bg-slate-900/10 backdrop-blur-md border border-white/10 dark:border-slate-700/20 transition-all duration-300"
                    >
                        <div
                            ref={(el) => { cardRefs.current[2] = el; }}
                            className="space-y-4"
                        >
                            <label className="block text-lg font-semibold text-slate-700 dark:text-slate-300">
                                Tags * (Select at least one)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {tagOptions.map((tag) => (
                                    <button
                                        key={tag.value}
                                        onClick={() => toggleTag(tag.value)}
                                        className={cn(
                                            "px-4 py-2 rounded-lg transition-all backdrop-blur-sm",
                                            selectedTags.includes(tag.value)
                                                ? "bg-blue-500/90 text-white"
                                                : "bg-slate-200/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-300/90 dark:hover:bg-slate-700/90"
                                        )}
                                    >
                                        {tag.label}
                                    </button>
                                ))}
                            </div>
                            {selectedTags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedTags.map((tag) => (
                                        <Badge key={tag} variant="info">
                                            {tagOptions.find(t => t.value === tag)?.label}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollStackItem>

                    {/* Card 4: Sunshines Slider */}
                    <ScrollStackItem
                        itemClassName="bg-white/5 dark:bg-slate-900/10 backdrop-blur-md border border-white/10 dark:border-slate-700/20 transition-all duration-300"
                    >
                        <div
                            ref={(el) => { cardRefs.current[4] = el; }}
                            className="space-y-6"
                        >
                            <div>
                                <label className="block text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Allocate Sunshines (Optional)
                                </label>
                                {isLoadingSunshines ? (
                                    <p className="text-slate-500">Loading...</p>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                                            <span>Available Sunshines:</span>
                                            <span className="font-semibold">
                                                <NumberFlow
                                                    value={availableSunshines}
                                                    locales="en-US"
                                                    format={{ useGrouping: true }}
                                                />
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                                            <span>Allocating:</span>
                                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                <NumberFlow
                                                    value={sunshines}
                                                    locales="en-US"
                                                    format={{ useGrouping: true }}
                                                />
                                            </span>
                                        </div>
                                        <RadixSlider.Root
                                            value={[sunshines]}
                                            onValueChange={(value) => setSunshines(value[0])}
                                            max={availableSunshines}
                                            min={0}
                                            step={1}
                                            disabled={availableSunshines === 0}
                                            className="relative flex h-5 w-full touch-none select-none items-center"
                                        >
                                            <RadixSlider.Track className="relative h-2 grow rounded-full bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur-sm">
                                                <RadixSlider.Range className="absolute h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-100" />
                                            </RadixSlider.Track>
                                            <RadixSlider.Thumb className="relative block h-5 w-5 rounded-full bg-yellow-400 dark:bg-yellow-500 shadow-md ring-2 ring-yellow-300 dark:ring-yellow-600 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                                        </RadixSlider.Root>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {sunshines > 0
                                                ? 'Issue will be added to Shining Issues'
                                                : 'Issue will be added to Public Backlog'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollStackItem>

                    {/* Submit Button Card */}
                    <ScrollStackItem
                        itemClassName="bg-white/5 dark:bg-slate-900/10 backdrop-blur-md border border-white/10 dark:border-slate-700/20 transition-all duration-300"
                    >
                        <div
                            ref={(el) => { cardRefs.current[5] = el; }}
                            className="flex flex-col items-center gap-4"
                        >
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleSubmit}
                                disabled={isLoading || !title.trim() || !description.trim() || selectedTags.length === 0}
                                className="w-full max-w-md backdrop-blur-sm"
                            >
                                {isLoading ? 'Creating Issue...' : 'Create Issue'}
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

export default CreateIssueForm;

