import { Command, type CommandGroup, type CommandoClient, type CommandoMessage } from 'discord.js-commando'
import { type Message, Role } from 'discord.js'
import BaseCommand from '../base'
import type { RoleGroup } from '../../structures'
import { argumentUtil } from '../../utils'

const { validateNoneOrType, parseNoneOrType } = argumentUtil

export default class PermitCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'permit',
      description: 'Grants a role or group permission to use or explicitly not use a command or command group. Can ' +
        'also be used to delete a permission.',
      details: 'If a member is in at least one role or group that has a permission for a command or command group ' +
        'that explicitly allows them to **not** use it, they won\'t be able to run that command or commands in that ' +
        'group.',
      examples: [
        'permit @Admin Settings true', 'permit @Admin Settings false', 'permit @Admin Settings none',
        'permit @Admin createtag true', 'permit @Admin createtag false', 'permit @Admin createtag none',
        'permit adminGroup Settings true', 'permit adminGroup Settings false', 'permit adminGroup Settings none',
        'permit adminGroup createtag true', 'permit adminGroup createtag false', 'permit adminGroup createtag none'
      ],
      clientPermissions: ['SEND_MESSAGES'],
      userPermissions: ['ADMINISTRATOR'],
      guarded: true,
      args: [{
        key: 'roleOrGroup',
        label: 'role/group',
        prompt: 'For what role or group do you want to create, edit or delete a permission?',
        type: 'role-group|role'
      }, {
        key: 'commandOrGroup',
        label: 'command/group',
        prompt: 'For what command or command group do you want to create, edit or delete a permission?',
        type: 'command|group'
      }, {
        key: 'allow',
        prompt: 'What do you want the allow value of this permission to be? Reply with "none" if you want to delete' +
          ' the permission.',
        type: 'boolean',
        validate: validateNoneOrType,
        parse: parseNoneOrType
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { roleOrGroup, commandOrGroup, allow }: {
      roleOrGroup: Role | RoleGroup
      commandOrGroup: Command | CommandGroup
      allow: boolean
    }
  ): Promise<Message | Message[] | null> {
    const commandType = commandOrGroup instanceof Command ? 'command' : 'group'
    const permissibleType = roleOrGroup instanceof Role ? 'role' : 'group'
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const subject = `${permissibleType} ${roleOrGroup instanceof Role ? roleOrGroup.toString() : `\`${roleOrGroup.toString()}\``}`

    if (typeof allow === 'undefined') {
      await roleOrGroup.aroraPermissions.delete(commandOrGroup)
      return await message.reply(`Successfully deleted \`${commandOrGroup.name}\` ${commandType} permission from ${subject}.`, {
        allowedMentions: { users: [message.author.id] }
      })
    } else {
      const permission = roleOrGroup.aroraPermissions.resolve(commandOrGroup)
      if (permission !== null) {
        await permission.update({ allow })
        return await message.reply(`Successfully edited \`${commandOrGroup.name}\` ${commandType} permission for ${subject} to allow: \`${String(allow)}\`.`, {
          allowedMentions: { users: [message.author.id] }
        })
      } else {
        await roleOrGroup.aroraPermissions.create(commandOrGroup, allow)
        return await message.reply(`Successfully created \`${commandOrGroup.name}\` ${commandType} permission for ${subject} with allow: \`${String(allow)}\`.`, {
          allowedMentions: { users: [message.author.id] }
        })
      }
    }
  }
}
