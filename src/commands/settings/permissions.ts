import type { Collection, Message, Role } from 'discord.js'
import type { Command, CommandGroup, CommandoClient, CommandoMessage } from 'discord.js-commando'
import { GuildMember, MessageEmbed } from 'discord.js'
import BaseCommand from '../base'
import type { RoleGroup } from '../../structures'

export default class PermissionsCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'permissions',
      description: 'Lists a member\'s, role\'s or group\'s command permissions.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'memberOrRoleOrGroup',
        label: 'member/role/group',
        prompt: 'Of what member, role or group would you like to know the command permissions?',
        type: 'member|role-group|role'
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { memberOrRoleOrGroup }: { memberOrRoleOrGroup: GuildMember | Role | RoleGroup }
  ): Promise<Message | Message[] | null> {
    const embed = new MessageEmbed()
      .setColor(message.guild.primaryColor ?? 0xffffff)
    if (memberOrRoleOrGroup instanceof GuildMember) {
      embed
        .setTitle(`${memberOrRoleOrGroup.user.tag}'s Permissions`)
        .setThumbnail(memberOrRoleOrGroup.user.displayAvatarURL())
    } else {
      embed
        .setTitle(`${memberOrRoleOrGroup.name}'s Permissions`)
        .addField('Note', 'If a command group has a permission with allow: true (e.g. "**Settings: true' +
          '**"), all commands in it without a permission (e.g. "createtag: `null`") will implicitly also have a ' +
          'permission with allow: true.')
    }

    const fn = memberOrRoleOrGroup instanceof GuildMember
      ? memberOrRoleOrGroup.canRunCommand.bind(memberOrRoleOrGroup)
      : (command: Command | CommandGroup) => memberOrRoleOrGroup.permissionFor(command, true)
    const groups = this.client.registry.groups
      .filter(group => !group.guarded && group.id !== 'util' && group.isEnabledIn(message.guild))
      .sort((groupA, groupB) => groupB.commands.size - groupA.commands.size)
    for (const group of groups.values()) {
      const commands = group.commands.filter(command => !command.guarded && command.isEnabledIn(message.guild))
      const commandsPermissions = getCommandsPermissions(commands, fn)
      if (commandsPermissions !== '') {
        embed.addField(`${group.name}: ${String(fn(group))}`, commandsPermissions, true)
      }
    }

    return await message.replyEmbed(embed)
  }
}

function getCommandsPermissions (
  commands: Collection<string, Command>,
  fn: (command: Command) => boolean | null
): string {
  let field = ''
  for (const command of commands.values()) {
    field += `${command.name}: \`${String(fn(command))}\`\n`
  }
  return field
}
