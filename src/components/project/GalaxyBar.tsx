import React, { useState } from 'react';
import ControlPanel from '@/components/panel/ControlPanel';
import { getIcon } from '@/components/icon';
import Tooltip from '@/components/custom-ui/Tooltip';
import { cn } from '@/lib/utils';
import Button from '@/components/custom-ui/Button';
import Link from '@/components/custom-ui/Link';
import ObtainSunshines501Dialog from './ObtainSunshines501Dialog';
import GalaxyBarMenuPopover from './GalaxyBarMenuPopover';
import GalaxyBarSpeedometer from './GalaxyBarSpeedometer';

interface GalaxyBarProps {
  galaxyId: string;
  projectIcon?: string;
  projectName?: string;
  userSunshines?: number;
  userStars?: number;
  hasStarOnPage?: boolean;
}

const GalaxyBar: React.FC<GalaxyBarProps> = ({
  galaxyId,
  projectIcon,
  projectName = 'Ara',
  userSunshines = 0,
  userStars = 0,
  hasStarOnPage = false,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const baseUri = (path: string) => `${path}?galaxy=${galaxyId}`;

  const handleObtainSunshines = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-10">
        <div className="relative">
          {/* Speedometer Panel - Above left control wheel */}
          <div className="absolute -left-[11rem] top-1/2 transform -translate-y-1/2 -translate-y-[4.5rem] -z-1">
            <GalaxyBarSpeedometer
              sunshines={userSunshines}
              stars={userStars}
              hasStarOnPage={hasStarOnPage}
            />
          </div>

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

          <ControlPanel className="p-3 overflow-visible">
            <div className="flex items-center gap-3 ">
              {/* Ara Logo (noLink version) */}
              <div className="w-4 h-full items-center relative ">
                <div className="absolute w-8 h-8 -mt-4 -ml-6">
                  <img
                    src="/ara_logo.png"
                    alt="Ara Logo"
                    className="h-full w-full"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
              </div>

              {/* Obtain Sunshines Button */}
              <Tooltip content="Fund the project to obtain sunshines. Funds go to the project maintainers. If are a project owner or want to contribute, basically if you want to work on this project, then select in additional options a share link. And spread information to others for funding it.">
                <Button
                  onClick={handleObtainSunshines}
                  className={cn(
                    "px-4 py-2 text-xs font-semibold rounded",
                    "bg-gradient-to-r from-yellow-500 to-orange-500",
                    "text-white shadow-lg",
                    "hover:from-yellow-600 hover:to-orange-600",
                    "hover:shadow-xl hover:scale-105",
                    "active:scale-95",
                    "transition-all duration-200",
                    "border-0 cursor-pointer",
                    "relative overflow-hidden",
                    "before:absolute before:inset-0 before:bg-gradient-to-r before:from-yellow-400 before:to-orange-400 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200",
                  )}
                >
                  <span className="relative z-10">Obtain Sunshines</span>
                </Button>
              </Tooltip>

              {/* Issues Button */}
              <Tooltip content="Raise issues for the galaxy. By attaching sunshines you can influence the project trajectory.">
                <Link
                  uri={baseUri('/project/issues')}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded flex items-center gap-1.5 font-medium",
                    "border-2 border-blue-500/80 dark:border-blue-400/80",
                    "text-blue-600 dark:text-blue-400",
                    "bg-blue-50/50 dark:bg-blue-900/20",
                    "hover:bg-blue-100/70 dark:hover:bg-blue-900/40",
                    "hover:border-blue-600 dark:hover:border-blue-300",
                    "hover:text-blue-700 dark:hover:text-blue-300",
                    "hover:scale-105 active:scale-95",
                    "transition-all duration-200",
                    "shadow-sm hover:shadow-md",
                    "ml-2 -mr-1"
                  )}
                >
                  {getIcon({ iconType: 'issue', className: 'w-4 h-4' })}
                  <span>Issues</span>
                </Link>
              </Tooltip>

              {/* Roadmap Button */}
              <Tooltip content="View project roadmap, manage versions and patche the issues. Patching the issues with the attached sunshines will forge stars and track on public ledger. Distribute to all parties">
                <Link
                  uri={baseUri('/project/roadmap')}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded flex items-center gap-1.5 font-medium",
                    "border-2 border-emerald-500/80 dark:border-emerald-400/80",
                    "text-emerald-600 dark:text-emerald-400",
                    "bg-emerald-50/50 dark:bg-emerald-900/20",
                    "hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40",
                    "hover:border-emerald-600 dark:hover:border-emerald-300",
                    "hover:text-emerald-700 dark:hover:text-emerald-300",
                    "hover:scale-105 active:scale-95",
                    "transition-all duration-200",
                    "shadow-sm hover:shadow-md",
                    "mr-2"
                  )}
                >
                  {getIcon({ iconType: 'navigation', className: 'w-4 h-4' })}
                  <span>Roadmap</span>
                </Link>
              </Tooltip>

              {/* Dependencies Button */}
              <Tooltip content="View project dependencies, raise issues for the dependencies and attach sunshines to influence the dependencies trajectory.">
                <Link
                  uri={baseUri('/project/dependencies')}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded flex items-center gap-1.5 font-medium",
                    "border-2 border-purple-500/80 dark:border-purple-400/80",
                    "text-purple-600 dark:text-purple-400",
                    "bg-purple-50/50 dark:bg-purple-900/20",
                    "hover:bg-purple-100/70 dark:hover:bg-purple-900/40",
                    "hover:border-purple-600 dark:hover:border-purple-300",
                    "hover:text-purple-700 dark:hover:text-purple-300",
                    "hover:scale-105 active:scale-95",
                    "transition-all duration-200",
                    "shadow-sm hover:shadow-md",
                  )}
                >
                  {getIcon({ iconType: 'connection', className: 'w-4 h-4' })}
                  <span>Dependencies</span>
                </Link>
              </Tooltip>

              {/* Three Dots Menu Button */}
              <GalaxyBarMenuPopover galaxyId={galaxyId} />
            </div>
          </ControlPanel>
        </div>
      </div>

      {/* Obtain Sunshines Dialog */}
      <ObtainSunshines501Dialog isOpen={isDialogOpen} onClose={handleCloseDialog} />
    </>
  );
};

export default GalaxyBar;

