import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import { type Message, Role, TextChannel } from 'discord.js'
import BaseCommand from '../base'
import type { Group } from '../../structures'

export default class AddToGroupCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'addtogroup',
      description: 'Adds a channel or role to a group.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'group',
        prompt: 'To what group do you want to add a channel or role?',
        type: 'arora-group'
      }, {
        key: 'channelOrRole',
        label: 'channel/role',
        prompt: 'What channel or role do you want to add to this group?',
        type: 'text-channel|role'
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { group, channelOrRole }: {
      group: Group
      channelOrRole: TextChannel | Role
    }
  ): Promise<Message | Message[] | null> {
    if (group.isChannelGroup() && channelOrRole instanceof TextChannel) {
      await group.channels.add(channelOrRole)
    } else if (group.isRoleGroup() && channelOrRole instanceof Role) {
      await group.roles.add(channelOrRole)
    } else {
      return await message.reply(`Cannot add a ${channelOrRole instanceof TextChannel ? 'channel' : 'role'} to a ${group.type} group.`)
    }

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return await message.reply(`Successfully added ${group.type} ${channelOrRole.toString()} to group \`${group.name}\`.`, {
      allowedMentions: { users: [message.author.id] }
    })
  }
}
