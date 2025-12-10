import React from 'react'
import FilterBar from '@/components/maintainer/ProfileFilterBar'
import UserCard from '@/components/profile/ProfileLinkPanel'
import BasePanel from '@/components/panel/Panel'

const MainContent: React.FC = () => {
  const filters = [
    { id: 'all', label: 'All', active: true, color: 'gray' },
    { id: 'maintainer', label: 'Maintainer', active: false, color: 'green' },
    { id: 'influencer', label: 'Influencer', active: false, color: 'purple' },
    { id: 'contributor', label: 'Contributor', active: false, color: 'orange' }
  ]

  return (
    <BasePanel className="max-w-4xl">
      <div className="mt-6">
        <FilterBar
          filters={filters}
          sortBy="Rating"
          sortOptions={['Rating', 'Name', 'Date']}
        />
      </div>

      <div className="mt-6 space-y-4">
        <UserCard
          avatar="https://dummyimage.com/40x40/f59e0b/ffffff?text=S"
          name="Serkan Balguliyev"
          rating={220}
          description="The dashboard layout breaks on iPad and other tablet devices in landscape orientation. Elements overlap and some controls become inaccessible."
          highlightedInteraction={{
            avatar: "https://dummyimage.com/32x32/10b981/ffffff?text=S",
            name: "Sarah Johnson",
            rating: 244,
            comment: "David your code is really good.",
            time: "Today at 9:22 AM"
          }}
          stats={{
            date: "Oct 5, 2023",
            followers: 5,
            projects: 2
          }}
          isFollowing={false}
        />
      </div>
    </BasePanel>
  )
}

export default MainContent
