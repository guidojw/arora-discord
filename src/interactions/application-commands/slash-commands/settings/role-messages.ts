import { type ChatInputCommandInteraction, EmbedBuilder, type Message, type Role } from 'discord.js'
import type { GuildContext, RoleMessage } from '../../../../structures'
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
@ApplyOptions<SubCommandCommandOptions<RoleMessagesCommand>>({
  subCommands: {
    create: {
      args: [
        { key: 'role' },
        { key: 'message', type: 'message' },
        { key: 'emoji', type: 'custom-emoji|default-emoji' }
      ]
    },
    delete: {
      args: [{ key: 'id', name: 'roleMessage', type: 'role-message' }]
    },
    list: {
      args: [
        {
          key: 'id',
          name: 'roleMessage',
          type: 'role-message',
          required: false
        }
      ]
    }
  }
})
export default class RoleMessagesCommand extends SubCommandCommand<RoleMessagesCommand> {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async create (
    interaction: ChatInputCommandInteraction<'raw' | 'cached'>,
    { role, message, emoji }: {
      role: Role
      message: Message
      emoji: string
    }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    const roleMessage = await context.roleMessages.create({ role, message, emoji })

    await interaction.reply({
      content: `Successfully bound role ${roleMessage.role?.toString() ?? 'Unknown'} to emoji ${roleMessage.emoji?.toString() ?? 'Unknown'} on message \`${roleMessage.messageId ?? 'unknown'}\`.`,
      allowedMentions: { users: [message.author.id] }
    })
  }

  public async delete (
    interaction: ChatInputCommandInteraction<'raw' | 'cached'>,
    { roleMessage }: { roleMessage: RoleMessage }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    await context.roleMessages.delete(roleMessage)

    await interaction.reply('Successfully deleted role message.')
  }

  public async list (
    interaction: ChatInputCommandInteraction,
    { roleMessage }: { roleMessage: RoleMessage | null }
  ): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    if (roleMessage !== null) {
      const embed = new EmbedBuilder()
        .addFields([
          {
            name: `Role Message ${roleMessage.id}`,
            value: `Message ID: \`${roleMessage.messageId ?? 'unknown'}\`, ${roleMessage.emoji?.toString() ?? 'Unknown'} => ${roleMessage.role?.toString() ?? 'Unknown'}`
          }
        ])
        .setColor(context.primaryColor ?? applicationConfig.defaultColor)
      await interaction.reply({ embeds: [embed] })
    } else {
      if (context.roleMessages.cache.size === 0) {
        await interaction.reply('No role messages found.')
        return
      }

      const embeds = discordService.getListEmbeds(
        'Role Messages',
        Object.values(lodash.groupBy(Array.from(context.roleMessages.cache.values()), 'messageId')),
        getGroupedRoleMessageRow
      )
      await interaction.reply({ embeds })
    }
  }
}

function getGroupedRoleMessageRow (roleMessages: RoleMessage[]): string {
  let result = `**${roleMessages[0].messageId ?? 'unknown'}**\n`
  for (const roleMessage of roleMessages) {
    result += `${roleMessage.id}. ${roleMessage.emoji?.toString() ?? 'Unknown'} => ${roleMessage.role?.toString() ?? 'Unknown'}\n`
  }
  return result
}
