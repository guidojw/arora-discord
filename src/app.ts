import 'reflect-metadata'
import dotenv from 'dotenv'

dotenv.config()

// eslint-disable-next-line max-len
// eslint-disable-next-line import/first, sort-imports -- Sentry loader needs dotenv configured first.
import * as loaders from './loaders'

export default loaders.init()
