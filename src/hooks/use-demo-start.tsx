import { useState, useEffect } from 'react'
import type { User } from '@/types/star'
import confetti from 'canvas-confetti'

interface UseDemoStartResult {
  showDialog: boolean
  demoUsers: User[]
  hasTriggeredConfetti: boolean
  setShowDialog: (show: boolean) => void
  handleSuccess: (users: User[], email: string) => void
  triggerConfetti: () => void
}

/**
 * Hook for handling demo start success (cookies, dialog, confetti)
 */
export function useDemoStart(): UseDemoStartResult {
  const [showDialog, setShowDialog] = useState(false)
  const [demoUsers, setDemoUsers] = useState<User[]>([])
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false)

  const handleSuccess = (users: User[]) => {
    // Show congratulations dialog
    setDemoUsers(users)
    setShowDialog(true)
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

