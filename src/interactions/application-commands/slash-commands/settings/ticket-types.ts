import { type CommandInteraction, type Message, MessageEmbed } from 'discord.js'
import type { GuildContext, TicketType } from '../../../../structures'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import type { GuildContextManager } from '../../../../managers'
import { SubCommandCommand } from '../base'
import type { SubCommandCommandOptions } from '..'
import applicationConfig from '../../../../configs/application'
import { constants } from '../../../../utils'
import { discordService } from '../../../../services'

const { TYPES } = constants

@injectable()
@ApplyOptions<SubCommandCommandOptions<TicketTypesCommand>>({
  subCommands: {
    create: {
      args: [{ key: 'name' }]
    },
    delete: {
      args: [{ key: 'id', name: 'ticketType', type: 'ticket-type' }]
    },
    link: {
      args: [
        { key: 'id', name: 'ticketType', type: 'ticket-type' },
        { key: 'emoji', type: 'custom-emoji|default-emoji' },
        { key: 'message', type: 'message' }
      ]
    },
    unlink: {
      args: [{ key: 'id', name: 'ticketType', type: 'ticket-type' }]
    },
    list: {
      args: [
        {
          key: 'id',
          name: 'ticketType',
          type: 'ticket-type',
          required: false
        }
      ]
    }
  }
})
export default class TicketTypesCommand extends SubCommandCommand<TicketTypesCommand> {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async create (
    interaction: CommandInteraction,
    { name }: { name: string }
  ): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    const type = await context.ticketTypes.create(name)

    return await interaction.reply(`Successfully created ticket type \`${type.name}\`.`)
  }

  public async delete (
    interaction: CommandInteraction<'raw' | 'cached'>,
    { ticketType }: { ticketType: TicketType }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    await context.ticketTypes.delete(ticketType)

    return await interaction.reply('Successfully deleted ticket type.')
  }

  public async link (
    interaction: CommandInteraction<'raw' | 'cached'>,
    { ticketType, emoji, message }: {
      ticketType: TicketType
      emoji: string
      message: Message
    }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    ticketType = await context.ticketTypes.link(ticketType, message, emoji)

    return await interaction.reply(`Successfully linked ticket type \`${ticketType.name}\` to message \`${ticketType.messageId ?? 'unknown'}\`.`)
  }

  public async unlink (
    interaction: CommandInteraction<'raw' | 'cached'>,
    { ticketType }: { ticketType: TicketType }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    ticketType = await context.ticketTypes.unlink(ticketType)

    return await interaction.reply(`Successfully unlinked message from ticket type \`${ticketType.name}\`.`)
  }

  public async list (
    interaction: CommandInteraction,
    { ticketType }: { ticketType: TicketType | null }
  ): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    if (ticketType !== null) {
      const embed = new MessageEmbed()
        .addField(`Ticket Type ${ticketType.id}`, `Name: \`${ticketType.name}\``)
        .setColor(context.primaryColor ?? applicationConfig.defaultColor)
      return await interaction.reply({ embeds: [embed] })
    } else {
      if (context.ticketTypes.cache.size === 0) {
        return await interaction.reply('No ticket types found.')
      }

      const embeds = discordService.getListEmbeds(
        'Ticket Types',
        context.ticketTypes.cache.values(),
        getTicketTypeRow
      )
      await interaction.reply({ embeds })
    }
  }
}

function getTicketTypeRow (type: TicketType): string {
  return `${type.id}. \`${type.name}\``
}
