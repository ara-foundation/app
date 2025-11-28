import React, { useState } from 'react'
import PageLikePanel from '@/components/panel/PageLikePanel'
import NumberFlow from '@number-flow/react'
import LabeledInput from '../custom-ui/LabeledInput'
import { Popover } from '@base-ui-components/react/popover'
import { getIcon } from '../icon'

interface BalanceInfoItemProps {
  icon: string
  iconColor?: string
  children: React.ReactNode
}

const BalanceInfoItem: React.FC<BalanceInfoItemProps> = ({ icon, iconColor = 'bg-blue-600', children }) => {
  const getBackgroundColor = (iconLetter: string) => {
    const colors: Record<string, string> = {
      'G': 'bg-gray-700',
      'R': 'bg-red-600',
      'E': 'bg-green-600',
      'P': 'bg-purple-600',
      'A': 'bg-blue-600',
      'X': 'bg-orange-600',
      'H': 'bg-indigo-600',
      'B': 'bg-blue-600',
      'D': 'bg-green-600',
      'C': 'bg-indigo-600'
    }
    return colors[iconLetter] || iconColor
  }

  return (
    <div className="flex items-start space-x-4">
      <div className={`w-8 h-8 rounded-full ${getBackgroundColor(icon)} flex items-center justify-center flex-shrink-0`}>
        <span className="text-white text-sm font-bold">{icon}</span>
      </div>
      <div className="text-gray-700 dark:text-gray-300 leading-relaxed flex-1">{children}</div>
    </div>
  )
}

const UserBalancePanel: React.FC = () => {
  const [disabled, setDisabled] = useState(false)

  const cascadingBalanceTooltip = (
    <div className="text-sm">
      Indirectly received funds from other projects. Withdraw, and transfer or use for yourself. Check out{' '}
      <a href="#" className="text-cascade-blue hover:underline">Work page</a>{' '}
      to improve the rating to have more funds.
    </div>
  )

  return (
    <PageLikePanel interactive={false} title="Balance" actions={[
      {
        variant: 'primary',
        children: 'Withdraw',
        onClick: () => { },
        disabled: disabled
      }
    ]}>

      <div className="mb-6 flex flex-row gap-4">
        <div className="flex-1">
          <BalanceInfoItem icon="B">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Balance</div>
              <NumberFlow
                value={3.45928}
                locales="en-US"
                format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 2, signDisplay: 'negative' }}
                className="text-lg font-semibold text-gray-700 dark:text-gray-300"
              />
            </div>
          </BalanceInfoItem>
        </div>
        <div className="flex-1">
          <BalanceInfoItem icon="D">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total User donations</div>
              <NumberFlow
                value={1250.00}
                locales="en-US"
                format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 2, signDisplay: 'negative' }}
                className="text-lg font-semibold text-gray-700 dark:text-gray-300"
              />
            </div>
          </BalanceInfoItem>
        </div>
        <div className="flex-1">
          <BalanceInfoItem icon="C">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Popover.Root>
                  <Popover.Trigger className="hyperlink flex items-center justify-center shadow-none gap-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total cascading donations</div>
                    {getIcon({ iconType: 'info', className: 'w-3 h-3 cursor-help' })}
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Positioner sideOffset={8} side='bottom' className={'z-999!'}>
                      <Popover.Popup className="w-80 origin-[var(--transform-origin)] rounded-xs bg-[canvas] px-6 py-4 text-gray-900 shadow-sm shadow-gray-900 dark:text-slate-300 dark:shadow-slate-300 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0">
                        <Popover.Arrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
                        </Popover.Arrow>
                        <Popover.Description className="text-gray-600 dark:text-slate-400 text-sm">
                          {cascadingBalanceTooltip}
                        </Popover.Description>
                      </Popover.Popup>
                    </Popover.Positioner>
                  </Popover.Portal>
                </Popover.Root>
              </div>
              <NumberFlow
                value={3.45928}
                locales="en-US"
                format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 2, signDisplay: 'negative' }}
                className="text-lg font-semibold text-gray-700 dark:text-gray-300"
              />
            </div>
          </BalanceInfoItem>
        </div>
      </div>

      <div className="mb-6">
        <LabeledInput id="address" label="Withdraw wallet address" value="0x8F5a2bD707D9a654bbF5dFC3A27737BDc1d24A8" type="text" placeholder='Enter your Ethereum network address' />
      </div>
    </PageLikePanel>
  )
}

export default UserBalancePanel

