import React, { useEffect, useState } from 'react'
import MenuAvatar from '@/components/MenuAvatar'
import Button from '@/components/custom-ui/Button'
import WalletBalance from '@/components/utilitified_decorations/WalletBalance'
import { useDemoStart } from '@/hooks/use-demo-start'
import DemoCongratulationsDialog from '@/components/project/DemoCongratulationsDialog'
import { cn } from '@/lib/utils'
import { type DemoUserCreatedEvent, type DemoRoleChangeEvent, DEMO_EVENT_TYPES } from '@/types/demo'
import { USER_EVENT_TYPES, type UserUpdateEventDetail } from '@/types/user'
import { getUserById } from '@/client-side/user'
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
import type { Roles, User } from '@/types/user'
import { startDemo, clearDemo, changeRole, getDemo, updateDemoUsers } from '@/client-side/demo'

interface Props {
  className?: string
}

const AuthNavItem: React.FC<Props> = ({ className }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { showDialog, demoUsers, setShowDialog, handleSuccess } = useDemoStart()

  // Get initial demo state
  const demoState = getDemo()
  const [demoUser, setDemoUser] = useState<User | null>(
    demoState.users && demoState.role
      ? demoState.users.find((u) => u.role === demoState.role) || demoState.users[0] || null
      : null
  )
  const [users, setUsers] = useState<User[] | null>(demoState.users)
  const [role, setRole] = useState<Roles | null>(demoState.role)

  // Mount only once on the client side
  useEffect(() => {
    const updateDemoState = () => {
      const currentDemo = getDemo()
      setUsers(currentDemo.users)
      setRole(currentDemo.role)
      if (currentDemo.users && currentDemo.role) {
        const user = currentDemo.users.find((u) => u.role === currentDemo.role) || currentDemo.users[0] || null
        setDemoUser(user)
      } else {
        setDemoUser(null)
      }
    }

    // Initial update
    updateDemoState()

    // Listen for demo events
    const handleDemoUserCreated = (event: Event) => {
      const customEvent = event as CustomEvent<DemoUserCreatedEvent>
      if (customEvent.detail.users && customEvent.detail.role) {
        setUsers(customEvent.detail.users)
        setRole(customEvent.detail.role)
        const user = customEvent.detail.users.find((u) => u.role === customEvent.detail.role)
        if (user) {
          setDemoUser(user)
        }
        // Show dialog and trigger confetti using the hook
        handleSuccess(customEvent.detail.users, customEvent.detail.email)
      }
    }

    const handleDemoUserDeleted = () => {
      setDemoUser(null)
      setUsers(null)
      setRole(null)
      setShowDialog(false)
    }

    const handleDemoRoleChange = (event: Event) => {
      const customEvent = event as CustomEvent<DemoRoleChangeEvent>
      const currentDemo = getDemo()
      if (currentDemo.users && customEvent.detail.role) {
        setRole(customEvent.detail.role)
        const user = currentDemo.users.find((u) => u.role === customEvent.detail.role)
        if (user) {
          setDemoUser(user)
        }
      }
    }

    const handleUserUpdate = async (event: Event) => {
      const customEvent = event as CustomEvent<UserUpdateEventDetail>
      const updatedUser = customEvent.detail.user

      // Check if updated user is in demo cache
      const currentDemo = getDemo()
      if (currentDemo.users && updatedUser._id) {
        const userIndex = currentDemo.users.findIndex((u) => u._id === updatedUser._id)
        if (userIndex >= 0) {
          // Fetch updated user data to ensure we have the latest
          const freshUser = await getUserById(updatedUser._id)
          if (freshUser) {
            // Update users array in demo cache
            const updatedUsers = [...currentDemo.users]
            updatedUsers[userIndex] = freshUser

            // Update demo cookies
            updateDemoUsers(updatedUsers)

            // Update local state
            setUsers(updatedUsers)

            // Update current demo user if it's the one that was updated
            if (currentDemo.role === updatedUsers[userIndex].role) {
              setDemoUser(freshUser)
            } else {
              // Update demo user if it matches the updated user
              const currentUser = updatedUsers.find((u) => u.role === currentDemo.role)
              if (currentUser) {
                setDemoUser(currentUser)
              }
            }
          }
        }
      }
    }

    window.addEventListener(DEMO_EVENT_TYPES.USER_CREATED, handleDemoUserCreated as EventListener)
    window.addEventListener(DEMO_EVENT_TYPES.USER_DELETED, handleDemoUserDeleted)
    window.addEventListener(DEMO_EVENT_TYPES.ROLE_CHANGED, handleDemoRoleChange as EventListener)
    window.addEventListener(USER_EVENT_TYPES.USER_UPDATE, handleUserUpdate as EventListener)

    return () => {
      window.removeEventListener(DEMO_EVENT_TYPES.USER_CREATED, handleDemoUserCreated as EventListener)
      window.removeEventListener(DEMO_EVENT_TYPES.USER_DELETED, handleDemoUserDeleted)
      window.removeEventListener(DEMO_EVENT_TYPES.ROLE_CHANGED, handleDemoRoleChange as EventListener)
      window.removeEventListener(USER_EVENT_TYPES.USER_UPDATE, handleUserUpdate as EventListener)
    }
  }, [])

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

      if (!result.success) {
        alert(result.error || 'Failed to start demo')
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
            key={`${demoUser.role}-${demoUser.nickname}`}
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

