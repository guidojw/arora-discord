import * as Sentry from '@sentry/node'
import dotenv from 'dotenv'

dotenv.config()

if (typeof process.env.SENTRY_DSN !== 'undefined') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.BUILD_HASH,
    integrations: [
      Sentry.consoleLoggingIntegration({
        levels: ['log', 'warn', 'error']
      }),
      Sentry.rewriteFramesIntegration({
        root: process.cwd()
      })
    ],
    tracesSampleRate: 0.5,
    tracePropagationTargets: typeof process.env.HOST !== 'undefined' ? [process.env.HOST] : [],
    sendDefaultPii: true,
    enableLogs: true
  })
}
