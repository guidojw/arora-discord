'use strict'

require('dotenv').config()

const Sentry = require('@sentry/node')
const cron = require('node-cron')
const AroraClient = require('./src/client/client')

const healthCheckJobConfig = require('./config/cron').healthCheckJob

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN })
}

cron.schedule(
  healthCheckJobConfig.expression,
  healthCheckJobConfig.job.bind(healthCheckJobConfig.job, 'main')
)

new AroraClient({
  commandEditableDuration: 0
}).login(process.env.DISCORD_TOKEN)
