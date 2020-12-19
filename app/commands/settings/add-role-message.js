'use strict'
const Command = require('../../controllers/command')

const { DiscordAPIError, GuildEmoji } = require('discord.js')
const { RoleMessage } = require('../../models')

const RESPONSE_DELETE_TIME = 10000

class AddRoleMessageCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'addrolemessage',
      aliases: ['addrolemsg'],
      description: 'Adds a new role message.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'message',
        prompt: 'What message would you like to make a role message?',
        type: 'message'
      }, {
        key: 'emoji',
        prompt: 'What emoji do you want to bind to this message?',
        type: 'custom-emoji|string'
      }, {
        key: 'role',
        prompt: 'What role do you want to bind to this emoji?',
        type: 'role'
      }]
    })
  }

  async execute (message, { message: newMessage, emoji, role }, guild) {
    const roleMessage = await RoleMessage.findOne({
      where: {
        emojiId: emoji instanceof GuildEmoji ? emoji.id : emoji,
        messageId: newMessage.id,
        roleId: role.id,
        guildId: guild.id
      }
    })
    if (roleMessage) {
      return message.reply('A role message with that message, emoji and role already exists.')
    }

    try {
      await newMessage.react(emoji)
    } catch (err) {
      if (err instanceof DiscordAPIError && err.code === 10014) {
        return message.reply('Unknown emoji.')
      } else {
        throw err
      }
    }

    await RoleMessage.create({
      emojiId: emoji instanceof GuildEmoji ? emoji.id : emoji,
      messageId: newMessage.id,
      roleId: role.id,
      guildId: guild.id
    })

    const response = await message.reply('Successfully made role message.')
    setTimeout(response.delete.bind(response), RESPONSE_DELETE_TIME)
    return response
  }
}

module.exports = AddRoleMessageCommand
