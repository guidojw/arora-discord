import {
  ActionRowBuilder,
  type ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  type Message,
  type MessageActionRowComponentBuilder
} from 'discord.js'
import { inject, injectable, named } from 'inversify'
import { Command } from '../base'
import type { GuildContext } from '../../../../structures'
import { GuildContextManager } from '../../../../managers'
import { constants } from '../../../../utils'

const { TYPES } = constants

@injectable()
export default class ToggleSupportCommand extends Command {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async execute (interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    const editedMessages =
      new Set<{ message: Message, components: Array<ActionRowBuilder<MessageActionRowComponentBuilder>> }>()
    for (const ticketType of context.ticketTypes.cache.values()) {
      if (ticketType.message !== null) {
        if (ticketType.message.partial) {
          await ticketType.message.fetch()
        }
        const components = ticketType.message.components
          .map<ActionRowBuilder<MessageActionRowComponentBuilder>>(row => ActionRowBuilder.from(row))
        for (const row of components) {
          const button = row.components.find(button => (
            button.data.type === ComponentType.Button && 'custom_id' in button.data &&
            button.data.custom_id === `ticket_type:${ticketType.id}`
          ))
          if (typeof button !== 'undefined') {
            button.setDisabled(context.supportEnabled)
            editedMessages.add({ message: ticketType.message, components })
            break
          }
        }
      }
    }
    await Promise.all([...editedMessages].map(async ({ message, components }) => (
      await message.edit({ components }))
    ))

    await context.update({ supportEnabled: !context.supportEnabled })

    const embed = new EmbedBuilder()
      .setColor(context.supportEnabled ? 0x00ff00 : 0xff0000)
      .setTitle('Successfully toggled support')
      .setDescription(`Tickets System: **${context.supportEnabled ? 'online' : 'offline'}**`)
    await interaction.reply({ embeds: [embed] })
  }
}
