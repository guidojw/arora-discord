'use strict'

require('dotenv').config()

const Sentry = require('@sentry/node')
const NSadminClient = require('./app/client/client')

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN })
}

new NSadminClient({
  commandEditableDuration: 0
}).login(process.env.DISCORD_TOKEN)
