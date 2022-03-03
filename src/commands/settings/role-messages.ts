import { type CommandInteraction, type Message, MessageEmbed, type Role } from 'discord.js'
import type { GuildContext, RoleMessage } from '../../structures'
import { SubCommandCommand, type SubCommandCommandOptions } from '../base'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../utils/decorators'
import type { GuildContextManager } from '../../managers'
import applicationConfig from '../../configs/application'
import { constants } from '../../utils'
import { discordService } from '../../services'
import lodash from 'lodash'

const { TYPES } = constants

@injectable()
@ApplyOptions<SubCommandCommandOptions<RoleMessagesCommand>>({
  subCommands: {
    create: {
      args: [
        { key: 'role' },
        { key: 'message', type: 'message' },
        { key: 'emoji', type: 'default-emoji' }
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
    interaction: CommandInteraction<'present'>,
    { role, message, emoji }: {
      role: Role
      message: Message
      emoji: string
    }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    const roleMessage = await context.roleMessages.create({ role, message, emoji })

    return await interaction.reply({
      content: `Successfully bound role ${roleMessage.role?.toString() ?? 'Unknown'} to emoji ${roleMessage.emoji?.toString() ?? 'Unknown'} on message \`${roleMessage.messageId ?? 'unknown'}\`.`,
      allowedMentions: { users: [message.author.id] }
    })
  }

  public async delete (
    interaction: CommandInteraction<'present'>,
    { roleMessage }: { roleMessage: RoleMessage }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    await context.roleMessages.delete(roleMessage)

    return await interaction.reply('Successfully deleted role message.')
  }

  public async list (
    interaction: CommandInteraction,
    { roleMessage }: { roleMessage: RoleMessage | null }
  ): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    if (roleMessage !== null) {
      const embed = new MessageEmbed()
        .addField(`Role Message ${roleMessage.id}`, `Message ID: \`${roleMessage.messageId ?? 'unknown'}\`, ${roleMessage.emoji?.toString() ?? 'Unknown'} => ${roleMessage.role?.toString() ?? 'Unknown'}`)
        .setColor(context.primaryColor ?? applicationConfig.defaultColor)
      return await interaction.reply({ embeds: [embed] })
    } else {
      if (context.roleMessages.cache.size === 0) {
        return await interaction.reply('No role messages found.')
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
