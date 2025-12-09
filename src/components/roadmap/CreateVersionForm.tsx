import React, { useState, useRef, useEffect, useCallback } from 'react';
import ScrollStack, { ScrollStackItem } from '@/components/ScrollStack';
import Button from '@/components/custom-ui/Button';
import { getDemo } from '@/client-side/demo';
import { createVersion } from '@/client-side/roadmap';
import { Checkbox, CheckboxIndicator } from '@/components/animate-ui/primitives/radix/checkbox';

interface CreateVersionFormProps {
    galaxyId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const CreateVersionForm: React.FC<CreateVersionFormProps> = ({ galaxyId, onSuccess, onCancel }) => {
    const [tag, setTag] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const tagInputRef = useRef<HTMLInputElement>(null);

    // Focus on tag input when form opens
    useEffect(() => {
        if (tagInputRef.current) {
            setTimeout(() => tagInputRef.current?.focus(), 100);
        }
    }, []);

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
            if (e.key === 'Enter' || e.key === 'Tab') {
                // Prevent default tab behavior when not in input
                if (e.key === 'Tab' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
                    e.preventDefault();
                }

                // If Enter is pressed in input, move to next card
                if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
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
        if (!tag.trim()) {
            alert('Please enter a version tag');
            return;
        }

        setIsLoading(true);
        try {
            const demo = getDemo();
            if (!demo.email) {
                alert('Please log in to create a version');
                setIsLoading(false);
                return;
            }

            const version = await createVersion({
                galaxyId,
                tag: tag.trim(),
                email: demo.email,
            });

            if (version) {
                onSuccess?.();
            } else {
                alert('Failed to create version');
            }
        } catch (error) {
            console.error('Error creating version:', error);
            alert('An error occurred while creating the version');
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

            {/* ScrollStack Form - Sticky to footer */}
            <div
                ref={scrollContainerRef}
                className="absolute bottom-0 left-0 right-0 h-[80vh] pointer-events-auto"
            >
                <ScrollStack useWindowScroll={false} className="h-full">
                    {/* Card 1: Tag */}
                    <ScrollStackItem
                        itemClassName="bg-white/5 dark:bg-slate-900/10 backdrop-blur-md border border-white/10 dark:border-slate-700/20 transition-all duration-300"
                    >
                        <div
                            ref={(el) => { cardRefs.current[0] = el; }}
                            className="space-y-4"
                        >
                            <label className="block text-lg font-semibold text-slate-700 dark:text-slate-300">
                                Version Tag *
                            </label>
                            <input
                                ref={tagInputRef}
                                type="text"
                                value={tag}
                                onChange={(e) => setTag(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        scrollToNextCard();
                                    }
                                }}
                                placeholder="Enter a version tag (e.g., v2.0.0)"
                                className="w-full text-lg px-3 py-2 border border-gray-300/50 dark:border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/30 dark:bg-slate-900/40 backdrop-blur-md"
                            />
                        </div>
                    </ScrollStackItem>

                    {/* Card 2: Maintainer */}
                    <ScrollStackItem
                        itemClassName="bg-white/5 dark:bg-slate-900/10 backdrop-blur-md border border-white/10 dark:border-slate-700/20 transition-all duration-300"
                    >
                        <div
                            ref={(el) => { cardRefs.current[1] = el; }}
                            className="space-y-4"
                        >
                            <label className="block text-lg font-semibold text-slate-700 dark:text-slate-300">
                                Maintainer *
                            </label>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Assign yourself as the maintainer of this version
                            </p>
                            <div className="flex items-center gap-3 p-4 bg-slate-200/80 dark:bg-slate-800/80 rounded-lg border border-gray-300/50 dark:border-slate-700/50 backdrop-blur-sm">
                                <Checkbox
                                    checked={true}
                                    disabled
                                    className="w-5 h-5 rounded-sm border-2 border-slate-400 dark:border-slate-600 bg-slate-700 dark:bg-slate-800 data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-600 dark:data-[state=checked]:border-blue-500 flex items-center justify-center"
                                >
                                    <CheckboxIndicator className="w-3 h-3 text-white" />
                                </Checkbox>
                                <span className="text-slate-700 dark:text-slate-300 flex-1">
                                    Assign to me
                                </span>
                            </div>
                        </div>
                    </ScrollStackItem>

                    {/* Submit Button Card */}
                    <ScrollStackItem
                        itemClassName="bg-white/5 dark:bg-slate-900/10 backdrop-blur-md border border-white/10 dark:border-slate-700/20 transition-all duration-300"
                    >
                        <div
                            ref={(el) => { cardRefs.current[2] = el; }}
                            className="flex flex-col items-center gap-4"
                        >
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleSubmit}
                                disabled={isLoading || !tag.trim()}
                                className="w-full max-w-md backdrop-blur-sm"
                            >
                                {isLoading ? 'Creating Version...' : 'Create Version'}
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

export default CreateVersionForm;

