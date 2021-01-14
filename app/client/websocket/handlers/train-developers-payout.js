'use strict'
const { Events } = require('../../../util/constants')

const TrainDevelopersPayoutHandler = (client, { data }) => {

  client.emit(Events.TRAIN_DEVELOPERS_PAYOUT, ...data.args)
}

module.exports = TrainDevelopersPayoutHandler
