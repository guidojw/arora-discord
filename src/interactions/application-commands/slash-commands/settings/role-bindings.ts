import { type CommandInteraction, EmbedBuilder, type Role } from 'discord.js'
import type { GuildContext, RoleBinding } from '../../../../structures'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import { GuildContextManager } from '../../../../managers'
import { SubCommandCommand } from '../base'
import type { SubCommandCommandOptions } from '..'
import applicationConfig from '../../../../configs/application'
import { constants } from '../../../../utils'
import { discordService } from '../../../../services'
import lodash from 'lodash'

const { TYPES } = constants

@injectable()
@ApplyOptions<SubCommandCommandOptions<RoleBindingsCommand>>({
  requiresRobloxGroup: true,
  subCommands: {
    create: {
      args: [
        { key: 'role' },
        { key: 'min' },
        { key: 'max', required: false }
      ]
    },
    delete: {
      args: [{ key: 'id', name: 'roleBinding', type: 'role-binding' }]
    },
    list: {
      args: [
        {
          key: 'id',
          name: 'roleBinding',
          type: 'role-binding',
          required: false
        }
      ]
    }
  }
})
export default class RoleBindingsCommand extends SubCommandCommand<RoleBindingsCommand> {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async create (
    interaction: CommandInteraction<'raw' | 'cached'>,
    { role, min, max }: {
      role: Role
      min: number
      max: number | null
    }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    const roleBinding = await context.roleBindings.create({ role, min, max: max ?? undefined })

    await interaction.reply({
      content: `Successfully bound group \`${roleBinding.robloxGroupId}\` rank \`${getRangeString(roleBinding.min, roleBinding.max)}\` to role ${roleBinding.role?.toString() ?? 'Unknown'}.`,
      allowedMentions: { users: [interaction.user.id] }
    })
  }

  public async delete (
    interaction: CommandInteraction<'raw' | 'cached'>,
    { roleBinding }: { roleBinding: RoleBinding }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    await context.roleBindings.delete(roleBinding)

    await interaction.reply('Successfully deleted role binding.')
  }

  public async list (
    interaction: CommandInteraction<'raw' | 'cached'>,
    { roleBinding }: { roleBinding: RoleBinding | null }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    if (roleBinding !== null) {
      const embed = new EmbedBuilder()
        .addFields([
          {
            name: `Role Binding ${roleBinding.id}`,
            value: `\`${roleBinding.robloxGroupId}\` \`${getRangeString(roleBinding.min, roleBinding.max)}\` => ${roleBinding.role?.toString() ?? 'Unknown'}`
          }
        ])
        .setColor(context.primaryColor ?? applicationConfig.defaultColor)
      await interaction.reply({ embeds: [embed] })
    } else {
      await context.roleBindings.fetch()
      if (context.roleBindings.cache.size === 0) {
        await interaction.reply('No role bindings found.')
        return
      }

      const embeds = discordService.getListEmbeds(
        'Role Bindings',
        Object.values(lodash.groupBy(Array.from(context.roleBindings.cache.values()), 'roleId')),
        getGroupedRoleBindingRow
      )
      await interaction.reply({ embeds })
    }
  }
}

function getGroupedRoleBindingRow (roleBindings: RoleBinding[]): string {
  let result = `${roleBindings[0].role?.toString() ?? 'Unknown'}\n`
  for (const roleBinding of roleBindings) {
    result += `${roleBinding.id}. \`${roleBinding.robloxGroupId}\` \`${getRangeString(roleBinding.min, roleBinding.max)}\`\n`
  }
  return result
}

function getRangeString (min: number, max: number | null): string {
  return `${max !== null ? '[' : ''}${min}${max !== null ? `, ${max}]` : ''}`
}
