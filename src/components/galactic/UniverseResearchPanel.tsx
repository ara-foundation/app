import React, { useState } from 'react';
import ControlPanel from '@/components/panel/ControlPanel';
import { getIcon } from '@/components/icon';
import Input from '@/components/Input';
import Tooltip from '@/components/custom-ui/Tooltip';
import { cn } from '@/lib/utils';

interface UniverseResearchPanelProps {
    starsunshines?: number;
}

const UniverseResearchPanel: React.FC<UniverseResearchPanelProps> = ({
    starsunshines = 0,
}) => {
    const [searchGalaxies, setSearchGalaxies] = useState('');
    const [searchStars, setSearchStars] = useState('');
    const [searchIssues, setSearchIssues] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedTrend, setSelectedTrend] = useState('');

    const isLocked = starsunshines === 0;

    const categories = ['All', 'Web Development', 'Blockchain', 'AI/ML', 'DevOps', 'Mobile'];
    const trends = ['Trending', 'Most Stars', 'Most Sunshines', 'Newest', 'Most Active'];

    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <ControlPanel
                className={cn(
                    'p-4 min-w-[400px] max-w-[600px]',
                    'backdrop-blur-lg bg-slate-400/10 dark:bg-slate-600/10',
                    'border border-slate-300/20 dark:border-slate-600/20',
                    'rounded-lg',
                    isLocked && 'opacity-60'
                )}
            >
                {isLocked ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-slate-500 dark:text-slate-400">
                        {getIcon({ iconType: 'lock', className: 'w-5 h-5' })}
                        <span className="text-sm">
                            Obtain Stars or Starsunshines from any galaxy to unlock this panel
                        </span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Search Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 dark:text-slate-400">Search Galaxies</label>
                                <Input
                                    type="text"
                                    placeholder="Find projects..."
                                    value={searchGalaxies}
                                    onChange={(e) => setSearchGalaxies(e.target.value)}
                                    disabled={isLocked}
                                    className="w-full text-xs bg-white/5 dark:bg-slate-900/5 border-slate-200/20 dark:border-slate-700/20"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 dark:text-slate-400">Search Stars</label>
                                <Input
                                    type="text"
                                    placeholder="Find users..."
                                    value={searchStars}
                                    onChange={(e) => setSearchStars(e.target.value)}
                                    disabled={isLocked}
                                    className="w-full text-xs bg-white/5 dark:bg-slate-900/5 border-slate-200/20 dark:border-slate-700/20"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 dark:text-slate-400">Search Issues</label>
                                <Input
                                    type="text"
                                    placeholder="Keywords..."
                                    value={searchIssues}
                                    onChange={(e) => setSearchIssues(e.target.value)}
                                    disabled={isLocked}
                                    className="w-full text-xs bg-white/5 dark:bg-slate-900/5 border-slate-200/20 dark:border-slate-700/20"
                                />
                            </div>
                        </div>

                        {/* Trends and Categories */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 dark:text-slate-400">Trends</label>
                                <select
                                    value={selectedTrend}
                                    onChange={(e) => setSelectedTrend(e.target.value)}
                                    disabled={isLocked}
                                    className="w-full px-3 py-2 text-xs bg-white/5 dark:bg-slate-900/5 border border-slate-200/20 dark:border-slate-700/20 rounded-md text-slate-700 dark:text-slate-300"
                                >
                                    {trends.map(trend => (
                                        <option key={trend} value={trend.toLowerCase()}>{trend}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 dark:text-slate-400">Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    disabled={isLocked}
                                    className="w-full px-3 py-2 text-xs bg-white/5 dark:bg-slate-900/5 border border-slate-200/20 dark:border-slate-700/20 rounded-md text-slate-700 dark:text-slate-300"
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category.toLowerCase()}>{category}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </ControlPanel>
        </div>
    );
};

export default UniverseResearchPanel;

