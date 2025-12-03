import React, { useState } from 'react';
import { motion } from 'motion/react';
import Button from '@/components/custom-ui/Button';
import Tooltip from '@/components/custom-ui/Tooltip';
import { getIcon } from '@/components/icon';
import Badge from '@/components/badge/Badge';
import { cn } from '@/lib/utils';

const ProjectCTAPanel: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  const tooltipContent = (
    <div className="text-sm max-w-xs">
      <p>- Obtain sunshines, collaborate with maintainer on project issues. Turn sunshines to stars. Grow stars and turn it community owned project</p>
    </div>
  );

  return (
    <motion.div
      className={cn(
        "relative w-full max-w-md mx-auto mt-12",
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
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            Show your star
          </h3>
          <Tooltip content={tooltipContent}>
            <span className="flex items-center gap-1 cursor-help">
              {getIcon({ iconType: 'info', className: 'w-4 h-4' })}
            </span>
          </Tooltip>
        </div>

        {/* CTA Button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => {
            // Handle CTA click
            console.log('Show your star clicked');
          }}
        >
          Get Started
        </Button>
      </div>
    </motion.div>
  );
};

export default ProjectCTAPanel;

