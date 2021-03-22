'use strict'
const commandErrorHandler = (client, command, err, message, _args, _fromPattern, collResult) => {
  if (err.response?.data.errors?.length > 0) {
    message.reply(err.response.data.errors[0].message ?? err.response.data.errors[0].msg)
  } else {
    message.reply(err.message ?? err.msg)
  }

  collResult?.prompts.forEach(client.deleteMessage.bind(client))
  collResult?.answers.forEach(client.deleteMessage.bind(client))
}

module.exports = commandErrorHandler
