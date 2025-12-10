import React, { memo } from 'react'
import { useDrag } from 'react-dnd'
import UserStar from './UserStar'
import { UserStar as UserStarData } from '@/types/all-stars'

interface DraggableUserStarProps {
    userData: UserStarData
    className?: string
}

const DraggableUserStar: React.FC<DraggableUserStarProps> = memo(({
    userData,
    className
}) => {
    const [{ opacity }, drag] = useDrag({
        type: 'user-star',
        item: () => userData,
        collect: (monitor) => ({
            opacity: monitor.isDragging() ? 0.4 : 1,
        }),
    })

    return (
        <div
            ref={drag as any}
            data-testid={userData.nickname}
            className={`cursor-move inline-block opacity-${opacity} ${className || ''}`}
        >
            <div className="relative w-10 h-10 mr-10 -mt-10 border-transparent">
                <UserStar
                    x={0}
                    y={0}
                    src={userData.src}
                    alt={userData.alt}
                    nickname={userData.nickname}
                    sunshines={userData.sunshines}
                    stars={userData.stars}
                    role={userData.role}
                    funded={userData.funded}
                    received={userData.received}
                    issuesClosed={userData.issuesClosed}
                    issuesActive={userData.issuesActive}
                    uri={userData.uri}
                    walletAddress={userData.walletAddress}
                    githubUrl={userData.githubUrl}
                    linkedinUrl={userData.linkedinUrl}
                    tags={userData.tags}
                    disableTooltip={true}
                    disableEllipses={true}
                />
            </div>
        </div>
    )
})

DraggableUserStar.displayName = 'DraggableUserStar'

export default DraggableUserStar

