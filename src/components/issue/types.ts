import { IconType, getIcon } from "../icon"
import { ProfileLink } from "../profile/types"

export type IssueType = 'improvement' | 'feature' | 'bug' | 'enhancement' | 'wish' | 'custom'
// export type IssueType = 'bug' | 'wish' | 'feature'
export type IssuePriority = 'low' | 'medium' | 'high'
export type IssueStorage = 'github' | 'arada-'
export type IssueStatType = 'upvote' | 'downvote' | 'chat' | 'voting-power' | 'follower' | 'money' | 'persona'

export interface Issue {
    id?: number
    uri: string
    number?: string
    title: string
    description: string
    type: IssueType
    storage?: IssueStorage
    author?: ProfileLink | ProfileLink[]
    projectId: string
    categoryId: string
    stats?: {
        [key in IssueStatType]?: IssueStat
    },
    createdTime?: string
    // VP properties for voting
    vpAmount?: number
    currentVP?: number
    topVP?: number
    minVP?: number
}
// For users, to pick
// export interface Issue2 {
//     uri: string
//     title: string
//     description: string
//     category: string
//     date: string
//     comments: number
//     upvotes: number
//     downvotes: number
//     status: string
//     priority: string
//     author: string
//     solved: boolean
//   }

export interface IssueStat {
    type: IssueStatType
    hint: React.ReactNode
    filled?: boolean
    children: React.ReactNode
}

export const getIssueStatIcon = (statType: IssueStatType): IconType => {
    switch (statType) {
        case 'upvote':
            return 'likes'
        case 'downvote':
            return 'likes' // You might want to use a different icon for downvote
        case 'chat':
            return 'chat'
        case 'voting-power':
            return 'vote-priority'
        case 'follower':
            return 'heart'
        case 'money':
            return 'money'
        case 'persona':
            return 'user'
        default:
            return 'info'
    }
}