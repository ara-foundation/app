'use client'
import React from 'react'
import Button from '@/components/custom-ui/Button'
import PageLikePanel from '@/components/panel/PageLikePanel'
import Link from '@/components/custom-ui/Link'

interface GoToAllStarsDialogProps {
  isOpen: boolean
  onClose: () => void
}

const GoToAllStarsDialog: React.FC<GoToAllStarsDialogProps> = ({
  isOpen,
  onClose,
}) => {
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
        <PageLikePanel title="Add your project" titleCenter={true}>
          <div className="space-y-6">
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg text-center">
              Go to{' '}
              <Link uri="/all-stars" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                All Stars
              </Link>{' '}
              universe page and click on create galaxy.
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                variant="primary"
                onClick={onClose}
                size="md"
              >
                Got it
              </Button>
            </div>
          </div>
        </PageLikePanel>
      </div>
    </>
  )
}

export default GoToAllStarsDialog

