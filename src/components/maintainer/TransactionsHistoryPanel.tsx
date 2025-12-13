import React, { useState, useEffect } from 'react'
import PageLikePanel from '@/components/panel/PageLikePanel'
import TransactionToggler from './TransactionToggler'
import DonationReceiversPopup from './DonationReceiversPopup'
import NumberFlow from '@number-flow/react'
import TimeAgo from 'timeago-react'
import Link from '@/components/custom-ui/Link'
import Tooltip from '@/components/custom-ui/Tooltip'
import MenuAvatar from '@/components/MenuAvatar'
import { getIcon } from '@/components/icon'
import { Popover } from '@base-ui-components/react/popover'
import Button from '@/components/custom-ui/Button'
import Badge from '@/components/badge/Badge'
import BackButton from '@/components/custom-ui/BackButton'
import type { Transaction } from '@/types/transaction'
import { getDonations } from '@/client-side/donations'
import { getTransactionUrl } from '@/lib/utils'

interface TransactionsHistoryPanelProps {
  galaxyId: string
  defaultShowCascaded?: boolean
}

const TransactionsHistoryPanel: React.FC<TransactionsHistoryPanelProps> = ({
  galaxyId,
  defaultShowCascaded = false
}) => {
  const [showCascaded, setShowCascaded] = useState(defaultShowCascaded)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [likedMemos, setLikedMemos] = useState<Set<string>>(new Set())
  const [completedMemos, setCompletedMemos] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true)
      try {
        const donations = await getDonations(galaxyId)
        setTransactions(donations)
      } catch (error) {
        console.error('Error fetching donations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (galaxyId) {
      fetchTransactions()
    }
  }, [galaxyId])

  const handleLikeMemo = (transactionId: string) => {
    setLikedMemos(new Set([...likedMemos, transactionId]))
    // Show popup notification
    alert('We sent email to the user notifying your feedback')
  }

  const handleCompleteMemo = (transactionId: string) => {
    setCompletedMemos(new Set([...completedMemos, transactionId]))
  }


  const filteredTransactions = showCascaded
    ? transactions.filter(t => t.maintainer)
    : transactions

  if (isLoading) {
    return (
      <PageLikePanel title="Donation History">
        <div className="text-center py-8 text-gray-500">Loading donations...</div>
      </PageLikePanel>
    )
  }

  return (
    <PageLikePanel title="Donation History">
      <TransactionToggler
        defaultShowCascaded={defaultShowCascaded}
        showCascaded={showCascaded}
        onToggle={setShowCascaded}
      />

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">
                <div className="flex items-center gap-1">
                  <span className="text-gray-600">#</span>
                  ID
                </div>
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 text-blue-600">
                Proof
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 text-blue-600">
                Amount
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">
                Date
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">
                User
              </th>
              {!showCascaded && (
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">
                  Memo
                </th>
              )}
              {showCascaded && (
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">
                  Cascade
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={showCascaded ? 6 : 6} className="py-8 text-center text-gray-500">
                  No donations found
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => (
                <tr key={transaction._id || transaction.initiateTxId} className="border-b border-gray-100 hover:bg-gray-50 dark:hover:bg-teal-900/40">
                  {/* ID Column */}
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-1 text-sm text-gray-800 dark:text-gray-400 pl-3">
                      {transaction._id ? transaction._id.substring(0, 8) : 'N/A'}
                    </div>
                  </td>

                  {/* Proof Column */}
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Link
                        uri={getTransactionUrl(transaction.initiateTxId)}
                        asNewTab={true}
                        className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Deposit Tx
                      </Link>
                      <span className="text-gray-400 dark:text-gray-600">|</span>
                      <Link
                        uri={getTransactionUrl(transaction.hyperpayTxId)}
                        asNewTab={true}
                        className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Hyperpay Tx
                      </Link>
                    </div>
                  </td>

                  {/* Amount Column */}
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2">
                      <Tooltip
                        content={
                          <div className="text-sm">
                            {showCascaded && transaction.maintainer
                              ? (
                                <div className="space-y-2">
                                  <div>Maintainer who shared his donations with you</div>
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={transaction.maintainer.icon || 'https://api.backdropbuild.com/storage/v1/object/public/avatars/9nFM8HasgS.jpeg'}
                                      alt={transaction.maintainer.nickname}
                                      className="w-12 h-12 rounded-full"
                                    />
                                    <div>
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium">{transaction.maintainer.nickname}</span>
                                        <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">Maintainer</span>
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        {getIcon({ iconType: 'sunshine', className: 'w-4 h-4' })}
                                        <NumberFlow
                                          value={transaction.maintainer.sunshines}
                                          locales="en-US"
                                          format={{ style: 'decimal', maximumFractionDigits: 0 }}
                                          className="text-xs"
                                        />
                                        {getIcon({ iconType: 'star', className: 'w-4 h-4' })}
                                        <NumberFlow
                                          value={transaction.maintainer.stars}
                                          locales="en-US"
                                          format={{ style: 'decimal', maximumFractionDigits: 2 }}
                                          className="text-xs"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                              : 'Amount user donated'}
                          </div>
                        }
                      >
                        <NumberFlow
                          value={transaction.amount}
                          locales="en-US"
                          format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 2 }}
                          className="text-sm font-medium text-gray-800 dark:text-gray-400"
                        />
                      </Tooltip>
                      {!showCascaded && (
                        <DonationReceiversPopup receivers={transaction.receivers} />
                      )}
                    </div>
                  </td>

                  {/* Date Column */}
                  <td className="py-4 px-2">
                    <TimeAgo datetime={transaction.date} className="text-sm text-gray-800 dark:text-gray-400" />
                  </td>

                  {/* User Column */}
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2">
                      <Tooltip
                        content={
                          <div className="text-sm">
                            Who donated
                            <div className="mt-2">
                              <MenuAvatar
                                src={transaction.user.icon}
                                nickname={transaction.user.nickname}
                                sunshines={transaction.user.sunshines}
                                stars={transaction.user.stars}
                                role={transaction.user.isMaintainer ? 'maintainer' : 'user'}
                              />
                            </div>
                          </div>
                        }
                      >
                        <MenuAvatar
                          src={transaction.user.icon}
                          nickname={transaction.user.nickname}
                          sunshines={transaction.user.sunshines}
                          stars={transaction.user.stars}
                          role={transaction.user.isMaintainer ? 'maintainer' : 'user'}
                        />
                      </Tooltip>
                      <Tooltip
                        content={
                          <div className="text-sm">
                            Received {transaction.user.sunshines} sunshines. {getIcon({ iconType: 'star', className: 'w-4 h-4 inline' })} 1 = 360 sunshines
                          </div>
                        }
                      >
                        <div className="flex items-center gap-1">
                          {getIcon({ iconType: 'sunshine', className: 'w-4 h-4' })}
                          <NumberFlow
                            value={transaction.user.sunshines}
                            locales="en-US"
                            format={{ style: 'decimal', maximumFractionDigits: 0 }}
                            className="text-sm text-gray-800 dark:text-gray-400"
                          />
                          <span className="text-gray-500">+</span>
                        </div>
                      </Tooltip>
                    </div>
                  </td>

                  {/* Memo Column (only when not showing cascaded) */}
                  {!showCascaded && (
                    <td className="py-4 px-2">
                      {transaction.memo ? (
                        <Popover.Root>
                          <Popover.Trigger className="hyperlink flex items-center justify-center shadow-none">
                            <div className="text-sm text-gray-800 dark:text-gray-400 italic max-w-xs truncate">
                              &quot;{transaction.memo.substring(0, 64)}
                              {transaction.memo.length > 64 ? '...' : ''}&quot;
                            </div>
                          </Popover.Trigger>
                          <Popover.Portal>
                            <Popover.Positioner sideOffset={8} side='bottom' className={'z-999!'}>
                              <Popover.Popup className="w-96 origin-[var(--transform-origin)] rounded-xs bg-[canvas] px-6 py-4 text-gray-900 shadow-sm shadow-gray-900 dark:text-slate-300 dark:shadow-slate-300 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0">
                                <Popover.Arrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
                                </Popover.Arrow>
                                <Popover.Title className="text-gray-500 dark:text-gray-400 font-medium text-md mb-2">
                                  Memo
                                </Popover.Title>
                                <Popover.Description className="text-gray-600 dark:text-slate-400 text-sm mb-4">
                                  {transaction.memo}
                                </Popover.Description>
                                <div className="flex gap-2">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleCompleteMemo(transaction._id || transaction.initiateTxId)}
                                    disabled={completedMemos.has(transaction._id || transaction.initiateTxId)}
                                  >
                                    {completedMemos.has(transaction._id || transaction.initiateTxId) ? 'Completed' : 'Complete'}
                                  </Button>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleLikeMemo(transaction._id || transaction.initiateTxId)}
                                    disabled={likedMemos.has(transaction._id || transaction.initiateTxId)}
                                    className="flex items-center gap-1"
                                  >
                                    {getIcon({ iconType: 'likes', className: 'w-4 h-4' })}
                                    {likedMemos.has(transaction._id || transaction.initiateTxId) ? 'Liked' : 'Like'}
                                  </Button>
                                </div>
                              </Popover.Popup>
                            </Popover.Positioner>
                          </Popover.Portal>
                        </Popover.Root>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                  )}

                  {/* Cascade Column (only when showing cascaded) */}
                  {showCascaded && (
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-2">
                        <BackButton uri="/project/transactions" />
                        <Tooltip
                          content={
                            <div className="text-sm">
                              Shared at the {transaction.cascadeLevel || 3} level
                            </div>
                          }
                        >
                          <Badge variant="info" static={true}>
                            <NumberFlow
                              value={transaction.cascadeLevel || 3}
                              locales="en-US"
                              format={{ style: 'decimal', maximumFractionDigits: 0 }}
                            />
                          </Badge>
                        </Tooltip>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PageLikePanel>
  )
}

export default TransactionsHistoryPanel

