import React, { useState, useEffect } from 'react';
import ControlPanel from '@/components/panel/ControlPanel';
import { getIcon } from '@/components/icon';
import SearchBar from '@/components/SearchBar';
import Tooltip from '@/components/custom-ui/Tooltip';
import { cn } from '@/lib/utils';
import Button from '../custom-ui/Button';
import GalaxyCreationStepper from '@/components/all-stars/galaxy/GalaxyCreationStepper';
import Badge from '@/components/badge/Badge';
import { Popover } from '@base-ui-components/react/popover';
import Link from '@/components/custom-ui/Link';
import NumberFlow from '@number-flow/react';
import ElectricBorder from '@/components/ElectricBorder';
import { authClient } from '@/client-side/auth';
import { getStarByUserId } from '@/client-side/star';
import { actions } from 'astro:actions';
import type { Galaxy } from '@/types/galaxy';
import type { AuthUser } from '@/types/auth';

interface UniverseResearchPanelProps {
    starsunshines?: number;
}

const UniverseResearchPanel: React.FC<UniverseResearchPanelProps> = ({
    starsunshines = 0,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentStep, setCurrentStep] = useState<number>(0); // 0 = search, 1 = stepper
    const [galaxies, setGalaxies] = useState<Galaxy[]>([]);
    const [isLoadingGalaxies, setIsLoadingGalaxies] = useState(false);

    const { data: session, isPending } = authClient.useSession();

    const isLocked = starsunshines === 0;

    // Fetch user's galaxies
    useEffect(() => {
        const fetchGalaxies = async () => {
            if (isPending) return;

            const user = session?.user as AuthUser | undefined;
            if (!user?.id) {
                setGalaxies([]);
                return;
            }

            setIsLoadingGalaxies(true);
            try {
                // Get user's star ID
                const star = await getStarByUserId(user.id);
                if (star?._id) {
                    // Fetch galaxies by maintainer (star ID)
                    const result = await actions.getGalaxiesByMaintainer({
                        maintainerId: star._id.toString()
                    });
                    if (result.data?.success && result.data.galaxies) {
                        setGalaxies(result.data.galaxies);
                    } else {
                        setGalaxies([]);
                    }
                } else {
                    setGalaxies([]);
                }
            } catch (error) {
                console.error('Error fetching galaxies:', error);
                setGalaxies([]);
            } finally {
                setIsLoadingGalaxies(false);
            }
        };

        fetchGalaxies();
    }, [session, isPending]);

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

    const hasNoGalaxies = galaxies.length === 0;
    const galaxyCount = galaxies.length;
    const showElectricBorderOnMyGalaxies = galaxyCount > 0;
    const showElectricBorderOnNewGalaxy = hasNoGalaxies;

    const newGalaxyTooltipContent = hasNoGalaxies ? (
        <div className="text-sm space-y-2">
            <p>Add your open-source project, and create it's galaxy in all-stars.</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
                You don't have any open-source project yet. Then, if you are contributor or user, browse the galaxies in the page
            </p>
        </div>
    ) : (
        <span className="text-xs">Add open-source repository to create its galaxy</span>
    );

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
                        <Tooltip content={newGalaxyTooltipContent}>
                            {showElectricBorderOnNewGalaxy ? (
                                <ElectricBorder color="#5227FF" speed={1} thickness={2}>
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
                                </ElectricBorder>
                            ) : (
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
                            )}
                        </Tooltip>
                        <Tooltip content="My open-source projects. Click and browse your galaxies">
                            <Popover.Root>
                                <Popover.Trigger className="hyperlink flex items-center justify-center shadow-none">
                                    {showElectricBorderOnMyGalaxies ? (
                                        <ElectricBorder color="#5227FF" speed={1} thickness={2}>
                                            <div
                                                className={cn(
                                                    "px-3 py-1.5 text-xs rounded flex items-center gap-2",
                                                    "opacity-70 hover:opacity-100",
                                                    "bg-slate-500 text-slate-100 hover:bg-slate-600 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500",
                                                    "border border-slate-300/20 dark:border-slate-600/20",
                                                    "hover:border-slate-400/30 dark:hover:border-slate-500/30",
                                                    "transition-all cursor-pointer",
                                                )}
                                            >
                                                My Galaxies
                                                <Badge variant="gray" static={true}>{galaxyCount}</Badge>
                                            </div>
                                        </ElectricBorder>
                                    ) : (
                                        <div
                                            className={cn(
                                                "px-3 py-1.5 text-xs rounded flex items-center gap-2",
                                                "opacity-70 hover:opacity-100",
                                                "bg-slate-500 text-slate-100 hover:bg-slate-600 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500",
                                                "border border-slate-300/20 dark:border-slate-600/20",
                                                "hover:border-slate-400/30 dark:hover:border-slate-500/30",
                                                "transition-all cursor-pointer",
                                            )}
                                        >
                                            My Galaxies
                                            {galaxyCount > 0 && (
                                                <Badge variant="gray" static={true}>{galaxyCount}</Badge>
                                            )}
                                        </div>
                                    )}
                                </Popover.Trigger>
                                <Popover.Portal>
                                    <Popover.Positioner sideOffset={8} side="top" className={'z-700!'}>
                                        <Popover.Popup className="w-80 origin-[var(--transform-origin)] rounded-xs bg-[canvas] px-4 py-3 text-gray-900 shadow-sm shadow-gray-900 dark:text-slate-300 dark:shadow-slate-300 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0">
                                            <Popover.Arrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
                                                {getIcon('arrow')}
                                            </Popover.Arrow>
                                            <Popover.Title className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-3">
                                                My Galaxies
                                            </Popover.Title>
                                            <Popover.Description className="text-gray-600 dark:text-slate-400">
                                                {isLoadingGalaxies ? (
                                                    <div className="text-sm text-center py-4">Loading...</div>
                                                ) : galaxies.length === 0 ? (
                                                    <div className="text-sm text-center py-4 text-slate-500 dark:text-slate-400">
                                                        No galaxies yet
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                                        {galaxies.map((galaxy) => {
                                                            const galaxyId = galaxy._id?.toString() || '';
                                                            return (
                                                                <Link
                                                                    key={galaxyId}
                                                                    uri={`/project?galaxy=${galaxyId}`}
                                                                    className="block p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                                                >
                                                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                                        {galaxy.name}
                                                                    </h3>
                                                                    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-1">
                                                                        <div className="flex items-center gap-1">
                                                                            {getIcon({ iconType: 'sunshine', className: 'w-3.5 h-3.5 text-yellow-500 dark:text-yellow-400' })}
                                                                            <NumberFlow
                                                                                value={galaxy.sunshines || 0}
                                                                                locales="en-US"
                                                                                format={{ style: 'decimal', maximumFractionDigits: 0 }}
                                                                            />
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            {getIcon({ iconType: 'star', className: 'w-3.5 h-3.5 text-blue-500 dark:text-blue-400' })}
                                                                            <NumberFlow
                                                                                value={galaxy.stars || 0}
                                                                                locales="en-US"
                                                                                format={{ style: 'decimal', maximumFractionDigits: 2 }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </Popover.Description>
                                        </Popover.Popup>
                                    </Popover.Positioner>
                                </Popover.Portal>
                            </Popover.Root>
                        </Tooltip>
                    </div>
                </ControlPanel>
            </div>
        </div>
    );
};

export default UniverseResearchPanel;
