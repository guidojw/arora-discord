import type BaseJob from './base'
import axios from 'axios'
import lodash from 'lodash'

export default class HealthCheckJob implements BaseJob {
  public async run (healthCheck: string): Promise<void> {
    const url = process.env[`${lodash.snakeCase(healthCheck).toUpperCase()}_HEALTH_CHECK_URL`]
    if (typeof url !== 'undefined') {
      await axios.post(url)
    }
  }
}
