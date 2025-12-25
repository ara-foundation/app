import React, { useEffect, useState } from 'react'
import PageLikePanel from '@/components/panel/PageLikePanel'
import Link from '@/components/custom-ui/Link'
import Button from '@/components/custom-ui/Button'
import { getIcon } from '@/components/icon'
import NumberFlow from '@number-flow/react'
import confetti from 'canvas-confetti'
import { cn } from '@/lib/utils'

interface WelcomeDialogProps {
  isOpen: boolean
  sunshines: number
  onClose: () => void
}

const WelcomeDialog: React.FC<WelcomeDialogProps> = ({
  isOpen,
  sunshines,
  onClose,
}) => {
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false)
  const [showSunshines, setShowSunshines] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [showCommunityText, setShowCommunityText] = useState(false)
  const [showCTA, setShowCTA] = useState(false)

  // Trigger confetti on open
  useEffect(() => {
    if (isOpen && !hasTriggeredConfetti) {
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
  }, [isOpen, hasTriggeredConfetti])

  // Sequential animation: sunshines -> message -> community text -> CTA
  useEffect(() => {
    if (isOpen) {
      // Reset all states
      setShowSunshines(false)
      setShowMessage(false)
      setShowCommunityText(false)
      setShowCTA(false)

      // Show sunshines immediately
      setTimeout(() => setShowSunshines(true), 300)

      // Show message after sunshines
      setTimeout(() => setShowMessage(true), 800)

      // Show community text after message
      setTimeout(() => setShowCommunityText(true), 1500)

      // Show CTA after community text
      setTimeout(() => setShowCTA(true), 2200)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] flex items-center justify-center w-full max-w-2xl px-4">
        <PageLikePanel
          title="Welcome to Ara!"
          titleCenter={true}
        >
          <div className="space-y-6">
            {/* Sunshines Display */}
            <div className={cn(
              "flex items-center justify-center gap-2 transition-all duration-500",
              showSunshines ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            )}>
              {getIcon({ iconType: 'sunshine', className: 'w-12 h-12 text-yellow-500 dark:text-yellow-400' })}
              <div className="text-4xl font-bold text-slate-800 dark:text-slate-200">
                <NumberFlow
                  value={sunshines}
                  locales="en-US"
                  format={{ style: 'decimal', maximumFractionDigits: 0 }}
                />
              </div>
            </div>

            {/* Message */}
            {showMessage && (
              <div className={cn(
                "text-slate-600 dark:text-slate-400 text-center transition-all duration-500",
                showMessage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                <p className="text-lg">
                  You've received <span className="font-semibold text-yellow-600 dark:text-yellow-400">{sunshines} sunshines</span> to begin creating your community
                </p>
              </div>
            )}

            {/* Animated "Begin creating your community" text */}
            {showCommunityText && (
              <div className={cn(
                "text-center transition-all duration-700",
                showCommunityText ? "opacity-100 scale-100" : "opacity-0 scale-95"
              )}>
                <p className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                  Begin creating your community
                </p>
              </div>
            )}

            {/* CTA Button */}
            {showCTA && (
              <div className={cn(
                "flex justify-center items-center transition-all duration-500",
                showCTA ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                <Link uri="/all-stars">
                  <Button variant="primary" size="md" className="min-w-[200px]">
                    Browse All-Stars
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </PageLikePanel>
      </div>
    </>
  )
}

export default WelcomeDialog

