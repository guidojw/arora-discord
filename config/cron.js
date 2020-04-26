'use strict'
const saveVoteJob = require('../app/jobs/save-vote')
const updateTimerJob = require('../app/jobs/update-timer')
const premiumMembersReportJob = require('../app/jobs/premium-members-report')

module.exports = {
    saveVoteJob: {
        expression: '*/2 * * * *',
        job: saveVoteJob
    },
    updateTimerJob: {
        expression: '*/2 * * * *',
        job: updateTimerJob
    },
    premiumMembersReportJob: {
        expression: '0 12 */1 * *',
        job: premiumMembersReportJob
    }
}
