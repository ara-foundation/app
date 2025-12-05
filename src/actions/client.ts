/**
 * Client-safe action wrappers
 * These can be safely imported in client components
 */
import { withState } from '@astrojs/react/actions'
import { server } from './index'

// Wrap actions with withState for client-side use
// Note: This will be tree-shaken in production builds
export const startDemoAction = withState(server.start)
export const allStarStatsAction = withState(server.allStarStats)

