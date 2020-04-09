'use strict'
const saveVoteJob = require('../app/jobs/save-vote')
const updateTimerJob = require('../app/jobs/update-timer')

module.exports = {
  'saveVoteJob': {
    'expression': '*/2 * * * *',
    'job': saveVoteJob
  },
  'updateTimerJob': {
    'expression': '*/2 * * * *',
    'job': updateTimerJob
  }
}
