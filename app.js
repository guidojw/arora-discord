'use strict'
require('dotenv').config()

const Bot = require('./app/controllers/bot')
const Sentry = require('@sentry/node')

if (process.env.SENTRY_DSN) Sentry.init({dsn: process.env.SENTRY_DSN})

new Bot()
