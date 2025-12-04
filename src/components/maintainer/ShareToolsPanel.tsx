import React, { useState } from 'react'
import PageLikePanel from '@/components/panel/PageLikePanel'
import InfoPanel from '@/components/panel/InfoPanel'
import { IconType, getIcon } from '@/components/icon'
import { ActionProps } from '@/types/eventTypes'

// Helper function to map emoji icons to IconType values
const mapEmojiToIconType = (emoji: string): IconType => {
  const emojiMap: Record<string, IconType> = {
    '🎯': 'project',
    '📋': 'new-file',
    '📄': 'new-file',
    '👥': 'contributor',
    '💰': 'money'
  }
  return emojiMap[emoji] || 'info'
}

const ShareTools: React.FC = () => {
  const [copied, setCopied] = useState(false)
  const badgeCode = '[Ara](https://app.ara.foundation/badge/)'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(badgeCode)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = badgeCode
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => {
          setCopied(false)
        }, 2000)
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr)
      }
      document.body.removeChild(textArea)
    }
  }

  return (
    <PageLikePanel interactive={false} title="Share Tools" className="">
      <InfoPanel
        icon={mapEmojiToIconType('🎯')}
        title="Increase Reach with a README Badge"
        className="mb-4 dark:bg-transparent bg-transparent"
      >
        <p className='text-gray-600 dark:text-gray-500 text-md'>
          This share link and copy button let you quickly add an Ara badge to your README.
          The badge helps visitors interact with you, and donate directly to your project,
          while you focus on your project.
        </p>
      </InfoPanel>

      <InfoPanel
        icon={mapEmojiToIconType('📄')}
        title="Share Button for README"
        className="mb-4 dark:bg-transparent bg-transparent"
        actions={[
          {
            children: (
              <span className="flex items-center gap-2">
                {copied ? (
                  <>
                    {getIcon({ iconType: 'check', className: 'w-4 h-4' })}
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    {getIcon({ iconType: 'new-file', className: 'w-4 h-4' })}
                    <span>Copy</span>
                  </>
                )}
              </span>
            ),
            variant: 'secondary',
            onClick: handleCopy
          } as ActionProps
        ]}
      >
        <p className="mb-3">
          Copy the markdown into your README to start collaboration and receive donations for project. Place it anywhere in your Readme, I recommend putting it on the top.</p>
        <div className="text-lg text-slate-700 dark:text-slate-300/80 bg-slate-100 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 font-mono break-all">
          {badgeCode}
        </div>
      </InfoPanel>
    </PageLikePanel >
  )
}

export default ShareTools
