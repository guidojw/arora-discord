import 'reflect-metadata'
import dotenv from 'dotenv'
import * as loaders from './loaders'

dotenv.config()

export default loaders.init()
