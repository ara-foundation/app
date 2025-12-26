import React, { useState } from 'react';
import ControlPanel from '@/components/panel/ControlPanel';
import { getIcon } from '@/components/icon';
import SearchBar from '@/components/SearchBar';
import Tooltip from '@/components/custom-ui/Tooltip';
import { cn } from '@/lib/utils';
import Button from '../custom-ui/Button';
import GalaxyCreationStepper from '@/components/all-stars/galaxy/GalaxyCreationStepper';

interface UniverseResearchPanelProps {
    starsunshines?: number;
}

const UniverseResearchPanel: React.FC<UniverseResearchPanelProps> = ({
    starsunshines = 0,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentStep, setCurrentStep] = useState<number>(0); // 0 = search, 1 = stepper

    const isLocked = starsunshines === 0;

    const lockTooltipContent = (
        <div className="flex items-center gap-2 text-sm">
            {getIcon({ iconType: 'lock', className: 'w-4 h-4' })}
            <span>Join our community, to try when this panel is ready</span>
        </div>
    );

    const handleCancel = () => {
        setCurrentStep(0); // Back to search
    };

    const handleComplete = () => {
        // Reset after completion
        setTimeout(() => {
            setCurrentStep(0);
        }, 3000);
    };

    // Show dialog overlay for multi-step flow
    if (currentStep > 0) {
        return (
            <>
                {/* Backdrop */}
                <div
                    className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm z-[100]"
                    onClick={currentStep === 1 ? handleCancel : undefined}
                />

                {/* Dialog with Stepper */}
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] flex items-center justify-center max-w-4xl w-full px-4">
                    <div className="w-full max-w-2xl">
                        <GalaxyCreationStepper
                            onCancel={handleCancel}
                            onComplete={handleComplete}
                        />
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-10">
            <div className="relative">
                {/* Additional Side Panels - Control Wheels (almost invisible) */}
                <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 -z-1">
                    <div className={cn(
                        "w-6 h-16 p-1",
                        "backdrop-blur-sm bg-slate-900/20 dark:bg-slate-900/20",
                        "border border-slate-300/5 dark:border-slate-600/5",
                        "rounded-sm"
                    )}>
                        <div className="h-full w-full border-l border-slate-300/5 dark:border-slate-600/5" />
                    </div>
                </div>

                <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 -z-1">
                    <div className={cn(
                        "w-6 h-16 p-1",
                        "backdrop-blur-sm bg-slate-900/20 dark:bg-slate-900/20",
                        "border border-slate-300/5 dark:border-slate-600/5",
                        "rounded-sm"
                    )}>
                        <div className="h-full w-full border-r border-slate-300/5 dark:border-slate-600/5" />
                    </div>
                </div>

                <ControlPanel className="p-3 min-w-[400px] max-w-[600px]">
                    {/* Console Header with Icon and SearchBar */}
                    <div className="flex items-center gap-2 space-x-4">
                        <Tooltip content={isLocked ? lockTooltipContent : <span className="text-xs">Search projects, users, issues, and more...</span>}>
                            <div className="flex-1">
                                <SearchBar
                                    icon="console"
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder="Search universe..."
                                    className={cn(
                                        "bg-slate-800/20 dark:bg-slate-900/20",
                                        "border-slate-300/20 dark:border-slate-600/20",
                                        "text-slate-400 dark:text-slate-500",
                                        "placeholder:text-slate-500/50 dark:placeholder:text-slate-500/50",
                                        "focus:ring-slate-400/20 focus:border-slate-400/30",
                                        isLocked && "opacity-50 cursor-not-allowed"
                                    )}
                                />
                            </div>
                        </Tooltip>
                        <Tooltip content="Add open-source repository to create its galaxy">
                            <Button
                                onClick={() => setCurrentStep(1)}
                                className={cn(
                                    "px-3 py-1.5 text-xs rounded",
                                    "opacity-70 hover:opacity-100",
                                    "text-slate-400 dark:text-white",
                                    "border border-slate-300/20 dark:border-slate-600/20",
                                    "hover:border-slate-400/30 dark:hover:border-slate-500/30",
                                    "transition-all",
                                )}
                            >
                                New Galaxy
                            </Button>
                        </Tooltip>
                    </div>
                </ControlPanel>
            </div>
        </div>
    );
};

export default UniverseResearchPanel;
