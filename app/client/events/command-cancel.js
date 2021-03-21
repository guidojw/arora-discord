'use strict'
const commandCancelHandler = (client, _command, _reason, _message, collResult) => {
  collResult?.prompts.forEach(client.deleteMessage.bind(client))
  collResult?.answers.forEach(client.deleteMessage.bind(client))
}

module.exports = commandCancelHandler
