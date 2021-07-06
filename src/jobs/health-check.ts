import axios from 'axios'
import lodash from 'lodash'

export default async function healthCheckJob (healthCheck: string): Promise<void> {
  const url = process.env[`${lodash.snakeCase(healthCheck).toUpperCase()}_HEALTH_CHECK_URL`]
  if (typeof url !== 'undefined') {
    await axios.post(url)
  }
}
