import React from 'react'
import PageLikePanel from '@/components/panel/PageLikePanel'
import Link from '@/components/custom-ui/Link'
import Button from '@/components/custom-ui/Button'
import { cn } from '@/lib/utils'
import type { UserModel } from '@/scripts/user'

interface DemoCongratulationsDialogProps {
  isOpen: boolean
  users: UserModel[]
  onClose: () => void
  projectName: string
  galaxyId: string
}

const DemoCongratulationsDialog: React.FC<DemoCongratulationsDialogProps> = ({
  isOpen,
  users,
  onClose,
  projectName,
  galaxyId,
}) => {
  if (!isOpen) return null

  // If galaxyId is not provided, we can't create a valid link, so use a default
  const linkUri = `/project?galaxy=${galaxyId}`

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] flex items-center justify-center w-full max-w-2xl px-4">
        <PageLikePanel title="Congratulations!" titleCenter={true}>
          <div className="space-y-6">
            {/* Users Display */}
            <h2 className="text-lg text-slate-600 dark:text-slate-400">Your demo users</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {users.map((user, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-4 rounded-lg bg-slate-100/50 dark:bg-slate-800/50"
                >
                  <img
                    src={user.src}
                    alt={user.alt || user.nickname}
                    className="w-32 h-32 rounded-full mb-2"
                  />
                  <div className="text-center">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {user.nickname}
                    </div>
                    <div className="text-xs mt-1">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded',
                          user.role === 'maintainer' && 'bg-blue-500 text-white',
                          user.role === 'user' && 'bg-green-500 text-white',
                          user.role === 'contributor' && 'bg-purple-500 text-white'
                        )}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message */}
            <div className="text-slate-600 dark:text-slate-400 text-center space-y-2">
              <p className="text-lg font-medium">
                🎉 Welcome to your demo experience!
              </p>
              <p className="text-base">
                You have received a <span className="font-semibold text-blue-600 dark:text-blue-400">$50 demo coupon</span> for the <span className="font-semibold">{projectName}</span> project.
              </p>
              <p className="text-base">
                To get started, navigate to the project and purchase starshines to begin contributing.
              </p>
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              <Link uri={linkUri}>
                <Button variant="primary" size="lg">
                  '{projectName}' galaxy
                </Button>
              </Link>
            </div>
          </div>
        </PageLikePanel>
      </div>
    </>
  )
}

export default DemoCongratulationsDialog

