export interface AllStarStats {
    totalGalaxies: number;
    totalStars: number;
    totalUsers: number;
    totalSunshines?: number;
}

export const SPACE_EVENT_TYPES = {
    USER_STAR_CREATED: 'user-star-created',
    USER_STAR_MOVED: 'user-star-moved',
    USER_STAR_UPDATED: 'user-star-updated',
} as const

export type SpaceEventType = typeof SPACE_EVENT_TYPES[keyof typeof SPACE_EVENT_TYPES]

export interface UserStar {
    _id?: string
    x?: number
    y?: number
    src?: string
    alt?: string
    nickname: string
    sunshines?: number
    stars?: number
    role?: string
    funded?: number
    received?: number
    issuesClosed?: number
    issuesActive?: number
    uri?: string
    walletAddress?: string
    githubUrl?: string
    linkedinUrl?: string
    tags?: string[]
    draggable?: boolean
    userId?: string
    email?: string
    galaxyId: string
    createdTime?: number
    updatedTime?: number
}

export interface GalaxySpace {
    galaxyId: string
    stars: UserStar[]
}


export interface SolarForgeModel {
    _id?: string;
    solarForgeType: 'issue';
    issueId: string;
    users: string[]; // Array of user IDs
    sunshines: number;
    createdTime: number;
}

export interface SolarUser {
    id: string;
    roles: string[];
    stars: number;
}

export interface SolarForgeByIssueResult {
    users: SolarUser[];
    solarForgeId: string;
    error?: string;
}

export interface SolarForgeByVersionResult {
    users: SolarUser[];
    totalIssues: number;
    totalSunshines: number;
    totalStars: number;
}

/**
 * Convert sunshines to stars using the formula: stars = sunshines / 180
 * @param sunshines - The amount of sunshines to convert
 * @returns The equivalent number of stars
 */
export function solarForge(sunshines: number): number {
    return sunshines / 180;
}

