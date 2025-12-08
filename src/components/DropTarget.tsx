import type { FC } from 'react'
import { memo } from 'react'
import { useDrop } from 'react-dnd'
import ElectricBorder from './ElectricBorder'
import { getAnimationColors } from './custom-ui/Button'
import { cn } from '@/lib/utils'

export interface DropTargetProps {
    id: string
    accept: string[]
    onDrop: (item: any) => void
    className?: string
    roundedClassName?: string
    innerClassName?: string
    children?: any
}

export const C: FC<DropTargetProps> = memo(function C({
    id,
    accept,
    onDrop,
    className,
    roundedClassName,
    innerClassName,
    children,
}) {
    const [{ isOver, canDrop }, drop] = useDrop({
        accept,
        drop: onDrop,
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    })

    const isActive = isOver && canDrop
    const borderRadiusStyle = roundedClassName ? undefined : 8

    return (
        <div
            ref={drop as any}
            className={cn(
                'flex items-center justify-center h-full w-full transition-colors',
                isActive ? 'border-2 border-emerald-400/80' : canDrop ? 'border-2 border-blue-400/70' : 'border-2 border-transparent',
                roundedClassName,
                className,
            )}
            data-testid={id}
        >
            <ElectricBorder
                color={getAnimationColors('primary').colorFrom}
                speed={1}
                chaos={0.5}
                thickness={2}
                style={{ borderRadius: borderRadiusStyle }}
                className={cn(
                    'w-full h-full flex items-center justify-center px-4 py-2 text-sm',
                    roundedClassName,
                    innerClassName,
                )}
                disabled={!canDrop}
            >
                {children}
            </ElectricBorder>
        </div>
    )
})

export default C;