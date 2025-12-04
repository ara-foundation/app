import React from 'react'
import PageLikePanel from '@/components/panel/PageLikePanel'

interface ActionButtonProps {
  text: string
  variant: 'primary' | 'secondary'
}

const ActionButton: React.FC<ActionButtonProps> = ({ text, variant }) => {
  const baseClasses = "px-4 py-2 rounded-md text-sm font-medium transition-colors"
  const variantClasses = variant === 'primary'
    ? "bg-blue-500 text-white hover:bg-blue-600"
    : "bg-blue-100 text-blue-700 hover:bg-blue-200"

  return (
    <button className={`${baseClasses} ${variantClasses} w-full mb-2`}>
      {text}
    </button>
  )
}

const CallToAction: React.FC = () => {
  return (
    <PageLikePanel title="🚀 What to do next">
      <div className="text-center mb-6">
        <p className="text-sm text-gray-600 mb-6">
          Use these insights to optimize your outreach strategy and grow your project community.
        </p>
      </div>

      <div className="space-y-2">
        Todo List (todo: (create a quest, to automate) button):
        <ActionButton text="Copy Share Button" variant="primary" />
        <ActionButton text="Copy Contribution Link" variant="secondary" />
        <ActionButton text="Copy Donation Link" variant="secondary" />
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Guests to help marketing will be prepared in the upcoming versions. If you want to help, become the Ara influencer for the best.
      </p>
    </PageLikePanel>
  )
}

export default CallToAction
