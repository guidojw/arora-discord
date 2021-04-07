'use strict'

const { announceTrainingsJob, healthCheckJob, premiumMembersReportJob } = require('../src/jobs')

module.exports = {
  announceTrainingsJob: {
    expression: '*/5 * * * *', // https://crontab.guru/#*/5_*_*_*_*
    job: announceTrainingsJob,
  },
  healthCheckJob: {
    expression: '*/5 * * * *', // https://crontab.guru/#*/5_*_*_*_*
    job: healthCheckJob,
  },
  premiumMembersReportJob: {
    expression: '0 12 */1 * *', // https://crontab.guru/#0_12_*/1_*_*
    job: premiumMembersReportJob,
  }
}
