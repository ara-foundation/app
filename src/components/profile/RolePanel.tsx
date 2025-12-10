import React from 'react'
import PageLikePanel from '@/components/panel/PageLikePanel'
import Link from '@/components/custom-ui/Link'
import { IconType } from '@/components/icon'

export interface RoleCardProps {
  id: string
  roleCard: boolean
  title: string
  description: string
  buttonText: string
  buttonVariant: 'primary' | 'secondary' | string
  helpLinkLabel?: string
  helpLinkHref?: string
  iconColor?: string
  icon?: string
  avatar: string
  iconBgColor?: string
  href?: string,
}

const C: React.FC<RoleCardProps> = ({
  id,
  title,
  description,
  buttonText,
  buttonVariant,
  icon,
  avatar,
  iconBgColor,
  href,
}) => {
  return (
    <div className={`${iconBgColor} card image-full text-gray-100 w-36 h-60 shadow-sm p-0!`}>
      <PageLikePanel titleCenter={true} icon={icon as IconType} title={title} bg={{ src: avatar, label: `${title} avatar` }} key={id} >
        <p className='h-20 flex items-center text-gray-300 dark:text-gray-100 mt-8'>{description}</p>
        <div className="card-actions justify-center overflow-hidden">
          {buttonVariant === 'primary' ?
            (<Link uri={href || '#'} className="inline-flex items-center bg-rose-500 hover:bg-rose-600 text-white dark:text-gray-100 hover:text-blue-50! font-bold py-2 px-4 rounded transition-colors" >{buttonText}</Link>) :
            (<Link uri={href || '#'} className={buttonVariant}>{buttonText}</Link>)
          }
        </div>
      </PageLikePanel>
    </div>
  )
}

export default C
