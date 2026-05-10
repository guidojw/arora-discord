import * as Sentry from '@sentry/node'

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
