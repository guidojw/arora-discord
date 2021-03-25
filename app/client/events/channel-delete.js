'use strict'
const { Channel } = require('../../models')

const channelDeleteHandler = (_client, channel) => {
  Channel.destroy({ where: { id: channel.id } })
}

module.exports = channelDeleteHandler
