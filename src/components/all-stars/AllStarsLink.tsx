'use client'
import React from 'react';
import ControlPanel from '@/components/panel/ControlPanel';
import Tooltip from '@/components/custom-ui/Tooltip';
import { getIcon } from '@/components/icon';
import Link from '@/components/custom-ui/Link';
import { cn } from '@/lib/utils';
import PageLikePanel from '../panel/PageLikePanel';
import { authClient } from '@/client-side/auth';
import ElectricBorder from '@/components/ElectricBorder';

interface AllStarsLinkProps {
    className?: string;
    projectId?: string;
}

const AllStarsLink: React.FC<AllStarsLinkProps> = ({
    className = '',
    projectId,
}) => {
    const { data: session } = authClient.useSession();
    const isLoggedIn = !!session?.user;

    const allStarsUri = projectId ? `/all-stars?galaxy=${projectId}` : '/all-stars';
    
    const linkContent = (
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
    );

    const wrappedContent = isLoggedIn ? (
        <ElectricBorder color="#5227FF" speed={1} chaos={1} thickness={2}>
            {linkContent}
        </ElectricBorder>
    ) : (
        linkContent
    );
    
    return (
        <div className={`fixed bottom-36 left-8 z-50 ${className}`}>
            <Tooltip
                content={
                    <PageLikePanel title="All Stars" icon="info" className="flex items-center gap-2 text-sm bg-transparent dark:bg-transparent border-none dark:border-none">
                        <div className="space-y-2">
                            <span>All Stars page represents the universe of open-source projects. Browse and create your project there.</span>
                            {isLoggedIn && (
                                <div className="font-bold text-blue-500 dark:text-blue-400 mt-2">
                                    Visit All-Stars, and add your open-source project
                                </div>
                            )}
                        </div>
                    </PageLikePanel>
                }
            >
                {wrappedContent}
            </Tooltip>
        </div>
    );
};

export default AllStarsLink;

