import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { type DemoUserCreatedEvent, type DemoRoleChangeEvent, DEMO_EVENT_TYPES } from '@/types/demo'
import { getDemo } from '@/client-side/demo'

interface DemoAuthPanelProps {
    children: React.ReactNode
    className?: string
}

const DemoAuthPanel: React.FC<DemoAuthPanelProps> = ({ children, className }) => {
    // Get initial demo state
    const demoState = getDemo()
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
        !!(demoState.email && demoState.users && demoState.role)
    )

    // Listen for demo events
    useEffect(() => {
        const updateDemoState = () => {
            const currentDemo = getDemo()
            setIsLoggedIn(!!(currentDemo.email && currentDemo.users && currentDemo.role))
        }

        // Initial update
        updateDemoState()

        // Listen for demo events
        const handleDemoUserCreated = (event: Event) => {
            const customEvent = event as CustomEvent<DemoUserCreatedEvent>
            if (customEvent.detail.users && customEvent.detail.role) {
                setIsLoggedIn(true)
            }
        }

        const handleDemoUserDeleted = () => {
            setIsLoggedIn(false)
        }

        const handleDemoRoleChange = (event: Event) => {
            const customEvent = event as CustomEvent<DemoRoleChangeEvent>
            const currentDemo = getDemo()
            if (currentDemo.users && customEvent.detail.role) {
                setIsLoggedIn(true)
            }
        }

        window.addEventListener(DEMO_EVENT_TYPES.USER_CREATED, handleDemoUserCreated as EventListener)
        window.addEventListener(DEMO_EVENT_TYPES.USER_DELETED, handleDemoUserDeleted)
        window.addEventListener(DEMO_EVENT_TYPES.ROLE_CHANGED, handleDemoRoleChange as EventListener)

        return () => {
            window.removeEventListener(DEMO_EVENT_TYPES.USER_CREATED, handleDemoUserCreated as EventListener)
            window.removeEventListener(DEMO_EVENT_TYPES.USER_DELETED, handleDemoUserDeleted)
            window.removeEventListener(DEMO_EVENT_TYPES.ROLE_CHANGED, handleDemoRoleChange as EventListener)
        }
    }, [])

    return (
        <div className={cn('relative', className)}>
            <div className={isLoggedIn ? 'pointer-events-auto' : 'pointer-events-none opacity-70'}>
                {children}
            </div>
            {!isLoggedIn && (
                <div
                    className={cn(
                        'absolute inset-0 left-1/2 -translate-x-1/2 top-0 right-0 bottom-0',
                        'backdrop-blur-xs',
                        'bg-white/10 dark:bg-slate-900/10',
                        'flex items-center justify-center',
                        'rounded-lg',
                        'pointer-events-none',
                        'z-10'
                    )}
                >
                    <span className="text-slate-600 dark:text-slate-400 text-sm font-medium animate-pulse">
                        Please, <span className="font-bold">Start Demo</span>
                    </span>
                </div>
            )}
        </div>
    )
}

export default DemoAuthPanel

