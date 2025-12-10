import React, { useState } from 'react';
import { motion } from 'motion/react';
import Button, { ButtonVariant } from '@/components/custom-ui/Button';
import Link from '@/components/custom-ui/Link';
import Tooltip from '@/components/custom-ui/Tooltip';
import { getIcon } from '@/components/icon';
import { cn } from '@/lib/utils';
import DemoAuthPanel from '@/components/demo/DemoAuthPanel';

interface ProjectCTAStepPanelProps {
    title: string;
    tooltipContent?: React.ReactNode;
    hintText?: React.ReactNode;
    buttonText: string;
    buttonLoadingText?: string;
    buttonVariant?: ButtonVariant;
    buttonSize?: 'sm' | 'md' | 'lg';
    buttonClassName?: string;
    onClick?: () => void;
    uri?: string;
    isLoading?: boolean;
    disabled?: boolean;
}

const ProjectCTAStepPanel: React.FC<ProjectCTAStepPanelProps> = ({
    title,
    tooltipContent,
    hintText,
    buttonText,
    buttonLoadingText = 'Processing...',
    buttonVariant = 'primary',
    buttonSize = 'lg',
    buttonClassName,
    onClick,
    uri,
    isLoading = false,
    disabled = false,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <DemoAuthPanel>
            <motion.div
                className={cn(
                    "relative w-full max-w-md mx-auto mt-1",
                    "backdrop-blur-md bg-white/20 dark:bg-slate-900/20",
                    "border border-slate-200/30 dark:border-slate-700/30",
                    "rounded-lg p-6",
                    "transition-all duration-300",
                    "hover:bg-white/30 dark:hover:bg-slate-900/30",
                    "hover:border-slate-300/50 dark:hover:border-slate-600/50",
                    "hover:shadow-xl hover:shadow-blue-500/20"
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                animate={{
                    scale: isHovered ? 1.02 : 1,
                    y: isHovered ? -4 : 0,
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
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    />
                )}

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center gap-4">
                    {/* Title with Info Badge */}
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">
                            {title}
                        </h3>
                        {tooltipContent && (
                            <Tooltip content={tooltipContent}>
                                <span className="flex items-center gap-1 cursor-help">
                                    {getIcon({ iconType: 'info', className: 'w-4 h-4' })}
                                </span>
                            </Tooltip>
                        )}
                    </div>

                    {/* Hint text */}
                    {hintText && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 h-6">
                            {hintText}
                        </div>
                    )}

                    {/* CTA Button */}
                    {uri ? (
                        <Link uri={uri}>
                            <Button
                                variant={buttonVariant}
                                size={buttonSize}
                                className={cn("w-full text-shadow-lg", buttonClassName)}
                                disabled={disabled || isLoading}
                            >
                                {isLoading ? buttonLoadingText : buttonText}
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            variant={buttonVariant}
                            size={buttonSize}
                            className={cn("w-full text-shadow-lg", buttonClassName)}
                            onClick={onClick}
                            disabled={disabled || isLoading}
                        >
                            {isLoading ? buttonLoadingText : buttonText}
                        </Button>
                    )}
                </div>
            </motion.div>
        </DemoAuthPanel>
    );
};

export default ProjectCTAStepPanel;

