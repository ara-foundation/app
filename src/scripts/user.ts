export type Roles = 'user' | 'maintainer' | 'contributor'

export interface UserModel {
    src?: string
    alt?: string
    uri?: string
    nickname?: string
    sunshines?: number
    stars?: number
    role?: Roles
    balance?: number
}

