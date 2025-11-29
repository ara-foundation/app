import React from 'react'
import InteractivePanel, { InteractivePanelProps } from './InteractiveContainer'
import { getIcon, IconType } from '@/components/icon'
import { cn } from '@/lib/utils'
import type { ActionProps } from '@/types/eventTypes'
import BasePanel from './Panel'
import PanelAction from './PanelAction'

export interface PageLikePanelProps extends Omit<InteractivePanelProps, 'children' | 'expandableTitle'> {
    icon?: IconType
    title: React.ReactNode
    subtitle?: React.ReactNode
    titleCenter?: boolean
    rightHeader?: React.ReactNode
    actions?: ActionProps[] | React.ReactNode
    children: React.ReactNode
    expandable?: boolean
    interactive?: boolean
}

const PageLikePanel: React.FC<PageLikePanelProps> = ({
    icon,
    title,
    subtitle,
    titleCenter = false,
    rightHeader,
    actions,
    children,
    expandable = false,
    className = '',
    interactive = true,
    ...interactiveProps
}) => {
    const renderHeader = () => {
        const titleColor = 'text-slate-700 dark:text-slate-300/75';

        if (titleCenter) {
            return (
                <div className="mb-4 text-center">
                    <h2 className={`font-georgia flex items-center justify-center gap-1 text-2xl ${titleColor}`}>
                        {icon && getIcon({ iconType: icon, width: 'w-5', height: 'h-5', className: 'mt-1 text-slate-600 dark:text-slate-400' })}
                        <span>{title}</span>
                    </h2>
                </div>
            )
        }

        return (
            <div className="mb-4 flex items-center justify-between">
                <h2 className={`font-georgia flex items-center gap-1 h-5 ${titleColor}`}>
                    {icon && getIcon({ iconType: icon, width: 'w-5', height: 'h-5', className: 'mt-0.5 text-slate-600 dark:text-slate-400' })}
                    <span className='text-lg lg:text-xl'>{title}</span>
                </h2>
                {rightHeader}
            </div>
        )
    }

    const renderContent = () => {
        return (
            <div
                className="font-noto-sans space-y-3 text-sm text-slate-600 dark:text-slate-400 overflow-y-auto"
            >
                {children}
            </div>
        )
    }

    return (
        interactive ? <InteractivePanel
            {...interactiveProps}
            expandableTitle={expandable ? title : undefined}
            className={cn('space-y-4 z-10', className)}
        >
            {renderHeader()}

            {subtitle && (
                <p className="text-sm text-slate-500 dark:text-slate-400 -mt-2 mb-4">
                    {subtitle}
                </p>
            )}

            {renderContent()}

            <PanelAction actions={actions} />
        </InteractivePanel> : <BasePanel
            {...interactiveProps}
            className={cn('space-y-4 z-10', className)}
        >
            {renderHeader()}

            {subtitle && (
                <p className="text-sm text-slate-500 dark:text-slate-400 -mt-2 mb-4">
                    {subtitle}
                </p>
            )}

            {renderContent()}

            <PanelAction actions={actions} />
        </BasePanel>
    )
}

export default PageLikePanel
