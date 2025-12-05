import { useState, useEffect } from 'react'
import { DEMO_COOKIE_NAMES, demoProjectName } from '@/scripts/demo-constants'
import { Roles } from '@/scripts/user'
import type { UserModel } from '@/scripts/user'
import confetti from 'canvas-confetti'

interface UseDemoStartResult {
  showDialog: boolean
  demoUsers: UserModel[]
  hasTriggeredConfetti: boolean
  setShowDialog: (show: boolean) => void
  handleSuccess: (users: UserModel[], email: string) => void
  triggerConfetti: () => void
}

/**
 * Hook for handling demo start success (cookies, dialog, confetti)
 */
export function useDemoStart(): UseDemoStartResult {
  const [showDialog, setShowDialog] = useState(false)
  const [demoUsers, setDemoUsers] = useState<UserModel[]>([])
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false)

  const handleSuccess = (users: UserModel[], email: string) => {
    console.log('useDemoStart handleSuccess', users, email)
    // Set cookies
    const emailValue = email.trim()
    const usersValue = JSON.stringify(users)
    const roleValue: Roles = 'maintainer' // Default role

    // Set cookies with expiration (30 days)
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + 30)
    const expires = expirationDate.toUTCString()

    document.cookie = `${DEMO_COOKIE_NAMES.email}=${emailValue}; expires=${expires}; path=/`
    document.cookie = `${DEMO_COOKIE_NAMES.users}=${encodeURIComponent(usersValue)}; expires=${expires}; path=/`
    document.cookie = `${DEMO_COOKIE_NAMES.role}=${roleValue}; expires=${expires}; path=/`

    // Show congratulations dialog
    setDemoUsers(users)
    setShowDialog(true)
    console.log('useDemoStart handleSuccess showDialog to true, now:', showDialog)
  }

  const triggerConfetti = () => {
    if (hasTriggeredConfetti) return

    setHasTriggeredConfetti(true)
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        return
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)
  }

  // Trigger confetti when dialog shows up
  useEffect(() => {
    if (showDialog && !hasTriggeredConfetti) {
      triggerConfetti()
    }
  }, [showDialog, hasTriggeredConfetti])

  return {
    showDialog,
    demoUsers,
    hasTriggeredConfetti,
    setShowDialog,
    handleSuccess,
    triggerConfetti,
  }
}

export { demoProjectName }

