import { actions } from 'astro:actions';
import { clearCookie, getCookie, setCookie, emitEvent, callAction } from '@/scripts/astro-runtime-cookies'
import type { Roles, User } from '../types/user'
import { DEMO_COOKIE_NAMES, DEMO_EVENT_TYPES } from '../demo-runtime-cookies/index'

// (Client Side) Check if demo cookies exist
export const demoExists = (): boolean => {
    return demoCookiesExist()
}

// (Client Side) Get demo from the cookies
export const getDemo = (): { email: string | null; users: User[] | null; role: Roles | null } => {
    return getDemoCookies()
}

// (Server Side Action) Start demo and emit USER_CREATED event
export const startDemo = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const result = await callStartAction(email)

    if (result.success && result.users) {
        const defaultRole: Roles = 'maintainer'
        setDemoCookies(email.trim(), result.users, defaultRole)

        // Emit USER_CREATED event
        emitEvent(DEMO_EVENT_TYPES.USER_CREATED, {
            email: email.trim(),
            users: result.users,
            role: defaultRole,
        })
    }

    return result
};

// (Client Side) Clear demo cookies and emit USER_DELETED event
export const clearDemo = () => {
    clearDemoCookies()

    // Emit USER_DELETED event
    emitEvent(DEMO_EVENT_TYPES.USER_DELETED, {})
};

// (Client Side) Change role and emit ROLE_CHANGED event
export const changeRole = (role: Roles) => {
    const { email, users } = getDemoCookies()
    if (email && users) {
        setDemoCookies(email, users, role)

        // Emit ROLE_CHANGED event
        emitEvent(DEMO_EVENT_TYPES.ROLE_CHANGED, { role })
    }
};

// (Server Side Action) Get demo step
export const getDemoStep = async (email: string): Promise<number | null> => {
    try {
        const result = await actions.getDemoStep({ email })
        if (result.data?.success && result.data.step !== undefined) {
            return result.data.step
        }
        return null
    } catch (error) {
        console.error('Error getting demo step:', error)
        return null
    }
};

// (Server Side Action) Obtain sunshines
export const obtainSunshines = async (params: {
    galaxyId: string;
    userId: string;
    email: string;
}): Promise<{ success: boolean; sunshines?: number; totalSunshines?: number; error?: string }> => {
    try {
        const result = await actions.obtainSunshines(params)
        if (result.data?.success) {
            return {
                success: true,
                sunshines: result.data.sunshines,
                totalSunshines: result.data.totalSunshines,
            }
        }
        return {
            success: false,
            error: result.data?.error || 'Failed to obtain sunshines',
        }
    } catch (error) {
        console.error('Error obtaining sunshines:', error)
        return {
            success: false,
            error: 'An error occurred while obtaining sunshines',
        }
    }
};

//----------------------------------------------------------------
//
//----------------------------------------------------------------

// Get all demo cookies
function getDemoCookies(): {
    email: string | null
    users: User[] | null
    role: Roles | null
} {
    const email = getCookie(DEMO_COOKIE_NAMES.email)
    const usersStr = getCookie(DEMO_COOKIE_NAMES.users)
    const role = getCookie(DEMO_COOKIE_NAMES.role) as Roles | null

    let users: User[] | null = null
    if (usersStr) {
        try {
            users = JSON.parse(usersStr)
        } catch {
            users = null
        }
    }

    return { email, users, role }
}

// Check if demo cookies exist
function demoCookiesExist(): boolean {
    const { email, users, role } = getDemoCookies()
    return !!(email && users && role)
}

// Clear all demo cookies
function clearDemoCookies(): void {
    Object.values(DEMO_COOKIE_NAMES).forEach((name) => {
        clearCookie(name)
    })
}

// Set all demo cookies
function setDemoCookies(
    email: string,
    users: User[],
    role: Roles,
    days: number = 30
): void {
    setCookie(DEMO_COOKIE_NAMES.email, email, days)
    setCookie(DEMO_COOKIE_NAMES.users, encodeURIComponent(JSON.stringify(users)), days)
    setCookie(DEMO_COOKIE_NAMES.role, role, days)
}

// Call the start action
async function callStartAction(email: string): Promise<{ success: boolean; users?: User[]; error?: string }> {
    const result = await callAction(actions.start, { email: email.trim() })

    if (result.success) {
        return {
            success: true as const,
            users: result.data?.users,
        }
    }

    return {
        success: false,
        error: result.error,
    }
}

