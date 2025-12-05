import React, { useEffect, useState } from 'react'
import MenuAvatar from '@/components/MenuAvatar'
import Button from '@/components/custom-ui/Button'
import WalletBalance from '@/components/utilitified_decorations/WalletBalance'
import { useDemoStart } from '@/hooks/use-demo-start'
import DemoCongratulationsDialog from '@/components/project/DemoCongratulationsDialog'
import { cn } from '@/lib/utils'
import { useDemoClient } from '@/scripts/demo-client'
import type { DemoUserCreatedEvent, DemoRoleChangeEvent } from '@/scripts/demo-client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/animate-ui/components/radix/dropdown-menu'
import { ChevronDownIcon } from 'lucide-react'
import { Roles } from '@/scripts/user'

interface Props {
  className?: string
}

const AuthNavItem: React.FC<Props> = ({ className }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { showDialog, demoUsers, setShowDialog, handleSuccess } = useDemoStart()
  const { currentUser, startDemo, users, changeRole, clearDemo, role } = useDemoClient()
  const [demoUser, setDemoUser] = useState(currentUser)

  // Update demoUser when currentUser changes
  useEffect(() => {
    setDemoUser(currentUser)
  }, [currentUser])

  // Listen for demo events (only once on mount)
  useEffect(() => {
    const handleDemoUserCreated = (event: Event) => {
      const customEvent = event as CustomEvent<DemoUserCreatedEvent>
      // Update to show MenuAvatar with new user
      if (customEvent.detail.users && customEvent.detail.role) {
        const user = customEvent.detail.users.find((u) => u.role === customEvent.detail.role)
        if (user) {
          setDemoUser(user)
        }
      }
    }

    const handleDemoUserDeleted = () => {
      // Show "Start Demo" button
      setDemoUser(null)
    }

    const handleDemoRoleChange = (event: Event) => {
      const customEvent = event as CustomEvent<DemoRoleChangeEvent>
      // Update MenuAvatar with new role's user
      if (users && customEvent.detail.role) {
        const user = users.find((u) => u.role === customEvent.detail.role)
        if (user) {
          setDemoUser(user)
        }
      }
    }

    window.addEventListener('demo-user-created', handleDemoUserCreated as EventListener)
    window.addEventListener('demo-user-deleted', handleDemoUserDeleted)
    window.addEventListener('demo-role-change', handleDemoRoleChange as EventListener)

    return () => {
      window.removeEventListener('demo-user-created', handleDemoUserCreated as EventListener)
      window.removeEventListener('demo-user-deleted', handleDemoUserDeleted)
      window.removeEventListener('demo-role-change', handleDemoRoleChange as EventListener)
    }
  }, [users])

  const handleStartClick = async () => {
    // Prompt user for email address
    const userEmail = prompt('Please enter your email address to start the demo:')

    // Validate that email was provided
    if (!userEmail || !userEmail.trim()) {
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const trimmedEmail = userEmail.trim()

    if (!emailRegex.test(trimmedEmail)) {
      alert('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      const result = await startDemo(trimmedEmail)

      if (result.success && 'users' in result && result.users && Array.isArray(result.users)) {
        console.log('result.users handleSuccess', result.users)
        // Show congratulations dialog with confetti
        handleSuccess(result.users, trimmedEmail)
      } else {
        alert('error' in result ? result.error || 'Failed to start demo' : 'Failed to start demo')
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = (newRole: string) => {
    const roleValue = newRole as Roles
    if (roleValue !== role) {
      changeRole(roleValue)
    }
  }

  const handleLogout = () => {
    clearDemo()
  }

  // Render dialog outside conditional so it's always available
  const dialogElement = (
    <DemoCongratulationsDialog
      isOpen={showDialog}
      users={demoUsers}
      onClose={() => setShowDialog(false)}
    />
  )

  // If demo user exists, show MenuAvatar with demo user data
  if (demoUser && users) {
    const roleLabels: Record<Roles, string> = {
      maintainer: 'Maintainer',
      user: 'User',
      contributor: 'Contributor',
    }

    return (
      <>
        <div className={cn('flex items-center gap-2', className)}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1',
                  'border border-slate-300/20 dark:border-slate-600/20',
                  'bg-transparent',
                  'transition-all duration-200 ease-in-out',
                  'hover:border-slate-400/50 dark:hover:border-slate-500/50',
                  'hover:bg-slate-100/40 dark:hover:bg-slate-800/40',
                  'focus:outline-none focus:ring-2 focus:ring-slate-400/40 dark:focus:ring-slate-500/40',
                  'cursor-pointer rounded-md',
                  'text-sm text-slate-600 dark:text-slate-400',
                  'data-[state=open]:border-slate-400/60 dark:data-[state=open]:border-slate-500/60',
                  'data-[state=open]:bg-slate-100/50 dark:data-[state=open]:bg-slate-800/50'
                )}
                aria-label="Switch role"
              >
                <span>Switch Role</span>
                <ChevronDownIcon className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className={cn(
                'bg-white/90 dark:bg-slate-900/90',
                'backdrop-blur-sm',
                'border border-slate-200/50 dark:border-slate-700/50',
                'shadow-lg'
              )}
            >
              <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={role || 'maintainer'} onValueChange={handleRoleChange}>
                {users.map((user) => (
                  <DropdownMenuRadioItem
                    key={user.role}
                    value={user.role || 'maintainer'}
                    className="cursor-pointer"
                  >
                    {roleLabels[user.role || 'maintainer']}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                variant="destructive"
                className="cursor-pointer"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <MenuAvatar
            src={demoUser.src}
            alt={demoUser.alt}
            uri={demoUser.uri}
            nickname={demoUser.nickname}
            sunshines={demoUser.sunshines}
            stars={demoUser.stars}
            role={demoUser.role}
          />

          <WalletBalance balance={demoUser.balance} />
        </div>
        {dialogElement}
      </>
    )
  }

  // Default: show "Start Demo" button
  return (
    <>
      <Button
        variant="primary"
        size="sm"
        onClick={handleStartClick}
        className={className}
        disabled={isLoading}
      >
        {isLoading ? 'Starting...' : 'Start Demo'}
      </Button>
      {dialogElement}
    </>
  )
}

export default AuthNavItem

