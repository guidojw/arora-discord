import * as Sentry from '@sentry/node'
import type { AroraClient } from '../client'
import type { BaseJob } from '../jobs'
import Bree from 'bree'
import { configureServer } from 'rozod'
import { constants } from '../utils'
import container from '../configs/container'
import cron from 'node-schedule'
import cronConfig from '../configs/cron'
import dataSource from '../configs/data-source'
import path from 'node:path'

const { TYPES } = constants

export async function init (): Promise<AroraClient> {
  if (typeof process.env.SENTRY_DSN !== 'undefined') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      release: process.env.BUILD_HASH,
      integrations: [
        Sentry.rewriteFramesIntegration({
          root: process.cwd()
        })
      ],
      tracesSampleRate: 0.2
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

  configureServer({ cloudKey: process.env.ROBLOX_API_KEY })

  const client = container.get<AroraClient>(TYPES.Client)
  try {
    await client.login(process.env.DISCORD_TOKEN)
  } catch (err) {
    console.error(err)
    await client.destroy()
    process.exit(1)
  }

  const bree = new Bree({
    root: path.resolve(__dirname, '../jobs'),
    jobs: [{
      name: 'get-train-module',
      timeout: 0,
      interval: '60m'
    }],
    workerMessageHandler: data => {
      if (data.message === 'done') {
        return
      }
      if (data.name === 'get-train-module') {
        container.get<Map<string, object>>(TYPES.TrainsCache).set('cache', data.message as any)
      }
    }
  })
  await bree.start()

  return client
}
