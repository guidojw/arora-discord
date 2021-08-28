import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { Message, Role } from 'discord.js'
import BaseCommand from '../base'
import { argumentUtil } from '../../util'

const { validateNoneOrType, parseNoneOrType } = argumentUtil

export default class CreateRoleBindingCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'createrolebinding',
      aliases: ['createrolebnd'],
      description: 'Creates a new Roblox rank to Discord role binding.',
      clientPermissions: ['SEND_MESSAGES'],
      requiresRobloxGroup: true,
      args: [{
        key: 'role',
        prompt: 'To what role would you like to bind this binding?',
        type: 'role'
      }, {
        key: 'min',
        prompt: 'What do you want the lower limit of this binding to be?',
        type: 'integer',
        min: 0,
        max: 255
      }, {
        key: 'max',
        prompt: 'What do you want the upper limit of this binding to be? Reply with "none" if you don\'t want one.',
        type: 'integer',
        min: 0,
        max: 255,
        validate: validateNoneOrType,
        parse: parseNoneOrType
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { role, min, max }: {
      role: Role
      min: number
      max?: number
    }
  ): Promise<Message | Message[] | null> {
    const roleBinding = await message.guild.roleBindings.create({ role, min, max })

    return await message.reply(`Successfully bound group \`${roleBinding.robloxGroupId}\` rank \`${getRangeString(roleBinding.min, roleBinding.max)}\` to role ${roleBinding.role?.toString() ?? 'Unknown'}.`, {
      allowedMentions: { users: [message.author.id] }
    })
  }
}

function getRangeString (min: number, max: number | null): string {
  return `${max !== null ? '[' : ''}${min}${max !== null ? `, ${max}]` : ''}`
}
