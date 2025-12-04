import React from 'react';
import ControlPanel from '@/components/panel/ControlPanel';
import Tooltip from '@/components/custom-ui/Tooltip';
import { getIcon } from '@/components/icon';
import Link from '@/components/custom-ui/Link';
import { cn } from '@/lib/utils';
import PageLikePanel from '../panel/PageLikePanel';

interface AllStarsLinkProps {
    className?: string;
    projectId?: string;
}

const AllStarsLink: React.FC<AllStarsLinkProps> = ({
    className = '',
    projectId,
}) => {
    const allStarsUri = projectId ? `/all-stars?galaxy=${projectId}` : '/all-stars';
    
    return (
        <div className={`fixed bottom-36 left-8 z-50 ${className}`}>
            <Tooltip
                content={
                    <PageLikePanel title="Go to 'All Stars', page with all galaxies" icon="info" className="flex items-center gap-2 text-sm bg-transparent dark:bg-transparent border-none dark:border-none">
                        <span>Also, zooming to the minimum viewport in zoom controller will open the 'All Stars' page.</span>
                    </PageLikePanel>
                }
            >
                <Link uri={allStarsUri}>
                    <ControlPanel
                        className={cn(
                            'p-3 transition-all duration-300',
                            '!backdrop-blur-none hover:!backdrop-blur-lg'
                        )}
                    >
                        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                            {getIcon({ iconType: 'ara', className: 'w-4 h-4' })}
                            <span className="text-xs font-mono">All Stars</span>
                        </div>
                    </ControlPanel>
                </Link>
            </Tooltip>
        </div>
    );
};

export default AllStarsLink;

