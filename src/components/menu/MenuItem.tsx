import { getIcon, type IconType } from '@/components/icon'
import Link from '../custom-ui/Link'
import Badge, { BadgeProps } from '../badge/Badge'

export interface MenuItemProps {
  icon: IconType
  label: string
  uri: string
  badges?: BadgeProps[]
  active?: boolean
  focus?: boolean
  className?: string
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, badges, uri, active, focus = false, className = '' }) => {
  const baseClassName = `no-underline! flex items-center justify-between px-3 py-1 rounded-sm cursor-pointer`
  const activeClassName = `bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-600 dark:hover:text-blue-300 `
  const inactiveClassName = `text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-teal-900 dark:hover:text-teal-600! `
  const linkClassName = `${baseClassName} ${active ? activeClassName : inactiveClassName} ${className}`
  return (
    <Link focus={focus} uri={uri} className={linkClassName}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          {getIcon(icon)}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center ml-1 -space-x-2">
          {badges && badges.map((badge: BadgeProps) => (
            <Badge {...badge}>{badge.children}</Badge>
          ))}
        </div>
      </div>
    </Link>
  )
}

export default MenuItem
