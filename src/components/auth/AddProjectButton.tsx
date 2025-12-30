'use client'
import React, { useState } from 'react'
import { authClient } from '@/client-side/auth'
import { CheckmarkIcon } from '@/svg'
import AuthDialog from './AuthDialog'
import GoToAllStarsDialog from './GoToAllStarsDialog'
import { cn } from '@/lib/utils'

interface AddProjectButtonProps {
  className?: string
}

const AddProjectButton: React.FC<AddProjectButtonProps> = ({ className }) => {
  const { data: session, isPending } = authClient.useSession()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showGoToAllStarsDialog, setShowGoToAllStarsDialog] = useState(false)

  const handleClick = () => {
    if (isPending) return

    if (!session?.user) {
      // Not logged in - show auth dialog
      setShowAuthDialog(true)
    } else {
      // Logged in - show "Go to All Stars" dialog
      setShowGoToAllStarsDialog(true)
    }
  }

  const isLoggedIn = !!session?.user

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          'px-8 py-4 bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-lg flex items-center justify-center gap-2',
          className
        )}
      >
        {isLoggedIn && (
          <CheckmarkIcon className="w-5 h-5 text-white" />
        )}
        Add your project
      </button>

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
      />

      <GoToAllStarsDialog
        isOpen={showGoToAllStarsDialog}
        onClose={() => setShowGoToAllStarsDialog(false)}
      />
    </>
  )
}

export default AddProjectButton

