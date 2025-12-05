import * as demoActions from './demo'
import * as allStarsActions from './all-stars'

export const server = {
    ...demoActions.server,
    ...allStarsActions.server,
}

