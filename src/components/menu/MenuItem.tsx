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
  const baseClassName = `no-underline! flex items-center justify-between px-3 py-1 rounded-sm cursor-pointer transition-colors`
  const activeClassName = `bg-slate-100/60 dark:bg-slate-700/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-700/60`
  const inactiveClassName = `text-slate-600 dark:text-slate-400 hover:bg-slate-50/40 dark:hover:bg-slate-800/30 hover:text-slate-700 dark:hover:text-slate-300`
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
