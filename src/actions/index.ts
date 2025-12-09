import { server as demoActions } from '../demo-runtime-cookies/actions'
import { server as allStarsActions } from './all-stars'
import { server as userActions } from './user'
import { server as issueActions } from './issue'
import { server as galaxyActions } from './galaxy'
import { server as roadmapActions } from '../components/roadmap/actions'

export const server = {
    ...demoActions,
    ...allStarsActions,
    ...userActions,
    ...issueActions,
    ...galaxyActions,
    ...roadmapActions,
}

