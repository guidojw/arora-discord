'use strict'
const { stripIndents } = require('common-tags')

const commandRunHandler = async (client, command, promise, message, _args, _fromPattern, collResult) => {
  let result
  try {
    result = await promise
  } catch (err) {
    // Command execution errors are handled by the commandError event.
    return
  }

  await client.handleCommandDeleteMessages(command, result, message, collResult)

  const guild = message.guild ? client.guilds.cache.get(message.guild.id) : client.mainGuild
  await guild.log(
    message.author,
    stripIndents`
    ${message.author} **used** \`${command.name}\` **command in** ${message.channel} [Jump to Message](${message.url})
    ${message.content}
    `
  )
}

module.exports = commandRunHandler
