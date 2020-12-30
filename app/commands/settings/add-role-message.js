'use strict'
const BaseCommand = require('../base')

const { DiscordAPIError, GuildEmoji } = require('discord.js')
const { RoleMessage } = require('../../models')

class AddRoleMessageCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'addrolemessage',
      aliases: ['addrolemsg'],
      description: 'Adds a new role message.',
      details: 'Can only be used in the channel of the message you want to make a role message. Because of this, the ' +
        'message that fires this command, the response, the argument prompts and the answers will all be deleted when' +
        ' the command has finished.',
      clientPermissions: ['SEND_MESSAGES', 'ADD_REACTIONS'],
      deleteMessages: true,
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

    return message.reply('Successfully added role message.')
  }
}

module.exports = AddRoleMessageCommand
