'use strict'

const { stripIndents } = require('common-tags')

const commandErrorHandler = async (client, command, err, message, _args, _fromPattern, collResult) => {
  if (err.response && err.response.data.errors && err.response.data.errors.length > 0) {
    await message.reply(err.response.data.errors[0].message || err.response.data.errors[0].msg)
  } else {
    await message.reply(err.message || err.msg)
  }

  await client.handleCommandDeleteMessages(command, err, message, collResult)

  const guild = message.guild ? client.guilds.cache.get(message.guild.id) : client.mainGuild
  await guild.log(
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
