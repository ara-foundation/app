import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../animate-ui/components/animate/tooltip";

interface Props {
  content: string | React.ReactNode;
  children: any
  openDelay?: number;
}

const Component: React.FC<Props> = ({ children, content, openDelay = 50 }) => {
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
          className="rounded-xs bg-black text-blue-100 border-color-teal-900 dark:bg-black dark:text-slate-200 dark:border-color-teal-500"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default Component