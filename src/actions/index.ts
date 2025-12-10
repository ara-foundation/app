import { server as demoActions } from './demo'
import { server as allStarsActions } from './all-stars'
import { server as userActions } from './user'
import { server as issueActions } from './issue'
import { server as galaxyActions } from './galaxy'
import { server as roadmapActions } from './roadmap'

export const server = {
    ...demoActions,
    ...allStarsActions,
    ...userActions,
    ...issueActions,
    ...galaxyActions,
    ...roadmapActions,
}

