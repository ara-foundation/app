import React from 'react'
import PageLikePanel from '@/components/panel/PageLikePanel'
import NumberFlow from '@number-flow/react'
import TimeAgo from 'timeago-react'
import { Popover } from '@base-ui-components/react/popover'
import { getIcon } from '../icon'
import PanelFooter from '../panel/PanelFooter'
import PanelStat from '../panel/PanelStat'

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
            'C': 'bg-indigo-600',
            'T': 'bg-teal-600'
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

const DonationsPanel: React.FC<{ galaxyId: string }> = ({ galaxyId }) => {
    const cascadingDonationsTooltip = (
        <div className="text-sm">
            Indirectly received funds from other projects. Withdraw, and transfer or use for yourself. Check out{' '}
            <a href="#" className="text-cascade-blue hover:underline">Work page</a>{' '}
            to improve the rating to have more funds.
        </div>
    )

    // Mock data - replace with actual data from props or API
    const totalUserDonations = 1250.00
    const cascadingUserDonations = 3.45928
    const projectCreatedTime = 1730457600000 // Replace with actual project created time
    const totalSunshines = 1250
    const totalStars = 3.47
    const sunshinesToStar = 360
    const sunshinesForNextStar = totalSunshines % sunshinesToStar
    const percentageToStar = ((sunshinesForNextStar / sunshinesToStar) * 100).toFixed(1)
    const issuesCount = 5
    const unattachedSunshines = 120

    return (
        <PageLikePanel
            interactive={false}
            title="Donations"
            actions={[
                {
                    variant: 'primary',
                    children: 'Obtain Sunshines & Donate',
                    uri: '/project?galaxy=' + galaxyId
                },
                {
                    variant: 'secondary',
                    children: 'Donations History',
                    uri: '/project/transactions?galaxy=' + galaxyId
                },
                {
                    variant: 'secondary',
                    children: 'Cascaded donations history',
                    uri: '/project/transactions?galaxy=' + galaxyId + '&cascaded=true'
                }
            ]}
        >
            <div className="mb-6 mt-4 flex flex-row gap-4">
                <div className="flex-1">
                    <BalanceInfoItem icon="D">
                        <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total user donations</div>
                            <NumberFlow
                                value={totalUserDonations}
                                locales="en-US"
                                format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 2, signDisplay: 'negative' }}
                                className="text-lg font-semibold text-gray-700 dark:text-gray-300/70"
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
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Cascading user donations</div>
                                        {getIcon({ iconType: 'info', className: 'w-3 h-3 cursor-help' })}
                                    </Popover.Trigger>
                                    <Popover.Portal>
                                        <Popover.Positioner sideOffset={8} side='bottom' className={'z-999!'}>
                                            <Popover.Popup className="w-80 origin-[var(--transform-origin)] rounded-xs bg-[canvas] px-6 py-4 text-gray-900 shadow-sm shadow-gray-900 dark:text-slate-300 dark:shadow-slate-300 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0">
                                                <Popover.Arrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
                                                </Popover.Arrow>
                                                <Popover.Description className="text-gray-600 dark:text-slate-400 text-sm">
                                                    {cascadingDonationsTooltip}
                                                </Popover.Description>
                                            </Popover.Popup>
                                        </Popover.Positioner>
                                    </Popover.Portal>
                                </Popover.Root>
                            </div>
                            <NumberFlow
                                value={cascadingUserDonations}
                                locales="en-US"
                                format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 2, signDisplay: 'negative' }}
                                className="text-lg font-semibold text-gray-700 dark:text-gray-300/70"
                            />
                        </div>
                    </BalanceInfoItem>
                </div>
                <div className="flex-1">
                    <BalanceInfoItem icon="T">
                        <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Project's created time</div>
                            <TimeAgo datetime={projectCreatedTime} className="text-lg font-semibold text-gray-700 dark:text-gray-300/70" />
                        </div>
                    </BalanceInfoItem>
                </div>
            </div>

            <PanelFooter>
                <PanelStat
                    iconType="sunshine"
                    hint="Total number of sunshines"
                    fill={true}
                >
                    {totalSunshines}
                </PanelStat>
                <PanelStat
                    iconType="star"
                    hint="1 Star is 360 sunshines"
                    fill={true}
                    iconClassName="w-6 h-6 text-yellow-500"
                >
                    {totalStars.toFixed(2)}
                </PanelStat>
                <PanelStat
                    iconType="percentage"
                    hint="Percentage of sunshines to turn to star"
                    fill={true}
                >
                    {percentageToStar}%
                </PanelStat>
                <PanelStat
                    iconType="issue"
                    hint="Number of issues (with attached star shines)"
                    fill={true}
                >
                    {issuesCount}
                </PanelStat>
                <PanelStat
                    iconType="unattached"
                    hint="Unattached sunshines"
                    fill={true}
                >
                    {unattachedSunshines}
                </PanelStat>
            </PanelFooter>
        </PageLikePanel>
    )
}

export default DonationsPanel

