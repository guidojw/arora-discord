import * as Sentry from '@sentry/node'
import type { AroraClient } from '../client'
import type { BaseJob } from '../jobs'
import { RewriteFrames } from '@sentry/integrations'
import { constants } from '../utils'
import container from '../configs/container'
import cron from 'node-schedule'
import cronConfig from '../configs/cron'
import dataSource from '../configs/data-source'

const { TYPES } = constants

export async function init (): Promise<AroraClient> {
  if (typeof process.env.SENTRY_DSN !== 'undefined') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      release: process.env.BUILD_HASH,
      integrations: [
        new RewriteFrames({
          root: process.cwd()
        })
      ]
    })
  }

  await dataSource.initialize()

  const jobFactory = container.get<(jobName: string) => BaseJob>(TYPES.JobFactory)
  const healthCheckJobConfig = cronConfig.healthCheckJob
  const healthCheckJob = jobFactory(healthCheckJobConfig.name)
  cron.scheduleJob(
    healthCheckJobConfig.expression,
    () => {
      Promise.resolve(healthCheckJob.run('main')).catch(console.error)
    }
  )

  const client = container.get<AroraClient>(TYPES.Client)
  try {
    await client.login(process.env.DISCORD_TOKEN)
  } catch (err) {
    console.error(err)
    await client.destroy()
    process.exit(1)
  }

  return client
}
