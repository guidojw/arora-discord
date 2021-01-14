'use strict'
const { Events } = require('../../../util/constants')

const RankChangeHandler = (client, { data }) => {

  client.emit(Events.RANK_CHANGE, ...data.args)
}

module.exports = RankChangeHandler
