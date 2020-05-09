'use strict'
const saveVoteJob = require('../app/jobs/save-vote')
const updateTimerJob = require('../app/jobs/update-timer')
const premiumMembersReportJob = require('../app/jobs/premium-members-report')

module.exports = {
    saveVoteJob: {
        expression: '*/2 * * * *', // https://crontab.guru/#*/2_*_*_*_*
        job: saveVoteJob
    },
    updateTimerJob: {
        expression: '*/2 * * * *', // https://crontab.guru/#*/2_*_*_*_*
        job: updateTimerJob
    },
    premiumMembersReportJob: {
        expression: '0 12 */1 * *', // https://crontab.guru/#0_12_*/1_*_*
        job: premiumMembersReportJob
    }
}
