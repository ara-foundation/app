import React from 'react'
import PageLikePanel from '@/components/panel/PageLikePanel'
import { FinanceInfoProps } from '../../types/user'
import InfoPair from '../InfoPair'

const FinancialStatus: React.FC<FinanceInfoProps> = ({ balance, cascadingBalance, totalDonated, totalReceived }) => {
  return (
    <PageLikePanel className="my-6" interactive={false} title="Finance Info" actions={[]}>
      <div className="space-y-4">
        <div className="flex justify-start items-center gap-4">
          <InfoPair title1="Balance" value1={balance} title2="Cascading Balance" value2={cascadingBalance} belowThresholdColor={10} />
          <InfoPair title1="Total Donated" value1={totalDonated} title2="Total Received" value2={totalReceived} belowThresholdColor={10} />
        </div>

        {/* <div className="border-t pt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-2">Monthly Activity</p>
            <div className="h-20 bg-gray-100 rounded flex items-end justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 50">
                <polyline
                  fill="none"
                  stroke="#6B7280"
                  strokeWidth="2"
                  points="10,40 20,35 30,30 40,25 50,20 60,25 70,30 80,35 90,40"
                />
              </svg>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Spending Distribution</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-green-600">Bug Bounties</span>
                <span>$2,340.00 (49%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className="bg-green-500 h-1 rounded-full" style={{ width: '49%' }}></div>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-blue-600">Feature Development</span>
                <span>$1,450.00 (30%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className="bg-blue-500 h-1 rounded-full" style={{ width: '30%' }}></div>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-purple-600">Documentation</span>
                <span>$650.00 (14%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className="bg-purple-500 h-1 rounded-full" style={{ width: '14%' }}></div>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-yellow-600">Code Reviews</span>
                <span>$340.00 (7%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className="bg-yellow-500 h-1 rounded-full" style={{ width: '7%' }}></div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </PageLikePanel>
  )
}

export default FinancialStatus
