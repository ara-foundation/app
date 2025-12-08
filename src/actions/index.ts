import { server as demoActions } from '../demo-runtime-cookies/actions'
import { server as allStarsActions } from './all-stars'
import { server as userActions } from './user'

export const server = {
    ...demoActions,
    ...allStarsActions,
    ...userActions,
}

