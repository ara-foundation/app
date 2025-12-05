import React, { useEffect, useState } from 'react'
import MenuAvatar from '@/components/MenuAvatar'
import Button from '@/components/custom-ui/Button'
import WalletBalance from '@/components/utilitified_decorations/WalletBalance'
import { useDemoStart } from '@/hooks/use-demo-start'
import DemoCongratulationsDialog from '@/components/project/DemoCongratulationsDialog'
import { cn } from '@/lib/utils'
import { useDemoClient } from '@/scripts/demo-client'
import type { DemoUserCreatedEvent, DemoRoleChangeEvent } from '@/scripts/demo-client'

interface Props {
  className?: string
}

const AuthNavItem: React.FC<Props> = ({ className }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { showDialog, demoUsers, setShowDialog, handleSuccess } = useDemoStart()
  const { currentUser, hasDemo, startDemo, users } = useDemoClient()
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

  // If demo user exists, show MenuAvatar with demo user data
  if (demoUser) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
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
      <DemoCongratulationsDialog
        isOpen={showDialog}
        users={demoUsers}
        onClose={() => setShowDialog(false)}
      />
    </>
  )
}

export default AuthNavItem

