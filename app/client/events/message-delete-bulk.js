'use strict'
const messageDeleteHandler = require('./message-delete')

const messageDeleteBulkHandler = (client, messages) => {
  messages.forEach(messageDeleteHandler.bind(messageDeleteBulkHandler, client))
}

module.exports = messageDeleteBulkHandler
