import type { ChannelGroup, Group, GuildContext, RoleGroup } from '../../../../structures'
import { type CommandInteraction, EmbedBuilder, type Role, type TextChannel } from 'discord.js'
import { argumentUtil, constants } from '../../../../utils'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import type { GroupType } from '../../../../utils/constants'
import { GuildContextManager } from '../../../../managers'
import { SubCommandCommand } from '../base'
import type { SubCommandCommandOptions } from '..'
import applicationConfig from '../../../../configs/application'
import { discordService } from '../../../../services'

const { TYPES } = constants
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
          { key: 'id', name: 'group', type: 'channel-group' },
          { key: 'channel' }
        ]
      },
      remove: {
        args: [
          { key: 'id', name: 'group', type: 'channel-group' },
          { key: 'channel' }
        ]
      }
    },
    roles: {
      add: {
        args: [
          { key: 'id', name: 'group', type: 'role-group' },
          { key: 'role' }
        ]
      },
      remove: {
        args: [
          { key: 'id', name: 'group', type: 'role-group' },
          { key: 'role' }
        ]
      }
    },
    list: {
      args: [
        {
          key: 'id',
          name: 'group',
          type: 'group',
          required: false
        }
      ]
    }
  }
})
export default class GroupsCommand extends SubCommandCommand<GroupsCommand> {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async create (
    interaction: CommandInteraction,
    { name, type }: { name: string, type: GroupType }
  ): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    const group = await context.groups.create(name, type)

    await interaction.reply(`Successfully created group \`${group.name}\`.`)
  }

  public async delete (
    interaction: CommandInteraction<'raw' | 'cached'>,
    { group }: { group: Group }
  ): Promise<void> {
    await group.delete()

    await interaction.reply('Successfully deleted group.')
  }

  public async channels (
    interaction: CommandInteraction<'raw' | 'cached'>,
    subCommand: 'add' | 'remove',
    { group, channel }: { group: ChannelGroup, channel: TextChannel }
  ): Promise<void> {
    switch (subCommand) {
      case 'add': {
        await group.channels.add(channel)

        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        await interaction.reply(`Successfully added channel ${channel.toString()} to group \`${group.name}\`.`)
        return
      }
      case 'remove': {
        await group.channels.remove(channel)

        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        await interaction.reply(`Successfully removed channel ${channel.toString()} from group \`${group.name}\`.`)
      }
    }
  }

  public async roles (
    interaction: CommandInteraction<'raw' | 'cached'>,
    subCommand: 'add' | 'remove',
    { group, role }: { group: RoleGroup, role: Role }
  ): Promise<void> {
    switch (subCommand) {
      case 'add': {
        await group.roles.add(role)

        await interaction.reply({
          content: `Successfully added role ${role.toString()} to group \`${group.name}\`.`,
          allowedMentions: { users: [interaction.user.id] }
        })
        return
      }
      case 'remove': {
        await group.roles.remove(role)

        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        await interaction.reply({
          content: `Successfully removed role ${role.toString()} from group \`${group.name}\`.`,
          allowedMentions: { users: [interaction.user.id] }
        })
      }
    }
  }

  public async list (
    interaction: CommandInteraction,
    { group }: { group: Group | null }
  ): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    if (group !== null) {
      const embed = new EmbedBuilder()
        .setTitle(`Group ${group.id}`)
        .addFields([
          { name: 'Name', value: group.name, inline: true },
          { name: 'Type', value: group.type, inline: true },
          { name: 'Guarded', value: group.guarded ? 'yes' : 'no', inline: true }
        ])
        .setColor(context.primaryColor ?? applicationConfig.defaultColor)
      if (group.isChannelGroup()) {
        const channelsString = Array.from(group.channels.cache.values()).join(' ')
        embed.addFields([{ name: 'Channels', value: channelsString !== '' ? channelsString : 'none' }])
      } else if (group.isRoleGroup()) {
        const rolesString = Array.from(group.roles.cache.values()).join(' ')
        embed.addFields([{ name: 'Roles', value: rolesString !== '' ? rolesString : 'none' }])
      }
      await interaction.reply({ embeds: [embed] })
    } else {
      if (context.groups.cache.size === 0) {
        await interaction.reply('No groups found.')
        return
      }

      const embeds = discordService.getListEmbeds(
        'Groups',
        context.groups.cache.values(),
        getGroupRow
      )
      await interaction.reply({ embeds })
    }
  }
}

function getGroupRow (group: Group): string {
  return `${group.id}. \`${group.name}\``
}
