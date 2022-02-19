import {
  type BaseCommandInteraction,
  type CommandInteraction,
  MessageEmbed,
  type Role,
  type TextChannel
} from 'discord.js'
import type { ChannelGroup, Group, GuildContext, RoleGroup } from '../../structures'
import { SubCommandCommand, type SubCommandCommandOptions } from '../base'
import { ApplyOptions } from '../../util/decorators'
import { GroupType } from '../../util/constants'
import applicationConfig from '../../configs/application'
import { argumentUtil } from '../../util'
import { discordService } from '../../services'
import { injectable } from 'inversify'

const { validators, noNumber, noWhitespace } = argumentUtil

@injectable()
@ApplyOptions<SubCommandCommandOptions<GroupsCommand>>({
  subCommands: {
    create: {
      args: [
        {
          key: 'name',
          validate: validators([noNumber, noWhitespace])
        },
        { key: 'type' }
      ]
    },
    delete: {
      args: [{ key: 'id', name: 'group', type: 'group' }]
    },
    channels: {
      add: {
        args: [
          { key: 'id', name: 'group', type: 'group' },
          { key: 'channel' }
        ]
      },
      remove: {
        args: [
          { key: 'id', name: 'group', type: 'group' },
          { key: 'channel' }
        ]
      }
    },
    roles: {
      add: {
        args: [
          { key: 'id', name: 'group', type: 'group' },
          { key: 'role' }
        ]
      },
      remove: {
        args: [
          { key: 'id', name: 'group', type: 'group' },
          { key: 'role' }
        ]
      }
    },
    list: {
      args: [{ key: 'group', type: 'group', required: false }]
    }
  }
})
export default class GroupsCommand extends SubCommandCommand<GroupsCommand> {
  public async create (
    interaction: CommandInteraction & BaseCommandInteraction<'cached'>,
    { name, type }: { name: string, type: GroupType }
  ): Promise<void> {
    const context = this.client.guildContexts.resolve(interaction.guildId) as GuildContext

    const group = await context.groups.create(name, type)

    return await interaction.reply(`Successfully created group \`${group.name}\`.`)
  }

  public async delete (
    interaction: CommandInteraction & BaseCommandInteraction<'cached'>,
    { group }: { group: Group }
  ): Promise<void> {
    await group.delete()

    return await interaction.reply('Successfully deleted group.')
  }

  public async channels (
    interaction: CommandInteraction & BaseCommandInteraction<'cached'>,
    subCommand: 'add' | 'remove',
    { group, channel }: { group: ChannelGroup, channel: TextChannel }
  ): Promise<void> {
    switch (subCommand) {
      case 'add': {
        await group.channels.add(channel)

        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        return await interaction.reply(`Successfully added channel ${channel.toString()} to group \`${group.name}\`.`)
      }
      case 'remove': {
        await group.channels.remove(channel)

        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        return await interaction.reply(`Successfully removed channel ${channel.toString()} from group \`${group.name}\`.`)
      }
    }
  }

  public async roles (
    interaction: CommandInteraction & BaseCommandInteraction<'cached'>,
    subCommand: 'add' | 'remove',
    { group, role }: { group: RoleGroup, role: Role }
  ): Promise<void> {
    switch (subCommand) {
      case 'add': {
        await group.roles.add(role)

        return await interaction.reply({
          content: `Successfully added role ${role.toString()} to group \`${group.name}\`.`,
          allowedMentions: { users: [interaction.user.id] }
        })
      }
      case 'remove': {
        await group.roles.remove(role)

        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        return await interaction.reply({
          content: `Successfully removed role ${role.toString()} from group \`${group.name}\`.`,
          allowedMentions: { users: [interaction.user.id] }
        })
      }
    }
  }

  public async list (
    interaction: CommandInteraction & BaseCommandInteraction<'cached'>,
    { group }: { group: Group | null }
  ): Promise<void> {
    const context = this.client.guildContexts.resolve(interaction.guildId) as GuildContext

    if (group !== null) {
      const embed = new MessageEmbed()
        .setTitle(`Group ${group.id}`)
        .addField('Name', group.name, true)
        .addField('Type', group.type, true)
        .addField('Guarded', group.guarded ? 'yes' : 'no', true)
        .setColor(context.primaryColor ?? applicationConfig.defaultColor)
      if (group.isChannelGroup()) {
        const channelsString = Array.from(group.channels.cache.values()).join(' ')
        embed.addField('Channels', channelsString !== '' ? channelsString : 'none')
      } else if (group.isRoleGroup()) {
        const rolesString = Array.from(group.roles.cache.values()).join(' ')
        embed.addField('Roles', rolesString !== '' ? rolesString : 'none')
      }
      return await interaction.reply({ embeds: [embed] })
    } else {
      if (context.groups.cache.size === 0) {
        return await interaction.reply('No groups found.')
      }

      const embeds = discordService.getListEmbeds(
        'Groups',
        context.groups.cache.values(),
        getGroupRow
      )
      for (const embed of embeds) {
        await interaction.reply({ embeds: [embed] })
      }
    }
  }
}

function getGroupRow (group: Group): string {
  return `${group.id}. \`${group.name}\``
}
