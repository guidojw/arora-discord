import * as Sentry from '@sentry/node'
import { AroraClient } from '../client'
import type { BaseJob } from '../jobs'
import { constants } from '../util'
import container from '../configs/container'
import { createConnection } from 'typeorm'
import cron from 'node-cron'
import cronConfig from '../configs/cron'

const { TYPES } = constants

export async function init (): Promise<AroraClient> {
  if (typeof process.env.SENTRY_DSN !== 'undefined') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      release: process.env.BUILD_HASH
    })
  }

  await createConnection()

  const jobFactory = container.get<(jobName: string) => BaseJob>(TYPES.JobFactory)
  const healthCheckJobConfig = cronConfig.healthCheckJob
  const healthCheckJob = jobFactory(healthCheckJobConfig.name)
  cron.schedule(
    healthCheckJobConfig.expression,
    healthCheckJob.run.bind(healthCheckJob.run, 'main')
  )

  const client = new AroraClient({ commandEditableDuration: 0 })
  await client.login(process.env.DISCORD_TOKEN)

  return client
}
