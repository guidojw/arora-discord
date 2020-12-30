'use strict'
const premiumMembersReportJob = require('../app/jobs/premium-members-report')
const announceTrainingsJob = require('../app/jobs/announce-trainings')

module.exports = {
  premiumMembersReportJob: {
    expression: '0 12 */1 * *', // https://crontab.guru/#0_12_*/1_*_*
    job: premiumMembersReportJob,
  },
  announceTrainingsJob: {
    expression: '*/5 * * * *', // https://crontab.guru/#*/5_*_*_*_*
    job: announceTrainingsJob,
  },
}
