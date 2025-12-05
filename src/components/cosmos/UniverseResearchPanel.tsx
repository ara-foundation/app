import React, { useState } from 'react';
import ControlPanel from '@/components/panel/ControlPanel';
import { getIcon } from '@/components/icon';
import SearchBar from '@/components/SearchBar';
import Tooltip from '@/components/custom-ui/Tooltip';
import { cn } from '@/lib/utils';

interface UniverseResearchPanelProps {
    starsunshines?: number;
}

const UniverseResearchPanel: React.FC<UniverseResearchPanelProps> = ({
    starsunshines = 0,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedTrend, setSelectedTrend] = useState('');

    const isLocked = starsunshines === 0;

    const categories = ['All', 'Web Development', 'Blockchain', 'AI/ML', 'DevOps', 'Mobile'];
    const trends = ['Trending', 'Most Stars', 'Most Sunshines', 'Newest', 'Most Active'];

    const lockTooltipContent = (
        <div className="flex items-center gap-2 text-sm">
            {getIcon({ iconType: 'lock', className: 'w-4 h-4' })}
            <span>Obtain Stars or Starsunshines from any galaxy to unlock this panel</span>
        </div>
    );

    // Console icon SVG
    const ConsoleIcon = () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M6 8h.01M10 8h.01M14 8h.01" />
            <path d="M6 12h12M6 16h8" />
        </svg>
    );

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
                    <div>
                        <Tooltip content={isLocked ? lockTooltipContent : <span className="text-xs">Search projects, users, issues, and more...</span>}>
                            <div className="flex-1">
                                <SearchBar
                                    icon={<ConsoleIcon />}
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
                    </div>
                </ControlPanel>
            </div>
        </div>
    );
};

export default UniverseResearchPanel;

