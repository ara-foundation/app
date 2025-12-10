import type { Roles, User } from "@/types/user"
import { ObjectId } from "mongodb"

export interface DemoModel {
    _id?: any
    email: string
    created: number
    users: ObjectId[]
    step?: number
}

/**
 * Client-safe demo constants
 * These constants can be safely imported in client components
 */
export const DEMO_COOKIE_NAMES = {
    email: 'demo-email',
    users: 'demo-users',
    role: 'demo-role',
} as const

/**
 * Predefined demo steps array
 * Each step is a tuple: [stepName: string, role: Roles]
 * The step index in DemoModel references this array
 */
export const DemoSteps = [
    ['obtain_sunshine', 'user'], // index 0 - default
    ['create_issue', 'user'],
    ['assign_contributor', 'maintainer'],
    ['move_to_roadmap', 'maintainer'],
    ['create_patch', 'maintainer'],
    ['mark_version_complete', 'maintainer'],
    ['test_completed', 'user'],
    ['place_star_in_galaxy', 'user'],
    ['place_star_in_galaxy', 'maintainer'],
    ['place_star_in_galaxy', 'contributor'],
] as const

export const DEMO_EVENT_TYPES = {
    USER_CREATED: 'demo-user-created',
    USER_DELETED: 'demo-user-deleted',
    ROLE_CHANGED: 'demo-role-change',
} as const

// Event types
export interface DemoUserCreatedEvent {
    email: string
    users: User[]
    role: Roles
}

export interface DemoRoleChangeEvent {
    role: Roles
}

