import React from 'react'
import NumberFlow from '@number-flow/react'
import { getIcon } from '../icon'
import Link from '../custom-ui/Link'
import Tooltip from '../custom-ui/Tooltip'

interface Props {
  className?: string
}

const WalletBalance: React.FC<Props> = ({ className }) => {
  return (

    <Tooltip
      content={
        <div className="text-sm">
          View your balance, withdraw funds, and more.
        </div>
      }
    >
      <div className={`flex items-center gap-2 ${className || ''}`}>
        <Link uri='/user/balance' className={`hover:bg-teal-300 bg-blue-200 dark:bg-blue-400 rounded-full h-6 w-6 flex items-center justify-center`}>
          {getIcon({ iconType: 'wallet', width: 'w-4', height: 'h-4', className: 'text-blue-700 dark:text-blue-900' })}

        </Link>
        <NumberFlow
          value={0.00}
          locales="en-US"
          format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 2 }}
          className="text-sm text-gray-700 dark:text-gray-300"
        />
      </div>
    </Tooltip>
  )
}

export default WalletBalance

