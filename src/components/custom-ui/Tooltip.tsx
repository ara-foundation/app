import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../animate-ui/components/animate/tooltip";
import { cn } from '@/lib/utils';

interface Props {
  content: string | React.ReactNode;
  children: any
  openDelay?: number;
  tooltipClassName?: string;
}

const Component: React.FC<Props> = ({ children, content, openDelay = 50, tooltipClassName }) => {
  // Track content changes to force re-render when content updates
  const [contentKey, setContentKey] = React.useState(0);

  React.useEffect(() => {
    // Increment key when content changes to force TooltipContent to re-render
    setContentKey(prev => prev + 1);
  }, [content]);

  return (
    <TooltipProvider openDelay={openDelay}>
      <Tooltip>
        <TooltipTrigger className={``}>
          {children}
        </TooltipTrigger>
        <TooltipContent
          key={contentKey}
          autoFocus
          className={cn(
            "rounded-xs max-w-2xl h-auto",
            "bg-white/90 backdrop-blur-md text-slate-800",
            "dark:bg-white/10 dark:backdrop-blur-md dark:text-slate-100",
            "border border-slate-200/50 dark:border-slate-700/50",
            "shadow-lg text-lg",
            tooltipClassName // Allow custom className override
          )}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default Component