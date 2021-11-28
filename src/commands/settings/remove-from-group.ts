import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import { type Message, Role, TextChannel } from 'discord.js'
import BaseCommand from '../base'
import type { Group } from '../../structures'

export default class RemoveFromGroupCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'removefromgroup',
      description: 'Removes a channel or role from a group.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'group',
        prompt: 'From what group do you want to remove a channel or role?',
        type: 'arora-group'
      }, {
        key: 'channelOrRole',
        prompt: 'What channel or role do you want to remove from this group?',
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
      await group.channels.remove(channelOrRole)
    } else if (group.isRoleGroup() && channelOrRole instanceof Role) {
      await group.roles.remove(channelOrRole)
    } else {
      return await message.reply(`Cannot remove a ${channelOrRole instanceof TextChannel ? 'channel' : 'role'} from a ${group.type} group.`)
    }

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return await message.reply(`Successfully removed ${group.type} ${channelOrRole.toString()} from group \`${group.name}\`.`, {
      allowedMentions: { users: [message.author.id] }
    })
  }
}
