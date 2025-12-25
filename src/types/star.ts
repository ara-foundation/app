export type Roles = 'user' | 'maintainer' | 'contributor'

export interface Star {
    _id?: string
    sunshines?: number
    stars?: number
    balance?: number
    demoPrivateKey?: string
    userId?: string // Reference to better-auth User id (ObjectId as string)
}

export const STAR_EVENT_TYPES = {
    STAR_UPDATE: 'star-update',
} as const

export interface StarUpdateEventDetail {
    star: Star
}

