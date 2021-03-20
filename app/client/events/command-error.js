'use strict'

const { stripIndents } = require('common-tags')

const commandErrorHandler = (client, command, err, message, _args, _fromPattern, collResult) => {
  if (err.response && err.response.data.errors && err.response.data.errors.length > 0) {
    message.reply(err.response.data.errors[0].message || err.response.data.errors[0].msg)
  } else {
    message.reply(err.message || err.msg)
  }

  collResult.prompts.map(client.deleteMessage.bind(client))
  collResult.answers.map(client.deleteMessage.bind(client))

  const guild = message.guild || client.mainGuild
  guild.log(
    message.author,
    stripIndents`
    ${message.author} **used** \`${command.name}\` **command in** ${message.channel} [Jump to Message](${message.url})
    ${message.content}
    `, {
      color: 0xff0000
    }
  )
}

module.exports = commandErrorHandler
