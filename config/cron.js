'use strict'

const announceTrainingsJob = require('../src/jobs/announce-trainings')
const premiumMembersReportJob = require('../src/jobs/premium-members-report')

module.exports = {
  announceTrainingsJob: {
    expression: '*/5 * * * *', // https://crontab.guru/#*/5_*_*_*_*
    job: announceTrainingsJob,
  },
  premiumMembersReportJob: {
    expression: '0 12 */1 * *', // https://crontab.guru/#0_12_*/1_*_*
    job: premiumMembersReportJob,
  }
}
