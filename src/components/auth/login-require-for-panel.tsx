'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { authClient } from '@/client-side/auth'

interface LoginRequireForPanelProps {
    children: React.ReactNode
    className?: string
}

const LoginRequireForPanel: React.FC<LoginRequireForPanelProps> = ({ children, className }) => {
    const { data: session, isPending } = authClient.useSession()
    const isLoggedIn = !!session?.user

    return (
        <div className={cn('relative', className)}>
            <div className={isLoggedIn ? 'pointer-events-auto' : 'pointer-events-none opacity-70'}>
                {children}
            </div>
            {!isPending && !isLoggedIn && (
                <div
                    className={cn(
                        'absolute inset-0',
                        'backdrop-blur-xs',
                        'bg-white/10 dark:bg-slate-900/10',
                        'flex items-center justify-center',
                        'rounded-lg',
                        'pointer-events-auto',
                        'z-10'
                    )}
                >
                    <span className="text-slate-600 dark:text-slate-400 text-sm font-medium animate-pulse">
                        Please, <span className="font-bold">Log In</span>
                    </span>
                </div>
            )}
        </div>
    )
}

export default LoginRequireForPanel

