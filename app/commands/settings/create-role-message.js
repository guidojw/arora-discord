'use strict'
const BaseCommand = require('../base')

const { DiscordAPIError, GuildEmoji } = require('discord.js')
const { Message, Role, RoleMessage } = require('../../models')

class CreateRoleMessageCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'createrolemessage',
      aliases: ['createrolemsg'],
      description: 'Creates a new role message.',
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

  async run (message, { message: newMessage, emoji, role }) {
    await Message.findOrCreate({
      where: {
        id: newMessage.id,
        guildId: message.guild.id,
        channelId: message.channel.id
      }
    })
    await Role.findOrCreate({
      where: {
        id: role.id,
        guildId: message.guild.id
      }
    })
    const [, created] = await RoleMessage.findOrCreate({
      where: {
        emojiId: emoji instanceof GuildEmoji ? emoji.id : null,
        emoji: emoji instanceof GuildEmoji ? null : emoji,
        messageId: newMessage.id,
        roleId: role.id,
        guildId: message.guild.id
      }
    })
    if (!created) {
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

    return message.reply('Successfully created role message.')
  }
}

module.exports = CreateRoleMessageCommand
