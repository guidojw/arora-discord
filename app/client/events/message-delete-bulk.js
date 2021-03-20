'use strict'
const messageDeleteHandler = require('./message-delete')

const messageDeleteBulkHandler = (client, messages) => {
  messages.map(messageDeleteHandler.bind(messageDeleteBulkHandler, client))
}

module.exports = messageDeleteBulkHandler
