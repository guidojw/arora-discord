import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { GuildEmoji, Message, Role } from 'discord.js'
import BaseCommand from '../base'

export default class CreateRoleMessageCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'createrolemessage',
      aliases: ['createrolemsg'],
      description: 'Creates a new role message.',
      clientPermissions: ['SEND_MESSAGES', 'ADD_REACTIONS'],
      args: [{
        key: 'role',
        prompt: 'For what role do you want to make a role message?',
        type: 'role'
      }, {
        key: 'message',
        prompt: 'What message would you like to make a role message?',
        type: 'message'
      }, {
        key: 'emoji',
        prompt: 'What emoji do you want to bind to this message?',
        type: 'custom-emoji|default-emoji'
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { role, message: newMessage, emoji }: {
      role: Role
      message: Message
      emoji: GuildEmoji | string
    }
  ): Promise<Message | Message[] | null> {
    const roleMessage = await message.guild.roleMessages.create({ role, message: newMessage, emoji })

    return await message.reply(`Successfully bound role ${roleMessage.role?.toString() ?? 'Unknown'} to emoji ${roleMessage.emoji?.toString() ?? 'Unknown'} on message \`${roleMessage.messageId ?? 'unknown'}\`.`, {
      allowedMentions: { users: [message.author.id] }
    })
  }
}
