import type BaseJob from './base'
import axios from 'axios'
import { injectable } from 'inversify'
import lodash from 'lodash'

@injectable()
export default class HealthCheckJob implements BaseJob {
  public async run (healthCheck: string): Promise<void> {
    const url = process.env[`${lodash.snakeCase(healthCheck).toUpperCase()}_HEALTH_CHECK_URL`]
    if (typeof url !== 'undefined') {
      await axios.post(url)
    }
  }
}
