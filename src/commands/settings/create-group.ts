import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import { GroupType } from '../../util/constants'
import type { Message } from 'discord.js'
import { argumentUtil } from '../../util'

const { validators, noNumber, noWhitespace } = argumentUtil

export default class CreateGroupCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'creategroup',
      description: 'Creates a new group.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'name',
        prompt: 'What do you want the name of the group to be?',
        type: 'string',
        validate: validators([noNumber, noWhitespace])
      }, {
        key: 'type',
        prompt: 'What do you want the type of the group to be?',
        type: 'string',
        oneOf: Object.values(GroupType)
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { name, type }: {
      name: string
      type: GroupType
    }
  ): Promise<Message | Message[] | null> {
    const group = await message.guild.groups.create(name, type)

    return await message.reply(`Successfully created group \`${group.name}\`.`)
  }
}
