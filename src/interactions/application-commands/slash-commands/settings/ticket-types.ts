import { type CommandInteraction, EmbedBuilder, type Message } from 'discord.js'
import type { GuildContext, TicketType, TicketTypeUpdateOptions } from '../../../../structures'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import { GuildContextManager } from '../../../../managers'
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
    edit: {
      args: [
        { key: 'id', name: 'ticketType', type: 'ticket-type' },
        {
          key: 'key',
          parse: (val: string) => val.toLowerCase()
        },
        { key: 'value' }
      ]
    },
    link: {
      args: [
        { key: 'id', name: 'ticketType', type: 'ticket-type' },
        { key: 'message', type: 'message' },
        { key: 'emoji', type: 'custom-emoji|default-emoji', required: false }
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

    await interaction.reply(`Successfully created ticket type \`${type.name}\`.`)
  }

  public async delete (
    interaction: CommandInteraction<'raw' | 'cached'>,
    { ticketType }: { ticketType: TicketType }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    await context.ticketTypes.delete(ticketType)

    await interaction.reply('Successfully deleted ticket type.')
  }

  public async edit (
    interaction: CommandInteraction<'raw' | 'cached'>,
    { ticketType, key, value }: {
      ticketType: TicketType
      key: string
      value: string
    }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    const changes: TicketTypeUpdateOptions = {}
    if (key === 'name') {
      changes.name = value
    }

    ticketType = await context.ticketTypes.update(ticketType, changes)

    await interaction.reply(`Successfully edited ticket type \`${ticketType.name}\`.`)
  }

  public async link (
    interaction: CommandInteraction<'raw' | 'cached'>,
    { ticketType, message, emoji }: {
      ticketType: TicketType
      message: Message
      emoji: string | null
    }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    ticketType = await context.ticketTypes.link(ticketType, message, emoji)

    await interaction.reply(`Successfully linked ticket type \`${ticketType.name}\` to message \`${ticketType.messageId ?? 'unknown'}\`.`)
  }

  public async unlink (
    interaction: CommandInteraction<'raw' | 'cached'>,
    { ticketType }: { ticketType: TicketType }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    ticketType = await context.ticketTypes.unlink(ticketType)

    await interaction.reply(`Successfully unlinked message from ticket type \`${ticketType.name}\`.`)
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
      const embed = new EmbedBuilder()
        .addFields([{ name: `Ticket Type ${ticketType.id}`, value: `Name: \`${ticketType.name}\`` }])
        .setColor(context.primaryColor ?? applicationConfig.defaultColor)
      await interaction.reply({ embeds: [embed] })
    } else {
      if (context.ticketTypes.cache.size === 0) {
        await interaction.reply('No ticket types found.')
        return
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
