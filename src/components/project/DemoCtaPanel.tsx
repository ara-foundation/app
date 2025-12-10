import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useDemoStart } from '@/hooks/use-demo-start';
import DemoCongratulationsDialog from './DemoCongratulationsDialog';
import { startDemo, demoExists } from '@/client-side/demo';
import { DEMO_EVENT_TYPES } from '@/types/demo';

interface DemoCtaPanelProps {
    projectName: string
    galaxyId: string
}

const DemoCtaPanel: React.FC<DemoCtaPanelProps> = ({ projectName, galaxyId }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const { showDialog, demoUsers, setShowDialog, handleSuccess } = useDemoStart();

    // Listen for USER_CREATED event (only once on mount)
    useEffect(() => {
        const handleDemoUserCreated = () => {
            // Hide panel with animation
            setIsVisible(false);
        };

        window.addEventListener(DEMO_EVENT_TYPES.USER_CREATED, handleDemoUserCreated as EventListener);

        return () => {
            window.removeEventListener(DEMO_EVENT_TYPES.USER_CREATED, handleDemoUserCreated as EventListener);
        };
    }, []);

    // Hide panel if demo already exists
    useEffect(() => {
        if (demoExists()) {
            setIsVisible(false);
        }
    }, [demoExists]);

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && email.trim()) {
            const form = e.currentTarget.closest('form');
            if (form) {
                form.requestSubmit();
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email || !email.trim()) {
            setError('please write email address');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setError('please write email address');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await startDemo(email.trim());

            if (result.success && 'users' in result && result.users && Array.isArray(result.users)) {
                // Show congratulations dialog with confetti
                handleSuccess(result.users, email.trim());
            } else {
                setError('error' in result ? result.error || 'Failed to start demo' : 'Failed to start demo');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Don't render if not visible
    if (!isVisible) {
        return null;
    }

    return (
        <motion.div
            className={cn(
                "relative w-full max-w-md mx-auto -mt-20 z-11",
                "backdrop-blur-md bg-white/30 dark:bg-slate-900/30",
                "border border-slate-200/40 dark:border-slate-700/40",
                "rounded-xl p-8",
                "transition-all duration-300",
                "hover:bg-white/40 dark:hover:bg-slate-900/40",
                "hover:border-slate-300/60 dark:hover:border-slate-600/60",
                "hover:shadow-2xl hover:shadow-blue-500/30",
                "shadow-lg shadow-blue-500/10"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            animate={{
                scale: isHovered ? 1.02 : 1,
                y: isVisible ? (isHovered ? -4 : 0) : -20,
            }}
            exit={{
                opacity: 0,
                y: -20,
            }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
            }}
        >
            {/* Animated gradient overlay on hover */}
            {isHovered && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                />
            )}

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-6">
                {/* Title */}
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 text-center">
                    Demo Try out
                </h3>

                {/* Email Input with Button */}
                <form onSubmit={handleSubmit} className="w-full space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={handleEmailChange}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter your email"
                            className={cn(
                                "flex-1 h-12 px-4 rounded-lg",
                                "bg-white/50 dark:bg-slate-800/50",
                                "border border-slate-300/50 dark:border-slate-600/50",
                                "text-slate-800 dark:text-slate-200",
                                "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                                "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                                "focus:border-blue-500/50",
                                "transition-all duration-200",
                                error && "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                            )}
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                "h-12 px-6 whitespace-nowrap rounded-lg font-medium transition-colors",
                                "bg-rose-500 text-white hover:bg-sky-500",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                        >
                            {isLoading ? 'Starting...' : 'Start'}
                        </button>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="text-sm text-red-500 dark:text-red-400 text-center"
                            >
                                {typeof error === 'string' ? error : 'An error occurred'}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </form>

                {/* Info Paragraph */}
                <motion.p
                    className="text-sm text-slate-600 dark:text-slate-400 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    You will start immediately.
                </motion.p>
            </div>

            {/* Congratulations Dialog */}
            <DemoCongratulationsDialog
                isOpen={showDialog}
                users={demoUsers}
                onClose={() => setShowDialog(false)}
            />
        </motion.div>
    );
};

export default DemoCtaPanel;

