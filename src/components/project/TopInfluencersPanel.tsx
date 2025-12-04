import React from 'react'
import PageLikePanel from '@/components/panel/PageLikePanel'

interface Influencer {
  name: string
  rating: number
  avatar: string
}

const TopInfluencers: React.FC = () => {
  const influencers: Influencer[] = [
    { name: 'Alice', rating: 290, avatar: 'A' },
    { name: 'Minh', rating: 180, avatar: 'M' },
    { name: 'DevCollective', rating: 150, avatar: 'DC' }
  ]

  return (
    <PageLikePanel className="p-6" title='Top Influencers'>
      {influencers.map((influencer, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
              {influencer.avatar}
            </div>
            <span className="font-medium">{influencer.name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium">{influencer.rating} rating</span>
          </div>
        </div>
      ))}

      <div className="mt-6 p-4 bg-purple-50 rounded-lg">
        <blockquote className="text-sm italic text-gray-700">
          "Ara makes me feel like my voice actually shapes the tools I use every day."
        </blockquote>
        <cite className="text-xs text-gray-500 mt-2 block text-right">— Backer testimonial</cite>
      </div>
    </PageLikePanel>
  )
}

export default TopInfluencers
