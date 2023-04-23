import { type CommandInteraction, type Message, MessageEmbed } from 'discord.js'
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

  public async execute (interaction: CommandInteraction): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    const editedMessages = new Set<Message>()
    for (const ticketType of context.ticketTypes.cache.values()) {
      if (ticketType.message !== null) {
        if (ticketType.message.partial) {
          await ticketType.message.fetch()
        }
        for (const row of ticketType.message.components) {
          const button = row.components.find(button => button.customId === `ticket_type:${ticketType.id}`)
          if (typeof button !== 'undefined') {
            button.setDisabled(context.supportEnabled)
            editedMessages.add(ticketType.message)
            break
          }
        }
      }
    }
    await Promise.all([...editedMessages].map(async message => (
      await message.edit({ components: message.components }))
    ))

    await context.update({ supportEnabled: !context.supportEnabled })

    const embed = new MessageEmbed()
      .setColor(context.supportEnabled ? 0x00ff00 : 0xff0000)
      .setTitle('Successfully toggled support')
      .setDescription(`Tickets System: **${context.supportEnabled ? 'online' : 'offline'}**`)
    await interaction.reply({ embeds: [embed] })
  }
}
